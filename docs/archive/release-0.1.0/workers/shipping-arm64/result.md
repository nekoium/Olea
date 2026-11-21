# ARM64 packaging result — PRE-CLAUDE

**OBSERVED**: Task 1 implementation and isolated packaging proofs completed. Both selected-ABI debug APKs build and pass deterministic archive/native/APK checks. These artifacts use the committed pre-Claude backend and Android integration; they are not integrated release or device acceptance.

## Source and ownership

Implementation commit: `6d2b80758ef9db1460f7b631349b0467f3b9e74d` (`Package matching ARM64 and x86 Linux runtimes with ABI admission`).

Changed only assigned packaging/Environment files and bounded packaging helpers:

- `runtime/build.sh`: `OLEA_ABI=x86_64` (default) or `OLEA_ABI=arm64-v8a`, manifest-driven pins, per-ABI download/extraction/artifact paths, ELF checks, packaged asset/native byte checks, and one-ABI APK assertion. Uses project-local Gradle/npm caches and `--no-daemon`.
- `runtime/upstream-inputs.json`, `runtime/checksums/2026-11-13-upstream.txt`, `runtime/THIRD_PARTY.md`: both architectures' exact inputs, upstream checksum provenance and native hashes.
- `runtime/verify-elf.mjs`: small non-executing ELF class/endianness/machine verifier.
- `android/app/build.gradle.kts`: explicit `-PoleaAbi=...`, ABI filter, generated `BuildConfig.RUNTIME_ABI`, and preBuild rejection of mismatched runtime assets.
- `Environment.kt`: checks device ABI and packaged ABI; checks existing/staged Ubuntu shell and Node ELF headers. Rejects mismatched or incomplete existing runtimes with a data-preserving actionable error. Public interfaces, bootstrap flow, data binds and user files are preserved.

`runtime/linux.sh` needed no change: its existing native-directory lookup, PRoot loaders and binds work for either selected package. No backend, agent maintenance, RuntimeService, SessionStore, MainActivity, product/progress/UI record or credential store was edited by this worker. No ADB, device mutation, provider requests, remote push or publication occurred.

## Snapshot isolation

Per coordinator instruction, all npm/backend compilation, generated Android assets and Gradle output were confined to:

`.setup/core/packaging-verification/pre-claude-d671b93/`

Exact base commit: `d671b93ee73c349382cc0c19437ce24b25e512b2`.

Snapshot creation used `git archive HEAD android backend runtime | tar -xf - -C .setup/core/packaging-verification/pre-claude-d671b93` while HEAD was that base. Only the seven owned paths listed in [overlays.sha256](overlays.sha256) were overlaid from current packaging sources; no current backend/other Android edits, ignored stores or provider configuration were copied. Immutable package archives and the extracted Gradle distribution were copied into snapshot-local paths. Gradle read dependencies through the existing project-local cache using its read-only cache feature; generated caches are snapshot-local.

[x86-overlays.sha256](x86-overlays.sha256) records the exact x86 overlay before a final APK-ABI assertion and informational manifest/checksum additions. [overlays.sha256](overlays.sha256) records the final source overlay used for ARM64 and committed implementation. The Android and ELF-check code hashes are identical between the two overlays. The final one-ABI assertion was also independently executed against the x86 artifact.

## Exact build commands

Discovered existing JBR: `C:/Program Files/Android/Android Studio/jbr` (OpenJDK `25.0.4`, build `25.0.4+-16339643-b508.27`). Existing SDK: `C:/Users/Aria/AppData/Local/Android/Sdk`, platform `android-36`, build-tools `36.0.0`. Gradle: project-local `9.1.0`.

Run from the repository root:

```bash
cd .setup/core/packaging-verification/pre-claude-d671b93
JAVA_HOME='C:/Program Files/Android/Android Studio/jbr' \
ANDROID_HOME='C:/Users/Aria/AppData/Local/Android/Sdk' \
GRADLE_RO_DEP_CACHE='C:/Users/Aria/Projects/Development/Olea/.setup/core/gradle-home/caches' \
OLEA_ABI=x86_64 bash runtime/build.sh > x86-build.log 2>&1

JAVA_HOME='C:/Program Files/Android/Android Studio/jbr' \
ANDROID_HOME='C:/Users/Aria/AppData/Local/Android/Sdk' \
GRADLE_RO_DEP_CACHE='C:/Users/Aria/Projects/Development/Olea/.setup/core/gradle-home/caches' \
OLEA_ABI=arm64-v8a bash runtime/build.sh > arm64-build.log 2>&1
```

The script invokes:

```bash
.setup/core/gradle-9.1.0/bin/gradle --no-daemon -p android :app:assembleDebug --max-workers=2 -PoleaAbi=arm64-v8a
```

The x86 command substitutes `-PoleaAbi=x86_64`. Both script exits were `0`; the captured Gradle sections report successful builds in 47s and 11s respectively. Full logs and exit files remain in the isolated snapshot root.

## Artifact identities

