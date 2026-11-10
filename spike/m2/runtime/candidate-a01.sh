#!/system/bin/sh
set -u
printf 'NATIVE_IDENTITY SHELL_PID=%s\n' "$$"
cat /proc/$$/stat
id
cat /proc/self/attr/current
printf '\nPACKAGED_FILES\n'
ls -lZ "$OLEA_NATIVE_DIR"
export LD_PRELOAD="$OLEA_NATIVE_DIR/libtalloc.so:$OLEA_NATIVE_DIR/libandroid-shmem.so"
export LD_LIBRARY_PATH="$OLEA_NATIVE_DIR"
export PROOT_TMP_DIR="$OLEA_APP_BASE/tmp"
export PROOT_LOADER="$OLEA_NATIVE_DIR/libloader.so"
export PROOT_LOADER_32="$OLEA_NATIVE_DIR/libloader32.so"
mkdir -p "$PROOT_TMP_DIR"
printf '\nPACKAGED_PROOT_VERSION\n'
"$OLEA_NATIVE_DIR/libproot.so" --version
printf 'PROOT_VERSION_EXIT=%s\n' "$?"
printf '\nPACKAGED_PROOT_ANDROID_SHELL\n'
"$OLEA_NATIVE_DIR/libproot.so" /system/bin/sh -c 'echo ANDROID_SHELL_OK; id; cat /proc/self/attr/current'
printf 'ANDROID_SHELL_EXIT=%s\n' "$?"
printf '\nWRITABLE_GUEST_SHELL\n'
/system/bin/sh "$OLEA_APP_BASE/linux.sh" /bin/sh -c 'echo GUEST_SHELL_OK; printf fresh > /workspace/sentinel; test "$(cat /workspace/sentinel)" = fresh'
printf 'GUEST_SHELL_EXIT=%s\n' "$?"
printf '\nWRITABLE_STOCK_NODE\n'
/system/bin/sh "$OLEA_APP_BASE/linux.sh" /opt/node/bin/node -e 'console.log("NODE_OK",process.version,process.arch);const c=require("child_process").spawnSync(process.execPath,["-e","process.stdout.write(String(6*7))"],{encoding:"utf8"});if(c.status!==0||c.stdout!=="42")process.exit(2)'
printf 'NODE_EXIT=%s\n' "$?"
