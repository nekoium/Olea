# Experience flow content audit — first batch

**OBSERVED**: Source audit of the 61 browser scenarios across nine categories and relevant maintained Android/backend code. Scenario counts and historical browser checks do not establish journey completeness. This batch identifies concrete defects and implementation contracts to discuss before building the app experience; it is not a full runtime acceptance report.

**USER DECISION**: This session owns only `docs/ui/flow-content-audit/`. Audit content and behavior, use the existing flat-design direction, retain Kotlin + Jetpack Compose, and discuss directly with the user. No production implementation, demo changes, workers, device changes, provider requests/spending, real user-folder access, installs, publishing, messaging, or shared metadata changes. Source: this session's opening user instruction. Findings do not authorize implementation.

## Evidence and authority

**OBSERVED**: Read current [AGENTS.md](../../../AGENTS.md), [PRODUCT.md](../../../PRODUCT.md), [DESIGN.md](../../../DESIGN.md), [PROGRESS.md](../../PROGRESS.md), [scenario board](../scenario-board-02.html), [demo logic](../scenario-demo.js), and [coverage record](../../../delegations/ui-design/coverage-09.md). Maintained-source references below are observations from source, not fresh device or provider results. The workspace contains concurrent edits; they were left untouched.

**USER DECISION**: Setup comes before tasks; choose one agent explicitly; optional phone capabilities may be skipped. One agent belongs to each session. Users can leave working sessions and start others. Done means turn completion, Needs you means an explicit action requirement, Error means execution failure, and Stopped remains distinct. Source: DESIGN.md, First use, Starting and continuing conversations, and Session states and intervention. These recorded decisions govern this audit; incidental fixture behavior does not.

**OBSERVED**: PRODUCT.md still lists the all-workspace view as open, while DESIGN.md records an explicit later acceptance (“Q2 yes”). This audit follows that recorded acceptance. PROGRESS.md and older coverage prose retain superseded Material references; the latest user instruction and current PRODUCT.md/DESIGN.md establish flat design. No visual assessment is included here.

## First findings

### FC-01 — Setup can be bypassed; readiness is not agent-specific

**OBSERVED — before-build priority**. Scenarios: `welcome`, `prepare`, `choose-agent`, `agent-install-error`, `configure`, `auth-error`, `ready`, `setup-resume`, `agents`, `agent-config`, `draft`.

In `back()`, an empty navigation stack falls back to `chat`, including while onboarding. Starting at `welcome` and invoking Back produces `view=chat`, `onboarding=true`; `chat()` renders saved sample messages and the composer. `send()` checks environment availability and draft agent choice, but does not check onboarding completion or selected-agent installation/configuration. The fixture starts with `environment=true` and preexisting conversations. This undermines setup-first behavior within the reference itself.

`agents` marks Pi ready unconditionally (`i===0`) and marks whichever agent is currently selected ready, without tracking installation/readiness per agent. After choosing only Claude during setup, Pi still renders Ready. Choosing an uninstalled agent leads directly to a configuration screen; the later-agent journey has no real install step.

Maintained [Environment.kt](../../../android/app/src/main/java/dev/olea/app/Environment.kt), `prepare()`/`installPackages()`, installs stock Pi during environment preparation. [SessionStore.kt](../../../android/app/src/main/java/dev/olea/app/SessionStore.kt), initialization, creates a Default workspace and original Pi conversation. [RuntimeService.kt](../../../android/app/src/main/java/dev/olea/app/RuntimeService.kt), `maintainAgent()`, requires the runtime to be stopped and initial preparation already completed. These are current implementation differences from explicitly chosen first-agent setup, not reasons to override the user decision.

**AGENT PLAN**: Define per-agent states for absent, installing, configured, verifying, ready and failed. Require readiness for the selected agent at first send. Specify Back/exit during setup and reopen from every incomplete step. Reuse completed preparation without pretending all agent installations are complete.

**OPEN**: Which operations establish readiness, and which require provider access? A saved endpoint, installed executable, successful protocol startup and successful provider turn are different observations. No connection check should imply an unapproved provider request.

### FC-02 — Workspace tools can target a different workspace from the conversation

