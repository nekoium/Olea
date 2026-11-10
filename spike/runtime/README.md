# Disposable Android/runtime experiment

Original Olea source is MIT. This is a feasibility harness, not production UX or a production-safe runtime distribution. Third-party Linux/PRoot/Node packages retain their own licenses. Nothing is published.

## Measured outcome

- Kotlin Android host targets SDK **28**, compiles SDK36, runs on Android16/API36 x86_64. The host supervises one shared Linux Node backend and stock Pi subprocesses without root or ongoing ADB dependence.
- Actual target36 fixture Activity cannot execute the same app-private PRoot binary (`error=13 Permission denied`). Successful `run-as` execution is not proof of app-domain compatibility. Target28 is an experimental workaround, not an accepted production upgrade strategy.
- Ubuntu24.04.3 + Termux PRoot5.1.107.102 + upstream Node24.20.0/npm11.19.0 + Git2.43.0 run under real Android UID10216. Shell, dependencies, children, DNS/TLS and files have independent assertions.
- Stock Pi0.74.0 real model Unix/dependency/children/resume/concurrent tasks pass. Pi1.0/1.5 ordinary updates pass after one bounded network retry each; original ECONNRESET failures are retained. Their independent Unix/concurrent file cases fail in attempts with captured provider connection/timeout errors. Do not call all Unix workflows reliable.
- Stock Pi1.5.2 discovers phone tools, performs launcher Accessibility click, becomes foreground before explicit fixture integration, and sends a Unix-generated value matching a separate-UID private receipt. Independent observer confirms ordering and state.
- Direct location, SAF files, separate-app notification, MediaProjection and app-specific checks pass within their documented scopes. Browser URL dispatch reaches Chrome but destination loading fails (DNS_NXDOMAIN; alternate ERR_CONNECTION_CLOSED).
- Original Pi0.74 shutdown leaks a detached sleep because Android `/proc/.../task/.../children` is empty. A bounded same-owner numeric `/proc/stat` parent snapshot fixes the deterministic test on stable1.5; original failures remain. After-snapshot forks/reparented processes are not guaranteed captured.
- One-session explicit Kotlin/PRoot/backend/Pi snapshot: RSS325624KiB, PSS138862KiB. RSS double-counts shared pages; neither is peak/thermal/battery evidence. Constrained deterministic core passes at **2cores/2560MiB actual** (emulator clamps requested2048MiB), not a complete constrained model matrix.
- Physical Android14 ABI/ARM64 remains blocked: no connected physical device. Codex/Claude authenticated turns are not established.

Actual sanitized machine evidence is under `spike/runtime/evidence/`. The first failed attempts, direct versus model-driven checks, service versus run-as, and image/foreground assertions remain separate.

## Artifacts

Current expanded host:

- `spike/android/app/build/outputs/apk/debug/app-debug.apk`
- SHA256 `35c53046d77e35269561338a30e52c6098e01056d541c2744988b406c498f033`
- Application ID `dev.olea.spike`, target28, min26, compile36.

Current separate fixture:

- `spike/android/fixture/build/outputs/apk/debug/fixture-debug.apk`
- SHA256 `96d3ed95b3bcd39784f6907461e125339fcda174755c6641c99a7f2d36a8e743`
- Application ID `dev.olea.fixture`, target36, min26, compile36.

The causal model phone run used earlier host SHA256 `2c888051990855fe8378f749825af9e1f472422bf5d5d59c5362a17f6edd9db4` and fixture SHA256 `7eef46f3e1fd511a6f02585c08918c739adfbd0eab737be007f8b657422de8ca`. Later categories used the expanded APKs above. Build outputs are ignored, not embedded in Git; local APKs remain at these absolute worktree-relative paths.

## Build

Windows Git Bash, from repository root:

```bash
# Gradle archive is kept in .setup/gradle-proxy.zip; verify against artifact-manifest.json.
# JDK25 comes from existing Android Studio; SDK/build-tools36 are preinstalled.
bash spike/runtime/build.sh assembleDebug --max-workers=2 \
  -Dhttp.nonProxyHosts='repo.maven.apache.org|localhost|127.*' \
  -Dhttps.nonProxyHosts='repo.maven.apache.org|localhost|127.*' \
  -Dhttp.proxyHost=127.0.0.1 -Dhttp.proxyPort=7897 \
  -Dhttps.proxyHost=127.0.0.1 -Dhttps.proxyPort=7897
npm ci --prefix spike/backend
npm run build --prefix spike/backend
node --test spike/tests/pi/backend.test.mjs spike/tests/pi/process-tree.test.mjs spike/tests/pi/process-observer.test.mjs spike/tests/runner/runner.test.mjs
```

Use local proxy flags only when that proxy exists. Direct Maven Central bypass fixed measured Java TLS proxy failures; no certificate verification was disabled. `build.sh` checks the Gradle SHA before extraction and always uses `--no-daemon`. `spike/android/local.properties` is ignored and must specify the installed SDK path. AGP9 has built-in Kotlin2.2.10; no separate Kotlin plugin is applied.

## Fresh provisioning

