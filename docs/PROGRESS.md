# Progress

Status: agent-managed snapshot of current state. It is not a product decision source. The full entry-by-entry history up to 2026-11-21 is in [the archived progress log](archive/PROGRESS_LOG_2026-11.md); do not treat its old worker, device or authorization states as current.

## Current state

- **USER DECISION**: Commit/integrate the approved interface and release **0.1.1** as a UI update, including before-and-after images. Source: the current release instruction, “we can release 0.1.1 … UI update … include before after, images in the release notes.” The follow-up requests the image board first.
- **OBSERVED**: Prepared the [release image board](discussions/issue-11/release-0.1.1/index.html), [overview](discussions/issue-11/release-0.1.1/overview.png), and five PNG comparisons: conversation, Settings, first use, provider setup and phone-access summary. Before images are actual published 0.1.0 captures; after images are actual native Cabin diagnostic captures with sample content, from worker evidence at `c0793ee`. Complete frames use equal scaling, with [source hashes](discussions/issue-11/release-0.1.1/sources.json). Browser image loading, inspection/Escape and 390 px layout passed. Native changes remain on the clean worker branch; integration, signed ARM64 packaging and publication are pending. No provider allocation is active.

- **USER DECISION**: Cabin is the selected Soft UI font after browser comparison. Source: issue #11 chat, “I think cabin is great. Let's delegate a worker to make this change to app.” [Contract](ui/soft/CONTRACT.md), [font brief](../delegations/cabin-font/brief.md).
- **OBSERVED**: Cabin follow-up completed on the clean `soft-native-ui` checkout in commits `21c5ab0`, `7330806`, `c0793ee`. Bundled approved font and OFL; four true variable weights, preserved monospace, 22 native captures and focused x86_64 assembly/lint passed (0 errors, 39 warnings). [Result and rendering limits](../delegations/cabin-font/result.md). No provider requests; physical/OEM rendering remains unverified. The retained Pi worker completed dispatch `ctx_8ee67a39df26` / task `task_1fd1d7d3bb8a`; it has no active assignment.

