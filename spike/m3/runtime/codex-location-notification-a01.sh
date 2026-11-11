#!/system/bin/sh
set -eu
# Host atomic allocation claim and protected source-identity check already completed.
test -d "$OLEA_APP_BASE/rootfs/run/m3-codex-location-notification-01.started"
mkdir "$OLEA_APP_BASE/rootfs/run/m3-codex-location-notification-01.started/native-launch"
exec /system/bin/sh "$OLEA_APP_BASE/linux.sh" /bin/sh -c '
set -eu
cd /opt/olea-m3-categories-a01
export OLEA_EXECUTION_SCOPE=android-app-domain
export OLEA_BRIDGE_CONFIG=/run/olea-bridge.json
export OLEA_PHONE_CALL_LIMIT=5
export OLEA_PHONE_TOOL_ALLOWLIST=phone_capabilities,phone_location,phone_fixture_notify,phone_notifications
exec node spike/tests/codex/run-stock.mjs /run/olea-provider.json /workspace/m3-codex-location-notification-01.json /opt/agents/codex/node_modules/@openai/codex/bin/codex.js gpt-6.1-terra phone-categories full-access spike/m3/runtime/codex-location-notification-options.json
'
