# Soft UI and palette contract

Status: **USER DECISION — approved visual contract for Olea's Android interface**. Implementation and native acceptance are not yet established.

## Approval and authority

**USER DECISION**: Adopt the current Soft UI and palette design, save it as official contract documentation, and delegate a worker to rebuild the interface accordingly. Source: issue #11 discussion, “Great, great. That will be our design … save that UI and palette design as official contract docs … delegate another worker … update the interface from ground up … in accordance with … our design principles and guidelines.”

**USER DECISION**: Keep Soft's composition, typography, spacing, rounded shapes and quiet hierarchy across every palette. Default to Olea green; offer six coordinated palettes. Refine only green away from excessive yellow toward leaf green, retaining subtle warmth. Sources: the user's consecutive palette instructions in issue #11; most recent correction, “the warm one was too yellow … still wanted … green … Just The green one.”

**OBSERVED**: Approved visual baseline is commit `ccabc097222eae1f3713d3602c9c23598470f2c0`. Its parent palette exploration is preserved at `6efb50e`. The current leaf green, not the earlier yellow olive or cyan-leaning green, is the implementation reference.

Read alongside [PRODUCT.md](../../../PRODUCT.md) and [DESIGN.md](../../../DESIGN.md). This contract supersedes older visual styling instructions for the native UI, including scenario board 02's previous control appearance. Product behavior and Android capability boundaries retain their existing authority. Approval of a simulated screen does not prove an integration works or authorize unrelated capabilities.

## Reference package

- [Approved experience board](../../discussions/issue-11/mood.html): 51 screen/state specimens in nine journeys; open a card to inspect its phone preview.
- [Screen implementation](../../discussions/issue-11/mood-prototypes.js) and [visual rules](../../discussions/issue-11/mood-prototypes.css) at the pinned baseline: exact browser composition and measurements.
- [Journey inventory](../../discussions/issue-11/soft-flow.js): screen IDs, branches, state notes and limits.
- [Palette contract](palettes.json): authoritative native color-role values, independent of subsequent discussion-board changes.
- [Approved board overview](reference/experience-board.jpg) and [palette picker](reference/palette-options.jpg).
- [Implementation plan](IMPLEMENTATION.md): **AGENT PLAN**, execution sequence and verification, subordinate to this contract.

**OBSERVED**: Browser dimensions are 390 × 844 CSS pixels. These are design measurements; screenshots include simulated system chrome. Use the exact baseline commit if discussion artifacts later change. A local preview can be started with `node docs/discussions/issue-11/server.cjs` and opened at `http://127.0.0.1:4181/mood.html`.

## Design principles

**USER DECISION — adopted reference principles**, by the approval above:

1. Conversations carry the work. Give replies and the composer priority over navigation, settings and metadata.
2. Use flat, quiet fills with soft rectangular geometry. Separate content through grouping, whitespace and restrained tone changes. Do not enclose every row and action in an outlined box.
3. Keep navigation visually secondary. Avoid filled, full-width destination buttons competing with the main task. Management screens show relevant Back navigation rather than an unrelated global new-chat action.
4. Group an object's identity, state and action together. In Agents, installation/configuration belongs to the corresponding agent row or group.
5. Use one clear primary action for the current task. Secondary and contextual actions use lighter treatments. Disabled, selected, waiting and failed states must remain distinguishable.
6. Keep a readable, restrained type hierarchy. Body text, headings, supporting labels and technical output have distinct roles; redundant page titles and long notices must not dominate routine work.
7. Match shape, spacing, typography and semantic meaning across palettes and themes. A palette changes color roles, not the information architecture or component family.
8. Use gentle status colors with explicit words and actions. The palette must not change the meaning of Error, Needs you, Working, Done or Stopped.
9. Keep details on demand: tool output, workspace files, diagnostics and advanced configuration should not occupy the default conversation surface.
10. Support unobtrusive motion and reduced motion. Joining draft setup to the composer and removing it after the accepted first send should feel continuous.

**USER DECISION — typography update**: Use Cabin as the native Soft UI typeface. Source: issue #11 font-comparison discussion, “I think cabin is great. Let's delegate a worker to make this change to app.” This supersedes the initial native system-sans substitution below. Use the approved Cabin files and SIL Open Font License from `docs/discussions/issue-11/fonts/cabin/`; preserve monospace for terminal/code and Android fallback for scripts Cabin does not cover. Selection follows the browser comparison at `docs/discussions/issue-11/font-comparison.html`.

## Layout, typography and components

**OBSERVED — approved reference measurements**: The following are extracted from the approved browser reference. They define the starting composition and visual proportions for native implementation.