- **USER DECISION**: The Soft UI and six-palette design is approved for a native interface rebuild, with the leaf-green Olea default from `ccabc09`. The user requests official contract docs and a separate implementation worker. [Product decision](../PRODUCT.md#approved-interface-rebuild--issue-11), [UI contract](ui/soft/CONTRACT.md), [palette values](ui/soft/palettes.json), [implementation plan](ui/soft/IMPLEMENTATION.md).
- **OBSERVED**: Soft native rebuild completed on `soft-native-ui` in commits `6f83e54`, `e1fa14d`, `711c152`, `54d087e`, `f84a080`, after contract `39e3a41`. The retained Pi worker completed dispatch `ctx_24df0f9f580b` / task `task_a353978de25e`. It preserved runtime/broad-file behavior, implemented six independently saved palettes and supplied native/real-terminal evidence. [Result and limits](../delegations/soft-ui-rebuild/result.md). No active rebuild assignment remains.
- **OBSERVED**: Native UI acceptance is bounded to the API 36 emulator, including real IME, narrow/enlarged text, permission-screen cancellation, actual PTY checks and palette continuity. Live provider conversations, physical-device and lifecycle acceptance remain unverified; no provider test spending is allocated.

- **OBSERVED**: Broad-access worker completed `94fb76f`; manager reviewed production bindings, permission/restart status, user copy and [bounded report](reports/broad-file-access.md). Android-granted shared storage is exposed at `/sdcard` and `/storage`, independently of workspace cwd/phone-tool toggle. Focused emulator denial/grant/revocation, stock Pi read/edit outside cwd, connected cwd separation, APK/backend builds and host checks passed; one Windows symlink skip, zero provider requests. Posted evidence and closed #13 as completed for its assigned access-scope implementation. Local source only, not pushed/released; physical/OEM UX, live service restart, in-flight revocation and secondary volumes unverified. Original refusal/UI symptoms are not claimed fixed. Worker assignment is complete; earlier pending entries below are dispatch history.

- **USER DECISION**: The broad-file-access implementation worker owns #13; the former #13 discussion session is no longer needed. Source: current user instruction. Manager relayed issue ownership to `ctx_bbddc9e7f0b1`. **OBSERVED**: Old discussion dispatch `ctx_716c9f53d914` is settled; stop performed no process action, and release refused with `identity_unproven`. Its retirement is recorded, but physical chat closure is not confirmed.
- **USER DECISION**: Delegate implementation of the approved broad phone-file access default. Source: current user instruction, “delegate a worker to make that change, the access scope.”
- **OBSERVED**: Pi structured worker `ctx_bbddc9e7f0b1`, Task `task_0be51ae1d330`, Run `run_a118cdebb98c` started ready for access-scope implementation. Brief: ignored `.setup/broad-file-access/worker.md`; expected report: `docs/reports/broad-file-access.md`. Owns relevant runtime/Android/backend/UI access changes and focused verification; preserve board/UI work and user data. No provider spending or publication authorized. No routine monitoring; completion pending.

- **OBSERVED — PUBLISHED**: Public [0.1.0](https://github.com/nekoium/Olea/releases/tag/0.1.0) (`dev.olea`, 0.1.0/code 7, signed ARM64) was published on 2026-11-14. Assets, checksums, audit and limits: [publication record](archive/release-0.1.0/0.1.0-publication.md), [phone acceptance](archive/release-0.1.0/0.1.0-phone-acceptance.md), [public notes](archive/release-0.1.0/0.1.0.md).
- **OBSERVED**: Terminal fix `c6d6f34` (#1) passed physical Android 14 acceptance on a debug build and is pushed. It is not in a release, and release-signed APK acceptance was not performed. [Report](archive/issues/1-terminal.md).
- **OBSERVED**: Commits after `33ffd6d` are local and not pushed: the `board/` canvas utility, the app icon matched to `assets/readme/olea-icon-rounded.png`, issue-triage records and this documentation restructure.
- **OBSERVED**: The `board/` utility is a local Excalidraw canvas with Note/Task cards, separate from the Android app. [Setup](../board/README.md), [decisions, checks and limits](reports/project-board.md). Orca session integration is a feasible proposal, not implemented.
- **OBSERVED**: The icon change passed AAPT2 resource compilation and a byte comparison only. No full APK build or device visual check was performed.

## Issues

- **USER DECISION**: Default agent file access covers phone files available through Android's broad grant without per-folder authorization; workspaces organize work rather than constrain reach. Source: [PRODUCT.md, issue triage decisions](../PRODUCT.md#issue-triage-decisions), direct user instruction relayed from #13. Android grant/private-app boundaries remain; removal of every scoped-folder feature is not decided.
- **OBSERVED**: #13 worker reports MANAGE_EXTERNAL_STORAGE already exists while Linux exposes connected-workspace bindings only. Broad default runtime access is not implemented or verified by this decision update. Routine worker monitoring remains disabled at the user's request.

- **USER DECISION**: Closed as not planned: #2, #3, #6, #8, #14 (consolidated into #13). Deferred to “The far side”: #4, #9. #11 is T1. #11 and #13 need discussion. Source: [PRODUCT.md, issue triage decisions](../PRODUCT.md#issue-triage-decisions).
- **OBSERVED**: Closed as completed: #1, #5, #7, #13 (assigned access-scope implementation). Closed as not planned: #10. Open: #4, #9, #12 (“The far side”), #11.
- **AGENT PLAN**: Integrate the approved [Soft UI rebuild](ui/soft/CONTRACT.md) and Cabin commits for 0.1.1 after presenting the requested release image board. Keep #11 open until integration. Fixture rendering establishes appearance only; existing provider/device limits remain visible in release notes.
- **OPEN**: #13 needs the viewer's intended task and prior agent experience before choosing a demonstration. [Brief](discussions/issue-13/brief.md). #14 context: [archived brief](archive/issues/14-discussion/brief.md).
- **OBSERVED**: At the last record, #11 discussion worker `ctx_730ab14feada` and #13 discussion worker `ctx_61e4efdf074c` were kept open. Their current state is not verified.

## Verification limits

- **OPEN**: Provider-backed Codex/Claude tools, cancellation and continuation beyond connectivity. The #3 closure omits this work and does not establish passing results.
- **OPEN**: Devices other than the tested Android 14 ARM64 phone, recovery after process death, lock or reboot (#4), backup/export (#9), remaining physical permission-flow cases and the modified-talloc replacement recipe (#6, #8).
- **OBSERVED**: No provider-backed test allocation is active. The 0.1.0 allocation does not carry forward.

## Updating this file

Keep this page a short current snapshot. Replace stale lines instead of appending history. Put detailed results in a bounded record under `docs/` subfolders and link it. Label each line `USER DECISION`, `AGENT PLAN`, `OBSERVED` or `OPEN`. At handoff, record active workers, ownership, authorization and next actions.
