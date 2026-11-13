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
npm install -g --prefix /opt/agents --fetch-retries=0 --fetch-timeout=60000 "$package@$version"
node -e 'const fs=require("node:fs"); const name=process.argv[1]; const p=JSON.parse(fs.readFileSync("/opt/agents/lib/node_modules/"+name+"/package.json","utf8")); console.log(p.name+" "+p.version)' "$package" > "/root/.olea/$agent-version.part"
mv "/root/.olea/$agent-version.part" "/root/.olea/$agent-version.txt"
cat "/root/.olea/$agent-version.txt"
