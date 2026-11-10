#!/system/bin/sh
# Original MIT. Atomically claim a new rootfs; never reuse a file, directory or symlink.
set -eu
test "$#" -eq 1
base=$1
mkdir -p "$base"
test ! -e "$base/rootfs"
test ! -L "$base/rootfs"
mkdir "$base/rootfs"
mkdir -p "$base/tmp" "$base/m2"
