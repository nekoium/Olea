# Olea agent instructions

## Current authority and reading order

Read `docs/CORE_BUILD_HANDOFF.md` first for the approved maintained-core scope and current execution authority, then PRODUCT.md, ROADMAP.md, PROGRESS.md, TECH_STACK.md and PHONE_USE_TESTS.md. The newly assigned core builder may implement autonomously and use bounded workers. Parallel root discussion sessions remain open; do not stop or overwrite them.

Documents under `docs/feasibility/`, `spike/` and the old FEASIBILITY_BRIEF.md describe historical experiments unless explicitly referenced for a current bounded task. Their instructions to launch teams/managers, continue checkpoints, allocate/refill budgets, resume workers or claim device ownership are superseded. They supply evidence and technical recipes, not current authority. Do not follow an older document's claim that it applies to future managers. The 112-case matrix is historical, not an all-green gate.

Provider-backed test spending remains frozen, with no automatic refresh on manager handoff. No historical lease transfers. The new core builder establishes one current device owner after inspecting actual state. Tests and workers serve finite implementation tasks; no standing feasibility or manager-replacement loop. Preserve historical evidence and failures.

## Documentation

Read PRODUCT.md, ROADMAP.md, PROGRESS.md, TECH_STACK.md and PHONE_USE_TESTS.md before changing scope or architecture. Preserve the distinction between agreements, proposals and measured results. Technical feasibility precedes production UX implementation; existing visual studies remain discussion references.

## Local Android development

The prepared emulator is Olea_API_36: Android 16/API 36 Google APIs, x86_64, Pixel 7a profile, previously boot-verified with WHPX acceleration. Recorded allocation: 4 cores and 4 GB RAM; these may be increased if measurements show resource pressure. Verify current state before changing its configuration.

Windows paths:

- SDK: C:\Users\Aria\AppData\Local\Android\Sdk
- ADB: C:\Users\Aria\AppData\Local\Android\Sdk\platform-tools\adb.exe
- Emulator: C:\Users\Aria\AppData\Local\Android\Sdk\emulator\emulator.exe
- Android CLI: C:\Users\Aria\AppData\Local\Android\Sdk\android-cli\android.exe
- Java: C:\Program Files\Android\Android Studio\jbr
- AVD configuration: C:\Users\Aria\.android\avd\Olea_API_36.avd\config.ini

Git Bash examples:

```bash
"/c/Users/Aria/AppData/Local/Android/Sdk/emulator/emulator.exe" -list-avds
"/c/Users/Aria/AppData/Local/Android/Sdk/emulator/emulator.exe" -accel-check
"/c/Users/Aria/AppData/Local/Android/Sdk/platform-tools/adb.exe" devices -l
```

Select the intended ADB device explicitly when more than one is attached. ADB is development infrastructure; normal agent phone actions must use the permission-controlled Android bridge. Emulator success does not establish ARM64 compatibility. The physical Android 14 phone's ABI must be checked separately.

## Credentials and temporary state

Keep credentials in local untracked configuration, never in reports, source snapshots or command output. Use .setup for task-local temporary files. Do not commit running-server state, logs or downloaded installers. Preserve research citations and source provenance; downloaded research code is reference material, not automatically licensed for inclusion in Olea.
