#!/system/bin/sh
set -eu
# Claim allocation before any provider read/submission; uncertain acknowledgement never permits replay.
mkdir "$OLEA_APP_BASE/rootfs/run/m2-android-codex-unix-01.started"
printf 'ALLOCATION=m2-android-codex-unix-01 POLICY=full-access\n'
id
cat /proc/$$/stat
cat /proc/self/attr/current
exec /system/bin/sh "$OLEA_APP_BASE/linux.sh" /bin/sh -c '
set -eu
cd /opt/olea
export OLEA_EXECUTION_SCOPE=android-app-domain
exec node spike/tests/codex/run-stock.mjs /run/olea-provider.json /opt/olea/evidence/codex-full-access-unix-a01.json /opt/agents/codex/node_modules/@openai/codex/bin/codex.js gpt-6.1-terra unix full-access
'
