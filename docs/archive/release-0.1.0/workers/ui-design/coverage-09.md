# Browser scenario coverage expansion

**USER DECISION**: Fill demo scenarios using the experience-map discussion, with browser-only sample behavior. Sources: the user's request to read the discussion and continue, and [DESIGN.md](../../../../../DESIGN.md). Visual Material/UI choices continue in the separately requested session; no incidental component appearance is approved by this implementation.

**OBSERVED**: [The demo](../../../../ui/scenario-board-02.html) contains 61 repeatable entry states. Every card has a screenshot captured from the phone state, situation, test action, expected outcome and design status. Nine categories replace the previous placeholders:

| Category | Scenarios |
| --- | ---: |
| First use | 11 |
| Daily work | 10 |
| Return & navigate | 5 |
| Workspaces & files | 6 |
| Agents & providers | 6 |
| Phone access | 8 |
| Environment & recovery | 6 |
| Settings & About | 2 |
| Terminal | 7 |

**OBSERVED**: The compact D shell remains, with 74 px portrait cards and connections/branches. The full phone and external controls stay in the viewport; the map, instructions and phone content scroll internally. Category tabs show their scenario counts. The selected initial URL fragment opens its matching category; selecting another card resets the fixture while category navigation preserves the current phone state.

**OBSERVED**: New phone behavior includes guided setup, explicit agent selection, optional capability skips, setup resume within the current sample, All workspaces filtering, distinct session states, concurrent-session navigation, provisional global drawer, management/configuration, workspace/file previews, illustrative Android permission screens, environment stop/restart and scripted workspace terminals. Terminal leave, interrupt and close are separate actions. Sample commands include `pwd`, `ls`, `echo`, `clear` and `sleep 10`; commands never execute. The keyboard extra keys operate on the sample input. No real credentials are needed or stored.

**OBSERVED**: [226 bounded browser checks](../../../../ui/checks/coverage-09/checks.json) passed, covering all 61 map entries and primary actions, inline-action syntax, setup progress and explicit choice, agent locking, Done/follow-up/Stopped/Needs you, independent sessions, combined/filtered/search/empty history, quoted workspace names, drawer context, permission grant/denial, capture end, environment loss/restart without replay, launch preference, terminal workspace/session separation/interrupt/close/loss, Back/keyboard, all category screenshots and reduced motion. Five viewport checks passed: 1440×900, 1280×720, 1060×711, 800×600 and 390×844. No browser exceptions remained. [Check/capture script](check-coverage-09.mjs).

**OBSERVED**: Inspected [onboarding](../../../../ui/checks/coverage-09/setup.jpg), [combined history](../../../../ui/checks/coverage-09/history.jpg) and [terminal](../../../../ui/checks/coverage-09/terminal.jpg). Initial captures occurred mid-transition and appeared faded; capture now waits for transitions to settle. Broader action checks caught a terminal-restart button whose inline sample string contained a literal newline; replaced it with a dedicated handler and reran the full checks successfully. These were development failures, not Android/provider results.

**OPEN**: This is populated design coverage, not exhaustive completed product design. Token streaming, exact authentication differences, final menu organization, Material 3 treatment, gesture/keyboard fidelity and broader accessibility review remain. The browser keeps state only until reload; setup resume and background return are fixtures, not device persistence claims. Android system screens are illustrative and labeled simulated. External working-directory feasibility, PTY/lifecycle integration, actual process survival and exact Orca behavior remain unvalidated. No production source, Android/device mutation, provider request or framework migration was performed.
