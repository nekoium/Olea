#!/system/bin/sh
# SPDX-License-Identifier: MIT
set -eu
BASE=${OLEA_APP_BASE:?}
NATIVE=${OLEA_NATIVE_DIR:?}
export LD_PRELOAD="$NATIVE/libtalloc.so:$NATIVE/libandroid-shmem.so"
export LD_LIBRARY_PATH="$NATIVE"
export PROOT_LOADER="$NATIVE/libloader.so"
export PROOT_LOADER_32="$NATIVE/libloader32.so"
export PROOT_TMP_DIR="$BASE/tmp"
mkdir -p "$PROOT_TMP_DIR"
exec "$NATIVE/libproot.so" --link2symlink -0 -r "$BASE/runtime/rootfs" -b /dev -b /proc -b /sys \
  -b /system -b /apex -b "$NATIVE" \
  -b "$BASE/data/workspace:/workspace" -b "$BASE/data/home:/root" \
  -b "$BASE/data/sessions:/sessions" -b "$BASE/backend:/olea" \
  -w /workspace /system/bin/env -i HOME=/root USER=root TERM=xterm-256color \
  PATH=/opt/node/bin:/opt/agents/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
  LANG=C.UTF-8 OLEA_PI_ENTRY=/opt/agents/lib/node_modules/@earendil-works/pi-coding-agent/dist/cli.js \
  OLEA_WORKSPACE=/workspace OLEA_STATE_DIR=/sessions "$@"
