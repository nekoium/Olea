#!/bin/sh
# SPDX-License-Identifier: MIT
set -eu
agent=${1:?Choose pi, codex or claude}
operation=${2:?Choose install or update}
case "$agent" in
  pi) package=@earendil-works/pi-coding-agent; initial=1.5.2 ;;
  claude) package=@anthropic-ai/claude-code; initial=2.1.292 ;;
  codex) package=@openai/codex; initial=0.167.1 ;;
  *) echo 'Unknown agent' >&2; exit 2 ;;
esac
case "$operation" in
  install) version=$initial ;;
  update) version=latest ;;
  *) echo 'Unknown operation' >&2; exit 2 ;;
esac
# Only the upstream agent prefix changes; never copy or resume canonical homes here.
mkdir -p /root/.olea
printf 'Installing %s@%s (%s / %s)\n' "$package" "$version" "$(uname -s)" "$(uname -m)"
printf 'Node: '; node --version
printf 'npm: '; npm --version
# Codex and Claude ship their Linux executable as optional platform packages.
# Explicitly include them even when an inherited npm configuration omits optional deps.
if ! timeout --kill-after=5s 540s npm install -g --prefix /opt/agents --include=optional --fetch-retries=0 --fetch-timeout=60000 --maxsockets=8 --no-audit --no-fund "$package@$version"; then
  echo 'npm installation failed. Retained stdout/stderr has the underlying error. Check storage/network, then retry explicitly.' >&2
  exit 1
fi
printf 'Verifying installed executable…\n'
case "$agent" in
  pi) node /opt/agents/lib/node_modules/@earendil-works/pi-coding-agent/dist/cli.js --version ;;
  codex) node /opt/agents/lib/node_modules/@openai/codex/bin/codex.js --version ;;
  claude) /opt/agents/bin/claude --version ;;
esac
node -e 'const fs=require("node:fs"); const name=process.argv[1]; const p=JSON.parse(fs.readFileSync("/opt/agents/lib/node_modules/"+name+"/package.json","utf8")); console.log(p.name+" "+p.version)' "$package" > "/root/.olea/$agent-version.part"
mv "/root/.olea/$agent-version.part" "/root/.olea/$agent-version.txt"
cat "/root/.olea/$agent-version.txt"
