# Progress

Status: agent-managed snapshot of current state. It is not a product decision source. The full entry-by-entry history up to 2026-11-21 is in [the archived progress log](archive/PROGRESS_LOG_2026-11.md); do not treat its old worker, device or authorization states as current.

## Current state

- **USER DECISION**: Commit/integrate the approved interface and publish **0.1.1** as a UI update, with each before-and-after comparison listed individually in release notes. Source: current release conversation, “we can release 0.1.1 … UI update,” followed by approval, “Okay, great. Let's go … list the comparisons one by one.” [Product record](../PRODUCT.md#release-011).
- **OBSERVED — PUBLISHED**: [0.1.1 — The Soft UI update](https://github.com/nekoium/Olea/releases/tag/0.1.1) published 2026-11-21T10:49:30Z and marked latest. Tag `0.1.1` → `f310550`; master also includes independent review `cc09a4d`. The signed ARM64 APK, runtime source, notices and checksums all match remote SHA-256 digests; all public download endpoints and five separate comparison images passed verification. [Publication record](reports/release-0.1.1-publication.md).
- **OBSERVED**: Soft UI/Cabin merged in `6ca47aa`; release preparation `59922b0`. Signed ARM64 0.1.1/code8 assembled with lint **0 errors/39 warnings**, the 0.1.0 signing certificate, matching packaged Cabin/OFL bytes and verified runtime assets. Backend checks: 20 pass/0 fail/1 Windows-symlink skip. In-place update over signed 0.1.0 on `emulator-5554` succeeded and retained the setup step. No physical device or provider request. Runtime source companion extracted and all member checksums passed. [Verification and remaining limits](reports/release-0.1.1-verification.md).
- **OBSERVED**: Independent Pi review Task `task_e11362db8d4e` / Dispatch `ctx_36e4af233f43` completed. No concrete critical/high blocker or new credential leaks in source/blob/metadata/OCR/final-APK checks; APK hits exactly match public upstream fixtures. [Report](reports/release-0.1.1-review.md). The reviewer has no active assignment; signing staging was removed.
- **OBSERVED**: Release-note previews are now **320 px wide**, link to full-size images, and sit in a collapsed comparison section at the user's request. Download links remain above the previews. GitHub's Markdown renderer retained the sizing/collapse, and the published notes match the local file.
- **OBSERVED**: Approved [image board](discussions/issue-11/release-0.1.1/index.html) exports five PNG pairs: conversation, Settings, first use, provider setup and phone-access summary. The [public notes](releases/0.1.1.md) embed each pair separately; no combined board. Actual 0.1.0 captures and native Cabin sample-content captures retain complete frames/equal scale and [source hashes](discussions/issue-11/release-0.1.1/sources.json).

- **USER DECISION**: Cabin is the selected Soft UI font after browser comparison. Source: issue #11 chat, “I think cabin is great. Let's delegate a worker to make this change to app.” [Contract](ui/soft/CONTRACT.md), [font brief](../delegations/cabin-font/brief.md).
- **OBSERVED**: Cabin follow-up completed on the clean `soft-native-ui` checkout in commits `21c5ab0`, `7330806`, `c0793ee`. Bundled approved font and OFL; four true variable weights, preserved monospace, 22 native captures and focused x86_64 assembly/lint passed (0 errors, 39 warnings). [Result and rendering limits](../delegations/cabin-font/result.md). No provider requests; physical/OEM rendering remains unverified. The retained Pi worker completed dispatch `ctx_8ee67a39df26` / task `task_1fd1d7d3bb8a`; it has no active assignment.

- **USER DECISION**: The Soft UI and six-palette design is approved for a native interface rebuild, with the leaf-green Olea default from `ccabc09`. The user requests official contract docs and a separate implementation worker. [Product decision](../PRODUCT.md#approved-interface-rebuild--issue-11), [UI contract](ui/soft/CONTRACT.md), [palette values](ui/soft/palettes.json), [implementation plan](ui/soft/IMPLEMENTATION.md).
- **OBSERVED**: Soft native rebuild completed on `soft-native-ui` in commits `6f83e54`, `e1fa14d`, `711c152`, `54d087e`, `f84a080`, after contract `39e3a41`. The retained Pi worker completed dispatch `ctx_24df0f9f580b` / task `task_a353978de25e`. It preserved runtime/broad-file behavior, implemented six independently saved palettes and supplied native/real-terminal evidence. [Result and limits](../delegations/soft-ui-rebuild/result.md). No active rebuild assignment remains.
- **OBSERVED**: Native UI acceptance is bounded to the API 36 emulator, including real IME, narrow/enlarged text, permission-screen cancellation, actual PTY checks and palette continuity. Live provider conversations, physical-device and lifecycle acceptance remain unverified; no provider test spending is allocated.

- **OBSERVED**: Broad-access worker completed `94fb76f`; manager reviewed production bindings, permission/restart status, user copy and [bounded report](reports/broad-file-access.md). Android-granted shared storage is exposed at `/sdcard` and `/storage`, independently of workspace cwd/phone-tool toggle. Focused emulator denial/grant/revocation, stock Pi read/edit outside cwd, connected cwd separation, APK/backend builds and host checks passed; one Windows symlink skip, zero provider requests. Posted evidence and closed #13 as completed for its assigned access-scope implementation. Included in public 0.1.1; physical/OEM UX, live service restart, in-flight revocation and secondary volumes unverified. Original refusal/UI symptoms are not claimed fixed. Worker assignment is complete; earlier pending entries below are dispatch history.

- **USER DECISION**: The broad-file-access implementation worker owns #13; the former #13 discussion session is no longer needed. Source: current user instruction. Manager relayed issue ownership to `ctx_bbddc9e7f0b1`. **OBSERVED**: Old discussion dispatch `ctx_716c9f53d914` is settled; stop performed no process action, and release refused with `identity_unproven`. Its retirement is recorded, but physical chat closure is not confirmed.
- **USER DECISION**: Delegate implementation of the approved broad phone-file access default. Source: current user instruction, “delegate a worker to make that change, the access scope.”
- **OBSERVED**: Pi structured access worker `ctx_bbddc9e7f0b1` / Task `task_0be51ae1d330` / Run `run_a118cdebb98c` completed `94fb76f`; [report](reports/broad-file-access.md). No active access-scope assignment remains.

- **OBSERVED — PUBLISHED**: Public [0.1.0](https://github.com/nekoium/Olea/releases/tag/0.1.0) (`dev.olea`, 0.1.0/code 7, signed ARM64) was published on 2026-11-14. Assets, checksums, audit and limits: [publication record](archive/release-0.1.0/0.1.0-publication.md), [phone acceptance](archive/release-0.1.0/0.1.0-phone-acceptance.md), [public notes](archive/release-0.1.0/0.1.0.md).
- **OBSERVED**: Terminal fix `c6d6f34` (#1) passed physical Android 14 acceptance on a debug build and is included in public 0.1.1. [Report](archive/issues/1-terminal.md).
- **OBSERVED**: The `board/` canvas utility, rounded app icon, approved UI/typography, broad file-access implementation and related records are pushed. The Android changes are included in public 0.1.1; `board/` remains a separate utility.
- **OBSERVED**: The `board/` utility is a local Excalidraw canvas with Note/Task cards, separate from the Android app. [Setup](../board/README.md), [decisions, checks and limits](reports/project-board.md). Orca session integration is a feasible proposal, not implemented.
- **OBSERVED**: The rounded app icon is included in signed 0.1.1; full ARM64 assembly and in-place emulator launch passed.

## Issues

- **USER DECISION**: Default agent file access covers phone files available through Android's broad grant without per-folder authorization; workspaces organize work rather than constrain reach. Source: [PRODUCT.md, issue triage decisions](../PRODUCT.md#issue-triage-decisions), direct user instruction relayed from #13. Android grant/private-app boundaries remain; removal of every scoped-folder feature is not decided.
- **OBSERVED**: #13 broad shared-storage access is implemented in `94fb76f` and integrated into public 0.1.1; bounded checks and remaining limits are in the [report](reports/broad-file-access.md).

- **USER DECISION**: Closed as not planned: #2, #3, #6, #8, #14 (consolidated into #13). Deferred to “The far side”: #4, #9. #11 is T1. #11 and #13 need discussion. Source: [PRODUCT.md, issue triage decisions](../PRODUCT.md#issue-triage-decisions).
- **OBSERVED**: Closed as completed: #1, #5, #7, #13 (assigned access-scope implementation). Closed as not planned: #10. Open: #4, #9, #12 (“The far side”), #11.
- **OBSERVED**: Approved [Soft UI](ui/soft/CONTRACT.md) and Cabin are published in 0.1.1. #11 remains open; no issue closure was performed by this release task. Fixture rendering establishes appearance only, and existing provider/device limits remain visible in release notes.
- **OPEN**: #13 needs the viewer's intended task and prior agent experience before choosing a demonstration. [Brief](discussions/issue-13/brief.md). #14 context: [archived brief](archive/issues/14-discussion/brief.md).
- **OBSERVED**: At the last record, #11 discussion worker `ctx_730ab14feada` and #13 discussion worker `ctx_61e4efdf074c` were kept open. Their current state is not verified.

## Verification limits

- **OPEN**: Provider-backed Codex/Claude tools, cancellation and continuation beyond connectivity. The #3 closure omits this work and does not establish passing results.
- **OPEN**: Devices other than the tested Android 14 ARM64 phone, recovery after process death, lock or reboot (#4), backup/export (#9), remaining physical permission-flow cases and the modified-talloc replacement recipe (#6, #8).
- **OBSERVED**: No provider-backed test allocation is active. The 0.1.0 allocation does not carry forward.

## Updating this file

Keep this page a short current snapshot. Replace stale lines instead of appending history. Put detailed results in a bounded record under `docs/` subfolders and link it. Label each line `USER DECISION`, `AGENT PLAN`, `OBSERVED` or `OPEN`. At handoff, record active workers, ownership, authorization and next actions.