Do not rerun fresh provisioning over an existing valuable rootfs. Script refuses `.olea-provisioned`; do not remove that guard to overwrite user state. Existing measured environment was built incrementally while fixing the failures recorded in `packaging-evidence.json`. The final fresh script contains those fixes but has not been rerun from an erased environment.

1. Download exact archives listed in `artifact-manifest.json` into ignored `.setup`: Gradle, Ubuntu Base, Node x64, proot.deb, libtalloc.deb and libandroid-shmem.deb. Use published HTTPS hashes; the Termux index is `Packages.gz`, not `.xz` (404). No GPG signature claim is made.
2. Install both APKs using explicit device selection:

```bash
ADB='/c/Users/Aria/AppData/Local/Android/Sdk/platform-tools/adb.exe'
"$ADB" -s emulator-5554 install -r spike/android/app/build/outputs/apk/debug/app-debug.apk
"$ADB" -s emulator-5554 install -r spike/android/fixture/build/outputs/apk/debug/fixture-debug.apk
bash spike/runtime/provision.sh
```

3. Start Olea Spike. It creates app-private random bridge token/config. Grant Accessibility through normal Settings for normal use. Recorded automated runs used development `settings put secure`, location `pm grant`, notification `allow_listener` and emulator geo provisioning; those are test setup, not a normal-app privilege bridge.
4. Install Git/CA/curl inside Linux using normal apt. Android tar cannot execute xz; provisioning decompresses verified xz payloads to deterministic gzip without payload changes. Stock PRoot `--link2symlink` handles denied Android hardlinks. `linux.sh` uses absolute `LD_LIBRARY_PATH`, loaders and temp directory.
5. Deploy built `spike/backend/dist`, extension, runners and runtime scripts to `/opt/olea` within app rootfs with ordinary ADB development provisioning. Preserve directory layout so relative imports resolve. Run `node spike/runtime/provision-provider.mjs` only with the expressly authorized source configuration present; it copies through stdin into mode600 rootfs `/run/olea-provider.json`, never values in arguments or output. Do not include provider configuration in payload archives.
6. Copy selected `start-runtime.sh`/`start-verify.sh` into app-private `files/start-runtime.sh`. Select **Start shared backend** in host. Kotlin owns ProcessBuilder, stdin/stdout JSONL and foreground notification stop. Startup is explicit; it is not START_STICKY and never replays phone actions after death.

`service-suite.mjs` is the original matrix plus independent stock probes. `retry-upgrades.mjs` runs only the explicitly bounded followup1.0/1.5 retries and preserves the0.74 results. Do not rerun model suites merely to obtain green results. `cleanup-only.mjs` uses no model requests and verifies stable installed package version/hash.

## Bridge and observation

Loopback `127.0.0.1:8766`, Bearer token from app-private config. `POST /phone` accepts `{id,operation,args}` and returns `{id,ok,result,error}`. `GET /health` and `/capabilities` also require auth. Max body64KiB, headers16KiB, request5seconds, main-thread action5seconds, bounded tree300nodes. Permission/stop state checked for every action. Node IDs expire on next tree inspection. `stop` disables phone actions, stops projection and backend. This loopback token protects other Android app UIDs, **not an agent shell running as the same host UID**; PRoot is not security isolation.

Development-only native `/backend` forwards bounded JSONL commands; `/events` returns a bounded200-event queue. Treat model/tool output as untrusted. Native audit records operation/timestamp/package/node action but never value payloads or credentials. Same-UID agent tools cannot be treated as an oracle security boundary; the independent fixture lives under a separate Android UID and exposes no oracle readback.

```bash
# ADB forwards only for host-side tests; agent calls use Android loopback itself.
"$ADB" -s emulator-5554 forward tcp:8766 tcp:8766
node spike/runtime/bridge-client.mjs capabilities
node spike/runtime/direct-phone.mjs .setup/direct-phone.json
```

`bridge-client.mjs` captures token privately via development run-as and never prints it. `observe-foreground.mjs` only observes ADB foreground and changes no phone state. Direct tests are not agent-driven acceptance evidence; see separate `agent-phone-independent.json` for the real model case.

## State and cleanup

Baseline emulator configuration remains4cores/4GiB; constrained boot used runtime flags, never changed/wiped config. Whole-app force-stop test leaves no app-UID descendants, saved workspace/transcript hashes survive, restart starts bridge disabled/backend stopped. Force-stop is stronger than natural Android background death and proves no general survival promise. Screen-lock test is a short stock bash sleep/write while Dozing, not long-running Doze/battery certification.

Final cleanup disables phone bridge and stops backend; test rootfs/APKs/workspace remain for reproducibility. Existing emulator/user state was not wiped. Local ignored credentials remain protected for authorized repeat work, never committed. Large duplicate partial downloads can be removed only by exact project-local path; verified archives/tool caches and APKs are retained.

Rim spawned `n7d034ff9325a635` (`android-runtime-bootstrap`) but later `rim punch` refused: `no Rim root exists for the current project context`. No destructive Rim repair was attempted; Git checkpoints preserve all substantive work.
