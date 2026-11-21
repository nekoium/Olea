# Olea 0.1.1 independent publication review

**OBSERVED — result:** No concrete critical/high release blocker or owned credential leak was found in the reviewed unpublished changes or selected final APK. Production source review ends at `59922b060c37bf615455f59a3e0c143578683147`; publication-record review additionally covers `61b265c273911a5d477eb73acfbb8a6630bd3c85`. The scanned APK SHA-256 is `84159c529acbd50c061de47df31658fd280ad9fb6c1b22024bc6153cba6fdf38`.

## Exact scope

**OBSERVED:** Reviewed integration commit `6ca47aa41d0e4375d787829074cbec07eb8f6b2d`, manager release-preparation commit **`59922b060c37bf615455f59a3e0c143578683147`**, and final verification/progress/notes commit **`61b265c273911a5d477eb73acfbb8a6630bd3c85`**. The final commit changes three documents and no production code. Baseline `origin/master` was `33ffd6d19c494a9eea7b912c4a0a49d2decbbf46`: 34 reachable unpublished commits through integration, plus the two manager commits. Gitleaks scans omit the contentless merge commit and reported 33 + 1 + 1 scanned commits.

**USER DECISION:** The dispatched task authorizes a bounded, read-only release review of the approved Soft native rebuild and Cabin font, plus unpublished publication material. The manager's follow-up explicitly includes `59922b0` and requests an APK scan only after `.setup/release-011/signed-artifact.json` exists. No provider budget, device operation, build, signing, Git/index mutation, public message or publication was authorized for this worker.

**OBSERVED:** The [0.1.0 publication security record](../archive/release-0.1.0/0.1.0-security.md) is the historical baseline. No broad audit of unchanged historical research, ignored credential stores or signing material was performed.

## Findings

| Severity | Finding | Disposition |
| --- | --- | --- |
| Critical / high | None confirmed in the reviewed delta. | No identified source blocker to pushing the reviewed commits. |
| Credential publication | No owned provider credential, signing private key or other secret confirmed in new Git text, newly reachable blobs, commit metadata, OCR output or the selected APK. | APK scanner matches are byte-identical to the classified public 0.1.0 fixtures; heuristic limits remain below. |
| Informational | `git diff --check` returns 2 for preserved upstream license line endings and retained build/download log whitespace. | No executable-source whitespace failure or functional impact identified; font-license bytes intentionally match the approved hash. No source edits requested. |

**OBSERVED:** Tracked delegation logs and receipts contain synthetic UI/terminal diagnostics and build records. The two new delegation trees were scanned along with the remaining unpublished files and intermediate blob versions. No new credential finding needed classification. OCR decoded all 158 newly reachable image blobs successfully; the credential scanner reported zero findings in their recognized text.

## Code review observations

- **OBSERVED:** Cabin uses the approved unmodified resource, complete OFL resource and four explicit variable-weight instances. Shared labels, editable fields, composer and reply body select the family with synthesis disabled. Code and terminal paths retain monospace. No font download or new runtime network path was introduced.
- **OBSERVED:** All six palette definitions match the approved contract. Palette selection remains separate from appearance and draft preferences. UI changes retain real runtime callbacks, rejected-send draft preservation, explicit reconnect, contextual workspace selection and reachable STOP actions.
- **OBSERVED:** Terminal theming supplies native-generated color JSON and a numeric font scale to the bundled page. Shell output and key scripts retain `JSONObject.quote`; output goes to `terminal.write`, without a new HTML evaluation path. Exact resource interception, navigation restrictions and file/content/network restrictions remain. Existing trusted-bootstrap `srcdoc` enforcement limits remain recorded baseline behavior, not a new blocker or a passing isolation claim.
- **OBSERVED:** Broad shared-file access in this unpublished range implements the explicit product decision. Native launch checks the actual Android grant and supplies the storage path separately from workspace bindings and phone-tool enablement. The shell validates a numeric primary-storage path and passes binds as quoted arguments. Native task/input preflight detects a changed grant/bind snapshot and requests STOP/Start. This does not establish instantaneous revocation of already running commands; Android remains the enforcing boundary.
- **OBSERVED:** `59922b0` changes the version to 0.1.1/code 8 without changing package identity or signing configuration. Source-companion version input accepts only three numeric components; path construction cannot inject parent segments. Cache reuse still checks each selected source hash and size. Archive assembly retains explicit selected-file enumeration and `--no-recursion`; the change does not include the surrounding `.setup/`, credential configuration or delegation trees.
- **OBSERVED:** Release notes give five individual comparison sections and preserve the sample-content and physical/provider acceptance limitations. The local canvas utility is separate from APK content; its new source was inspected for publication concerns, without a dependency-wide or browser interaction audit.

