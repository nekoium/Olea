# Next feasibility milestone handoff

Status: **authorized next experiment**, not a production architecture acceptance. The user approved proceeding autonomously with a **new manager and new Pi worker team after milestone save and cleanup**. Do not reopen routine scope/classification approval gates. This document is a handoff only; writing it did not start a team, execute an agent/provider request, change source, or mutate Android.

## 1. Mission and fixed boundaries

Establish a modern-target Android runtime packaging path and a reproducible fresh install → ordinary upstream update → interruption/recovery flow, while preserving stock Pi and adding a real **stock Codex CLI app-server workflow using the same authorized custom provider**.

Keep Kotlin as Android lifecycle/permission authority and **one shared TypeScript/Node integration backend** with agent-specific adapters. Use supported upstream installation/update channels; no private agent ports, patched agents, replacement native dependencies, or version-specific protocol shims. PRoot/Ubuntu remains the measured comparison environment, not proof that the current writable-executable packaging can serve a modern target. Keep target 28 only as a labeled comparison baseline, never automatic production acceptance.

No root, normal-use desktop/ADB dependence, remote agent hosting, production chat UX, publishing, duplicate repository clone, tracker, scope labels, or classification-approval workflow. Host ADB can provision and observe disposable test fixtures; agents must act through the permission-controlled native bridge. Keep oracle data inaccessible through registered agent tools and the shared Unix workspace. Same-UID PRoot is not a security boundary.

Managers delegate implementation. Routine choices, finite retries, non-destructive provisioning of explicitly disposable state, measurement, and local checkpoints are authorized. Escalate only material new constraints, additional spending/access, destructive state changes, or publishing decisions. Continue independent cases when one prerequisite fails. This authorization does not make a missing physical device available or authorize unrelated provider credentials.

## 2. Frozen prior milestone: use evidence, not a green summary

| Checkpoint | Meaning |
| --- | --- |
| `dc4809f4af82cea956513294aced37638bac8766` | Original pre-experiment checkpoint; preserve it. |
| `c3e10d1998bdbf774a12264955a5a33dfdd79b14` | Tested native/runtime/backend code and actual experiment evidence. |
| `ea220900b7ddca5c539d6ad785d71d32d21216fb` | Subsequent read-only audit: residual host identity and four retained transformed gzip/payload hashes. |
| `fccb24e9f1c9d1a20948caee045d1b1bc5fa89d8` | Manager's local integrated final evidence checkpoint; preserved by local tag `feasibility-m1`. |
| `d9457ebbb0a52975238416f705088ae99410b82b` | Root closeout integration atop `fccb24e`, incorporating runtime closeout `afd0fad`; start from this plus the saved handoff commit, not an old child branch. |

Prior verdict: **REVISE**, with **87 cases: 52 pass, 6 fail, 6 blocked, 23 untested**. These counts are a historical assessment, not next-milestone results. Preserve `spike/reports/FEASIBILITY_REPORT.md`, its offline HTML, `matrix.json`, `assessment.json`, and `spike/runtime/evidence/` unchanged as prior evidence. Create distinct next-milestone evidence/report paths and link the old case IDs and attempts instead of overwriting them.

Read `AGENTS.md`, `PRODUCT.md`, `ROADMAP.md`, `PROGRESS.md`, `TECH_STACK.md`, `FEASIBILITY_BRIEF.md`, `PHONE_USE_TESTS.md`, the final report, and `spike/runtime/README.md` first. Older prose such as “no tests run” or “await scope review” is historical; this authorization and the measured final report supersede it for this experiment, without changing product agreements.

### Results and remaining risks to carry forward

