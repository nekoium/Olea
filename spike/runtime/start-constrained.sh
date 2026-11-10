#!/system/bin/sh
# Original source MIT. Constrained deterministic core, no model calls or agent action replay.
BASE=/data/user/0/dev.olea.spike/files
exec /system/bin/sh "$BASE/linux.sh" /bin/sh -c '
  export OLEA_PROVIDER_CONFIG=/run/olea-provider.json OLEA_WORKSPACE=/workspace OLEA_STATE_DIR=/var/lib/olea
  node /opt/olea/spike/runtime/prerequisites.mjs
  export OLEA_PI_ENTRY="$(node -e '\''const p=require("node:path");const d="/opt/olea/.setup/pi-matrix/stock/node_modules/@earendil-works/pi-coding-agent";const j=require(p.join(d,"package.json"));process.stdout.write(p.resolve(d,typeof j.bin==="string"?j.bin:j.bin.pi))'\'')"
  export OLEA_PI_VERSION=1.5.2 OLEA_REPORT=/workspace/evidence/cleanup-constrained-1.5.2.json
  node /opt/olea/spike/tests/pi/cleanup-only.mjs
  exec node /opt/olea/spike/backend/dist/server.js
'