**OBSERVED — before-build priority**. Scenarios: `chat`, `workspaces`, `workspace-details`, `files`, `terminal`, `terminal-return`, `concurrent`.

The conversation header/details label reads `currentSession().workspace`, but files/terminal use mutable `state.workspace`. A concrete path is: open Personal conversation, go to Workspaces, select Olea, invoke Back twice. The returned conversation still belongs to Personal while `state.workspace` remains Olea. Its Terminal action therefore opens an Olea shell. The `terminal-return` fixture also seeds a Personal conversation alongside Olea workspace state.

Maintained `SessionStore` uses immutable conversation workspace IDs and generated guest paths, not display-name-derived paths. [Backend.workspace()](../../../backend/src/backend.ts) checks the saved agent/workspace identity and constrains explicit paths to the workspace root. Demo `workspacePath()` instead derives paths from labels. Sample file previews do not prove which real directory would be inspected.

**AGENT PLAN**: Resolve conversation-launched tools from conversation workspace identity; resolve workspace-launched tools from explicit workspace identity. Keep a return target independent of the current list filter. Specify duplicate names and renamed labels without implying that labels are filesystem paths.

### FC-03 — Android grants do not reconnect the pending task correctly

**OBSERVED — before-build priority**. Scenarios: `setup-access`, `phone-access`, `permission-request`, `android-permission`, `permission-denied`, `accessibility`, `revoked`, `capture-consent`, `capture-result`.

`permissionResult(true)` returns task-time grants to `phone-access`, rather than the requesting task. `permissionReturn` exists in fixture state but is not used by this handler. All denials route to `permission-denied`, whose content and retry route are hardcoded to Location. Denying Accessibility or notification special access therefore produces incorrect instructions. `revoked` concerns Accessibility, but its drawn graph edge points to the Location request; its button actually opens Accessibility.

[PhoneAccessActivity.kt](../../../android/app/src/main/java/dev/olea/app/PhoneAccessActivity.kt) refreshes actual capability status on resume and has separate system routes. [PhoneBridge.kt](../../../android/app/src/main/java/dev/olea/app/PhoneBridge.kt) has an additional phone-tools enable switch, initially disabled, independent of Android grants. Runtime STOP and any handled agent fault/exit disable this shared switch. The demo checklist omits this prerequisite and its cross-session consequences.

The maintained bridge distinguishes notification-listener access from permission for Olea to post notifications. The demo's single Notifications entry models only special access. Location grant also does not guarantee usable data: the bridge checks Android location services, can return unavailable, and supplies last-known coordinates with age/accuracy. Capture uses request identity, expiry, cancellation and asynchronous result retrieval; a successful consent is not yet a successful image or interpretation.

**AGENT PLAN**: Carry capability type, requesting conversation, pending request identity and return target through grant, denial, cancellation and resume. Recheck actual state after Android returns. Show the next explicit action without automatically repeating a phone effect. Include disabled phone tools, approximate/unavailable/stale location, capture cancellation/expiry/failure, and grant revocation.

**OPEN**: Whether permission repair resumes a waiting tool, requires a new agent instruction, or exposes an explicit retry depends on adapter support. The demo currently establishes none of these contracts.

### FC-04 — State labels have no reliable event contract; STOP is instantaneous in the sample

**OBSERVED — before-build priority**. Scenarios: `working`, `needs-you`, `done`, `stopped`, `error`, `tool-error`, `uncertain`, `history`, `environment-stop`, `environment-lost`.

The demo immediately changes Working to Stopped in `stop()`. It has no cancellation requested, acknowledgement delayed, cancellation failure or late completion path. `initialSessions()` marks a turn Done while its last message asks which area to inspect; another session is Needs you for a similar question. `answer()` can immediately mark work active without distinguishing a conversational answer from an upstream protocol response.

Maintained `RuntimeService.Display` has ready/working/opening flags and textual journals, but no durable Done/Needs you/Error/Stopped state. `cancelTurn()` explicitly waits for completion evidence. `finish()` clears working for normal and failed terminal events; it does not retain a distinct stopped outcome. Pi `agent_end`, Codex `turn/completed` and Claude `result` therefore need outcome interpretation before the proposed labels can be implemented faithfully.

