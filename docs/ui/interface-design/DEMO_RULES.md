# Rules extracted from the current demo

## Authority and evidence

**USER DECISION**: Derive the interface rules from the current demo and discard the external style references. Source: this interface-design discussion, “I don't think the sources are really related, let's ditch them. Now we extract the rules truly from our demo. Then we can talk about more specific fixes.”

**USER DECISION**: Material 3 is discarded. Source: the preceding message, “We have ditched Material 3.”

**OBSERVED**: Everything below describes the existing browser demo. These observations provide a baseline for discussion; they do not approve every incidental implementation detail. No external design system supplies these rules.

Sources:

- [Board and base styles](../scenario-board-02.html): inline CSS for the phone, conversation, composer and review layout.
- [Additional styles](../scenario-demo.css): forms, rows, states, overlays, terminal and motion.
- [Sample interactions](../scenario-demo.js): `chat`, `header`, `row`, `chip`, `back`, `drawerUI`, `sheetUI`, `render` and related fixture functions.
- Saved screenshots inspected: [chat](../scenarios-09/chat.jpg), [history](../scenarios-09/history.jpg), [draft](../scenarios-09/draft.jpg), [needs you](../scenarios-09/needs-you.jpg), [drawer](../scenarios-09/drawer.jpg), [configuration](../scenarios-09/configure.jpg), and [terminal](../scenarios-09/terminal.jpg).

**OBSERVED**: Measurements are CSS pixels in a 390 × 780 reference phone before `fitPhone` scales it for the review page. They are not established Android dp/sp specifications. Source inspection and saved screenshots do not verify live interaction, accessibility or native behavior.

## 1. Keep one pale working surface

**OBSERVED**: The app uses a nearly white, green-tinted canvas. The header, conversation background and bottom navigation share that surface. There are no gradients or box shadows in the inspected app styles. Separation comes from spacing, thin borders and changes in fill.

| Existing role | Value | Usage |
| --- | --- | --- |
| Surface | `#fafbf8` | Phone surface, fields, drawer and sheets |
| Panel | `#e6e9df` | User messages, informational notices, default chips |
| Ink | `#242c22` | Main text and Stop fill |
| Muted | `#58634f` | Labels, secondary text and placeholders |
| Accent | `#415739` | Primary actions and default chip text |
| Line | `#cbd2c2` | Field and row borders, separators |
| Tool surface | `#f0f2eb` | Expandable tool blocks |
| Composer border | `#aebca3` | Composer outline |
| Bottom divider | `#e0e5d8` | Navigation separation |

**OBSERVED**: `--ground: #eeefe9` belongs to the surrounding review page. `--danger: #9b3535` is declared, but the inspected error components use the colors below instead.

## 2. Give the transcript most of the conversation screen

**OBSERVED**: The header carries the conversation title, then agent and workspace in smaller text. Workspace files and details appear on demand through a sheet. They do not occupy a permanent panel above messages.

**OBSERVED**: Agent replies sit directly on the background, left aligned, without an avatar or enclosing bubble. User messages have a pale panel fill, a 24 px left inset within the message region, 12 × 14 px padding and 16 px corners. Their right edge follows the message region. Messages use 20 px horizontal page insets.

**OBSERVED**: Tool details sit in a separate pale block with an expandable text summary. The summary is 14 px; expanded output uses 12 px monospace with 1.7 line height. Tool details are collapsed initially.

**OBSERVED**: A new conversation has a centered prompt. Workspace and agent controls sit side by side immediately above the composer. These selectors disappear after the first send; the selected agent remains named in the header.

## 3. Use restrained type and a small number of emphasis levels

**OBSERVED**: The base font is `system-ui, sans-serif`, 15 px with 1.5 line height. Most text uses regular weight. Titles use 500 or 600 weight. Monospace is used for technical output.

| Element | Existing size / weight |
| --- | --- |
| Conversation and list-row main text | Inherits 15 px / regular |
| Header title | 16 px / 600 |
| Header metadata and field labels | 12 px / regular |
| Management screen heading | 25 px / 500; 1.2 line height |
| Empty conversation prompt | 26 px / 500; −0.5 px tracking |
| Management explanation text | 14 px / regular, muted |
| Form input and tool summary | 14 px / regular |
| Composer text | 15 px / regular |
| Composer action text | 13 px / regular |
| Bottom destinations | 14 px / regular |
| State chips | 11 px / regular |
| Sheet title | 20 px; inherits heading weight 600 |
| Drawer title | 24 px; inherits heading weight 600 |
| Terminal | 13 px monospace / 1.6 line height |

**OBSERVED**: These values do not form a single mathematical type scale. Icons in the header are text glyphs at 22 px.

## 4. Use consistent component families, with different corner sizes

**OBSERVED**: Shapes are rounded rectangles. Chips are pill shaped. The app does not put every content block inside a card.

