#!/system/bin/sh
# Original source MIT. Kotlin owns this one shared Linux backend and JSONL pipes.
BASE=/data/user/0/dev.olea.spike/files
exec /system/bin/sh "$BASE/linux.sh" /bin/sh -c '
  export OLEA_PROVIDER_CONFIG=/run/olea-provider.json
  export OLEA_WORKSPACE=/workspace
  export OLEA_STATE_DIR=/var/lib/olea
  node /opt/olea/spike/runtime/service-suite.mjs
  export OLEA_PI_ENTRY="$(node -e '\''const p=require("node:path");const d="/opt/olea/.setup/pi-matrix/stock/node_modules/@earendil-works/pi-coding-agent";const j=require(p.join(d,"package.json"));process.stdout.write(p.resolve(d,typeof j.bin==="string"?j.bin:j.bin.pi))'\'')"
  exec node /opt/olea/spike/backend/dist/server.js
'
