# Integrated ARM64 device and signing checkpoint

**OBSERVED**: Both implementation workers completed and their records are retained: [ARM64 packaging](../shipping-arm64/result.md), implementation `6d2b807` / evidence `3605520`; [Claude integration](../shipping-claude/result.md), implementation `195198b` / evidence `aed85ab`. The manager reviewed the reports and built the integrated sources. The backend worker reported 17 passing deterministic checks and a zero-prompt stock Claude initialize exchange; no provider-backed Claude functionality is implied.

## Android 14 execution

**OBSERVED**: The reviewed pre-Claude ARM64 APK installed and opened on the explicitly selected physical Android 14/API 34 ARM64 phone. First setup failed before PRoot execution because snapshot bootstrap scripts used CRLF; maintained source was LF. The diagnostic Android shell reported `set: -\r: unknown option`. Manager fix `58756e3` normalizes and validates packaged script line endings and pins runtime shell scripts to LF through `.gitattributes`.

**OBSERVED**: A corrected integrated debug APK built and installed with `adb install -r`, preserving application storage. The Linux guest ran Node `v24.20.0` and resolved public DNS. Canonical Ubuntu HTTP/HTTPS initially timed out while npm was reachable. User then enabled the phone proxy; both original Ubuntu endpoints returned HTTP 200. A proposed mirror fallback was removed before commit/build; normal Ubuntu sources and their signature checks remain unchanged.

**OBSERVED**: The first Pi npm installation was still downloading dependencies when its five-minute timeout expired, returning exit 137. Its cached packages and failure receipt were preserved. Manager fix `aa7e507` uses eight download sockets and a bounded ten-minute npm install window rather than two sockets/five minutes. A subsequent integrated debug APK updated in place and resumed preparation.

**OBSERVED**: The latest actual Olea screen reads **Pi ready**. This establishes app-owned ARM64 Linux/PRoot/backend/stock Pi startup on the Android 14 phone. No on-phone model prompt had been submitted at this checkpoint. It does not establish model connectivity, canonical conversation continuation, or phone-tool behavior.

Current integrated debug artifact: `.setup/core/arm64-v8a/olea-arm64-v8a-debug.apk`, SHA-256 `d197d422430b2b2a46689f385d6f36de57da33ebbfe11f92fcf5cf490601b321`, version `0.2-base` / code 6. Device commands/logs and package-preparation receipts remain under ignored `.setup/device-acceptance/`; device identifiers and credential values are excluded here.

## Signing preparation

**USER DECISION**: Dedicated local release key creation and the accessible SecureFolderFS destination were approved in the separate discussion. The user retains the vault password and accepted PC-only storage for now. [Exact decision record](../shipping-discussion/signing-decision.md). No remote key upload, Syncthing setup, or Google Play publication is authorized.

**OBSERVED**: A dedicated RSA-4096 PKCS12 signing key was created, alias `olea-release`, public subject `CN=Olea`. Public certificate SHA-256: `1A:DA:0F:AB:C2:5E:CF:AD:C2:49:47:AF:43:E5:6D:73:01:B4:F0:8F:22:62:E4:34:A9:08:17:51:0D:CA:49:89`.

**OBSERVED**: Manager commit `ee0fb95` adds optional locally signed release builds, with signing configuration supplied by environment, not committed values. An ARM64 `0.2-base` release preflight APK was independently verified by apksigner against that certificate and is not debuggable. SHA-256 `df2fe2059483b165a7a5cd4834f38c6339b794bf60d10769bc7c4ca93c3d3c18`. It predates the npm-window patch and is a signing preflight, not final 1.0.0 or signed-device acceptance. The initial release build client exceeded its 55-second tool window; Gradle later completed, then artifact inspection/signature verification passed. The timed-out attempt remains recorded.

**OBSERVED**: Signing material was copied into a unique directory within the user-approved unlocked SecureFolderFS view. The keystore bytes, credential readback and public certificate exported using keytool from the vault were verified before the manager removed only its original generated project-local key and password files. Local `.setup/signing/location.json` contains a vault locator, not passwords. Public certificates and redacted receipts remain local. No material was uploaded remotely. Initial UNC-path escaping failed before transfer; originals were retained until the corrected transfer completed.

