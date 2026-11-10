#!/system/bin/sh
set -eu
id
cat /proc/self/attr/current
sha256sum "$OLEA_NATIVE_DIR"/*.so
exec /system/bin/sh "$OLEA_APP_BASE/linux.sh" /opt/node/bin/node /workspace/core.mjs core-repeat-a01
