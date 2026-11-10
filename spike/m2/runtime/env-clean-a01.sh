#!/system/bin/sh
set -eu
NATIVE=$OLEA_NATIVE_DIR
BASE=$OLEA_APP_BASE
export LD_PRELOAD="$NATIVE/libtalloc.so:$NATIVE/libandroid-shmem.so"
export LD_LIBRARY_PATH="$NATIVE"
export PROOT_LOADER="$NATIVE/libloader.so"
export PROOT_LOADER_32="$NATIVE/libloader32.so"
export PROOT_TMP_DIR="$BASE/tmp"
# Android env consumes Android preload dependencies, then clears LD_* before Linux exec.
"$NATIVE/libproot.so" --link2symlink -0 -r "$BASE/rootfs" -b /dev -b /proc -b /sys -b /system -b /apex \
  -w /workspace /system/bin/env -i HOME=/root USER=root PATH=/opt/node/bin:/usr/bin:/bin LANG=C.UTF-8 \
  /opt/node/bin/node -e 'if(process.env.LD_PRELOAD||process.env.LD_LIBRARY_PATH)throw Error("leaked native loader environment"); console.log("CLEAN_NODE_OK",process.version);const c=require("child_process").spawnSync("/bin/sh",["-c","printf 42"],{encoding:"utf8"});if(c.status!==0||c.stdout!=="42")throw Error("child assertion"); console.log("CLEAN_CHILD_OK")'
