# Maintained core build record

Status: bounded implementation complete, with provider-dependent acceptance explicitly unverified. Final local APK: `android/app/build/outputs/apk/debug/app-debug.apk` (also `.setup/core/olea-core-0.1-x86_64.apk`), version `0.1-core`, versionCode5, about85MiB. SHA256: `efd72665648d51fece209fd47738009534a3da988f67b4658308e25629ebf334`.

Assignment: `docs/CORE_BUILD_HANDOFF.md`, approved at `d62c1d3`. Direct builder in the existing root; no worker, manager replacement, remote or publication.

## Source and implementation

Maintained source is in `android/`, `backend/` and `runtime/`. Android identity is `dev.olea.app`, separate from all historical evidence packages. API36/x86_64 is the current build/validation target. Minimal native Android widgets are a builder implementation choice; the production UI toolkit remains open.

`files/data/workspace`, `files/data/home` and `files/data/sessions` bind into the Linux runtime separately from `files/runtime/rootfs`. Pi uses its stock RPC protocol. Kotlin owns process startup, a foreground notification, STOP and bounded rendering. Shared backend source retains the Codex adapter without presenting a complete Codex workflow. That inactive adapter still carries its historical experiment-provider policy and needs explicit configuration work before product exposure; no Codex entry or provider is activated by this app. This core does not activate phone tools.

## Retained attempts

- `1e7b550`: first maintained source checkpoint. Two focused host checks passed: saved session/workspace preservation without prompt replay, and bounded Unicode JSONL handling. These use an explicitly labeled protocol fixture and are not stock-agent acceptance.
- First Android build passed. Local `.setup/core/core-a01.apk` was installed under the new package. First device check failed before preparation because Android asset packaging transformed `.tar.gz` into decompressed `.tar` names. The original APK and failure receipt remain.
- `f95eedf`: opaque `.bin` archives plus final-APK asset byte verification repair that packaging failure. All three APK archive hashes matched before installation. `.setup/core/core-a02.apk` retained.
- Second device check extracted fresh Linux/Node and installed certificates, Git and stock Pi through app-owned PRoot. No ADB provisioning of the root filesystem or agents occurred. Native process cleanup verification then failed, so environment readiness and the rest of acceptance were correctly refused. Failure remains in `.setup/core/device-a02.log` and the app's saved receipt. After instrumentation exited, a same-UID process listing contained no remaining `dev.olea.app` process or children. This is a bounded observation, not a rewrite of the failed cleanup result.
- Ownership reproduction: 300 sequential sleeping children reproduced `OWNED_PROCESS_LIMIT` with no remaining processes. The maintained supervisor now retires identities proved absent by a complete scan, retaining the root and live identities. The same check passed with301 observed identities/300 retired and no faults. Raw red/green receipts remain in `.setup/core/ownership-{red,green}.log`.
- A subsequent preparation retry exposed a procfs exit race (`read failed: ESRCH`). `ENOENT`/`ESRCH` during identity reads now mean the process disappeared; other errors still invalidate verification. Ten immediate process-exit checks passed in `.setup/core/short-exits-green.log`.
- `.setup/core/device-a04.log`: repaired preparation reached real stock Pi RPC readiness and executed a workspace write/read. The check then failed because it incorrectly required Pi to create a canonical transcript before any chat. Inspection of installed stock Pi1.5.2 `SessionManager._hasConversation()`/`_persist()` confirmed shell-only entries remain in memory; its explicit session file reservation survives reopen. No agent code was modified and no fabricated chat entry was inserted.
- `.setup/core/device-a05.log`: corrected no-model check passed real stock RPC startup, workspace write/read, STOP after an active command created its start marker, absence of its delayed effect after8.5s, unchanged workspace hash, the same reserved session path, and Olea display-history reopening. Canonical transcript remained absent before chat; that part is explicitly unverified. Final native state reported stopped. The previous cleanup-failure receipt remains separately labeled historical.
- Corrected fresh-runtime repeat passed after retaining the entire prior rootfs and ready marker by rename. The app extracted verified packaged Linux/Node, installed certificates/Git/stock Pi, started stock RPC, completed workspace write/read, stopped an active delayed command without its effect, and reopened the display and reserved session path. [Receipt](core/FRESH_NO_MODEL_CHECK.json). Earlier workspace files, the Pi-home sentinel and session reservation all retained their exact hashes. The entire earlier rootfs remains at `files/runtime/rootfs-retained-1794393378406`.
- Version3→4 installation retained all six selected workspace/home/reservation/display files byte-for-byte. Version4→5 retained the same six files. Final version5 passed cold display reopening, stock RPC startup, reservation preservation and STOP. [Final receipt](core/FINAL_REOPEN_CHECK.json). The last presentation fix keeps Workspace on one line and uses dark system icons against the light background; the native presentation remains minimal.

