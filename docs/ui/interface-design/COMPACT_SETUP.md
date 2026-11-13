# Compact setup layer and strong primary actions

**USER DECISION**: Keep the setup panel connected to the composer but visually distinct. Make the two menus smaller; use a slightly darker, borderless panel that appears behind the typing box. Source: “connected but not the same thing, the two menu should be shrinked in size, and that board popup with selection menu will be a tiny bit darker than the text box and no outline ... hinting that the popup is seemingly at the backer place.” The annotated image crosses out the visible Workspace/Agent labels and marks the rounded top edge of the typing region.

**USER DECISION**: Soften yellow slightly. Source: “Yellow should be a bit less strong.”

**USER DECISION**: Restore strong green primary buttons, treating them differently from soft state fills. Source: “Strong green button should be back to strong. Strong means not the same logic with the soft green or red.” These decisions supersede the previous reduction in primary-button emphasis.

**OBSERVED**: Baseline saved in `38f9582`. The setup extension now has no border, a distinct background, and a stacking level behind the composer. It overlaps the composer by 16 CSS px so they remain connected. The typing box retains its rounded top corners and existing outline. Selectors are 40 CSS px high, 13 px type, and each occupies 44% of the inner row. Workspace and Agent labels remain programmatically associated but are visually hidden. These are preview measurements, not a production Android touch-target specification.

**OBSERVED**: Setup fill is `#eef0e9` in light and `#1b211b` in dark. Primary actions use solid `#415739` / `#49633f` with white text, without a border. Needs you fill is `#f3eddd` / `#363023`, slightly less intense than the previous amber. Other alert styling and the removed terminal divider are preserved.

**AGENT PLAN**: These exact measurements and palette values implement the user's description for visual review; they are not independently approved permanent tokens.

**OBSERVED**: [Browser checks](checks/compact-setup/checks.json) pass 97 checks, including the overlapping layer, compact controls, visually hidden labels, first-send exit, both themes and existing behavior. Checked primary/alert text contrast remains at least 4.5:1. All 122 scenario screenshots were refreshed. JavaScript syntax and scoped whitespace checks pass.

- [Light composer](checks/compact-setup/light-draft.jpg)
- [Dark composer](checks/compact-setup/dark-draft.jpg)
- [Softer yellow and strong action](checks/compact-setup/light-needs-you.jpg)

**OPEN**: Browser-only design evidence; native touch targets, Android behavior and a full accessibility audit remain unverified.
