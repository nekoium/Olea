#!/system/bin/sh
set -eu
/system/bin/sh "$OLEA_APP_BASE/linux.sh" /bin/sh -c '
set -eu
test ! -e /opt/agents/pi-update
timeout --kill-after=5s 225s npm install --prefix /opt/agents/pi-update --cache /root/.npm-m2 --fetch-retries=0 --fetch-timeout=45000 --maxsockets=2 --no-audit --no-fund @earendil-works/pi-coding-agent@1.5.1
node -e '\''const p=require("/opt/agents/pi-update/node_modules/@earendil-works/pi-coding-agent/package.json");if(p.version!=="1.5.1")process.exit(1);console.log(JSON.stringify({version:p.version,modelRequests:0}))'\''
'
