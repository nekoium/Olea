# Issue 7: reconcile public 0.1.0 documentation

**OBSERVED**: Documentation reconciliation is complete in implementation commit `a12b2bc7108eba2362b48c74ec0f352ef1f70a40` (`Reconcile documentation with public 0.1.0 release`). [Issue #7](https://github.com/nekoium/Olea/issues/7) remains open for coordinator review; no GitHub write or publication occurred.

## Changes

- **OBSERVED**: [README](../../README.md#install-and-get-your-first-reply) now describes the available signed ARM64 APK, links its exact download and release notes, and discloses the blank experimental terminal with [#1](https://github.com/nekoium/Olea/issues/1). Public copy contains no internal workflow or test report.
- **OBSERVED**: [Roadmap](../ROADMAP.md) records completed publication/audit/source-notice delivery separately from terminal maintenance and bounded acceptance gaps. It reflects the [user's triage](../../PRODUCT.md#issue-triage-decisions): #2/#3 closed as not planned, #4/#9 deferred to “The far side”, #11 T1 and #11/#13/#14 needing discussion. Proposed checklists are not commitments. Closed #5 does not imply new compatibility evidence.
- **OBSERVED**: Twelve bounded release reports receive only an opening supersession note. Their original bodies, failed receipts, preliminary hashes, limits and proposed checks are unchanged. Notes link the later publication/phone evidence and corresponding remaining issues without claiming all proposed checks passed or historical workers remain active.

## Read-only public verification

**OBSERVED**: Verified on 2026-11-17 UTC using `gh repo view`, `gh release view 0.1.0`, `gh issue list --state all`, and read-only issue API calls. Repository visibility is `PUBLIC`; release is neither draft nor prerelease, published `2026-11-14T03:00:38Z`. This matches the [bounded publication record](../releases/0.1.0-publication.md), including the missed deadline by 38 seconds.

| Public asset | Bytes | GitHub SHA-256 |
| --- | ---: | --- |
| `olea-0.1.0-arm64-v8a.apk` | 94,114,170 | `00553730906e2b9a6cd70dc33bebff53ebba83c2d9c09a19e3ed1ba86833844c` |
| `olea-0.1.0-runtime-source.tar.gz` | 379,242,553 | `92002ee40b6bbae3335686288845064381231e15a674f505f44887032a52ae02` |
| `olea-0.1.0-runtime-NOTICES.txt` | 286,540 | `2b8111d947094e38e405d4a71a8f9cd89d36170d91a397c74f81653d6c97d871` |
| `SHA256SUMS.txt` | 287 | `4bde67746b592ec534d242850172a9ad54ec44fdd7c172a5571a69b34e1f1035` |

**OBSERVED**: All four assets are `uploaded`; names, sizes and GitHub digests match the publication record. Anonymous HTTP HEAD requests followed redirects and returned 200 for the release page and all four exact download links. This confirms current public availability; assets were not downloaded or independently rehashed during this task.

**OBSERVED**: Live issue metadata confirms #2/#3 `closed` with `not_planned`, #4/#9 milestone “The far side”, and #11 `Priority: T1`. #11/#13/#14 remain open. #5 is closed with `completed`; its state is recorded without inferring additional runtime evidence.

## Focused checks

- **OBSERVED**: Inline Node assertions passed for four asset metadata matches, non-draft release status/time, 40 local Markdown destinations/anchors across the README, roadmap and added report notes, and both README image paths. No stale “planned 0.1.0 APK”/“when 0.1.0 is available” copy or pending roadmap publication gate remains.
- **OBSERVED**: Compared each annotated historical report against its pre-edit Git body: all 12 original bodies are unchanged after the first heading. Existing ignored evidence links were preserved rather than treated as newly published evidence.
- **OBSERVED**: `git diff --check` and staged `git diff --cached --check` passed. Staging was explicitly limited to the 14 implementation documentation files listed below. This report is committed separately as the evidence checkpoint.

## Changed files

**OBSERVED**: Implementation commit changes:

- `README.md`
- `docs/ROADMAP.md`
- `docs/releases/0.1.0-build-wrapper.md`
- `docs/releases/0.1.0-execution.md`
- `docs/releases/0.1.0-phone-acceptance.md`
- `docs/releases/0.1.0-phone-ui.md`
- `docs/releases/0.1.0-readme.md`
- `docs/releases/0.1.0-redistribution.md`
- `docs/releases/0.1.0-runtime.md`
- `docs/releases/0.1.0-security.md`
- `docs/releases/0.1.0-shared-folders.md`
- `docs/releases/0.1.0-terminal-fix.md`
- `docs/releases/0.1.0-ui-licenses.md`
- `docs/releases/0.1.0-ui.md`

**OBSERVED**: Evidence checkpoint adds only `docs/issues/7-release-docs.md` (this file). PRODUCT.md, docs/PROGRESS.md, source/tests, other discussion reports, and the publication record were not edited.

**OPEN**: Coordinator must review this evidence, update manager-owned progress, and decide issue closure. No build, device access, provider spending, runtime validation, browser rendering, GitHub write, push, or publication was performed. Existing runtime defects and unverified acceptance remain separate from completed documentation reconciliation.
