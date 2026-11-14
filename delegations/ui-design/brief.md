# Olea UI design discussion brief

Status: active normal discussion session, working directly with the user in the existing Olea root. This is not a worker, subordinate or replacement core manager.

## Intent

Design Olea's UI interactively for people already familiar with Pi, Codex or Claude. Reduce phone setup friction and preserve advanced access. Broad execution authority is the intended default within Android access; repeated Olea-level shell/file approval flows are not required. Android permissions and system consent remain necessary.

The user requested this independent UI discussion while the originating session audits functionality/priorities and core builder `pi_4df52105_8113_4bf3_b8d3_fa9b4ed34eae` implements the maintained core. Latest product checkpoint supplied by the user: `3ec8b2e`.

## Authority and ownership

- Own only `docs/ui/` and `delegations/ui-design/`.
- Save discussion notes and reversible design artifacts locally. No production implementation.
- Originating session owns PRODUCT.md, ROADMAP.md, PROGRESS.md and functionality/priority decisions, including docs/FEATURE_PRIORITIES.md.
- Core builder owns implementation and device work. Preserve concurrent changes and all root tabs.
- No workers/Run, device mutation, provider-test spending, remote/clone/register/push/publish, cleanup or shared workspace metadata changes.
- No reporting or monitoring loop to the originating session. Engage the user here and remain available.
- Historical feasibility instructions confer no launch, budget or lease authority.

## Preserved agreements

Conversations are primary. Conversations and Workspaces are parallel destinations. Selecting a workspace opens Conversations filtered to it. Workspace metadata and files stay off the default conversation surface and remain available on demand. Resume the last active session by default, with a fresh-chat setting. Each session has one agent; another agent requires another session.

## Open design work

New-conversation setup placement is unresolved: controls beside the first-message draft versus a setup sheet before composing. Agent/model/workspace defaults, workspace creation and the all-workspace conversation view remain unresolved. Production UI toolkit is open.

Phone-file cleanup, maintaining an Obsidian overview, reminders and alarms are requested scenarios with unresolved feature priority/release placement. Illustrating them must not imply implementation or approved scope.

## Working method and deliverables

Read `docs/UI_DESIGN_HANDOFF.md` first in full, then current instructions, core authority context, PRODUCT.md, ROADMAP.md, PROGRESS.md, TECH_STACK.md, PHONE_USE_TESTS.md, docs/FEATURE_PRIORITIES.md and all five linked visual studies. This initial context reading is complete. The global instructions reference RTK.md, but it was unavailable at the referenced global instruction directory.

Use existing visual studies and create unique local studies when useful. Preserve agreements, label proposals and open questions, and record only explicitly stated decision reasons. Each newly selected design needs a saved visual reference and decision note. Evolving decisions live in `docs/ui/DESIGN_DECISIONS.md`. After a meaningful completed design batch, save `delegations/ui-design/result.md` with paths, actual visual checks, limitations and unresolved choices.

No new design has been selected in this session. Start by inviting the user to resolve the existing new-conversation setup choice.

Authority source: [UI design handoff](../../docs/UI_DESIGN_HANDOFF.md).
