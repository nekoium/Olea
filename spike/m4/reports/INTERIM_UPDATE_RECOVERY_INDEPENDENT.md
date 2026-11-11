# M4 interim independent assessment: update works, preservation and automatic recovery fail

**Stock Codex 0.167.0 → 0.167.1 ordinary npm update and a bounded direct/no-model protocol workflow pass in a copied prefix. Full canonical preservation does not pass: one original historical rollout changed. Original backend-only automatic recovery fails; explicit native STOP and disabled restart recover the measured tracked processes.** Repaired recovery and final state await a separate immutable batch.

Assessed runtime commit `33bd1d3`, imported locally as `6bbc34d`, preserving the earlier readiness note unchanged. Independent task `task_4121b7bc62fe` / dispatch `ctx_cc5b1cc9f271`, worker `8a0e3f58-54c3-4e78-8b2a-a03d60598a23`. The machine record [INTERIM_UPDATE_RECOVERY_ASSESSMENT.json](../evidence/INTERIM_UPDATE_RECOVERY_ASSESSMENT.json) pins all **14 new Git artifact references** with SHA256. Existing `verifyArtifacts` checked that subset; focused assertions checked receipt relationships and deliberately required the retained failures/mismatch. No Android commands, credentials, inference or runtime repair were performed by this assessment.

Inherited predecessor boundary remains **210 receipts / 291 unique artifact references**, **112 cases: 63 pass / 2 fail / 12 blocked / 35 untested**. This report neither reruns that verification nor rerenders/inflates the matrix. Direct/no-model update evidence must not silently replace the inventory's model-mode `codex.update` assertion.

## Actual ordinary update and protocol result

Sources are exact `33bd1d3:spike/m4/runtime/{update-install-a01.sh,update-npm-a01.sh,update-protocol-a01.sh,update-protocol.mjs}`. The install helper copies `/opt/agents/codex` with `cp -a` to `/opt/agents/codex-m4-a01`, uses disposable install home/cache, and observes old `codex-cli 0.167.0`. Its actual npm dist-tags response records stable `latest=0.167.1`; alpha tags are distinct. The npm helper checks that saved latest tag then performs one ordinary pinned npm install in that same copied prefix, finite 210-second timeout, fetch retries zero. It exits0 after “changed 2 packages in 49s”, then reports `codex-cli 0.167.1`. No install failure/retry appears in this batch; initial missing disposable CODEX_HOME/PATH-alias and linker warnings remain retained.

Native install/npm/protocol receipts all record actual target36/API36 service host PID11004, real UID10216, untrusted_app domain and x86_64 native library path, with root exit/no timeout/no drain fault. Their native tracked ownership counts are respectively9/8/33, all remaining/fault lists empty and trackedExitVerified true. Elapsed native-wrapper times are20358/51805/9921ms. The ABI list includes arm64-v8a but actual execution is x86_64; this proves no physical ARM64 support.

The installed manifest reports Apache-2.0. Protocol evidence retains npm lock metadata, including ordinary registry URLs and SHA512 integrity for the umbrella and Linux-x64 packages:

- `https://registry.npmjs.org/@openai/codex/-/codex-0.167.1.tgz`
- `https://registry.npmjs.org/@openai/codex/-/codex-0.167.1-linux-x64.tgz`

Exact integrity strings and six measured installed-file SHA256 values are in `update-protocol-a01.json`. Linux-x64 native `codex` is320186856bytes, SHA256 `dd5bfdf19d794dcc6fb482d2d5a2d9fb31d11f6caa44b303bb72890d461e8a02`; package manifest is `e8e3347884c49f8105400f410399e54831c999988c964d289a12f08d28c0d1da`. Launcher SHA256 `e14fc83739c13c1074b12bd1acce4010c893c7f6fbfc1593b4a31d74cabb57af` equals the baseline old launcher; the changed native/manifest version provides the release distinction. Lock entries for other platforms do not establish those binaries were installed or executed.