| Component | Existing geometry |
| --- | --- |
| Ordinary button | 8 px radius; 10 × 14 px padding; 44 px minimum height |
| Draft selectors and search | 8 px radius; 44 px height; 1 px border |
| Management fields | 10 px radius; 48 px height; 10 px padding; 1 px border |
| Choice/list row | 12 px radius; 12 px padding; 10 px vertical margin; 1 px border |
| Information and intervention notice | 12 px radius; 12–14 px padding |
| User message and composer | 16 px radius |
| State chip | 20 px radius; 3 × 8 px padding |
| Drawer | 20 px right corners; 82% phone width |
| Bottom sheet | 24 px top corners; maximum 80% phone height |

**OBSERVED**: Common content insets are 20 px. Composer outer insets are 14 px; draft setup controls use 16 px. Gaps of 8, 10, 12, 14, 16, 18, 20 and 24 px all occur. No uniform spacing-grid rule is established by the source.

## 5. Distinguish primary, secondary and inline actions

**OBSERVED**: Primary buttons use an olive fill with white text. Secondary actions in management screens use an outline. Header controls, bottom destinations and inline responses use transparent backgrounds. Stop uses dark ink with white text and an explicit label.

**OBSERVED**: Management actions stack vertically at full width with an 8 px gap. The composer places the keyboard control on the left and Send or Stop on the right.

**OBSERVED**: Choice rows use left-aligned main text, smaller muted detail underneath, and either a chevron or a state chip at the right. The entire row is a button.

**OBSERVED**: General hover feedback uses the panel fill; primary hover uses `#304629`. Pressed phone buttons apply `brightness(.92)`. The general keyboard-focus outline is 3 px amber `#99641f` with a 3 px offset; management text inputs override focus with a 2 px olive outline.

## 6. Show status with words and pale fills

**OBSERVED**: Status appears as a small text chip. Needs you also adds an in-context response panel. Errors and recovery use explanatory text and explicit next actions.

| State | Existing fill | Existing text |
| --- | --- | --- |
| Done / Ready / default chip | `#e6e9df` | `#415739` |
| Working | `#e4eadc` | `#415739` |
| Needs you | `#f3e7cc` | `#72551b` on chip |
| Error | `#f4e8e5` | `#7a2929` |
| Stopped | `#e6e7e4` | `#555c50` |

**OBSERVED**: The Needs you panel uses the amber fill with inherited main text. A state label and panel heading can repeat the same wording. Done indicates a finished turn in sample behavior; it does not certify task success.

## 7. Keep controls outside the scrolling content

**OBSERVED**: The header and composer are fixed flex regions within the phone layout. The transcript scrolls between them. A simulated keyboard occupies layout space beneath the composer, reducing the transcript area. Management screens have their own scrolling content region.

**OBSERVED**: Conversations and Workspaces appear as equal-width text destinations at the bottom of eligible app screens. The current source does not give the selected destination a distinct appearance. Terminal screens omit this navigation.

**OBSERVED**: The drawer overlays the existing view with a translucent black scrim (`#0005`). Conversation details open in a bottom sheet using the same scrim. Back dismisses a sheet first, then a drawer, then the simulated keyboard, before returning through view history.

## 8. Use short directional entrance motion

**OBSERVED**:

- Content enters over 180 ms, fading from 0.4 opacity and moving 12 px from the right.
- The drawer enters from the left over 200 ms.
- Sheets enter from the bottom over 220 ms.
- All use `cubic-bezier(.2,0,0,1)`.
- Reduced-motion preference disables phone animations and transitions.

**OBSERVED**: These are entrance animations. The demo does not establish matching exit animations or gesture-driven motion. Rebuilding phone markup in `render()` can replay entrance animations; that behavior is not automatically a desired motion rule.

## 9. Give terminal output its own surface

**OBSERVED**: Terminal output uses `#171b16` with pale text `#dfebd5`; the extra-key strip uses `#252e22`. The app header remains pale. Shell selection appears above the output, with command entry, extra keys and simulated keyboard below. Terminal output scrolls internally.

**OBSERVED**: Simulated Android permission screens use a separate neutral palette and blue primary actions. These are representations of external system UI, not a second Olea theme. The browser keyboard, phone frame, status bar and Back/gesture strip are simulation artifacts.

## 10. Preserve the surrounding review format

**USER DECISION**: The session brief preserves option D categorized journey maps, scenario cards at least 74 px wide, the full phone and controls in one viewport, and internal scrolling.

**OBSERVED**: The current review page uses category tabs, connected screenshot cards, a selected-scenario instruction region, and a separate phone column. The graph uses 74 px cards with 110 px horizontal and 210 px vertical placement steps. `fitPhone()` scales the reference phone to the available stage. These measurements describe the review tool, not production app components.

## Details left for specific fixes

**OPEN**: Existing details below are discussion candidates, not approved fixes:

- Repeated screen titles: the app header and content can both say Conversations.
- Repeated intervention wording: a Needs you chip and panel can sit together.
- Bottom destinations lack a selected appearance.
- Fields vary between 44 and 48 px height, with 8 and 10 px corners; whether to retain those distinctions is undecided.
- Focus treatment varies between general controls and management text inputs.
- Browser glyph icons, simulated keyboard controls and sample-failure buttons need to be distinguished from intended app controls when refining screens.
- Native font scaling, touch target behavior, contrast and live keyboard/gesture behavior have not been verified by this extraction.
