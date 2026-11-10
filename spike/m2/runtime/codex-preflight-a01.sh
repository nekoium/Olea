#!/system/bin/sh
set -u
/system/bin/sh "$OLEA_APP_BASE/linux.sh" /bin/sh -c '
set -u
cd /opt/olea
printf "SANDBOX_PREFLIGHT\n"
timeout --kill-after=5s 90s node spike/tests/codex/sandbox-preflight.mjs /opt/agents/codex/node_modules/@openai/codex/bin/codex.js /opt/olea/evidence/codex-sandbox-a01.json
printf "SANDBOX_CLI_EXIT=%s\n" "$?"
printf "MCP_DISCOVERY_NO_MODEL\n"
timeout --kill-after=5s 90s node spike/tests/codex/mcp-discovery.mjs - /opt/agents/codex/node_modules/@openai/codex/bin/codex.js /opt/olea/evidence/codex-mcp-a01.json
printf "MCP_CLI_EXIT=%s\n" "$?"
'
