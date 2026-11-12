# Established capability consolidation

## Authority and goal

User instruction in the current manager session authorizes gathering all useful established experimental capabilities into the working Android base, managing parallel workers until complete, recording remarkable changes in Git, lean task-lifetime testing, and successor-manager handoff at a 400k context-usage budget. This supersedes the first core assignment's stop-at-first-deliverable restriction for this consolidation only. Existing provider-backed Olea test spending remains frozen; coding workers are separately authorized. No remote/push/publish. Preserve concurrent UI/product discussions and historical evidence/data.

Goal: expose established capabilities through maintained `android/`, `backend/`, `runtime/`, with an installable updated APK and ordinary use documentation. Existing Kotlin/PRoot/shared Node/stock agent architecture remains. Minimal native presentation may grow to expose these functions; production UI design remains separate.

## Scope and evidence

| ID | Deliverable | Established evidence | Completion boundary |
| --- | --- | --- | --- |
| P1 | Permission-controlled Accessibility tree/click/home/swipe | M1/M2 causal launcher click and independent foreground | Maintained service, normal enablement link, bounded tool calls, STOP denies effects |
| P2 | Selected Android folder access | M3 direct SAF; M5 model write/read | Real folder picker, persisted selection and grant validation, bounded selected-folder write/read; no arbitrary phone-files claim |
| P3 | HTTPS browser opening | M5 final runtime effects | Native tool and user-controlled bridge; dispatch is not destination confirmation |
| P4 | Location | M3 direct and scoped agent results | Runtime permission request, finite last-known result with timestamp/age, actionable denial |
| P5 | Notification reading | M3 direct/Codex and M5 Pi fixture effects | Notification listener with normal settings link, bounded separate-app results; no scheduler/reminder claim |
| P6 | Consented capture | M3 independently inspected PNG; M5 metadata flow | Actual MediaProjection consent, fresh request/result metadata and saved PNG, STOP releases projection; no model image interpretation |
| P7 | Cooperating app interface | M1/M2 separate-UID fixture oracle | Preserve a narrowly configured explicit cooperating-app action; test fixture is not a shipped universal app integration |
| A1 | Stock Codex workflow | M2 full-access Unix/stream/resume and scoped phone; M4 direct update | Optional upstream installation, configurable Responses provider/model, streamed tool/text/history, same-thread reopen, interrupt; explicit full-access/no isolation |
| A2 | Pi phone extension and Codex MCP | M1-M5 registration/effects | Maintained supported extension/MCP registration with native authority; remove experiment provider/fixture/policy defaults |
| S1 | Multiple saved conversations/workspaces | Two-session backend and historical concurrent Pi proof | Persist registry, one agent per session, selection without replay, up to two active sessions; no broad concurrency reliability claim |
| S2 | Cancel turn without STOP | Historical Pi cancel; existing abort commands | Separate cancel control for Pi/Codex; environment stays available where upstream permits |
| U1 | Ordinary agent updates | Pi preserved updates; M4 Codex 0.167.0→0.167.1 | Explicit finite upstream update controls, preserve user boundaries, no copied canonical home resume, report failure without automatic retries |
| R1 | Failure/permission/STOP behavior | M3 revocation and M4 backend-only recovery; core ownership fixes | Integrate native bridge disable/cleanup with backend exit and STOP, explicit restart, no replay |
| R2 | Resource observations | Historical timing/PSS/constrained checks | Retain useful measurements and expose bounded runtime status; no standing sampling fleet or battery claims |

Not established and outside consolidation: authenticated Claude, ARM64/physical Android14, scheduler/alarms, screenshot pixels in model input, broad backup/export/migration guarantees, arbitrary third-party app integration, full production redesign. M5 final batch is runtime-reported with saved effect checks, not independently finalized acceptance. Historical failures remain.

## Architecture and parallel ownership

Selective reuse avoids promoting experimental harnesses. No private agent forks. Native bridge owns permissions and effects, local authenticated HTTP transport, and disabled-by-default state. Shared backend registers stock Pi extension/Codex MCP. Conversations/workspaces have stable identities and separate homes/session boundaries. Existing default conversation/workspace must migrate without deleting data.

