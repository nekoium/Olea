# Feature scope and priority audit

Status: discussion document. Existing commitments and new requests are facts; priority ordering below is an assistant proposal awaiting user discussion. This document does not expand the active core builder's assignment or authorize implementation, testing spend or publication.

## Audience and product stance

User clarification: expect literacy with Pi, Codex or Claude. Make the phone experience convenient without requiring a beginner-oriented assistant persona. Preserve a high ceiling. The user prefers broad execution authority ("full YOLO") by default and expects users to acknowledge risks. Android permission/consent requirements and app access boundaries remain real. No repeated application-level shell/file approval flow is a default requirement. This is a product direction, not a claim about isolation or currently implemented defaults.

DSH Go and Orca are references supplied by the user; their exact behavior has not been inspected in this discussion. Do not assert identical defaults or protocol compatibility.

## Findings from the existing roadmap

1. The existing roadmap mixes a calendar, full release goals, historical feasibility procedures and immediate construction. Its calendar cannot establish actual readiness. Current core construction and later feature decisions need separate scopes.
2. Pi-first core delivery is now explicit, while the inherited 1.0 goal still includes Pi, Codex and Claude. No agreement removed either additional agent. Complete support means a usable product workflow, not CLI startup alone.
3. Authentication/provider configuration, external-folder access, user-data ownership and actionable failure recovery are essential workflow dependencies. They need explicit priority, even though users already understand agents.
4. Maintaining an Obsidian overview, scheduled agent runs, reminders and alarms are new user requests absent from the inherited release list. Their release placement remains undecided.
5. An Android notification, a scheduled agent run and a ringing alarm are different functions. Notification access in PHONE_USE_TESTS.md concerns reading another app's notifications; it does not establish Olea reminder delivery or alarm scheduling.
6. Local agent execution does not establish reliable scheduled background execution. Scheduling, restart behavior and missed-run behavior need their own product decisions and focused validation when implemented.
7. File cleanup and editing notes are concrete uses of agent/file access. They do not automatically require a dedicated cleanup engine, semantic index or custom Obsidian plugin.
8. Broad execution authority is the intended default. Earlier assistant suggestions of mandatory review for every file deletion or note edit were proposals, not accepted requirements. Recovery and honest reporting remain useful without per-action approval prompts.
9. The historical matrix and standing feasibility teams do not define current feature priority or permanent tests. Workers and diagnostics serve finite maintenance tasks.

## Suggested delivery order

| Priority proposal | Capability | Existing status | Observable useful outcome |
| --- | --- | --- | --- |
| P0: current assignment | Installable app, packaged environment, one backend, stock Pi conversation, streaming/tool activity, STOP, reopen | Approved core build; implementation underway in another session, no completion claim here | User can perform and continue a real on-phone Pi task |
| P1: usable daily work | Provider/auth configuration, workspace creation/selection, access to chosen phone folders/vaults, conversation management, understandable failures and recovery | Broad workflow commitments exist; exact behavior still open | User works with their own files and provider without desktop preparation |
| P1: capability and release obligations | Working Codex/Claude integrations, ordinary upstream updates, agreed native phone capability scope, supported device verification | Inherited release goals; incomplete evidence | Claimed agents and phone features complete the stated workflows on supported hardware |
| P2: proactive assistant | Saved schedules, recurring agent work, result notifications, ordinary reminders, pause/cancel, run status/failure reporting | New user requests; release placement unapproved | User can schedule the Obsidian overview update and see whether it ran |
| P2: phone alarm integration | Create an actual alarm with confirmed result; distinguish it from a notification | New user request; exact mechanism and release placement open | Requested alarm exists and behaves as advertised under Android rules |
| Later optional ecosystem | Extensions/tools/CLIs beyond core needs, external host/Orca integration, Olearia extraction after 1.0 | Existing deferred scope; supported agent extensibility still important | Extend capabilities without blocking ordinary agent use |

These priorities are a dependency-based starting proposal, not an agreement to postpone proactive features beyond 1.0. P1 groups contain independent work; the table does not mandate a new worker team or retest every agent against every phone tool.

## Concrete user scenarios

### Obsidian project overview

Read daily notes and scattered project notes; automatically maintain one central note for checking project progress. This is the user's stated need. The overview's contents, update trigger, source-link policy, file scope and conflict handling remain open. Assistant suggestions about next actions/blockers/source links are proposals. Actual vault location/access has not been examined or authorized by this discussion.

### Reminders and alarms

The user wants daily phone notifications and agent-created alarms. A fixed reminder may use native scheduling without a model run; a fresh daily synthesis requires scheduled agent execution and model access. This is an architectural observation, not an approved implementation. Define time zone, recurrence, delayed/missed runs, reboot, STOP/cancel behavior and spending before claiming unattended reliability. No blanket scheduled-spend authorization exists.

### Phone-file cleanup

The user named cleaning phone files as an initial use. Scope of accessible folders and actual cleanup rules remain open. Broad authority is the intended product stance; this discussion authorizes no access to or deletion of actual personal files.

## Decisions to discuss next

First decide release placement: should scheduled work, reminders and alarms be part of the first complete 1.0 experience, or follow a useful interactive agent release? The inherited November 15, 2026 target remains unchanged until the user revises it. Then order the proactive capabilities and define the smallest useful Obsidian task. Keep UI layout discussion in the dedicated UI session.
