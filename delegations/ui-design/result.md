# UI design batch: persistent desktop layout

- **USER DECISION**: Use a browser-only phone demo with sample functionality. Match real phone UI, UX and motion as closely as possible as a design reference. Source: [PRODUCT.md](../../PRODUCT.md#technical-implementation-direction).
- **OBSERVED**: [Scenario board 02](../../docs/ui/scenario-board-02.html) now displays a scrollable board on the left and a large phone on the right. Scenario selection highlights its card and resets the phone while preserving both panes. Narrow screens stack the board above the phone. Instructions and study controls remain below the phone; expectations are also visible in each board card.
- **OBSERVED**: [Layout checks](../../docs/ui/checks/layout-03/checks.json) passed at 1440×1000, 1440×900, 1024×768, 768×1000 and 390×1000. Desktop checks verified that the full phone fits vertically. All seven scenario selectors, STOP, first-send agent locking and workspace filtering passed. No browser exceptions. Visually inspected [desktop draft](../../docs/ui/checks/layout-03/desktop-draft.jpg); corrected an initial layout that placed long instructions above and clipped the phone.
- **OPEN**: Phone visual polish, Material component fidelity, motion, keyboard behavior and complete scenario coverage remain for later design passes. No native app, device or provider work occurred.

---

# UI design batch: scenario board 02

Current entry point: [Scenario board 02](../../docs/ui/scenario-board-02.html). Previous walkthrough and its evidence remain preserved below.

The user requested a slice board with an expected scenario, screenshot and clickable test. Their stated reason: testers should not have to discover hidden intentions. Implemented seven explicit slices: return, new-task agent choice, tool inspection/completion, STOP, workspace selection, history search and connection loss. Each states situation, action, expected behavior and design status. Each screenshot and test button opens a repeatable starting state; instructions remain above the interactive phone, with restart and return-to-board controls.

Seven real screenshots live in `docs/ui/scenarios-02/`. [Fifteen browser checks](../../docs/ui/checks/scenarios-02/checks.json) passed using [the scenario check script](check-scenarios-02.mjs). Checks include independent slice entry, expected STOP and navigation outcomes, image loading and layout at 1440, 768 and 390 pixels. Visually reviewed desktop board, mobile instructions and a final complete workspace screenshot. Fixed clipped screenshot bottoms by capturing beyond the viewport; reloaded generated images before checking their decoding. On mobile, instructions precede the phone and require scrolling; compacting that presentation remains a possible refinement.

Only a local static design artifact and notes changed. No production implementation, device/provider work or Rim state. Current product choices remain proposals where marked; the board describes design expectations, not measured Olea capabilities. No standalone runtime/server is required. Agent/model defaults, Android keyboard/system-back behavior, full first setup and permission flows remain open.

---

# UI design batch: daily-use walkthrough 01

Status: ready for direct user feedback. The user authorized trying an experience overview plus a connected walkthrough. No approval of the entire visual design is claimed.

## Outcome and paths

- [Interactive study](../../docs/ui/daily-use-walkthrough-01.html): standalone HTML, opens directly in a browser with no server or dependencies.
- [Decision record](../../docs/ui/DESIGN_DECISIONS.md): inherited agreements, user's setup correction, approved trial workflow, provisional choices and limits.
- [Browser check script](check-walkthrough-01.mjs): focused disposable validation using the locally installed design-taste CDP helper and installed Chrome. Its helper path is machine-specific; no product dependency is added.
- [Check results](../../docs/ui/checks/daily-use-01/checks.json).
- [Overview screenshot](../../docs/ui/checks/daily-use-01/overview-desktop.jpg).

The study provides a six-screen overview, clickable experience map and connected phone simulation. It covers resuming, new conversation, setup, first send, expandable tool activity, STOP/completion, workspace-filtered history and same-session reopening. A connection-loss sketch, on-demand sample files and simulated launch preference are included. No real notes or files are accessed.

## Checks and visual assessment

Twenty headless Chrome checks passed. Agent selection exists outside the composer before sending, locks to the selected agent on send and disappears afterward. STOP retains the transcript. Workspace selection opens filtered Conversations; reopening retains the agent and stopped transcript. Connection loss does not replay. Fresh-chat preference works in simulated reopening. No horizontal overflow was detected at 1440, 768 or 390 pixels; STOP stays inside the phone frame. No browser JavaScript exceptions were observed.

Inspected desktop draft, tablet draft, mobile working and desktop overview screenshots. Separate setup controls are visible above the composer. Agent identity is fixed text during work. Six overview screens fit in a coherent two-row desktop board. The system font and inherited olive palette keep focus on flow. This is a rough interaction study; a generic welcome phrase, native selects and simplified transcript remain appropriate candidates for later refinement rather than approved production styling.

The initial check runner import used a Windows path instead of a file URL; this was corrected before the successful run. The 21st CLI was unavailable. No installation or hosted generation was attempted.

## Open choices and limitations

Fixed agent identity placement, STOP placement, workspace setup behavior after send, defaults, all-workspace history, model selection, workspace creation and exact details/file navigation remain open. First setup, Android access flows, broader recovery and proactive scenarios need later connected passes. Proactive scope remains owned by the originating functionality discussion.

Messages and tool results are illustrative and manually advanced. Sample sessions are kept only in page memory; refreshing resets them. Simulated reopening is not actual app persistence. No Android keyboard, system back, real runtime, provider, device or accessibility-service behavior is tested. No claims of implemented Olea functionality follow.

Only docs/ui/ and delegations/ui-design/ were changed. Concurrent work and shared metadata were preserved. No workers, remote operations, provider tests, production changes or device actions occurred. Rim was not used for this disposable design study. This report is a local record, not a monitoring or notification loop to another session.