## Completion evidence

- [Native ownership check](core/OWNERSHIP_CHECK.json):301 observed identities,300 retired exits, no remaining process/fault; ten short-exit checks are retained under `.setup/core/`.
- [Fresh preservation manifest](core/fresh-preservation-before.txt) and [result](core/fresh-preservation-result.txt).
- [APK update preservation manifest](core/update-preservation-before.txt), [version4 result](core/update-v4-preservation-result.txt), and [version5 result](core/update-v5-preservation-result.txt).
- [Final packaged archive checks](core/PACKAGED_ASSETS.txt) and [APK hashes](core/APK_SHA256.txt).
- Ordinary source-based build and use: [README](../README.md). Contributor checks: [CONTRIBUTING](../CONTRIBUTING.md).
- Local build/attempt logs and all retained APKs stay in `.setup/core/`; final normal-launch screenshot is `.setup/core/olea-core-v5-open.png`. No fake model output is included in the app or acceptance evidence.

## Device and preservation

Initial read-only inspection found booted emulator-5554, API36/x86_64, historical runtime/fixture hosts and no visible Node/PRoot. The builder established sole mutation ownership. The emulator subsequently disconnected and its emulator/QEMU processes were absent. It was restarted without wipe, snapshot restore or configuration changes. Historical packages/data remain untouched; app installation/validation targets only `dev.olea.app` and its test package.

The advisory HTML and parallel tabs remain untouched. No worktree was removed. Task-created downloads, caches, APKs and diagnostic records remain under `.setup/core/` or the new app's private files.

Final bounded observation at2026-11-11T10:53:56Z: normal Olea launch shows saved tool history with Environment stopped. Process listing contains new app host10518 and historical host1703; no Node/PRoot process is visible. No test or worker is in flight. The builder relinquishes its temporary device mutation ownership with no successor. Emulator and app data remain available; no new milestone or manager is launched.

## Budget and exact open acceptance

No provider-backed Olea prompt, retry, fallback or replay was submitted. Existing provider secrets were not opened. Instrumentation's zero-provider field records a procedure that never issues a Pi prompt; it is not packet capture or billing evidence.

Still unverified: configured-provider acceptance, live streamed provider reply, model-selected workspace tool execution, user STOP during a provider-backed turn, and canonical saved-chat/provider-backed continuation. Stock Pi intentionally creates its canonical conversation file at the first user/assistant message; shell-only display persistence and a saved file reservation are not a canonical-chat resume pass. These live steps require a separate explicit provider-test allocation. Physical Android14/ABI/ARM64, authenticated Claude, complete Codex UX and broad lifecycle/battery/thermal/update certification remain outside this first bounded core.

## Local checkpoints and Rim

Local Git preserves source and fixes. `rim spawn --tag maintained-core` timed out at20s. Subsequent status reported no Rim root; tree showed only historical candidates. No destructive Rim repair was attempted. Git is the durable checkpoint path for this build.
