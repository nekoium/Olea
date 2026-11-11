#!/system/bin/sh
set -eu
exec /system/bin/sh "$OLEA_APP_BASE/linux.sh" /bin/sh -c '
set -eu
cd /opt/olea-m3-pi-categories-a01
exec node spike/m3/runtime/pi-registration-a01.mjs
'