Claude's [adapter](../../../backend/src/claude-session.ts), `receive()`, explicitly rejects unsupported control requests and reports `olea_interaction_required`; the Android handler adds a text line. This is not a working response control. Codex has backend approval support, but the inspected Android event handler has no approval-response UI. Broad authority remains approved; these gaps do not justify inventing mandatory approvals.

**AGENT PLAN**: Document the small event-to-state mapping for each agent, including error, cancellation and required interaction. Separate availability, turn outcome, pending action and unread content. Keep cancellation pending until evidence resolves it; preserve uncertain effects and late results.

**OPEN**: Exact upstream interactions supported by each agent and how to respond. A plain-language question alone cannot establish an upstream waiting protocol state.

### FC-05 — Independent sessions encounter an unrepresented live-session limit

**OBSERVED — before-build priority**. Scenarios: `concurrent`, `draft`, `history`, `agents`, `providers`, `expired`, `environment`.

[backend.ts](../../../backend/src/backend.ts), all three start methods, rejects a third live agent process with `session_limit`. Idle connected sessions occupy slots too; this is not a two-working-turn limit. Android exposes disconnect and an active-session count. The demo can create unlimited Working sessions and has no disconnect/capacity recovery journey.

[MainActivity.kt](../../../android/app/src/main/java/dev/olea/app/MainActivity.kt), `configure()`, requires the entire backend to be stopped before changing provider settings. Agent maintenance has a similar requirement. The demo presents reconnecting, adding agents and editing connections alongside ongoing work without acknowledging this current global interruption requirement. Its provider menu can mutate a conversation's provider while Working. Real configuration is agent-specific: Pi Chat Completions, Codex Responses and Claude Anthropic, including model ID and credentials. Shared named connections, per-session provider switching and an interactive Agent login route are not established by the inspected app. Claude additionally uses a per-session home with restricted inherited configuration, so ordinary upstream login reuse cannot be assumed.

**AGENT PLAN**: Cover capacity reached, explicit disconnect of an idle session, and preservation of its saved transcript. Explain any maintenance operation that requires stopping all sessions before the user confirms. Make supported authentication/configuration routes explicit per agent.

**OPEN**: Whether to retain the present two-live-session limit for the first app experience. No approved arbitrary concurrency level, automatic eviction, queue or provider hot-switch policy was found.

### FC-06 — Return and recovery lack draft, history and process-state boundaries

**OBSERVED — high priority**. Scenarios: `draft`, `keyboard`, `chat`, `settings`, `setup-resume`, `app-away`, `locked`, `startup-error`, `environment-lost`, `error`, `uncertain`.

`newChat()` and `openSession()` clear the draft without a decision or preservation path. New chat from the combined view silently picks Personal; explicit workspace defaults remain open. Root Back defaults to chat, even from a root history screen or incomplete setup, and every forward action pushes screen names without context snapshots. The keyboard-only Back sample does not establish root exit behavior or context restoration.

`environment-lost` seeds a Done session, while `app-away` seeds Working. Restart converts Working sessions to Error only afterward; the interrupted-turn outcome is therefore not faithfully represented at interruption entry. In the demo, `reopen()` keeps in-memory messages and no process is restarted.

Maintained `SessionStore.select()` only selects metadata; `RuntimeService.openSelected()` explicitly connects/resumes from checkpoints on Start. Saved display journals are bounded (300 lines/262144 characters), live partial text is memory-only, and canonical history can be unavailable. Missing/corrupt registry and journals have explicit source error paths not represented in the demo. `START_NOT_STICKY` is not guaranteed background restoration. Source evidence therefore supports stored conversation selection and explicit reconnect paths, not seamless recovery of every unfinished task.

**AGENT PLAN**: Define draft ownership and preservation, root/system Back behavior, and last-session versus fresh-draft entry after incomplete setup and runtime loss. Show saved-display versus canonical-history limits, interrupted partial replies, missing checkpoints, storage/save failure, explicit reconnect and no automatic replay. Treat uncertain delivery as potentially still active until reconciled; the source already retains cancellation in some uncertain cases.

### FC-07 — External-folder selection does not create or restore a workspace

