#!/system/bin/sh
set -eu
exec /system/bin/sh "$OLEA_APP_BASE/linux.sh" /bin/sh -c '
set -eu
mkdir /workspace/m3-native-cancel-a01
exec node -e '\''const fs=require("fs");fs.writeFileSync("/workspace/m3-native-cancel-a01/started",String(process.pid));setTimeout(()=>fs.writeFileSync("/workspace/m3-native-cancel-a01/late-effect","UNEXPECTED"),15000);setTimeout(()=>{},60000);'\''
'
