#!/system/bin/sh
# SPDX-License-Identifier: MIT
set -eu
mkdir "$OLEA_APP_BASE/rootfs/run/m4-update-install-a01.started"
exec /system/bin/sh "$OLEA_APP_BASE/linux.sh" /bin/sh -c '
set -eu
mkdir /workspace/m4-update-a01
mkdir /workspace/m4-update-a01/install-home
export HOME=/workspace/m4-update-a01/install-home
export CODEX_HOME=/workspace/m4-update-a01/install-home/codex
cd /workspace/m4-update-a01
cp -a /opt/agents/codex /opt/agents/codex-m4-a01
node /opt/agents/codex-m4-a01/node_modules/@openai/codex/bin/codex.js --version > before-version.txt
timeout --kill-after=5s 40s npm view @openai/codex dist-tags --json --fetch-retries=0 --fetch-timeout=30000 > dist-tags.json
cat before-version.txt dist-tags.json
'
