# M2 modern runtime candidate experiment

Authorized disposable spike. Original code MIT; third-party runtime retains upstream licenses.

## Binding and state

Run `run_aa0011145bf9`; manager `pi_1d9a3114_30c1_4a4f_b8a6_22cd565c2373`; worker `ad49162f-2db0-4879-a32c-86461b7a9675`; Task `task_504381bfa5d3`; Dispatch `ctx_dc93a74c270c`. Full dispatch creator/assignee/Run and worktree explicit root lineage independently inspected. Legacy null coordinator/projection remains a separate limitation. Manager explicitly activated implementation and sole emulator mutation lease. Provider allocation zero.

Start HEAD `1775d536fb8650f7335729af90530733984614ea`. Initial ADB no devices; offline AVD SHA256 `d52586b2631349deb331f981b2e49d57ce5440e9fe94429a1772935edd7ce502`. Baseline `dev.olea.spike` and private rootfs must remain untouched. Test application `dev.olea.m2.runtime`, target/compile36,min26; fresh private rootfs. Physical phone absent/ABI unknown.

## Bounded candidates

1. **Selected first:** package verified stock Termux PRoot, loader and Android shared dependencies as APK native libraries, extracted by PackageManager to its read-only nativeLibraryDir. Launch through Kotlin service in actual modern app SELinux domain. Retain stock PRoot execution path for guest Linux programs. Test `/bin/sh`, upstream Node, nested children, stock Git and ordinary installs. PRoot startup alone cannot pass guest execution. No agent patch or private runtime fork.
2. **Diagnostic only if first fails:** stock PRoot explicit supported loader selection, with loader packaged in same nativeLibraryDir. Compare initial guest executable failure against PRoot's documented loader semantics; never assume ptrace changes SELinux policy. No anonymous executable rewrite, policy change or target reduction.
3. **Boundary assessment:** packaging fixed guest executables/loader in APK can establish execution for a fixed set, but arbitrary upstream native updates may still be denied. Do not claim ordinary update compatibility from fixed APK startup. Native Android agent ports violate selected maintenance constraint; target28 is historical comparison only. Stop this bounded candidate if standard supported paths cannot run ordinary writable guest updates.

Android policy source: https://developer.android.com/about/versions/10/behavior-changes-10#execute-permission explicitly prohibits direct execve on app home writable files for target29+, recommends APK-embedded binary code. Guest execution must be measured independently. `run-as` is provisioning only, never app-domain execution evidence.

## Contract

Kotlin retains per-operation permission and stop checks. One shared TS/Node backend remains unchanged until manager provides versioned payload. Test bridge uses port8768 to avoid baseline8766 collision; protected app-private bridge-config.json supplies url/token, mapped to guest `/run/olea-bridge.json`; adapters consume supplied bridgeConfig. No oracle reader operation. Separate UID fixture needed before causal combined assertions. Start/restart is explicit, never automatic phone replay.

## Sequence and bounds

Verify public artifacts before staging; record exact missing retained caches instead of trusting historical paths. Build/install attempts240s; initial process30s; deterministic phase bounded240s. Retain first failures and at most one diagnosed install/network retry. New evidence under spike/m2/runtime/evidence with unique attempts. Raw logs/downloads/config under .setup. Build APK; fresh provision; service-domain identity and deterministic Unix checks; update/preservation/recovery only after prerequisites. No provider request without manager allocation. Continue independent phone/native/lifecycle observations if guest execution fails.

Rim spawn timed out after30s; subsequent tree shows root `ra92bb8174c2e94e` and candidate `n3f0763d837c5e6f`. Rim status unexpectedly lists many unchanged Git files modified; Git status remains clean. No repeat spawn or destructive repair; preserve with local Git.
