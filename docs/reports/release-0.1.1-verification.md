# Release 0.1.1 verification

**USER DECISION**: Integrate the approved Soft native UI and Cabin typography and publish 0.1.1. Show the approved before-and-after comparisons individually in release notes. Source: [PRODUCT.md, release 0.1.1](../../PRODUCT.md#release-011), current release conversation. No provider-backed test allocation was made.

**OBSERVED**: Native work from `c0793ee` merged into master in `6ca47aa`; the three document-only conflicts retained the manager's current progress/original brief and worker's expanded Cabin contract. Production Kotlin/resources match the completed worker revision. Release preparation `59922b0` changes the Android version to 0.1.1/code 8 and prepares matching public notes, README, runtime companion names and source-cache reuse.

## Artifact

**OBSERVED**: Built through `runtime/build.sh` with `OLEA_ABI=arm64-v8a`, release signing and `:app:lintRelease`. Build completed with exit 0 on 2026-11-21. Lint: **0 errors, 39 warnings**. Existing Gradle memory/deprecation warnings remain. The build's checks verified all packaged runtime asset/native hashes against local pinned inputs, with ARM64 as the only native ABI.

| Property | Verified value |
| --- | --- |
| Package | `dev.olea` |
| Version | `0.1.1`, code `8` |
| ABI | `arm64-v8a` |
| Debuggable | false |
| APK bytes | 94,239,166 |
| APK SHA-256 | `84159c529acbd50c061de47df31658fd280ad9fb6c1b22024bc6153cba6fdf38` |
| Signing certificate SHA-256 | `1ada0fabc25ecfadc24947af43e56d7301b4f08f2262e434a90817510dca4989` — matches 0.1.0 |

**OBSERVED**: Used the existing user-supplied signing identity. Task-local staging was removed after the build; no credentials were stored in source, reports or artifacts. `apksigner verify --verbose --print-certs` passed. AAPT badging confirms the package, version, ABI and non-debuggable flag. Release resource optimization renames internal files; the verifier resolves Cabin and OFL through AAPT's resource table before hashing. Both packaged resources match their approved source hashes exactly.

## Checks

- **OBSERVED**: All 168 palette roles, six names/swatches, semantic colors, green default and unknown-ID fallback match the official contract.
- **OBSERVED**: Cabin source/font-license verification passes for the approved variable font, four weight range and normal width. Worker evidence covers actual weights and fallback; [Cabin result](../../delegations/cabin-font/result.md), [Soft rebuild result](../../delegations/soft-ui-rebuild/result.md).
- **OBSERVED**: Backend focused suite: 21 tests, **20 pass, 0 fail, 1 skip**. The skipped auth-symlink test requires Linux/Android because Windows cannot create the required unprivileged symlink. No provider requests were made.
- **OBSERVED**: The five separately captioned release-image URLs map to existing committed PNGs. Export hashes match the image board approved by the user. Full source frames remain at equal scale. No combined overview image is embedded in the public notes.
- **OBSERVED**: Explicit device `emulator-5554` was the only connected device. The signed ARM64 0.1.1/code 8 installed successfully with `adb install -r` over the existing signed ARM64 0.1.0/code 7. Both launches returned `Status: ok`; the UI retained the same “Prepare environment” setup step and “Environment stopped” status. The release opens with native Soft/Cabin. This is installation/setup-state continuity, not a complete user-file migration test or ARM64 runtime acceptance on x86_64. No uninstall, clear-data command, grant change or provider request occurred.

**OBSERVED**: Task-local raw logs/receipts remain ignored under `.setup/release-011/`: `build-release.log`, `build-result.json`, `signed-artifact.json`, `apksigner.txt`, `apk-badging.txt`, `backend-tests.log`, `upgrade-before.xml`, `upgrade-after.xml`, and `upgrade-launch.png`. They contain build/test state only; source/private configuration is excluded from release assets.

## Runtime companion

**OBSERVED**: The version-aware source assembler completed for 0.1.1. It verified all 219 source downloads and both ABIs' pinned runtime inputs; existing source cache entries were copied only after hash/size checks. Invalid version input was rejected before staging. The companion was extracted separately and every member of its `SHA256SUMS` passed. Runtime binary pins are unchanged; current launch/build/replacement recipes are included.

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| `olea-0.1.1-runtime-source.tar.gz` | 379,243,332 | `30d0ed7877c7110ba9024f5b91292061f53c6b4cfd1ecf0b238be1c562e6a6df` |
| `olea-0.1.1-runtime-NOTICES.txt` | 286,577 | `9f534396f865bc5da14a55ad7c0e763b5092f91ba7be447390d16cb17cfc94f5` |

**OBSERVED**: Public asset staging contains only the signed APK, runtime source companion, runtime notices and `SHA256SUMS.txt`. The exact public [release notes](../releases/0.1.1.md) link the five approved visual pairs individually and retain source/notice links beside the APK.

## Limits

**OPEN**: No physical device was connected for this release. Fresh provider-backed conversations, OEM/older Android font rendering, process-death recovery and broad device compatibility remain unverified. Existing worker emulator checks and historical physical checks retain their original scope. System keyboards/permission dialogs use Android typography; Cabin lacks some scripts and relies on Android fallback. The terminal remains experimental. Dedicated modified-talloc execution validation and broader permission matrices remain omitted under the existing user decisions.

**AGENT PLAN**: Complete the independent publication review, commit the release record, push source/tag, upload the four assets as a draft, verify remote digests and image links, then publish 0.1.1 under the user's release instruction. Record final URL, tag and download verification after publication.
