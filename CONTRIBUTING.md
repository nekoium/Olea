# Contributing

The maintained application is under `android/`, its shared stock-agent adapters under `backend/`, and packaging under `runtime/`. `spike/` remains historical evidence. Do not turn experiment runners or provider-budget policies into product behavior.

Read `AGENTS.md`, `docs/CORE_BUILD_HANDOFF.md` and `docs/CORE_BUILD_PLAN.md` before changing architecture or scope. Product discussion continues separately; preserve concurrent edits and discussion artifacts.

## Build

Set `JAVA_HOME` and `ANDROID_HOME`, then run:

```bash
bash runtime/build.sh
```

Inputs and Gradle caches remain under `.setup/core/`. Generated APKs, native libraries, packaged assets and backend JavaScript are ignored. The build verifies upstream archives and the final APK's asset bytes. No credential file is required to build.

## Focused checks

```bash
npm ci --prefix backend
npm test --prefix backend
bash runtime/build.sh :app:assembleDebugAndroidTest
```

The two backend tests use an explicitly labeled RPC fixture to check persistence/no replay and output bounds. They do not establish stock-agent or Android acceptance.

For the finite stock-Pi Android check, select the intended emulator explicitly:

```bash
adb -s emulator-5554 install -r android/app/build/outputs/apk/debug/app-debug.apk
adb -s emulator-5554 install -r android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk
adb -s emulator-5554 shell am instrument -w dev.olea.app.test/dev.olea.app.CoreInstrumentation
```

This check starts the actual app service and packaged environment, uses stock Pi RPC `bash` without a model prompt, verifies a workspace file, interrupts an active delayed effect, and reopens the same session. It preserves uniquely named files and saves a JSON receipt in the app's private files directory. Fresh package preparation has finite command deadlines and requires network access. Do not confuse the instrumentation shell command with a model-selected tool call.

Never point these commands at historical evidence packages. Do not clear app data or reinstall by uninstalling. Installation updates must use `-r`; workspace, agent home and session state must remain under `files/data/`, outside `files/runtime/rootfs/`.

## Provider tests

Provider-backed Olea test prompts remain frozen under the current assignment. Do not read the existing provider secret, submit prompts, retry, fall back or replay a request without an explicit new allocation. Coding work is authorized separately. Record live streaming/model-selected tool execution and provider-backed continuation as unverified while the freeze remains.

## Known engineering boundaries

Native process ownership uses finite `/proc` identity snapshots and signals recorded PID/start-time/UID matches. STOP reports uncertainty if tracked cleanup cannot be verified. This is not proof against arbitrary unseen forks or whole-service death. PRoot is compatibility infrastructure, not a same-UID credential/filesystem sandbox.

The minimal Android widget presentation is an implementation choice for this first core. It does not settle the production UI toolkit or full conversation/workspace navigation.
