# Cabin typography implementation

USER DECISION: The user compared Trebuchet, Cabin, Fira Sans and Source Sans 3 in the same Soft browser screens and selected Cabin: “I think cabin is great. Let's delegate a worker to make this change to app.” Implement it now on top of the completed native Soft rebuild in your existing soft-native-ui checkout. This is a focused follow-up, not another redesign.

Use the existing worker checkout C:/Users/Aria/orca/workspaces/Olea/soft-native-ui, baseline f84a080. Read AGENTS.md, the Olea engineering manager skill, docs/ui/soft/CONTRACT.md, and your previous result. The original master checkout contains the new approved typography contract and font assets; read them directly from C:/Users/Aria/Projects/Development/Olea. Do not modify that master checkout or merge/reset/cherry-pick unrelated changes.

Source assets to copy into your checkout as needed:
- docs/discussions/issue-11/fonts/cabin/Cabin[wdth,wght].ttf (variable upright Cabin, weight 400–700)
- docs/discussions/issue-11/fonts/cabin/OFL.txt
- docs/discussions/issue-11/fonts/sources.json (provenance/hash)
- docs/discussions/issue-11/font-comparison.html and font-preview.css (visual reference; can inspect from master)

Goal: preserve the approved Soft reading character consistently in the real native UI. Bundle licensed Cabin locally as an Android font resource, wire actual regular/medium/semibold/bold weights through shared typography, and apply it to headings, labels, forms, composer, messages, preferences, notices and phone-access surfaces. Keep code and terminal monospace. Retain Android fallback for characters/scripts absent from Cabin. System keyboard, permission dialogs and status bars remain Android-owned. Do not substitute a similar font or use fake-bold when the file supports the needed weight. Keep all six palettes, geometry, data/persistence/runtime behavior and 48 dp targets. Record any necessary wrapping/line-height adjustment.

Own only necessary font/theme/presentation resources and shared typography/callers, the bundled license and About/license inclusion, focused checks, and delegations/cabin-font/{brief.md,result.md,evidence/}. Save this brief there. Update the worker checkout's contract with the exact user decision above as needed, preserving other content. No backend/runtime changes, provider requests/spending, physical-phone use, clearing/uninstalling apps, release signing, publication, pushes, GitHub writes or issue closure. No nested workers.

Acceptance:
1. Verify source font hash against sources.json; retain OFL copyright/license and include the notice with app distribution/About licenses.
2. Use real font resource wiring for supported weights. Check every shared typography path plus any direct TextStyle/BasicTextField usages so the composer/form does not silently stay system sans.
3. Build and run focused emulator UI rendering checks in your existing isolated diagnostic app, selecting emulator explicitly and preserving installed data. Include conversation with realistic long reply, draft/composer with keyboard, Settings, onboarding and provider form. Check default/enlarged text and narrow viewport; record actual font/weight selection and wrapping. No provider call is required.
4. Capture native before/after or browser-Cabin/native comparison images, identifying build/device/font/entry. Keep monospace technical output unchanged and verify palette changes preserve the selected font.
5. Use existing build/lint and proportional checks; do not rerun broad runtime/provider matrices for a font change. Record any failed/blocked checks honestly.
6. Commit meaningful implementation and evidence. Result must state succeeded/partial/blocked/failed, commits, font provenance, license inclusion, exact checks, screenshot links, deviations and remaining native rendering limits.

Completion: update your exact Orca workspace to in-review with factual comment and unread marker; follow the fresh dispatched task's worker_done protocol once. Do not use the settled earlier task/dispatch IDs. End after reporting; no polling or nested work.