- API 36/Android 16 x86_64, target-28 Kotlin host, Ubuntu Base 24.04.3, PRoot 5.1.107.102, upstream Linux Node 24.20.0/npm 11.19.0, Git 2.43.0 run under actual app UID 10216. Service-owned Unix prerequisites and stock Pi 0.74.0 model Unix/dependency/child/file/resume/concurrent/cancel outcomes passed independently.
- Ordinary same-prefix stock Pi updates to 1.0.0 and 1.5.2 passed after one bounded network retry each, preserving workspace and transcript hashes. Preserve the original ECONNRESET install failures. Several later independent-file failures have captured provider timeout/connection errors; a 1.0 second-session missing-file outcome remains unclassified. Do not infer runtime incompatibility, model refusal, or blanket reliability.
- Pi 1.5.2 independently passed actual tool discovery, launcher Accessibility `ACTION_CLICK` before foreground, and a combined Unix/cooperating-app workflow with separate-UID private oracle equality. Direct category results are not all-category model-driven evidence. Browser destination loading failed DNS/connection; dispatch and URL-bar match alone did not pass.
- Fully provisioned **target-36 Activity app-domain** execution of private writable PRoot failed `error=13 Permission denied`; the same-package development `run-as` succeeded. This rejects that tested execution strategy, not every modern packaging possibility. Inspect current Android policy and packaging APIs before selecting a bounded alternative; do not solve it by silently dropping target SDK or editing agents.
- Original Pi 0.74 shutdown leaked a live detached child because Android task-children lists were empty. Generic bounded numeric `/proc` parent discovery fixed separate stable-1.5 deterministic no-model diagnostics. Preserve original failures and the repair; snapshot-after-fork, already-reparented children, PID identity/ownership uncertainty, and whole-service death remain limits. Do not replace independent exit evidence with sessionCount 0.
- Prior explicit force-stop produced an empty app-UID snapshot, preserved files, and later restarted bridge-disabled/backend-stopped. A **different final audit at 2026-11-10 16:09:20 UTC** found PID **4357**, sleeping `dev.olea.spike`, UID **10216**, PPID **485**, start ticks **17539**; no PRoot/Node/Pi appeared in that reviewed app-UID list. Current phone/stop/service state was **not re-queried**. Withdraw final “no app-UID processes” claims; do not infer why the host remained/restarted or reuse this historical PID for cleanup without fresh identity proof.
- One four-process Kotlin/PRoot/backend/Pi snapshot: RSS **325624 KiB**, PSS **138862 KiB** (about **135.61 MiB PSS**), not full-system peak or battery cost. Constrained deterministic checks used actual **2 cores/2560 MiB** because the emulator clamped requested 2048 MiB; baseline **4 cores/4096 MiB** was restored. No full constrained model matrix was run. AVD config SHA-256 remained `d52586b2631349deb331f981b2e49d57ce5440e9fe94429a1772935edd7ce502`.
- Stock Codex 0.167.0 Android startup and structured app-server initialization passed; authenticated thread/turn/tool workflows did not. Stock Claude 2.1.322 native launcher and SDK 0.3.322 import worked, but Claude authentication remains separate and is not a new milestone requirement. Physical Android 14 ABI/ARM64, real battery and thermals remain **blocked until connection and ABI verification**, never inferred from emulator success.
- Four retained transformed gzip files now have exact SHA-256 and byte-identical decompressed tar equivalence to verified source payloads in `artifact-manifest.json@ea22090`. This closes that inventory gap, not the untested final fresh-provisioning procedure. No GPG attestation or complete dependency/license clearance is implied.

## 3. Save, cleanup, and a genuinely new Orca team

Closeout is now saved in root `d9457eb`, with `spike/runtime/evidence/milestone-closeout.json` observed **2026-11-10 16:35:21 UTC**. ADB listed no devices, no host emulator/qemu process was observed, and the prepared emulator was **already off**. No app/bridge stop, force-stop, kill, boot, wipe, deletion, configuration change or credential cleanup occurred. APK and offline AVD hashes remained unchanged; archives, caches, raw failures, rootfs, workspaces, sessions and protected configuration were retained. This is bounded closeout evidence, **not proof of app-level stop or reset of persisted phone/service/permission flags**, which could not be re-queried with no device. The earlier residual PID4357 audit remains historical, not retroactively rewritten as a successful app stop.

The old runtime owner explicitly **relinquished the emulator mutation lease** at closeout. The new manager must explicitly assign/acquire that lease for one new runtime worker before boot/provisioning. Recheck intended device and current app/bridge/service/process identity on the next authorized boot; do not assume stale Android PIDs, permission settings or forwarding state. No broad PID/name kills, app-data reset, emulator wipe, cache deletion, or credential deletion to make a clean story. Preserve valuable work/rootfs until an explicitly disposable fresh-test destination is designated.