## Before/after pairs

**OBSERVED:** Verified the composite, before and after hashes for every entry in [the comparison manifest](../discussions/issue-11/release-0.1.1/sources.json): 15/15 hashes match the exact reviewed Git content. Each pair remains listed separately:

| Pair | Before | After |
| --- | --- | --- |
| [New conversation](../discussions/issue-11/release-0.1.1/conversation.png) | [0.1.0](../discussions/issue-11/captures/new-conversation.png) | [Cabin native draft](../../delegations/cabin-font/evidence/native/draft.png) |
| [Settings](../discussions/issue-11/release-0.1.1/settings.png) | [0.1.0](../discussions/issue-11/captures/settings-light.png) | [Cabin native Settings](../../delegations/cabin-font/evidence/native/settings.png) |
| [First use](../discussions/issue-11/release-0.1.1/first-use.png) | [0.1.0](../discussions/issue-11/captures/welcome.png) | [Cabin native welcome](../../delegations/cabin-font/evidence/native/onboarding.png) |
| [Provider setup](../discussions/issue-11/release-0.1.1/provider.png) | [0.1.0](../discussions/issue-11/captures/provider-editor.png) | [Cabin native provider](../../delegations/cabin-font/evidence/native/provider.png) |
| [Phone access](../discussions/issue-11/release-0.1.1/phone-access.png) | [0.1.0](../discussions/issue-11/captures/phone-access-entry.png) | [Cabin native summary](../../delegations/cabin-font/evidence/native/phone-access.png) |

## Checks and evidence

**OBSERVED:** Evidence remains ignored under `.setup/release-011/review/`. Only this report was added outside that directory; this worker did not stage or commit it.

| Check | Actual result | Local evidence |
| --- | --- | --- |
| Existing Gitleaks 8.30.1, integration Git delta | Exit 0; zero findings across 33 scanned commits. | `gitleaks-git.json`, `gitleaks-git.log` |
| Newly reachable integration blobs | 406 blobs, 25,511,308 bytes inventoried; raw-content scan exit 0, zero findings. Includes intermediate versions absent from final tree. | `objects.json`, `inventory-summary.json`, `gitleaks-blobs.json` |
| Integration commit metadata | Exit 0; zero findings. | `gitleaks-metadata.json` |
| New image OCR | 158/158 decoded; four OCR text scans exit 0, zero findings. | `ocr-jobs.json`, `ocr-chunk-*/ocr-results.json`, `gitleaks-ocr-*.json` |
| Manager release-preparation delta | Exit 0; zero findings in one additional commit. | `gitleaks-manager-delta.json`, `gitleaks-manager-delta.log` |
| Final verification/progress/notes delta | Exit 0; zero findings in `61b265c`; its three documents were read/reviewed against the bounded evidence. | `gitleaks-verification-delta.json`, `gitleaks-verification-delta.log` |
| Final signed APK scan | 94,239,166 bytes; 131 ZIP entries; 12,160 expanded files/metadata; 404,250,132 scanned payload bytes; 199 link metadata entries; zero decode failures; unchanged APK hash. Scanner exit 1 means findings required classification. | `apk-scan-result.json`, `apk-84159c529acbd50c-1795257518595/summary.json` |
| APK baseline comparison | 11 raw / 21 decoded matches; zero new matched files/rules/locations. All match published 0.1.0 by canonical member, complete scanned-file SHA-256, line and columns. | `apk-baseline-comparison.json` |
| APK font and OFL | PASS: independently located packaged resource payloads by their approved hashes; both match source. | `apk-baseline-comparison.json` |
| Existing font verifier | PASS: approved font/OFL hashes, weight/width axes and sampled cmap fallback preconditions. | `font-verification.json` |
| Existing palette parity check | PASS: 168 roles, names/swatches, shared state colors, default and invalid-ID fallback. | `palette-parity.txt` |
| Comparison hashes | PASS: all five pairs, all 15 referenced/composite files. | `checks.json` |
| Shell / packaging syntax | `bash -n runtime/linux.sh` and `node --check runtime/source/assemble.mjs` exit 0. | Commands run directly; no Android build. |
| Whitespace | Original and CRLF-aware checks return 2 for licenses/retained evidence whitespace. | `diff-check.txt`, `diff-check-crlf.txt` |
| Reviewed source consistency | Current production Kotlin, terminal HTML, runtime launcher and companion script matched `59922b0`; consistency check exit 0. | Final direct Git comparison. |

