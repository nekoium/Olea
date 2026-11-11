#!/system/bin/sh
set -eu
test -d "$OLEA_APP_BASE/rootfs/run/m3-pi-final-seven-01.started"
mkdir "$OLEA_APP_BASE/rootfs/run/m3-pi-final-seven-01.started/native-launch"
exec /system/bin/sh "$OLEA_APP_BASE/linux.sh" /bin/sh -c '
set -eu
cd /opt/olea-m3-final-ready-a01
exec node spike/tests/m2/pi-single.mjs spike/m3/runtime/final-seven-allocated-options.json
'
