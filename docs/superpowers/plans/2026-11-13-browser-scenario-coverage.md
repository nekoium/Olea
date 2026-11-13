# Browser scenario coverage implementation plan

**AGENT PLAN**: Implement the user's request to fill the browser demo from the experience-map discussion. Authority: `DESIGN.md` and the user's instruction to proceed without further questions.

**Goal:** Replace empty coverage areas with repeatable, screenshot-backed interactive scenarios across the currently identified experience map.

**Architecture:** Keep the static browser demo and compact D review shell. Move scenario data and phone behavior into a dedicated JavaScript file; use reusable screen renderers and local fixtures. Do not introduce a framework migration or production functionality.

**Files:** `docs/ui/scenario-board-02.html` (shell), `docs/ui/scenario-demo.js` (scenario inventory and simulated phone), `docs/ui/scenario-demo.css` (phone components), `docs/ui/scenarios-09/` (generated screenshots), `docs/ui/checks/coverage-09/` (bounded evidence), `DESIGN.md` and `docs/PROGRESS.md` (current observations).

- [x] Define each scenario's situation, action, expected outcome, design status, starting screen and journey connections.
- [x] Fill onboarding, configuration, all-workspace history, concurrency/Needs you, workspace management/files, permissions, environment/lifecycle recovery, settings/About and terminal. Keep external-folder and PTY feasibility explicit in review instructions. Do not imply uninspected Orca behavior is copied.
- [x] Preserve first-send agent locking, saved sessions, separate agent-turn and environment state, setup progress and context on returning from simulated Android screens. Use fictitious credentials only.
- [x] Generate phone screenshots from actual repeatable entry states. Test every card and its primary action, branch outcomes, drawer/back, onboarding skips, terminal leave/interrupt/close, reduced motion and viewport containment. Inspect representative screenshots.
- [x] Update the design inventory with implemented coverage and remaining fidelity/feasibility limits; save a local focused Git checkpoint, excluding concurrent edits.

**Review focus:** No real Android permission or shell action; reset scenarios deterministically; optional capability skips must work; navigating away must preserve active sessions; screen shots must match entry states; cards remain at least 74 px and page scrolling stays internal.
