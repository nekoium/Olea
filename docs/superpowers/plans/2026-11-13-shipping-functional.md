# Shipping Functional Work Implementation Plan

**AGENT PLAN**: Bounded engineering execution derived from the user's shipping-today decisions; it does not settle UX or promise today's acceptance.

**Goal:** Run the maintained application on the connected ARM64 Android 14 phone, integrate stock Claude Code, and establish the authorized agent checks.

**Architecture:** Preserve Kotlin Android authority, Linux/PRoot, the shared Node backend, and stock agent adapters. Keep user data outside replaceable runtime components. Production UX is owned by the separate design discussion; make only minimal functional exposure in the current native UI.

**Tech Stack:** Kotlin/Android, Bash packaging, TypeScript/Node, stock Pi/Codex/Claude Code.

**Spec:** [Product decisions](../../../PRODUCT.md#shipping-today-decisions) and [provider/device preflight](../../../delegations/shipping-preflight/result.md).

## Global constraints

- **USER DECISION**: Pi, Codex and Claude Code remain required for 1.0.0. Signed APK distribution is through a private GitHub release.
- **USER DECISION**: Minimal connection-and-run checks only for Codex/GPT and Claude Code/Claude, using low-version usable models. All real or token-intensive functionality tests use Pi with `gpt-6.1-sol`, including all phone-access behavior.
- **USER DECISION**: Supplied temporary credentials are authorized for today's testing without a specific spending cap. Keep credentials in ignored local configuration, out of code, prompts, command arguments, reports, commits and shared history. No unrelated credential stores.
- **USER DECISION**: Agent selection/installation UX remains open; users choose their setup. Do not silently adopt automatic Pi/default-workspace policies.
- Preserve concurrent edits and personal data. Never uninstall, clear app data, or delete/replace workspaces. Manager alone owns physical-device mutation.
- Workers use Pi. Own only assigned files; commit only owned paths. Keep task receipts in separate delegation directories. Do not modify shared product/progress/UI discussion records.

## Review focus

- Runtime ABI selection must pair native libraries with matching Ubuntu/Node archives; no x86 guest on ARM64.
- Existing x86 builds/data remain supported; detect mismatched existing runtime explicitly rather than deleting it.
- Agent start/stop races must preserve process ownership, uncertain delivery and no automatic replay.
- Provider keys must not enter generated archives, normal shell environment inheritance, protocol events or shared errors.
- Missing agent installation/authentication and interrupted startup must produce actionable failures.

## Task 1: ARM64 packaging and runtime admission

**Ownership:** `runtime/build.sh`, `runtime/linux.sh`, `runtime/upstream-inputs.json`, `runtime/THIRD_PARTY.md`, `android/app/build.gradle.kts`, and `android/app/src/main/java/dev/olea/app/Environment.kt`. Add bounded packaging helpers only if needed. Do not edit backend, agent maintenance, RuntimeService, SessionStore, MainActivity or UI discussion files.

**Interface:** Preserve `Environment.initialize()`, `prepare(progress, run)`, `linux(vararg args)` and `builder(command)`. Produce APK(s) whose runtime and native ABI match, with build selection explicit and x86 preserved. Keep bootstrap/data binds unchanged.

- [ ] Verify exact ARM64 upstream archive/package availability and hashes from upstream checksum/package indexes. Existing desired versions have returned HTTP 200, but checksums are not yet established.
- [ ] Add minimal ABI-aware input/native packaging and Android admission. Avoid bundling two unselected guest root filesystems unless required; separate selected-ABI builds are acceptable.
- [ ] Check archive/native ELF architecture, verify APK assets against expected hashes, and build with project-local Gradle/tool caches and `--no-daemon`.
- [ ] Confirm existing x86 build path remains valid; retain any failures and artifact identities. Do not install or mutate devices.
- [ ] Commit only owned changes; report exact build command, APK path/hash, deterministic checks and remaining device steps in `delegations/shipping-arm64/result.md`.

## Task 2: Stock Claude integration

**Ownership:** `backend/src/`, `backend/test/`, `runtime/agent-maintenance.sh`, and minimal functional changes to Android `RuntimeService.kt`, `SessionStore.kt`, and `MainActivity.kt`. Do not edit packaging/Environment/build files, shared docs, or UI discussion artifacts. Coordinate any required packaging interface change through manager.

**Interface:** Add Claude as a distinct immutable per-session agent, preserving current Pi/Codex protocols and data paths. Use stock supported noninteractive/streaming session interfaces, separate persistent homes, optional upstream install/update and configurable HTTPS Anthropic endpoint/model/API credentials. Keep shared authenticated phone-tool registration available as supported integration; do not run Claude phone-behavior tests.

- [ ] Inspect installed/upstream stock Claude protocol and Linux ARM64 installation requirements. Prove the chosen unpatched route and record any blocker rather than inventing compatibility.
- [ ] Implement minimal start/prompt/events/history-resume/interrupt/close behavior consistent with existing backend ownership and no-replay rules. Add lean fixture regressions for Claude protocol and startup/cancel boundaries.
- [ ] Add optional upstream install/update, saved agent identity and minimal current-UI configuration/selection. Do not decide first-run defaults or redesign UI.
- [ ] Run focused backend tests. Provider-backed tests are limited to connection-and-run using `claude-haiku-4-5-20251001`; local desktop connectivity already passed, so reuse it unless changed integration requires a new check.
- [ ] Commit only owned changes; report checks, commits, protocol/version limits and manager integration steps in `delegations/shipping-claude/result.md`.

## Manager integration and device acceptance

- [ ] Review/integrate worker changes; build and install with explicitly selected physical device and `adb install -r`.
- [ ] Verify packaged agent minimal connectivity: Pi/GPT and Codex/GPT with `gpt-6.1-terra`; Claude Code/Claude with `claude-haiku-4-5-20251001`. Stop Codex/Claude provider testing once these pass.
- [ ] Run real saved-conversation, workspace/tool, cancellation, reopen and phone-access scenarios only through Pi with `gpt-6.1-sol`. Reuse stable native evidence and focus new checks on changed integration/hardware.
- [ ] Record actual Android consent steps needing user participation. Never treat development-granted privileged access as normal app behavior.
- [ ] Prepare signing configuration without committing keys. User retains release-key backup; signing-key custody is still unresolved.
- [ ] Verify final signed APK and source snapshot for credential exclusion, dependency redistribution material, checksums and truthful release notes before private release publication.