No stock patches, private port, wire shim or policy substitution appears in these helpers. Supported danger-full-access/approval-never is explicit; filesystemIsolation=false. Restricted sandbox failures remain historical, not a blocker to this selected mode.

`update-protocol.mjs` uses existing CodexProcess directly, not CodexSession's state-writing start helper. It copies historical home and workspace to `/workspace/m4-update-a01/{protocol-home,workspace}`, rewrites only the disposable configuration, and launches with explicit disposable HOME/CODEX_HOME and no provider key environment. It records:

1. initialize returns0.167.1 and the disposable codexHome; existing CodexProcess.initialize source sends initialized after acknowledgment.
2. thread/resume returns historical ID `01a1c6d2-bf9b-7670-a6c0-49be86a0f916` with one turn; thread/read returns the same ID and one turn.
3. Direct command/exec exits0 and a separate filesystem read asserts exact `updated-tool.txt` bytes `M4_UPDATE_TOOL_OK`.
4. First stop reports rootExited/descendantsVerified true; a fresh process initializes and resumes the same thread again.
5. Copied transcript remains SHA256 `345b0884b097ec53e8fad3431de2b5f47d59b32a5212557227777869e4d7d284`; copied combined-value equals original combined-value; final stop reports both checks true. Native wrapper stdout independently matches the summarized protocol and protected-equality results.

These establish bounded direct command compatibility and copied-thread resume/history availability, not a model-selected tool workflow, phone action, MCP discovery, full historical semantic-content comparison or untouched original canonical session. Only turn count is retained for history; no raw history/tool-file export permits an additional local content inspection. The helper does not rewrite canonical thread.json path identity because it calls stock thread/resume directly with explicit copied cwd. A copied home can contain persisted absolute references; relocation is not a proven isolation boundary.

## Preservation contradiction: keep the failure

At baseline07:57:19.701Z all seven historical hashes equal predecessor values. Both later original recovery attempts explicitly record **historicalUnchanged=false**. Six still match, but original canonical rollout:

`files/rootfs/opt/olea/evidence/attempt-1794337061452-dffc52fe/state/codex/case/home/sessions/2026/11/10/rollout-2026-11-10T18-57-42-01a1c6d2-bf9b-7670-a6c0-49be86a0f916.jsonl`

changed from `345b0884b097ec53e8fad3431de2b5f47d59b32a5212557227777869e4d7d284` to `0a5b101f13c8974a79ac1a6308243d75b539da57c738d19f62e696b43463b4f0`. The copy still matching the old hash does not negate this actual original mutation. `a01` observes it before any backend interruption, after the update/protocol sequence; the exact cause and changed contents are not established by these artifacts. Do not infer truncation, benign metadata-only append, destructive loss or automatic restoration. Preserve both hashes, current actual bytes and future diagnosis separately. Manager was notified in `msg_8fdc5093c9de`.

Original combined-value, both recorded original config.toml files, other recorded rollout/plugin fixture, sentinel and latest failed Pi session/resume hashes remain equal in the later receipts. Protocol protected provider/bridge equality booleans are true; recovery provider/native bridge/token equality booleans are true. Baseline modes are600; later mode remeasurement is absent. No protected values/digests were exported or accessed by this independent worker.

There are no immediate after-install-before-resume canonical snapshots, complete canonical workspace/home inventories, or later original known-good prefix hashes in this batch. Thus full known-good binary/data preservation is not independently established here, even though install targets the copied prefix and unchanged recorded files provide narrower evidence. Failed/interrupted update recovery and broad future-version compatibility also remain untested by this successful adjacent update.

## Original backend-only interruption: precise outcomes

`m4-backend-original-a01.json` is a retained **prerequisite/UI failure**, not a backend interruption. It records zero UI matches (`0 !== 1`), no UI operations/events/started marker/kill, same host, explicit final STOP, preserved protected/Pi data and the canonical mismatch above. No automatic recovery outcome can be credited from this attempt.

