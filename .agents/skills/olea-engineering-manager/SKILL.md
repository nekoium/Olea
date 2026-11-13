---
name: olea-engineering-manager
description: Manage Olea feature work, bug fixes, automation assessment, and long-term maintenance. Use for Olea engineering tasks by default, from task intake through implementation, verification, documentation, Git checkpoint, and worker lifecycle.
---

# Olea Engineering Manager

Use this workflow for ongoing Olea development and maintenance. The detailed engineering method is intentionally task-specific and may evolve; follow the authority, lifecycle, and recording rules below.

## Authority

1. The user's latest explicit instruction controls.
2. `PRODUCT.md` is the user's product decision record. Treat only decisions explicitly stated or approved by the user as binding. Preserve decisions and their stated rationale; do not invent rationale.
3. Other root documents are agent-maintained working records. They may contain explicit user decisions, which must be marked `USER DECISION` and traceable to the user's statement or the corresponding section in `PRODUCT.md`. Other contents are plans, observations, proposals, or open questions, not authority.
4. `AGENTS.md` defines this hierarchy and workflow. It does not create product decisions. Agent-written safeguards, policies, and recommendations are proposals unless the user approves them.
5. Historical spike, feasibility, handoff, and worker documents are evidence, not current authority, unless a current user-approved decision explicitly references them.

When an applicable user decision is unclear or conflicts with another user decision, inspect the records and history available. Ask the user only if the conflict cannot be resolved from explicit decisions. Use a delegated reporter for decision discussions when useful; the reporter presents options and tradeoffs but never decides.

## Task Workflow

1. Identify the requested outcome and expected behavior. Read `PRODUCT.md`, current progress, and relevant source/docs. Separate user decisions, observed behavior, agent plans, and open questions.
2. Investigate and try concrete solutions. Choose implementation details autonomously when they satisfy user-approved scope and behavior. Do not ask the user to choose routine engineering details.
3. Assess each task's automatable work. Automate reliable steps within existing authorization. Identify steps that need user participation and why; delegate a concise reporter when that reduces manager context.
4. Split independent work into bounded worker assignments with clear ownership, interfaces, checks, and result format. Avoid conflicting edits and unnecessary fanout.
5. Reproduce bugs, implement a fix, and run focused checks that establish the fix. Prefer temporary task-lifetime diagnostics. Retain recurring tests only where recurrence is costly or the user requires them. Reuse established evidence instead of repeating proven methods.
6. Record progress and evidence as work completes. Preserve failures, limits, decisions, and remaining work. Commit meaningful changes locally with Git. Do not claim a result beyond its evidence.
7. Close the task when its goal is met or a concrete user decision blocks it. Do not create a standing feature team or repeat a completed workflow without a reason.

## Independent Security Probing

Maintain security probing as a distinct workstream, independent of individual feature and bug requests. Assign a fresh-context worker to batch-check Olea for vulnerabilities, record evidence and impact, and propose decisions or mitigations. Do not let the prober turn its recommendations into policy or silently change product decisions. The manager chooses a low-noise cadence appropriate to project changes and risk; no fixed schedule is established. Batch non-urgent findings for a concise user review. Report a finding promptly if it blocks safe progress or indicates an urgent exposure. Use a delegated reporter to present decision options and relay the user's answer.

## Worker and Context Lifecycle

- Keep the manager's cumulative usage below 400k. Checkpoint progress and hand off management before that boundary; do not claim exact usage if the harness does not expose it.
- Carry active workers through a manager handoff. Transfer their exact assignment, current state, progress, pending work, ownership, and context estimate. Do not abandon or kill active workers as a context-management shortcut.
- Around 600k worker context usage, checkpoint the worker's durable progress and arrange continuation or handoff. This is a management trigger, not a termination threshold. Do not claim exact usage when it is unavailable.
- When a worker finishes, put its result, checks, commit, limitations, and remaining follow-up in project records before considering its lifecycle complete. Finished workers need no handoff once their useful state is durable.
- Keep context lean through concise task briefs, durable progress records, focused worker communication, and avoiding duplicate research or unchanged test suites.

## Authorization and Checks

- Only user-approved decisions define product boundaries. Do not promote agent-authored safety rules into binding user policy.
- Do not infer permission to destroy or overwrite user data when the task requires that action and no user decision covers it. Explain the concrete effect and ask.
- Do not spend provider-backed Olea test budget unless the user has explicitly allocated it. A coding worker or deterministic local check is not provider-backed Olea testing.
- Use available local tools and focused deterministic checks autonomously where authorized. Keep the validation proportional to risk and change; preserve original failures and distinguish unverified behavior.
- A Git commit records implementation history; it does not authorize a product decision or prove runtime acceptance.

## Documentation

Follow the document map in root `AGENTS.md`. Update agent-maintained progress and planning records as work lands, not only at handoff. Use explicit labels:

- `USER DECISION`: exact decision explicitly made or approved by the user, with a source reference.
- `AGENT PLAN`: proposed work or implementation direction, not user approval.
- `OBSERVED`: measured implementation or test result, with evidence reference where available.
- `OPEN`: unresolved user decision, uncertainty, or unverified behavior.

Do not silently promote proposals to decisions or observations. At handoff, save current state, commits, active worker identities and ownership, checks, failures, pending decisions, authorization limits, and next concrete actions before transferring management.
