# Maintained Olea core: approved design and builder handoff

Status: user-approved direction and autonomous core-building assignment. This supersedes the discussion-only execution hold for the newly launched core-building manager only. The originating session remains available for discussion and does not supervise a worker loop.

## Decision and purpose

The user approved settling a maintained core around the demonstrated runtime route: maintain the Android runtime and Olea integrations, while installing and updating stock agents through upstream-supported channels. Existing evidence is sufficient to build against this route. It is not universal compatibility or production-readiness evidence.

User's reason for establishing the core now: fixes need a persistent project implementation to apply to. Shift effort from repeated hypothetical feasibility demonstrations to building, finding concrete failures, fixing them, and verifying the fixes.

## Approaches and selected design

Selected: selectively reuse working spike components in one maintained application. A wholesale rewrite would discard useful working code; promoting the whole spike would carry experiment machinery into the product. These tradeoffs were proposed by the assistant and accepted by the user.

| Component | Settled responsibility |
| --- | --- |
| Kotlin Android host | App lifecycle, permissions, native phone capabilities, runtime supervision, user STOP |
| Packaged conventional Linux through PRoot | Upstream agents, dependencies, shell tools and workspace execution |
| One shared TypeScript/Node backend | Persistent agent processes while running, adapters, session events, cancellation and Android communication |
| Stock-agent adapters | Supported upstream protocols and extension APIs; no private agent forks |
| Persistent user storage | Workspace, agent homes, conversations and credentials kept independent of replaceable runtime components |

Build Olea first; Olearia extraction remains after 1.0.0. Production UI framework remains open. The builder may choose the minimum presentation needed for the working core, recording the choice as an implementation decision without reopening agreed navigation or claiming approval of a full production UX.

## First deliverable and completion

Produce a plain installable app supporting:

1. Install and open Olea without a desktop, root or active ADB connection in normal use.
2. Prepare or start its packaged environment, with visible progress and actionable failures.
3. Open a stock Pi conversation and send a message.
4. See streaming replies and tool activity; complete a representative workspace tool action.
5. Stop execution through a user-accessible control.
6. Reopen the app and continue the saved conversation without losing workspace files.

Pi is the first complete path. Preserve and accommodate the existing Codex adapter; a complete Codex product path and authenticated Claude support are not prerequisites for this first core. Full release goals remain in PRODUCT.md and ROADMAP.md.

Done means maintained source, a locally built APK, ordinary source-based build/use instructions, and bounded verification of the available steps. If frozen provider spending blocks live message verification, report that exact unverified step; do not substitute mock output or claim the full workflow passed. Fix concrete implementation failures within this scope. Do not expand into an indefinite test campaign or broader product implementation.

## Test and worker lifetimes

User's maintenance workflow: find a bug, reproduce it, find a fix, verify that the fix works, then finish. Temporary diagnostics and their workers have finite lifetimes. Preserve useful diagnosis and evidence; diagnostics do not automatically become permanent acceptance tests.

Retain a small number of cheap checks where recurrence is costly, especially data preservation and permission/STOP behavior. This exception was proposed and accepted. Do not require the historical 112-case matrix to become all green. Commission a new feasibility experiment only for a specific uncertainty capable of changing the chosen route.

The manager retains implementation context and integration ownership. It may build directly or commission a worker for one bounded feature, bug or verification. Workers retire after their result is saved and integrated. Independent verification is used when it adds value, not as a standing team role. One temporary owner controls shared-device mutation at a time.

## Authority, concurrency and limits

The user explicitly authorized a new manager to finish core building autonomously, optionally using workers. Launch a normal Pi manager in the SAME existing root `C:/Users/Aria/Projects/Development/Olea`, repository `d55c3648-a5ff-4d7b-96d8-e80071701415`. Do not create a duplicate root, clone, register another repository or create a supervised manager task/Run merely to hand off.

The builder may edit maintained source, prepare dependencies, build, run targeted deterministic checks and perform bounded local emulator validation necessary for this core. After launch the new builder manager owns the core implementation lane and may establish its own sole device ownership after inspecting actual state. It may delegate device ownership to one named worker, but must relinquish its own concurrent mutation authority. No historical runtime lease is inherited. If another current owner is found, resolve ownership before mutation. The originating discussion session performs no device work.

The remaining historical provider-test allowance is FROZEN: 9 authorized / 1 consumed / 8 unallocated in M5; historical consumption 9, cumulative 10. This assignment does not refresh, allocate or authorize spending that allowance. No provider-backed test prompts, retries, fallback or replay until the user explicitly allocates them. Coding-agent work and optional coding workers are authorized; they are distinct from provider-backed tests run by Olea. Build and deterministic verification should proceed independently of that missing allocation.

