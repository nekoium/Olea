#!/system/bin/sh
set -eu
# Durable claim prevents automatic replay after uncertain delivery or a harness restart.
mkdir "$OLEA_APP_BASE/rootfs/run/m2-android-pi-01.started"
printf 'PI_CASE_ROOT_PID=%s\n' "$$"
cat /proc/$$/stat
exec /system/bin/sh "$OLEA_APP_BASE/linux.sh" /opt/node/bin/node /opt/olea/spike/tests/m2/pi-single.mjs /run/pi-a01-options.json
