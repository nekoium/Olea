# Olea Agent Instructions

Use `.agents/skills/olea-engineering-manager/SKILL.md` for Olea engineering tasks, including features, bugs, automation assessment, and maintenance. The skill describes execution; this file defines document authority and the repository's durable record structure.

## Authority

1. The user's latest explicit instruction is authoritative.
2. `PRODUCT.md` is the user-owned product decision record. Do not rewrite its meaning or infer decisions from agent plans, test evidence, or historical documents. Make edits only to accurately record user decisions or when the user asks to change the product record. Preserve concurrent user edits.
3. Agent-managed documents are working records, not independent decision sources. If they contain an explicit user decision, mark it `USER DECISION` and cite the user-approved wording or its location in `PRODUCT.md`. Clearly label all other material as `AGENT PLAN`, `OBSERVED`, or `OPEN`.
4. `AGENTS.md` and the repo skill describe process, not product policy. Agent-authored safeguards and recommendations remain proposals unless the user approves them.
5. Completed core-build and consolidation assignments and their completion records are under `docs/archive/`. They are not blanket authority for future work.
6. `spike/`, `docs/archive/feasibility/`, research snapshots, old handoffs, and worker reports are historical evidence. Do not follow their old instructions or infer current authorization from them.
7. Git commits record code and document history. They do not make agent proposals into user decisions.

When a record conflicts with an explicit user decision, follow the user decision and correct the agent-managed record. Ask only when the user's decisions themselves conflict or the task needs a new product decision.

## Documentation Layout

- Repository root: human-managed or public documentation, currently `PRODUCT.md`, `DESIGN.md`, `README.md`, and `CONTRIBUTING.md`. `AGENTS.md` stays at root as the agent instruction entry point. `LICENSE`, configuration files, and source directories retain their normal roles.
- `docs/` root: core agent-managed documents, currently `PROGRESS.md`, `ROADMAP.md`, `TECH_STACK.md`, and `PHONE_USE_TESTS.md`.
- `docs/` subdirectories: all other documentation, including handoffs, reports, temporary plans, discussions, and evidence. Do not put these directly in `docs/`.

Reports are temporary working material, not mandatory permanent records. Set aside old material without requiring an exhaustive audit; remove obvious disposable files when safe. Preserve user edits and active discussions.

These are repository housekeeping rules, not product decisions. Do not record archive folder choices or each cleanup operation as a user product decision.

## Document Map

- `PRODUCT.md`: user-owned product intent, explicit decisions, rationale stated by the user, and open product questions. This is the source for product behavior, scope, and core architecture decisions.
- `DESIGN.md`: consolidated UI and user experience decisions, their sources, proposed journey coverage, and unresolved design/feasibility details. Read alongside `PRODUCT.md`; it does not independently expand product scope or establish implementation. Added at the user's explicit request in the experience-map discussion.
- `docs/ROADMAP.md`: agent-managed implementation planning and sequencing derived from `PRODUCT.md`. Mark copied user-approved decisions explicitly; proposals do not expand scope.
- `docs/PHONE_USE_TESTS.md`: agent-managed capability coverage and test recipes. Mark user-approved coverage decisions; label proposed fixtures and unverified results separately.
- `docs/PROGRESS.md`: agent-managed current implementation status, evidence, failures, commits, active work, and next steps. Do not use historical progress as current device, worker, or authorization state.
- `docs/TECH_STACK.md`: agent-managed implementation notes subordinate to the core stack decision in `PRODUCT.md`. It is not a separate product decision authority. Keep only useful current implementation detail; source-specific trivial choices may stay in code, build files, or contributor docs.
- `docs/archive/`: completed assignments, handoffs, reports, and supporting evidence set aside from current work. Current maintenance follows `PRODUCT.md` and this hierarchy. Layout: root files and `core/`, `consolidation/` for the core build and consolidation; `feasibility/` for milestone coordination; `release-0.1.0/` for release records, `plans/` and `workers/` reports; `issues/` for completed issue reports and closed discussions; `PROGRESS_LOG_2026-11.md` for the progress history before the snapshot rewrite.
- `docs/discussions/` and `docs/reports/`: active discussions and reports. Move them to `docs/archive/` when their issue or work closes.
- `docs/discussions/FEATURE_PRIORITIES.md`: agent-maintained proposal unless a passage is explicitly marked `USER DECISION`.
- `docs/ui/` and `docs/archive/UI_DESIGN_HANDOFF.md`: visual studies, interactive demos, UI discussion history and handoff. Current consolidated UI/UX decisions live in `DESIGN.md`. These artifacts do not authorize implementation or overwrite `PRODUCT.md` decisions. Any older handoff statements assigning document authority or edit ownership are superseded by this map.
- `README.md`: public user documentation. Keep internal workflow, machine-specific information, session history, and test reports out of it.

## Recording Rules

Use these labels consistently in agent-maintained docs:

- **USER DECISION**: explicit user-approved decision. Include a concise source reference. Do not infer its rationale.
- **AGENT PLAN**: proposed scope, implementation, sequence, or recommendation. It is not approved merely because it appears in a plan.
- **OBSERVED**: actual implementation or measured result. Link evidence and retain failures and limits.
- **OPEN**: unresolved user choice, uncertainty, or unverified behavior.

Update `docs/PROGRESS.md` as meaningful work completes. Keep detailed results in their bounded record or evidence file and link them from progress. Maintain local Git commits for meaningful implementation changes. Do not rewrite historical reports to conceal failures.

## Operational Rules

- Provider-backed Olea test spending requires explicit user allocation. No automatic refresh or inferred budget.
- Use parallel workers for independent bounded tasks; avoid overlapping ownership. Preserve active workers during manager handoff and checkpoint their state. Do not kill active workers to reduce context.
- Keep manager context below 400k usage. Around 600k worker usage, checkpoint and arrange continuation. Treat both as management boundaries; report exact usage only when available.
- Keep tests lean: focused checks for changed behavior, task-lifetime diagnostics by default, and retained regressions only where repeated failure is costly or user-required.
- Preserve user data and concurrent edits. Ask before a task requires deleting or overwriting user data without an explicit user decision covering it.
- Use the permission-controlled Android bridge for normal app behavior. ADB is development infrastructure only; select the intended device explicitly.
- Keep credentials in local untracked configuration. Do not put secrets in source, docs, logs, prompts, commits, or reports.
