# Interface refinements from annotated demo review

## Source and status

**USER DECISION**: This note records the user's annotated review in the interface-design discussion. The three supplied images identify the bottom Back/gesture strip, new-session workspace/agent selectors, and composer Keyboard button. These decisions supersede conflicting baseline observations in [DEMO_RULES.md](DEMO_RULES.md); that file describes the inspected demo, not a requirement to preserve every detail.

## Retained visual character

**USER DECISION**: Retain visible but unobtrusive motion. Source: “the present but not intrusive motion is good.”

**USER DECISION**: Retain flat surfaces with softened, non-rigid corners. Source: “The flat design with also proper and also not-so-rigid round corners design is good.”

**USER DECISION**: Retain the overall green palette and its informative, unobtrusive character. Source: “The green palette is overall good, informative and not intrusive.”

**USER DECISION**: Retain the minimal, approachable icon character. Source: “The minimalistic but cozy icon design is good.” This selects the perceived character, not a specific icon library or every current browser glyph.

**AGENT PLAN — technical interpretation**: Describe this direction as flat fills and fine outlines, softened rectangular geometry with component-specific corner radii, low-chroma green-tinted surfaces, darker olive emphasis, and simple lightweight icons. Keep the current restrained type hierarchy. Avoid interpreting “cozy” as permission to introduce illustrations, textures, gradients or ornamental shapes. Icon stroke widths, cap/join geometry and an exact radius system have not been selected.

## Motion pacing

**USER DECISION**: Slow transition animations slightly. Source: “But transition animations can be a bit slower.”

**OBSERVED**: Current entrance durations are 180 ms for content, 200 ms for the drawer and 220 ms for sheets, using `cubic-bezier(.2,0,0,1)`.

**AGENT PLAN**: First preview candidate: 240 ms for content, 260 ms for the drawer and 280 ms for sheets. Preserve the directional character and reduced-motion treatment. These durations are a proposal for visual review, not an approved specification.

## Bottom system-navigation representation — image 1

**USER DECISION**: Remove the visible bottom “‹ Back” control and center the gesture bar horizontally relative to the phone. Source: “This <back I don't know why it's even there, that should be removed. The bar should also be centered.”

**OBSERVED**: The bottom Back button is explicitly inserted by `render()` in `scenario-demo.js` as a browser simulation control. It is not supplied by Android. The separate header Back control is not the item circled in the image.

**AGENT PLAN**: Keep the header Back control where appropriate. Remove only the redundant bottom text control in the proposed study. Center the gesture indicator independently of adjacent content, rather than balancing it against a button. Treat the indicator as simulated system chrome, not an Olea navigation action.

## New-session setup — image 2

**USER DECISION**: Present workspace and agent selection together in a popup above the composer, rather than as a detached row. Slide it down and dismiss it after the first message is sent. Source: “They should not be dissected from, but rather in a popup above the type box when at new session, and will gilde down and disappear when first message sent.” The circled controls are Workspace and Agent.

**AGENT PLAN — interpretation for preview**: Use a single nonmodal setup popover anchored directly above the composer. Group the two selectors inside one shared surface. Do not dim the transcript or block typing. On an accepted first send, move the popover downward toward the composer while fading it out; do not remove it for an invalid/blocked send. Keep session agent identity in the header afterward, consistent with the existing fixed-agent behavior.

**OPEN**: Exact popup shape, overlap, entrance behavior, exit duration and any later workspace controls remain to be reviewed visually. The nonmodal behavior and fade are agent interpretations, not explicit user choices.

## Composer provider menu — image 3

**USER DECISION**: Replace the composer Keyboard button with the provider menu. Leave keyboard control to Android. Source: “The keyboard button should be the provider menu, android itself already know how to control keyboard.”

**AGENT PLAN**: Remove the app-level keyboard toggle from the composer in the proposed study. Preserve normal input focus and Android keyboard behavior as the interaction target. Browser-only keyboard simulation, if still needed for review, belongs to demo controls rather than an Olea composer action.

**OPEN**: Clarify whether “provider menu” means provider/model selection for the session's fixed agent or a route to app-wide provider connection management. No provider-switching capability or configuration scope is inferred from this placement decision.

## Ownership and implementation

**USER DECISION**: Edit the shared demo directly after checking that its current state is committed. Source: the user's follow-up, “You should edit the demo; before that, save the current demo status in commit if not yet saved.” This expands the original session ownership restriction for these demo refinements.

**OBSERVED**: Before editing, the board, CSS, JavaScript and all 61 scenario screenshots had no uncommitted changes and were already saved in commit `5e9a938` (`Fill browser experience map with 61 interactive scenarios`).

**OBSERVED**: The browser demo now implements the bottom Back removal, independently centered gesture indicator, anchored new-session setup popup with first-send dismissal, 240/260/280 ms entrance timing, and composer provider popup. The provider popup uses fictitious connection choices and a Manage providers route; its final contents remain open for discussion. Focusing the composer opens the browser keyboard fixture without an app keyboard toggle. [Implementation and checks](IMPLEMENTATION.md) records evidence and limits.
