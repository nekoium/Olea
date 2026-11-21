# UI design batch: compact journey layout

- **USER DECISION**: Tighten spacing and the phone column to show more cards without shrinking them. Source: the user's latest density correction, recorded in [UI notes](../../../../ui/DESIGN_DECISIONS.md#prototype-framework-status).
- **OBSERVED**: Card width remains 74 px. Main/return flows now occupy 438/206 px and pack beside each other where space permits. The phone column follows viewport height rather than taking nearly half the page. [Measurements](../../../../ui/checks/density-08/checks.json) cover six viewport sizes. All seven scenarios are fully visible at the four checked desktop sizes, including 1229×711 and 1060×711; smaller screens use internal map scrolling. [Inspected reference](../../../../ui/checks/density-08/1229x711.jpg).
- **OBSERVED**: Coordinate-based clicks selected all seven scenarios and activated scaled-phone STOP at 1229×711. An additional 2458×1422 viewport check passed. No browser exceptions were observed.

---

# UI design batch: categorized journey flows

- **USER DECISION**: Apply option D to the demo: journey rows with connected flows and branches. Source: [PRODUCT.md](../../../../../PRODUCT.md#technical-implementation-direction), recording the user's explicit selection.
- **OBSERVED**: Updated [the interactive demo](../../../../ui/scenario-board-02.html) with category tabs, branching Daily work flows and Return & navigate rows. Selecting a scenario resets the interactive phone; switching categories preserves it. Undesigned coverage uses labeled placeholders. The page remains one viewport with scrolling inside the map and content regions.
- **OBSERVED**: [Checks](../../../../ui/checks/journey-07/checks.json) passed at 1440×900, 1280×720, 1060×711, 800×600 and 390×844, with all seven selectors, agent locking, STOP, workspace filtering and coverage tabs. [Desktop screenshot](../../../../ui/checks/journey-07/desktop.jpg) was visually inspected.
- **OPEN**: First-use sequence, component/motion fidelity and remaining coverage need discussion. React/TypeScript/Vite remains a recommendation; this update uses existing HTML/CSS/JavaScript. No production Android changes or provider requests occurred.

---

# UI design batch: portrait scenario tiles

- **USER DECISION**: Scenario cards follow the portrait phone screenshot rather than a landscape container with blank side space. Source: the user's latest UI correction, “The card should just be a phone screen.”
- **OBSERVED**: Removed padded, column-stretched wrappers and fixed-height thumbnail boxes. Tiles now use the screenshot's 390:748 aspect ratio, a short caption below and selection border on the screen. The grid packs fixed-width tiles without stretching them.
- **OBSERVED**: [Portrait checks](../../../../ui/checks/portrait-05/checks.json) cover screenshot proportions, full phone/control visibility and viewport fit at four sizes, plus card selection. [Desktop screenshot](../../../../ui/checks/portrait-05/desktop.jpg).

---

# UI design batch: viewport fit and compact scenario overview

- **USER DECISION**: Fit the review shell within one viewport without page scrolling. The phone and demo controls must be visible together. Present scenarios as concise cards for an immediate overview, with content scrolling inside regions. Source: the user's correction, recorded in [PRODUCT.md](../../../../../PRODUCT.md#technical-implementation-direction).
- **OBSERVED**: The root shell now uses the available viewport height with no minimum page height. Compact screenshot cards replace the verbose list; full instructions appear only in the selected-scenario panel. The phone is a fixed 390×780 canvas scaled to its stage, with a persistent toolbar above it.
- **OBSERVED**: [Viewport checks](../../../../ui/checks/viewport-04/checks.json) passed at eight sizes from 390×844 through 1920×1080, including 1060×711, 1280×720 and 1024×600. Assertions verify root dimensions and full bounds of phone, controls and instructions. All seven card selections, STOP and first-send agent locking passed without browser exceptions. Visually inspected [1280×720 overview](../../../../ui/checks/viewport-04/desktop.jpg).
- **OBSERVED**: An initial responsive check found inherited grid columns placing the phone beyond the right edge at 1060×711. The layout now explicitly resets those columns; the full viewport matrix passed afterward. The previous layout-03 checks did not establish the user's page-scroll/control-visibility requirement; their historical results remain below.
- **OPEN**: Material fidelity, motion and complete experience coverage remain for later passes. No real runtime functionality is connected.

---

# UI design batch: persistent desktop layout

- **USER DECISION**: Use a browser-only phone demo with sample functionality. Match real phone UI, UX and motion as closely as possible as a design reference. Source: [PRODUCT.md](../../../../../PRODUCT.md#technical-implementation-direction).
- **OBSERVED**: [Scenario board 02](../../../../ui/scenario-board-02.html) now displays a scrollable board on the left and a large phone on the right. Scenario selection highlights its card and resets the phone while preserving both panes. Narrow screens stack the board above the phone. Instructions and study controls remain below the phone; expectations are also visible in each board card.
- **OBSERVED**: [Layout checks](../../../../ui/checks/layout-03/checks.json) passed at 1440×1000, 1440×900, 1024×768, 768×1000 and 390×1000. Desktop checks verified that the full phone fits vertically. All seven scenario selectors, STOP, first-send agent locking and workspace filtering passed. No browser exceptions. Visually inspected [desktop draft](../../../../ui/checks/layout-03/desktop-draft.jpg); corrected an initial layout that placed long instructions above and clipped the phone.
- **OPEN**: Phone visual polish, Material component fidelity, motion, keyboard behavior and complete scenario coverage remain for later design passes. No native app, device or provider work occurred.

---

# UI design batch: scenario board 02

Current entry point: [Scenario board 02](../../../../ui/scenario-board-02.html). Previous walkthrough and its evidence remain preserved below.

The user requested a slice board with an expected scenario, screenshot and clickable test. Their stated reason: testers should not have to discover hidden intentions. Implemented seven explicit slices: return, new-task agent choice, tool inspection/completion, STOP, workspace selection, history search and connection loss. Each states situation, action, expected behavior and design status. Each screenshot and test button opens a repeatable starting state; instructions remain above the interactive phone, with restart and return-to-board controls.

Seven real screenshots live in `docs/ui/scenarios-02/`. [Fifteen browser checks](../../../../ui/checks/scenarios-02/checks.json) passed using [the scenario check script](check-scenarios-02.mjs). Checks include independent slice entry, expected STOP and navigation outcomes, image loading and layout at 1440, 768 and 390 pixels. Visually reviewed desktop board, mobile instructions and a final complete workspace screenshot. Fixed clipped screenshot bottoms by capturing beyond the viewport; reloaded generated images before checking their decoding. On mobile, instructions precede the phone and require scrolling; compacting that presentation remains a possible refinement.

Only a local static design artifact and notes changed. No production implementation, device/provider work or Rim state. Current product choices remain proposals where marked; the board describes design expectations, not measured Olea capabilities. No standalone runtime/server is required. Agent/model defaults, Android keyboard/system-back behavior, full first setup and permission flows remain open.

---

# UI design batch: daily-use walkthrough 01

Status: ready for direct user feedback. The user authorized trying an experience overview plus a connected walkthrough. No approval of the entire visual design is claimed.

## Outcome and paths

- [Interactive study](../../../../ui/daily-use-walkthrough-01.html): standalone HTML, opens directly in a browser with no server or dependencies.
- [Decision record](../../../../ui/DESIGN_DECISIONS.md): inherited agreements, user's setup correction, approved trial workflow, provisional choices and limits.
- [Browser check script](check-walkthrough-01.mjs): focused disposable validation using the locally installed design-taste CDP helper and installed Chrome. Its helper path is machine-specific; no product dependency is added.
- [Check results](../../../../ui/checks/daily-use-01/checks.json).
- [Overview screenshot](../../../../ui/checks/daily-use-01/overview-desktop.jpg).

The study provides a six-screen overview, clickable experience map and connected phone simulation. It covers resuming, new conversation, setup, first send, expandable tool activity, STOP/completion, workspace-filtered history and same-session reopening. A connection-loss sketch, on-demand sample files and simulated launch preference are included. No real notes or files are accessed.

## Checks and visual assessment

Twenty headless Chrome checks passed. Agent selection exists outside the composer before sending, locks to the selected agent on send and disappears afterward. STOP retains the transcript. Workspace selection opens filtered Conversations; reopening retains the agent and stopped transcript. Connection loss does not replay. Fresh-chat preference works in simulated reopening. No horizontal overflow was detected at 1440, 768 or 390 pixels; STOP stays inside the phone frame. No browser JavaScript exceptions were observed.

Inspected desktop draft, tablet draft, mobile working and desktop overview screenshots. Separate setup controls are visible above the composer. Agent identity is fixed text during work. Six overview screens fit in a coherent two-row desktop board. The system font and inherited olive palette keep focus on flow. This is a rough interaction study; a generic welcome phrase, native selects and simplified transcript remain appropriate candidates for later refinement rather than approved production styling.

The initial check runner import used a Windows path instead of a file URL; this was corrected before the successful run. The 21st CLI was unavailable. No installation or hosted generation was attempted.

## Open choices and limitations

Fixed agent identity placement, STOP placement, workspace setup behavior after send, defaults, all-workspace history, model selection, workspace creation and exact details/file navigation remain open. First setup, Android access flows, broader recovery and proactive scenarios need later connected passes. Proactive scope remains owned by the originating functionality discussion.

Messages and tool results are illustrative and manually advanced. Sample sessions are kept only in page memory; refreshing resets them. Simulated reopening is not actual app persistence. No Android keyboard, system back, real runtime, provider, device or accessibility-service behavior is tested. No claims of implemented Olea functionality follow.

Only docs/ui/ and delegations/ui-design/ were changed. Concurrent work and shared metadata were preserved. No workers, remote operations, provider tests, production changes or device actions occurred. Rim was not used for this disposable design study. This report is a local record, not a monitoring or notification loop to another session.
