#!/usr/bin/env bash
# SPDX-License-Identifier: MIT
set -euo pipefail
trap 'code=$?; printf "Build failed at line %s (exit %s)\n" "$LINENO" "$code" >&2' ERR
cd "$(dirname "$0")/.."
: "${JAVA_HOME:?Set JAVA_HOME to JDK 17 or later}"
: "${ANDROID_HOME:?Set ANDROID_HOME to the Android SDK with platform/build-tools 36}"
abi=${OLEA_ABI:-x86_64}
build_type=${OLEA_BUILD_TYPE:-debug}
case "$build_type" in
  debug) build_task=assembleDebug;;
  release)
    build_task=assembleRelease
    : "${OLEA_SIGNING_STORE_FILE:?Set the local release keystore path}"
    : "${OLEA_SIGNING_STORE_PASSWORD:?Supply the local release store password through the environment}"
    : "${OLEA_SIGNING_KEY_ALIAS:?Set the release key alias}"
    : "${OLEA_SIGNING_KEY_PASSWORD:?Supply the local release key password through the environment}"
    ;;
  *) echo "Unsupported OLEA_BUILD_TYPE: $build_type (use debug or release)" >&2; exit 1;;
esac
case "$abi" in
  x86_64) compat=x86;;
  arm64-v8a) compat=arm;;
  *) echo "Unsupported OLEA_ABI: $abi (use x86_64 or arm64-v8a)" >&2; exit 1;;
esac
export JAVA_HOME ANDROID_HOME
export GRADLE_USER_HOME="$(pwd)/.setup/core/gradle-home"
export npm_config_cache="$(pwd)/.setup/core/npm-cache"
work=".setup/core/$abi"
assets=android/app/src/main/assets
out="android/app/src/main/jniLibs/$abi"
mkdir -p .setup/core/downloads "$work/downloads" "$assets" "$out"
fetch() {
  local name=$1 url=$2 hash=$3
  local file="$work/downloads/$name"
  # Keep the existing x86 download cache usable.
  if [[ ( $abi == x86_64 || $name == gradle.zip ) && ! -f $file && -f .setup/core/downloads/$name ]]; then
    cp ".setup/core/downloads/$name" "$file"
  fi
  if ! printf '%s  %s\n' "$hash" "$file" | sha256sum -c - >/dev/null 2>&1; then
    curl -fL --retry 2 --retry-all-errors --connect-timeout 20 --max-time 300 "$url" -o "$file.part"
    printf '%s  %s\n' "$hash" "$file.part" | sha256sum -c -
    mv "$file.part" "$file"
  fi
}
# Use the manifest as the single pinned source for both architectures.
while IFS=$'\t' read -r name url hash; do fetch "$name" "$url" "$hash"; done < <(
  node --input-type=module - "$abi" <<'NODE'
import fs from 'node:fs';
const names = { Gradle: 'gradle.zip', 'Ubuntu Base': 'ubuntu.tar.gz', Node: 'node.tar.xz', 'Termux PRoot': 'proot.deb', libtalloc: 'libtalloc.deb', 'libandroid-shmem': 'libandroid-shmem.deb' };
const manifest = JSON.parse(fs.readFileSync('runtime/upstream-inputs.json'));
for (const c of manifest.components.filter(c => !c.abi || c.abi === process.argv[2])) console.log([names[c.name], c.url, c.sha256].join('\t'));
NODE
)
for item in proot libtalloc libandroid-shmem; do
  hash=$(sha256sum "$work/downloads/$item.deb" | cut -d' ' -f1)
  node runtime/extract-deb.mjs "$work/downloads/$item.deb" "$hash" "$work/debs/$item"
