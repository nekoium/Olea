# Olea 0.1.1 publication

**USER DECISION**: Publish the approved Soft UI/Cabin update as 0.1.1, with each approved before-and-after pair shown individually. Source: [PRODUCT.md](../../PRODUCT.md#release-011) and the current release conversation.

**OBSERVED — PUBLISHED**: [Olea 0.1.1 — The Soft UI update](https://github.com/nekoium/Olea/releases/tag/0.1.1) is public and marked latest. GitHub release ID `453618891`; published **2026-11-21T10:49:30Z**. Repository visibility remains public.

**OBSERVED**: Annotated tag object `772a281e3c21f1628bbed1e2ed2cc1fa9fa5cfd6` peels to source commit **`f3105508806669cff2a8208642afa0cc16a541af`**. Master additionally contains the independent review at `cc09a4d`. The native implementation was merged in `6ca47aa` from completed worker revision `c0793ee`; release version/preparation is `59922b0`. No production source changed after the signed build. Later publication records do not move the release tag.

## Published assets

**OBSERVED**: Each GitHub asset's state, size and server-provided SHA-256 digest match the staged local artifact. All four public unauthenticated download endpoints respond successfully with the expected content length. The public checksum file was downloaded and compared byte-for-byte. The APK and source archive were verified using the server digest and endpoint metadata rather than downloaded a second time.

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| `olea-0.1.1-arm64-v8a.apk` | 94,239,166 | `84159c529acbd50c061de47df31658fd280ad9fb6c1b22024bc6153cba6fdf38` |
| `olea-0.1.1-runtime-source.tar.gz` | 379,243,332 | `30d0ed7877c7110ba9024f5b91292061f53c6b4cfd1ecf0b238be1c562e6a6df` |
| `olea-0.1.1-runtime-NOTICES.txt` | 286,577 | `9f534396f865bc5da14a55ad7c0e763b5092f91ba7be447390d16cb17cfc94f5` |
| `SHA256SUMS.txt` | 287 | `934dddb1deb8a185a2d7ef07328993a20aa4fca9ce557fc8ef2f183fa80fca08` |

**OBSERVED**: Public notes match [the committed notes](../releases/0.1.1.md), with five separately captioned comparisons and no combined overview embedded. All five images were fetched from the public tag and match their approved hashes. Source and notices remain direct downloads beside the APK.

**OBSERVED — note-size follow-up**: At the user's request, the published notes now use five linked previews at 320 px width inside a collapsed comparison section. Each pair retains its own caption; download links stay near the top. GitHub's Markdown renderer preserves the width and collapsed state, and the remote body matches the updated local notes. This is an editorial update; the release tag and downloadable artifacts retain their original values.

**OBSERVED — palette showcase follow-up**: The six-palette horizontal showcase is now included in the committed release notes and README. It is a single 960 px preview linked to the full-size `palettes.png` export; the six source captures remain separately hashed in the repository. The published GitHub release body was updated to match.

## Checks and limits

**OBSERVED**: Signed package is `dev.olea`, 0.1.1/code 8, ARM64 only, non-debuggable. Certificate SHA-256 `1ada0fabc25ecfadc24947af43e56d7301b4f08f2262e434a90817510dca4989` matches 0.1.0. Packaged Cabin and OFL bytes match the approved sources. Release assembly/lint passed: 0 errors / 39 warnings. Backend focused tests: 20 pass / 0 fail / 1 Windows-symlink skip. The signed APK installed over 0.1.0 on `emulator-5554` and retained its setup step. [Verification](release-0.1.1-verification.md).

**OBSERVED**: Independent Pi reviewer completed Task `task_e11362db8d4e` / Dispatch `ctx_36e4af233f43`. Source/blob/metadata/OCR and final APK checks found no concrete critical/high blocker or new owned credential leak. All scanner hits in the final APK exactly match audited public upstream fixtures. Final manager documentation commits were separately scanned with no findings. [Independent review](release-0.1.1-review.md). Scans are heuristic and not a complete vulnerability assessment.

**OBSERVED**: The user-supplied signing identity was read from the approved vault. Task-local key staging was removed after signing; the vault was not modified. No key/password was included in source, reports, release assets or notes. Only the emulator was connected. No physical-phone acceptance or provider-backed request occurred. OEM/older Android rendering, untested scripts and lifecycle recovery retain their documented limits; the terminal remains experimental. No additional validation scope is implied by publication.

## Operational record

**OBSERVED**: The first foreground source push timed out before acknowledgment. Remote refs were checked; a background atomic push subsequently completed, and a direct retry reported everything up to date. Remote master/tag values were verified; no force push or tag correction occurred.

**OBSERVED**: Initial draft creation uploaded checksums/notices, but its two large uploads stalled through the local proxy. Only that task-owned `gh` upload process was stopped. The existing draft and completed assets were retained; the missing APK/source uploads succeeded directly in 48 seconds. All asset hashes and the exact source tag were verified before changing the draft to published.

**OBSERVED**: Raw receipts are ignored task evidence under `.setup/release-011/`: `remote-verification.json`, `public-download.json`, `public-assets.json`, `upload-direct-result.json`, build/signature/upgrade receipts and redacted review evidence. The temporary source extraction, empty signing staging directory and device XML capture files were removed after verification. Distribution artifacts and bounded verification logs remain available locally.
