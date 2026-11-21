# Implementation Notes

This agent-maintained document records implementation details for the maintained Olea code. It is not a product decision authority and does not define a separate core stack. `PRODUCT.md` owns user-approved product and core architecture decisions. `AGENTS.md` defines the document hierarchy.

## Current Implementation

- **USER DECISION**: The maintained core uses Kotlin Android authority, packaged Linux through PRoot, one shared TypeScript/Node backend, and stock-agent adapters. Source: `PRODUCT.md`, Technical implementation direction.
- **USER DECISION**: The production Android UI uses Kotlin + Jetpack Compose with the current browser demo’s flat design. Material Design is no longer selected. iOS is a future possibility, not a required target. Source: [PRODUCT.md, Technical implementation direction](../PRODUCT.md#technical-implementation-direction), reflecting the user's latest correction. Compose does not require adopting the Material design system; this decision does not establish a completed UI migration.
- **OBSERVED**: Maintained code is organized under `android/`, `backend/`, and `runtime/`.
- **OBSERVED**: `Environment.builder` checks the current Android all-files grant, and `runtime/linux.sh` exposes granted shared storage through `/sdcard` and `/storage`. Workspace paths still choose cwd and bind selected projects; they do not limit stock-agent file reach. Android private-app restrictions remain. Grant changes require STOP/Start; selected document-provider phone tools remain a separate optional capability. [Implementation and bounded evidence](reports/broad-file-access.md).
- **OBSERVED**: Kotlin owns Android platform authority. The shared backend manages agent/session integrations. Refer to current source and `docs/archive/CORE_BUILD_RECORD.md` / `docs/archive/CONSOLIDATION_RECORD.md` for implemented behavior.
- **OBSERVED**: The maintained app's current consolidated build and limitations are recorded in `docs/archive/CONSOLIDATION_RECORD.md`.

## Working Rules for Implementation Choices

These are engineering practices, not product policy:

- **AGENT PLAN**: Prefer existing project patterns and platform APIs. Choose libraries, file layout, and other implementation details based on current code and task needs.
- **AGENT PLAN**: Keep implementation decisions in source, build configuration, or focused contributor/engineering notes when that is clearer than this file.
- **AGENT PLAN**: Add a dependency only when it provides meaningful value over a small local implementation or platform facility.
- **OBSERVED** results must be linked to their check or record. Do not present candidate compatibility as measured acceptance.
- Do not maintain private agent forks unless the user explicitly changes the product decision recorded in `PRODUCT.md`.

## Open Technical Questions

Track only questions that affect an active task or a product decision. Mark unresolved questions `OPEN`, include the evidence needed to resolve them, and remove them when settled. Do not copy the historical feasibility inventory here.