**OBSERVED — high priority**. Scenarios: `setup-workspace`, `create-workspace`, `external-folder`, `folder-lost`, `workspace-details`, `files`.

The demo correctly warns that direct working-directory support is unverified. However `folder-picker` only updates a notice and navigates away. It does not register a workspace, change its identity/path, or validate that the reselected folder is the original workspace. An onboarding path through the picker can reach Ready with the fixture's old workspace. A restoration path therefore visually returns to details without establishing a restored binding.

Maintained SessionStore supports managed app-private workspaces. PhoneAccessActivity persists a document-tree grant; PhoneBridge's bounded folder tool writes/reads a synthetic file through document APIs. That is distinct from mounting an external project as the stock agent's working directory.

**USER DECISION**: Managed workspaces plus connecting existing Android folders are intended subject to feasibility, and external-folder support must be tested first. Source: DESIGN.md, Workspaces and Android folders.

**AGENT PLAN**: Keep managed workspace creation as the supported reference path. Treat external creation/restoration as conditional, with explicit cancellation, wrong-folder, access-revoked and missing-storage outcomes. Do not translate document permission success into agent workspace readiness.

### FC-08 — Seven terminal samples describe a capability larger than the maintained shell

**OBSERVED — high priority**. Scenarios: all seven `terminal*` IDs.

The demo labels commands as simulated and warns about PTY/lifecycle validation. Maintained `RuntimeService.workspace()` executes one command through the selected Pi or Codex session, makes that conversation busy and does not support Claude's separate workspace-shell RPC. It is not a workspace-owned independent PTY or persistent named shell service. Separate shell processes, resize, interactive programs, terminal input/output, shell lifetime and restoration are not established.

**USER DECISION**: Terminal functionality is requested; exact Orca-derived details remain open. Source: DESIGN.md, Terminal experience. This gap is implementation work to specify, not grounds to remove the requested capability.

**AGENT PLAN**: Before implementation, settle whether the intended first terminal is independent of agent readiness; the sample currently implies that it is. Cover no shell, creation failure, close while a command runs, input after disconnect, environment-stop effects on every workspace's shells, and process-versus-output restoration. Do not substitute the existing command dialog for the requested terminal without user agreement.

### FC-09 — Drawn connections are not executable journey coverage

**OBSERVED — high priority**. Scenarios: `configure`, `setup-workspace`, `ready`, `setup-resume`, `create-workspace`, `workspace-details`, `revoked`, `permission-request`, `capture-consent`, `capture-result`, `agent-config`, `expired`.

`journeyFlows` omits the configure-to-workspace transition, Ready's entry to Conversations, setup-resume reconnection and all retry returns in the first-use graph. It draws create-workspace to details, but `createWorkspace()` goes to filtered history. It draws revoked-to-Location while the button goes to Accessibility. Configure-to-expired is a situation change rather than a user action. Capture consent-to-result compresses an Android consent screen and asynchronous operation. Several important paths therefore require resetting to unrelated fixtures instead of continuing a journey.

Selecting a scenario calls `seed()` and resets state. The board is useful as a state inventory, but selecting adjacent cards cannot prove they are mutually reachable with the same workspace, agent, transcript and permission request.

**AGENT PLAN**: Record real trigger, source context, destination context, preserved state and failure/cancel/back route per edge. Review the full first-use and first-task path without reseeding. Keep event-triggered branches distinct from user actions.

### FC-10 — Phone permission coverage lacks the motivating user task

**OBSERVED — high priority**. Scenarios: `phone-access`, `permission-request`, `accessibility`, `capture-result`, `tool-error`, `uncertain`.

The eight access scenarios mostly demonstrate permission mechanics. They do not complete the approved motivating task: ask the agent to open a supplied URL, observe intent dispatch, inspect/qualify the outcome, return to the requesting conversation, and handle no suitable app or failed inspection. PRODUCT.md explicitly distinguishes dispatch from loaded-page success. Progress records bounded historical phone results, but those are not a demo journey or new acceptance evidence.

Other maintained bridge capabilities (notification reading, document access, cooperating apps and navigation/gestures) also lack goal-to-result paths here. Their presence in source does not independently commit every capability to release scope. A capture success fixture does not establish image attachment or model image interpretation: its return handler sets a notice, rather than appending a real transcript artifact.

