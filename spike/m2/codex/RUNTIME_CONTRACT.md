# Stock Codex runtime contract

This is disposable original MIT integration in the existing shared backend. Kotlin remains lifecycle and phone permission authority. The sole runtime owner executes all Android commands; this worker has performed no Android actions. Host receipts never establish Android compatibility.

## Build and stock installation

Use a disposable package/rootfs and fresh runtime paths. Preserve baseline `dev.olea.spike` and its data.

```sh
npm ci --prefix spike/backend --fetch-retries=0 --fetch-timeout=45000 --no-audit --no-fund
npm run build --prefix spike/backend
node --test spike/tests/codex/*.test.mjs spike/tests/pi/*.test.mjs
npm install --prefix "$CODEX_PREFIX" --fetch-retries=0 --fetch-timeout=45000 --no-audit --no-fund @openai/codex@0.167.0
node "$CODEX_PREFIX/node_modules/@openai/codex/bin/codex.js" --version
node "$CODEX_PREFIX/node_modules/@openai/codex/bin/codex.js" app-server generate-json-schema --out .setup/codex-device-schema
```

`CODEX_PREFIX` is a task-specific destination outside the model workspace. It is not HOME. Bound each installation/build to 240 seconds and preserve first failures. Only one diagnosed install/network retry is allowed. Hash the installed package manifest/lockfile/declared launcher/native binary and generated schema on the actual Linux runtime; host Windows binary hashes do not cover Linux bytes. Record Node/base/ABI, actual app UID, compile/target SDK and service-domain parentage independently. No `run-as` acceptance.

## Deterministic sandbox and lifecycle before provider calls

These scripts do not read provider credentials or submit model prompts. Run from the deployed repository/payload root inside actual native service supervision:

```sh
node spike/tests/codex/sandbox-preflight.mjs "$CODEX_PREFIX/node_modules/@openai/codex/bin/codex.js" "$NEW_EVIDENCE_DIR/linux-sandbox-attempt1.json"
node spike/tests/codex/lifecycle-preflight.mjs "$CODEX_PREFIX/node_modules/@openai/codex/bin/codex.js" "$NEW_EVIDENCE_DIR/linux-command-termination-attempt1.json"
node spike/tests/codex/mcp-discovery.mjs - "$CODEX_PREFIX/node_modules/@openai/codex/bin/codex.js" "$NEW_EVIDENCE_DIR/linux-mcp-discovery-attempt1.json"
```

Sandbox preflight uses stock app-server `command/exec`, `workspaceWrite`, a harmless inside write and one designated disposable sibling write that must fail. It records stock RPC errors, including namespace/seccomp/bubblewrap errors when returned. Do not replace binaries or disable sandbox after failure. The Linux output cap is 4096 bytes; Windows rejects a custom cap, so the script omits only that unsupported Windows option. Adapter frames remain capped at 256 KiB.

Lifecycle preflight launches a known Node parent/child that self-expire within ten seconds. It calls supported `command/exec/terminate`, then independently observes both identities for up to two seconds. Linux uses `/proc` UID/start identity. Transport acknowledgement alone cannot pass cleanup. Failed observation is explicit; no broad PID kills occur. Windows stock sandbox returned -32600 because command/exec terminate/write/resize are unsupported there. That host failure does not establish Linux behavior. This checks deterministic command termination, not actual model `turn/interrupt` or phone rollback.

MCP discovery uses an unreachable synthetic loopback bridge and makes no phone calls. The `-` argument omits provider credentials; current stock host thread/start and mcpServerStatus/list work without a key. The receipt must identify `olea_phone` as connected and list `phone_click` and `phone_fixture_action`. Discovery does not pass bridge effects, permissions, stop, causal foreground or oracle assertions.

## Shared backend wire contract

Launch the existing `spike/backend/dist/server.js` with task-local `OLEA_WORKSPACE`, `OLEA_STATE_DIR`, `OLEA_CODEX_ENTRY` and, only for explicitly budgeted model work, `OLEA_PROVIDER_CONFIG`. `OLEA_BRIDGE_CONFIG` supplies native URL/token file configuration; URLs remain configurable, including the modern bridge `127.0.0.1:8768`. Pi retains its existing start/command protocol. Status and events add explicit `agent` identity.

```json
{"id":"start1","type":"codex_start","session":"codex1","resume":false}
{"id":"turn1","type":"codex_command","session":"codex1","command":{"method":"turn/start","params":{"text":"THE AUTHORIZED PROMPT"}}}
{"id":"cancel1","type":"codex_command","session":"codex1","command":{"method":"turn/interrupt"}}
{"id":"approval1","type":"codex_approval","session":"codex1","requestId":"ACTUAL_SERVER_REQUEST_ID","decision":"decline"}
{"id":"stop1","type":"stop","session":"codex1"}
{"id":"resume1","type":"codex_start","session":"codex1","resume":true}
```

