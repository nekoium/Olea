#!/system/bin/sh
set -eu
# Durable allocation claim precedes all provider read/turn submission; never replay uncertain phone effects.
mkdir "$OLEA_APP_BASE/rootfs/run/m2-android-codex-phone-01.started"
printf 'ALLOCATION=m2-android-codex-phone-01 POLICY=full-access PHONE=permission-controlled\n'
id
cat /proc/$$/stat
cat /proc/self/attr/current
exec /system/bin/sh "$OLEA_APP_BASE/linux.sh" /bin/sh -c '
set -eu
cd /opt/olea
export OLEA_EXECUTION_SCOPE=android-app-domain
export OLEA_BRIDGE_CONFIG=/run/olea-bridge.json
exec node spike/tests/codex/run-stock.mjs /run/olea-provider.json /opt/olea/evidence/codex-full-access-phone-a01.json /opt/agents/codex/node_modules/@openai/codex/bin/codex.js gpt-6.1-terra phone full-access
'
