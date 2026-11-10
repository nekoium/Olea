# Agent operating notes: lean feasibility work

Applies to current and following managers. Read with CHECKPOINT_POLICY.md and M2_CURRENT_CHECKPOINT.md; do not reload large historical transcripts when these saved facts and immutable receipts answer the question.

## Goal and context budget

Prove a working Android backend base supporting ordinary different stock-agent installations/updates and PHONE_USE_TESTS.md, while maintaining the Android runtime rather than private agent ports. Keep one shared backend and Kotlin authority.

Aim to keep each manager context below **300k tokens**. Scope a useful interim checkpoint early enough to finish within that budget. Prepare concise saved state before context grows large, but **do not hand off an unfinished checkpoint solely to reset context**. After the checkpoint is reached, save it, define the successor's explicit bounded checkpoint, launch a fresh manager/team and safely retire old sessions. No current checkpoint or acceptance was removed by this efficiency instruction.

## Current execution list

The 112-row matrix is an assertion inventory, **not 112 separate test runs**. Reuse one run for compatible independent assertions. Latest integrated assessment: 31 pass /1 fail /31 blocked /49 untested at 5c86c99; later raw outcomes must not be inferred into those totals without retained receipts.

| Work group | Current result / next action |
| --- | --- |
| Modern runtime and deterministic Unix | Actual target36 service shell/stock Node/Git object/DNS/TLS/npm dependency/nested process chain passed. Reuse core-a01; no full rerun on the existing runtime. |
| Stock Pi plus causal phone workflow | Stock1.5.2 install, RPC/turn/file/dependency behavior/resume, native launcher click/foreground and separate-UID combined oracle passed. Exact model-child command semantics and general cleanup remain qualified; no repeat model prompt for green. |
| Stock Codex | Actual Android install/initialize/MCP registration passed. Stock sandbox commands blocked by socket mount identity; subsequent direct bundled-bwrap diagnostic cannot read overflowuid. Specialist interprets exact evidence; no provider prompt on failed prerequisite, no invalid TMPDIR/legacy toggles or patches. |
| Corrected fresh repeat | Separate dev.olea.m2.repeat, bootstrap passed. Certificate-package hash rejection retained; one focused metadata/download retry. Complete verified offline install and minimal core repeat if feasible; preserve working Pi app. |
| Ordinary updates and preservation | Still required: stock-agent update, workspace/transcript/provider identity and credential preservation; interrupted/failed-update recovery with before/after hashes. Use deterministic RPC/resume when it avoids unnecessary model requests. |
| Remaining phone coverage | PHONE_USE_TESTS.md set: intents/URL destination, structured Android API, files/media, notifications, Accessibility, consent-based capture, cooperating app integration. Current M2 causal Accessibility/integration pass does not cover the other categories. Direct and agent-driven results remain distinct. |
| Lifecycle and supervision | Pending explicit cancel/reject/permission-stop/revocation, child/backend/app interruption, switch/lock/reboot and no replay, assessed independently. Reuse native harness-bound results only within their actual scope. |
| Resources and constrained runtime | Existing explicit-PID sampler; measure required one/two-session/idle/startup/constrained representative cases without new frameworks. Missing processes are unknown; no peak/thermal claim. Physical Android14/ABI/battery/thermals blocked until connection. |

Current manager's checkpoint focuses on Codex viability, corrected fresh provisioning and update/preservation beyond the saved core/Pi result. Broader remaining acceptance stays visible; see M2_CURRENT_CHECKPOINT.md.

## Avoid duplicate work

