# Olea backend

One shared Node backend supervises stock Pi RPC and Codex app-server processes. Android owns phone permissions, consent and STOP. The runtime binds durable workspaces and agent/session storage independently of replaceable agent installations. After the actual Android all-files grant, shared storage is also bound at `/sdcard` and `/storage`; workspace validation selects cwd and session identity, not a filesystem access boundary. Android still enforces its private-data and storage restrictions. Grant changes require stopping and starting the runtime to refresh bindings; managed workspaces remain usable without the grant.

Run `npm ci`, `npm test`, then `node dist/server.js`. Node 22.19 or later is required. Tests use local protocol fixtures and synthetic configuration; they make no provider requests.

## Runtime configuration

| Environment variable | Meaning |
| --- | --- |
| `OLEA_PI_ENTRY` | Stock Pi JavaScript CLI entry. |
| `OLEA_CODEX_ENTRY` | Optional stock Codex executable or JavaScript CLI entry. |
| `OLEA_WORKSPACE` | Existing default workspace; defaults to the backend working directory. Android sets `/workspace`. |
| `OLEA_WORKSPACE_ROOT` | Root for explicitly selected workspace paths; defaults to `/workspace`. |
| `OLEA_STATE_DIR` | Durable conversation storage. Existing Pi paths and Codex homes remain in place. |
| `OLEA_PI_PROVIDER`, `OLEA_MODEL` | Optional stock Pi provider/model selection. Pi uses its ordinary `~/.pi/agent/models.json` and authentication configuration. |
| `OLEA_PROVIDER_CONFIG` | Optional Codex Responses provider JSON file: `{ "baseUrl": "https://provider.example/v1", "apiKey": "…", "model": "chosen-model" }`. No endpoint/model allowlist or fixture defaults. HTTPS, a nonempty key and model are required; URL credentials, queries and fragments are rejected. |
| `OLEA_CODEX_MODEL` | Optional explicit override of the Codex provider file's model. Without provider configuration, stock defaults/authentication apply. |
| `OLEA_CODEX_ACCESS_MODE` | Defaults to `full-access`: stock `danger-full-access`, approval `never`. Optional `workspace-write` is a compatibility helper; its Android sandbox is not established. |
| `OLEA_BRIDGE_CONFIG` | JSON file `{ "url": "http://127.0.0.1:PORT/phone", "token": "…" }`. A loopback origin without `/phone` is also accepted. Android binds `/olea-phone/config.json`. |

Codex gets a stable `CODEX_HOME` at `STATE_DIR/codex/SESSION/home`. Only its provider key is added to its environment, as `OLEA_CODEX_PROVIDER_KEY`; the key is not written to generated TOML. The phone MCP receives the bridge config path and empty provider environment variables. Pi receives the runtime environment, including the bridge config path when enabled. Shell environment filters reduce ordinary credential inheritance; full access provides **no filesystem isolation**, including from same-UID configuration files. Do not copy Codex homes, rewrite saved absolute references, or infer isolation from the workspace selection boundary.

Pi's supported phone extension is `extensions/phone.ts`, loaded only when a bridge is configured. It only registers phone tools; it does not register an experimental provider or restrict stock Unix tools. Package this directory alongside `dist/`.

## JSON Lines protocol

Every request has a string `id` (at most 128 characters). Responses are `{ "type": "response", "id": "…", "success": true, "data": … }`, or `success:false` with a safe `error` code. Startup emits `{ "type": "ready", "protocol": 1, "maxSessions": 2, "pid": … }`.

```json
{"id":"1","type":"start","session":"conversation","workspace":"/workspace/project","resume":false}
{"id":"2","type":"command","session":"conversation","command":{"type":"prompt","message":"Hello"}}
{"id":"3","type":"command","session":"conversation","command":{"type":"abort"}}
{"id":"4","type":"codex_start","session":"codex-conversation","workspace":"/workspace/project","resume":false}
{"id":"5","type":"codex_command","session":"codex-conversation","command":{"method":"turn/start","params":{"text":"Hello"}}}
{"id":"6","type":"codex_command","session":"codex-conversation","command":{"method":"turn/interrupt"}}
{"id":"7","type":"codex_command","session":"codex-conversation","command":{"method":"thread/read"}}
{"id":"8","type":"status"}
{"id":"9","type":"stop","session":"conversation"}
```

Session names match `[a-zA-Z0-9_-]{1,64}`. Both start operations accept optional `workspace` and `resume`. A selected workspace must already exist, be absolute, and resolve under the configured root, including through symlinks. Omitted workspace preserves the existing configured default. Start and active status return canonical `workspace`. Each conversation binds its agent and workspace in `STATE_DIR/SESSION/identity.json`; changing either fails with `session_identity_mismatch`. Pi legacy resume checkpoints without workspace metadata migrate only in the existing default workspace. Codex additionally checks the saved thread, original home and access mode. Resume does not submit a prompt. Up to two sessions, including pending starts, may be active.

