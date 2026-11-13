# Phone-Use Coverage

Status: agent-managed coverage reference. Product scope and approved coverage decisions are owned by `PRODUCT.md`. A test recipe or observed result in this file does not create new product scope.

## User Decisions

- **USER DECISION**: Phone-use capabilities are bounded by permissions and special access a user can normally grant on a stock personal Android phone; no privileged system access is implied. Source: `PRODUCT.md`, Phone-use scenario and approaches.
- **USER DECISION**: Alpha prioritizes opening an app through an Accessibility click. Source: `PRODUCT.md`, Phone-use validation scope.
- **USER DECISION**: Full validation covers each discussed category: intents/app links, structured Android APIs, files/media, notification access, Accessibility, screen capture, and app-specific integration. Source: `PRODUCT.md`, Phone-use validation scope.
- **USER DECISION**: Browser opening to a supplied URL is a concrete scenario; dispatching an intent alone does not prove the destination loaded. Reading page content is not an agreed requirement. Source: `PRODUCT.md`, Phone-use scenario and approaches.

The list summarizes `PRODUCT.md`. If wording conflicts, `PRODUCT.md` wins. Individual fixtures, exact test data, and agent-driven acceptance details are not approved unless separately decided.

## Coverage Proposals

The following are **AGENT PLAN** test ideas, not approved fixture requirements. Adapt them to the implementation and existing evidence.

| Category | Candidate check | Candidate evidence |
| --- | --- | --- |
| Intents and app links | Open a supplied HTTPS URL through Android. | Independently observe the intended destination, not only dispatch. |
| Structured Android APIs | Read a permission-controlled value such as last-known location. | Record returned value, timestamp/age, and actual permission state. |
| Files and media | Use a user-selected folder for a bounded write/readback. | Compare exact bytes through an independent check. |
| Notifications | Read a bounded notification from another app after normal special-access enablement. | Confirm package and expected content. |
| Accessibility | Click an exposed launcher node to open a target app. | Independently observe the target app in foreground. |
| Screen capture | Capture harmless content after actual Android consent. | Independently inspect saved image and verify STOP revokes later effects. |
| App-specific integration | Call a documented cooperating-app interface. | Verify the cooperating app's effect independently; do not generalize to arbitrary apps. |

## Evidence Rules

- **OBSERVED** results must link to a dated task record or evidence file and name relevant Android/app versions and limits.
- Keep direct native bridge results separate from agent-driven results.
- Reuse established proofs when code and behavior are unchanged. Run new focused checks for changed or costly boundaries; do not repeat the historical matrix by default.
- Retain failed attempts and qualify finite observations. Emulator success does not prove physical-device compatibility.
- Current consolidation outcomes and limits are in `docs/archive/CONSOLIDATION_RECORD.md`. Historical experiments under `spike/` are evidence only.

## Open

- **OPEN**: Additional phone capabilities and their product/release placement, as recorded in `PRODUCT.md`.
- **OPEN**: Exact fixtures and implementation-specific acceptance checks for future tasks.
