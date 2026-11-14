# Prepublication secret audit

**OBSERVED — current readiness for user-owned sensitive information: no confirmed owned operational secret in the audited snapshot.** This is bounded evidence, not a guarantee or approval of a later publication snapshot. Current uncommitted changes require a final scan before publication; concrete audit limits appear below and in [the follow-up record](remediation.md).

**USER DECISION — narrowed scope, direct user clarification after the initial audit:** “We just keep my sensitive information not shown.” The user specified: “Sensitive information includes my LLM access key and cloud flare private key or something like that”. The current requirement covers owned private credentials, authentication material, personal/private content, and sensitive identifiers. Third-party public documentation configuration and ordinary development metadata do not require redaction merely because they contain keys or identifying text.

**OBSERVED — historical initial result under the earlier broader API-key-free interpretation:** publication was reported blocked because nine distinct Google API keys occur in six tracked research snapshots, with 54 occurrences in the current tree. The same six unchanged blobs are present in every local branch and tag. These appear to be public Google documentation client configuration, not Olea-owned provider credentials; their validity, restrictions, and ownership were not tested. Their presence remains an audit finding but does not block publication under the narrowed requirement by itself. No history rewrite is required solely for these values.

No Olea-owned operational credential or actual private personal content was confirmed by this audit. Ordinary metadata was identified separately below; the audit does not establish absence of sensitive content in unexamined or later-modified material.

## Coverage and tools

**OBSERVED — local snapshot audited on 2026-11-13, approximately 12:24–12:32 UTC.** HEAD was `b51ec93bcec26f47dc4e84699442053831429ad8`. The seven ref tips below remained unchanged during the audit. Concurrent working edits to `PRODUCT.md`, `PROGRESS.md`, `TECH_STACK.md`, and UI/delegation material were preserved; the index had no staged changes.

| Surface | Exact coverage |
| --- | --- |
| Local refs | Six branches and one annotated tag; all enumerated below. No remote-tracking or stash refs were present. |
| Reachable Git objects | 206 commits, one tag object, 1,426 trees, and 1,990 unique blobs: 3,623 objects total. All blob versions were read through `git cat-file --batch`, including deleted and branch-only versions. Blob content totaled 70,699,934 bytes. |
| Git changes | Gitleaks scanned all 206 commits with `--all --full-history`, independently of the full-blob scan. |
| Commit/tag metadata and paths | Complete raw reachable commit and annotated-tag objects, including messages and author/committer metadata; historical changed paths and ref names. Gitleaks scanned approximately 212 KB of this material; targeted patterns also checked it. No credential finding there. |
| Current files | 1,625 tracked paths plus 31 nonignored untracked paths: 1,656 copied files, 27,531,069 bytes. Includes modified tracked files, current UI material, research/vendor source, HTML, XML, receipts, reports, and scripts. No symlink skips occurred. This audit's own temporary directory was excluded from that initial snapshot. |
| Binary/image evidence | Ten unique reachable binary image blobs: six PNGs and four WebP assets. Three additional tracked PNG paths reuse already-scanned PNG blobs. All 21 untracked UI JPEGs were included. Local OCR succeeded for six unique PNGs and all 21 JPEGs; Gitleaks found no secrets in the resulting 22,368 characters. Four WebPs could not be decoded by Windows imaging or FFmpeg; raw bytes were still scanned. |
| Archives and external objects | Extension and ZIP/gzip magic checks found no reachable ZIP/tar/gzip/JAR/APK/keystore archives. No Git submodule entries or LFS pointers were found. Nested archive traversal was nevertheless enabled to depth four, with decoding depth five. Large ignored build/runtime archives were excluded, as described below. |

Tools: **Gitleaks 8.30.1**, default built-in rules, no repository allowlist suppression, `--ignore-gitleaks-allow`, full redaction; **Git 2.55.0.windows.5**; **Node.js 24.20.0** for local enumeration, byte-preserving snapshots, targeted pattern checks, and deduplication; local **Windows.Media.Ocr** through Windows PowerShell; **FFmpeg 9.0.2** for an unsuccessful WebP decoding fallback. Gitleaks was not preinstalled: its official Windows x64 release archive was downloaded from GitHub and its SHA-256 matched the published release checksum. Only scanner distribution files were downloaded; repository content was never uploaded or sent to a scanning service.

Scan results:

| Scan | Findings | Interpretation |
| --- | ---: | --- |
| Git changes, all refs | 55 | 54 Google key occurrences; one generic-rule prose false positive. |
| All unique historical blobs | 55 | Same 54 key occurrences and prose false positive; no additional scanner finding. |
| Current eligible files | 54 | Same Google key occurrences; no extra finding in nonignored untracked files. |
| Commit/tag/path/ref metadata | 0 | No Gitleaks finding; targeted credential patterns also found none. |
| Local image OCR | 0 | Subject to OCR limits and four undecodable WebPs. |

