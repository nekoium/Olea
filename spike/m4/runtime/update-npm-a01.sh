#!/system/bin/sh
# SPDX-License-Identifier: MIT
set -eu
mkdir "$OLEA_APP_BASE/rootfs/run/m4-update-npm-a01.started"
exec /system/bin/sh "$OLEA_APP_BASE/linux.sh" /bin/sh -c '
set -eu
export HOME=/workspace/m4-update-a01/install-home
export CODEX_HOME=/workspace/m4-update-a01/install-home/codex
mkdir -p "$CODEX_HOME"
cd /workspace/m4-update-a01
node -e '\''const t=require("./dist-tags.json");if(t.latest!=="0.167.1")throw Error("TAG_CHANGED");'\''
timeout --kill-after=5s 210s npm install --prefix /opt/agents/codex-m4-a01 --cache /workspace/m4-update-a01/npm-cache --fetch-retries=0 --fetch-timeout=45000 --maxsockets=2 --no-audit --no-fund @openai/codex@0.167.1
node /opt/agents/codex-m4-a01/node_modules/@openai/codex/bin/codex.js --version
'
