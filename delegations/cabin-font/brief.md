# Cabin typography implementation — supplied brief

**USER DECISION**: The user compared Trebuchet, Cabin, Fira Sans and Source Sans 3 in the same Soft browser screens and selected Cabin: “I think cabin is great. Let's delegate a worker to make this change to app.” Implement on top of the completed native Soft rebuild in `soft-native-ui`, baseline `f84a080`. This is a focused follow-up, not another redesign.

Read AGENTS.md, the Olea engineering manager skill, `docs/ui/soft/CONTRACT.md`, and the previous result. Read approved typography and font assets directly from `C:/Users/Aria/Projects/Development/Olea`; do not modify that master checkout or merge/reset/cherry-pick unrelated changes.

Source assets:

- `docs/discussions/issue-11/fonts/cabin/Cabin[wdth,wght].ttf`: variable upright Cabin, weight 400–700.
- `docs/discussions/issue-11/fonts/cabin/OFL.txt`.
- `docs/discussions/issue-11/fonts/sources.json`: provenance/hash.
- `docs/discussions/issue-11/font-comparison.html` and `font-preview.css`: visual reference.

Goal: preserve the approved Soft reading character consistently in the real native UI. Bundle licensed Cabin locally as an Android font resource, wire actual regular/medium/semibold/bold weights through shared typography, and apply it to headings, labels, forms, composer, messages, preferences, notices and phone-access surfaces. Keep code and terminal monospace. Retain Android fallback for characters/scripts absent from Cabin. System keyboard, permission dialogs and status bars remain Android-owned. Do not substitute a similar font or use fake-bold when the file supports the needed weight. Keep all six palettes, geometry, data/persistence/runtime behavior and 48 dp targets. Record any necessary wrapping/line-height adjustment.

Ownership: necessary font/theme/presentation resources and shared typography/callers, bundled license and About/license inclusion, focused checks, and `delegations/cabin-font/{brief.md,result.md,evidence/}`. Update this checkout's contract with the exact decision, preserving other content. No backend/runtime changes, provider requests/spending, physical-phone use, clearing/uninstalling apps, release signing, publication, pushes, GitHub writes or issue closure. No nested workers.

Acceptance:

1. Verify source font hash against `sources.json`; retain OFL copyright/license and include the notice with app distribution/About licenses.
2. Use real font resource wiring for supported weights. Check every shared typography path and direct TextStyle/BasicTextField use so composer/form cannot silently stay system sans.
3. Build and run focused emulator UI rendering in the existing isolated diagnostic app; select the emulator explicitly and preserve installed data. Cover realistic long conversation, draft/composer with keyboard, Settings, onboarding and provider form, default/enlarged text and narrow viewport. Record actual font/weight selection and wrapping. No provider call required.
4. Capture native before/after or browser-Cabin/native comparisons with build/device/font/entry metadata. Keep monospace technical output unchanged; verify palette changes preserve the font.
5. Use existing build/lint and proportional checks; no broad runtime/provider matrices. Retain failed/blocked checks honestly.
6. Commit implementation and evidence. Result states succeeded/partial/blocked/failed, commits, provenance, license inclusion, exact checks, screenshots, deviations and remaining rendering limits.

Completion: exact Orca workspace `in-review`, factual comment and unread marker, followed by one `worker_done` for Task `task_1fd1d7d3bb8a` / Dispatch `ctx_8ee67a39df26`. End after reporting.
