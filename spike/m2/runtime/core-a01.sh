#!/system/bin/sh
set -eu
printf 'APP_SHELL_PID=%s\n' "$$"
cat /proc/$$/stat
id
cat /proc/self/attr/current
sha256sum "$OLEA_NATIVE_DIR"/*.so
/system/bin/sh "$OLEA_APP_BASE/linux.sh" /opt/node/bin/node /workspace/core.mjs core-a01
