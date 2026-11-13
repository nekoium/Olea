# Demo refinement implementation

**USER DECISION**: Apply the annotated refinements to the shared browser demo. Before editing, save its current state in Git if not already saved. Source: “You should edit the demo; before that, save the current demo status in commit if not yet saved.”

## Baseline

**OBSERVED**: The demo HTML, CSS, JavaScript and `scenarios-09/` screenshot inventory were clean before editing and already committed in `5e9a938` (`Fill browser experience map with 61 interactive scenarios`). No additional baseline commit was needed. Unrelated working-tree changes were left outside this work.

## Implemented behavior

**OBSERVED**:

- Removed the bottom browser-only Back text button. The gesture indicator is centered independently of neighboring controls. Header Back behavior remains.
- Grouped Workspace and Agent inside a single outlined, rounded popup anchored 8 CSS px above the composer. It occupies an overlay layer rather than a detached layout row.
- An accepted first send retains the old popup briefly as an inert, accessibility-hidden exit layer. It fades and moves down 32 CSS px over 280 ms, then is removed. Empty input, unavailable environment and missing-agent rejection do not dismiss setup. Reduced motion removes it immediately. Session agent identity remains fixed after sending.
- Replaced the composer Keyboard control with Provider. Its nonmodal popup shows fictitious connection choices and a Manage providers route. Sample selection is retained on the session; no network request or real provider configuration occurs.
- Input focus opens the browser keyboard fixture. Escape simulates Android Back and dismisses the keyboard before leaving the conversation. The fixture retains its own Hide key; this is simulated keyboard chrome, not a composer action.
- Content enters over 240 ms, drawer over 260 ms, and sheets over 280 ms with the existing easing. Popup entry takes 260 ms. Reduced-motion support remains.
- Refreshed all 61 scenario screenshots so cards reflect the changed phone UI. Updated keyboard-scenario instructions for input focus and Escape.

## Verification

**OBSERVED**: `node --check docs/ui/scenario-demo.js` and scoped `git diff --check` passed. The deterministic headless-browser run in [check-refinements.mjs](check-refinements.mjs) passed 86 checks and regenerated all 61 screenshot cards. [Exact check results](checks/composer-refinements/checks.json).

Coverage includes popup anchoring, rejected/accepted first send, exit cleanup, agent identity, follow-up and Stop, provider selection/dismissal/management, input-focus keyboard behavior, reduced motion, all scenario entries and event-handler syntax, and viewport bounds at 1440×900, 1280×720, 1060×711, 800×600 and 390×844. Scenario cards retain their minimum 74 CSS px width. No browser exceptions were reported.

**OBSERVED**: The first anchoring assertion initially failed because it measured the popup while its entrance translation was active. The check was corrected to wait for the entrance to finish; it then passed. This was a measurement-timing error, not evidence of a layout correction.

Review captures:

- [New-session popup](checks/composer-refinements/draft.jpg)
- [Provider popup](checks/composer-refinements/provider-popup.jpg)
- [Keyboard state](checks/composer-refinements/keyboard.jpg)
- [Centered gesture indicator](checks/composer-refinements/environment-stop.jpg)

**OPEN**: The provider popup's connection-selection scope and eventual model controls remain design questions. The current popup is a browser sample, not approval of universal provider switching across agents. This work does not establish Android keyboard, accessibility, lifecycle or provider behavior. The complete historical coverage-action suite was not rerun; the focused check verifies changed behavior and entry/handler syntax across all 61 scenarios.

**OBSERVED**: Root records, shared progress metadata, branding and production code were not edited by this implementation.
