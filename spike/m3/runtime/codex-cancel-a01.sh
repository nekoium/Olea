#!/system/bin/sh
set -eu
exec /system/bin/sh "$OLEA_APP_BASE/linux.sh" /bin/sh -c '
set -eu
cd /opt/olea-m3-a02
exec node spike/tests/codex/lifecycle-preflight.mjs /opt/agents/codex/node_modules/@openai/codex/bin/codex.js /workspace/m3-codex-cancel-a01.json full-access
'
