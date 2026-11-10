#!/system/bin/sh
# Original source MIT. Follow-up phase under the same Kotlin-owned process tree.
BASE=/data/user/0/dev.olea.spike/files
exec /system/bin/sh "$BASE/linux.sh" /bin/sh -c '
  export OLEA_PROVIDER_CONFIG=/run/olea-provider.json
  export OLEA_WORKSPACE=/workspace
  export OLEA_STATE_DIR=/var/lib/olea
  export OLEA_PI_ENTRY="$(node -e '\''const p=require("node:path");const d="/opt/olea/.setup/pi-matrix/stock/node_modules/@earendil-works/pi-coding-agent";const j=require(p.join(d,"package.json"));process.stdout.write(p.resolve(d,typeof j.bin==="string"?j.bin:j.bin.pi))'\'')"
  export OLEA_PI_VERSION=0.74.0
  export OLEA_REPORT=/workspace/evidence/cleanup-only-0.74.0.json
  node /opt/olea/spike/tests/pi/cleanup-only.mjs
  node /opt/olea/spike/runtime/stock-followup.mjs
  node /opt/olea/spike/probes/codex-interface.mjs /workspace/evidence/codex-interface /workspace/stock-agent-probe/codex/node_modules/@openai/codex/bin/codex.js
  node /opt/olea/spike/runtime/retry-upgrades.mjs
  export OLEA_PI_ENTRY="$(node -e '\''const p=require("node:path");const d="/opt/olea/.setup/pi-matrix/stock/node_modules/@earendil-works/pi-coding-agent";const j=require(p.join(d,"package.json"));process.stdout.write(p.resolve(d,typeof j.bin==="string"?j.bin:j.bin.pi))'\'')"
  exec node /opt/olea/spike/backend/dist/server.js
'
