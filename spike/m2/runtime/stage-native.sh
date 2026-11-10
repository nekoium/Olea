#!/usr/bin/env bash
# Original MIT. Exact verified public inputs only. Generated JNI files are not source.
set -euo pipefail
stage=.setup/downloads
verify() { printf '%s  %s\n' "$2" "$1" | sha256sum -c -; }
verify "$stage/proot.deb" 2497064226c15971be8131c7facead94a06c225347796326a383c832dca57758
verify "$stage/libtalloc.deb" b8c6d95f20075dc1f9ec6573575b2444e8d526e48e0d8d6d5cf4e071e6e06530
verify "$stage/libandroid-shmem.deb" ffa9e4c87467b158b148d0ff92dda796aa038276c2075af3269cdcdb06f25797
mkdir -p .setup/m2-native
for item in proot libtalloc libandroid-shmem; do
  hash=$(sha256sum "$stage/$item.deb" | cut -d' ' -f1)
  node spike/runtime/extract-deb.mjs "$stage/$item.deb" "$hash" ".setup/m2-debs/$item"
  # Extract only exact regular payloads needed by APK; no Windows symlink emulation.
  case $item in
    proot) members=(./data/data/com.termux/files/usr/bin/proot ./data/data/com.termux/files/usr/libexec/proot/loader ./data/data/com.termux/files/usr/libexec/proot/loader32);;
    libtalloc) members=(./data/data/com.termux/files/usr/lib/libtalloc.so.2.5.0);;
    libandroid-shmem) members=(./data/data/com.termux/files/usr/lib/libandroid-shmem.so);;
  esac
  tar -xJf ".setup/m2-debs/$item/data.tar.xz" -C .setup/m2-native "${members[@]}"
done
out=spike/android/app/src/modern/jniLibs/x86_64
src=.setup/m2-native/data/data/com.termux/files/usr
mkdir -p "$out"
cp "$src/bin/proot" "$out/libproot.so"
cp "$src/libexec/proot/loader" "$out/libloader.so"
cp "$src/libexec/proot/loader32" "$out/libloader32.so"
cp "$src/lib/libtalloc.so.2.5.0" "$out/libtalloc.so"
cp "$src/lib/libandroid-shmem.so" "$out/libandroid-shmem.so"
sha256sum "$out"/*.so