No remote/clone/register/tracker/push/publish or destructive cleanup. Preserve root parallel user tabs and `docs/feasibility/PRODUCT_DECISION_BRIEF.html`. Preserve valuable worktrees/data/APKs/rootfs/cache/evidence. Cleanup is separately authorized, but requires preserving unique work, ignored assets and notes first. Never print credentials or include them in reports, Git, argv, prompts or logs. Existing credential source is local ignored `.setup/android-test-provider.local.json`; no access is necessary until authorized provider testing.

Do not overwrite concurrent product-discussion edits. Reread shared documents before targeted changes. This manager's outputs belong in maintained source and core build records; update product decisions only when agreed or clearly label implementation choices and proposals.

## Evidence and source map

Read PRODUCT.md, ROADMAP.md, PROGRESS.md, TECH_STACK.md and PHONE_USE_TESTS.md. Then read the final settlement in `docs/feasibility/M5_WAITING_BUILDER_HANDOFF.md` as history, not an instruction to wait again. Use narrow references rather than revalidating all historical artifacts.

Candidate reuse points:

- `spike/android/app/src/main/java/dev/olea/spike/`: RuntimeService.kt, OwnedProcess.kt, PhoneApis.kt, PhoneAccessibility.kt and MainActivity.kt. Separate runtime/product behavior from RuntimeProbe.kt and fixture-driven experiment control.
- `spike/android/app/src/modern/AndroidManifest.xml` and Android Gradle files: modern-target packaging; inspect before selecting maintained packaging and application identity. Do not overwrite or uninstall existing evidence apps/data.
- `spike/backend/src/`: server.ts, backend.ts, pi-process.ts, process-tree.ts, codex-process.ts, codex-session.ts and phone-mcp.ts; `spike/backend/extensions/phone.ts` uses supported Pi extension APIs.
- `spike/runtime/`, `spike/m2/`, `spike/m3/`, `spike/m4/`, `spike/m5/`: retained packaging, provisioning, supervision and compatibility evidence. Inspect relevant sources before reuse; preserve provenance and third-party licenses.

Known limits: original canonical preservation FAIL from a retained 599-byte append; across-APK protected equality missing; cleanup observations finite; Pi capture returns metadata, not image pixels; Codex full-access provides no same-UID filesystem/credential isolation; authenticated Claude and physical Android14/ABI/ARM64 remain unproved. Wider lifecycle, interrupted update, resources, battery and heat remain open. Fix core-relevant failures without hiding historical outcomes.

M5 model runtime1bd511e/rootb4b5892 and correction1de6f4a/rootebb1dda are saved; final batch NOT independently assessed. Historical final device receipt is disabled/noinflight, not a current-state query. Explicit worker release JSON is absent; outgoing manager revoked the precise runtime assignment after confirmed stop. No old owner may resume by inference.

Cleanup receipt from the originating discussion: clean `m5-pi-independent` checkout removed; branch `nekoium/m5-pi-independent` retained at2a61603. Other four children retained: M4 ignored caches/setup, M5 runtime untracked pause note/setup, and M3 damaged registration. Do not force-remove them.

## Implementation plan

The builder chooses exact new maintained paths after inspecting existing code; do not invent a general framework. Keep experiment history in place and record the chosen file map before source changes.

- [ ] Inspect working sources and packaging; identify reusable components, required repairs and maintained paths. Use local Git checkpoints and Rim when available and safe; never hide existing changes.
- [ ] Establish the maintained app/environment path using the demonstrated modern-target packaging. Build an installable local APK and verify ordinary launch/start/stop deterministically before agent work.
- [ ] Connect the single backend and stock Pi adapter to minimal conversation presentation. Preserve session IDs and workspace ownership; bound output and handle process failure without uncertain automatic replay.
- [ ] Implement saved conversation reopening and persistent user-data boundaries. Reproduce concrete persistence/STOP failures with small focused checks, repair them, and record results.
- [ ] Follow APP -> CONTAINER -> STOCK AGENTS -> PHONE -> OPTIONAL ECOSYSTEM when validating dependencies. Reuse existing evidence. First-core Pi path does not require reinstalling agents or repeating phone tasks across every adapter. Optional ecosystem is outside this assignment.
- [ ] Complete permitted deterministic and bounded emulator validation. Stop short of provider-backed submission without a new allocation. Write a concise completion record with APK/source location, what works, what remains unverified and concrete blockers. Keep public README focused on product installation/use; put contributor checks and internal evidence elsewhere.
- [ ] Save meaningful local commits. Finish the bounded assignment; do not automatically launch another milestone, manager or standing worker team. Retire only exact owned workers after their work is durable, preserving their valuable data.

No active monitoring or reply is required from the originating discussion session. The builder should record progress and completion locally and remain available for later user interaction. This handoff does not close the originating session.