**OPEN**: Independent/off-PC recovery is not established; PC-only custody is the user's current decision. The existing on-phone debug signature differs from the release identity. Final signed-device installation must preserve user data and must not silently uninstall the debug package or clear app storage.

## Remaining acceptance

- **OPEN**: On-phone minimal connectivity: Pi and Codex with `gpt-6.1-terra`, Claude Code with `claude-haiku-4-5-20251001`; optional agents still require on-phone installation.
- **OPEN**: Real or token-intensive tests use Pi only with `gpt-6.1-sol`: workspace/tool work, streaming, interruption/STOP, saved conversation continuation and permission-controlled phone scenarios.
- **OPEN**: Production native UI implementation/acceptance remains with the separately discussed design; the browser demo is not shipped native UI.
- **OPEN**: Final 1.0.0 version/source snapshot, signed release artifact acceptance, dependency redistribution materials, final credential/security checks and private GitHub APK release.

## Manager Takeover Checkpoint

**OBSERVED**: Provider settings were written to Olea-private storage with mode `600` for Pi/GPT `gpt-6.1-sol`, Codex/GPT `gpt-6.1-terra`, and Claude/Haiku `claude-haiku-4-5-20251001`. Pi remains the only agent used for provider-backed functionality. The temporary credentials are not recorded in the repo.

**OBSERVED**: On-phone Pi/GPT connectivity passed on Android 14 ARM64: `gpt-6.1-sol` returned exact marker `OLEA_PHONE_CONNECTED`, saved in the conversation. A synthetic workspace test passed: Pi's `write` tool created `olea-test-8f3c.txt` with exact contents `OLEA_WORKSPACE_WRITE_OK`; follow-up transcript and private-file checks confirmed success after an initial early poll.

**OBSERVED**: The approved browser scenario passed with Pi `gpt-6.1-sol`. Olea phone tools were enabled through Olea UI, and `phone_open_url` dispatched `https://example.com`; Firefox became foreground and its accessibility tree showed “Example Domain” and `example.com`. Accessibility, location, notification, folder, and capture grants remain disabled.

**OPEN**: Pi cancellation is unverified. The long test prompt remains as an unsent draft. Android's `ime hide` is unsupported; Back hid the keyboard by leaving Olea's foreground Activity. No model request or cancel was issued. Olea and its runtime remain alive.

**OBSERVED**: Codex installation on-device exited status 1 after several minutes and the app exposed only a generic error; npm's output was discarded. A private diagnostic launch attempt exited 127 before npm ran. No Codex install marker exists. Claude has not been installed. Pi was restored to **Pi ready** after the failed maintenance attempt. The package's existence on npm is verified, but the device failure cause remains unknown.

**OBSERVED**: `npm --prefix backend test` passes all 17 backend tests; `npm audit --prefix backend --omit=dev` reports zero vulnerabilities; `sh -n runtime/linux.sh runtime/prepare.sh runtime/agent-maintenance.sh` and `git diff --check` pass.

**OPEN**: Provider-backed on-phone Codex/Claude smoke tests require successful installation. Pi cancellation and STOP/reopen acceptance remain open. Native Compose UI, final 1.0.0 signed build/device acceptance, redistribution materials, final exact-snapshot credential review, and private GitHub release remain open.

**OBSERVED**: The latest concurrent UI discussion confirms onboarding, an Olea-managed workspace, Android-folder connection feasibility, and multiple live sessions as user decisions; mandatory-vs-optional permissions, all-workspace view, shared-storage root behavior, and exact session-state presentation remain open. Source: [experience-map discussion](../docs/ui/EXPERIENCE_MAP_DISCUSSION.md). This does not approve production UI changes.

**OBSERVED**: Android lint initially found three errors. Commit `07ceadd` fixes API-26 stderr draining and explicit location-permission revocation handling. ARM64 `compileDebugKotlin` and `lintDebug` now pass with zero errors; eight warnings remain (target SDK, single-ABI ChromeOS suggestion, backup rules, application icon, context static-field analysis, and UI localization strings). These need review against product/UI decisions, not blanket suppression.

**OBSERVED**: The live Android app process remains present and `MainActivity` is resumed. At the last unobscured UI inspection, Pi was ready. At the final check, the notification shade covered the app, so the selected conversation/runtime readiness could not be reverified. No APK was installed and no runtime stop was issued during this manager pass.

