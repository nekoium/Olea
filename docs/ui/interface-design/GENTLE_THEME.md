# Joined composer, gentle states and dark theme

## User decisions

**USER DECISION**: Join the workspace/agent setup extension to the typing box. Source: the user's annotated image 1 and correction, “I mean this, they are not apart from the type box.” This supersedes the earlier detached popup with an 8 px gap.

**USER DECISION**: Soften error and intervention messages and primary green actions. Source: annotated images 2–3, “The red message, the yellow message, the strong green button can be more gentle.”

**USER DECISION**: Style radio controls consistently with the interface. Source: annotated image 4, “This we should make it consistent to our style, not like placeholder web point.”

**USER DECISION**: Add a dark theme. Source: “Also we can have a dark theme.”

## Implementation

**OBSERVED**: The preceding demo state is saved in commit `7630bd4`. This iteration edits only the browser demo, its generated screenshots and this session's interface-design records/checks.

**OBSERVED**: Workspace and Agent form a joined upper extension of the composer. The extension has rounded upper corners; the typing region has rounded lower corners. They share matching outlines and surface color with no gap. Setup remains anchored to the composer, rather than appearing at the top of the conversation. On the first accepted send, it slides down behind the typing region and is removed. Invalid sends retain setup, and reduced motion removes the exit layer immediately.

**OBSERVED**: Light-theme primary actions use pale sage with dark olive text and a subtle border. Error notices use a near-neutral warm tint and muted brown text. Needs you uses a pale warm neutral fill. Dark-theme equivalents retain the same roles on dark green-gray surfaces. Labels, outlines and actions continue to distinguish states.

**OBSERVED**: Radio inputs keep native input semantics, label click areas and keyboard behavior. Their circles and selected dots are drawn in the app palette. Selected rows receive subtle surface and border emphasis; browser-default blue selection styling is removed.

**OBSERVED**: The theme can be changed through Settings → Appearance or the Dark theme demo toggle. It covers app surfaces, text, controls, alerts, keyboard simulation, system-screen simulation and the surrounding review page. Both themes have 61 matching scenario thumbnails. Theme changes preserve the active scenario and conversation state; theme selection survives scenario changes and simulated app reopening.

**AGENT PLAN**: Exact color values are an initial implementation of “more gentle,” offered for visual review. Adding a theme does not independently approve every chosen color, a system-following preference, or persistence policy.

**OPEN**: The demo currently keeps appearance in memory for the loaded page. It does not save it across browser reloads or automatically follow the operating system. Production theme preference behavior remains unspecified.

## Validation

**OBSERVED**: [The focused browser script](check-refinements.mjs) passes 95 checks. It regenerates all 122 light/dark scenario screenshots and records [exact results](checks/gentle-theme/checks.json). JavaScript syntax and scoped Git whitespace checks pass.

Coverage includes the joined edge, first-send exit and rejection behavior, fixed-agent follow-up, provider controls, input-focus keyboard fixture, reduced motion, all 61 scenario entries and handler syntax, five viewport sizes, radio selection, theme changes without lost drafts, theme retention through sample navigation, and both palettes. Computed text contrast is at least 4.5:1 for the checked primary button, error notice, Needs you notice and Needs you chip in each theme. This is not a full accessibility audit.

**OBSERVED**: The initial review images were captured before new dark thumbnails were generated and showed missing dark thumbnails; light captures could also show old cached cards. Capture ordering was corrected to generate and decode the thumbnails before taking review images. The final images were recaptured and inspected.

Review images:

- [Joined composer — light](checks/gentle-theme/light-draft.jpg)
- [Joined composer — dark](checks/gentle-theme/dark-draft.jpg)
- [Joined composer with keyboard — dark](checks/gentle-theme/dark-draft-keyboard.jpg)
- [Gentle error and primary action](checks/gentle-theme/light-tool-error.jpg)
- [Gentle Needs you](checks/gentle-theme/light-needs-you.jpg)
- [Radio controls and appearance — light](checks/gentle-theme/light-settings.jpg)
- [Radio controls and appearance — dark](checks/gentle-theme/dark-settings.jpg)

**OPEN**: These are browser fixtures. No device mutation, real provider operation, Android implementation or native acceptance is claimed.
