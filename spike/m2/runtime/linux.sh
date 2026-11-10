#!/system/bin/sh
# Original MIT. NativeLibraryDir comes from PackageManager, not a writable app copy.
set -eu
BASE=${OLEA_APP_BASE:?}
NATIVE=${OLEA_NATIVE_DIR:?}
export LD_PRELOAD="$NATIVE/libtalloc.so:$NATIVE/libandroid-shmem.so"
export LD_LIBRARY_PATH="$NATIVE"
export PROOT_LOADER="$NATIVE/libloader.so"
export PROOT_LOADER_32="$NATIVE/libloader32.so"
export PROOT_TMP_DIR="$BASE/tmp"
mkdir -p "$PROOT_TMP_DIR"
exec "$NATIVE/libproot.so" --link2symlink -0 -r "$BASE/rootfs" -b /dev -b /proc -b /sys \
  -b "$BASE/bridge-config.json:/run/olea-bridge.json" -b "$BASE/bridge-token:/run/olea-token" \
  -w /workspace /usr/bin/env -i HOME=/root USER=root TERM=xterm-256color \
  PATH=/opt/node/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
  LANG=C.UTF-8 OLEA_BRIDGE_CONFIG=/run/olea-bridge.json "$@"
