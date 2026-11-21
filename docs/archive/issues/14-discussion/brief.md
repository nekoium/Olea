# Issue #14 discussion brief

**OBSERVED**: Read-only issue snapshot: [#14, User story: broken usage](https://github.com/nekoium/Olea/issues/14), created/updated 2026-11-17T15:51:04Z, no comments when fetched. The report says the UI did not feel nice-looking or responsive and an Obsidian edit received “I can't”; it explicitly leaves details to be allocated. This is a user-reported failure, not a reproduced root cause.

**OBSERVED**: Source inspection baseline: `090ee5fd6af343af6f51d295fe19e67ff97d64c8`. No device, personal files, provider calls, shared builds, runtime tests, production edits, or public messages were used. Existing test source and historical acceptance records were inspected; their results were not rerun.

**USER DECISION**: #14 needs discussion; #11 is T1 for further UI discussion, with no particular redesign selected. Source: [PRODUCT.md, Issue triage decisions](../../../../PRODUCT.md#issue-triage-decisions). Ordinary workspace-file work remains in scope; the earlier deferral of general personal-folder/vault workflows does not prove that editing an accessible Markdown workspace file is unsupported. Source: [PRODUCT.md, Shipping-today decisions](../../../../PRODUCT.md#shipping-today-decisions-superseded-release-target).

## Proposed discussion opener

**AGENT PLAN**: Present this privately to the user:

> You tried to edit an Obsidian note and got “I can't.” Olea has a connected-folder route for ordinary file edits, but its separate Phone access folder picker only enables a small test-file operation. To locate where your attempt broke, please share the request and full reply, which agent/model you chose, and how you connected the vault. You can replace private note names and text with placeholders. Also, which screen or action felt slow: taps, scrolling, typing, starting the agent, or waiting for its reply?

## Diagnostic map

All candidate explanations below are **AGENT PLAN** investigation branches, not proven defects.

| Branch | OBSERVED evidence | OPEN detail that separates it | AGENT PLAN next diagnostic |
| --- | --- | --- | --- |
| Supported connected workspace | `AndroidSharedFolders` permits existing direct folders in primary shared storage on Android 11+ with all-files special access. `WorkspaceFolders` maps one immutable host folder to `/workspace/workspace-<id>`; stock agents start with the selected workspace as cwd. | Was the note under that actual connected folder, and was this conversation assigned to it? Was the vault local primary storage, removable/cloud/provider storage, or app-private storage? | Establish storage category and selected workspace before treating this as a missing feature. Native file visibility can help establish mapping, without requesting private contents. |
| Missing permission or workspace | All-files permission is checked afresh; missing, revoked, read-only, inaccessible, and missing-folder states have distinct recovery messages. A folder absent from the launch bind snapshot requires explicit STOP/restart after recovery. Managed workspaces do not automatically become the user's vault. | Did the user grant all-files access, connect an existing folder, select that workspace, and start after connection? Was there a recovery message? | Capture the displayed access state/message and connection sequence. Do not infer a runtime bug from an unconnected vault or assume a permission grant from opening Settings. |
| Wrong capability or absent tools | `phone_folder_request` opens Android document-tree consent. `phone_files_write_read` takes only `value`, creates a random `olea-<uuid>.txt`, and reads it back. It has no target path, listing, existing-note read, or edit argument. That grant is independent of connected-workspace all-files access. Pi extension and Codex/Claude MCP configuration are conditional on bridge configuration. | Did “connected” mean Workspaces → existing folder, or Phone access → folder picker? Which tools were available and which were called? | Distinguish a real capability limit of the selected phone tool from ordinary file tools operating on a connected workspace. A successful selected-folder test does not prove arbitrary note editing. |
| Model refusal or agent interaction | A text reply alone does not establish that any filesystem operation ran. Codex defaults to full access, Claude starts with bypassPermissions, but Android permission checks still apply. Claude explicitly rejects unsupported control interactions and emits `olea_interaction_required`. | Was “I can't” the exact complete assistant reply, an Olea error, or a summary? Was there a read/edit/shell call, denied interaction, or tool error immediately before it? | Inspect the smallest redacted turn and visible tool activity. Separate no attempt, unavailable tool, model reasoning/refusal, native denial, and rejected agent interaction; none is established by the issue alone. |
| Genuine implementation failure | Source checks binding, guest realpath containment, directory status, immutable agent/workspace identity, and connected access. Existing acceptance records report Pi read/write success on a synthetic shared folder, not this user's vault or all agents. | With the correct workspace, supported storage and valid permission, did a tool fail, target the wrong location, report false success, or leave bytes unchanged? What exact error occurred? | Manager can allocate a synthetic Markdown fixture reproduction through the exclusive phone owner. Compare expected/actual bytes and Android host view; keep file changes user-authorized. A failure in this controlled path can establish a specific implementation defect. |

## Source and test anchors

- **OBSERVED**: [AndroidSharedFolders.kt](../../../../android/app/src/main/java/dev/olea/app/AndroidSharedFolders.kt): `access`, `checkedPath`, `settingsIntent`. Excludes removable/provider paths, redirected paths, `Android/data` and `Android/obb`; permission prechecks do not constitute a successful file write.
- **OBSERVED**: [WorkspaceFolders.kt](../../../../android/app/src/main/java/dev/olea/app/WorkspaceFolders.kt): `connect`, `workspacePath`, `writeBindings`, `blockFallback`. Connection requires a new empty workspace before conversations; unavailable external folders retain mappings and a regular-file marker blocks silent private-directory fallback.
- **OBSERVED**: [RuntimeService.kt](../../../../android/app/src/main/java/dev/olea/app/RuntimeService.kt): `taskWorkspacePath`, `openSelected`, `createConnectedWorkspace`, `prompt`; [runtime/linux.sh](../../../../runtime/linux.sh) orders private and external binds; [backend.ts](../../../../backend/src/backend.ts) resolves/validates cwd and saved identity. These are inspection findings, not proof the user's installed APK executed the intended route.
- **OBSERVED**: [phone-mcp.ts](../../../../backend/src/phone-mcp.ts) defines selected-folder tool schema and actionable native errors; [PhoneBridge.kt](../../../../android/app/src/main/java/dev/olea/app/PhoneBridge.kt), `saveFolder`, `folderGranted`, `writeRead` implement the distinct document-tree test-file path. [phone.ts](../../../../backend/extensions/phone.ts) registers shared tools in Pi. [codex-session.ts](../../../../backend/src/codex-session.ts) and [claude-session.ts](../../../../backend/src/claude-session.ts) configure agent policy/MCP and cwd.
- **OBSERVED**: [adapters.test.mjs](../../../../backend/test/adapters.test.mjs) includes fixture tests for realpath escapes, agent/workspace identity, shared Pi/MCP registration, native denial text/redaction and malformed arguments. [runtime.test.mjs](../../../../backend/test/runtime.test.mjs) covers independent synthetic workspace writes and terminal cwd rejection. [claude.test.mjs](../../../../backend/test/claude.test.mjs) checks adapter/MCP behavior. These host fixtures cannot reproduce Android storage, installed-tool discovery, a model's choices, or this Obsidian case.
- **OBSERVED**: [0.1.0-phone-acceptance.md](../../release-0.1.0/0.1.0-phone-acceptance.md) records earlier Pi stock-tool write/read in a managed workspace and a synthetic connected folder with spaces, matching Android host readback, plus permission-revocation and missing-folder recovery. Codex/Claude evidence there is minimal connection/arithmetic only. This is historical bounded acceptance, not a current-device check or proof against #14.
- **OBSERVED**: [README.md](../../../../README.md#choose-where-your-files-live) distinguishes direct connected folders and selected-folder phone tools. [0.1.0-shared-folders.md](../../release-0.1.0/0.1.0-shared-folders.md) documents the implementation and preliminary checks; its earlier outstanding physical acceptance is partly superseded by the later phone acceptance record above.

## Minimum reproduction questions

**OPEN**: Ask together, allowing private text/path redaction:

1. What exactly did you ask, and what was the full response around “I can't”? Did Olea show any tool call or error?
2. Which agent and model did this conversation use? Was it a new conversation or an existing one?
3. How did you connect the vault: an existing-folder workspace, Phone access folder picker, a copied note in a managed workspace, or another route? Which workspace was selected?
4. Was the note inside a local primary-storage vault, SD card/cloud/document provider, or Obsidian's private storage? A storage category and redacted relative path are enough initially.
5. Which Olea version and Android version were used, and did the issue survive a retry? Did access/restart messages appear?

**AGENT PLAN**: Questions 1–3 are the first diagnostic minimum; 4–5 establish path support and installed-version applicability. Do not require a real vault upload, full transcript export, personal-file inspection, or a repeat edit against an original note.

## UI overlap with #11

**OBSERVED**: [#11](https://github.com/nekoium/Olea/issues/11) says “Currently too ugly.” #14 adds perceived responsiveness and a concrete unsuccessful task, but neither supplies timings or screen-specific evidence.

**AGENT PLAN**: Route visual style and broad redesign discussion to #11. Retain the failed-task journey here: whether workspace identity, folder route, tool activity and recovery are understandable. Collect one affected screen/action and distinguish delayed local input/scrolling from environment startup or provider response time; screenshots can help if the user volunteers them. Do not diagnose rendering performance from model latency or prescribe a redesign from these reports alone.

**OPEN**: No root cause, approved behavior change, fix, or resolution is established. Manager owns central decision/status recording and any future fixture/device allocation; this kept-open worker can continue direct #14 discussion.