- Communicate at meaningful result/failure/decision phases. Do not send a new worker instruction merely to acknowledge each receipt.
- Read changed source and exact receipts, not every historical file or a full worker transcript. Use `worker-read --limit 3` when a small status slice is enough; default transcript output can be expensive.
- Keep reusable commands and failure explanations in this file or existing RUNTIME_CONTRACT.md/README. Extend an existing helper only for an actual observed gap. No new generic helper framework.
- Run focused checks for changed behavior or a real defect. Manifest/docs/report-only commits need artifact/hash/whitespace verification, not full unchanged test suites.
- Do not regenerate or reread full Markdown/HTML reports after each small receipt. Aggregate meaningful batches; preserve append-only evidence and exact Git/hash references.
- Keep worker messages concise: outcome, exact commit/path, actual budget, next prerequisite. Workers do not need repeated copies of the whole mission in every message.
- Stop a failed deterministic prerequisite from consuming dependent model prompts. Continue independent runtime/phone/repro cases. No broad retries or green-by-scope-reduction.

## Known commands and recoveries

- Source validation already established: backend build; Codex/Pi focused tests; M2 evidence tests. Repeat only after relevant changes, failure or uncertainty.
- Exact receipt verification: import `verifyArtifacts` from `spike/tests/m2/evidence.mjs`, load `spike/m2/evidence/evidence/receipts.json`, call it with repository root. Source refs use `git:<commit>:<path>`; binary/deployed bytes remain exact raw hashes.
- Native run: `bash spike/m2/runtime/run-probe.sh ATTEMPT_ID SCRIPT`; only sole owner provisions or executes on Android. Package selector via OLEA_PACKAGE, explicit ADB serial. Never reuse attempt IDs or overwrite evidence.
- Resource payload: `node spike/tests/m2/resources.mjs OWNED_PID,OWNED_PID android-app OUTPUT.json` in actual service runtime. Default five samples; explicit identity/subtotal limits.
- Codex no-model preflight/discovery and socket diagnostic: exact commands live in `spike/m2/codex/RUNTIME_CONTRACT.md` and `LINUX_SOCKET_ISOLATION.md`. Do not rediscover unsupported flags/config from scratch.
- Structured worker provider failure: orchestration mail may queue under Paused. Use the existing chat's actual Resume control and verify Working/new tool activity. No new session/assignment. Normal pending prerequisite asks do not need a restart or repeated waiting prompts.
- Computer use is expensive and may take focus. Use it only when the current supported CLI cannot reach a required control, as with Paused structured chat Resume. CLI terminal commands reject structured-chat handles. Load the current guide, target the exact worker workspace/chat, inspect a fresh control and verify the effect. Do not browse unrelated desktop apps. Save one concise successful recovery recipe; avoid repeated general capability/help dumps.
- The CLI has no documented structured Resume verb at Orca1.4.250. Known UI route: `file open` the worker's PLAN.md with exact `--worktree ... --focus`, choose its existing chat tab, click Resume if Paused. Verify actual worker tool activity; delivery receipt or process liveness is insufficient.

## Retained failures worth reusing

- Target36 writable-private PRoot launch failed in M1; APK native-library packaging works in M2. Do not repeat run-as and call it service proof.
- Fresh rootfs guard must fail closed with atomic mkdir; current claim-rootfs.sh covers directory/file/guard/symlink/dangling-symlink preservation. Never reset current rootfs to retest fresh provisioning.
- Native drain crash and byte-bound timeout fixes are recorded; root-only termination is not descendant cleanup.
- ADB exec-out status can mask remote permission denial. Current direct-a02 uses shell exit-aware checks; a401 bearer failure is not permission revocation acceptance.
- Windows Codex declared workspace-write did not initially activate OS sandbox; actual unelevated shell launch later failed access denied. No Android inference from either.
- Stock Codex0.167 socket root ignores TMPDIR/HOME/CODEX_HOME; restricted legacy Landlock is not a valid fallback. Mount guard failure precedes bubblewrap kernel calls; overflowuid read denial alone is not a namespace errno.
- Evidence JSON and byte-hashed exports have -text attributes. Preserve immutable bytes; never silently normalize verifier input. Older source manifests distinguish Git blob versus checkout/deployment domains.
