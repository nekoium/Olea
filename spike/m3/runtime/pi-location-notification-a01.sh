#!/system/bin/sh
set -eu
test -d "$OLEA_APP_BASE/rootfs/run/m3-pi-location-notification-01.started"
mkdir "$OLEA_APP_BASE/rootfs/run/m3-pi-location-notification-01.started/native-launch"
exec /system/bin/sh "$OLEA_APP_BASE/linux.sh" /bin/sh -c '
set -eu
cd /opt/olea-m3-pi-categories-a01
exec node spike/tests/m2/pi-single.mjs spike/m3/runtime/pi-location-notification-options.json
'
