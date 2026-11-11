# Maintained core implementation plan

Spec: [approved core design](CORE_BUILD_HANDOFF.md). Execution: direct autonomous implementation in the existing root.

## File map and implementation choices

- `android/`: maintained API 36 Kotlin application, identity `dev.olea.app`. Minimal native Android widgets are an implementation choice, not a production UI decision.
- `android/app/src/main/java/dev/olea/app/Environment.kt`: verified packaged Ubuntu/Node extraction, explicit preparation, PRoot launch, persistent binds.
- `RuntimeService.kt`: one backend, bounded events, foreground notification and STOP. Reuse spike `OwnedProcess.kt` ownership checks.
- `MainActivity.kt`: environment progress, Pi messages/tool activity, configuration, saved conversation reopening.
- `backend/`: selectively copy stock Pi/Codex process adapters and shared backend; remove experiment provider defaults and mandatory experiment extension.
- `runtime/`: packaging inputs/provenance, runtime scripts, source-based build command. Generated archives/native binaries stay ignored.
- `docs/CORE_BUILD_RECORD.md`: bounded checks, local APK, failures and exact unverified acceptance.

## Tasks

- [ ] Package modern-target native executables and verified conventional Linux/Node assets. Build/install separate app without modifying historical packages.
- [ ] Prepare environment from the app, with finite commands, visible phases and actionable failures. Persistent workspace, agent home, session state and credentials bind outside replaceable rootfs. Never re-extract over an existing rootfs or replay a prompt.
- [ ] Connect shared backend and upstream Pi RPC. Store resume state atomically, disable automatic model retries, render streamed text/tools and retain saved session identity.
- [ ] STOP cancels setup/backend and tracked descendants; notification and screen expose STOP. Restart is explicit. Preserve data on stop/process failure.
- [ ] Verify build, focused backend data/STOP checks, fresh emulator preparation, stock no-model RPC/workspace action, STOP/reopen and same-package update preservation.
- [ ] Document ordinary installation/configuration/use and limitations. Save local source commits and exact verification receipts.

Provider-backed Olea submissions remain frozen. No model prompt, retry, fallback or replay is permitted. Live reply/tool selection by a model and continuation with a provider remain unverified unless separately allocated.

## Current device ownership

Core builder in this root is the sole device mutation owner for this bounded assignment. Inspected emulator-5554: boot complete, API36/x86_64; historical app/fixture present, no visible Node/PRoot processes. No worker was launched. Historical packages/data/services remain untouched.

## Preservation and review focus

Check interrupted setup, existing data refusal, process exit during startup, STOP while starting, output bounds and reopening without automatic submission. No broad historical matrix rerun. Rim spawn timed out at 20 seconds; status reports no root. Continue with Git; no destructive Rim repair.
