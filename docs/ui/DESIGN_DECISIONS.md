# Olea UI design decisions

Status: interactive UI discussion. This file preserves inherited agreements and separates them from proposals. The user approved trying a connected walkthrough with an experience overview; the draft layouts remain subject to feedback.

## Inherited agreements

| Agreement | Saved visual reference | Explicit recorded reason |
| --- | --- | --- |
| Conversations are primary; use parallel Conversations / Workspaces destinations. Workspace selection opens filtered Conversations. | [Navigation study 03, A](../../.superpowers/brainstorm/9291-1794303031/content/workspace-navigation.html) | The current location stays clear; hierarchical candidate B risks users getting lost. |
| Resume the last active session by default; provide a fresh-chat setting. | [Launch study 02, B and C](../../.superpowers/brainstorm/9291-1794303031/content/launch-behavior.html) | Existing-chat and fresh-chat designs suit continuation and new tasks respectively; users should choose their entry preference. |
| Hide workspace metadata and files from the default message surface; expose them on demand. | [Navigation study 03](../../.superpowers/brainstorm/9291-1794303031/content/workspace-navigation.html) | Metadata must not push conversation content down. |
| One agent per session; start another session for another agent. | [Agent ownership study 04, A](../../.superpowers/brainstorm/9291-1794303031/content/agent-ownership.html) | Starting a new session already serves the need, as in Orca. Handoff candidate B was rejected. |

Source of inherited status and reasons: PRODUCT.md and docs/UI_DESIGN_HANDOFF.md. These studies are discussion artifacts, not product implementation. Some older studies show agent-switch controls or other details superseded by later agreements; preserve the explicit decisions above rather than adopting every mockup detail.

## New-conversation setup: user direction

Visual reference: [Interaction study 05](../../.superpowers/brainstorm/9291-1794303031/content/new-conversation-setup-05.html), together with the user's annotated screenshot supplied in this discussion. The screenshot crosses out candidate B's setup sheet and the controls inside candidate A's composer, and sketches controls above the composer. The screenshot is available in the conversation; a separate local image copy has not been saved.

- **User-selected direction:** open the draft directly, with setup controls visually separate above the message composer. Do not require candidate B's setup sheet.
- **User requirement:** agent selection appears only before sending the first message. Do not make agent selection and starting a new chat share a control or imply they are the same action.
- **User-stated reason:** agents cannot be hot-swapped within a session; the interface should communicate that restriction intuitively.
- **Still open:** exact appearance of the separate setup area, where the fixed agent identity appears after sending, and workspace-control behavior after sending.
- Sample Pi/Olea selections establish no defaults.

[Daily-use walkthrough 01](daily-use-walkthrough-01.html) now depicts the user's correction: separate setup controls above the composer, with agent selection removed after the first send. Fixed agent identity under the title and removal of workspace setup after sending remain assistant proposals.

## Design workflow discussion

The user wants to choose how we design the full experience before continuing individual screen decisions. They suggested seeing the whole flow together and giving feedback as one possible method, not as an approved workflow.

The user approved trying the proposed workflow: an experience overview plus a connected daily-use walkthrough, followed by feedback and focused revisions. This approves a design exercise, not production implementation or all provisional details.

[Daily-use walkthrough 01](daily-use-walkthrough-01.html) includes an experience map, six-screen overview and interactive prototype. The main path covers resuming a conversation, starting a task, first-turn setup, sending, tool activity, stopping/completing, choosing a workspace and reopening history. First setup, phone access, broader recovery and requested proactive work are marked as areas to explore. A connection-loss sketch and simulated launch preference are included.

Provisional details: fixed agent text under the title; STOP in the send position; both setup controls leave after sending; a workspace-filtered history without an all-workspace option in this pass. Sample Pi/Personal selections, model behavior and workspace defaults are not decisions.

## Scenario board: user workflow correction

The user requested a slice board showing each expected scenario with a screenshot and a clickable test. Their stated reason: making testers discover hidden design intentions is a hassle. Future slices must state the situation, test action and expected result explicitly.