Targeted checks supplemented Gitleaks for provider token formats, Google keys, private-key headers, quoted credential assignments, bearer/header construction, URL credentials, JWTs, machine paths, and email metadata. A broader historical assignment pass grouped 1,786 token/secret/password/credential-related occurrences into 59 distinct literal values; review separated fixtures, symbolic names, localization text, configuration paths, and policy prose from credentials. No additional operational secret was confirmed.

## Historical third-party configuration finding

**OBSERVED — F1: third-party Google API keys in archived documentation and all refs.** The same nine distinct keys repeat once per file below. Every listed file has a single historical version and was introduced by commit `3b2ab4e853e84d98a5ea18245870636fc7b7bd6c`. The surrounding HTML is archived `developer.android.com` configuration. This explains the initial broader key-free finding; F1 alone is not evidence of the user's sensitive information and is not a blocker under the clarified requirement. No key value or partial key is reproduced in this report.

| Affected path | Line in working tree and original blob | Occurrences |
| --- | ---: | ---: |
| `research/dsh-go/source/accessibility.html` | 52980 | 9 |
| `research/dsh-go/source/android-10.html` | 10138 | 9 |
| `research/dsh-go/source/android-14.html` | 10271 | 9 |
| `research/dsh-go/source/android-15.html` | 10441 | 9 |
| `research/dsh-go/source/android-16.html` | 10998 | 9 |
| `research/dsh-go/source/foreground.html` | 10196 | 9 |

Every ref below both reaches the introducing commit and contains all six affected files at its tip:

| Affected ref | Audited tip object ID |
| --- | --- |
| `refs/heads/master` | `b51ec93bcec26f47dc4e84699442053831429ad8` |
| `refs/heads/nekoium/core-adapters` | `22e6311056eb84a1a2b623c1fcfebe40f1ddd69d` |
| `refs/heads/nekoium/core-phone` | `0ec018856ecd83dee0dfe728190a338c00658927` |
| `refs/heads/nekoium/core-sessions` | `2797a360a5512a3822f05fc780026063094cef5f` |
| `refs/heads/nekoium/m3-native-phone` | `b4c693f7b4f87c826372bed06086bf4e461f8548` |
| `refs/heads/nekoium/m5-pi-independent` | `2a616036be8f6794a8192315411c5f483c41d7fc` |
| `refs/tags/feasibility-m1` | `825f43d1b2fa82f5eaba06994c763ae43e178994` (annotated tag object) |

**AGENT PLAN — historical proposal, canceled after the user's scope clarification:** the initial recommendation was to sanitize the six working files and remove their key-bearing contents from all publishable historical versions, using a coordinated history rewrite or a sanitized fresh publication history. That recommendation is retained as history, not current work or authorization. No research document was deleted, no original or copy ref was rewritten, and no credential was rotated. If an owned active credential is found in a future scan, remediation must cover both the intended files and reachable history, and credential revocation/rotation must be handled separately; a new redaction commit alone does not remove prior exposure.

## False positives and personal metadata

**OBSERVED — not confirmed credentials:**

- The sole Gitleaks `generic-api-key` finding is ordinary prose in `PROGRESS.md`, attributed to commit `848e07d852fa2eeb462cbd88857169f761a6c6a9`, reported added-line 9. It matched wording beginning with “authenticated Claude”; there is no credential assignment. Git patch line attribution differs from the final file's line numbering.
- `backend/test/adapters.test.mjs` contains deliberate provider and bridge fixtures, including an invalid URL-userinfo rejection case at line 41. Historical variants of that test account for the targeted URL-userinfo matches.
- `spike/m3/runtime/final-seven-registration-a01.mjs:7` and `spike/m3/runtime/pi-registration-a01.mjs:6` use explicit synthetic noncredential values consisting of lowercase words separated by hyphens. Their comments and reports identify registration-only fixtures. They are not evidence of real provider keys.
- `spike/tests/m2/evidence.test.mjs` and bridge tests contain fixture tokens; runtime authorization templates interpolate configuration rather than embedding a real token. Android UI XML `password` attributes are boolean metadata. Vendor localization text, credential-file paths, and Android intent-extra constants are not credentials. Vendor Cloudflare documentation contains example commands rather than a confirmed Cloudflare token.

**OBSERVED — privacy metadata, separate from secrets:** the targeted path detector found machine-directory references in 152 current eligible files, including `CONTRIBUTING.md:37`, `docs/CORE_BUILD_HANDOFF.md:50`, `docs/UI_DESIGN_HANDOFF.md:23`, and untracked `delegations/ui-design/check-scenarios-02.mjs:5`. Historical commit objects include normal author/committer email identities. Research snapshots and retained test evidence also include third-party authorship, device/runtime paths, and provider endpoint/model names. None of these is an authentication secret by itself. Under the clarified scope, ordinary author identities, usernames, machine paths, and endpoint/model names do not require sanitization solely because they are metadata. No actual private content or sensitive identifier beyond ordinary development metadata was confirmed; these detectors are not a full personal-content review. Usernames, email values, device identifiers, and machine-directory values are omitted here.

