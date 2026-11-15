# Contributing

The maintained application is under `android/`, its shared stock-agent adapters under `backend/`, and packaging under `runtime/`. Historical `spike/` experiments are excluded from the current source tree; existing local copies are ignored. Earlier Git commits retain those experiments. Do not turn experiment runners or provider-budget policies into product behavior.

Read `AGENTS.md` for repository instructions, `PRODUCT.md` for product intent, and `DESIGN.md` for interface decisions. Current release evidence lives under `docs/releases/`; completed build and consolidation records live under `docs/archive/`. Preserve concurrent edits and discussion artifacts.

## Build

Set `JAVA_HOME` and `ANDROID_HOME`, then run:

```bash
OLEA_ABI=arm64-v8a bash runtime/build.sh```

Inputs and Gradle caches remain under `.setup/core/`. Generated APKs, native libraries, packaged assets and backend JavaScript are ignored. The build verifies upstream archives and the final APK's asset bytes. No credential file is required to build. Use `OLEA_ABI=x86_64` for an x86_64 build.

Release signing requires `OLEA_BUILD_TYPE=release` and the local environment variables `OLEA_SIGNING_STORE_FILE`, `OLEA_SIGNING_STORE_PASSWORD`, `OLEA_SIGNING_KEY_ALIAS`, and `OLEA_SIGNING_KEY_PASSWORD`. Never commit a keystore or signing credentials. The public package identity is `dev.olea`; the Kotlin namespace remains `dev.olea.app`. Earlier development packages used `dev.olea.app` and have separate storage and signing identities.

## Focused checks

```bash
npm ci --prefix backend
npm test --prefix backend
bash runtime/build.sh :app:assembleDebugAndroidTest
```

Backend fixture checks cover persistence/no replay, path/agent identity, phone registration/validation, Codex capability compatibility, startup cancellation and output bounds. They do not establish stock-agent or Android acceptance. Run them for changes to these boundaries; do not replay the historical matrix.

For the finite stock-Pi Android check, select the intended emulator explicitly:

```bash
adb -s <device-serial> install -r android/app/build/outputs/apk/debug/app-debug.apk
adb -s <device-serial> install -r android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk
adb -s <device-serial> shell am instrument -w dev.olea.test/dev.olea.app.CoreInstrumentation
```

This check starts the actual app service and packaged environment, uses stock Pi RPC `bash` without a model prompt, verifies a workspace file, interrupts an active delayed effect, and reopens Olea's saved display and Pi's session file reservation. Stock Pi does not create its canonical transcript before a user/assistant message; canonical-chat continuation remains unverified under the prompt freeze. The check preserves uniquely named files and saves a JSON receipt in the app's private files directory. Fresh package preparation has finite command deadlines and requires network access. Do not confuse the instrumentation shell command with a model-selected tool call.

Optional instrumentation selections are `-e case ownership` for sequential-child retirement, `-e case short-exits` for immediate-exit races, and `-e case reopen` for cold display/backend reopening. `-e case fresh` retains the entire old rootfs and ready marker by rename before testing a new runtime; it preserves workspace/home/session data and needs another finite package preparation. Use these for a concrete change or diagnosis, not a standing test loop.

Optional consolidation cases are `-e case consolidation` (two real Pi sessions, separate workspace, selection, local-shell cancel, bridge authentication/disabled effects and STOP), `-e case codex` (explicit stock install, no-model direct exec and same-thread reopen), and `-e case phone` (finite capture request; a tester completes the normal app button/SystemUI consent during its three-minute window). They never issue a model prompt. These are manually selected diagnostics for changed integration, not recurring release gates. Agent install/update uses network; historical proofs need not be repeated for unrelated changes.

Never point these commands at historical evidence packages. Do not clear app data or reinstall by uninstalling. Installation updates must use `-r`; workspace, agent home and session state must remain under `files/data/`, outside `files/runtime/rootfs/`.

## Provider tests

Provider-backed tests require explicit user authorization and an allocation for that task. Never infer permission from credentials being present. For the 0.1.0 release assignment, the user authorized GPT for Pi/Codex and Claude for Claude Code: use the cheapest working model for connectivity-only checks, and Pi with `gpt-6.1-sol` for real functionality and phone-use tests. Keep credentials in ignored local configuration; exclude them from prompts, logs, reports, screenshots and Git history. Later work requires its own authorization.

## Known engineering boundaries

Native process ownership uses finite `/proc` identity snapshots and signals recorded PID/start-time/UID matches. STOP reports uncertainty if tracked cleanup cannot be verified. This is not proof against arbitrary unseen forks or whole-service death. PRoot is compatibility infrastructure, not a same-UID credential/filesystem sandbox.

Production UI uses Kotlin and Jetpack Compose with the flat interface language in the current browser reference. The browser scenarios guide design; they do not prove that native behavior works. Validate changed journeys on the intended Android device and retain failed attempts and limits in the release evidence.