| PRE-CLAUDE ABI | Repository-relative APK path | SHA-256 |
| --- | --- | --- |
| ARM64 | `.setup/core/packaging-verification/pre-claude-d671b93/.setup/core/arm64-v8a/olea-arm64-v8a-debug.apk` | `7e258c0c95858e3476d19a6ad80b0a123e4201d8f3e52d2fb9b4d5f4af5a37c1` |
| x86_64 | `.setup/core/packaging-verification/pre-claude-d671b93/.setup/core/x86_64/olea-x86_64-debug.apk` | `289d832c2a954fe865a8f59f1328b1032aa4ceb53145aad134215f7aba7d3fe3` |

Both identify as `dev.olea.app`, versionCode `6`, versionName `0.2-base`, minSdk `26`, target/compile SDK `36`. This task did not change release versioning. AAPT reports only `arm64-v8a` and `x86_64` respectively. Both APKs pass `apksigner verify --verbose --print-certs`, with APK Signature Scheme v2 and the Android Debug certificate SHA-256 `093df267c399324663e90467dbbd859f36498f4c16f34ac49119c4c23ee3e437`. They are debug-signed, not release-signed.

Detailed evidence: [APK hashes and packaged entries](apk-checks.txt), [ARM64 badging](arm64-badging.txt), [x86 badging](x86-badging.txt), [ARM64 signing](arm64-signing.txt), [x86 signing](x86-signing.txt).

## Deterministic checks

**OBSERVED**:

- Exact Ubuntu `24.04.3` arm64/amd64 and Node `24.20.0` Linux arm64/x64 SHA-256 values match upstream HTTPS checksum lists. Exact Termux PRoot `5.1.107.102`, libtalloc `2.5.0`, libandroid-shmem `0.7` hashes match upstream architecture package-index stanzas. Gradle's pin also matches its upstream checksum file. Evidence is retained under `runtime/checksums/` with source URLs.
- Downloaded ARM64 bytes match those upstream pins; existing x86 cache bytes pass the same checks before use. Native files are copied byte-for-byte, with Android packaging names only.
- Before packaging, Ubuntu `usr/bin/dash`, Node `bin/node`, PRoot, loader, libtalloc and shmem all have matching ELF64 little-endian architecture (`183` AArch64 or `62` x86-64). `loader32` correctly has ELF32 little-endian architecture (`40` ARM or `3` i386); it is the upstream compatibility loader, not a second guest rootfs.
- ELF verifier self-check passed 20 positive/rejection assertions across four formats, wrong machines, wrong classes, big-endian headers and invalid signatures; see [checks.txt](checks.txt). Temporary synthetic ELF fixtures were removed after the check.
- Each APK contains exactly one selected native ABI and five expected native entries. Every native entry matches the pinned native hashes. Each APK's Ubuntu, deterministically repacked Node, backend and ABI marker match its packaged `hashes.txt`. Three bootstrap scripts match their snapshot source. Hash detail is in `apk-checks.txt`.
- Android compilation passed for both selected ABIs. `bash -n runtime/build.sh` and `git diff --check` passed.
- Negative build admission: running snapshot Gradle `:app:preBuild --no-daemon --max-workers=2 -PoleaAbi=x86_64` against the ARM64 assets failed with exit `1` and `Runtime assets do not match x86_64. Run runtime/build.sh with OLEA_ABI=x86_64.` Expected failure is retained in snapshot `abi-mismatch.log` and `.exit`. No generated assets were changed by this test.

## Failures and limits retained

**OBSERVED**: Initial speculative `Packages.xz` URL returned HTTP 404. The actual uncompressed upstream `Packages` endpoints worked and supplied exact matching package/version/architecture hashes. The AArch64 index SHA-256 was `84d489d43bc45af29c0d526cfdb8ca0c759a2c137347710004716fe5b14d3a02`, matching the upstream Release entry fetched alongside it. No GPG/signature validation is claimed; provenance is the upstream HTTPS authorities.

**OBSERVED**: Exploratory whole-deb extraction on Windows reported broken/unavailable symlink targets for copyright links and libtalloc SONAME links. This was not the packaging route; the existing selective regular-file extraction used by both successful builds avoids those entries. Native component copyright/source/relinking obligations still require redistribution preparation as documented in `THIRD_PARTY.md`.

**OBSERVED**: First standalone apksigner invocation omitted `JAVA_HOME` and failed before inspecting the APK; [first-attempt output](arm64-signing-first-attempt.txt) is retained. Repeating with the discovered JBR passed for both APKs. Builds emitted existing SDK XML-version, manifest `extractNativeLibs`, and deprecated Android UI API warnings; signing emitted a JDK native-access warning. These did not fail verification.

**OPEN**: x86 evidence here is packaging and compilation only, with no new emulator or device runtime execution. ARM64 runtime admission/prepare, PRoot/Node execution, Android 14 compatibility, stock-agent installation and real agent/phone behavior remain untested by this worker. Byte/ABI checks do not establish device acceptance. Backend gzip archives differ between builds because their tar metadata was regenerated; this is expected, and each packaged archive was checked against its own build hash.

**OPEN / manager follow-up**: Build final integrated sources after the Claude worker finishes, using `OLEA_ABI=arm64-v8a` and the discovered JBR/SDK. Only the manager may install/update the app on the explicitly selected physical device, preserve existing data, validate runtime/agent behavior and complete acceptance. Coordinate shared generated resources before using the original source tree. Release signing, dependency redistribution material and private release publication remain separate authorized manager work; neither PRE-CLAUDE artifact is a release candidate claim.
