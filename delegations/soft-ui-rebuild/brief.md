# Soft UI native rebuild — worker brief

## Request and approval

**USER DECISION**: The user approved the current Soft UI and six-palette design as Olea's design and requested official contract docs plus a separate worker to rebuild the interface from the ground up. Exact latest instruction: “That will be our design … save that UI and palette design as official contract docs … delegate another worker … update the interface from ground up … in accordance with … our design principles and guidelines.”

Use the final leaf-green visual baseline `ccabc09`, not the older yellow-olive `6efb50e` or the earlier cyan-leaning green. Keep all six approved palettes: Olea green (default), Soft purple, Dusty blue, Rosewood, Ochre and Graphite. Typography, spacing, geometry and hierarchy are shared across them.

This is an implementation assignment. Do not reopen visual direction selection, stop after planning, or deliver only a recoloring of the old layouts. The design was approved; routine native adaptation is yours to resolve and document.

## Imagined use and intention

Olea's user wants an approachable, coherent phone interface for real local Pi/Codex/Claude sessions. They should be able to set up the app, start and continue work, read replies/tools, answer required questions, navigate other sessions/workspaces, manage permissions/settings and use a workspace terminal without oversized controls and repetitive outlines displacing the work. The old implementation looked misaligned with the intended human design. The user chose the Soft specimens after reviewing actual emulator screenshots, then requested complete experience coverage and palette options.

## Read first

1. Root `AGENTS.md`, `.agents/skills/olea-engineering-manager/SKILL.md`, `PRODUCT.md`, `DESIGN.md`, `CONTRIBUTING.md` and `docs/PROGRESS.md`.
2. `docs/ui/soft/CONTRACT.md` — official design contract, component measurements, interpretation rules and acceptance.
3. `docs/ui/soft/palettes.json` — exact native role values, shared semantic colors, default palette and stable IDs.
4. `docs/ui/soft/IMPLEMENTATION.md` — execution plan.
5. `docs/discussions/issue-11/mood.html`, `mood-prototypes.html`, `mood-prototypes.js`, `mood-prototypes.css`, `soft-flow.js`, `palettes.js` — browser design/reference at `ccabc09`.
6. `docs/reports/broad-file-access.md` and current native source — preserve #13's already implemented broad grant/bind behavior from `94fb76f`.

The contract is indexed by PRODUCT.md and DESIGN.md. Original task limits that restricted the discussion worker to its notes no longer apply to this newly authorized native implementation. Do not change approved product meaning or redefine the contract to excuse a mismatch.

## Workspace and ownership

You are the sole implementation worker for this assignment; do not launch nested workers. Use your assigned Orca checkout. Discover its exact selector with the resolved Orca executable's `worktree current --json`. Keep meaningful local commits; preserve concurrent edits.

May edit native presentation and closely related UI tests/resources/build dependencies:

- `android/app/src/main/java/dev/olea/app/FlatUi.kt`, `OleaApp.kt`, `ConversationUi.kt`, `TerminalUi.kt`, `PhoneAccessUi.kt`, `PhoneAccessActivity.kt`, `MainActivity.kt` and focused new UI/theme files beside them.
- Existing terminal presentation assets under `android/app/src/main/res/raw/`, preserving WebView isolation and PTY/input/output behavior.
- Focused UI instrumentation and minimum build/dependency changes needed for this redesign, retaining third-party license notices.
- `delegations/soft-ui-rebuild/brief.md`, `result.md`, `evidence/`; a bounded status update in `docs/PROGRESS.md` when useful work completes.

Do not edit browser design/reference artifacts, PRODUCT.md, DESIGN.md or the contract/palette specification. Do not rewrite backend/runtime infrastructure, broad-file permission policy or process security as part of a visual redesign. If a specific UI binding needs a narrow supporting change, explain its necessity and preserve existing behavior.

For a fresh isolated checkout, generated runtime assets/caches may be absent. Follow `CONTRIBUTING.md` and build with the ABI actually packaged. If useful, the original checkout at `C:/Users/Aria/Projects/Development/Olea` may be read for existing build instructions and copied only for its generated Android runtime assets/native libraries; do not modify that checkout or copy ignored credential/config/signing material. Prefer rebuilding inside your assigned checkout over broad copying of `.setup/`. Asset presence is not runtime acceptance.

## Deliverables and observable acceptance

- The Android UI is recomposed across existing supported journeys using Soft components and exact six-palette roles, not merely retinted legacy controls.
- Save the supplied brief in this directory before execution; it may already be present in the base commit.
- Settings offers six named swatches, persists palette independently of appearance, defaults/falls back to green and preserves existing preferences, sessions and drafts.
- Real conversation send/cancel/STOP, upstream interaction responses, saved sessions, concurrent navigation, files and terminal functionality remain usable. No fabricated readiness, seeded sample content or fake permission success.
- Management controls belong to their task/object. Workspace details stay off the default transcript. Agent identity is fixed per sent session; first-use choices remain explicit.
- Permission interfaces use actual Android authority and current broad-file access. Browser folder/permission examples never overrule PRODUCT.md or existing #13 behavior.
- Record a 51-reference-specimen/native-state coverage matrix, screenshots with build/device/ABI/palette/theme/entry details, and side-by-side representative comparisons. Include keyboard, narrow layout, font scaling, state/error screens, phone access, terminal and management.
- Run focused relevant build/lint/UI checks. Host assembly is not device acceptance; fixture rendering is not proof of a connected agent or terminal.
- Record intentional native font/system-control differences and any unsupported capability honestly. Match all real supported screens, including ones missing from sample data.
- Final result: `delegations/soft-ui-rebuild/result.md`, explicit outcome (`succeeded`, `partial`, `blocked`, `failed`), implementation commits, files, actual check results, screenshots, deviations, failures and remaining work. Keep evidence inside this checkout and link it.

## Limits

- No provider-backed requests or spending. No allocation is active. Credentials being present never authorizes use.
- Local deterministic checks and emulator-only UI validation are authorized. Select the exact emulator explicitly; do not use a physical phone, clear/uninstall an existing app, erase user data or silently change the production package identity/signing/version.
- If signing/package conflicts prevent installation, use a documented separate diagnostic build or report the limit. Do not delete the installed app to make the check pass.
- No public messages, GitHub writes, pushes, signing/release publication or issue closure. Keep #11 open for implementation review.
- No new fonts without a distributable license. Browser Trebuchet is not permission to bundle it; preserve its visual character with a legal native solution and show the result.
- Use focused correction attempts for failed checks, not endless retries. Preserve partial work and give the exact next action if a real blocker remains.

## Completion protocol

Follow the actual dispatch preamble for a single final `worker_done` when applicable. On completion or blocker, save the result and update the exact assigned workspace with `worktree set --worktree <exact-selector> --workspace-status in-review --comment <factual short outcome> --unread --json`, using the executable resolved from `ORCA_CLI_COMMAND` when set (otherwise follow the orca-cli skill). The current Windows executable is `C:/Users/Aria/AppData/Local/Programs/orca/resources/bin/orca.exe`; load its version-matched guide before operating it.

Do not mark a partial/blocked result as succeeded. Record notification failures without hiding useful local results. Retain the implementation and evidence for review, then end your turn. No routine progress polling is requested of the delegating chat.
