# Olea experience design

Status: current UI and user experience decision record, with a proposed coverage map. This document records agreed behavior and guides further design; it does not claim that the browser demo or Android app implements every journey.

## How to read this document

- **USER DECISION** records an explicit user choice, with its source.
- **AGENT PLAN** records a proposed design or execution detail. It is not approved product policy.
- **OBSERVED** records inspected behavior or evidence, within its stated limits.
- **OPEN** records an unresolved detail or unverified capability. Continue design with clearly identified proposals; another question round is not required by this document.

**USER DECISION**: Consolidate UI and experience decisions in root `DESIGN.md` and update the document index. Proceed with actual design without further questions. Source: the user's latest instruction, “we should record our UI and user experience decisions in a doc ... design md in project root” and “Let's do not ask questions anymore.”

[PRODUCT.md](PRODUCT.md) remains the product scope and core architecture record. This document is the consolidated UI/UX reference. Existing visual studies remain discussion evidence; their incidental details are not automatically decisions. Explicit user choices recorded here retain their authority even while another session maintains PRODUCT.md.

## Scope and references

- **USER DECISION**: Support Pi, Codex and Claude Code for the current release. Defer scheduled agent work, reminders, alarms and general personal-folder/vault cleanup workflows. Ordinary workspace-file work remains in scope. Source: [current release decisions](PRODUCT.md#shipping-today-decisions).
- **USER DECISION**: Production UI uses Kotlin + Jetpack Compose with the current browser demo’s flat design. Material Design is no longer selected. The design demo runs entirely in the browser with sample behavior. Source: [technical direction](PRODUCT.md#technical-implementation-direction) and the user's latest correction, “We don't use material design anymore, we'll use the flat design as the current demo.”
- **USER DECISION**: The demo should approximate real phone UI, UX and motion and cover the experiences encountered in current-scope use. Source: [recorded demo requirements](docs/ui/DESIGN_DECISIONS.md#prototype-framework-status).
- **OBSERVED**: [Scenario board 02](docs/ui/scenario-board-02.html) now contains 61 repeatable, screenshot-backed browser scenarios across nine categories. Former First use, Phone access and Settings placeholders have interactive sample screens. [Coverage checks](docs/ui/checks/coverage-09/checks.json) and [batch record](delegations/ui-design/coverage-09.md) state tested behavior and limits.
- **OBSERVED**: [Earlier UI decisions](docs/ui/DESIGN_DECISIONS.md) preserve visual studies, discussion history and browser-check limits. [Experience-map discussion](docs/ui/EXPERIENCE_MAP_DISCUSSION.md) preserves this session's storage investigation and decision sources.

## Navigation and entry

- **USER DECISION**: Conversations are the primary working experience. Provide parallel Conversations and Workspaces destinations. Selecting a workspace opens Conversations filtered to that workspace. User-stated reason: this keeps the current location clear. Source: [conversation-first experience](PRODUCT.md#conversation-first-experience).
- **USER DECISION**: Conversations offers both All workspaces and individual workspace filters. Show workspace names in the combined view. Source: experience-map grilling Q2 visual and the user's reply, “Q2 yes.”
- **USER DECISION**: Resume the last active session by default after setup; provide a setting to open a fresh chat instead. Source: [conversation-first experience](PRODUCT.md#conversation-first-experience).
- **USER DECISION**: Keep workspace metadata and files off the default message surface. Expose them on demand. User-stated reason: metadata should not displace conversation content. Source: PRODUCT.md, same section.
- **OPEN**: Filter placement, empty-list appearance, search presentation, list ordering and navigation/back behavior need visual design. Search exists in the demo but its exact product behavior is not an approved requirement.

## Global menu and settings

- **USER DECISION**: Treat the menu list and arrangement as a provisional working direction, not a settled design. About appears below Settings. Source: the user's latest correction, “There should be an about below the settings” and “we should not make it like a determined decision.” The user accepts using this draft for now while work moves to other experiences.
- **AGENT PLAN**: Use the top-left hamburger for an app-wide menu accessible from Conversations and Workspaces, retaining those destinations in bottom navigation. Settings is a menu item. This reflects the user's suggested arrangement but remains provisional under the correction above.
- **AGENT PLAN**: Provisional menu order: Agents, Providers, Environment, Phone access, Settings, About. Agents covers installation/readiness and agent-specific configuration; Providers covers shared connection/credential management where supported, while preserving agent-specific authentication differences. Environment covers runtime status and maintenance actions. Phone access covers capability status and Android permission routes. Settings contains app preferences. About contains version, licenses and product information. Labels, grouping and the overall arrangement remain open for refinement.
- **AGENT PLAN**: The drawer overlays the current screen. Dismissing it preserves that screen and its state. Management screens use Back to return to the prior context; opening the menu never stops ongoing sessions.
- **AGENT PLAN**: Keep workspace files, terminal sessions and workspace details accessible from the relevant workspace or conversation context. The terminal entry shows its workspace. Keep conversation-specific actions in the conversation overflow menu.
- **AGENT PLAN**: Reuse management/configuration screens during onboarding, with onboarding providing progress and next-step navigation. This replaces the earlier proposal to bury all management under Settings.
- **OPEN**: Provider configuration must reflect the actual adapters; a shared Providers screen does not promise that all agents share credentials, model options or login methods.

## First use and onboarding

- **USER DECISION**: Setup comes before running tasks. Provide onboarding rather than opening an unconfigured draft as the first-use path. User-stated reason: permissions need to be granted during setup. Source: first-round Q1/Q4 replies, “should set up first” and “we should at least provide an onboarding.”
- **USER DECISION**: Prepare the environment and configure one explicitly chosen agent before starting work. Users can explicitly skip optional phone capabilities. Source: Q7 recommendation and the user's acceptance, “Q7 can work with Users can explicitly skip capabilities.”
- **USER DECISION**: Users choose their agent and first-run setup; no automatic Pi/default-workspace policy. Source: [current release decisions](PRODUCT.md#shipping-today-decisions).
- **AGENT PLAN**: Organize onboarding around environment preparation, chosen-agent installation/configuration, workspace setup, phone-access checklist and a readiness summary. Exact ordering and screen grouping remain design proposals.
- **AGENT PLAN**: Each step shows its state and a concrete next action. Preserve completed setup when the user leaves Olea or returns from Android settings. Include interrupted downloads, installation failures, authentication failures, denial and retry in the design.
- **AGENT PLAN**: The phone-access checklist explains each capability and offers its Android grant route or an explicit skip action. Request screen-capture consent when a capture is needed; do not imply a permanent capture grant.
- **OPEN**: Exact required checks for agent readiness, authentication variants, setup-resume behavior and the initial workspace choice need design and implementation validation.

## Workspaces and Android folders

- **USER DECISION**: Support creating an Olea-managed workspace and connecting an existing Android folder, subject to technical feasibility. Source: Q3 reply, “yes, but ... make sure that is possible, technically.”
- **USER DECISION**: Test direct external-folder workspaces before treating them as supported. The intended storage volume is primary shared storage, `/storage/emulated/0`, rather than specifically a removable SD card. Source: latest folder clarification, “What I meant is just that emulated 0” and “we should test if this is possible first.”
- **USER DECISION**: If validated, offer to create a visible Olea folder in shared storage rather than create it silently; permit an existing-folder choice. Source: Q8 recommendation and the user's “Q8 Yes” acceptance, conditional on testing.
- **AGENT PLAN**: Assess `/storage/emulated/0/Olea` as the suggested location. Keep Linux, installed tools and credentials in app-private storage. A more specific location may be used; exact path and default remain proposals.
- **OBSERVED**: At this session's inspection, the runtime binds app-private workspace files into Linux. The Android folder picker grants document-API access, not an ordinary working directory automatically available to stock agents. See [bounded findings](docs/ui/EXPERIENCE_MAP_DISCUSSION.md#storage-findings).
- **OPEN**: Direct external workspace feasibility remains unverified. Validate normal user-granted access, runtime bindings, backend path resolution, reading/writing and filesystem compatibility before presenting it as ready. Shared-storage project execution, symlinks and dependency installation require separate checks from note editing.
- **AGENT PLAN**: Design separate states for available, access revoked, missing folder and unavailable storage. Preserve saved conversations while explaining how to restore workspace access.

## Starting and continuing conversations

- **USER DECISION**: One agent belongs to each session. Start a new session to use another agent; no agent hot-swap or handoff requirement. Source: [conversation-first experience](PRODUCT.md#conversation-first-experience).
- **USER DECISION**: Open new-conversation drafts directly. Place setup controls separately above the composer; do not require a pre-compose setup sheet for each new conversation. Agent selection appears only before the first send and is separate from the new-chat action. User-stated reason: make the fixed-agent restriction intuitive. Source: [annotated setup direction](docs/ui/DESIGN_DECISIONS.md#new-conversation-setup-user-direction). This applies after onboarding and does not reverse setup-first entry.
- **USER DECISION**: Users can leave a working conversation, browse another workspace and start another session without stopping the first. Source: Q5 reply, “Yes, sure.” This establishes independent session interaction, not guaranteed execution through Android process death.
- **AGENT PLAN**: Keep agent identity visible after the first send. Use consistent session-state indicators in conversation lists and the active conversation, with a route back to sessions needing attention.
- **OPEN**: Exact identity placement, model selection/configuration, workspace controls after sending, unsent-draft behavior, attachments and detailed message/tool presentation remain to be designed. Do not infer support for new message types from this coverage list.

## Session states and intervention

- **USER DECISION**: Refer to Orca's Needs you, Working, Done and Error categories. Source: Q6 reply, “We can refer to how orca achieves that.” This approves the reference and categories, not an uninspected copy of Orca behavior.
- **USER DECISION**: Done means the agent finished its turn; it does not certify that the user's task succeeded. Needs you indicates an explicit response/action requirement; Working indicates active execution; Error indicates execution failure. Preserve Stopped as a visible outcome distinct from successful completion. Source: Q9 recommendation and the user's “Q9 yes.”
- **USER DECISION**: Provide STOP and saved conversation continuation. Source: [maintained core deliverable](PRODUCT.md#maintained-core-decision).
- **AGENT PLAN**: Keep required agent questions, choices and other upstream interactions in context in the conversation. Use a suitable response control and distinguish waiting from active execution. Exact interaction placement remains a proposal; Q6 selected the Orca reference rather than approving every earlier presentation suggestion.
- **USER DECISION**: Broad execution authority remains the intended default. Supporting upstream-required interactions does not establish mandatory Olea approval prompts. Source: [execution stance](PRODUCT.md#audience-and-execution-stance) and [foundation responsibilities](PRODUCT.md#future-reusable-foundation-olearia).
- **OPEN**: Inspect Orca's relevant interaction behavior before adopting details. Distinguish agent turn state from environment availability, connectivity and unread replies. Draft/idle presentation and STOP transition details need design.

## Phone access and recovery

- **USER DECISION**: Phone capabilities use permissions and special access a user can normally grant on stock Android. Accessibility and capture have distinct enablement/consent routes. Source: [phone-use boundaries](PRODUCT.md#phone-use-scenario-and-approaches).
- **AGENT PLAN**: Map the journey from a task needing access through explanation, Android UI, grant/denial and return to the same conversation. Include capabilities skipped during onboarding and grants revoked later.
- **AGENT PLAN**: Preserve messages and distinguish a failed reply, uncertain tool outcome, unavailable environment and missing permission. Propose recovery actions appropriate to each state; do not claim that retry or replay policies have already been settled.
- **OBSERVED**: The browser demo sketches connection loss without automatic replay. This is simulated design evidence, not verified provider or Android recovery.
- **OPEN**: App switching, keyboard/system Back, lock/unlock, process interruption, relaunch and environment restart need full visual coverage and bounded technical validation. No universal background-survival promise is established.

## Terminal experience

- **USER DECISION**: Include terminal functionality with a Termux-like phone interface and Orca-like terminal functionality. Source: the user's experience-coverage follow-up, “we need a terminal functionality looking like termux's UI, but is actually like Orca's terminal functionalities.” This is a newly requested experience; it is not evidence of implemented terminal support.
- **OPEN**: The user's sentence ends with “and also in accordance with”; no additional constraint can be inferred from that unfinished phrase. Exact Orca behavior must be inspected before adopting details.
- **AGENT PLAN**: Provide a workspace-scoped terminal surface available on demand, preserving Conversations as the primary destination. Use a phone-friendly terminal viewport, keyboard-aware layout, selectable/copyable output and an extra-key row for controls such as Esc, Ctrl, Tab and arrows. Treat exact controls and placement as visual proposals.
- **AGENT PLAN**: Explore multiple named terminal sessions per workspace, creating/selecting a session, interrupting a foreground command, closing a session and returning to chat while retaining the terminal process when the environment remains alive. Closing the terminal view, interrupting a command and ending a shell must have distinct behavior. Verify the Orca reference before choosing final session controls.
- **OPEN**: Real terminal support requires a PTY, input/output transport, resize handling, terminal emulation and Android lifecycle integration. The browser demo can simulate these experiences but cannot validate them. Neither terminal scrollback restoration nor a restored screen proves a shell survived process death.

## Experience-map structure

- **USER DECISION**: Use option D: categorized journey rows, connected flows and branches within rows. Source: [selected study](docs/ui/experience-map-options-06.html#hybrid) and [product record](PRODUCT.md#technical-implementation-direction).
- **USER DECISION**: Keep the review page in one viewport, with the board left and the full phone and demo controls right on desktop. Scroll inside content regions. Use portrait scenario cards and maximize visible coverage without shrinking cards below their existing size. Source: [recorded layout decisions](docs/ui/DESIGN_DECISIONS.md#prototype-framework-status).
- **USER DECISION**: Every scenario exposes its situation, screenshot, test action and expected outcome, with repeatable interactive entry. User-stated reason: testers should not have to discover hidden design intentions. Source: [scenario-board correction](docs/ui/DESIGN_DECISIONS.md#scenario-board-user-workflow-correction).

## Proposed full coverage map

**AGENT PLAN**: Use the following inventory to expand the actual design. These rows identify work to design; they do not make every listed interaction a supported product feature. Preserve existing demo scenarios while adding or revising coverage.

| Journey area | States and branches to design | Current evidence / limit |
| --- | --- | --- |
| First use | Welcome, explicit agent choice, environment preparation, install/configure, workspace choice, capability checklist, ready | Interactive onboarding samples, including explicit optional skips; exact visual design remains provisional |
| Setup recovery | Download/install/configuration failure, leaving setup, returning from Android, retry, resume completed steps | Repeatable failures/retry and in-memory setup resume; no persistence across browser reload |
| New conversation | Empty draft, workspace and agent choices, first send, fixed identity, later follow-up | Interactive sample enforces explicit agent choice and locks it after first send |
| Agent configuration | Pi/Codex/Claude setup variants, credentials/authentication, readiness, adding another agent later | Sample management, agent-specific explanatory copy and connection failure/repair; actual adapter authentication variants need refinement |
| Working | Streaming response, tool activity/detail, navigation away, another active session, return | Tool activity, concurrent-session navigation and state samples; token streaming still needs design |
| Needs you | Agent question/choice, required upstream interaction, phone-access action, answer and resume | In-context question/response sample; exact Orca interaction details remain uninspected |
| Outcomes | Turn done, follow-up, STOP, error, tool failure or uncertain result | Distinct Done/Stopped/Error, tool failure and uncertain-result samples; proposed recovery actions are explicit |
| Find and return | All workspaces, one-workspace filter, saved-session selection, empty lists, search proposal | Combined and filtered history, workspace labels, search and empty-state samples |
| Workspace management | Managed workspace, existing folder, optional shared Olea folder, details/files, lost access | Managed creation, proposed Android folder picker, files, details and lost-access samples; external working-directory feasibility remains open |
| Phone access | Onboarding checklist, grant, explicit skip, task-time need, denial, revocation, return from settings, capture consent | Interactive checklist, location grant/denial, Accessibility/notification settings routes, revocation and capture-consent samples; system UI is illustrative |
| Lifecycle and recovery | App switching, active-session return, lock/unlock, process interruption, runtime restart, saved messages | Sample app switching, lock/unlock, startup failure, runtime loss/restart and environment shutdown; native guarantees remain unverified |
| Settings | Launch preference, agent configuration, environment status/actions, capability review | App preference and About/license screens plus separate management screens; menu grouping remains provisional |
| Terminal | Workspace entry, shell creation/switching, command input/output, keyboard and extra keys, interrupt, leave/return, close, environment loss | Seven terminal scenarios with scripted commands, separate shells and interruption/closure; no PTY or native lifecycle validation |
| Phone interaction quality | Keyboard open/close, system Back, sheets/dialogs, loading/empty/error states, scrolling, accessibility and motion | Sample keyboard, Back, drawer/sheet transitions and reduced-motion support; Material styling, real keyboard/gesture fidelity and full accessibility review remain pending |

## Next design work

**OBSERVED**: The first coverage expansion is implemented in the browser reference. Reviewable screenshot cards and repeatable states now cover the areas above. This is a coverage pass, not approval of incidental layouts or proof of complete native behavior.

**USER DECISION**: Discard the former Material design studies and their folder. Use the current browser demo as the baseline style for a fresh interface-design discussion. Source: the user's instruction, “The former material design session is considered less fit for our product, and we can ditch that design and the folder, use our demo as the base style.” The user's subsequent clarification also supersedes the Material 3 design-system choice: use the current demo’s flat design. Kotlin + Jetpack Compose remains the implementation toolkit.

**AGENT PLAN**: Keep the new session's interface studies and decision notes under `docs/ui/interface-design/`. Refine the current demo style with the user; do not import the discarded studies. Preserve the distinction between approved behavior and proposed placement/appearance.

**AGENT PLAN**: Keep external-folder testing separate from simulated UI behavior. Until a test establishes support, demo any proposed folder flow as a design scenario with its feasibility limit visible in the review instructions.

**OPEN**: This is a complete inventory of the currently identified gaps, not a completed screen design or exhaustive proof of coverage. Update it as actual design reveals further current-scope states.
