# Current interface design direction

**USER DECISION**: Use the current browser demo’s flat design. Material Design is no longer selected. Source: the user's correction after launching this discussion, “Material 3 why? We don't use material design anymore, we'll use the flat design as the current demo.”

This supersedes the launch brief's statement that Material 3 remained required. Kotlin + Jetpack Compose remains the implementation toolkit; it does not require Material components or styling. Start from the current demo, discuss refinements directly with the user, and preserve the other settled experience requirements in root DESIGN.md.

**USER DECISION**: Discard the external style references and extract rules from the demo before discussing specific fixes. Source: “I don't think the sources are really related, let's ditch them. Now we extract the rules truly from our demo. Then we can talk about more specific fixes.”

**OBSERVED**: [DEMO_RULES.md](DEMO_RULES.md) records the demo's existing visual and interaction patterns, exact CSS measurements, and unresolved inconsistencies. It describes the baseline rather than approving every current detail. The external-reference note has been removed.

**OBSERVED**: Subsequent user feedback and implementation are recorded in [REFINEMENTS.md](REFINEMENTS.md) and [GENTLE_THEME.md](GENTLE_THEME.md). The latest iteration joins setup to the composer, softens alert/action colors, styles radio controls and adds a dark theme. These later records supersede conflicting measurements in the original extraction.