The closing manager launches a **fresh normal Pi manager session in the same existing Olea root workspace**, passes this handoff, and then stops old-team development. The new manager, not this handoff worker, creates the new Run and child workers. Create a **new manager session**, not a reuse of `pi_b862f995_ed86_4c3f_950c_4debcc519375`, and a **new manager-bound Run**. New children must be **new kept-open Pi sessions/worktrees**, not old terminals. Old sessions/worktrees are evidence/reference only after closeout; do not schedule old workers to mutate state again. Do not create a project called Development by following a filesystem folder name.

Exact Orca project/repository ID: **`d55c3648-a5ff-4d7b-96d8-e80071701415` (Olea)**. The associated existing filesystem root is `C:/Users/Aria/Projects/Development/Olea`; `Development` in that path is not an Orca project selection. Start the new manager in the **same Olea root project**, not an old child workspace. Verify the actual root head includes `fccb24e`, closeout `d9457eb`, and the saved handoff before dispatch.

Use the executable selected from `ORCA_CLI_COMMAND`, else the version-matched guide's platform rule; load `skills get orchestration` and relevant references. The previously resolved executable was `C:/Users/Aria/AppData/Local/Programs/orca/resources/bin/orca.exe`; verify the current session, not a guessed global binary. Inspect `repo list`, `worktree current`, Run and worker receipts before acting. Do not initialize a second Git repo or manually create raw Git worktrees.

Version-matched command pattern for the **new manager only** (placeholders must be resolved from actual receipts):

```text
<orca> orchestration run-create --objective "Olea modern packaging and stock Pi/Codex app-server milestone" --from <NEW_MANAGER_HANDLE> --json
<orca> orchestration run-show --id <NEW_RUN_ID> --json
<orca> orchestration worker-start --spec-file <SELF_CONTAINED_TRACK_SPEC> --run <NEW_RUN_ID> --from <NEW_MANAGER_HANDLE> --repo id:d55c3648-a5ff-4d7b-96d8-e80071701415 --worktree new-child --agent pi --keep-open --name <NEW_TRACK_NAME> --json
```

Use the exact repo selector because this handoff explicitly requires the existing Olea project; verify local `new-child` starts from the root manager workspace. Do not copy old task, dispatch, Run or session IDs into new specs. Load current CLI help before using changed flags. Each track spec must include file ownership, artifact/bridge contract, finite budgets, independent assertions, read prerequisites, secrets policy, sole emulator-owner rule, and final receipt obligations.

Verify **both parentages independently**: (1) worktree lineage/project repo ID and intended root parent, (2) new Run coordinator identity and each dispatch/worker's supervising manager/Run binding. Session IDs and successful message delivery alone do not prove either. The prior Run projected a null coordinator despite `run-use`; direct messages worked but did not repair that evidence gap. If null/ambiguous again, preserve actual receipts, notify the manager, avoid duplicate launch, and resolve supported binding before authorizing worker mutations. Do not invent a verified parent from an intended handle.

On failed/unknown launch, obey the receipt's recovery path and mutation request ID; inspect existing Task/Dispatch/effects before any retry. A timeout is not proof nothing started. Never launch a replacement merely because a wakeup is late. Use explicit Run IDs with multiple Runs. Orca wakes completed workers/messages; do not build poll/check loops that consume the inbox invisibly. Keep direct manager return addresses in every spec for bounded questions/blockers/final receipts when coordinator wakeup/projection is unreliable. A peer-to-finished-worker resume was refused (`task_not_found`, peer not a helper); only the manager should assign such followups. No nested worker spawning from workers.

### Suggested independent tracks

| New Pi track | Owns | Execution rule |
| --- | --- | --- |
| Modern packaging/runtime | Android executable packaging, target/compile strategy, bootstrap/fresh-state lifecycle, install/update/recovery scripts and native bridge compatibility | **Sole emulator mutation lease owner**: installs, permission changes, boots/allocation, lifecycle actions and Android measurements. Other tracks send runnable payloads and desired assertions through manager. |
| Codex app-server/provider adapter | Current stock Codex/version/protocol inspection; original TS adapter, supported provider setup, approval/cancel/resume semantics and bounded protocol tests | Host preparation first, clearly host-only; Android execution delegated to sole owner. Extend the existing shared backend, not a second integration server. |
| Evidence/reproduction/supervision | Independent assertions, Pi regression, reproducible command/manifest/report generation, startup/output/resource/cleanup cases | Read-only preparation and offline/unit work can proceed in parallel; coordinate any Android observation with the owner and never mutate device state independently. |

