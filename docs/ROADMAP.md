# Roadmap

Status: agent-managed planning document. It proposes work derived from `PRODUCT.md`; it does not approve new product scope or change user decisions. Update this plan as implementation and user decisions change.

## User Decisions

- **USER DECISION**: Complete and publish public signed **0.1.0** with Pi, Codex and Claude Code, using the current scenario board as the interface/functionality reference. This latest release instruction supersedes the older private/timed 1.0.0 shipping target. Source: [PRODUCT.md, Release 0.1.0](../PRODUCT.md#release-010).
- **USER DECISION**: Build Olea first and extract Olearia after 1.0.0. Source: `PRODUCT.md`, Future reusable foundation: Olearia.
- **USER DECISION**: The maintained core uses Kotlin Android authority, packaged Linux through PRoot, one shared TypeScript/Node backend, and stock-agent adapters. Source: `PRODUCT.md`, Technical implementation direction.

These entries summarize decisions already recorded in `PRODUCT.md`. If they diverge, `PRODUCT.md` wins.

## Current Baseline

- **OBSERVED — PUBLISHED**: Signed public [0.1.0](https://github.com/nekoium/Olea/releases/tag/0.1.0) was published on 2026-11-14 at `03:00:38Z`, 38 seconds after the user's deadline. The APK, runtime source companion, notices and checksums are available; final credential audit and publication checks are recorded in [publication](archive/release-0.1.0/0.1.0-publication.md) and [security audit](archive/release-0.1.0/0.1.0-security.md). Publication is complete.
- **OBSERVED**: [Phone acceptance](archive/release-0.1.0/0.1.0-phone-acceptance.md) records Pi real tasks and all three agents' native connectivity. Release-time terminal failures remain preserved. The later [#1](https://github.com/nekoium/Olea/issues/1) fix passed physical debug-build acceptance and is not yet released.
- **OBSERVED**: The maintained Android base and capability consolidation, including the `0.2-base` APK and its finite checks, are recorded in `docs/archive/CORE_BUILD_RECORD.md` and `docs/archive/CONSOLIDATION_RECORD.md`.
- **OPEN**: Product decisions and release placement for new requested capabilities remain as recorded in `PRODUCT.md` and `docs/discussions/FEATURE_PRIORITIES.md`.

Do not treat historical feasibility matrices as current acceptance gates. Read current source and bounded records before assigning work.

## Planning Method

For each approved task:

1. State the expected behavior and boundary from `PRODUCT.md`.
2. Identify concrete dependencies and uncertainties. Investigate route-changing uncertainty before building on assumptions.
3. Propose a small sequence of observable deliverables. Parallelize independent work with explicit file ownership.
4. Mark unapproved scope or design as **AGENT PLAN**. Ask the user only when a product decision is required or explicit decisions conflict.
5. Update `docs/PROGRESS.md` as results land. Keep focused evidence in the relevant record.

## Current Agent Plan

- **AGENT PLAN**: Maintain the published MVP. The #1 terminal fix still needs a release and release-signed acceptance. Completed signing, source/notice delivery, credential audit and publication are historical release work, not pending 0.1.0 gates.
- **USER DECISION**: [#2](https://github.com/nekoium/Olea/issues/2) and [#3](https://github.com/nekoium/Olea/issues/3) are closed as not planned. Terminal access remains intentional, and additional Codex/Claude acceptance work is omitted; neither closure establishes passing tests or removes agent support. Source: [PRODUCT.md, issue triage decisions](../PRODUCT.md#issue-triage-decisions).
- **USER DECISION**: Defer lifecycle recovery [#4](https://github.com/nekoium/Olea/issues/4) and export/restore design [#9](https://github.com/nekoium/Olea/issues/9) to “The far side”. UI improvement [#11](https://github.com/nekoium/Olea/issues/11) is T1; #11 and user stories [#13](https://github.com/nekoium/Olea/issues/13)/[#14](https://github.com/nekoium/Olea/issues/14) need discussion. No redesign or new feature behavior is selected. Source: [PRODUCT.md, issue triage decisions](../PRODUCT.md#issue-triage-decisions).
- **USER DECISION**: Close remaining phone-permission acceptance [#6](https://github.com/nekoium/Olea/issues/6) and modified-library recipe validation [#8](https://github.com/nekoium/Olea/issues/8) as not planned; omit these dedicated validation assignments and prioritize actual phone use. Their unverified cases remain limitations, not passing results. Source: [PRODUCT.md, issue triage decisions](../PRODUCT.md#issue-triage-decisions). Broader Android compatibility remains unverified beyond the bounded release evidence; [#5](https://github.com/nekoium/Olea/issues/5) is closed, which alone adds no device acceptance evidence.
- **AGENT PLAN**: Continue maintenance from the maintained Android base. Select the next feature or defect from explicit user requests and observed failures; do not infer a feature priority from this roadmap.
- **AGENT PLAN**: For bugs, reproduce the failure, investigate alternatives, implement the smallest complete fix within approved behavior, and verify the changed path.
- **AGENT PLAN**: Assess which task steps can be automated. Run reliable authorized steps automatically; report steps that need user participation.
- **AGENT PLAN**: Run independent, fresh-context security-probing batches as a separate workstream. Record findings and proposals; do not let agent recommendations create user policy.

Issue checklists and agent proposals organize possible follow-up; they are not user commitments or new release gates. No provider-backed Olea testing is authorized without a separate explicit allocation. A roadmap item does not allocate test spending.

## Open Decisions

- **OPEN**: Product scope, release placement, and behavior not settled in `PRODUCT.md`.
- **OPEN**: Detailed implementation method for future work. Choose per task and refine this roadmap from experience.
