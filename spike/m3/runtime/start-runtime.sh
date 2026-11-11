#!/system/bin/sh
set -eu
# One shared backend. No automatic conversation/tool replay at startup.
exec /system/bin/sh "$OLEA_APP_BASE/linux.sh" /bin/sh -c '
set -eu
cd /opt/olea-m3-a02
export OLEA_PI_ENTRY=/opt/agents/pi/node_modules/@earendil-works/pi-coding-agent/dist/cli.js
export OLEA_WORKSPACE=/workspace/m3-backend
export OLEA_STATE_DIR=/workspace/m3-backend-state
export OLEA_PROVIDER_CONFIG=/run/olea-provider.json
export OLEA_BRIDGE_CONFIG=/run/olea-bridge.json
mkdir -p "$OLEA_WORKSPACE" "$OLEA_STATE_DIR"
exec node spike/backend/dist/server.js
'
