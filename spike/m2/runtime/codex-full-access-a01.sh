#!/system/bin/sh
set -eu
# Durable attempt claim: never replay this named case after uncertain outer delivery.
mkdir "$OLEA_APP_BASE/rootfs/run/codex-full-access-a01.started"
id
cat /proc/$$/stat
cat /proc/self/attr/current
exec /system/bin/sh "$OLEA_APP_BASE/linux.sh" /bin/sh -c '
set -eu
cd /opt/olea
exec node spike/tests/codex/full-access-preflight.mjs /opt/agents/codex/node_modules/@openai/codex/bin/codex.js /opt/olea/evidence/codex-full-access-a01.json full-access
'
