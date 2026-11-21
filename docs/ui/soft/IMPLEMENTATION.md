# Soft native UI implementation plan

**AGENT PLAN**: Execution guidance for one implementation worker. The user has approved the design and requested implementation; another design-selection round is not required. Work sequentially without nested workers.

**Goal:** Rebuild Olea's native interface to match the approved Soft composition and six-palette contract across existing supported journeys.

**Architecture:** Keep Kotlin/Compose as the native presentation layer and retain existing runtime, adapter, persistence, permissions and terminal services. Introduce shared typed colors and component styles, then rebuild screen composition around those primitives. Presentation must consume actual state rather than browser sample data.

**Tech stack:** Kotlin, Jetpack Compose Foundation/UI, existing Android services, existing xterm.js/PTY terminal integration. No change to the app's identity, release version or core runtime architecture.

**Spec:** [CONTRACT.md](CONTRACT.md), [palettes.json](palettes.json), root [PRODUCT.md](../../../PRODUCT.md) and [DESIGN.md](../../../DESIGN.md).

## Constraints and review focus

- Use the leaf-green baseline from `ccabc09`; six palettes keep identical component geometry and semantic status meaning.
- Preserve the implemented broad phone-file grant and runtime bindings from #13; do not turn workspace selection back into an agent access restriction.
- Preserve saved conversations, workspace contents, credentials, draft delivery ordering, independent sessions and terminal state.
- Keep supported controls reachable even when a sample omits them. Keep real error/denial/unavailable states visible.
- No provider-backed calls, provider spending, physical-phone access, signing, release publication, GitHub writes or issue closure in this assignment.
- Do not request secrets or print local credentials into logs. Keep temporary files inside the assigned checkout.
- New palette preferences default/fallback to green and do not reset existing appearance or launch preferences.
- Review narrow screens and large text: keep actions reachable and the composer/terminal usable with the real IME.
- Review live/empty/failed data: no mock-installed agent, fake provider success, seeded conversations or permanent capture grant.

## Files and ownership

| Area | Starting files | Responsibility |
| --- | --- | --- |
| Shared native design | `android/app/src/main/java/dev/olea/app/FlatUi.kt`; optional focused UI/theme files beside it | Role-based palette, spacing, typography, shapes, reusable controls |
| App navigation/setup | `OleaApp.kt`, `MainActivity.kt` in the same directory | Navigation hierarchy, onboarding, management, actual state wiring and saved appearance |
| Conversations/files | `ConversationUi.kt` | Draft/composer, message reading, tool/intervention/outcome surfaces, contextual workspace files |
| Phone access | `PhoneAccessUi.kt`, `PhoneAccessActivity.kt` | Consistent presentation without replacing Android permission/consent authority |
| Terminal | `TerminalUi.kt`, `android/app/src/main/res/raw/terminal.html`, related existing terminal CSS | Theme roles, header/session controls, IME/extra keys; preserve PTY/transport/security |
| Verification | Focused existing Android tests; new UI tests only for costly regressions | Palette parity/persistence, state/navigation/data preservation, interaction coverage |
| Delivery | `delegations/soft-ui-rebuild/brief.md`, `result.md`, `evidence/` | Scope, coverage matrix, screenshots, actual results and deviations |

Changes outside presentation, narrowly required UI tests/build dependencies, and the bounded delivery directory need a concrete explanation. Do not modify the contract to make a mismatching implementation appear compliant.

## Task 1: Audit the native mapping and establish a checkpoint

- [ ] Read the contract and pinned reference source; inspect connected callers of current shared controls before replacing them.
- [ ] Save the received brief to `delegations/soft-ui-rebuild/brief.md`.
- [ ] Record baseline commit, current build instructions/ABI, and a 51-specimen-to-native-route/state matrix. Mark unsupported/unreachable states and native-only states explicitly.
- [ ] Inspect current state/persistence boundaries so visual work does not reset setup, send a draft twice, replay a prompt or stop a different conversation.
- [ ] Identify a clean emulator-only rendering route. Preserve user data and avoid claiming a fixture screen proves successful setup or runtime execution.

**Deliverable:** A concrete mapping and verification route before UI edits; report a real blocker, not a guessed product decision.

## Task 2: Shared design and six palettes

