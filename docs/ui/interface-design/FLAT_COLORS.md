# Borderless notices and quieter action color

**USER DECISION**: Remove outlines from red/yellow notices and primary green buttons; reduce excessive green tint while keeping yellow distinguishable from green. Source: “No we should not have that outline for red and yellow notification, and tune the color back a bit, should not be that green. Also the strong green button should be tuned back a bit, and also not outline. Yellow should be at least distingushable from green.”

**USER DECISION**: Remove the divider under terminal session controls, identified in the user's terminal screenshot. Source: “And also this outline is not up to the principle of flat design. Ditch that.” This is a correction to the identified divider, not a decision to remove all borders or keyboard-focus indicators throughout the app.

**OBSERVED**: The previous demo is saved in `3cbf8a9`. This iteration removes error/Needs you notice borders, removes primary button borders including action-stack overrides, and removes the terminal-tabs bottom border in both themes. Unrelated field, composer, secondary-action and focus treatments remain unchanged.

**OBSERVED**: Primary fills are now less chromatic: light `#e1e5dc`, dark `#343c30`. Error fills are rose-tinted: light `#f4e9e5`, dark `#392b29`. Needs you is distinctly warm amber: light `#f3ead4`, dark `#3d3524`. Labels remain present; states do not rely solely on color.

**AGENT PLAN**: Exact colors are the preview implementation of this correction, not independently approved final palette values.

**OBSERVED**: The focused browser check passes 97 checks, including computed zero borders on the corrected components in both themes, amber hue separation, checked text contrast of at least 4.5:1, and all prior composer/theme checks. All 122 light/dark card screenshots were refreshed. [Results](checks/flat-colors/checks.json), [light alerts](checks/flat-colors/light-needs-you.jpg), [dark alerts](checks/flat-colors/dark-needs-you.jpg), [terminal divider removal](checks/flat-colors/dark-terminal.jpg).

**OPEN**: Browser-only evidence; no native Android or full accessibility acceptance is claimed.
