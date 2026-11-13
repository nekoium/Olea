# Roadmap

Status: agent-managed planning document. It proposes work derived from `PRODUCT.md`; it does not approve new product scope or change user decisions. Update this plan as implementation and user decisions change.

## User Decisions

- **USER DECISION**: Olea targets Pi, Codex, and Claude Code support for version 1.0.0 targeted for November 15, 2026. Source: `PRODUCT.md`, Audience and execution stance / Agreed boundaries.
- **USER DECISION**: Build Olea first and extract Olearia after 1.0.0. Source: `PRODUCT.md`, Future reusable foundation: Olearia.
- **USER DECISION**: The maintained core uses Kotlin Android authority, packaged Linux through PRoot, one shared TypeScript/Node backend, and stock-agent adapters. Source: `PRODUCT.md`, Technical implementation direction.

These entries summarize decisions already recorded in `PRODUCT.md`. If they diverge, `PRODUCT.md` wins.

## Current Baseline

- **OBSERVED**: The maintained Android base and established capability consolidation are recorded in `docs/CORE_BUILD_RECORD.md` and `docs/CONSOLIDATION_RECORD.md`.
- **OBSERVED**: The consolidated `0.2-base` APK and its finite checks are documented in `docs/CONSOLIDATION_RECORD.md`. Provider-backed integrated Pi/Codex acceptance remains unverified there.
- **OPEN**: Product decisions and release placement for new requested capabilities remain as recorded in `PRODUCT.md` and `docs/FEATURE_PRIORITIES.md`.

Do not treat historical feasibility matrices as current acceptance gates. Read current source and bounded records before assigning work.

## Planning Method

For each approved task:

1. State the expected behavior and boundary from `PRODUCT.md`.
2. Identify concrete dependencies and uncertainties. Investigate route-changing uncertainty before building on assumptions.
3. Propose a small sequence of observable deliverables. Parallelize independent work with explicit file ownership.
4. Mark unapproved scope or design as **AGENT PLAN**. Ask the user only when a product decision is required or explicit decisions conflict.
5. Update `PROGRESS.md` as results land. Keep focused evidence in the relevant record.

## Current Agent Plan

- **AGENT PLAN**: Continue maintenance from the maintained Android base. Select the next feature or defect from explicit user requests and observed failures; do not infer a feature priority from this roadmap.
- **AGENT PLAN**: For bugs, reproduce the failure, investigate alternatives, implement the smallest complete fix within approved behavior, and verify the changed path.
- **AGENT PLAN**: Assess which task steps can be automated. Run reliable authorized steps automatically; report steps that need user participation.
- **AGENT PLAN**: Run independent, fresh-context security-probing batches as a separate workstream. Record findings and proposals; do not let agent recommendations create user policy.

No provider-backed Olea testing is authorized without a separate explicit allocation. A roadmap item does not allocate test spending.

## Open Decisions

- **OPEN**: Product scope, release placement, and behavior not settled in `PRODUCT.md`.
- **OPEN**: Detailed implementation method for future work. Choose per task and refine this roadmap from experience.
