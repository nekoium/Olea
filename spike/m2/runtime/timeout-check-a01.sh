#!/system/bin/sh
set -eu
printf 'TIMEOUT_ROOT_PID=%s\n' "$$"
cat /proc/$$/stat
exec /system/bin/sleep 30