Use the actual approval ID type, string or number. Supported decisions are one-shot accept/decline/cancel. Unknown requests return method-not-found; no session-wide grants or policy amendments are implemented. Verify no effect before approval and no effect after rejection independently. A real accepted approval must cover an inspected exact harmless action within the disposable workspace; never expand privileges or bypass sandbox to make a case pass.

Process identity is recorded before initialize/initialized. Thread/start or thread/resume must acknowledge the actual thread ID; persisted state retains exact canonical workspace/home/thread. Resume never substitutes a caller-supplied thread. Lost acknowledgement/pipe error/deadline means delivery unknown, never automatic resend. Only matching thread/turn completion clears active state. Exited sessions are removed by exact instance. Root exit and descendant exit remain separate. Inherited output pipes are destroyed after bounded shutdown draining without claiming descendant absence.

## Explicitly budgeted model runners

Both host prompts allocated to this worker are spent. No further provider turn is authorized here. Only the manager may allocate remaining global tranche to the runtime owner. Each invocation below submits exactly one top-level prompt and never retries/falls back automatically:

```sh
OLEA_EXECUTION_SCOPE=android-app-domain node spike/tests/codex/run-stock.mjs /run/olea-provider.json "$NEW_EVIDENCE_DIR/unix-attempt1.json" "$CODEX_PREFIX/node_modules/@openai/codex/bin/codex.js" gpt-6.1-terra unix
OLEA_EXECUTION_SCOPE=android-app-domain OLEA_BRIDGE_CONFIG=/run/olea-bridge.json node spike/tests/codex/run-stock.mjs /run/olea-provider.json "$NEW_EVIDENCE_DIR/phone-attempt1.json" "$CODEX_PREFIX/node_modules/@openai/codex/bin/codex.js" gpt-6.1-terra phone
```

The Unix runner independently verifies exact randomized result-file marker, installed dependency behavior and a fresh child-check execution; safe command tool receipts corroborate actual model execution. A model-written claim alone never passes. Phone mode asks for HOME/inspect/Accessibility launcher click plus a Unix-generated value sent through the cooperating interface. It does not install/check a dependency or child and cannot pass the full Unix suite. The sole native owner must direct-test bridge permissions/stop first, then independently compare the generated file with a separate-UID inaccessible oracle and prove native click preceded foreground. No model oracle-read tool exists. Normal phone effects use MCP/native bridge, never ADB.

`controlled` mode is an alternate bounded host diagnostic: a preselected task script, exact `node task.cjs`, optional one-shot exact approval with no expanded-access reason. Its actual Windows attempt failed launching WindowsApps PowerShell with `CreateProcessAsUserW failed: 5`; no script/dependency/child/result effect occurred. Do not replay that uncertain action automatically. That failure is not an Android failure.

The provider key is read programmatically from the authorized local source and passed only to the app-server env_key variable. Shell policy uses core inheritance and excludes provider/secret variables. MCP config explicitly clears that key and forwards no additional env vars; helper refuses unexpected nonempty provider authority. Real shell absence was not proved by failed host model work. Protected configs remain outside workspace and mode600 where supported, but same-UID shell/file access is not a strong credential isolation boundary. Report that limitation rather than claiming PRoot security.

## Ordinary update/recovery payload

Use a previously proved thread/workspace on an earlier stock release (for example 0.163.0), then install the pinned newer stock 0.167.0 into the **same prefix**, with no agent patches. This sequence is prepared, not run by this worker:

1. Stop the app-server explicitly and independently observe owned descendants. Record exact before version, launcher/native hashes, workspace result/combined-value hashes, persisted `thread.json`, and existing upstream rollout hashes. Do not hash or display secret values.
2. Run the ordinary bounded npm install above against the same prefix. Preserve exact first network/install failure and one diagnosed retry. Do not erase the prefix/rootfs or provider home after failure.
3. Before starting a new agent, verify the preserved workspace/checkpoint/old rollout hashes. Record actual installed newer version and package/native/schema hashes.
4. `codex_start` with resume true must return the previously proved ID under the same canonical workspace/home. `thread/read` checks retained history without another model prompt. Any actual further tool workflow consumes a separately allocated prompt.
5. Interrupt an update only in expressly disposable state, record the failed/partial installed version, and recover through an ordinary bounded reinstall without deleting workspace/home/credentials. Source existence is not evidence this update sequence passed.

## Bounds and limits

Initialize/RPC: 30 seconds; model turn: 120 seconds; stream idle: 45 seconds; request and stream retries: zero; frame: 256 KiB; queue/retained case diagnostics: 1 MiB; pending RPC/approval requests: 32. Tool notifications are counted by thread/turn, including pre-ack events; excess triggers interruption. Stock exposes no strict pre-execution tool-round or token cap, so cancellation cannot establish a hard remote-billing cap. Retain unknown HTTP count and billing. Completed streamed turn, actual tool result, independent outcome, real app-domain execution and production acceptance are distinct facts.