Manager owns scheduling, integration, decision records and final review, not all implementation. Workers do only their assigned work; no further subagents. Reserve disjoint files/contracts before editing. Use safe Rim candidates/checkpoints when available and local Git commits; report Rim refusal and continue without destructive repair. Do not merge other workers' work without manager coordination. No remote pushes/publication.

## 4. Authorized provider and Codex integration

**Same authorized endpoint and key as Pi**, not an account/subscription hunt:

- Only secret source: ignored `C:/Users/Aria/Projects/Development/Olea/.setup/android-test-provider.local.json`.
- Endpoint: **`https://api.chiyi.cc/v1`**.
- Model order: **`gpt-6.1-terra`**, then **`gpt-6.1-sol`** for an explicit bounded fallback; record each attempt.
- Read credentials programmatically without output. Do not include the key in prompts, command arguments, tracked files, payload archives, raw auth/error responses, headers, logs, reports or Orca messages. New worktrees do not inherit ignored config. Native secret provisioning must remain protected/local; env-key references contain a variable name, not its value. Prevent shell/tool/child environment leakage and redact diagnostics before retention. Do not inspect unrelated credentials or send this key to another origin.

Codex's inspected official 0.163.0 schema supports a custom provider with `base_url`, `env_key`, `requires_openai_auth=false`, and `wire_api=responses`. This is a supported route, **not permanently auth-blocked** and not evidence of Chat Completions support. Pi Chat Completions success does not prove valid Codex Responses completion. Prior HTTP 200 SSE runs hit the original 64 KiB capture bound; the host real Codex attempt exceeded an outer 55-second deadline before a classified result. These are **unclassified/incomplete outcomes**, not proof of provider incompatibility. The revised incremental SSE parser was unit-tested, not validated by a subsequent provider call in that milestone.

The new milestone explicitly authorizes bounded real Codex provider requests to this endpoint. First inspect the **currently selected upstream stock Codex release, its install metadata/license, declared executable, CLI help, app-server protocol/schema and custom-provider documentation**. Pin and hash these before implementation. Prior tested versions are comparison data, not required current versions. Do not invent protocol methods or cargo-cult the research snapshot's experimental capability fields. Generate/use supported current schemas or official client interfaces when available; retain unknown events and explicit unsupported outcomes.

### Required Codex experiment sequence

