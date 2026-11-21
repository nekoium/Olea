# Cabin typography result

**Outcome: succeeded.** Cabin is bundled and applied throughout the native Soft UI, including editable fields and the composer, with real 400/500/600/700 variable-font instances and no synthesis. Existing monospace code/terminal, all six palettes, geometry, 48 dp targets, data and runtime behavior are preserved.

**USER DECISION**: “I think cabin is great. Let's delegate a worker to make this change to app.” Source: issue #11 comparison of Trebuchet, Cabin, Fira Sans and Source Sans 3, relayed in [the supplied brief](brief.md). The worker checkout's [contract](../../docs/ui/soft/CONTRACT.md) now records that exact decision and marks the former system-sans adaptation superseded. The master checkout was read only; no merge, reset or cherry-pick was used.

## Implementation and provenance

**OBSERVED**: Baseline `f84a080`; implementation commit **`21c5ab0`** and focused diagnostic commit **`7330806`**. The evidence/report commit follows these in local Git history. No push, publication, signing, GitHub write or issue closure occurred.

- Unmodified approved `Cabin[wdth,wght].ttf` copied from the master checkout to [cabin_variable.ttf](../../android/app/src/main/res/font/cabin_variable.ttf). SHA-256: `a16576e6cec01cf994c46838ed1c17ffdb62cf6da8430edfbcb011f57dd62457`.
- Complete copyright/SIL OFL copied to [cabin_ofl.txt](../../android/app/src/main/res/raw/cabin_ofl.txt). SHA-256: `965bf33673aec648a3b399185639e502b58e52693d004fc03f6bbdf21b1a0094`. Copyright 2018 The Cabin Project Authors (`https://github.com/impallari/Cabin.git`). A precise `.gitattributes` rule preserves its approved bytes across platforms.
- [Source provenance](evidence/provenance.json) retains the original Google Fonts URLs and Git blob IDs from the supplied `sources.json`. [Font verification](evidence/font-verification.json) confirms the exact hashes, `wght` 400–700 and normal `wdth` 100. [Runnable verification](evidence/verify-font.mjs) also confirms the tested CJK/Arabic characters are absent from Cabin itself.
- [SoftTypography.kt](../../android/app/src/main/java/dev/olea/app/SoftTypography.kt) registers four normal-style resource faces from that one file, each with explicit `wght` 400/500/600/700 and `wdth` 100. The supported variation API in the existing Compose dependency requires a narrowly scoped `ExperimentalTextApi` opt-in; no dependency or SDK change was introduced.
- Shared `Label`, shared `Field`, the composer's `BasicTextField`, and assistant `ReplyBody` now all select `SoftFontFamily` with `FontSynthesis.None`. These are all four direct production text-style paths found in the [caller audit](evidence/typography-paths.txt). All headings, labels, preferences, notices and phone-access controls inherit these paths. Existing normal/semibold hierarchy is retained; medium and bold are registered and rendered in the weight check.
- `FontFamily.Monospace` remains selected for technical labels, fenced code and inline code. `TerminalUi.kt` and `terminal.html` have no diff from `f84a080`; terminal transport/runtime testing was not repeated for a font change.
- About → Licenses now shows a Cabin heading and the **full** copyright and OFL before the preexisting Android UI notices. Both resources are included in the APK; [font](evidence/apk-font.sha256) and [license](evidence/apk-license.sha256) were extracted from the final normal production APK and match the approved source hashes.

## Native evidence and checks

**OBSERVED**: Explicit device `emulator-5554`, Android 16/API 36, x86_64, 1080 × 2400 px, 420 dpi (411 × 914 dp). Installed using `-r` into the preexisting separate `dev.olea.softtest` / `dev.olea.softtest.test` diagnostic identities; no normal Olea installation was replaced, no application was uninstalled/cleared, and no physical device was used. No agent, PTY or provider request was started by this diagnostic.

| Check | Actual result |
| --- | --- |
| Source font/OFL | PASS: exact SHA-256 against the supplied manifest; font variation axes retained. |
| Production build/lint | PASS: final normal `:app:assembleDebug :app:lintDebug`, matching x86_64 assets, `--no-daemon`; [log](evidence/build-production.log). Lint has **0 errors / 39 warnings**, [full report](evidence/lint.txt); the added warning is the same resource-access idiom already used by the existing license reader. |
| Diagnostic assembly | PASS: isolated app and Android test APKs built using the existing diagnostic init script and `-PsoftRunner=dev.olea.app.CabinFontInstrumentation`; [log](evidence/build-diagnostic.log). Final test-only capture refinements also compiled and ran successfully. |
| Actual resource resolution | PASS: Compose resolves four resource faces; the APK font/OFL hashes match sources. [Native receipt](evidence/native/receipt.json) records the registered family and glyph metrics. |
| Actual weight outlines | PASS: resolved-face paints have `isFakeBoldText=false`; glyph widths and painted alpha coverage differ and increase across the four explicit axes. See the table below and [weight capture](evidence/native/weights-and-fallback.png). |
| Fallback | PASS: source cmap lacks the tested Chinese/Arabic glyphs, while resolved Android faces report `hasGlyph=true` for CJK, Arabic and emoji; a mixed-script native specimen renders them. This is fallback evidence for those samples, not every script. |
| Changed journeys | PASS: **22 native captures** cover the realistic long reply at top/end, the reference conversation, code, joined composer with actual Gboard, Settings and a real palette selection/Back, onboarding, editable provider form, phone-access summary and full Cabin license. [Final log](evidence/native-final.log), [capture metadata](evidence/native/receipt.json). Snapshots are synthetic; rendering, keyboard and Compose font resolution are real. |
| Narrow/enlarged text | PASS: native 320 dp content constraint and scoped 1.5× sp scaling for conversation, composer/IME, Settings, onboarding and form/actions. No global device font/density setting changed. |
| Palette continuity | PASS: ordinary Settings → Soft purple → Back preserves all four resolved typefaces and the unsent draft; purple/dark is also captured. All six exact palette roles still pass [the existing parity check](evidence/palette-parity.txt). |