## Ignore rules and accidental-add risks

**OBSERVED:** `.gitignore:1` excludes `.setup/` at any depth; `.gitignore:4` excludes `.rim/`; lines 5–7 exclude `.env` and `.env.*` but explicitly permit `.env.example`; lines 8–10 exclude `*.local`, `*.log`, and `local.properties`. Brainstorm state and `.last-*` files are ignored, including the existing `.superpowers/brainstorm/.last-token`. `.setup/`, `backend/.setup/`, and `.rim/` exist. Their contents and ignored token stores were not opened to obtain secrets. Root `.env`, `.env.local`, and `.env.example` were absent at inspection.

`backend/.gitignore:1` excludes `node_modules/`, including nested dependency trees; line 2 excludes `dist/`. Android and historical spike Android ignore rules exclude Gradle/build outputs, local properties, native libraries, and named runtime assets. Existing ignored Android assets include runtime `.bin` files and generated scripts; ignored build and setup directories also contain packaged/runtime artifacts. They are outside the eligible-file scan and must remain excluded. `git ls-files --cached --ignored --exclude-standard` returned no currently tracked paths that rely on those ignore rules.

**OPEN — concrete inclusion risks:** ignore rules do not prevent `git add -f`, do not protect already tracked history, and do not generally exclude arbitrary `credentials.json`, `auth.json`, `.npmrc`, private-key files, or signing keystores placed in otherwise eligible directories. No credential-named historical file was found by the targeted path check, but that is not protection for future additions. `.env.example` is intentionally eligible and must contain only placeholders if created. All 31 initially untracked nonignored files, including UI screenshots and delegation scripts, were scanned; they are eligible for accidental inclusion. Select publication files explicitly and scan the final staged snapshot rather than assuming ignored state or this moving-workspace snapshot is enough.

## Safe local commands and reproducibility

The audit used the following read-only Git inventory operations. Content-bearing output was consumed locally by the audit scripts rather than printed:

```sh
git for-each-ref --format='%(refname) %(objectname)'
git rev-list --all --count
git rev-list --objects --all
git cat-file --batch-check='%(objectname) %(objecttype) %(objectsize)'
git cat-file --batch
git log --all --format= --name-only -z
git ls-files -z --cached --others --exclude-standard
git ls-files --others --ignored --exclude-standard --directory
git ls-files --cached --ignored --exclude-standard
git check-ignore -v .env .env.production .env.example .setup/api-keys.json local.properties
git diff --cached --quiet
```

Gitleaks commands used a project-local temporary executable and fully redacted reports. The eligible worktree snapshot was built only from Git's tracked/nonignored file list; the blob directory contained all 1,990 unique historical blobs, preserving bytes and filename extensions. Metadata and OCR output were kept in separate scan directories.

```sh
# Substitute the installed Gitleaks 8.30.1 executable for gitleaks.
gitleaks git . --log-opts='--all --full-history' --redact=100 \
  --ignore-gitleaks-allow --max-archive-depth=4 --max-decode-depth=5 \
  --no-banner --no-color --report-format=json --report-path=history-redacted.json

# Run once for each local eligible-worktree, historical-blob, metadata, and OCR snapshot.
gitleaks dir <project-local-snapshot> --redact=100 --ignore-gitleaks-allow \
  --max-archive-depth=4 --max-decode-depth=5 --no-banner --no-color \
  --report-format=json --report-path=<project-local-redacted-report.json>
```

Use project-local output paths excluded from subsequent snapshots; do not scan the unrestricted working directory because that would open ignored credential stores. Gitleaks exit code 1 represented findings, not a scan failure. Temporary scanner files, raw snapshots, OCR text, and reports were removed after summarizing them here; do not add raw source snapshots or scanner work directories to publication.

## Limits and next action

**OPEN:** no online validity checks or provider-backed Olea tests occurred. Secret detection is heuristic and may miss arbitrary credentials, unusual encodings, image text, steganography, or undocumented formats. OCR is approximate; the four undecodable assets are `research/dsh-go/source/docs/assets/f-phone-{en,zh}-{dark,light}.webp`. They were raw-byte scanned but their visible contents were not established. Ignored credential stores, ignored build/runtime archives, external home-directory configuration, reflog-only/unreachable objects, and future concurrent edits are outside this audit. The repository was not shallow and no LFS/submodule content was deferred.

Coordinator work remains: scan the exact final publication refs and staged files, including current uncommitted changes selected for inclusion, for owned credentials and actual sensitive content. The public Google configuration does not require a rewrite under the user's narrowed requirement. No files outside this audit's report/temporary directory were changed; no remotes, pushes, credential rotations, deletions of user files, or history rewrites occurred. See [the follow-up record](remediation.md) for the canceled-copy status and observed concurrent changes.