1. Verify stock install and declared executable under recorded base/Node/ABI; no edited agent binaries, native substitutions or private protocol compatibility patches. Record sandbox prerequisites such as bubblewrap separately. Initialization without actual sandboxed Unix work is not compatibility proof. Do not hide a sandbox failure by silently enabling danger-full-access or disabling approvals.
2. Spawn persistent `codex app-server` through the shared backend's adapter and record process identity before handshake. Correlate a successful `initialize` result and the documented `initialized` notification, then use current documented thread creation/resume and turn submission/stream semantics. Common names such as `thread/start`, `thread/resume`, `turn/start`, and `turn/interrupt` are **verification targets, not permission to assume the current schema**. Record actual thread/turn IDs, acknowledgements, streaming items and terminal outcome.
3. Use the protected custom Responses provider and preferred model. Validate a real completed streamed turn, not merely HTTP status, `--help`, init, queued input or text claiming success. Keep request-level errors, stream termination and process exit distinct. Bound every request and distinguish HTTP/transport/protocol/model/sandbox/runtime faults.
4. Run actual workspace file and Unix shell work, install/use a representative dependency and spawn a harmless child; an independent runner checks exact randomized file contents, reruns the installed dependency, observes child result and exit. No oracle readback tool. Capture supported tool events and input/output bounds without retaining secret-bearing raw payloads.
5. Register/discover the phone tools through **the current documented Codex-supported tool integration surface** (for example supported MCP if confirmed), not a private RPC command or unrestricted Android shell. Native Kotlin enforces current permission/stop for every operation. First direct-test the bridge, then have Codex select tools to HOME/inspect/**Accessibility-click launcher entry**, independently prove target foreground caused by the click, and complete one combined Unix/phone fixture task. Intent-only launch does not satisfy alpha. Other category coverage retains direct/agent distinctions.
6. Exercise explicit approvals and rejection (including no side effect before approval and no action after rejection), cancellation during Unix/phone work, safe error/timeout handling, and explicit restart/resume of the **proved thread ID** and same canonical workspace/account home. Preserve transcript/workspace independently. Lost acknowledgement/pipe closure means delivery unknown, never automatic resend of uncertain phone effects. Acknowledged stop is not rollback; independently verify native stop/revocation and owned descendants.
7. Run an ordinary upstream Codex update on the fixed runtime and verify adapter/session/workspace preservation against the selected current/earlier compatible release where feasible. Pi regression must remain working through the same shared backend; do not replace it to make Codex green.

## 5. Research reference: inspected, not licensed implementation material

Reference root: `C:/Users/Aria/Projects/Development/Olea/research/orca-architecture`.

Read `verification.md`, `report.md`, `source-manifest.json`, and these sources under `sources/`:

| Source at Orca commit `b98a0fba16561fadc06868fe3e8710781d705efd` | Snapshot SHA-256 | Transferable observation |
| --- | --- | --- |
| `src/main/codex/app-server/codex-app-server-handshake.ts` | `5a3012c717022dd75320885c09a6d5560475d7de138d0b20e43db45e96c1be49` | Correlated initialization followed by notification; timeout owned by caller. Current capability/schema fields still require fresh upstream inspection. |
| `src/main/codex/app-server/codex-app-server-connection.ts` | `1716a4d6fae3c82e1eba84dd413bc87992c5f386f3a47c5098dd0b48ca370976` | Persistent piped transport for approvals/streaming; bounded frames/pending requests; transport faults are not root/descendant exit proof; owner records process before initialize. |
| `src/main/codex/structured/launch/codex-structured-launch-resolution.ts` | `171b0b40808301743195ecee4847a257d8455d0b9ceeb2514b91da233fd40a12` | `app-server` launch, canonical cwd/account home, durable proved thread identity for resume, fresh/scrubbed environment; resume must not become an accidental fork. |

The earlier research verification recorded 34 source snapshots with manifest hashes, 58 local-link checks, 15 HTML IDs and no external asset dependencies. Those checks validate research artifacts, **not Android runtime or present upstream API behavior**. The snapshot identified Orca 1.4.250 at the pinned commit, not the current executable/protocol. Do not infer current compatibility from it.

The inspected snapshot set does not establish a reusable license grant for copying Orca source; no license clearance is claimed here. Review upstream license/terms at the exact version before incorporating any code. Prefer original MIT Olea code implemented against supported upstream interfaces; preserve the research files/provenance unchanged. Do not transplant Electron, desktop process hosts, remote routing, complete journal/orchestration machinery or internal SDK wire formats.

## 6. Modern packaging and reproducible fresh-state acceptance

The runtime track must write down a small bounded candidate set using current Android execution restrictions and upstream runtime requirements before changing packaging. Routine candidate choice is delegated, not another scope approval gate. A material need for root, obsolete-target dependence, private agent ports, extra recurring infrastructure/spend or destructive replacement is a constraint to report, not silently accept.

Test the chosen modern target explicitly in the real Activity/service app domain with all native dependencies supplied. `run-as`, emulator root, intent dispatch, or `targetSdk` manifest text alone cannot pass. Record compile/min/target SDK and Android/ABI separately. Preserve a target-28 comparison case with fixed artifacts, but do not use it as the next milestone's modern-target pass.

Use a **new identified disposable install/rootfs destination** rather than wiping the historical runtime. Define trusted extraction, executable packaging, path translation, package manager/network setup, loader/library paths, native library provenance and permission setup as reproducible scripts. Run those scripts from recorded prerequisites, not unlogged manual fixes. The prior final fresh-provisioning script was never rerun from an erased rootfs; source existence is not a fresh-install success.

Acceptance sequence:

1. Verify archive/artifact hashes and source/license inventory, stage only public payloads, then fresh install/provision through the intended user/development boundary with complete step/timeout/result receipts.
2. Independently run shell, upstream Node, Git fresh commit/object read, DNS/TLS, representative dependency, child and nested-child assertions under native supervision and actual app UID before model cases.
3. Execute stock Pi regression plus the real Codex app-server/provider/workspace/phone workflow; separate each assertion and prerequisite so a failed provider request does not erase deterministic Unix evidence.
4. Ordinary agent and runtime/environment updates preserve checksummed workspace files, installed package behavior, provider-owned conversation identity/history and protected credentials without logging them. Define interrupted/failed-update recovery with durable version/state identity; do not uninstall or delete valuable user state to claim preservation.
5. Interrupt/kill child, backend and whole app separately; lock/switch/reboot separately where bounded and practical. Verify actual live execution versus restored state, recheck permissions/stop on recovery, preserve receipts and do not replay uncertain phone actions. Observe real root and descendant identities, not a bare PID or empty session list.
6. Re-run deterministic core plus a bounded representative stock-agent workflow under a recorded constrained allocation; report actual allocation, clamp/OOM/resource pressure and restoration. Connect physical Android 14 only when available, establish ABI first, and keep device-only cases blocked otherwise.

## 7. Budgets, evidence, and decision boundary

The new manager sets conservative explicit finite budgets in the worker specs before launch; this is routine execution policy, not a user approval gate. A reasonable initial tranche is **eight top-level provider-backed prompts total across Pi and Codex, including retries/fallbacks**, at most **12 tool rounds per prompt**, one preferred-model attempt and at most one explicit fallback for the same failed case. Count actual HTTP/model requests and token usage separately because a tool round can incur several requests. Stop and escalate material additional spending beyond the recorded tranche rather than silently extend it. Never retry a turn with uncertain side effects automatically.

Suggested initial operation bounds, tightened or revised with recorded rationale when current upstream behavior requires it: install/build phase 240 seconds per bounded attempt; startup/initialize 30 seconds; turn wall deadline 120 seconds; HTTP/stream idle 45 seconds; one focused network/install retry after a specific diagnosis; maximum 256 KiB protocol frame, 1 MiB retained diagnostic output per case and bounded event queues. Decode streaming Responses incrementally and retain safe event types/counts, matched IDs, usage and terminal/error summaries; a whole-stream capture cap is not proof of malformed API compatibility. If an upstream-supported turn/token cap exists, use it; otherwise record the enforcement gap and cancel at the adapter deadline rather than claim the remote bill is strictly capped. No unbounded AFK loop or retries merely for green results.

Deliver a **new** offline Markdown + self-contained HTML explanation and machine-readable pass/fail/blocked/untested matrix, with:

- Expected versus actual mission; modern-target packaging, fresh install, ordinary update and recovery cases independently assessed.
- Exact native/backend/runner/agent/schema versions and hashes, source URLs/licenses/notices, target/ABI/allocation and artifact paths; original MIT distinct from GPL/LGPL and other third parties.
- Complete attempts, failures, retries, fallback, workarounds, prerequisite propagation and independent fixture assertions; provider/network errors separate from runtime/tool/protocol defects. No claim that an error is a successful Unix or phone action.
- Resource/installation costs: per-process plus total observed PSS/RSS, shared-page/incomplete-snapshot qualifications, cold startup, idle CPU, first-event/text streaming and stalls, one/two sessions, output backpressure/overflow, deterministic cleanup, direct/managed fixed-workload comparison where practical, and actual constrained allocation. Unknown monetary/thermal/battery values stay unknown.
- Reproduction commands, clean-install prerequisites and recovery/update commands actually run; source-only scripts clearly marked untested. Detached/forked/reparented cleanup limits and current phone/service state explicitly reported.
- A recommendation of accept/revise/reject/insufficient-evidence **for this bounded milestone**, not automatic product/production acceptance. Original final reports stay historical.

**Success boundary:** independently prove the chosen modern-target app-domain packaging and repeatable fresh install/update/recovery while stock Pi regression and stock Codex initialized/thread/turn/tool/resume/cancel/approval/error behavior work through one backend, using the authorized provider and native phone authority. Real Unix/dependency/file and causal Accessibility/combined fixture outcomes must be verified outside model claims. Record residual limits rather than broad survival guarantees.

**Failure/decision boundary:** if current Android policy still blocks the tested packaging, stock upstream workflows need private patches, supported app-server/provider semantics cannot complete bounded real requests, data/credential preservation fails, or permission/approval/recovery boundaries are unsafe, preserve exact evidence and recommend revise/reject for that candidate. A failed provider/network prerequisite blocks dependent model cases but independent packaging/Unix/lifecycle cases continue. Missing access/device or exhausted declared budget is blocked/insufficient evidence, not passed or invented incompatibility. Escalate only the vital constraint or additional spending/access/destructive decision; no routine classification gates.

## 8. Retained artifacts, closeout and persisted-state limits

These are **historical absolute locations**, not permission to launch an old worker or trust unchanged bytes. Verify existence and hashes read-only before reuse; ignored files do not follow Git worktrees. Copy only public, verified artifacts into the new worker's project-local `.setup` if needed; no duplicate clone or secret-bearing archive.

| Artifact/state | Absolute location / rule |
| --- | --- |
| Integrated source and historical final report | `C:/Users/Aria/Projects/Development/Olea`: historical final evidence `fccb24e`, closeout integration `d9457eb`, then this handoff; `spike/reports/FEASIBILITY_REPORT.md`, `.html`, `matrix.json` and `spike/runtime/evidence/` under that root. |
| Old runtime child (evidence only) | `C:/Users/Aria/orca/workspaces/Olea/feasibility-android` with tested code/audit history; do not resume its worker for new implementation. |
| Expanded host APK | `C:/Users/Aria/orca/workspaces/Olea/feasibility-android/spike/android/app/build/outputs/apk/debug/app-debug.apk`; SHA-256 `35c53046d77e35269561338a30e52c6098e01056d541c2744988b406c498f033`. |
| Expanded fixture APK | `C:/Users/Aria/orca/workspaces/Olea/feasibility-android/spike/android/fixture/build/outputs/apk/debug/fixture-debug.apk`; SHA-256 `96d3ed95b3bcd39784f6907461e125339fcda174755c6641c99a7f2d36a8e743`. |
| Earlier causal model run artifacts | Host SHA-256 `2c888051990855fe8378f749825af9e1f472422bf5d5d59c5362a17f6edd9db4`; fixture `7eef46f3e1fd511a6f02585c08918c739adfbd0eab737be007f8b657422de8ca`. Do not substitute expanded APK identities into those old results; older binaries may not be retained at current output paths. |
| Verified runtime/archive caches | `C:/Users/Aria/orca/workspaces/Olea/feasibility-android/.setup/`: `ubuntu-base.tar.gz`, `node.tar.xz`, `node.tar.gz`, `proot.deb`, `libtalloc.deb`, `libandroid-shmem.deb`, `proot-data.tar.gz`, `libtalloc-data.tar.gz`, `shmem-data.tar.gz`, `debs/`; use `artifact-manifest.json@ea22090` for exact retained names/hashes. Do not assume final script staging names all match old retained files. |
| Build cache/tool archive | `C:/Users/Aria/orca/workspaces/Olea/feasibility-android/.setup/gradle-proxy.zip`, `.setup/gradle-9.1.0/`, `.setup/gradle-home/`; verify archive hash before reuse and retain license notices. Other old worker `.setup`/npm caches are not automatically inherited. |
| Old emulator private state | `/data/user/0/dev.olea.spike/files/rootfs`, `/workspace` and `/opt/olea` inside that rootfs; `.olea-provisioned` guard protects existing state. Do not remove guard or overwrite it to test fresh installation. |
| Secret source | Only `C:/Users/Aria/Projects/Development/Olea/.setup/android-test-provider.local.json`; remains ignored/protected, never read with a display command or copied into report/payload. |
| Android tools/config | SDK `C:/Users/Aria/AppData/Local/Android/Sdk`; ADB `platform-tools/adb.exe`, emulator `emulator/emulator.exe`; AVD `C:/Users/Aria/.android/avd/Olea_API_36.avd/config.ini`. Sole owner verifies actual state before changes. |
| Closeout and persisted-state evidence | Root `spike/runtime/evidence/milestone-closeout.json@d9457eb`: at 16:35:21 UTC no ADB device/emulator process; already off, unchanged config/APKs, no deletion/mutation, old lease relinquished. Earlier `{final-cleanup-state.txt,final-state-correction.json,final-pid4357-review.txt,lifecycle-after-death-processes.txt,lifecycle-restart-capabilities.json,restored-final-state.txt}` remain separate historical observations. Persisted phone/app state not re-queried; next authorized owner checks on boot. |

The prior evidence and backend children are also retained at `C:/Users/Aria/orca/workspaces/Olea/feasibility-evidence` and `C:/Users/Aria/orca/workspaces/Olea/feasibility-backend`; treat both as evidence only after closeout. Keep task temporaries/caches inside the new project/worktree `.setup`, preserve pre-existing user changes, and report exact cleanup scope instead of deleting shared home/global folders.