| Element | Reference |
| --- | --- |
| Standard content inset | 25 px horizontally; 14 px initial top padding |
| Header | 68 px minimum, 23 px side insets; title 16 px semibold, subtitle 11 px |
| Management heading | 29 px semibold; line height 1.2; slight negative tracking |
| Conversation body | 14 px; line height 1.8; assistant content directly on the surface |
| Reply heading | 19 px semibold, with deliberate separation from body |
| Supporting text | 11–13 px; muted role; maintain readable contrast |
| User message | 14 px, line height 1.6; 14 × 16 px padding; 23 px left inset; asymmetric 22/22/5/22 px corners |
| Groups/cards | Paper fill, 18 px corners, 17 px padding; selection outline only where meaningful |
| Standard row | 16 px vertical spacing; fine separator where needed; 14 px main text, 11 px supporting text |
| Primary action | 14 px corners, minimum 46 px visual height, 13 px semibold text |
| Inputs | Paper fill, 12 px corners, minimum 46 px visual height; labels 12 px |
| Composer | 18 px outer horizontal margin, 16 px inner padding, 24 px corners |
| Draft setup | Joined upper composer extension; 23 px upper corners; no detached selector bar |
| Send | Compact circular control, 34 px visual diameter |
| Bottom destinations | Quiet icon-and-label controls; subtle soft-fill selection; 53 px visual region |
| Notices | 16 px corners/padding; concise state, consequence and next action |
| Tool summary | Paper fill, 13 px corners, 14 px padding, 11 px summary; technical detail in monospace |
| Sheets | Bottom anchored, 27 px upper corners, handle and clear dismissal |
| Terminal | Dedicated dark surface, 12 px monospace at 1.9 line height; themed prompts, extra keys and notices |

**AGENT PLAN — Android translation**: Use Kotlin/Jetpack Compose, mapping spacing and shapes to dp and text to sp. Preserve proportions while responding to native font scaling, screen size and insets. Touch targets must be at least 48 dp even when the visible icon is smaller. Browser system bars, gesture indicators and keyboard are not app widgets to copy onto Android.

**OBSERVED — superseded initial adaptation**: The browser originally used `Trebuchet MS`, then `Segoe UI`, then Arial/sans-serif. Trebuchet is not bundled or licensed for distribution by this reference. **AGENT PLAN**: Start with available native sans-serif typography and compare its character against the reference; use a properly licensed font only if necessary. Record a material font substitution and its visual effect. Do not silently claim pixel-identical font rendering.

**AGENT PLAN**: Carry forward the existing nonintrusive motion direction: approximately 240 ms content, 260 ms overlays and 280 ms sheets/setup exit, with smooth deceleration and a reduced-motion route. These timings are implementation guidance, not a claim that the static Soft specimens demonstrate every animation.

## Palette contract

**USER DECISION**: Provide Olea green, Soft purple, Dusty blue, Rosewood, Ochre and Graphite, with light/dark variants. Olea green is the default. The six palettes share one design system.

| Stable ID | Label | Character | Light accent | Dark accent |
| --- | --- | --- | --- | --- |
| `green` | Olea green | Leaf green, subtly warm | `#4f653b` | `#bed29b` |
| `purple` | Soft purple | Quiet lavender | `#66518a` | `#ccbaea` |
| `blue` | Dusty blue | Soft cornflower | `#50668c` | `#b3c7eb` |
| `rose` | Rosewood | Muted rose and plum | `#88566b` | `#e0b4c6` |
| `ochre` | Ochre | Old gold and parchment | `#80612c` | `#dfc68f` |
| `graphite` | Graphite | Warm stone and charcoal | `#64615c` | `#d0cabe` |

Use all roles from [palettes.json](palettes.json): background, paper, ink, muted text, lines, accent, soft fill, keyboard-preview colors, terminal background/text/accent/muted/keys/notices and shared semantic colors. Do not implement a palette by replacing only the button color. Light mode and dark mode are independent of palette choice.

Settings provides the six options in a compact two-column grid with names, swatches and a selected indication. Persist the palette independently of appearance and session data. A fresh preference defaults to green; existing sessions, credentials, files and launch preferences survive the migration. Invalid/unknown palette values fall back to green. Choosing a palette should not restart the runtime or lose a draft.

The board selector and app preview use the same registry. For native implementation, this JSON is the contractual source; derive typed Kotlin roles from it or translate them faithfully with a focused parity check. Record intentional platform-specific differences rather than silently changing the contract.

