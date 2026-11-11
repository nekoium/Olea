#!/system/bin/sh
set -eu
# Deterministic supervision fixture only, no provider or phone effect.
exec /system/bin/sh "$OLEA_APP_BASE/linux.sh" /bin/sh -c '
set -eu
mkdir /workspace/m3-timeout-a01
node -e '\''const {spawn}=require("node:child_process"); const c=spawn("/bin/sh",["-c","sleep 60 & exit 0"],{stdio:"ignore"}); setTimeout(()=>{},60000);'\''
'