done
mkdir -p "$work/native" "$work/checks"
src="$work/native/data/data/com.termux/files/usr"
for item in proot libtalloc libandroid-shmem; do
  case $item in
    proot) members=(./data/data/com.termux/files/usr/bin/proot ./data/data/com.termux/files/usr/libexec/proot/loader ./data/data/com.termux/files/usr/libexec/proot/loader32);;
    libtalloc) members=(./data/data/com.termux/files/usr/lib/libtalloc.so.2.5.0);;
    libandroid-shmem) members=(./data/data/com.termux/files/usr/lib/libandroid-shmem.so);;
  esac
  tar -xJf "$work/debs/$item/data.tar.xz" -C "$work/native" "${members[@]}"
done
cp "$src/bin/proot" "$out/libproot.so"
cp "$src/libexec/proot/loader" "$out/libloader.so"
cp "$src/libexec/proot/loader32" "$out/libloader32.so"
cp "$src/lib/libtalloc.so.2.5.0" "$out/libtalloc.so"
cp "$src/lib/libandroid-shmem.so" "$out/libandroid-shmem.so"
node runtime/verify-elf.mjs "$abi" "$out/libproot.so" "$out/libloader.so" "$out/libtalloc.so" "$out/libandroid-shmem.so"
node runtime/verify-elf.mjs "$compat" "$out/libloader32.so"
tar -xzf "$work/downloads/ubuntu.tar.gz" -C "$work/checks" usr/bin/dash
tar -xJf "$work/downloads/node.tar.xz" -C "$work/checks" --strip-components=1 --wildcards '*/bin/node'
node runtime/verify-elf.mjs "$abi" "$work/checks/usr/bin/dash" "$work/checks/bin/node"
cp "$work/downloads/ubuntu.tar.gz" "$assets/ubuntu.bin"
xz -dc "$work/downloads/node.tar.xz" | gzip -n > "$assets/node.bin"
npm ci --prefix backend
npm run build --prefix backend
tar -czf "$assets/backend.bin" -C backend dist extensions
# Normalize bootstrap scripts so Windows snapshot/export line endings cannot break Android sh.
for name in linux.sh prepare.sh agent-maintenance.sh; do
  node -e 'const fs=require("node:fs"); const text=fs.readFileSync(process.argv[1],"utf8").replace(/\r\n/g,"\n"); if(text.includes("\r")) throw Error("Unsupported shell-script line ending"); fs.writeFileSync(process.argv[2],text);' "runtime/$name" "$assets/$name"
done
printf '%s\n' "$abi" > "$assets/runtime-abi.txt"
sha256sum "$assets"/*.bin "$assets/runtime-abi.txt" | awk '{n=split($2,a,"/"); print $1" "a[n]}' > "$assets/hashes.txt"
if [[ ! -f .setup/core/gradle-9.1.0/bin/gradle ]]; then unzip -q "$work/downloads/gradle.zip" -d .setup/core; fi
.setup/core/gradle-9.1.0/bin/gradle --no-daemon -p android ":app:$build_task" --max-workers=2 "-PoleaAbi=$abi" "$@"
apk="android/app/build/outputs/apk/$build_type/app-$build_type.apk"
packaged_abis=$(unzip -Z1 "$apk" | awk -F/ '$1 == "lib" {print $2}' | sort -u)
[[ $packaged_abis == "$abi" ]] || { echo "Unexpected APK native ABIs: $packaged_abis" >&2; exit 1; }
while read -r expected name; do
  actual=$(unzip -p "$apk" "assets/$name" | sha256sum | cut -d' ' -f1)
  [[ $actual == "$expected" ]] || { echo "Packaged asset verification failed: $name" >&2; exit 1; }
done < "$assets/hashes.txt"
for name in libproot.so libloader.so libloader32.so libtalloc.so libandroid-shmem.so; do
  actual=$(unzip -p "$apk" "lib/$abi/$name" | sha256sum | cut -d' ' -f1)
  expected=$(sha256sum "$out/$name" | cut -d' ' -f1)
  [[ $actual == "$expected" ]] || { echo "Packaged native verification failed: $name" >&2; exit 1; }
done
# Preserve the selected artifact before another ABI build replaces the Gradle output.
cp "$apk" "$work/olea-$abi-$build_type.apk"
sha256sum "$work/olea-$abi-$build_type.apk"
