#!/system/bin/sh
set -eu
exec /system/bin/sh "$OLEA_APP_BASE/linux.sh" /opt/node/bin/node /opt/olea/pi-update-a01.mjs
