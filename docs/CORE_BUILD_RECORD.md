# Maintained core build record

Assignment: `docs/CORE_BUILD_HANDOFF.md`, approved at `d62c1d3`. Direct builder in the existing root; no worker, manager replacement, remote or publication.

## Source and implementation

Maintained source is in `android/`, `backend/` and `runtime/`. Android identity is `dev.olea.app`, separate from all historical evidence packages. API36/x86_64 is the current build/validation target. Minimal native Android widgets are a builder implementation choice; the production UI toolkit remains open.

`files/data/workspace`, `files/data/home` and `files/data/sessions` bind into the Linux runtime separately from `files/runtime/rootfs`. Pi uses its stock RPC protocol. Kotlin owns process startup, a foreground notification, STOP and bounded rendering. Shared backend source retains the Codex adapter without presenting a complete Codex workflow. This core does not activate phone tools.

## Retained attempts

- `1e7b550`: first maintained source checkpoint. Two focused host checks passed: saved session/workspace preservation without prompt replay, and bounded Unicode JSONL handling. These use an explicitly labeled protocol fixture and are not stock-agent acceptance.
- First Android build passed. Local `.setup/core/core-a01.apk` was installed under the new package. First device check failed before preparation because Android asset packaging transformed `.tar.gz` into decompressed `.tar` names. The original APK and failure receipt remain.
- `f95eedf`: opaque `.bin` archives plus final-APK asset byte verification repair that packaging failure. All three APK archive hashes matched before installation. `.setup/core/core-a02.apk` retained.
- Second device check extracted fresh Linux/Node and installed certificates, Git and stock Pi through app-owned PRoot. No ADB provisioning of the root filesystem or agents occurred. Native process cleanup verification then failed, so environment readiness and the rest of acceptance were correctly refused. Failure remains in `.setup/core/device-a02.log` and the app's saved receipt. After instrumentation exited, a same-UID process listing contained no remaining `dev.olea.app` process or children. This is a bounded observation, not a rewrite of the failed cleanup result.
- Current repair work: retain cleanup identity/fault details on failure, reproduce ownership tracking under many sequential child processes, and repair the demonstrated cause before continuing the same core workflow. Saved-history rendering also accommodates string content and stock bash results, and readiness waits for history loading.

## Device and preservation

Initial read-only inspection found booted emulator-5554, API36/x86_64, historical runtime/fixture hosts and no visible Node/PRoot. The builder established sole mutation ownership. The emulator subsequently disconnected and its emulator/QEMU processes were absent. It was restarted without wipe, snapshot restore or configuration changes. Historical packages/data remain untouched; app installation/validation targets only `dev.olea.app` and its test package.

The advisory HTML and parallel tabs remain untouched. No worktree was removed. Task-created downloads, caches, APKs and diagnostic records remain under `.setup/core/` or the new app's private files.

## Budget and exact open acceptance

No provider-backed Olea prompt, retry, fallback or replay was submitted. Existing provider secrets were not opened. Instrumentation's zero-provider field records a procedure that never issues a Pi prompt; it is not packet capture or billing evidence.

Still unverified: live streamed provider reply, model-selected workspace tool execution, user STOP during a provider-backed turn, and provider-backed continuation of a saved conversation. These require a separate explicit provider-test allocation. Physical Android14/ABI/ARM64, authenticated Claude, complete Codex UX and broad lifecycle/battery/thermal/update certification remain outside this first bounded core.

## Local checkpoints and Rim

Local Git preserves source and fixes. `rim spawn --tag maintained-core` timed out at20s. Subsequent status reported no Rim root; tree showed only historical candidates. No destructive Rim repair was attempted. Git is the durable checkpoint path for this build.