- Native worker: new Android phone classes/resources and manifest only; no MainActivity/RuntimeService edits. Supplies `PhoneBridge` integration contract and access activity.
- Backend worker: `backend/` only. Configurable Codex, phone schema/extension, protocol support for workspace selection and interrupts. No Android/runtime edits.
- Session worker: new Android registry/store classes only. No shared MainActivity/RuntimeService/manifest edits. Supplies stable persistence/migration API.
- Manager: MainActivity/RuntimeService/Environment, runtime scripts/build, integration, task ledger/docs, build/device validation.

All workers make focused commits and report exact hashes/checks/limits. No device mutation or provider requests by workers without an explicit manager assignment. Independent worktrees prevent shared Git/index/build collisions. Manager integrates reviewed commits. Subworkers allowed for disjoint bounded work only; avoid unnecessary fanout.

## Execution checklist

- [x] Inspect maintained source and historical evidence; capture scope/authority and lean workflow.
- [ ] P1-P7: maintain native phone bridge and normal permission/consent routes.
- [ ] A1-A2: maintain configurable stock adapters and phone registration.
- [ ] S1: persistent conversations/workspace registry and migration.
- [ ] Integrate Android UI/service selection, streams, phone controls and cancel.
- [ ] U1: explicit agent install/update and preserved storage boundaries.
- [ ] R1-R2: integrate failure/STOP/status; retain useful measurement references.
- [ ] Build updated APK; bounded deterministic checks and serialized emulator checks for changed boundaries.
- [ ] Update README/user limitations, contributor instructions, completion evidence and final Git checkpoint.
- [ ] Settle/release owned workers after outputs durable; remove only newly owned clean disposable worktrees after preserving any unique ignored assets. Never clean old unrelated sessions/worktrees by inference.

## Verification and lifecycle

Reuse existing proofs. Run compile/type checks for changed components. Use temporary bounded checks for new integration, with a few retained assertions only for costly permission/data/STOP regressions. Do not reproduce the 112-case matrix. Provider prompts/retries/fallbacks/replays remain forbidden without explicit allocation. Device mutation has exactly one current owner, established after actual-state inspection. Emulator validation uses app-owned mechanisms; ADB remains development infrastructure.

Successor handoff: preserve scope table, actual integrated commits, active task/dispatch/worktree identities, exact pending work, actual device ownership/release, provider freeze, failures and artifacts. Estimate manager usage from available session accounting; do not pretend exact usage is visible if the harness exposes none. Handoff before 400k usage or context exhaustion, carrying active workers rather than starting another feasibility loop.

## Current progress

Manager Run `run_3b684f9f9240`; scope checkpoint `8d25828` on baseline `eb1073a`. Three isolated Pi workers launched ready:

| Track | Task / Dispatch | Worktree | Ownership |
| --- | --- | --- | --- |
| Native phone | `task_d0800acbb46f` / `ctx_0b8d16243e6e` | `C:/Users/Aria/orca/workspaces/Olea/core-phone` | New phone classes/resources + manifest |
| Adapters | `task_e169df575b59` / `ctx_ac17c1a7c4f4` | `C:/Users/Aria/orca/workspaces/Olea/core-adapters` | `backend/` |
| Registry | `task_690215dc1dda` / `ctx_4f0d45d85761` | `C:/Users/Aria/orca/workspaces/Olea/core-sessions` | New SessionStore class |

Manager retains shared Activity/RuntimeService/Environment/runtime/integration ownership. Workers may not mutate device or submit provider tests. No device owner assigned in this consolidation yet. Worker lifecycle is report → integrate/check needed boundaries → release exact settled worker → preserve unique assets before any new disposable worktree removal. Orca delivers reports; no polling/watch loop.

Existing untracked `.agents/`, `delegations/`, advisory HTML and `docs/ui/` belong to concurrent/previous activity and remain untouched. User explicitly confirmed all established approaches are agreed and routine confirmations are unnecessary. This manager has not reached the 400k usage budget; exact cumulative accounting is not yet exposed.