`m4-backend-original-a02.json` measures the active case. Native host11004/UID10216/start1276873 remains the same. Shared backend Node14985/start1504820 descends from PRoot14977; stock Pi15003 starts without inference. A direct bash command writes STARTED before sleeping12seconds and attempting a late effect. Fresh same-UID/start checks precede exact positive-PID SIGKILL of Node14985. Two seconds later native capabilities report backendRunning=false but **phoneEnabled=true and backendCleanup=null**. Both automatic disable and automatic verified cleanup therefore fail as recorded. This confirms the readiness source hazard; it does not prove every descendant remained live at that exact moment because no intervening post-death process inventory is retained.

Explicit native STOP then disables phone authority and cleans six recorded identities with no remaining/faults, rootExitObserved/trackedExitVerified true. Independent observations report all five previously inventoried nonhost identities absent; the extra native-tracked14979 is covered by the native result, not a separate pre-interruption inventory. Explicit backend restart produces new ready Node15266 and empty status session list, with phoneEnabled=false. No agent command is replayed. Late effect remains ABSENT after the bounded original deadline, separate fixture oracle/launch log hashes remain equal, and final native STOP cleans the new three-identity backend. Finite tracked snapshots do not establish universal unseen-fork cleanup, rollback or model-turn cancellation.

Source attribution is the unchanged native service at `33bd1d3:spike/android/app/src/main/java/dev/olea/spike/RuntimeService.kt`: startBackend lacks an exit watcher and can overwrite its owner when restarting; explicit stopBackend invokes owner.stop. The runtime worker owns the pending minimal watcher/owner-retention repair; this assessment changes none of it and credits no future repair.

## Hash domains, budget and final observation limits

The machine assessment verifies **Git blob bytes** of the14new committed helpers/receipts at33bd1d3, avoiding checkout CRLF ambiguity. Runtime-installed binary hashes and npm lock integrity are recorded measurements; binary/tarball/raw lockfile bytes are not exported here for local recomputation. Native receipts corroborate actual service execution but the batch has no new source-to-deployed-script/compiled-backend manifest. Existing CodexProcess source explains initialize/initialized; that is source corroboration, not a separately retained wire transcript of initialized. No full old evidence verifier, unchanged suite or additional device probe was run.

**Current M4 ledger is9authorized /0consumed /0allocated /9unallocated**, explicit refreshed allowance on manager handoff. Predecessor9consumed remains immutable; cumulative consumption9sofar. Baseline's embedded9/9/0ledger is stale predecessor accounting, not current M4. Earlier readiness note's zero-budget statement remains historical and is superseded for current allowance only. No worker model allocation was issued. This batch is no-model/direct; no automatic replay/fallback is authorized.

Latest device observation in this batch belongs to runtime worker `9e78162f-c4b8-4db0-987c-12277b05c76d`, lease grant `msg_0cadfcb34a63`, Run `run_dd39824405ae`. At08:03:33.535Z original-a02 records same native host11004, phone/backend/Accessibility false, backendStoppingfalse, only host11004 in the measured runtime-UID inventory, verified final tracked cleanup and unchanged fixture data. This is not a live observation by this worker and not a lease release. Baseline grants/projection/device details are earlier07:57:19.701Z observations; they were not all remeasured after a02. Runtime remains active for repair, so final repaired recovery, actual final grants/processes/data and lease disposition require the next immutable batch.

All original Pi failures and missing model URL/files/repaired-notification/completed capture_result remain. Actual model-triggered capture initiation with consent and independent PNG does not establish model image input/interpretation. Original full phone/backend goal stays incomplete. Physical Android14 ABI/ARM64, battery/thermal, broader updates/lifecycle and universal process cleanup remain unproved. No production UX was added. Git only; Rim excluded by instruction. Session/worktree remain open.