**OBSERVED:** Scanner reports use full redaction. Extracted temporary Git blobs and raw OCR text were removed after scanning; hash inventories, redacted results and the reproducible task scripts remain. No private value is copied into this report.

## Selected final artifact

**OBSERVED:** After the initial readiness check found no signed-artifact receipt, the manager supplied the completed receipt and explicitly requested scanning. Scanned only `.setup/core/arm64-v8a/olea-arm64-v8a-release.apk`, SHA-256 `84159c529acbd50c061de47df31658fd280ad9fb6c1b22024bc6153cba6fdf38`, 94,239,166 bytes. It matches `.setup/release-011/signed-artifact.json`; scanner rehash confirmed the APK did not change during inspection. No waiting or polling occurred.

**OBSERVED:** Ran the existing `apk-snapshot.mjs` through an owned copy with exactly one change: relocate its hardcoded output root from `.setup/release-010/security/` into the permitted `.setup/release-011/review/`. APK ZIP entries, backend/Node/Ubuntu tar payloads, binary strings and link metadata were scanned. The selected APK has 11 raw and 21 decoded scanner matches. Every match has the same rule, canonical archive member, complete scanned-file hash, line and columns as the published 0.1.0 APK `00553730906e2b9a6cd70dc33bebff53ebba83c2d9c09a19e3ed1ba86833844c`. The baseline record classifies these as public upstream code/documentation, verification keys and GnuTLS self-test keys. No changed or unmatched credential candidate remains.

**OBSERVED:** Independently confirmed the packaged Cabin font and OFL bytes against the approved source hashes. Release AAPT names are `res/Mp.ttf` and `res/NO.txt`; an initial diagnostic lookup using original resource filenames failed, then the content-hash lookup passed. This was a lookup assumption in the review script, not missing packaged resources.

**OBSERVED — manager evidence:** The receipt records `dev.olea`, 0.1.1/code 8, ARM64, non-debuggable and certificate SHA-256 `1ada0fabc25ecfadc24947af43e56d7301b4f08f2262e434a90817510dca4989`, matching the published signing identity. The manager reports release lint with zero errors / 39 warnings. This worker did not access signing configuration or independently rerun signature verification, build or lint.

## Limits and remaining work

**OPEN:** No Android build, lint rerun, device acceptance, live provider conversation, signing-key access or publication occurred in this review. Earlier worker reports remain attributed emulator evidence. The manager's [verification record](release-0.1.1-verification.md) additionally reports a successful signed update installation and source-companion checksum verification; this worker did not repeat them. The manager independently owns final checksums, source/report integration and publication.

**OPEN:** Secret scanning and OCR are heuristic; successful decoding does not guarantee every glyph was recognized. APK expansion covers the inherited scanner's formats, not every possible nested encoding. This review does not cover all possible binary/dependency vulnerabilities, untracked private data, unreachable Git objects or later commits/artifacts. No new hardening policy or standing release gate is proposed.