**AGENT PLAN**: Add a goal-to-result coverage row for the approved URL task before expanding generic permission examples. For other capabilities, map current release requirements from PHONE_USE_TESTS.md before proposing more scenarios. Preserve distinct outcomes: action dispatched, result observed, result uncertain, unsupported capability and user declined.

**OPEN**: This batch did not audit PHONE_USE_TESTS.md or exact Orca interaction behavior. Full capability scope mapping and adoption of reference interaction details remain follow-up work.

## Inventory mapping

**OBSERVED**: Every current scenario ID is mapped below to this batch. Mapping means inspected for the cited concern; it does not mean all behavior is accepted or exhaustively audited.

| Category | Scenario IDs | Findings |
| --- | --- | --- |
| First use (11) | `welcome`, `prepare`, `setup-error`, `choose-agent`, `agent-install-error`, `configure`, `auth-error`, `setup-workspace`, `setup-access`, `ready`, `setup-resume` | FC-01, FC-03, FC-06, FC-07, FC-09 |
| Daily work (10) | `draft`, `working`, `needs-you`, `done`, `stopped`, `error`, `tool-error`, `uncertain`, `concurrent`, `keyboard` | FC-01–06, FC-10 |
| Return & navigate (5) | `chat`, `history`, `filtered`, `search`, `empty` | FC-02, FC-04–06; search/empty behavior needs deeper continuation review |
| Workspaces & files (6) | `workspaces`, `create-workspace`, `external-folder`, `workspace-details`, `files`, `folder-lost` | FC-02, FC-07, FC-09 |
| Agents & providers (6) | `drawer`, `agents`, `agent-config`, `providers`, `provider-edit`, `expired` | FC-01, FC-05, FC-09; drawer root return also FC-06 |
| Phone access (8) | `phone-access`, `permission-request`, `android-permission`, `permission-denied`, `accessibility`, `revoked`, `capture-consent`, `capture-result` | FC-03, FC-09, FC-10 |
| Environment & recovery (6) | `environment`, `environment-stop`, `startup-error`, `environment-lost`, `app-away`, `locked` | FC-04–06, FC-08 |
| Settings & About (2) | `settings`, `about` | FC-06 for launch behavior; no full license-content audit performed |
| Terminal (7) | `terminal`, `terminal-new`, `terminal-switch`, `terminal-running`, `terminal-return`, `terminal-close`, `terminal-lost` | FC-02, FC-08 |

## Bounded verification

**OBSERVED**: Ran the existing demo's function definitions in Node's VM with `render()` replaced by a no-op; omitted DOM event initialization. No dependencies, browser, shell commands from the demo, provider calls or Android operations ran. This checked state transitions and generated content, not rendered browser or Android behavior.

Confirmed 61 scenario definitions; Back from welcome reaches chat while onboarding remains true; New chat clears an unsent draft; a task-time grant returns to phone-access; Accessibility denial generates Location content; selecting only Claude still renders Pi Ready; browsing Olea then Back twice returns to a Personal conversation with Olea tool context; Stop sets Stopped immediately; environment-lost seeds Done; and the first Done fixture ends in a question. The configure-to-workspace graph edge is absent.

One initial Pi-readiness probe used an unsuitable substring and returned false; a corrected extraction of the first agent row confirmed Ready. A follow-up probe initially had a regex-escaping SyntaxError; rerunning with string splitting succeeded. These were audit-probe failures, not application failures. No retained test script or temporary files were created.

## Proposed discussion order

**AGENT PLAN**: First resolve the content contracts for setup gating, conversation/workspace identity, permission return and turn-state transitions. These directly affect the first complete task. Then settle capacity/maintenance behavior, lifecycle/drafts, external-folder limits and terminal ownership. Check the connected URL task and map broader capability requirements next.

**AGENT PLAN**: For the current two-live-session implementation, offer explicit disconnect of an idle connected session when capacity is full, preserving history; never silently evict working sessions. If both slots are working, explain the limit and let the user return to them. This is a proposal, not an approved concurrency policy or implementation authorization.

**OPEN**: User review of priorities and the capacity proposal is pending. No new product decisions have been inferred from this audit.