- [ ] Implement typed roles matching every light/dark palette in `palettes.json`, including shared error/intervention roles and terminal colors.
- [ ] Apply Soft typography, grouping and component geometry. Retain 48 dp minimum interaction targets around smaller visible controls.
- [ ] Implement Settings palette selection with six named swatches and selection semantics. Persist it independently of light/dark/system appearance and existing launch preferences.
- [ ] Use a focused parity/default/fallback/persistence check. Verify a palette change preserves the unsent draft, selected session and runtime/shell identity.
- [ ] Compare representative green/purple native surfaces to the contract before propagating the component family. Commit this meaningful checkpoint.

**Deliverable:** One coherent component system, six palettes, and saved independent theme/palette controls.

## Task 3: Rebuild the supported user journeys

- [ ] Recompose onboarding, environment preparation/install/configuration/workspace/access/ready states with real progress, retries and explicit agent/workspace selection.
- [ ] Recompose history, all-workspace and scoped lists, search/empty states and active-session navigation. A workspace opens filtered Conversations.
- [ ] Recompose draft and conversation: joined setup, fixed agent identity, readable actual replies, supported formatting, expandable real tools, Needs you and distinct Working/Done/Stopped/Error/unavailable states.
- [ ] Preserve accepted-send ordering, saved drafts on failure, cancel-turn versus STOP-all, supported upstream interactions and explicit reconnection without automatic replay.
- [ ] Recompose contextual workspace details/files/read-only preview and access-loss routes, retaining broad file access as specified by PRODUCT.md.
- [ ] Recompose menu, Agents, agent-specific Providers, Environment, Settings and About/licenses. Remove irrelevant global new-chat chrome from management forms.
- [ ] Recompose phone-access screens around real grants and service availability. Preserve skip/denial/revocation/task-return/capture-consent behavior and current broad-storage copy.
- [ ] Recompose terminal/session controls and apply terminal palette roles without weakening WebView content/security boundaries, raw input handling, resize, interrupt or copy output.
- [ ] Commit coherent groups as they become verifiable. Do not stop after recoloring a few old screens.

**Deliverable:** Complete presentation coverage for existing supported functionality, with remaining capability gaps stated explicitly.

## Task 4: Native verification and comparison

- [ ] Run relevant Kotlin/build/lint checks using the ABI actually supplied by local runtime assets. Do not package ARM64 assets as x86_64 or infer runtime acceptance from assembly alone.
- [ ] Use the explicitly selected emulator for local UI checks. No physical device or provider-backed tests are allocated. Preserve installed data; if installation/signing conflicts, use a bounded separate test route and document it rather than uninstalling the user's app.
- [ ] Capture the required representative native screens from the contract. Include real keyboard layout, scrolling/large text, state changes, six palettes, both themes, phone-access routes and terminal appearance where reachable.
- [ ] Label fixture-only renderings separately from real runtime interaction. Include build/device/ABI/palette/theme and entry method beside each evidence set.
- [ ] Compare native screenshots against the approved reference; inspect control hierarchy, joins, grouping, insets, readable content and consistency across screens.
- [ ] Run lean interaction checks for draft preservation, palette persistence, navigation/Back, permission return and terminal behavior that the changed code can affect. Keep a durable regression only where its repeated failure would be costly.
- [ ] Correct actual failures. If a check remains blocked after a focused correction attempt, preserve the failure and record its cause and next action; do not loop indefinitely or report success from a screenshot alone.

**Deliverable:** Actual build/check results plus a visual comparison and honest native/runtime limits.

## Task 5: Finish and signal review

- [ ] Save `delegations/soft-ui-rebuild/result.md` with outcome (`succeeded`, `partial`, `blocked` or `failed`), commits, coverage matrix, screenshot links, tests, failures, intentional adaptations and remaining work.
- [ ] Add only a bounded current implementation entry to `docs/PROGRESS.md`, preserving concurrent edits and the distinction between code, host checks and device results.
- [ ] Set the assigned Orca workspace to `in-review`, add a factual result/blocker comment and unread marker using its exact discovered selector.
- [ ] Follow the actual dispatch completion protocol once. Do not push, publish, sign a release, merge other branches or close issue #11.

**Deliverable:** Reviewable implementation commits and discoverable evidence. The user's approval of the design does not itself establish acceptance of the resulting native app.