| Explicit `wght` axis | Sample width at 48 px | Painted alpha coverage | Fake bold |
| --- | ---: | ---: | --- |
| 400 | 575 px | 1,650,737 | false |
| 500 | 578 px | 1,828,623 | false |
| 600 | 582 px | 1,914,930 | false |
| 700 | 585 px | 2,058,835 | false |

**OBSERVED**: Android's `Typeface.weight` metadata reports the file's default **400** for every variation instance. That metadata alone does not describe the selected variable outline. The code explicitly selects each real axis, Compose resolves all four declared resource faces, synthesis is disabled, and the measured glyph shapes/widths differ. The native receipt retains the metadata rather than relabeling it as 500/600/700.

## Comparisons and wrapping

- [Interactive before/after and browser-Cabin/native gallery](evidence/comparisons.html), with [exported native comparison](evidence/comparison-native.png).
- [Reference conversation](evidence/native/conversation-reference.png), [long reply](evidence/native/conversation-top.png), [unchanged monospace code](evidence/native/conversation-code.png).
- [Actual keyboard composer](evidence/native/draft-keyboard.png), [320 dp / 1.5× composer](evidence/native/draft-narrow-keyboard.png).
- [Settings](evidence/native/settings.png), [320 dp / 1.5× Settings](evidence/native/settings-narrow.png), [purple/dark](evidence/native/settings-purple-dark.png).
- [Onboarding](evidence/native/onboarding.png), [enlarged/narrow onboarding](evidence/native/onboarding-narrow.png), [provider editor](evidence/native/provider.png), [enlarged/narrow form actions](evidence/native/provider-narrow-actions.png), [full Cabin license in the app](evidence/native/cabin-license.png).

**OBSERVED**: No size, spacing, geometry or line-height adjustment was necessary. The measured 14 sp paragraph at 25.2 sp line height takes five lines at 411 dp in both Cabin and the earlier system font. At 320 dp and 1.5× sp scaling, Cabin takes ten lines versus eleven for system sans; no measured width/height overflow. Real screenshot review confirms normal wrapping, scrollable long text/forms and a composer above the keyboard. Larger headings and palette descriptions wrap further at enlarged text as expected, without shrinking the font or touch targets.

**OBSERVED**: Browser references were captured from the approved comparison's Cabin mode; `document.fonts` reported loaded, and the served font binary matched the same approved SHA-256. Browser 390 × 844 CSS px and native 411 × 914 dp images preserve their different proportions. Android antialiasing, fallback, line breaking, system bars and real IME remain platform-specific; no pixel-identical rendering claim is made.

## Failures, adaptations and remaining limits

**OBSERVED**: The first compile failed because Compose's variable-font resource overload requires an explicit experimental API opt-in. Added the local opt-in and rebuilt successfully; [original failure](evidence/build-initial-optin-failure.log) is retained. The first passing capture run opened the long conversation at its existing automatic bottom position and let the test-only weight specimen overlap the status bar; the diagnostic was corrected to scroll to the top, add a dedicated code specimen and honor safe insets. Product geometry did not change.

**OBSERVED**: Build artifacts remain ignored under `.setup/cabin-font/`; [hashes](evidence/artifacts.sha256) identify the actual diagnostic app/test APKs. The tracked generated ABI marker is restored to its baseline value after checks; ignored generated assets are x86_64, so run `OLEA_ABI=x86_64 bash runtime/build.sh` before a fresh direct Gradle invocation to generate a matching marker.

**OPEN / rendering limits**: Acceptance is bounded to this API 36 emulator. Older Android font rasterizers, OEM/system fallback fonts and scripts outside the tested samples remain unverified. Cabin is the supplied upright font; no italic font is added. System keyboard, status bars and permission dialogs intentionally retain Android typography. Provider, backend, physical-phone and broad runtime matrices were intentionally not run for this focused font change; zero provider spending occurred. The completed native rebuild's earlier runtime limits remain unchanged.