**OBSERVED**: Reference checks cover representative browser layouts and shared text-color contrast pairs at 4.5:1 or better. This is not a full accessibility audit or Android acceptance. Keep text labels for status, expose selection semantics and support system font scaling, readable focus and screen-reader names. Do not use palette color alone to communicate state.

## Experience coverage and required behavior

**USER DECISION**: Rebuild the interface across the approved experience design, not just a themed conversation screen. Retain the product's supported functionality while replacing the old visual composition. Source: the current instruction to update the interface “from ground up” in accordance with this design.

| Journey | Reference states | Native acceptance focus |
| --- | --- | --- |
| First use | Welcome, explicit agent choice, environment preparation, interrupted setup, agent installation, provider configuration | Show real readiness/progress/error data; keep selections and retry states; never auto-select Pi from a mockup |
| Finish setup | Workspace choice, optional access review/skip, readiness | Setup precedes tasks; phone capabilities remain individually optional; use actual workspace creation/connection behavior |
| Start | History, search, empty list, draft, agent/workspace choices, keyboard | Workspace filtering; explicit first-send choices; fixed agent after first send; preserved draft and keyboard-aware layout |
| Agent work | Working, expanded tools, Needs you, Done, Stopped, reply error | Readable real replies, supported formatting, selectable text, tool details and real response controls; no new mandatory approval policy |
| Return/recovery | Concurrent sessions, conversation details, unavailable runtime, reconnect, global stop | Navigation preserves work; Done is turn completion; stopped/failed differ; no automatic prompt replay or background-survival claim |
| Workspaces/files | Lists, creation, connected folder, details, file list/preview, lost access | Workspaces organize work, not agent reach; contextual files and terminal; actual Android broad-file grant behavior from PRODUCT.md wins over older scoped-folder wording in specimens |
| Management | Menu, Agents, Providers, connection editor, Environment, Settings, About | Contextual actions, actual adapter-specific auth/model controls, diagnostics on demand, saved theme/palette, real version/licenses |
| Phone access | Capability checklist, Accessibility, task-time request, denial, screen-capture request | Native Android routes and consent, explicit tool enablement, real status refresh and return to task; no fabricated system-grant screens |
| Terminal | Open shell, switch shells, running command, close confirmation, disconnected shell | Real PTY/output/input/resize; keyboard and extra keys; distinguish leaving a view, interrupting a command and closing a shell |

**OPEN / implementation mapping**: The board has 51 specimens, not 51 independent destinations. Several are states or overlays of one surface. A supported behavior not represented in the samples still needs a coherent Soft treatment; do not delete it to match an incomplete sample.

## Interpretation boundaries

- **USER DECISION**: This approval authorizes the UI redesign and six-palette presentation. It does not expand model/provider spending, phone permissions, scheduling, lifecycle recovery or publication scope.
- **AGENT PLAN**: Adapt exact mock controls when actual agent APIs differ. For example, a composer model label is not proof that all adapters can hot-switch providers/models; route to real supported configuration instead of faking selection.
- **OBSERVED**: Samples use illustrative installed agents, saved messages, progress and file contents. Do not ship those as native production state or infer default agent/workspace policy from them.
- **OBSERVED**: Keyboard and Android grant screens in browser references are samples. Native acceptance must use real system UI and insets.
- **OPEN**: Any technical capability not already established remains a capability question; record an implementation gap without substituting a success state.
- **AGENT PLAN**: Preserve current broad phone-file access work and existing security/data boundaries. Rebuilding presentation is not a backend rewrite, data migration, new permission policy or license change.

## Acceptance evidence

**AGENT PLAN**: The implementation worker records:

1. A route/state mapping from the 51 reference specimens to actual native surfaces, noting unsupported/unreachable states explicitly.
2. Screenshots of onboarding, draft with keyboard, conversation/tool output, intervention/error, history, workspace/files, management/settings, phone access and terminal. Each capture identifies build, device, palette, theme and entry method; fixture-only rendering is labeled.
3. Side-by-side comparison of representative native screens and the approved reference, with deviations explained. Verify geometry on a narrow phone and enlarged text, not only an empty desktop preview.
4. Six-palette parity, default/invalid preference behavior, persistence, light/dark/system appearance, accessible touch targets, and no lost draft/session on appearance change.
5. Focused build/lint/UI/interaction checks for changed code. Report the actual result of every required check; a generated APK is not a passing device test.
6. No regression of send/cancel/STOP, saved-session navigation, terminal operation, real permissions or broad file access. Provider-backed checks require separate explicit allocation; use deterministic checks and honest limits meanwhile.

A contract approval is not an implementation completion report. Keep issue #11 open until the resulting native work has been assessed.
