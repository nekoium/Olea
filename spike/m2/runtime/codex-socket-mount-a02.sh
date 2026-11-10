#!/system/bin/sh
set -eu
exec /system/bin/sh "$OLEA_APP_BASE/linux.sh" /opt/node/bin/node /opt/olea/spike/tests/codex/socket-mount-diagnostic.mjs /opt/olea/evidence/codex-socket-mount-a02.json /opt/agents/codex/node_modules/@openai/codex-linux-x64/vendor/x86_64-unknown-linux-musl/codex-resources/bwrap