Pi commands: `prompt`, `abort`, `get_state`, `get_messages`, `get_session_stats`, `bash`, `abort_bash`. Pi auto-retry is disabled at startup. Existing Pi directory and transcript persistence remain supported.

Codex commands:

- `turn/start` accepts nonempty `params.text` up to 65536 characters. Only one turn or direct command may be active in a session. There is no experiment-specific tool-count cutoff or overall model-turn deadline.
- `turn/interrupt` uses the observed active thread and turn identity. It cancels a turn separately from environment STOP.
- `thread/read` first supplies the current `threadId` and `includeTurns:true`; use returned `thread.turns[].items` to render saved history. Stock builds returning exactly `list_turns is not supported yet` get a metadata-only request with `includeTurns:false` and `historyUnavailable:stock_thread_turns_unavailable`. Android retains its saved display and reports this limit.
- `mcpServerStatus/list` reports phone MCP registration for the current thread.
- `command/exec` is a no-model stock app-server command, available in full-access mode. `params.command` is an argument array (1–128 strings, each at most 8192 characters); optional `timeoutMs` is 1–300000, default 120000. Cwd is fixed to this session's workspace, output cap is 65536 bytes, and sandbox policy is explicit full access. Other supplied parameters cannot change these boundaries.
- `command/exec/terminate` targets only this session's tracked direct command, including after delivery uncertainty. Direct commands do not become model conversation turns.

Codex start/status report `accessMode` and `filesystemIsolation:false`. A retained approval request can be answered with `{type:"codex_approval",session,requestId,decision:"accept"|"decline"|"cancel",id}`; full-access approval-never does not normally request approval.

## Streaming and failure handling

Events are `{type:"event",agent:"pi"|"codex",session,record}`. The backend preserves upstream notification fields and does not collapse the stream into plain text. For Codex, render text from `item/agentMessage/delta` (`params.delta`, `threadId`, `turnId`, `itemId`), tool/file progress from `item/started`, `item/completed` and upstream output deltas, and lifecycle from `turn/started` and `turn/completed`. Handle errors and additional upstream notification types without assuming every item is text. Correlate turns/items by their IDs; acknowledgement may arrive after notifications.

Faults and exits include agent/session identity. Raw stderr is counted and discarded. RPC frames are capped at 256 KiB, pending requests at 32 and queued writes at 1 MiB. Oversized history/output fails instead of growing memory without bound. The native phone response cap is 64 KiB and timeout is 10 seconds. Phone calls honor Pi cancellation and never retry. Custom Codex Responses request and stream retries are zero. A lost acknowledgement or transport failure remains delivery-unknown: explicitly inspect history/status, interrupt, or stop; do not automatically replay.

STOP closes the session's supervised process tree with bounded cleanup. Root/descendant observations are finite and do not establish universal after-fork cleanup. Android must disable the native bridge on backend death and STOP and require explicit restart.

## Shared native phone operations

| Tool | Native operation | Arguments |
| --- | --- | --- |
| `phone_capabilities` | `capabilities` | `{}` |
| `phone_home` | `global_action` | fixed `{action:"home"}` |
| `phone_inspect` | `accessibility_tree` | `{}` |
| `phone_click` | `accessibility_click` | `{nodeId}` |
| `phone_swipe` | `swipe` | optional integer `x`, `startY`, `endY`; native validates screen bounds |
| `phone_open_url` | `open_url` | `{url}` with HTTPS prefix |
| `phone_location` | `location` | `{}` |
| `phone_files_write_read` | `files_write_read` | `{value}` up to 128 characters |
| `phone_notifications` | `notifications` | `{}` |
| `phone_capture_request` | `capture_request` | `{}` |
| `phone_capture_result` | `capture_result` | `{requestId}` returned by `phone_capture_request`; pending/ready/denied status |
| `phone_folder_request` | `folder_request` | `{}` |
| `phone_app_action` | `cooperating_app_action` | `{value}` up to 128 characters; native user configuration selects target |

Both adapters consume the same schema and `callPhone` implementation. There is no fixture notification tool or fixed cooperating-app package. Requests POST `/phone` with bearer authentication and `{id,operation,args}`. Native success is `{ok:true,result}`; denial is `{ok:false,error:{code,message?}}`. Only bounded public error fields are returned, with token redaction; transport failures report delivery uncertainty. Native capture request/result status owns consent and freshness asynchronously; no observer files, consent polling loop, automatic replay, or screenshot pixels in model input are added.

Backend checks establish protocol and validation behavior only. Real stock upstream installation/update, Android integration, capture freshness, permissions/effects and UI rendering require the manager's integration checks; provider-backed spending remains frozen.
