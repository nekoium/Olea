# Issue #11 — UI discussion brief

**OBSERVED**: Read-only GitHub fetch found [#11, Overall UI enhancement](https://github.com/nekoium/Olea/issues/11) open, labeled `Priority: T1` and `Scope: design`, with body “Currently too ugly.” There are no comments or attached examples. This brief prepares discussion; it does not resolve the issue.

## Discussion opener

**AGENT PLAN — suggested wording**:

> We already have a visual direction worth keeping: flat green surfaces, soft corners, minimal approachable icons, gentle status colors, light/dark themes and unobtrusive motion. Conversations stay central, with workspace details available on demand.
>
> The native app still differs from that reference. Navigation and Provider use large outlined buttons, replies use plain text even for structured agent output, and new-chat setup disappears without the demo's slide transition. These give us concrete starting points without replacing the established style.
>
> Looking at the existing screens, which part most needs to feel better first: reading and replying in a conversation, finding conversations/workspaces, or setup and management?

**OPEN**: Ask that single scope question first. It changes which screen receives the first visual candidates. Do not interpret T1 as approval of a redesign or a feature list.

**AGENT PLAN**: If the user delegates prioritization, recommend the conversation surface first: message readability, composer/action hierarchy and status/tool presentation. Then show two comparable candidates using the same conversation and both themes: close adherence to the demo, and a quieter control arrangement within the same style. Neither candidate is selected or implemented here.

## Existing decisions to carry forward

- **USER DECISION**: Scenario board 02 is the production interface/functionality reference; retain its design language while completing flows. Source: [PRODUCT.md, Release 0.1.0](../../../PRODUCT.md#release-010).
- **USER DECISION**: Flat surfaces, softened corners, green palette, minimal approachable icons and present-but-unobtrusive motion are retained. Transitions should be slightly slower. Source: [annotated refinements](../../ui/interface-design/REFINEMENTS.md#retained-visual-character). Exact icon geometry and timing remain proposals.
- **USER DECISION**: Join workspace/agent setup to the composer, soften alerts/actions, style selection controls consistently and provide dark theme. Source: [gentle theme decisions](../../ui/interface-design/GENTLE_THEME.md#user-decisions). Exact current color values are not separately approved.
- **USER DECISION**: Derive refinement from the demo and discard unrelated external references. Source: [current direction](../../ui/interface-design/DIRECTION.md). Do not introduce a new design system through this issue.
- **USER DECISION**: Conversation-first navigation, parallel Conversations/Workspaces, fixed agent per session, workspace details on demand, and visual candidates for interface decisions. Source: [PRODUCT.md, Conversation-first experience](../../../PRODUCT.md#conversation-first-experience), alongside [DESIGN.md](../../../DESIGN.md). Do not reopen these choices casually.

## Evidence-backed starting points

| Evidence | OBSERVED | AGENT PLAN / OPEN |
| --- | --- | --- |
| [FlatUi.kt](../../../android/app/src/main/java/dev/olea/app/FlatUi.kt), `Action`, and [OleaApp.kt](../../../android/app/src/main/java/dev/olea/app/OleaApp.kt), bottom navigation | All nonprimary `Action` controls receive a 1 dp outline and minimum 48 dp height. Bottom destinations use `Action`; Provider uses it too. The existing native release capture shows outlined Provider and large outlined/filled bottom destinations; the browser conversation uses transparent text destinations. | Review visual weight and hierarchy while preserving touch targets. This is design drift, not proof of broken interaction. |
| [ConversationUi.kt](../../../android/app/src/main/java/dev/olea/app/ConversationUi.kt), `MessageEntry` | Assistant replies render through `Label`/`BasicText`; tool details alone get a monospace expansion. [Release UI report](../../releases/0.1.0-ui.md) explicitly records no Markdown renderer. | Preview a long reply containing headings, lists and code to settle reading needs. Markdown/code formatting is proposed scope, not an existing approval. |
| Same file, `ConversationScreen`; [demo CSS](../../ui/scenario-demo.css), `.sessionSetup.leaving` | Native setup is conditionally present only while `draft`; no setup-exit animation is present there. Demo has a 280 ms slide exit. The native joined extension and typing area also each round their adjoining corners. | Refine the joined edge and first-send transition in visual candidates. Do not claim runtime jank from code inspection. |
| [FlatUi.kt](../../../android/app/src/main/java/dev/olea/app/FlatUi.kt), `Chip` | Native chips special-case Error/Failed; other states share panel/muted colors. Demo styles Working, Needs you and Stopped separately. State words remain visible natively. | Explore restrained state distinction without relying on color alone. Keep Done distinct from task success. |
| [ConversationUi.kt](../../../android/app/src/main/java/dev/olea/app/ConversationUi.kt), composer; [OleaApp.kt](../../../android/app/src/main/java/dev/olea/app/OleaApp.kt), provider callback | Composer says “Provider ⌄” but routes to full provider configuration; that screen can require stopping the environment. Previous design notes leave provider/model-selection meaning open. | Ask only if composer scope is selected: should this remain configuration access, or become a supported current-agent provider/model chooser? This would change behavior and needs a decision. |

**OBSERVED**: Source facts above are current inspection, not device validation. Saved native capture `.setup/release-010/canceled-screen.png` shows a release-era conversation with sample test text; browser reference images are simulated fixtures. The much older `.setup/consolidation/final-open.png` shows a superseded button-grid UI and is deliberately excluded from comparison. None proves the exact screen the user disliked.

## Visual companion and limits

**OBSERVED**: [Evidence board](evidence.html) places existing light/dark conversation and draft reference images beside the existing release capture. It contains no invented redesign. Native image is local/ignored and will not travel with a clean checkout; tracked browser references remain available.

**OPEN**: No current-device screenshot, keyboard behavior, frame timing, live responsiveness, full accessibility audit or current installed-APK parity was checked. Issue #14's responsiveness/folder-edit reproduction belongs to its assigned worker; this brief makes no diagnosis of it.

**OBSERVED**: No phone/device access, shared build, provider call, dependency installation, production edit or GitHub write was performed. The `21st` executable was unavailable, so no deterministic 21st review was run; source/screenshot inspection supports only the bounded claims above. No automated product tests are warranted for these discussion-only files.

**AGENT PLAN**: Keep this worker available for direct issue #11 discussion. Record subsequent choices here as provisional discussion notes with user wording; the manager records approved decisions centrally. No implementation or issue closure follows from this brief alone.