[Scenario board 02](scenario-board-02.html) is the current discussion entry point. Its current layout follows option D, documented under Prototype framework status below. The original version replaced the unlabeled screen overview with seven scenario slices and actual screenshots captured from the prototype. Each screenshot and “Try this scenario” button opens a repeatable starting state. Situation, action, expected behavior and design status remain visible above the interactive phone. Restart and return-to-board controls support reviewing slices independently. This changes the review method; it does not approve new product scope or provisional layouts.

[Scenario checks](checks/scenarios-02/checks.json): 15 browser checks passed, covering deterministic slice entry after unrelated interactions, STOP outcome, workspace filtering, saved-session search/reopening, loaded screenshots and horizontal layout at 1440/768/390. Inspected desktop board, mobile instructions and a final complete phone screenshot. An initial screenshot capture clipped the phone bottom outside the browser viewport; capture was corrected to include the full phone and checks rerun. Initial missing-image caching during screenshot creation was resolved by reloading before image checks.

### Selected production UI toolkit: Android-first, iOS optional

- **USER DECISION**: Kotlin + Jetpack Compose + Material 3 is selected for the production Android UI. Source: [PRODUCT.md, Technical implementation direction](../../PRODUCT.md#technical-implementation-direction), recording the user's confirmation in the continued UI discussion.
- **USER DECISION**: iOS is a future possibility, not a required target. Source: the user's earlier clarification, “A future possibility, and not a must.”
- **OPEN**: Detailed UX, component versions and expressive component choices remain unsettled. The design demo is browser-only; selecting the production toolkit does not authorize a production migration in this design discussion.

The following comparison preserves the earlier recommendation's engineering reasoning; it is not additional user-stated rationale.

- Kotlin is the app's existing Android language and aligns directly with Android APIs, lifecycle, services and the maintained core.
- Jetpack Compose is Android's recommended, active UI direction. Google's current Compose-first guidance says Android UI tooling, APIs and guidance focus on Compose; legacy Views remain supported but are in maintenance mode.
- Material 3 for Compose is the direct Android implementation path for Material components and behavior. Use stable Material 3 APIs for product UI; evaluate newer expressive APIs against stability and design needs instead of equating newest with best.
- Flutter and Dart are also mature choices. Flutter offers a shared rendering/UI framework and Material-style widgets. Choosing Flutter still leaves Kotlin for the Android host/platform integrations; a hypothetical iOS target would also need Apple-specific integration. It is a stronger choice if shared Android+iOS UI becomes an actual goal.
- A polished interface does not come automatically from a framework. Olea needs its own design system, interaction rules, content hierarchy, motion/accessibility patterns and tested implementation. Material 3 can be a foundation, not a mandate to ship default-looking screens.

**OBSERVED**: This was initially a recommendation. The user's subsequent confirmation selects the toolkit, as recorded above; production implementation has not begun in this UI discussion.

Sources: [Android's Compose-first guidance](https://developer.android.com/blog/posts/android-ui-development-is-compose-first); [Compose and Material 3](https://developer.android.com/compose); [Flutter platform integration](https://docs.flutter.dev/platform-integration/platform-channels).
The user asked why Compose over Flutter, whether iOS should influence the decision, and whether Kotlin should be replaced by Dart. The comparison below is historical discussion context; the current decision is Kotlin + Jetpack Compose + Material 3, with iOS optional.

### First distinguish UI portability from product portability

Olea's approved Android architecture runs upstream Linux agents in packaged Linux/PRoot, with a Kotlin host, a shared Node backend and Android permissions/services. A Flutter UI would not port this runtime automatically; it would still call native Kotlin on Android and require native Swift/Objective-C implementations for iOS services.

There is a more fundamental iOS question: Apple App Store Guideline 2.5.2 says apps should be self-contained and may not download, install or execute code that introduces or changes app features. Olea's intended user-installed, upstream-updateable agent CLIs are executable code, so the current Android local-runtime model faces a serious policy/platform barrier on iOS. The educational coding-app exception is narrow and is not an assumed route for Olea. This needs product/legal feasibility investigation before promising iOS parity. A companion that connects to a separately hosted agent could be a different product, but would not meet the approved phone-independent local-execution purpose.

Source: [Apple App Review Guidelines, 2.5.2](https://developer.apple.com/app-store/review/guidelines/#software-requirements). The same restriction appears in the official guideline text fetched for this discussion. This is a substantial risk, not a definitive legal ruling on every possible Olea design.

### Comparison

| Option | Android | iOS | Main benefit | Main cost / fit |
| --- | --- | --- | --- | --- |
| **Jetpack Compose + SwiftUI** | Native Kotlin/Android APIs | Native Swift/Apple APIs | Best platform-native UX and system integration; each UI uses its platform conventions | Two presentation implementations. Kotlin business/domain logic can be shared selectively with KMP, but Swift interop/build tooling adds cost. Does not solve iOS agent-execution policy. |
| **Flutter (Dart UI) + native bridges** | Flutter-rendered UI; Kotlin still implements Android services/runtime host | Flutter-rendered UI; Swift still implements Apple services | One shared UI and visual behavior; fast consistent cross-platform iteration | Dart replaces the UI layer, not Kotlin's Android responsibilities or Linux runtime. Native plugins/bridges and two-platform QA remain. Platform-native behavior may require platform-specific work. |
| **Compose Multiplatform + Kotlin** | Jetpack/Compose UI | Shared Compose UI rendered on iOS, with Swift/native integration where needed | Reuses Kotlin UI plus some logic; avoids switching UI language to Dart | iOS still requires Apple-specific integration. Shared Compose UI may not match native iOS conventions; does not solve runtime policy. |
| **Keep Android native now; revisit iOS after feasibility** | Compose or current Android UI | No iOS commitment yet | Lowest immediate architecture disruption; validate the core product constraints first | Later cross-platform work may duplicate or reorganize UI/domain code. |

Flutter officially supports platform-specific code through Android Kotlin/Java and iOS Swift/Objective-C. Its current docs also describe generated typed/native interop options; those reduce bridge boilerplate but do not eliminate platform-specific implementations. Source: [Flutter platform integration](https://docs.flutter.dev/platform-integration/platform-channels).

Jetpack Compose is the Android-specific toolkit and keeps Android code in Kotlin. Compose Multiplatform is a separate option for sharing Compose UI with iOS; choosing Jetpack Compose alone does not provide iOS UI portability. Source: [Jetpack Compose](https://developer.android.com/compose) and [Compose Multiplatform](https://kotlinlang.org/compose-multiplatform/).

### Earlier conditional recommendation (historical)

- If Olea is **Android-first and iOS is only a possibility**, do not change Kotlin to Dart now. Keep Android's platform host in Kotlin, choose the UI after the iOS target is clarified, and avoid introducing Flutter solely for hypothetical reuse.
- If Olea will ship **equivalent Android and iOS interfaces**, choose between Flutter and native UIs based on whether consistent shared UI or platform-native interaction matters more. Flutter is a coherent one-UI choice, but Kotlin must remain for Android authority and Swift will still be needed on iOS. Do not describe this as replacing the app stack with Dart.
- If the team specifically wants **Kotlin across both UI targets**, assess Compose Multiplatform as a third route; its iOS support does not remove native integration or Apple's runtime restrictions.
- In every case, settle whether iOS is intended to run agents locally, offer a reduced companion, or is merely a future exploration before selecting for cross-platform UI.

The earlier Compose recommendation assumed Android-only scope. It was too early to recommend Compose as final source of truth without first resolving the possible iOS target and its compatibility with Olea's core purpose.

No production source or shared product documents were changed. This session records UI options only; functionality scope and release placement remain with the originating discussion.

## Prototype framework status

- **USER DECISION**: Use option D: categories organize journey rows, with connected flows and branches inside each row. Source: the user's selection, “D is dope. Let's go D and update the demo.” [Selected layout study](experience-map-options-06.html#hybrid).
- **OBSERVED**: The [interactive demo](scenario-board-02.html) now uses D. Daily work and Return & navigate contain clickable scenario flows; First use, Phone access and Settings show proposed coverage marked Needs design. Switching categories preserves the phone state; selecting a scenario resets it. The phone, external controls and selected instructions remain visible while the map scrolls internally. [Checks](checks/journey-07/checks.json) cover five viewport sizes, all seven selectors, agent locking, STOP, workspace filtering and coverage tabs. [Desktop reference](checks/journey-07/desktop.jpg).
- **OPEN**: React + TypeScript + Vite was recommended for a larger demo but has not been selected. This update retains HTML/CSS/JavaScript and the existing simulated behavior.

- **OBSERVED**: [Scenario board 02](scenario-board-02.html) fills one viewport with a compact screenshot-card grid on the left and the phone plus demo controls on the right. Only the card grid, selected instructions and phone content scroll. The phone uses a fixed 390×780 design canvas scaled proportionally to its available stage with ResizeObserver, so its bottom and controls remain visible on resize.
- **USER DECISION**: Scenario cards should follow the portrait phone screenshot, without landscape card containers or blank side padding. Source: the user's correction, “The card should just be a phone screen.”
- **OBSERVED**: The overview uses screenshot-width portrait tiles with short captions underneath. Screenshot aspect ratio is preserved, fixed-height image boxes and padded landscape wrappers are removed, and the selection border follows the screenshot. [Portrait checks](checks/portrait-05/checks.json).
- **USER DECISION**: The page itself must not scroll. Show the full phone and its demo controls together. Scenario cards should provide an at-a-glance overview; detailed instructions belong to the selected scenario. Source: [PRODUCT.md](../../PRODUCT.md#technical-implementation-direction), recording the user's correction after reviewing the prior layout.
- **OBSERVED**: [Viewport checks](checks/viewport-04/checks.json) cover eight sizes, including 1060×711, 1280×720, 1024×600 and 640×480. Checks assert root dimensions and bounds for the phone, controls and instructions, plus scenario selection, STOP and agent locking. The earlier layout-03 checks did not cover the page-scroll/control-visibility requirement and did not establish that it fit the user's screen.
- **USER DECISION**: On a landscape desktop page, place the board on the left and a large phone on the right. Each slice exposes the situation, screenshot, action and expected outcome. Source: the user's scenario-board and desktop-layout instructions in this UI discussion.
- **USER DECISION**: The demo should represent real phone interface and animation behavior and cover all interfaces and scenarios encountered in real app use. Source: the user's demo-framework requirements. This states the target, not current coverage or permission to add undecided product capabilities.
- **USER DECISION**: Use a browser-only phone demo with sample behavior, without an emulator/device connection or real functionality. UI, UX and motion should approximate real phone use closely enough to serve as a design reference. Source: [PRODUCT.md, Technical implementation direction](../../PRODUCT.md#technical-implementation-direction), recording the user's clarification.
- **AGENT PLAN**: Continue using the existing HTML/CSS/JavaScript demo. Refine phone components, navigation and motion in later discussion; the current change establishes the desktop arrangement. The prior proposal to embed native Compose via an emulator is superseded.
- **OPEN**: Full experience coverage, including first setup, agent/provider configuration, permissions, settings, failure/recovery and Android system transitions, remains to be mapped against current product scope.

## Other unresolved choices

Agent, model and workspace default policies; workspace creation; whether Conversations includes an all-workspace view; detailed conversation controls and tool-activity presentation; phone motion and interaction fidelity.

Requested personal-agent scenarios remain subject to the originating session's functionality/priority discussion. No dedicated schedule, cleanup or vault interface is approved here.

## Walkthrough 01 review and limits

Read the handoff, current AGENTS.md, core handoff, all listed product documents and source HTML for all five inherited visual references.

Twenty focused browser checks passed using installed headless Chrome, including first-send agent locking, STOP, tool expansion, workspace filtering, saved-session navigation, connection loss without replay, simulated fresh-chat opening and horizontal layout at 1440, 768 and 390 pixels. [Check results](checks/daily-use-01/checks.json). Screenshots inspected: desktop and tablet draft, mobile working state and desktop overview. The layout is readable with separate setup controls; the six-screen board exposes the main path together. Remaining limits: no Android keyboard/system-back checks, no device behavior, no runtime/provider actions, no cross-reload persistence and no final visual polish. Long real transcripts and model selection remain unexplored.

Only UI-owned artifacts were created. Concurrent source/build changes were preserved. Rim was not used because these are disposable discussion artifacts, not development changes. The 21st CLI was unavailable; no install or hosted generation was attempted. Existing project palette and system typography were retained to focus this pass on workflow.
