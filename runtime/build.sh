#!/usr/bin/env bash
# SPDX-License-Identifier: MIT
set -euo pipefail
cd "$(dirname "$0")/.."
: "${JAVA_HOME:?Set JAVA_HOME to JDK 17 or later}"
: "${ANDROID_HOME:?Set ANDROID_HOME to the Android SDK with platform/build-tools 36}"
export JAVA_HOME ANDROID_HOME
export GRADLE_USER_HOME="$(pwd)/.setup/core/gradle-home"
mkdir -p .setup/core/downloads android/app/src/main/assets android/app/src/main/jniLibs/x86_64
fetch() {
  local name=$1 url=$2 hash=$3
  local file=".setup/core/downloads/$name"
  if ! printf '%s  %s\n' "$hash" "$file" | sha256sum -c - >/dev/null 2>&1; then
    curl -fL --retry 2 --retry-all-errors --connect-timeout 20 --max-time 300 "$url" -o "$file.part"
    printf '%s  %s\n' "$hash" "$file.part" | sha256sum -c -
    mv "$file.part" "$file"
  fi
}
fetch gradle.zip https://downloads.gradle.org/distributions/gradle-9.1.0-bin.zip a17ddd85a26b6a7f5ddb71ff8b05fc5104c0202c6e64782429790c933686c806
fetch ubuntu.tar.gz https://cdimage.ubuntu.com/ubuntu-base/releases/24.04/release/ubuntu-base-24.04.3-base-amd64.tar.gz 6bc2cde3930ad088b3bb46fa45279e96d25bc3810f209850ecbe4722711874f9
fetch node.tar.xz https://nodejs.org/dist/v24.20.0/node-v24.20.0-linux-x64.tar.xz 2f2c0da162318f0de47665410c7c8c2ed3d36c8f3105de4bbc61176c70a7cbf2
fetch proot.deb https://packages.termux.dev/apt/termux-main/pool/main/p/proot/proot_5.1.107.102_x86_64.deb 2497064226c15971be8131c7facead94a06c225347796326a383c832dca57758
fetch libtalloc.deb https://packages.termux.dev/apt/termux-main/pool/main/libt/libtalloc/libtalloc_2.5.0_x86_64.deb b8c6d95f20075dc1f9ec6573575b2444e8d526e48e0d8d6d5cf4e071e6e06530
fetch libandroid-shmem.deb https://packages.termux.dev/apt/termux-main/pool/main/liba/libandroid-shmem/libandroid-shmem_0.7_x86_64.deb ffa9e4c87467b158b148d0ff92dda796aa038276c2075af3269cdcdb06f25797
for item in proot libtalloc libandroid-shmem; do
  hash=$(sha256sum ".setup/core/downloads/$item.deb" | cut -d' ' -f1)
  node runtime/extract-deb.mjs ".setup/core/downloads/$item.deb" "$hash" ".setup/core/debs/$item"
done
mkdir -p .setup/core/native
src=.setup/core/native/data/data/com.termux/files/usr
for item in proot libtalloc libandroid-shmem; do
  case $item in
    proot) members=(./data/data/com.termux/files/usr/bin/proot ./data/data/com.termux/files/usr/libexec/proot/loader ./data/data/com.termux/files/usr/libexec/proot/loader32);;
    libtalloc) members=(./data/data/com.termux/files/usr/lib/libtalloc.so.2.5.0);;
    libandroid-shmem) members=(./data/data/com.termux/files/usr/lib/libandroid-shmem.so);;
  esac
  tar -xJf ".setup/core/debs/$item/data.tar.xz" -C .setup/core/native "${members[@]}"
done
out=android/app/src/main/jniLibs/x86_64
cp "$src/bin/proot" "$out/libproot.so"
cp "$src/libexec/proot/loader" "$out/libloader.so"
cp "$src/libexec/proot/loader32" "$out/libloader32.so"
cp "$src/lib/libtalloc.so.2.5.0" "$out/libtalloc.so"
cp "$src/lib/libandroid-shmem.so" "$out/libandroid-shmem.so"
cp .setup/core/downloads/ubuntu.tar.gz android/app/src/main/assets/ubuntu.bin
xz -dc .setup/core/downloads/node.tar.xz | gzip -n > android/app/src/main/assets/node.bin
npm ci --prefix backend
npm run build --prefix backend
tar -czf android/app/src/main/assets/backend.bin -C backend dist
cp runtime/linux.sh runtime/prepare.sh android/app/src/main/assets/
sha256sum android/app/src/main/assets/*.bin | awk '{n=split($2,a,"/"); print $1" "a[n]}' > android/app/src/main/assets/hashes.txt
if [[ ! -f .setup/core/gradle-9.1.0/bin/gradle ]]; then unzip -q .setup/core/downloads/gradle.zip -d .setup/core; fi
.setup/core/gradle-9.1.0/bin/gradle --no-daemon -p android :app:assembleDebug --max-workers=2 "$@"
apk=android/app/build/outputs/apk/debug/app-debug.apk
while read -r expected name; do
  actual=$(unzip -p "$apk" "assets/$name" | sha256sum | cut -d' ' -f1)
  [[ $actual == "$expected" ]] || { echo "Packaged asset verification failed: $name" >&2; exit 1; }
done < android/app/src/main/assets/hashes.txt
sha256sum "$apk"
