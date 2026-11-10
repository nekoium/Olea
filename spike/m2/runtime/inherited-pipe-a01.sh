#!/system/bin/sh
set -eu
/system/bin/sleep 8 &
child=$!
printf 'PIPE_ROOT_PID=%s PIPE_CHILD_PID=%s\n' "$$" "$child"
cat /proc/$$/stat
cat /proc/$child/stat
exit 0
