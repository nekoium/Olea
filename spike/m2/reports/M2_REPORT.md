# Olea M2 interim expected versus retained actual

Interim evidence snapshot; runtime/worker outcomes remain pending.

{"pass":11,"fail":1,"blocked":13,"untested":87}

Recommendation: revise. No automatic production acceptance.

Host/run-as/target28 receipts never establish modern Android app-domain or model outcomes. Historical M1 evidence stays unchanged. Tooling tests are not workflow passes. Missing physical access remains untested unless a retained blocked receipt establishes it.

## Retained host context

These attempts are outside Android acceptance counts.

codex-host-primary-1794329763090-codex-initialize: codex.initialize pass; Stock Codex0.167.0 correlated initialize and thread creation succeeded, startup433.26320000000004ms; thread01a1c663-5e3b-7b11-84ff-87131e300b56.

codex-host-controlled-1794330423552-codex-initialize: codex.initialize pass; Stock initialize/thread returned; startup839.8764000000001ms.

codex-host-primary-1794329763090-codex-turn: codex.turn pass; Real preferred-model streamed turn completed in total attempt12271.4767ms; completion does not establish Unix effects.

codex-host-controlled-1794330423552-codex-turn: codex.turn pass; Preferred Responses provider produced completed turn; total attempt15602.0433ms, zero approval requests.

codex-host-primary-1794329763090-codex-stream: codex.stream pass; Captured56 agentMessage deltas and matching completed turn; first event13.056199999999997ms.

codex-host-controlled-1794330423552-codex-stream: codex.stream pass; 41 deltas, actual turn completion; first event30.601899999999986ms.

codex-host-primary-1794329763090-codex-file: codex.file fail; Expected model Unix workflowfile did not complete after explicit command approval decline; expected result files absent. Actual Unix execution was not established.

codex-host-controlled-1794330423552-codex-file: codex.file fail; Expected model result artifact missing after actual OS shell-launch failure; original overall Unix workflow stays failed.

codex-host-primary-1794329763090-codex-shell: codex.shell fail; Expected model Unix workflowshell did not complete after explicit command approval decline; expected result files absent. Actual Unix execution was not established.

codex-host-controlled-1794330423552-codex-shell: codex.shell fail; Actual commandExecution exit-1: WindowsApps PowerShell pwsh.exe failed CreateProcessAsUserW error5 Access denied before node task.cjs. Actual task/dependency/child did not execute.

codex-host-primary-1794329763090-codex-dependency: codex.dependency blocked; Not executed after explicit command approval decline; original whole Unix workflow remains failed, but no independent dependency assertion was reached.

codex-host-controlled-1794330423552-codex-dependency: codex.dependency blocked; Not executed because stock Windows shell failed to launch; no independent dependency assertion reached.

codex-host-primary-1794329763090-codex-child: codex.child blocked; Not executed after explicit command approval decline; original whole Unix workflow remains failed, but no independent child assertion was reached.

codex-host-controlled-1794330423552-codex-child: codex.child blocked; Not executed because stock Windows shell failed to launch; no independent child assertion reached.

codex-host-controlled-1794330423552-codex-nested-child: codex.nested-child blocked; Not executed because stock Windows shell failed to launch; no independent nested-child assertion reached.

codex-host-primary-1794329763090-codex-resume: codex.resume pass; Explicit restart resumed exact proved thread01a1c663-5e3b-7b11-84ff-87131e300b56 with unchanged canonical home/workspace, startup287.17159999999967ms and no new prompt.

codex-host-controlled-1794330423552-codex-resume: codex.resume pass; New process resumed same proved thread/home/cwd; resume startup315.6374999999989ms, no additional prompt.

codex-host-primary-1794329763090-codex-sandbox: codex.sandbox fail; Initial authenticated host attempt actual Windows OS sandbox was disabled despite workspace-write policy. It cannot pass sandbox execution acceptance.

codex-host-sandbox-preflight-1: codex.sandbox blocked; No-model unelevated sandbox preflight1 blocked by RPC -32600; attempt2 diagnoses custom outputBytesCap unsupported on Windows. Original attempt1 lacks captured error-message detail.

codex-host-sandbox-preflight-2: codex.sandbox blocked; No-model unelevated sandbox preflight2 blocked by RPC -32600; attempt2 diagnoses custom outputBytesCap unsupported on Windows. Original attempt1 lacks captured error-message detail.

codex-host-sandbox-preflight-3: codex.sandbox blocked; No-model unelevated preflight3 inside command exit0/INSIDE_OK; designated sibling write denied EPERM/RPC -32603. Original runner marked blocked before independent file assertions; do not promote full sandbox boundary pass.

codex-host-sandbox-preflight-3-independent-assessment: codex.sandbox pass; Separate no-model assessment confirms INSIDE_OK file hash and outside sibling absence after expected stock EPERM denial in unelevated Windows sandbox; original preflight3 blocked receipt remains unchanged.

codex-host-primary-1794329763090-codex-rejection: codex.rejection untested; Explicit command approval decline and rejected-by-user tool result retained; full independently verified no-effect rejection boundary remains incomplete.

codex-host-primary-1794329763090-codex-thread-identity: codex.thread-identity pass; Proved created/resumed exact thread ID with same canonical workspace and account home; no accidental fork.

codex-host-controlled-1794330423552-codex-thread-identity: codex.thread-identity pass; Created and resumed exact proved thread01a1c66d-7362-7261-a805-3282ba514cf2 with same canonical cwd/home.

offline-tooling-output-frame-01: cost.output-frame pass; Host tooling tests for output-frame completed with exit 0; mock/supervisor checks only. Android backend/runtime acceptance remains untested.

offline-tooling-54fb8411c6814b8d-output-frame: cost.output-frame pass; Host tooling tests for output-frame completed with exit 0; mock/supervisor checks only. Android backend/runtime acceptance remains untested.

offline-tooling-output-queue-01: cost.output-queue pass; Host tooling tests for output-queue completed with exit 0; mock/supervisor checks only. Android backend/runtime acceptance remains untested.

offline-tooling-54fb8411c6814b8d-output-queue: cost.output-queue pass; Host tooling tests for output-queue completed with exit 0; mock/supervisor checks only. Android backend/runtime acceptance remains untested.

offline-tooling-timeout-01: cost.timeout pass; Host tooling tests for timeout completed with exit 0; mock/supervisor checks only. Android backend/runtime acceptance remains untested.

offline-tooling-54fb8411c6814b8d-timeout: cost.timeout pass; Host tooling tests for timeout completed with exit 0; mock/supervisor checks only. Android backend/runtime acceptance remains untested.

## provenance: untested
Expected: Pin source URLs, licenses, notices, versions and actual payload SHA256.

Actual: No retained matching execution receipt.

Context: artifacts; mode: direct; prerequisites: none.

Attempts: none.

## runtime.modern: pass
Expected: Execute supplied complete runtime from target36 Activity/service actual app UID, not run-as.

Actual: Actual target36 Kotlin service/UID10216/untrusted_app supervised writable guest Node and deterministic core with packaged read-only PRoot/loader payload hashes corroborated in native stdout.

Context: android-app; mode: direct; prerequisites: none.

Attempts: runtime-candidate-a01-modern (android-app/direct fail): First service candidate returned wrapper exit0 but guest shell and Node markers were127: linux.sh missing during provisioning race. Do not trust wrapper exit0.; artifacts git:b1b8a74:spike/m2/runtime/evidence/candidate-a01.json SHA256 8034297c1ed56a6f964a30868b9115155585d1f18968bbcfdf5ca5aa58fb5134, git:b1b8a74:spike/m2/runtime/candidate-a01.sh SHA256 1e8f3122f0ddc4233af010f0822f3aa47f9546cbdc82040d4fdc8396e408e6c8, git:b1b8a74:spike/m2/runtime/evidence/first-source-hashes.txt SHA256 8d580e9dd957e3e7972fb8dfb935d3a5ec54a4d47b03653568fda4ea1a4ea7fd; metadata {"retryOf":null,"provider":{"topLevelPrompts":0},"execution":{"hostPid":3870,"realUid":10216,"domain":"u:r:untrusted_app:s0:c216,c256,c512,c768","targetSdk":36,"androidApi":36,"childPid":null,"apkSha256":"375870be5efcf79a1cd16fb60e95e0a91b68904634164b1c308bdbcb3f99b0ab"},"limits":["Initial APK hash is distinct from later eacb/dbd APKs; no retroactive binary credit.","Ignored glibc LD_PRELOAD warnings retained; later environment cleanup cannot erase them.","No generic cleanup or full fresh-install/update acceptance."]}; runtime-candidate-a02-modern (android-app/direct pass): After staging launcher, actual target36 app service executed read-only APK PRoot/loaders and writable guest shell/upstream Node24.20.0 x64; inner shell/Node exit0. Candidate source also checks child exit/stdout42 but no separate child identity retained in this attempt.; artifacts git:b1b8a74:spike/m2/runtime/evidence/candidate-a02.json SHA256 ba1064a1954163509a6fc0958c63c9ee9c2371c0ab961e07fa486d5b2d47c576, git:b1b8a74:spike/m2/runtime/candidate-a01.sh SHA256 1e8f3122f0ddc4233af010f0822f3aa47f9546cbdc82040d4fdc8396e408e6c8, git:b1b8a74:spike/m2/runtime/evidence/first-source-hashes.txt SHA256 8d580e9dd957e3e7972fb8dfb935d3a5ec54a4d47b03653568fda4ea1a4ea7fd; metadata {"retryOf":"runtime-candidate-a01-modern","provider":{"topLevelPrompts":0},"execution":{"hostPid":3870,"realUid":10216,"domain":"u:r:untrusted_app:s0:c216,c256,c512,c768","targetSdk":36,"androidApi":36,"childPid":null,"apkSha256":"375870be5efcf79a1cd16fb60e95e0a91b68904634164b1c308bdbcb3f99b0ab"},"limits":["Initial APK hash is distinct from later eacb/dbd APKs; no retroactive binary credit.","Ignored glibc LD_PRELOAD warnings retained; later environment cleanup cannot erase them.","No generic cleanup or full fresh-install/update acceptance."]}; runtime-core-a01-runtime-modern (android-app/direct pass): Actual target36 Kotlin service/UID10216/untrusted_app supervised writable guest Node and deterministic core with packaged read-only PRoot/loader payload hashes corroborated in native stdout.; artifacts git:b1b8a74:spike/m2/runtime/core.mjs SHA256 c8b4d325c4920bda0f3289bdd08cac2e7fd74b504919e6f85ae9a7ff30aec4d0, git:b1b8a74:spike/m2/runtime/core-a01.sh SHA256 d90efe39dd9b1f7868fddd6d893dc02b2227f82650b338600f824cc6cd84bd90, git:b1b8a74:spike/m2/runtime/linux.sh SHA256 3673a0001302c5d8e27cb7390579a5ac7b058db8454b1f9498a754c16befbb0f, git:b1b8a74:spike/m2/runtime/artifact-manifest.json SHA256 af480a721970682c3b1839f280c18a2f8c4ed008adfb397642e9943abdbe80f0, git:b1b8a74:spike/m2/runtime/evidence/core-a01.json SHA256 5a2069fde21deae50fbd9fd2b58701161fa00f22c52b7cf0e39543083bb7f35e, git:b1b8a74:spike/m2/runtime/evidence/core-a01-native.json SHA256 b1c8392a869badf0596375f706f4db3d8ff98db3c4a87d5fcc86267f942636bb, git:b1b8a74:spike/m2/runtime/evidence/fixed-apk-hash.txt SHA256 57f495093e9cd5a5728b1d7f9bb9e8825a59027cfbd7168cf9772ac5cf41079d; metadata {"provider":{"topLevelPrompts":0,"modelRequests":0},"execution":{"package":"dev.olea.m2.runtime","targetSdk":36,"compileSdk":36,"minSdk":26,"androidApi":36,"measuredNodeArch":"x64","advertisedAbis":"x86_64,arm64-v8a","actualDomain":"u:r:untrusted_app:s0:c216,c256,c512,c768","realUid":10216,"hostPid":6197,"nodePid":6333,"nodePpid":6330,"nodeProcExe":"/opt/node/bin/node","loaderEnvAbsent":true,"apkSha256":"dbd494c8f9c533b20a5ed0a067dbb2496a34c2494911a9fc9cb4fb19f6435887"},"provenance":{"sourceCommit":"b1b8a74","nativePayloadSha256":{"libproot.so":"3dd2e5b23aee8dd8588750117f03b1b7971314e7457067af803d78d57306391d","libloader.so":"a836b0569c84b1661333d16bacf6b396ff08fea816a5c936a82e08ddeeca8341","libloader32.so":"fd5b394aa0801619e293b76fe6e830a3beb363aed4fa4b9a5a41f1388a0cb9b9","libtalloc.so":"7fa6722a4320495b1b85832fc7fd02de0cb367b45f116c1921b2830a6936da90","libandroid-shmem.so":"092926060298acd3778e6239033d7aef1280dcb59aebe021a3719612e6a3465f"},"components":[{"name":"Gradle","version":"9.1.0","url":"https://downloads.gradle.org/distributions/gradle-9.1.0-bin.zip","sha256":"a17ddd85a26b6a7f5ddb71ff8b05fc5104c0202c6e64782429790c933686c806","license":"Apache-2.0, build tool only"},{"name":"Ubuntu Base","version":"24.04.3 amd64","url":"https://cdimage.ubuntu.com/ubuntu-base/releases/24.04/release/ubuntu-base-24.04.3-base-amd64.tar.gz","sha256":"6bc2cde3930ad088b3bb46fa45279e96d25bc3810f209850ecbe4722711874f9","license":"Mixed; retain /usr/share/doc copyright and applicable corresponding source"},{"name":"Node","version":"24.20.0 Linux x64","url":"https://nodejs.org/dist/v24.20.0/node-v24.20.0-linux-x64.tar.xz","sha256":"2f2c0da162318f0de47665410c7c8c2ed3d36c8f3105de4bbc61176c70a7cbf2","license":"MIT plus bundled notices"},{"name":"Termux PRoot","version":"5.1.107.102 x86_64","url":"https://packages.termux.dev/apt/termux-main/pool/main/p/proot/proot_5.1.107.102_x86_64.deb","sha256":"2497064226c15971be8131c7facead94a06c225347796326a383c832dca57758","license":"GPL-2.0; corresponding source/notices required before redistribution","source":"https://github.com/termux/proot"},{"name":"libtalloc","version":"2.5.0 x86_64","url":"https://packages.termux.dev/apt/termux-main/pool/main/libt/libtalloc/libtalloc_2.5.0_x86_64.deb","sha256":"b8c6d95f20075dc1f9ec6573575b2444e8d526e48e0d8d6d5cf4e071e6e06530","license":"LGPL-3.0-or-later; source/relinking obligations","source":"https://talloc.samba.org/"},{"name":"libandroid-shmem","version":"0.7 x86_64","url":"https://packages.termux.dev/apt/termux-main/pool/main/liba/libandroid-shmem/libandroid-shmem_0.7_x86_64.deb","sha256":"ffa9e4c87467b158b148d0ff92dda796aa038276c2075af3269cdcdb06f25797","license":"BSD-3-Clause; retain copyright/disclaimer","source":"https://github.com/termux/libandroid-shmem"}],"licenseLimits":"No publishing; source obligations inventory is not distribution clearance; original MIT does not relicense dependencies","transform":"Verified native regular-file bytes renamed to Android lib*.so packaging names, no binary edits; debug symbols retained; PackageManager extraction requested through AGP useLegacyPackaging"},"limits":["Actual target36 service domain, not development run-as.","Emulator x64 only; advertised arm64-v8a is not physical ARM64 execution.","Core deterministic work is not stock-agent/provider/shared-backend acceptance.","Single staged rootfs with manual recovery is not repeated corrected fresh install/update/recovery proof.","Native childPid null; source-controlled inner /proc identities corroborate actual children.","Residual linkerconfig warning retained; old glibc preload warnings belong earlier APK/launcher attempts.","Root exit and bounded pipe drain do not establish all descendant exit."],"currentState":{"observedAt":"2026-11-10T17:23:12.150Z","hostPidDuringCase":6197,"phonePermissionsAndStop":"not queried by this deterministic case","laterProcessState":"unknown from this snapshot"}}.

## historical.state-preservation: blocked
Expected: Reverify original M1 app/rootfs/workspace state without deletion or replacement; missing current state blocks original preservation, not independent M2 fresh tests.

Actual: Current intended emulator has no dev.olea.spike package; historical host artifact/cache path missing. M1 original-state preservation cannot be reverified; cause unproved, no deletion/reset by new worker. Independent M2 fresh state remains separate.

Context: android-app; mode: direct; prerequisites: none.

Attempts: runtime-boot-a02-historical-state-preservation (android-app/direct blocked): Current intended emulator has no dev.olea.spike package; historical host artifact/cache path missing. M1 original-state preservation cannot be reverified; cause unproved, no deletion/reset by new worker. Independent M2 fresh state remains separate.; artifacts git:b1b8a74:spike/m2/runtime/evidence/boot-attempts.json SHA256 8952a0504a97c93080b1a7a5fa147e8a1cf8d474cdddbb5306f22622019174f8, git:b1b8a74:spike/m2/runtime/evidence/baseline-query-a02.txt SHA256 d695b43a520d226fd72de0a54bbdbdacf1eb220e4b273d38f7cada3941348aa8, git:b1b8a74:spike/m2/runtime/evidence/emulator-identity-a02.txt SHA256 c934583778d9370e3d9425cf48102de360352eac80d7e7d730c9ca822ca6a7c7; metadata {"execution":{"timestampBasis":"Assessment time; original boot attempt UTC and emulator identities retained in artifact.","avd":"Olea_API_36","serial":"emulator-5554","allocation":{"onlineCpus":"0-3","memTotalKiB":4013812}},"limits":["No baseline reinstall, reset, deletion or snapshot restoration performed.","Missing original M1 app/cache cause unproved; historical M1 evidence unchanged.","No physical ABI inference from emulator."]}.

## runtime.target28: untested
Expected: Retain target28 comparison separately; never modern acceptance.

Actual: No retained matching execution receipt.

Context: target28-comparison; mode: direct; prerequisites: none.

Attempts: none.

## runtime.fresh: fail
Expected: Reproduce fresh disposable install from verified artifacts with bounded step receipts.

Actual: Second preparation reached240s during dpkg CA configuration; uncaught native InterruptedIOException killed host4134 before terminal JSON. Native receipt absent, not clean timeout/exit proof. Later bounded recovery yielded passing core but no repeat corrected fresh procedure.

Context: android-app; mode: direct; prerequisites: provenance, runtime.modern.

Attempts: runtime-prepare-a01-fresh (android-app/direct fail): Fresh staged setup first preparation exited2 after tar sys Cannot utime Permission denied. Initial provisioning guard source also failed closedness review; no observed overwrite/preservation loss asserted.; artifacts git:b1b8a74:spike/m2/runtime/evidence/provision-a01.txt SHA256 91f4f1595be8bd182c65634fcdda8e767eff31bee9ea5ea596f0932118d34622, git:b1b8a74:spike/m2/runtime/evidence/prepare-a01.json SHA256 be8dc82b6e715e7f818149a7d1a62b7889daad11e877f98a5b38496b35a2df6c, git:b1b8a74:spike/m2/runtime/prepare-a01.sh SHA256 ad4410d2a782e586e2f8aa5d207b29c60540c52d721ad4deb66173d2ccd8da99; metadata {"failureClass":"runtime","limits":["A corrected source guard/host refusal test is not a repeated fresh Android provisioning pass.","Existing M2 rootfs was preserved and not rerun as fresh."]}; runtime-prepare-a02-fresh (android-app/direct fail): Second preparation reached240s during dpkg CA configuration; uncaught native InterruptedIOException killed host4134 before terminal JSON. Native receipt absent, not clean timeout/exit proof. Later bounded recovery yielded passing core but no repeat corrected fresh procedure.; artifacts git:b1b8a74:spike/m2/runtime/evidence/prepare-a02.json SHA256 771deaf8d9e313ab2f64d3f645401257e3228ea63ff40ed028c4992e28d8dbba, git:b1b8a74:spike/m2/runtime/evidence/prepare-a02-native-crash.txt SHA256 e1c40b47c42ebe0eafff65565bac326cecd4965934c77556ab9a724c39f33a80, git:b1b8a74:spike/m2/runtime/evidence/core-a01.json SHA256 5a2069fde21deae50fbd9fd2b58701161fa00f22c52b7cf0e39543083bb7f35e; metadata {"failureClass":"runtime","retryOf":"runtime-prepare-a01-fresh","limits":["Assessment timestamp only; source retains crash UTC2026-11-10T17:16:12.716Z.","Source-only guard defect does not prove any actual data loss.","New drain fix and core result do not erase original crash."]}.

## unix.shell: pass
Expected: Independently assert real shell under native supervision.

Actual: Actual /bin/sh test independently asserted printf42 and emitted SHELL_ASSERT_OK.

Context: android-app; mode: direct; prerequisites: runtime.modern.

Attempts: runtime-core-a01-unix-shell (android-app/direct pass): Actual /bin/sh test independently asserted printf42 and emitted SHELL_ASSERT_OK.; artifacts git:b1b8a74:spike/m2/runtime/core.mjs SHA256 c8b4d325c4920bda0f3289bdd08cac2e7fd74b504919e6f85ae9a7ff30aec4d0, git:b1b8a74:spike/m2/runtime/core-a01.sh SHA256 d90efe39dd9b1f7868fddd6d893dc02b2227f82650b338600f824cc6cd84bd90, git:b1b8a74:spike/m2/runtime/linux.sh SHA256 3673a0001302c5d8e27cb7390579a5ac7b058db8454b1f9498a754c16befbb0f, git:b1b8a74:spike/m2/runtime/artifact-manifest.json SHA256 af480a721970682c3b1839f280c18a2f8c4ed008adfb397642e9943abdbe80f0, git:b1b8a74:spike/m2/runtime/evidence/core-a01.json SHA256 5a2069fde21deae50fbd9fd2b58701161fa00f22c52b7cf0e39543083bb7f35e, git:b1b8a74:spike/m2/runtime/evidence/core-a01-native.json SHA256 b1c8392a869badf0596375f706f4db3d8ff98db3c4a87d5fcc86267f942636bb, git:b1b8a74:spike/m2/runtime/evidence/fixed-apk-hash.txt SHA256 57f495093e9cd5a5728b1d7f9bb9e8825a59027cfbd7168cf9772ac5cf41079d; metadata {"provider":{"topLevelPrompts":0,"modelRequests":0},"execution":{"package":"dev.olea.m2.runtime","targetSdk":36,"compileSdk":36,"minSdk":26,"androidApi":36,"measuredNodeArch":"x64","advertisedAbis":"x86_64,arm64-v8a","actualDomain":"u:r:untrusted_app:s0:c216,c256,c512,c768","realUid":10216,"hostPid":6197,"nodePid":6333,"nodePpid":6330,"nodeProcExe":"/opt/node/bin/node","loaderEnvAbsent":true,"apkSha256":"dbd494c8f9c533b20a5ed0a067dbb2496a34c2494911a9fc9cb4fb19f6435887"},"provenance":{"sourceCommit":"b1b8a74","nativePayloadSha256":{"libproot.so":"3dd2e5b23aee8dd8588750117f03b1b7971314e7457067af803d78d57306391d","libloader.so":"a836b0569c84b1661333d16bacf6b396ff08fea816a5c936a82e08ddeeca8341","libloader32.so":"fd5b394aa0801619e293b76fe6e830a3beb363aed4fa4b9a5a41f1388a0cb9b9","libtalloc.so":"7fa6722a4320495b1b85832fc7fd02de0cb367b45f116c1921b2830a6936da90","libandroid-shmem.so":"092926060298acd3778e6239033d7aef1280dcb59aebe021a3719612e6a3465f"},"components":[{"name":"Gradle","version":"9.1.0","url":"https://downloads.gradle.org/distributions/gradle-9.1.0-bin.zip","sha256":"a17ddd85a26b6a7f5ddb71ff8b05fc5104c0202c6e64782429790c933686c806","license":"Apache-2.0, build tool only"},{"name":"Ubuntu Base","version":"24.04.3 amd64","url":"https://cdimage.ubuntu.com/ubuntu-base/releases/24.04/release/ubuntu-base-24.04.3-base-amd64.tar.gz","sha256":"6bc2cde3930ad088b3bb46fa45279e96d25bc3810f209850ecbe4722711874f9","license":"Mixed; retain /usr/share/doc copyright and applicable corresponding source"},{"name":"Node","version":"24.20.0 Linux x64","url":"https://nodejs.org/dist/v24.20.0/node-v24.20.0-linux-x64.tar.xz","sha256":"2f2c0da162318f0de47665410c7c8c2ed3d36c8f3105de4bbc61176c70a7cbf2","license":"MIT plus bundled notices"},{"name":"Termux PRoot","version":"5.1.107.102 x86_64","url":"https://packages.termux.dev/apt/termux-main/pool/main/p/proot/proot_5.1.107.102_x86_64.deb","sha256":"2497064226c15971be8131c7facead94a06c225347796326a383c832dca57758","license":"GPL-2.0; corresponding source/notices required before redistribution","source":"https://github.com/termux/proot"},{"name":"libtalloc","version":"2.5.0 x86_64","url":"https://packages.termux.dev/apt/termux-main/pool/main/libt/libtalloc/libtalloc_2.5.0_x86_64.deb","sha256":"b8c6d95f20075dc1f9ec6573575b2444e8d526e48e0d8d6d5cf4e071e6e06530","license":"LGPL-3.0-or-later; source/relinking obligations","source":"https://talloc.samba.org/"},{"name":"libandroid-shmem","version":"0.7 x86_64","url":"https://packages.termux.dev/apt/termux-main/pool/main/liba/libandroid-shmem/libandroid-shmem_0.7_x86_64.deb","sha256":"ffa9e4c87467b158b148d0ff92dda796aa038276c2075af3269cdcdb06f25797","license":"BSD-3-Clause; retain copyright/disclaimer","source":"https://github.com/termux/libandroid-shmem"}],"licenseLimits":"No publishing; source obligations inventory is not distribution clearance; original MIT does not relicense dependencies","transform":"Verified native regular-file bytes renamed to Android lib*.so packaging names, no binary edits; debug symbols retained; PackageManager extraction requested through AGP useLegacyPackaging"},"limits":["Actual target36 service domain, not development run-as.","Emulator x64 only; advertised arm64-v8a is not physical ARM64 execution.","Core deterministic work is not stock-agent/provider/shared-backend acceptance.","Single staged rootfs with manual recovery is not repeated corrected fresh install/update/recovery proof.","Native childPid null; source-controlled inner /proc identities corroborate actual children.","Residual linkerconfig warning retained; old glibc preload warnings belong earlier APK/launcher attempts.","Root exit and bounded pipe drain do not establish all descendant exit."],"currentState":{"observedAt":"2026-11-10T17:23:12.150Z","hostPidDuringCase":6197,"phonePermissionsAndStop":"not queried by this deterministic case","laterProcessState":"unknown from this snapshot"}}.

## unix.node: pass
Expected: Independently assert real node under native supervision.

Actual: Stock upstream Node24.20.0 Linux x64 /opt/node/bin/node executed under real Android UID10216/untrusted_app, clean guest loader environment.

Context: android-app; mode: direct; prerequisites: runtime.modern.

Attempts: runtime-core-a01-unix-node (android-app/direct pass): Stock upstream Node24.20.0 Linux x64 /opt/node/bin/node executed under real Android UID10216/untrusted_app, clean guest loader environment.; artifacts git:b1b8a74:spike/m2/runtime/core.mjs SHA256 c8b4d325c4920bda0f3289bdd08cac2e7fd74b504919e6f85ae9a7ff30aec4d0, git:b1b8a74:spike/m2/runtime/core-a01.sh SHA256 d90efe39dd9b1f7868fddd6d893dc02b2227f82650b338600f824cc6cd84bd90, git:b1b8a74:spike/m2/runtime/linux.sh SHA256 3673a0001302c5d8e27cb7390579a5ac7b058db8454b1f9498a754c16befbb0f, git:b1b8a74:spike/m2/runtime/artifact-manifest.json SHA256 af480a721970682c3b1839f280c18a2f8c4ed008adfb397642e9943abdbe80f0, git:b1b8a74:spike/m2/runtime/evidence/core-a01.json SHA256 5a2069fde21deae50fbd9fd2b58701161fa00f22c52b7cf0e39543083bb7f35e, git:b1b8a74:spike/m2/runtime/evidence/core-a01-native.json SHA256 b1c8392a869badf0596375f706f4db3d8ff98db3c4a87d5fcc86267f942636bb, git:b1b8a74:spike/m2/runtime/evidence/fixed-apk-hash.txt SHA256 57f495093e9cd5a5728b1d7f9bb9e8825a59027cfbd7168cf9772ac5cf41079d; metadata {"provider":{"topLevelPrompts":0,"modelRequests":0},"execution":{"package":"dev.olea.m2.runtime","targetSdk":36,"compileSdk":36,"minSdk":26,"androidApi":36,"measuredNodeArch":"x64","advertisedAbis":"x86_64,arm64-v8a","actualDomain":"u:r:untrusted_app:s0:c216,c256,c512,c768","realUid":10216,"hostPid":6197,"nodePid":6333,"nodePpid":6330,"nodeProcExe":"/opt/node/bin/node","loaderEnvAbsent":true,"apkSha256":"dbd494c8f9c533b20a5ed0a067dbb2496a34c2494911a9fc9cb4fb19f6435887"},"provenance":{"sourceCommit":"b1b8a74","nativePayloadSha256":{"libproot.so":"3dd2e5b23aee8dd8588750117f03b1b7971314e7457067af803d78d57306391d","libloader.so":"a836b0569c84b1661333d16bacf6b396ff08fea816a5c936a82e08ddeeca8341","libloader32.so":"fd5b394aa0801619e293b76fe6e830a3beb363aed4fa4b9a5a41f1388a0cb9b9","libtalloc.so":"7fa6722a4320495b1b85832fc7fd02de0cb367b45f116c1921b2830a6936da90","libandroid-shmem.so":"092926060298acd3778e6239033d7aef1280dcb59aebe021a3719612e6a3465f"},"components":[{"name":"Gradle","version":"9.1.0","url":"https://downloads.gradle.org/distributions/gradle-9.1.0-bin.zip","sha256":"a17ddd85a26b6a7f5ddb71ff8b05fc5104c0202c6e64782429790c933686c806","license":"Apache-2.0, build tool only"},{"name":"Ubuntu Base","version":"24.04.3 amd64","url":"https://cdimage.ubuntu.com/ubuntu-base/releases/24.04/release/ubuntu-base-24.04.3-base-amd64.tar.gz","sha256":"6bc2cde3930ad088b3bb46fa45279e96d25bc3810f209850ecbe4722711874f9","license":"Mixed; retain /usr/share/doc copyright and applicable corresponding source"},{"name":"Node","version":"24.20.0 Linux x64","url":"https://nodejs.org/dist/v24.20.0/node-v24.20.0-linux-x64.tar.xz","sha256":"2f2c0da162318f0de47665410c7c8c2ed3d36c8f3105de4bbc61176c70a7cbf2","license":"MIT plus bundled notices"},{"name":"Termux PRoot","version":"5.1.107.102 x86_64","url":"https://packages.termux.dev/apt/termux-main/pool/main/p/proot/proot_5.1.107.102_x86_64.deb","sha256":"2497064226c15971be8131c7facead94a06c225347796326a383c832dca57758","license":"GPL-2.0; corresponding source/notices required before redistribution","source":"https://github.com/termux/proot"},{"name":"libtalloc","version":"2.5.0 x86_64","url":"https://packages.termux.dev/apt/termux-main/pool/main/libt/libtalloc/libtalloc_2.5.0_x86_64.deb","sha256":"b8c6d95f20075dc1f9ec6573575b2444e8d526e48e0d8d6d5cf4e071e6e06530","license":"LGPL-3.0-or-later; source/relinking obligations","source":"https://talloc.samba.org/"},{"name":"libandroid-shmem","version":"0.7 x86_64","url":"https://packages.termux.dev/apt/termux-main/pool/main/liba/libandroid-shmem/libandroid-shmem_0.7_x86_64.deb","sha256":"ffa9e4c87467b158b148d0ff92dda796aa038276c2075af3269cdcdb06f25797","license":"BSD-3-Clause; retain copyright/disclaimer","source":"https://github.com/termux/libandroid-shmem"}],"licenseLimits":"No publishing; source obligations inventory is not distribution clearance; original MIT does not relicense dependencies","transform":"Verified native regular-file bytes renamed to Android lib*.so packaging names, no binary edits; debug symbols retained; PackageManager extraction requested through AGP useLegacyPackaging"},"limits":["Actual target36 service domain, not development run-as.","Emulator x64 only; advertised arm64-v8a is not physical ARM64 execution.","Core deterministic work is not stock-agent/provider/shared-backend acceptance.","Single staged rootfs with manual recovery is not repeated corrected fresh install/update/recovery proof.","Native childPid null; source-controlled inner /proc identities corroborate actual children.","Residual linkerconfig warning retained; old glibc preload warnings belong earlier APK/launcher attempts.","Root exit and bounded pipe drain do not establish all descendant exit."],"currentState":{"observedAt":"2026-11-10T17:23:12.150Z","hostPidDuringCase":6197,"phonePermissionsAndStop":"not queried by this deterministic case","laterProcessState":"unknown from this snapshot"}}.

## unix.git-object: pass
Expected: Independently assert real git-object under native supervision.

Actual: Fresh Git2.43.0 commitc854baa1c0030681859ea52e276157f4b3b76dcd; independent git-show exact randomized value check SHA256e046cee369496fcc10e9b7759ee794fcc62c70117b103997338c8dda89293fe0.

Context: android-app; mode: direct; prerequisites: runtime.modern.

Attempts: runtime-core-a01-unix-git-object (android-app/direct pass): Fresh Git2.43.0 commitc854baa1c0030681859ea52e276157f4b3b76dcd; independent git-show exact randomized value check SHA256e046cee369496fcc10e9b7759ee794fcc62c70117b103997338c8dda89293fe0.; artifacts git:b1b8a74:spike/m2/runtime/core.mjs SHA256 c8b4d325c4920bda0f3289bdd08cac2e7fd74b504919e6f85ae9a7ff30aec4d0, git:b1b8a74:spike/m2/runtime/core-a01.sh SHA256 d90efe39dd9b1f7868fddd6d893dc02b2227f82650b338600f824cc6cd84bd90, git:b1b8a74:spike/m2/runtime/linux.sh SHA256 3673a0001302c5d8e27cb7390579a5ac7b058db8454b1f9498a754c16befbb0f, git:b1b8a74:spike/m2/runtime/artifact-manifest.json SHA256 af480a721970682c3b1839f280c18a2f8c4ed008adfb397642e9943abdbe80f0, git:b1b8a74:spike/m2/runtime/evidence/core-a01.json SHA256 5a2069fde21deae50fbd9fd2b58701161fa00f22c52b7cf0e39543083bb7f35e, git:b1b8a74:spike/m2/runtime/evidence/core-a01-native.json SHA256 b1c8392a869badf0596375f706f4db3d8ff98db3c4a87d5fcc86267f942636bb, git:b1b8a74:spike/m2/runtime/evidence/fixed-apk-hash.txt SHA256 57f495093e9cd5a5728b1d7f9bb9e8825a59027cfbd7168cf9772ac5cf41079d; metadata {"provider":{"topLevelPrompts":0,"modelRequests":0},"execution":{"package":"dev.olea.m2.runtime","targetSdk":36,"compileSdk":36,"minSdk":26,"androidApi":36,"measuredNodeArch":"x64","advertisedAbis":"x86_64,arm64-v8a","actualDomain":"u:r:untrusted_app:s0:c216,c256,c512,c768","realUid":10216,"hostPid":6197,"nodePid":6333,"nodePpid":6330,"nodeProcExe":"/opt/node/bin/node","loaderEnvAbsent":true,"apkSha256":"dbd494c8f9c533b20a5ed0a067dbb2496a34c2494911a9fc9cb4fb19f6435887"},"provenance":{"sourceCommit":"b1b8a74","nativePayloadSha256":{"libproot.so":"3dd2e5b23aee8dd8588750117f03b1b7971314e7457067af803d78d57306391d","libloader.so":"a836b0569c84b1661333d16bacf6b396ff08fea816a5c936a82e08ddeeca8341","libloader32.so":"fd5b394aa0801619e293b76fe6e830a3beb363aed4fa4b9a5a41f1388a0cb9b9","libtalloc.so":"7fa6722a4320495b1b85832fc7fd02de0cb367b45f116c1921b2830a6936da90","libandroid-shmem.so":"092926060298acd3778e6239033d7aef1280dcb59aebe021a3719612e6a3465f"},"components":[{"name":"Gradle","version":"9.1.0","url":"https://downloads.gradle.org/distributions/gradle-9.1.0-bin.zip","sha256":"a17ddd85a26b6a7f5ddb71ff8b05fc5104c0202c6e64782429790c933686c806","license":"Apache-2.0, build tool only"},{"name":"Ubuntu Base","version":"24.04.3 amd64","url":"https://cdimage.ubuntu.com/ubuntu-base/releases/24.04/release/ubuntu-base-24.04.3-base-amd64.tar.gz","sha256":"6bc2cde3930ad088b3bb46fa45279e96d25bc3810f209850ecbe4722711874f9","license":"Mixed; retain /usr/share/doc copyright and applicable corresponding source"},{"name":"Node","version":"24.20.0 Linux x64","url":"https://nodejs.org/dist/v24.20.0/node-v24.20.0-linux-x64.tar.xz","sha256":"2f2c0da162318f0de47665410c7c8c2ed3d36c8f3105de4bbc61176c70a7cbf2","license":"MIT plus bundled notices"},{"name":"Termux PRoot","version":"5.1.107.102 x86_64","url":"https://packages.termux.dev/apt/termux-main/pool/main/p/proot/proot_5.1.107.102_x86_64.deb","sha256":"2497064226c15971be8131c7facead94a06c225347796326a383c832dca57758","license":"GPL-2.0; corresponding source/notices required before redistribution","source":"https://github.com/termux/proot"},{"name":"libtalloc","version":"2.5.0 x86_64","url":"https://packages.termux.dev/apt/termux-main/pool/main/libt/libtalloc/libtalloc_2.5.0_x86_64.deb","sha256":"b8c6d95f20075dc1f9ec6573575b2444e8d526e48e0d8d6d5cf4e071e6e06530","license":"LGPL-3.0-or-later; source/relinking obligations","source":"https://talloc.samba.org/"},{"name":"libandroid-shmem","version":"0.7 x86_64","url":"https://packages.termux.dev/apt/termux-main/pool/main/liba/libandroid-shmem/libandroid-shmem_0.7_x86_64.deb","sha256":"ffa9e4c87467b158b148d0ff92dda796aa038276c2075af3269cdcdb06f25797","license":"BSD-3-Clause; retain copyright/disclaimer","source":"https://github.com/termux/libandroid-shmem"}],"licenseLimits":"No publishing; source obligations inventory is not distribution clearance; original MIT does not relicense dependencies","transform":"Verified native regular-file bytes renamed to Android lib*.so packaging names, no binary edits; debug symbols retained; PackageManager extraction requested through AGP useLegacyPackaging"},"limits":["Actual target36 service domain, not development run-as.","Emulator x64 only; advertised arm64-v8a is not physical ARM64 execution.","Core deterministic work is not stock-agent/provider/shared-backend acceptance.","Single staged rootfs with manual recovery is not repeated corrected fresh install/update/recovery proof.","Native childPid null; source-controlled inner /proc identities corroborate actual children.","Residual linkerconfig warning retained; old glibc preload warnings belong earlier APK/launcher attempts.","Root exit and bounded pipe drain do not establish all descendant exit."],"currentState":{"observedAt":"2026-11-10T17:23:12.150Z","hostPidDuringCase":6197,"phonePermissionsAndStop":"not queried by this deterministic case","laterProcessState":"unknown from this snapshot"}}.

## unix.dns-tls: pass
Expected: Independently assert real dns-tls under native supervision.

Actual: DNS registry lookup resolved; default certificate-validated TLS metadata HTTP200, socket authorized=true, expected version7.0.0 asserted.

Context: android-app; mode: direct; prerequisites: runtime.modern.

Attempts: runtime-core-a01-unix-dns-tls (android-app/direct pass): DNS registry lookup resolved; default certificate-validated TLS metadata HTTP200, socket authorized=true, expected version7.0.0 asserted.; artifacts git:b1b8a74:spike/m2/runtime/core.mjs SHA256 c8b4d325c4920bda0f3289bdd08cac2e7fd74b504919e6f85ae9a7ff30aec4d0, git:b1b8a74:spike/m2/runtime/core-a01.sh SHA256 d90efe39dd9b1f7868fddd6d893dc02b2227f82650b338600f824cc6cd84bd90, git:b1b8a74:spike/m2/runtime/linux.sh SHA256 3673a0001302c5d8e27cb7390579a5ac7b058db8454b1f9498a754c16befbb0f, git:b1b8a74:spike/m2/runtime/artifact-manifest.json SHA256 af480a721970682c3b1839f280c18a2f8c4ed008adfb397642e9943abdbe80f0, git:b1b8a74:spike/m2/runtime/evidence/core-a01.json SHA256 5a2069fde21deae50fbd9fd2b58701161fa00f22c52b7cf0e39543083bb7f35e, git:b1b8a74:spike/m2/runtime/evidence/core-a01-native.json SHA256 b1c8392a869badf0596375f706f4db3d8ff98db3c4a87d5fcc86267f942636bb, git:b1b8a74:spike/m2/runtime/evidence/fixed-apk-hash.txt SHA256 57f495093e9cd5a5728b1d7f9bb9e8825a59027cfbd7168cf9772ac5cf41079d; metadata {"provider":{"topLevelPrompts":0,"modelRequests":0},"execution":{"package":"dev.olea.m2.runtime","targetSdk":36,"compileSdk":36,"minSdk":26,"androidApi":36,"measuredNodeArch":"x64","advertisedAbis":"x86_64,arm64-v8a","actualDomain":"u:r:untrusted_app:s0:c216,c256,c512,c768","realUid":10216,"hostPid":6197,"nodePid":6333,"nodePpid":6330,"nodeProcExe":"/opt/node/bin/node","loaderEnvAbsent":true,"apkSha256":"dbd494c8f9c533b20a5ed0a067dbb2496a34c2494911a9fc9cb4fb19f6435887"},"provenance":{"sourceCommit":"b1b8a74","nativePayloadSha256":{"libproot.so":"3dd2e5b23aee8dd8588750117f03b1b7971314e7457067af803d78d57306391d","libloader.so":"a836b0569c84b1661333d16bacf6b396ff08fea816a5c936a82e08ddeeca8341","libloader32.so":"fd5b394aa0801619e293b76fe6e830a3beb363aed4fa4b9a5a41f1388a0cb9b9","libtalloc.so":"7fa6722a4320495b1b85832fc7fd02de0cb367b45f116c1921b2830a6936da90","libandroid-shmem.so":"092926060298acd3778e6239033d7aef1280dcb59aebe021a3719612e6a3465f"},"components":[{"name":"Gradle","version":"9.1.0","url":"https://downloads.gradle.org/distributions/gradle-9.1.0-bin.zip","sha256":"a17ddd85a26b6a7f5ddb71ff8b05fc5104c0202c6e64782429790c933686c806","license":"Apache-2.0, build tool only"},{"name":"Ubuntu Base","version":"24.04.3 amd64","url":"https://cdimage.ubuntu.com/ubuntu-base/releases/24.04/release/ubuntu-base-24.04.3-base-amd64.tar.gz","sha256":"6bc2cde3930ad088b3bb46fa45279e96d25bc3810f209850ecbe4722711874f9","license":"Mixed; retain /usr/share/doc copyright and applicable corresponding source"},{"name":"Node","version":"24.20.0 Linux x64","url":"https://nodejs.org/dist/v24.20.0/node-v24.20.0-linux-x64.tar.xz","sha256":"2f2c0da162318f0de47665410c7c8c2ed3d36c8f3105de4bbc61176c70a7cbf2","license":"MIT plus bundled notices"},{"name":"Termux PRoot","version":"5.1.107.102 x86_64","url":"https://packages.termux.dev/apt/termux-main/pool/main/p/proot/proot_5.1.107.102_x86_64.deb","sha256":"2497064226c15971be8131c7facead94a06c225347796326a383c832dca57758","license":"GPL-2.0; corresponding source/notices required before redistribution","source":"https://github.com/termux/proot"},{"name":"libtalloc","version":"2.5.0 x86_64","url":"https://packages.termux.dev/apt/termux-main/pool/main/libt/libtalloc/libtalloc_2.5.0_x86_64.deb","sha256":"b8c6d95f20075dc1f9ec6573575b2444e8d526e48e0d8d6d5cf4e071e6e06530","license":"LGPL-3.0-or-later; source/relinking obligations","source":"https://talloc.samba.org/"},{"name":"libandroid-shmem","version":"0.7 x86_64","url":"https://packages.termux.dev/apt/termux-main/pool/main/liba/libandroid-shmem/libandroid-shmem_0.7_x86_64.deb","sha256":"ffa9e4c87467b158b148d0ff92dda796aa038276c2075af3269cdcdb06f25797","license":"BSD-3-Clause; retain copyright/disclaimer","source":"https://github.com/termux/libandroid-shmem"}],"licenseLimits":"No publishing; source obligations inventory is not distribution clearance; original MIT does not relicense dependencies","transform":"Verified native regular-file bytes renamed to Android lib*.so packaging names, no binary edits; debug symbols retained; PackageManager extraction requested through AGP useLegacyPackaging"},"limits":["Actual target36 service domain, not development run-as.","Emulator x64 only; advertised arm64-v8a is not physical ARM64 execution.","Core deterministic work is not stock-agent/provider/shared-backend acceptance.","Single staged rootfs with manual recovery is not repeated corrected fresh install/update/recovery proof.","Native childPid null; source-controlled inner /proc identities corroborate actual children.","Residual linkerconfig warning retained; old glibc preload warnings belong earlier APK/launcher attempts.","Root exit and bounded pipe drain do not establish all descendant exit."],"currentState":{"observedAt":"2026-11-10T17:23:12.150Z","hostPidDuringCase":6197,"phonePermissionsAndStop":"not queried by this deterministic case","laterProcessState":"unknown from this snapshot"}}.

## unix.dependency: pass
Expected: Independently assert real dependency under native supervision.

Actual: Ordinary upstream npm install is-number@7.0.0 with retries0 succeeded; independent require accepts42 and rejects olea.

Context: android-app; mode: direct; prerequisites: runtime.modern.

Attempts: runtime-core-a01-unix-dependency (android-app/direct pass): Ordinary upstream npm install is-number@7.0.0 with retries0 succeeded; independent require accepts42 and rejects olea.; artifacts git:b1b8a74:spike/m2/runtime/core.mjs SHA256 c8b4d325c4920bda0f3289bdd08cac2e7fd74b504919e6f85ae9a7ff30aec4d0, git:b1b8a74:spike/m2/runtime/core-a01.sh SHA256 d90efe39dd9b1f7868fddd6d893dc02b2227f82650b338600f824cc6cd84bd90, git:b1b8a74:spike/m2/runtime/linux.sh SHA256 3673a0001302c5d8e27cb7390579a5ac7b058db8454b1f9498a754c16befbb0f, git:b1b8a74:spike/m2/runtime/artifact-manifest.json SHA256 af480a721970682c3b1839f280c18a2f8c4ed008adfb397642e9943abdbe80f0, git:b1b8a74:spike/m2/runtime/evidence/core-a01.json SHA256 5a2069fde21deae50fbd9fd2b58701161fa00f22c52b7cf0e39543083bb7f35e, git:b1b8a74:spike/m2/runtime/evidence/core-a01-native.json SHA256 b1c8392a869badf0596375f706f4db3d8ff98db3c4a87d5fcc86267f942636bb, git:b1b8a74:spike/m2/runtime/evidence/fixed-apk-hash.txt SHA256 57f495093e9cd5a5728b1d7f9bb9e8825a59027cfbd7168cf9772ac5cf41079d; metadata {"provider":{"topLevelPrompts":0,"modelRequests":0},"execution":{"package":"dev.olea.m2.runtime","targetSdk":36,"compileSdk":36,"minSdk":26,"androidApi":36,"measuredNodeArch":"x64","advertisedAbis":"x86_64,arm64-v8a","actualDomain":"u:r:untrusted_app:s0:c216,c256,c512,c768","realUid":10216,"hostPid":6197,"nodePid":6333,"nodePpid":6330,"nodeProcExe":"/opt/node/bin/node","loaderEnvAbsent":true,"apkSha256":"dbd494c8f9c533b20a5ed0a067dbb2496a34c2494911a9fc9cb4fb19f6435887"},"provenance":{"sourceCommit":"b1b8a74","nativePayloadSha256":{"libproot.so":"3dd2e5b23aee8dd8588750117f03b1b7971314e7457067af803d78d57306391d","libloader.so":"a836b0569c84b1661333d16bacf6b396ff08fea816a5c936a82e08ddeeca8341","libloader32.so":"fd5b394aa0801619e293b76fe6e830a3beb363aed4fa4b9a5a41f1388a0cb9b9","libtalloc.so":"7fa6722a4320495b1b85832fc7fd02de0cb367b45f116c1921b2830a6936da90","libandroid-shmem.so":"092926060298acd3778e6239033d7aef1280dcb59aebe021a3719612e6a3465f"},"components":[{"name":"Gradle","version":"9.1.0","url":"https://downloads.gradle.org/distributions/gradle-9.1.0-bin.zip","sha256":"a17ddd85a26b6a7f5ddb71ff8b05fc5104c0202c6e64782429790c933686c806","license":"Apache-2.0, build tool only"},{"name":"Ubuntu Base","version":"24.04.3 amd64","url":"https://cdimage.ubuntu.com/ubuntu-base/releases/24.04/release/ubuntu-base-24.04.3-base-amd64.tar.gz","sha256":"6bc2cde3930ad088b3bb46fa45279e96d25bc3810f209850ecbe4722711874f9","license":"Mixed; retain /usr/share/doc copyright and applicable corresponding source"},{"name":"Node","version":"24.20.0 Linux x64","url":"https://nodejs.org/dist/v24.20.0/node-v24.20.0-linux-x64.tar.xz","sha256":"2f2c0da162318f0de47665410c7c8c2ed3d36c8f3105de4bbc61176c70a7cbf2","license":"MIT plus bundled notices"},{"name":"Termux PRoot","version":"5.1.107.102 x86_64","url":"https://packages.termux.dev/apt/termux-main/pool/main/p/proot/proot_5.1.107.102_x86_64.deb","sha256":"2497064226c15971be8131c7facead94a06c225347796326a383c832dca57758","license":"GPL-2.0; corresponding source/notices required before redistribution","source":"https://github.com/termux/proot"},{"name":"libtalloc","version":"2.5.0 x86_64","url":"https://packages.termux.dev/apt/termux-main/pool/main/libt/libtalloc/libtalloc_2.5.0_x86_64.deb","sha256":"b8c6d95f20075dc1f9ec6573575b2444e8d526e48e0d8d6d5cf4e071e6e06530","license":"LGPL-3.0-or-later; source/relinking obligations","source":"https://talloc.samba.org/"},{"name":"libandroid-shmem","version":"0.7 x86_64","url":"https://packages.termux.dev/apt/termux-main/pool/main/liba/libandroid-shmem/libandroid-shmem_0.7_x86_64.deb","sha256":"ffa9e4c87467b158b148d0ff92dda796aa038276c2075af3269cdcdb06f25797","license":"BSD-3-Clause; retain copyright/disclaimer","source":"https://github.com/termux/libandroid-shmem"}],"licenseLimits":"No publishing; source obligations inventory is not distribution clearance; original MIT does not relicense dependencies","transform":"Verified native regular-file bytes renamed to Android lib*.so packaging names, no binary edits; debug symbols retained; PackageManager extraction requested through AGP useLegacyPackaging"},"limits":["Actual target36 service domain, not development run-as.","Emulator x64 only; advertised arm64-v8a is not physical ARM64 execution.","Core deterministic work is not stock-agent/provider/shared-backend acceptance.","Single staged rootfs with manual recovery is not repeated corrected fresh install/update/recovery proof.","Native childPid null; source-controlled inner /proc identities corroborate actual children.","Residual linkerconfig warning retained; old glibc preload warnings belong earlier APK/launcher attempts.","Root exit and bounded pipe drain do not establish all descendant exit."],"currentState":{"observedAt":"2026-11-10T17:23:12.150Z","hostPidDuringCase":6197,"phonePermissionsAndStop":"not queried by this deterministic case","laterProcessState":"unknown from this snapshot"}}.

## unix.child: pass
Expected: Independently assert real child under native supervision.

Actual: Core Node6333->child6343, recorded PPID/stat/startticks and child exit0; source-controlled spawnSync and result assertions executed.

Context: android-app; mode: direct; prerequisites: runtime.modern.

Attempts: runtime-core-a01-unix-child (android-app/direct pass): Core Node6333->child6343, recorded PPID/stat/startticks and child exit0; source-controlled spawnSync and result assertions executed.; artifacts git:b1b8a74:spike/m2/runtime/core.mjs SHA256 c8b4d325c4920bda0f3289bdd08cac2e7fd74b504919e6f85ae9a7ff30aec4d0, git:b1b8a74:spike/m2/runtime/core-a01.sh SHA256 d90efe39dd9b1f7868fddd6d893dc02b2227f82650b338600f824cc6cd84bd90, git:b1b8a74:spike/m2/runtime/linux.sh SHA256 3673a0001302c5d8e27cb7390579a5ac7b058db8454b1f9498a754c16befbb0f, git:b1b8a74:spike/m2/runtime/artifact-manifest.json SHA256 af480a721970682c3b1839f280c18a2f8c4ed008adfb397642e9943abdbe80f0, git:b1b8a74:spike/m2/runtime/evidence/core-a01.json SHA256 5a2069fde21deae50fbd9fd2b58701161fa00f22c52b7cf0e39543083bb7f35e, git:b1b8a74:spike/m2/runtime/evidence/core-a01-native.json SHA256 b1c8392a869badf0596375f706f4db3d8ff98db3c4a87d5fcc86267f942636bb, git:b1b8a74:spike/m2/runtime/evidence/fixed-apk-hash.txt SHA256 57f495093e9cd5a5728b1d7f9bb9e8825a59027cfbd7168cf9772ac5cf41079d; metadata {"provider":{"topLevelPrompts":0,"modelRequests":0},"execution":{"package":"dev.olea.m2.runtime","targetSdk":36,"compileSdk":36,"minSdk":26,"androidApi":36,"measuredNodeArch":"x64","advertisedAbis":"x86_64,arm64-v8a","actualDomain":"u:r:untrusted_app:s0:c216,c256,c512,c768","realUid":10216,"hostPid":6197,"nodePid":6333,"nodePpid":6330,"nodeProcExe":"/opt/node/bin/node","loaderEnvAbsent":true,"apkSha256":"dbd494c8f9c533b20a5ed0a067dbb2496a34c2494911a9fc9cb4fb19f6435887","child":{"childStatus":0,"pid":6343,"ppid":6333,"stat":"6343 (MainThread) R 6333 489 0 0 -1 4194304 3036 2973 0 0 3 2 2 4 20 0 7 0 133870 1306537984 11313 18446744073709551615 105553116266496 105553116267640 140733956138352 0 0 0 0 16781312 17922 0 0 0 17 2 0 0 0 0 0 105553116284024 105553116284168 105553507201024 140733956140191 140733956140745 140733956140745 140733956140942 0\n","nestedStatus":0,"nested":{"value":42,"pid":6350,"ppid":6343,"stat":"6350 (MainThread) R 6343 489 0 0 -1 4194304 2743 0 0 0 1 3 0 0 20 0 7 0 133882 1306271744 10621 18446744073709551615 105553116266496 105553116267640 140733069096912 0 0 0 0 16781312 17922 0 0 0 17 3 0 0 0 0 0 105553116284024 105553116284168 105554054823936 140733069098442 140733069098697 140733069098697 140733069098894 0\n","uid":"Uid:\t10216\t10216\t10216\t10216"}}},"provenance":{"sourceCommit":"b1b8a74","nativePayloadSha256":{"libproot.so":"3dd2e5b23aee8dd8588750117f03b1b7971314e7457067af803d78d57306391d","libloader.so":"a836b0569c84b1661333d16bacf6b396ff08fea816a5c936a82e08ddeeca8341","libloader32.so":"fd5b394aa0801619e293b76fe6e830a3beb363aed4fa4b9a5a41f1388a0cb9b9","libtalloc.so":"7fa6722a4320495b1b85832fc7fd02de0cb367b45f116c1921b2830a6936da90","libandroid-shmem.so":"092926060298acd3778e6239033d7aef1280dcb59aebe021a3719612e6a3465f"},"components":[{"name":"Gradle","version":"9.1.0","url":"https://downloads.gradle.org/distributions/gradle-9.1.0-bin.zip","sha256":"a17ddd85a26b6a7f5ddb71ff8b05fc5104c0202c6e64782429790c933686c806","license":"Apache-2.0, build tool only"},{"name":"Ubuntu Base","version":"24.04.3 amd64","url":"https://cdimage.ubuntu.com/ubuntu-base/releases/24.04/release/ubuntu-base-24.04.3-base-amd64.tar.gz","sha256":"6bc2cde3930ad088b3bb46fa45279e96d25bc3810f209850ecbe4722711874f9","license":"Mixed; retain /usr/share/doc copyright and applicable corresponding source"},{"name":"Node","version":"24.20.0 Linux x64","url":"https://nodejs.org/dist/v24.20.0/node-v24.20.0-linux-x64.tar.xz","sha256":"2f2c0da162318f0de47665410c7c8c2ed3d36c8f3105de4bbc61176c70a7cbf2","license":"MIT plus bundled notices"},{"name":"Termux PRoot","version":"5.1.107.102 x86_64","url":"https://packages.termux.dev/apt/termux-main/pool/main/p/proot/proot_5.1.107.102_x86_64.deb","sha256":"2497064226c15971be8131c7facead94a06c225347796326a383c832dca57758","license":"GPL-2.0; corresponding source/notices required before redistribution","source":"https://github.com/termux/proot"},{"name":"libtalloc","version":"2.5.0 x86_64","url":"https://packages.termux.dev/apt/termux-main/pool/main/libt/libtalloc/libtalloc_2.5.0_x86_64.deb","sha256":"b8c6d95f20075dc1f9ec6573575b2444e8d526e48e0d8d6d5cf4e071e6e06530","license":"LGPL-3.0-or-later; source/relinking obligations","source":"https://talloc.samba.org/"},{"name":"libandroid-shmem","version":"0.7 x86_64","url":"https://packages.termux.dev/apt/termux-main/pool/main/liba/libandroid-shmem/libandroid-shmem_0.7_x86_64.deb","sha256":"ffa9e4c87467b158b148d0ff92dda796aa038276c2075af3269cdcdb06f25797","license":"BSD-3-Clause; retain copyright/disclaimer","source":"https://github.com/termux/libandroid-shmem"}],"licenseLimits":"No publishing; source obligations inventory is not distribution clearance; original MIT does not relicense dependencies","transform":"Verified native regular-file bytes renamed to Android lib*.so packaging names, no binary edits; debug symbols retained; PackageManager extraction requested through AGP useLegacyPackaging"},"limits":["Actual target36 service domain, not development run-as.","Emulator x64 only; advertised arm64-v8a is not physical ARM64 execution.","Core deterministic work is not stock-agent/provider/shared-backend acceptance.","Single staged rootfs with manual recovery is not repeated corrected fresh install/update/recovery proof.","Native childPid null; source-controlled inner /proc identities corroborate actual children.","Residual linkerconfig warning retained; old glibc preload warnings belong earlier APK/launcher attempts.","Root exit and bounded pipe drain do not establish all descendant exit."],"currentState":{"observedAt":"2026-11-10T17:23:12.150Z","hostPidDuringCase":6197,"phonePermissionsAndStop":"not queried by this deterministic case","laterProcessState":"unknown from this snapshot"}}.

## unix.nested-child: pass
Expected: Independently assert real nested-child under native supervision.

Actual: Child6343->nested6350 realUID10216, parentage/stat/startticks, nested value42 and status0 asserted. This is direct deterministic work, not model child causality.

Context: android-app; mode: direct; prerequisites: runtime.modern.

Attempts: runtime-core-a01-unix-nested-child (android-app/direct pass): Child6343->nested6350 realUID10216, parentage/stat/startticks, nested value42 and status0 asserted. This is direct deterministic work, not model child causality.; artifacts git:b1b8a74:spike/m2/runtime/core.mjs SHA256 c8b4d325c4920bda0f3289bdd08cac2e7fd74b504919e6f85ae9a7ff30aec4d0, git:b1b8a74:spike/m2/runtime/core-a01.sh SHA256 d90efe39dd9b1f7868fddd6d893dc02b2227f82650b338600f824cc6cd84bd90, git:b1b8a74:spike/m2/runtime/linux.sh SHA256 3673a0001302c5d8e27cb7390579a5ac7b058db8454b1f9498a754c16befbb0f, git:b1b8a74:spike/m2/runtime/artifact-manifest.json SHA256 af480a721970682c3b1839f280c18a2f8c4ed008adfb397642e9943abdbe80f0, git:b1b8a74:spike/m2/runtime/evidence/core-a01.json SHA256 5a2069fde21deae50fbd9fd2b58701161fa00f22c52b7cf0e39543083bb7f35e, git:b1b8a74:spike/m2/runtime/evidence/core-a01-native.json SHA256 b1c8392a869badf0596375f706f4db3d8ff98db3c4a87d5fcc86267f942636bb, git:b1b8a74:spike/m2/runtime/evidence/fixed-apk-hash.txt SHA256 57f495093e9cd5a5728b1d7f9bb9e8825a59027cfbd7168cf9772ac5cf41079d; metadata {"provider":{"topLevelPrompts":0,"modelRequests":0},"execution":{"package":"dev.olea.m2.runtime","targetSdk":36,"compileSdk":36,"minSdk":26,"androidApi":36,"measuredNodeArch":"x64","advertisedAbis":"x86_64,arm64-v8a","actualDomain":"u:r:untrusted_app:s0:c216,c256,c512,c768","realUid":10216,"hostPid":6197,"nodePid":6333,"nodePpid":6330,"nodeProcExe":"/opt/node/bin/node","loaderEnvAbsent":true,"apkSha256":"dbd494c8f9c533b20a5ed0a067dbb2496a34c2494911a9fc9cb4fb19f6435887","child":{"childStatus":0,"pid":6343,"ppid":6333,"stat":"6343 (MainThread) R 6333 489 0 0 -1 4194304 3036 2973 0 0 3 2 2 4 20 0 7 0 133870 1306537984 11313 18446744073709551615 105553116266496 105553116267640 140733956138352 0 0 0 0 16781312 17922 0 0 0 17 2 0 0 0 0 0 105553116284024 105553116284168 105553507201024 140733956140191 140733956140745 140733956140745 140733956140942 0\n","nestedStatus":0,"nested":{"value":42,"pid":6350,"ppid":6343,"stat":"6350 (MainThread) R 6343 489 0 0 -1 4194304 2743 0 0 0 1 3 0 0 20 0 7 0 133882 1306271744 10621 18446744073709551615 105553116266496 105553116267640 140733069096912 0 0 0 0 16781312 17922 0 0 0 17 3 0 0 0 0 0 105553116284024 105553116284168 105554054823936 140733069098442 140733069098697 140733069098697 140733069098894 0\n","uid":"Uid:\t10216\t10216\t10216\t10216"}}},"provenance":{"sourceCommit":"b1b8a74","nativePayloadSha256":{"libproot.so":"3dd2e5b23aee8dd8588750117f03b1b7971314e7457067af803d78d57306391d","libloader.so":"a836b0569c84b1661333d16bacf6b396ff08fea816a5c936a82e08ddeeca8341","libloader32.so":"fd5b394aa0801619e293b76fe6e830a3beb363aed4fa4b9a5a41f1388a0cb9b9","libtalloc.so":"7fa6722a4320495b1b85832fc7fd02de0cb367b45f116c1921b2830a6936da90","libandroid-shmem.so":"092926060298acd3778e6239033d7aef1280dcb59aebe021a3719612e6a3465f"},"components":[{"name":"Gradle","version":"9.1.0","url":"https://downloads.gradle.org/distributions/gradle-9.1.0-bin.zip","sha256":"a17ddd85a26b6a7f5ddb71ff8b05fc5104c0202c6e64782429790c933686c806","license":"Apache-2.0, build tool only"},{"name":"Ubuntu Base","version":"24.04.3 amd64","url":"https://cdimage.ubuntu.com/ubuntu-base/releases/24.04/release/ubuntu-base-24.04.3-base-amd64.tar.gz","sha256":"6bc2cde3930ad088b3bb46fa45279e96d25bc3810f209850ecbe4722711874f9","license":"Mixed; retain /usr/share/doc copyright and applicable corresponding source"},{"name":"Node","version":"24.20.0 Linux x64","url":"https://nodejs.org/dist/v24.20.0/node-v24.20.0-linux-x64.tar.xz","sha256":"2f2c0da162318f0de47665410c7c8c2ed3d36c8f3105de4bbc61176c70a7cbf2","license":"MIT plus bundled notices"},{"name":"Termux PRoot","version":"5.1.107.102 x86_64","url":"https://packages.termux.dev/apt/termux-main/pool/main/p/proot/proot_5.1.107.102_x86_64.deb","sha256":"2497064226c15971be8131c7facead94a06c225347796326a383c832dca57758","license":"GPL-2.0; corresponding source/notices required before redistribution","source":"https://github.com/termux/proot"},{"name":"libtalloc","version":"2.5.0 x86_64","url":"https://packages.termux.dev/apt/termux-main/pool/main/libt/libtalloc/libtalloc_2.5.0_x86_64.deb","sha256":"b8c6d95f20075dc1f9ec6573575b2444e8d526e48e0d8d6d5cf4e071e6e06530","license":"LGPL-3.0-or-later; source/relinking obligations","source":"https://talloc.samba.org/"},{"name":"libandroid-shmem","version":"0.7 x86_64","url":"https://packages.termux.dev/apt/termux-main/pool/main/liba/libandroid-shmem/libandroid-shmem_0.7_x86_64.deb","sha256":"ffa9e4c87467b158b148d0ff92dda796aa038276c2075af3269cdcdb06f25797","license":"BSD-3-Clause; retain copyright/disclaimer","source":"https://github.com/termux/libandroid-shmem"}],"licenseLimits":"No publishing; source obligations inventory is not distribution clearance; original MIT does not relicense dependencies","transform":"Verified native regular-file bytes renamed to Android lib*.so packaging names, no binary edits; debug symbols retained; PackageManager extraction requested through AGP useLegacyPackaging"},"limits":["Actual target36 service domain, not development run-as.","Emulator x64 only; advertised arm64-v8a is not physical ARM64 execution.","Core deterministic work is not stock-agent/provider/shared-backend acceptance.","Single staged rootfs with manual recovery is not repeated corrected fresh install/update/recovery proof.","Native childPid null; source-controlled inner /proc identities corroborate actual children.","Residual linkerconfig warning retained; old glibc preload warnings belong earlier APK/launcher attempts.","Root exit and bounded pipe drain do not establish all descendant exit."],"currentState":{"observedAt":"2026-11-10T17:23:12.150Z","hostPidDuringCase":6197,"phonePermissionsAndStop":"not queried by this deterministic case","laterProcessState":"unknown from this snapshot"}}.

## backend.shared: untested
Expected: Kotlin supervises ONE persistent backend with Pi and Codex adapters and real process identities.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: unix.node.

Attempts: none.

## pi.install: untested
Expected: Stock pi supported install, declared executable and artifact hashes.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: unix.node, unix.dns-tls.

Attempts: none.

## pi.initialize: untested
Expected: Stock pi: independently establish initialize; preserve thread/transcript/workspace and original failures.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: pi.install, backend.shared.

Attempts: none.

## pi.turn: untested
Expected: Stock pi: independently establish turn; preserve thread/transcript/workspace and original failures.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: pi.install, backend.shared.

Attempts: none.

## pi.stream: untested
Expected: Stock pi: independently establish stream; preserve thread/transcript/workspace and original failures.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: pi.install, backend.shared.

Attempts: none.

## pi.file: untested
Expected: Stock pi: independently establish file; preserve thread/transcript/workspace and original failures.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: pi.install, backend.shared.

Attempts: none.

## pi.shell: untested
Expected: Stock pi: independently establish shell; preserve thread/transcript/workspace and original failures.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: pi.install, backend.shared.

Attempts: none.

## pi.dependency: untested
Expected: Stock pi: independently establish dependency; preserve thread/transcript/workspace and original failures.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: pi.install, backend.shared.

Attempts: none.

## pi.child: untested
Expected: Stock pi: independently establish child; preserve thread/transcript/workspace and original failures.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: pi.install, backend.shared.

Attempts: none.

## pi.nested-child: untested
Expected: Stock pi: independently establish nested-child; preserve thread/transcript/workspace and original failures.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: pi.install, backend.shared.

Attempts: none.

## pi.resume: untested
Expected: Stock pi: independently establish resume; preserve thread/transcript/workspace and original failures.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: pi.install, backend.shared.

Attempts: none.

## pi.cancel: untested
Expected: Stock pi: independently establish cancel; preserve thread/transcript/workspace and original failures.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: pi.install, backend.shared.

Attempts: none.

## pi.error: untested
Expected: Stock pi: independently establish error; preserve thread/transcript/workspace and original failures.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: pi.install, backend.shared.

Attempts: none.

## pi.update: untested
Expected: Stock pi: independently establish update; preserve thread/transcript/workspace and original failures.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: pi.install, backend.shared.

Attempts: none.

## codex.install: untested
Expected: Stock codex supported install, declared executable and artifact hashes.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: unix.node, unix.dns-tls.

Attempts: none.

## codex.initialize: untested
Expected: Stock codex: independently establish initialize; preserve thread/transcript/workspace and original failures.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: codex.install, backend.shared.

Attempts: codex-host-primary-1794329763090-codex-initialize (host/direct pass): Stock Codex0.167.0 correlated initialize and thread creation succeeded, startup433.26320000000004ms; thread01a1c663-5e3b-7b11-84ff-87131e300b56.; artifacts git:5c9c93b:spike/m2/codex/attempts/host-primary-1794329763090.json SHA256 335f71deb4ee71ca0f2217c527d1dc74face73d145b2d329f3b039cc9b6dc72e, git:5c9c93b:spike/m2/codex/attempts/host-primary-1794329763090-diagnostics.json SHA256 01fee514cbe039a16c3108d4268db3fe92a4ad3cb0d07056a81ffe357fa19db9, git:5c9c93b:spike/m2/codex/attempts/host-primary-1794329763090-thread.json SHA256 cacc9398b15e728fd2a55824453349df2374a39f534119d9e91751aae2d2de3f, git:5c9c93b:spike/m2/codex/upstream-manifest.json SHA256 bb0707463c3624a3015c345c882602601e18a5d4b9631c1da7a82ed3c9806b24, git:5c9c93b:spike/m2/codex/INTERIM.md SHA256 6643baddac1f13f5f67c533fd6856fac191670d856afa86ed920d8219fa5022c; metadata {"provider":{"accountingReference":"codex-host-primary-1794329763090-codex-turn"},"execution":{"platform":"win32","node":"v24.20.0","threadId":"01a1c663-5e3b-7b11-84ff-87131e300b56","cwd":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794329763090-49b37d75\\workspace","home":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794329763090-49b37d75\\state\\codex\\case\\home","windowsOsSandbox":"disabled in independently retained stock sandbox log; declared workspace-write policy alone was insufficient"},"provenance":{"sourceCommit":"5c9c93b","codexVersion":"0.167.0","license":"Apache-2.0","declaredBin":"bin/codex.js","stockExecutableSha256":"edfdd48f8b458af0906e507b4cb05217b326c3d6e515e9f024e05e3b8d650f70","currentConfigSchemaSha256":"66ed795352d32f2464778acd2e332b7fafe644246d540cdceec4663c56cfbc16","downloadedBytesVerification":"Producer manifest records exact payload checks; this assessment independently hashes retained Git receipt bytes."},"limits":["Host-only evidence cannot establish Android/runtime/sandbox/phone acceptance.","No root/descendant exit guarantee from Windows root stop.","Teardown codex_delivery_unknown notifications are not provider incompatibility.","Model narrative about sandbox rejection is superseded by actual decline and disabled-sandbox diagnostic."]}; codex-host-controlled-1794330423552-codex-initialize (host/direct pass): Stock initialize/thread returned; startup839.8764000000001ms.; artifacts git:3f29bc0:spike/m2/codex/attempts/host-controlled-1794330423552.json SHA256 5bcd598e8d63662da65afbcfe262ae7000e285cfbd3f8e3022e1ef0fc154d544; metadata {"provider":{"accountingReference":"codex-host-controlled-1794330423552-codex-turn"},"execution":{"platform":"win32","node":"v24.20.0","threadId":"01a1c66d-7362-7261-a805-3282ba514cf2","home":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794330423552-23240d45\\state\\codex\\case\\home","cwd":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794330423552-23240d45\\workspace","actualSandbox":"Windows unelevated, separately checked two-path command/exec boundary"},"provenance":{"sourceCommit":"3f29bc0","codexVersion":"0.167.0"},"limits":["Host-only; no Linux/Android/runtime inference.","Protocol turn completion is not successful Unix work.","Windows root process exit does not establish descendant exit.","Structured shell launch failure is not provider incompatibility."]}.

## codex.turn: untested
Expected: Stock codex: independently establish turn; preserve thread/transcript/workspace and original failures.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: codex.install, backend.shared.

Attempts: codex-host-primary-1794329763090-codex-turn (host/model pass): Real preferred-model streamed turn completed in total attempt12271.4767ms; completion does not establish Unix effects.; artifacts git:5c9c93b:spike/m2/codex/attempts/host-primary-1794329763090.json SHA256 335f71deb4ee71ca0f2217c527d1dc74face73d145b2d329f3b039cc9b6dc72e, git:5c9c93b:spike/m2/codex/attempts/host-primary-1794329763090-diagnostics.json SHA256 01fee514cbe039a16c3108d4268db3fe92a4ad3cb0d07056a81ffe357fa19db9, git:5c9c93b:spike/m2/codex/attempts/host-primary-1794329763090-thread.json SHA256 cacc9398b15e728fd2a55824453349df2374a39f534119d9e91751aae2d2de3f, git:5c9c93b:spike/m2/codex/upstream-manifest.json SHA256 bb0707463c3624a3015c345c882602601e18a5d4b9631c1da7a82ed3c9806b24, git:5c9c93b:spike/m2/codex/INTERIM.md SHA256 6643baddac1f13f5f67c533fd6856fac191670d856afa86ed920d8219fa5022c; metadata {"provider":{"allocationId":"manager-codex-host-first","model":"gpt-6.1-terra","topLevelPrompts":1,"inferenceResultsAtLeast":2,"observedHttpRequests":null,"requestRetries":0,"streamRetries":0,"deduplicatedLatestCumulativeUsage":{"totalTokens":43595,"inputTokens":43411,"cachedInputTokens":23846,"cacheWriteInputTokens":0,"outputTokens":184,"reasoningOutputTokens":0},"remoteBilling":"unknown","strictTokenCap":"unsupported in inspected turn/start schema"},"execution":{"platform":"win32","node":"v24.20.0","threadId":"01a1c663-5e3b-7b11-84ff-87131e300b56","cwd":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794329763090-49b37d75\\workspace","home":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794329763090-49b37d75\\state\\codex\\case\\home","windowsOsSandbox":"disabled in independently retained stock sandbox log; declared workspace-write policy alone was insufficient"},"provenance":{"sourceCommit":"5c9c93b","codexVersion":"0.167.0","license":"Apache-2.0","declaredBin":"bin/codex.js","stockExecutableSha256":"edfdd48f8b458af0906e507b4cb05217b326c3d6e515e9f024e05e3b8d650f70","currentConfigSchemaSha256":"66ed795352d32f2464778acd2e332b7fafe644246d540cdceec4663c56cfbc16","downloadedBytesVerification":"Producer manifest records exact payload checks; this assessment independently hashes retained Git receipt bytes."},"limits":["Host-only evidence cannot establish Android/runtime/sandbox/phone acceptance.","No root/descendant exit guarantee from Windows root stop.","Teardown codex_delivery_unknown notifications are not provider incompatibility.","Model narrative about sandbox rejection is superseded by actual decline and disabled-sandbox diagnostic."]}; codex-host-controlled-1794330423552-codex-turn (host/model pass): Preferred Responses provider produced completed turn; total attempt15602.0433ms, zero approval requests.; artifacts git:3f29bc0:spike/m2/codex/attempts/host-controlled-1794330423552.json SHA256 5bcd598e8d63662da65afbcfe262ae7000e285cfbd3f8e3022e1ef0fc154d544; metadata {"provider":{"allocationId":"manager-codex-host-second","model":"gpt-6.1-terra","topLevelPrompts":1,"inferenceResultsAtLeast":2,"observedHttpRequests":null,"requestRetries":0,"streamRetries":0,"deduplicatedLatestCumulativeUsage":{"totalTokens":44117,"inputTokens":43992,"cachedInputTokens":33620,"cacheWriteInputTokens":0,"outputTokens":125,"reasoningOutputTokens":0},"remoteBilling":"unknown","strictTokenCap":"unsupported in inspected schema"},"execution":{"platform":"win32","node":"v24.20.0","threadId":"01a1c66d-7362-7261-a805-3282ba514cf2","home":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794330423552-23240d45\\state\\codex\\case\\home","cwd":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794330423552-23240d45\\workspace","actualSandbox":"Windows unelevated, separately checked two-path command/exec boundary"},"provenance":{"sourceCommit":"3f29bc0","codexVersion":"0.167.0"},"limits":["Host-only; no Linux/Android/runtime inference.","Protocol turn completion is not successful Unix work.","Windows root process exit does not establish descendant exit.","Structured shell launch failure is not provider incompatibility."]}.

## codex.stream: untested
Expected: Stock codex: independently establish stream; preserve thread/transcript/workspace and original failures.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: codex.install, backend.shared.

Attempts: codex-host-primary-1794329763090-codex-stream (host/model pass): Captured56 agentMessage deltas and matching completed turn; first event13.056199999999997ms.; artifacts git:5c9c93b:spike/m2/codex/attempts/host-primary-1794329763090.json SHA256 335f71deb4ee71ca0f2217c527d1dc74face73d145b2d329f3b039cc9b6dc72e, git:5c9c93b:spike/m2/codex/attempts/host-primary-1794329763090-diagnostics.json SHA256 01fee514cbe039a16c3108d4268db3fe92a4ad3cb0d07056a81ffe357fa19db9, git:5c9c93b:spike/m2/codex/attempts/host-primary-1794329763090-thread.json SHA256 cacc9398b15e728fd2a55824453349df2374a39f534119d9e91751aae2d2de3f, git:5c9c93b:spike/m2/codex/upstream-manifest.json SHA256 bb0707463c3624a3015c345c882602601e18a5d4b9631c1da7a82ed3c9806b24, git:5c9c93b:spike/m2/codex/INTERIM.md SHA256 6643baddac1f13f5f67c533fd6856fac191670d856afa86ed920d8219fa5022c; metadata {"provider":{"accountingReference":"codex-host-primary-1794329763090-codex-turn"},"execution":{"platform":"win32","node":"v24.20.0","threadId":"01a1c663-5e3b-7b11-84ff-87131e300b56","cwd":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794329763090-49b37d75\\workspace","home":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794329763090-49b37d75\\state\\codex\\case\\home","windowsOsSandbox":"disabled in independently retained stock sandbox log; declared workspace-write policy alone was insufficient"},"provenance":{"sourceCommit":"5c9c93b","codexVersion":"0.167.0","license":"Apache-2.0","declaredBin":"bin/codex.js","stockExecutableSha256":"edfdd48f8b458af0906e507b4cb05217b326c3d6e515e9f024e05e3b8d650f70","currentConfigSchemaSha256":"66ed795352d32f2464778acd2e332b7fafe644246d540cdceec4663c56cfbc16","downloadedBytesVerification":"Producer manifest records exact payload checks; this assessment independently hashes retained Git receipt bytes."},"limits":["Host-only evidence cannot establish Android/runtime/sandbox/phone acceptance.","No root/descendant exit guarantee from Windows root stop.","Teardown codex_delivery_unknown notifications are not provider incompatibility.","Model narrative about sandbox rejection is superseded by actual decline and disabled-sandbox diagnostic."]}; codex-host-controlled-1794330423552-codex-stream (host/model pass): 41 deltas, actual turn completion; first event30.601899999999986ms.; artifacts git:3f29bc0:spike/m2/codex/attempts/host-controlled-1794330423552.json SHA256 5bcd598e8d63662da65afbcfe262ae7000e285cfbd3f8e3022e1ef0fc154d544; metadata {"provider":{"accountingReference":"codex-host-controlled-1794330423552-codex-turn"},"execution":{"platform":"win32","node":"v24.20.0","threadId":"01a1c66d-7362-7261-a805-3282ba514cf2","home":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794330423552-23240d45\\state\\codex\\case\\home","cwd":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794330423552-23240d45\\workspace","actualSandbox":"Windows unelevated, separately checked two-path command/exec boundary"},"provenance":{"sourceCommit":"3f29bc0","codexVersion":"0.167.0"},"limits":["Host-only; no Linux/Android/runtime inference.","Protocol turn completion is not successful Unix work.","Windows root process exit does not establish descendant exit.","Structured shell launch failure is not provider incompatibility."]}.

## codex.file: untested
Expected: Stock codex: independently establish file; preserve thread/transcript/workspace and original failures.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: codex.install, backend.shared.

Attempts: codex-host-primary-1794329763090-codex-file (host/model fail): Expected model Unix workflowfile did not complete after explicit command approval decline; expected result files absent. Actual Unix execution was not established.; artifacts git:5c9c93b:spike/m2/codex/attempts/host-primary-1794329763090.json SHA256 335f71deb4ee71ca0f2217c527d1dc74face73d145b2d329f3b039cc9b6dc72e, git:5c9c93b:spike/m2/codex/attempts/host-primary-1794329763090-diagnostics.json SHA256 01fee514cbe039a16c3108d4268db3fe92a4ad3cb0d07056a81ffe357fa19db9, git:5c9c93b:spike/m2/codex/attempts/host-primary-1794329763090-thread.json SHA256 cacc9398b15e728fd2a55824453349df2374a39f534119d9e91751aae2d2de3f, git:5c9c93b:spike/m2/codex/upstream-manifest.json SHA256 bb0707463c3624a3015c345c882602601e18a5d4b9631c1da7a82ed3c9806b24, git:5c9c93b:spike/m2/codex/INTERIM.md SHA256 6643baddac1f13f5f67c533fd6856fac191670d856afa86ed920d8219fa5022c; metadata {"failureClass":"independent_assertion","provider":{"accountingReference":"codex-host-primary-1794329763090-codex-turn"},"execution":{"platform":"win32","node":"v24.20.0","threadId":"01a1c663-5e3b-7b11-84ff-87131e300b56","cwd":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794329763090-49b37d75\\workspace","home":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794329763090-49b37d75\\state\\codex\\case\\home","windowsOsSandbox":"disabled in independently retained stock sandbox log; declared workspace-write policy alone was insufficient"},"provenance":{"sourceCommit":"5c9c93b","codexVersion":"0.167.0","license":"Apache-2.0","declaredBin":"bin/codex.js","stockExecutableSha256":"edfdd48f8b458af0906e507b4cb05217b326c3d6e515e9f024e05e3b8d650f70","currentConfigSchemaSha256":"66ed795352d32f2464778acd2e332b7fafe644246d540cdceec4663c56cfbc16","downloadedBytesVerification":"Producer manifest records exact payload checks; this assessment independently hashes retained Git receipt bytes."},"limits":["Host-only evidence cannot establish Android/runtime/sandbox/phone acceptance.","No root/descendant exit guarantee from Windows root stop.","Teardown codex_delivery_unknown notifications are not provider incompatibility.","Model narrative about sandbox rejection is superseded by actual decline and disabled-sandbox diagnostic."]}; codex-host-controlled-1794330423552-codex-file (host/model fail): Expected model result artifact missing after actual OS shell-launch failure; original overall Unix workflow stays failed.; artifacts git:3f29bc0:spike/m2/codex/attempts/host-controlled-1794330423552.json SHA256 5bcd598e8d63662da65afbcfe262ae7000e285cfbd3f8e3022e1ef0fc154d544; metadata {"failureClass":"independent_assertion","provider":{"accountingReference":"codex-host-controlled-1794330423552-codex-turn"},"execution":{"platform":"win32","node":"v24.20.0","threadId":"01a1c66d-7362-7261-a805-3282ba514cf2","home":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794330423552-23240d45\\state\\codex\\case\\home","cwd":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794330423552-23240d45\\workspace","actualSandbox":"Windows unelevated, separately checked two-path command/exec boundary"},"provenance":{"sourceCommit":"3f29bc0","codexVersion":"0.167.0"},"limits":["Host-only; no Linux/Android/runtime inference.","Protocol turn completion is not successful Unix work.","Windows root process exit does not establish descendant exit.","Structured shell launch failure is not provider incompatibility."]}.

## codex.shell: untested
Expected: Stock codex: independently establish shell; preserve thread/transcript/workspace and original failures.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: codex.install, backend.shared.

Attempts: codex-host-primary-1794329763090-codex-shell (host/model fail): Expected model Unix workflowshell did not complete after explicit command approval decline; expected result files absent. Actual Unix execution was not established.; artifacts git:5c9c93b:spike/m2/codex/attempts/host-primary-1794329763090.json SHA256 335f71deb4ee71ca0f2217c527d1dc74face73d145b2d329f3b039cc9b6dc72e, git:5c9c93b:spike/m2/codex/attempts/host-primary-1794329763090-diagnostics.json SHA256 01fee514cbe039a16c3108d4268db3fe92a4ad3cb0d07056a81ffe357fa19db9, git:5c9c93b:spike/m2/codex/attempts/host-primary-1794329763090-thread.json SHA256 cacc9398b15e728fd2a55824453349df2374a39f534119d9e91751aae2d2de3f, git:5c9c93b:spike/m2/codex/upstream-manifest.json SHA256 bb0707463c3624a3015c345c882602601e18a5d4b9631c1da7a82ed3c9806b24, git:5c9c93b:spike/m2/codex/INTERIM.md SHA256 6643baddac1f13f5f67c533fd6856fac191670d856afa86ed920d8219fa5022c; metadata {"failureClass":"independent_assertion","provider":{"accountingReference":"codex-host-primary-1794329763090-codex-turn"},"execution":{"platform":"win32","node":"v24.20.0","threadId":"01a1c663-5e3b-7b11-84ff-87131e300b56","cwd":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794329763090-49b37d75\\workspace","home":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794329763090-49b37d75\\state\\codex\\case\\home","windowsOsSandbox":"disabled in independently retained stock sandbox log; declared workspace-write policy alone was insufficient"},"provenance":{"sourceCommit":"5c9c93b","codexVersion":"0.167.0","license":"Apache-2.0","declaredBin":"bin/codex.js","stockExecutableSha256":"edfdd48f8b458af0906e507b4cb05217b326c3d6e515e9f024e05e3b8d650f70","currentConfigSchemaSha256":"66ed795352d32f2464778acd2e332b7fafe644246d540cdceec4663c56cfbc16","downloadedBytesVerification":"Producer manifest records exact payload checks; this assessment independently hashes retained Git receipt bytes."},"limits":["Host-only evidence cannot establish Android/runtime/sandbox/phone acceptance.","No root/descendant exit guarantee from Windows root stop.","Teardown codex_delivery_unknown notifications are not provider incompatibility.","Model narrative about sandbox rejection is superseded by actual decline and disabled-sandbox diagnostic."]}; codex-host-controlled-1794330423552-codex-shell (host/model fail): Actual commandExecution exit-1: WindowsApps PowerShell pwsh.exe failed CreateProcessAsUserW error5 Access denied before node task.cjs. Actual task/dependency/child did not execute.; artifacts git:3f29bc0:spike/m2/codex/attempts/host-controlled-1794330423552.json SHA256 5bcd598e8d63662da65afbcfe262ae7000e285cfbd3f8e3022e1ef0fc154d544; metadata {"failureClass":"runtime","provider":{"accountingReference":"codex-host-controlled-1794330423552-codex-turn"},"execution":{"platform":"win32","commandExecutionStatus":"failed","commandExecutionExitCode":-1,"toolReceiptSha256":"9a3ce42d393820721031cfe20bb5fa2bbf6cb15dc9d7546af0e8784bfb73ad6e","osFailure":"CreateProcessAsUserW error5 Access denied"},"provenance":{"sourceCommit":"3f29bc0","codexVersion":"0.167.0"},"limits":["Host-only; no Linux/Android/runtime inference.","Protocol turn completion is not successful Unix work.","Windows root process exit does not establish descendant exit.","Structured shell launch failure is not provider incompatibility."]}.

## codex.dependency: untested
Expected: Stock codex: independently establish dependency; preserve thread/transcript/workspace and original failures.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: codex.install, backend.shared.

Attempts: codex-host-primary-1794329763090-codex-dependency (host/model blocked): Not executed after explicit command approval decline; original whole Unix workflow remains failed, but no independent dependency assertion was reached.; artifacts git:5c9c93b:spike/m2/codex/attempts/host-primary-1794329763090.json SHA256 335f71deb4ee71ca0f2217c527d1dc74face73d145b2d329f3b039cc9b6dc72e, git:5c9c93b:spike/m2/codex/attempts/host-primary-1794329763090-diagnostics.json SHA256 01fee514cbe039a16c3108d4268db3fe92a4ad3cb0d07056a81ffe357fa19db9, git:5c9c93b:spike/m2/codex/attempts/host-primary-1794329763090-thread.json SHA256 cacc9398b15e728fd2a55824453349df2374a39f534119d9e91751aae2d2de3f, git:5c9c93b:spike/m2/codex/upstream-manifest.json SHA256 bb0707463c3624a3015c345c882602601e18a5d4b9631c1da7a82ed3c9806b24, git:5c9c93b:spike/m2/codex/INTERIM.md SHA256 6643baddac1f13f5f67c533fd6856fac191670d856afa86ed920d8219fa5022c; metadata {"failureClass":"prerequisite","provider":{"accountingReference":"codex-host-primary-1794329763090-codex-turn"},"execution":{"platform":"win32","node":"v24.20.0","threadId":"01a1c663-5e3b-7b11-84ff-87131e300b56","cwd":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794329763090-49b37d75\\workspace","home":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794329763090-49b37d75\\state\\codex\\case\\home","windowsOsSandbox":"disabled in independently retained stock sandbox log; declared workspace-write policy alone was insufficient"},"provenance":{"sourceCommit":"5c9c93b","codexVersion":"0.167.0","license":"Apache-2.0","declaredBin":"bin/codex.js","stockExecutableSha256":"edfdd48f8b458af0906e507b4cb05217b326c3d6e515e9f024e05e3b8d650f70","currentConfigSchemaSha256":"66ed795352d32f2464778acd2e332b7fafe644246d540cdceec4663c56cfbc16","downloadedBytesVerification":"Producer manifest records exact payload checks; this assessment independently hashes retained Git receipt bytes."},"limits":["Host-only evidence cannot establish Android/runtime/sandbox/phone acceptance.","No root/descendant exit guarantee from Windows root stop.","Teardown codex_delivery_unknown notifications are not provider incompatibility.","Model narrative about sandbox rejection is superseded by actual decline and disabled-sandbox diagnostic."]}; codex-host-controlled-1794330423552-codex-dependency (host/model blocked): Not executed because stock Windows shell failed to launch; no independent dependency assertion reached.; artifacts git:3f29bc0:spike/m2/codex/attempts/host-controlled-1794330423552.json SHA256 5bcd598e8d63662da65afbcfe262ae7000e285cfbd3f8e3022e1ef0fc154d544; metadata {"failureClass":"prerequisite","provider":{"accountingReference":"codex-host-controlled-1794330423552-codex-turn"},"execution":{"platform":"win32","node":"v24.20.0","threadId":"01a1c66d-7362-7261-a805-3282ba514cf2","home":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794330423552-23240d45\\state\\codex\\case\\home","cwd":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794330423552-23240d45\\workspace","actualSandbox":"Windows unelevated, separately checked two-path command/exec boundary"},"provenance":{"sourceCommit":"3f29bc0","codexVersion":"0.167.0"},"limits":["Host-only; no Linux/Android/runtime inference.","Protocol turn completion is not successful Unix work.","Windows root process exit does not establish descendant exit.","Structured shell launch failure is not provider incompatibility."]}.

## codex.child: untested
Expected: Stock codex: independently establish child; preserve thread/transcript/workspace and original failures.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: codex.install, backend.shared.

Attempts: codex-host-primary-1794329763090-codex-child (host/model blocked): Not executed after explicit command approval decline; original whole Unix workflow remains failed, but no independent child assertion was reached.; artifacts git:5c9c93b:spike/m2/codex/attempts/host-primary-1794329763090.json SHA256 335f71deb4ee71ca0f2217c527d1dc74face73d145b2d329f3b039cc9b6dc72e, git:5c9c93b:spike/m2/codex/attempts/host-primary-1794329763090-diagnostics.json SHA256 01fee514cbe039a16c3108d4268db3fe92a4ad3cb0d07056a81ffe357fa19db9, git:5c9c93b:spike/m2/codex/attempts/host-primary-1794329763090-thread.json SHA256 cacc9398b15e728fd2a55824453349df2374a39f534119d9e91751aae2d2de3f, git:5c9c93b:spike/m2/codex/upstream-manifest.json SHA256 bb0707463c3624a3015c345c882602601e18a5d4b9631c1da7a82ed3c9806b24, git:5c9c93b:spike/m2/codex/INTERIM.md SHA256 6643baddac1f13f5f67c533fd6856fac191670d856afa86ed920d8219fa5022c; metadata {"failureClass":"prerequisite","provider":{"accountingReference":"codex-host-primary-1794329763090-codex-turn"},"execution":{"platform":"win32","node":"v24.20.0","threadId":"01a1c663-5e3b-7b11-84ff-87131e300b56","cwd":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794329763090-49b37d75\\workspace","home":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794329763090-49b37d75\\state\\codex\\case\\home","windowsOsSandbox":"disabled in independently retained stock sandbox log; declared workspace-write policy alone was insufficient"},"provenance":{"sourceCommit":"5c9c93b","codexVersion":"0.167.0","license":"Apache-2.0","declaredBin":"bin/codex.js","stockExecutableSha256":"edfdd48f8b458af0906e507b4cb05217b326c3d6e515e9f024e05e3b8d650f70","currentConfigSchemaSha256":"66ed795352d32f2464778acd2e332b7fafe644246d540cdceec4663c56cfbc16","downloadedBytesVerification":"Producer manifest records exact payload checks; this assessment independently hashes retained Git receipt bytes."},"limits":["Host-only evidence cannot establish Android/runtime/sandbox/phone acceptance.","No root/descendant exit guarantee from Windows root stop.","Teardown codex_delivery_unknown notifications are not provider incompatibility.","Model narrative about sandbox rejection is superseded by actual decline and disabled-sandbox diagnostic."]}; codex-host-controlled-1794330423552-codex-child (host/model blocked): Not executed because stock Windows shell failed to launch; no independent child assertion reached.; artifacts git:3f29bc0:spike/m2/codex/attempts/host-controlled-1794330423552.json SHA256 5bcd598e8d63662da65afbcfe262ae7000e285cfbd3f8e3022e1ef0fc154d544; metadata {"failureClass":"prerequisite","provider":{"accountingReference":"codex-host-controlled-1794330423552-codex-turn"},"execution":{"platform":"win32","node":"v24.20.0","threadId":"01a1c66d-7362-7261-a805-3282ba514cf2","home":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794330423552-23240d45\\state\\codex\\case\\home","cwd":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794330423552-23240d45\\workspace","actualSandbox":"Windows unelevated, separately checked two-path command/exec boundary"},"provenance":{"sourceCommit":"3f29bc0","codexVersion":"0.167.0"},"limits":["Host-only; no Linux/Android/runtime inference.","Protocol turn completion is not successful Unix work.","Windows root process exit does not establish descendant exit.","Structured shell launch failure is not provider incompatibility."]}.

## codex.nested-child: untested
Expected: Stock codex: independently establish nested-child; preserve thread/transcript/workspace and original failures.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: codex.install, backend.shared.

Attempts: codex-host-controlled-1794330423552-codex-nested-child (host/model blocked): Not executed because stock Windows shell failed to launch; no independent nested-child assertion reached.; artifacts git:3f29bc0:spike/m2/codex/attempts/host-controlled-1794330423552.json SHA256 5bcd598e8d63662da65afbcfe262ae7000e285cfbd3f8e3022e1ef0fc154d544; metadata {"failureClass":"prerequisite","provider":{"accountingReference":"codex-host-controlled-1794330423552-codex-turn"},"execution":{"platform":"win32","node":"v24.20.0","threadId":"01a1c66d-7362-7261-a805-3282ba514cf2","home":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794330423552-23240d45\\state\\codex\\case\\home","cwd":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794330423552-23240d45\\workspace","actualSandbox":"Windows unelevated, separately checked two-path command/exec boundary"},"provenance":{"sourceCommit":"3f29bc0","codexVersion":"0.167.0"},"limits":["Host-only; no Linux/Android/runtime inference.","Protocol turn completion is not successful Unix work.","Windows root process exit does not establish descendant exit.","Structured shell launch failure is not provider incompatibility."]}.

## codex.resume: untested
Expected: Stock codex: independently establish resume; preserve thread/transcript/workspace and original failures.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: codex.install, backend.shared.

Attempts: codex-host-primary-1794329763090-codex-resume (host/model pass): Explicit restart resumed exact proved thread01a1c663-5e3b-7b11-84ff-87131e300b56 with unchanged canonical home/workspace, startup287.17159999999967ms and no new prompt.; artifacts git:5c9c93b:spike/m2/codex/attempts/host-primary-1794329763090.json SHA256 335f71deb4ee71ca0f2217c527d1dc74face73d145b2d329f3b039cc9b6dc72e, git:5c9c93b:spike/m2/codex/attempts/host-primary-1794329763090-diagnostics.json SHA256 01fee514cbe039a16c3108d4268db3fe92a4ad3cb0d07056a81ffe357fa19db9, git:5c9c93b:spike/m2/codex/attempts/host-primary-1794329763090-thread.json SHA256 cacc9398b15e728fd2a55824453349df2374a39f534119d9e91751aae2d2de3f, git:5c9c93b:spike/m2/codex/upstream-manifest.json SHA256 bb0707463c3624a3015c345c882602601e18a5d4b9631c1da7a82ed3c9806b24, git:5c9c93b:spike/m2/codex/INTERIM.md SHA256 6643baddac1f13f5f67c533fd6856fac191670d856afa86ed920d8219fa5022c; metadata {"provider":{"accountingReference":"codex-host-primary-1794329763090-codex-turn"},"execution":{"platform":"win32","node":"v24.20.0","threadId":"01a1c663-5e3b-7b11-84ff-87131e300b56","cwd":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794329763090-49b37d75\\workspace","home":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794329763090-49b37d75\\state\\codex\\case\\home","windowsOsSandbox":"disabled in independently retained stock sandbox log; declared workspace-write policy alone was insufficient"},"provenance":{"sourceCommit":"5c9c93b","codexVersion":"0.167.0","license":"Apache-2.0","declaredBin":"bin/codex.js","stockExecutableSha256":"edfdd48f8b458af0906e507b4cb05217b326c3d6e515e9f024e05e3b8d650f70","currentConfigSchemaSha256":"66ed795352d32f2464778acd2e332b7fafe644246d540cdceec4663c56cfbc16","downloadedBytesVerification":"Producer manifest records exact payload checks; this assessment independently hashes retained Git receipt bytes."},"limits":["Host-only evidence cannot establish Android/runtime/sandbox/phone acceptance.","No root/descendant exit guarantee from Windows root stop.","Teardown codex_delivery_unknown notifications are not provider incompatibility.","Model narrative about sandbox rejection is superseded by actual decline and disabled-sandbox diagnostic."]}; codex-host-controlled-1794330423552-codex-resume (host/model pass): New process resumed same proved thread/home/cwd; resume startup315.6374999999989ms, no additional prompt.; artifacts git:3f29bc0:spike/m2/codex/attempts/host-controlled-1794330423552.json SHA256 5bcd598e8d63662da65afbcfe262ae7000e285cfbd3f8e3022e1ef0fc154d544; metadata {"provider":{"accountingReference":"codex-host-controlled-1794330423552-codex-turn"},"execution":{"platform":"win32","node":"v24.20.0","threadId":"01a1c66d-7362-7261-a805-3282ba514cf2","home":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794330423552-23240d45\\state\\codex\\case\\home","cwd":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794330423552-23240d45\\workspace","actualSandbox":"Windows unelevated, separately checked two-path command/exec boundary"},"provenance":{"sourceCommit":"3f29bc0","codexVersion":"0.167.0"},"limits":["Host-only; no Linux/Android/runtime inference.","Protocol turn completion is not successful Unix work.","Windows root process exit does not establish descendant exit.","Structured shell launch failure is not provider incompatibility."]}.

## codex.cancel: untested
Expected: Stock codex: independently establish cancel; preserve thread/transcript/workspace and original failures.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: codex.install, backend.shared.

Attempts: none.

## codex.error: untested
Expected: Stock codex: independently establish error; preserve thread/transcript/workspace and original failures.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: codex.install, backend.shared.

Attempts: none.

## codex.update: untested
Expected: Stock codex: independently establish update; preserve thread/transcript/workspace and original failures.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: codex.install, backend.shared.

Attempts: none.

## codex.sandbox: untested
Expected: Prove supported Codex sandbox without sandbox/approval bypass.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: codex.initialize.

Attempts: codex-host-primary-1794329763090-codex-sandbox (host/direct fail): Initial authenticated host attempt actual Windows OS sandbox was disabled despite workspace-write policy. It cannot pass sandbox execution acceptance.; artifacts git:5c9c93b:spike/m2/codex/attempts/host-primary-1794329763090.json SHA256 335f71deb4ee71ca0f2217c527d1dc74face73d145b2d329f3b039cc9b6dc72e, git:5c9c93b:spike/m2/codex/attempts/host-primary-1794329763090-diagnostics.json SHA256 01fee514cbe039a16c3108d4268db3fe92a4ad3cb0d07056a81ffe357fa19db9, git:5c9c93b:spike/m2/codex/attempts/host-primary-1794329763090-thread.json SHA256 cacc9398b15e728fd2a55824453349df2374a39f534119d9e91751aae2d2de3f, git:5c9c93b:spike/m2/codex/upstream-manifest.json SHA256 bb0707463c3624a3015c345c882602601e18a5d4b9631c1da7a82ed3c9806b24, git:5c9c93b:spike/m2/codex/INTERIM.md SHA256 6643baddac1f13f5f67c533fd6856fac191670d856afa86ed920d8219fa5022c; metadata {"failureClass":"runtime","provider":{"accountingReference":"codex-host-primary-1794329763090-codex-turn"},"execution":{"platform":"win32","node":"v24.20.0","threadId":"01a1c663-5e3b-7b11-84ff-87131e300b56","cwd":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794329763090-49b37d75\\workspace","home":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794329763090-49b37d75\\state\\codex\\case\\home","windowsOsSandbox":"disabled in independently retained stock sandbox log; declared workspace-write policy alone was insufficient"},"provenance":{"sourceCommit":"5c9c93b","codexVersion":"0.167.0","license":"Apache-2.0","declaredBin":"bin/codex.js","stockExecutableSha256":"edfdd48f8b458af0906e507b4cb05217b326c3d6e515e9f024e05e3b8d650f70","currentConfigSchemaSha256":"66ed795352d32f2464778acd2e332b7fafe644246d540cdceec4663c56cfbc16","downloadedBytesVerification":"Producer manifest records exact payload checks; this assessment independently hashes retained Git receipt bytes."},"limits":["Host-only evidence cannot establish Android/runtime/sandbox/phone acceptance.","No root/descendant exit guarantee from Windows root stop.","Teardown codex_delivery_unknown notifications are not provider incompatibility.","Model narrative about sandbox rejection is superseded by actual decline and disabled-sandbox diagnostic."]}; codex-host-sandbox-preflight-1 (host/direct blocked): No-model unelevated sandbox preflight1 blocked by RPC -32600; attempt2 diagnoses custom outputBytesCap unsupported on Windows. Original attempt1 lacks captured error-message detail.; artifacts git:5c9c93b:spike/m2/codex/attempts/host-sandbox-attempt1.json SHA256 e6059cdda281d178bc62dac11978d9a7e082a90fc6fea2202fd2848e8b312952; metadata {"failureClass":"prerequisite","retryOf":"codex-host-primary-1794329763090-codex-sandbox","provider":{"topLevelPrompts":0,"modelRequests":0,"httpRequests":null},"execution":{"platform":"win32","requestedSandbox":"unelevated","stockSandboxLog":"unelevated","timestampLimit":"These receipt timestamps record assessment time. Original preflight has no explicit UTC timestamp; local log text remains in immutable source."},"limits":["No-model command/exec preflight is not an authenticated model sandbox workflow.","Outside denial is expected evidence, not provider failure.","Independent inside-file equality and outside-file absence were not reached in original preflight3 runner."]}; codex-host-sandbox-preflight-2 (host/direct blocked): No-model unelevated sandbox preflight2 blocked by RPC -32600; attempt2 diagnoses custom outputBytesCap unsupported on Windows. Original attempt1 lacks captured error-message detail.; artifacts git:5c9c93b:spike/m2/codex/attempts/host-sandbox-attempt2.json SHA256 9470b52c31ca967df279aeda4dd25efc2f38fb516bf23fe90c1f20d19bab1c8d; metadata {"failureClass":"prerequisite","retryOf":"codex-host-sandbox-preflight-1","provider":{"topLevelPrompts":0,"modelRequests":0,"httpRequests":null},"execution":{"platform":"win32","requestedSandbox":"unelevated","stockSandboxLog":"unelevated","timestampLimit":"These receipt timestamps record assessment time. Original preflight has no explicit UTC timestamp; local log text remains in immutable source."},"limits":["No-model command/exec preflight is not an authenticated model sandbox workflow.","Outside denial is expected evidence, not provider failure.","Independent inside-file equality and outside-file absence were not reached in original preflight3 runner."]}; codex-host-sandbox-preflight-3 (host/direct blocked): No-model unelevated preflight3 inside command exit0/INSIDE_OK; designated sibling write denied EPERM/RPC -32603. Original runner marked blocked before independent file assertions; do not promote full sandbox boundary pass.; artifacts git:5c9c93b:spike/m2/codex/attempts/host-sandbox-attempt3.json SHA256 ba704a312ef9fff19ef03b70dcee69b351feaecfc47aa4b28aff6221e0008d14; metadata {"failureClass":"prerequisite","retryOf":"codex-host-sandbox-preflight-2","provider":{"topLevelPrompts":0,"modelRequests":0,"httpRequests":null},"execution":{"platform":"win32","requestedSandbox":"unelevated","stockSandboxLog":"unelevated","timestampLimit":"These receipt timestamps record assessment time. Original preflight has no explicit UTC timestamp; local log text remains in immutable source."},"limits":["No-model command/exec preflight is not an authenticated model sandbox workflow.","Outside denial is expected evidence, not provider failure.","Independent inside-file equality and outside-file absence were not reached in original preflight3 runner."]}; codex-host-sandbox-preflight-3-independent-assessment (host/direct pass): Separate no-model assessment confirms INSIDE_OK file hash and outside sibling absence after expected stock EPERM denial in unelevated Windows sandbox; original preflight3 blocked receipt remains unchanged.; artifacts git:3f29bc0:spike/m2/codex/attempts/host-sandbox-attempt3-assessment.json SHA256 3539491191030a8a49d4dff4cd9420b7b4c8efbb048171eba24595bf246116e8, git:3f29bc0:spike/m2/codex/attempts/host-sandbox-attempt3.json SHA256 ba704a312ef9fff19ef03b70dcee69b351feaecfc47aa4b28aff6221e0008d14; metadata {"provider":{"topLevelPrompts":0,"modelRequests":0,"observedHttpRequests":null},"execution":{"platform":"win32","timestampBasis":"Assessment generation time; source has no explicit UTC observation timestamp.","insideSha256":"4b2036f379628f919fc35527f543c179b0f06241549101042bd7975d7e527e0b","outsideIndependentObservation":"absent","sandbox":"unelevated"},"limits":["Windows only","Two disposable task-local paths","Not a complete sandbox security audit","Not Android or Linux evidence"]}.

## codex.approval: untested
Expected: Prove supported Codex approval without sandbox/approval bypass.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: codex.initialize.

Attempts: none.

## codex.rejection: untested
Expected: Prove supported Codex rejection without sandbox/approval bypass.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: codex.initialize.

Attempts: codex-host-primary-1794329763090-codex-rejection (host/direct untested): Explicit command approval decline and rejected-by-user tool result retained; full independently verified no-effect rejection boundary remains incomplete.; artifacts git:5c9c93b:spike/m2/codex/attempts/host-primary-1794329763090.json SHA256 335f71deb4ee71ca0f2217c527d1dc74face73d145b2d329f3b039cc9b6dc72e, git:5c9c93b:spike/m2/codex/attempts/host-primary-1794329763090-diagnostics.json SHA256 01fee514cbe039a16c3108d4268db3fe92a4ad3cb0d07056a81ffe357fa19db9, git:5c9c93b:spike/m2/codex/attempts/host-primary-1794329763090-thread.json SHA256 cacc9398b15e728fd2a55824453349df2374a39f534119d9e91751aae2d2de3f, git:5c9c93b:spike/m2/codex/upstream-manifest.json SHA256 bb0707463c3624a3015c345c882602601e18a5d4b9631c1da7a82ed3c9806b24, git:5c9c93b:spike/m2/codex/INTERIM.md SHA256 6643baddac1f13f5f67c533fd6856fac191670d856afa86ed920d8219fa5022c; metadata {"provider":{"accountingReference":"codex-host-primary-1794329763090-codex-turn"},"execution":{"platform":"win32","node":"v24.20.0","threadId":"01a1c663-5e3b-7b11-84ff-87131e300b56","cwd":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794329763090-49b37d75\\workspace","home":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794329763090-49b37d75\\state\\codex\\case\\home","windowsOsSandbox":"disabled in independently retained stock sandbox log; declared workspace-write policy alone was insufficient"},"provenance":{"sourceCommit":"5c9c93b","codexVersion":"0.167.0","license":"Apache-2.0","declaredBin":"bin/codex.js","stockExecutableSha256":"edfdd48f8b458af0906e507b4cb05217b326c3d6e515e9f024e05e3b8d650f70","currentConfigSchemaSha256":"66ed795352d32f2464778acd2e332b7fafe644246d540cdceec4663c56cfbc16","downloadedBytesVerification":"Producer manifest records exact payload checks; this assessment independently hashes retained Git receipt bytes."},"limits":["Host-only evidence cannot establish Android/runtime/sandbox/phone acceptance.","No root/descendant exit guarantee from Windows root stop.","Teardown codex_delivery_unknown notifications are not provider incompatibility.","Model narrative about sandbox rejection is superseded by actual decline and disabled-sandbox diagnostic."]}.

## codex.initialized-notification: untested
Expected: Prove supported Codex initialized-notification without sandbox/approval bypass.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: codex.initialize.

Attempts: none.

## codex.thread-identity: untested
Expected: Prove supported Codex thread-identity without sandbox/approval bypass.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: codex.initialize.

Attempts: codex-host-primary-1794329763090-codex-thread-identity (host/direct pass): Proved created/resumed exact thread ID with same canonical workspace and account home; no accidental fork.; artifacts git:5c9c93b:spike/m2/codex/attempts/host-primary-1794329763090.json SHA256 335f71deb4ee71ca0f2217c527d1dc74face73d145b2d329f3b039cc9b6dc72e, git:5c9c93b:spike/m2/codex/attempts/host-primary-1794329763090-diagnostics.json SHA256 01fee514cbe039a16c3108d4268db3fe92a4ad3cb0d07056a81ffe357fa19db9, git:5c9c93b:spike/m2/codex/attempts/host-primary-1794329763090-thread.json SHA256 cacc9398b15e728fd2a55824453349df2374a39f534119d9e91751aae2d2de3f, git:5c9c93b:spike/m2/codex/upstream-manifest.json SHA256 bb0707463c3624a3015c345c882602601e18a5d4b9631c1da7a82ed3c9806b24, git:5c9c93b:spike/m2/codex/INTERIM.md SHA256 6643baddac1f13f5f67c533fd6856fac191670d856afa86ed920d8219fa5022c; metadata {"provider":{"accountingReference":"codex-host-primary-1794329763090-codex-turn"},"execution":{"platform":"win32","node":"v24.20.0","threadId":"01a1c663-5e3b-7b11-84ff-87131e300b56","cwd":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794329763090-49b37d75\\workspace","home":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794329763090-49b37d75\\state\\codex\\case\\home","windowsOsSandbox":"disabled in independently retained stock sandbox log; declared workspace-write policy alone was insufficient"},"provenance":{"sourceCommit":"5c9c93b","codexVersion":"0.167.0","license":"Apache-2.0","declaredBin":"bin/codex.js","stockExecutableSha256":"edfdd48f8b458af0906e507b4cb05217b326c3d6e515e9f024e05e3b8d650f70","currentConfigSchemaSha256":"66ed795352d32f2464778acd2e332b7fafe644246d540cdceec4663c56cfbc16","downloadedBytesVerification":"Producer manifest records exact payload checks; this assessment independently hashes retained Git receipt bytes."},"limits":["Host-only evidence cannot establish Android/runtime/sandbox/phone acceptance.","No root/descendant exit guarantee from Windows root stop.","Teardown codex_delivery_unknown notifications are not provider incompatibility.","Model narrative about sandbox rejection is superseded by actual decline and disabled-sandbox diagnostic."]}; codex-host-controlled-1794330423552-codex-thread-identity (host/direct pass): Created and resumed exact proved thread01a1c66d-7362-7261-a805-3282ba514cf2 with same canonical cwd/home.; artifacts git:3f29bc0:spike/m2/codex/attempts/host-controlled-1794330423552.json SHA256 5bcd598e8d63662da65afbcfe262ae7000e285cfbd3f8e3022e1ef0fc154d544; metadata {"provider":{"accountingReference":"codex-host-controlled-1794330423552-codex-turn"},"execution":{"platform":"win32","node":"v24.20.0","threadId":"01a1c66d-7362-7261-a805-3282ba514cf2","home":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794330423552-23240d45\\state\\codex\\case\\home","cwd":"C:\\Users\\Aria\\orca\\workspaces\\Olea\\m2-stock-codex\\.setup\\attempt-1794330423552-23240d45\\workspace","actualSandbox":"Windows unelevated, separately checked two-path command/exec boundary"},"provenance":{"sourceCommit":"3f29bc0","codexVersion":"0.167.0"},"limits":["Host-only; no Linux/Android/runtime inference.","Protocol turn completion is not successful Unix work.","Windows root process exit does not establish descendant exit.","Structured shell launch failure is not provider incompatibility."]}.

## codex.tool-registration: untested
Expected: Prove supported Codex tool-registration without sandbox/approval bypass.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: codex.initialize.

Attempts: none.

## phone.direct.accessibility-launch: untested
Expected: Independently verify accessibility-launch; dispatch/model claim alone insufficient.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: runtime.modern.

Attempts: none.

## phone.pi.accessibility-launch: untested
Expected: pi selects registered tools and independently completes accessibility-launch.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: phone.direct.accessibility-launch, pi.turn.

Attempts: none.

## phone.codex.accessibility-launch: untested
Expected: codex selects registered tools and independently completes accessibility-launch.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: phone.direct.accessibility-launch, codex.turn.

Attempts: none.

## phone.direct.intent-url: untested
Expected: Independently verify intent-url; dispatch/model claim alone insufficient.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: runtime.modern.

Attempts: none.

## phone.pi.intent-url: untested
Expected: pi selects registered tools and independently completes intent-url.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: phone.direct.intent-url, pi.turn.

Attempts: none.

## phone.codex.intent-url: untested
Expected: codex selects registered tools and independently completes intent-url.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: phone.direct.intent-url, codex.turn.

Attempts: none.

## phone.direct.structured-api: untested
Expected: Independently verify structured-api; dispatch/model claim alone insufficient.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: runtime.modern.

Attempts: none.

## phone.pi.structured-api: untested
Expected: pi selects registered tools and independently completes structured-api.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: phone.direct.structured-api, pi.turn.

Attempts: none.

## phone.codex.structured-api: untested
Expected: codex selects registered tools and independently completes structured-api.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: phone.direct.structured-api, codex.turn.

Attempts: none.

## phone.direct.files-media: untested
Expected: Independently verify files-media; dispatch/model claim alone insufficient.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: runtime.modern.

Attempts: none.

## phone.pi.files-media: untested
Expected: pi selects registered tools and independently completes files-media.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: phone.direct.files-media, pi.turn.

Attempts: none.

## phone.codex.files-media: untested
Expected: codex selects registered tools and independently completes files-media.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: phone.direct.files-media, codex.turn.

Attempts: none.

## phone.direct.notification: untested
Expected: Independently verify notification; dispatch/model claim alone insufficient.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: runtime.modern.

Attempts: none.

## phone.pi.notification: untested
Expected: pi selects registered tools and independently completes notification.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: phone.direct.notification, pi.turn.

Attempts: none.

## phone.codex.notification: untested
Expected: codex selects registered tools and independently completes notification.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: phone.direct.notification, codex.turn.

Attempts: none.

## phone.direct.capture: untested
Expected: Independently verify capture; dispatch/model claim alone insufficient.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: runtime.modern.

Attempts: none.

## phone.pi.capture: untested
Expected: pi selects registered tools and independently completes capture.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: phone.direct.capture, pi.turn.

Attempts: none.

## phone.codex.capture: untested
Expected: codex selects registered tools and independently completes capture.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: phone.direct.capture, codex.turn.

Attempts: none.

## phone.direct.app-integration: untested
Expected: Independently verify app-integration; dispatch/model claim alone insufficient.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: runtime.modern.

Attempts: none.

## phone.pi.app-integration: untested
Expected: pi selects registered tools and independently completes app-integration.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: phone.direct.app-integration, pi.turn.

Attempts: none.

## phone.codex.app-integration: untested
Expected: codex selects registered tools and independently completes app-integration.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: phone.direct.app-integration, codex.turn.

Attempts: none.

## phone.oracle: untested
Expected: Separate real Android UID oracle is inaccessible through ALL agent tools/shared workspace.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: none.

Attempts: none.

## phone.pi.combined: untested
Expected: Unix random value equals separate-UID private fixture receipt; causal launcher ACTION_CLICK precedes foreground and fixture integration.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: phone.pi.accessibility-launch, phone.oracle.

Attempts: none.

## phone.codex.combined: untested
Expected: Unix random value equals separate-UID private fixture receipt; causal launcher ACTION_CLICK precedes foreground and fixture integration.

Actual: No retained matching execution receipt.

Context: android-app; mode: model; prerequisites: phone.codex.accessibility-launch, phone.oracle.

Attempts: none.

## phone.permission-denied: untested
Expected: Native permission-denied boundary independently observed with no unauthorized effect.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: runtime.modern.

Attempts: none.

## phone.revocation: untested
Expected: Native revocation boundary independently observed with no unauthorized effect.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: runtime.modern.

Attempts: none.

## phone.stop: untested
Expected: Native stop boundary independently observed with no unauthorized effect.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: runtime.modern.

Attempts: none.

## phone.cancel: untested
Expected: Native cancel boundary independently observed with no unauthorized effect.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: runtime.modern.

Attempts: none.

## phone.no-replay: untested
Expected: Native no-replay boundary independently observed with no unauthorized effect.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: runtime.modern.

Attempts: none.

## preserve.agent-update: blocked
Expected: Record before/after hashes and durable identity for agent-update; no reset/uninstall to claim preservation.

Actual: Prerequisite failed/blocked: runtime.fresh

Context: android-app; mode: direct; prerequisites: runtime.fresh.

Attempts: none.

## preserve.runtime-update: blocked
Expected: Record before/after hashes and durable identity for runtime-update; no reset/uninstall to claim preservation.

Actual: Prerequisite failed/blocked: runtime.fresh

Context: android-app; mode: direct; prerequisites: runtime.fresh.

Attempts: none.

## preserve.failed-update: blocked
Expected: Record before/after hashes and durable identity for failed-update; no reset/uninstall to claim preservation.

Actual: Prerequisite failed/blocked: runtime.fresh

Context: android-app; mode: direct; prerequisites: runtime.fresh.

Attempts: none.

## preserve.interrupted-update: blocked
Expected: Record before/after hashes and durable identity for interrupted-update; no reset/uninstall to claim preservation.

Actual: Prerequisite failed/blocked: runtime.fresh

Context: android-app; mode: direct; prerequisites: runtime.fresh.

Attempts: none.

## preserve.recovery-hashes: blocked
Expected: Record before/after hashes and durable identity for recovery-hashes; no reset/uninstall to claim preservation.

Actual: Prerequisite failed/blocked: runtime.fresh

Context: android-app; mode: direct; prerequisites: runtime.fresh.

Attempts: none.

## preserve.credential-preservation: blocked
Expected: Record before/after hashes and durable identity for credential-preservation; no reset/uninstall to claim preservation.

Actual: Prerequisite failed/blocked: runtime.fresh

Context: android-app; mode: direct; prerequisites: runtime.fresh.

Attempts: none.

## lifecycle.child-death: untested
Expected: Distinguish live execution from saved/restored state after child-death; verify native stop/permissions and descendants.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: runtime.modern.

Attempts: none.

## lifecycle.backend-death: untested
Expected: Distinguish live execution from saved/restored state after backend-death; verify native stop/permissions and descendants.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: runtime.modern.

Attempts: none.

## lifecycle.whole-app-death: untested
Expected: Distinguish live execution from saved/restored state after whole-app-death; verify native stop/permissions and descendants.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: runtime.modern.

Attempts: none.

## lifecycle.app-switch: untested
Expected: Distinguish live execution from saved/restored state after app-switch; verify native stop/permissions and descendants.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: runtime.modern.

Attempts: none.

## lifecycle.lock: untested
Expected: Distinguish live execution from saved/restored state after lock; verify native stop/permissions and descendants.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: runtime.modern.

Attempts: none.

## lifecycle.reboot: untested
Expected: Distinguish live execution from saved/restored state after reboot; verify native stop/permissions and descendants.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: runtime.modern.

Attempts: none.

## native.output-bytes: pass
Expected: Independently assert native output-bytes bounds; do not infer shared-backend buffering or generic descendant cleanup.

Actual: Actual multibyte flood stdout90000/stderr80107 bytes retained65536 bytes per stream, outputTruncated true; no live drainers. This is native byte capture, not backend protocol-frame/queue acceptance.

Context: android-app; mode: direct; prerequisites: runtime.modern.

Attempts: runtime-harness-a01-output-bytes (android-app/direct pass): Actual multibyte flood stdout90000/stderr80107 bytes retained65536 bytes per stream, outputTruncated true; no live drainers. This is native byte capture, not backend protocol-frame/queue acceptance.; artifacts git:b1b8a74:spike/m2/runtime/evidence/harness-assertions.json SHA256 e19547eded6483e1565963994e16cd843098f62241f266d163cba564d0a3f4f1, git:b1b8a74:spike/m2/runtime/assess-harness.mjs SHA256 13289ce28cc8cbc5eed2ad7edfb3c6f29cfe908b30de5b44fff24930ac82f3a9, git:b1b8a74:spike/m2/runtime/evidence/timeout-check-a01.json SHA256 0ee4d794aad6569cad0270516c26d8500221d4c2946b6beea7c86ddc82ba8c6f, git:b1b8a74:spike/m2/runtime/evidence/utf8-drain-a01.json SHA256 de89342cd93a1322ccb967aba806e02a0f79ea937bdbbee43abdcd7ec6c7851c, git:b1b8a74:spike/m2/runtime/evidence/inherited-pipe-a01.json SHA256 8105018ee8baf705e6a7294ab634ff42051633fdf4c3bb7f79f3598852fc16c1; metadata {"execution":{"package":"dev.olea.m2.runtime","targetSdk":36,"compileSdk":36,"minSdk":26,"androidApi":36,"measuredNodeArch":"x64","advertisedAbis":"x86_64,arm64-v8a","actualDomain":"u:r:untrusted_app:s0:c216,c256,c512,c768","realUid":10216,"hostPid":6197,"nodePid":6333,"nodePpid":6330,"nodeProcExe":"/opt/node/bin/node","loaderEnvAbsent":true,"apkSha256":"dbd494c8f9c533b20a5ed0a067dbb2496a34c2494911a9fc9cb4fb19f6435887"},"limits":["Native harness fixtures only; shared backend buffering remains untested.","Raw drain InterruptedIOException recorded but caught; original old-APK crash remains separate.","No model/provider calls; no generic descendant exit claim."]}.

## native.timeout: pass
Expected: Independently assert native timeout bounds; do not infer shared-backend buffering or generic descendant cleanup.

Actual: 5s native timeout caught with same host6197 surviving; rootExitObserved true. Root-only signaling and separate fixture observation do not establish general descendant cleanup.

Context: android-app; mode: direct; prerequisites: runtime.modern.

Attempts: runtime-harness-a01-timeout (android-app/direct pass): 5s native timeout caught with same host6197 surviving; rootExitObserved true. Root-only signaling and separate fixture observation do not establish general descendant cleanup.; artifacts git:b1b8a74:spike/m2/runtime/evidence/harness-assertions.json SHA256 e19547eded6483e1565963994e16cd843098f62241f266d163cba564d0a3f4f1, git:b1b8a74:spike/m2/runtime/assess-harness.mjs SHA256 13289ce28cc8cbc5eed2ad7edfb3c6f29cfe908b30de5b44fff24930ac82f3a9, git:b1b8a74:spike/m2/runtime/evidence/timeout-check-a01.json SHA256 0ee4d794aad6569cad0270516c26d8500221d4c2946b6beea7c86ddc82ba8c6f, git:b1b8a74:spike/m2/runtime/evidence/utf8-drain-a01.json SHA256 de89342cd93a1322ccb967aba806e02a0f79ea937bdbbee43abdcd7ec6c7851c, git:b1b8a74:spike/m2/runtime/evidence/inherited-pipe-a01.json SHA256 8105018ee8baf705e6a7294ab634ff42051633fdf4c3bb7f79f3598852fc16c1; metadata {"execution":{"package":"dev.olea.m2.runtime","targetSdk":36,"compileSdk":36,"minSdk":26,"androidApi":36,"measuredNodeArch":"x64","advertisedAbis":"x86_64,arm64-v8a","actualDomain":"u:r:untrusted_app:s0:c216,c256,c512,c768","realUid":10216,"hostPid":6197,"nodePid":6333,"nodePpid":6330,"nodeProcExe":"/opt/node/bin/node","loaderEnvAbsent":true,"apkSha256":"dbd494c8f9c533b20a5ed0a067dbb2496a34c2494911a9fc9cb4fb19f6435887"},"limits":["Native harness fixtures only; shared backend buffering remains untested.","Raw drain InterruptedIOException recorded but caught; original old-APK crash remains separate.","No model/provider calls; no generic descendant exit claim."]}.

## native.inherited-pipes: pass
Expected: Independently assert native inherited-pipes bounds; do not infer shared-backend buffering or generic descendant cleanup.

Actual: Root exited while fixture descendant held pipes; native reported inheritedPipesAfterJoin true, settled4141ms, no live drainers. Descendant exit not established.

Context: android-app; mode: direct; prerequisites: runtime.modern.

Attempts: runtime-harness-a01-inherited-pipes (android-app/direct pass): Root exited while fixture descendant held pipes; native reported inheritedPipesAfterJoin true, settled4141ms, no live drainers. Descendant exit not established.; artifacts git:b1b8a74:spike/m2/runtime/evidence/harness-assertions.json SHA256 e19547eded6483e1565963994e16cd843098f62241f266d163cba564d0a3f4f1, git:b1b8a74:spike/m2/runtime/assess-harness.mjs SHA256 13289ce28cc8cbc5eed2ad7edfb3c6f29cfe908b30de5b44fff24930ac82f3a9, git:b1b8a74:spike/m2/runtime/evidence/timeout-check-a01.json SHA256 0ee4d794aad6569cad0270516c26d8500221d4c2946b6beea7c86ddc82ba8c6f, git:b1b8a74:spike/m2/runtime/evidence/utf8-drain-a01.json SHA256 de89342cd93a1322ccb967aba806e02a0f79ea937bdbbee43abdcd7ec6c7851c, git:b1b8a74:spike/m2/runtime/evidence/inherited-pipe-a01.json SHA256 8105018ee8baf705e6a7294ab634ff42051633fdf4c3bb7f79f3598852fc16c1; metadata {"execution":{"package":"dev.olea.m2.runtime","targetSdk":36,"compileSdk":36,"minSdk":26,"androidApi":36,"measuredNodeArch":"x64","advertisedAbis":"x86_64,arm64-v8a","actualDomain":"u:r:untrusted_app:s0:c216,c256,c512,c768","realUid":10216,"hostPid":6197,"nodePid":6333,"nodePpid":6330,"nodeProcExe":"/opt/node/bin/node","loaderEnvAbsent":true,"apkSha256":"dbd494c8f9c533b20a5ed0a067dbb2496a34c2494911a9fc9cb4fb19f6435887"},"limits":["Native harness fixtures only; shared backend buffering remains untested.","Raw drain InterruptedIOException recorded but caught; original old-APK crash remains separate.","No model/provider calls; no generic descendant exit claim."]}.

## cost.setup-time: untested
Expected: Measure setup-time with actual identities/allocation/units and incomplete accounting limits.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: backend.shared.

Attempts: none.

## cost.install-size: untested
Expected: Measure install-size with actual identities/allocation/units and incomplete accounting limits.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: backend.shared.

Attempts: none.

## cost.cold-start: untested
Expected: Measure cold-start with actual identities/allocation/units and incomplete accounting limits.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: backend.shared.

Attempts: none.

## cost.idle-cpu: untested
Expected: Measure idle-cpu with actual identities/allocation/units and incomplete accounting limits.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: backend.shared.

Attempts: none.

## cost.first-event: untested
Expected: Measure first-event with actual identities/allocation/units and incomplete accounting limits.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: backend.shared.

Attempts: none.

## cost.first-text: untested
Expected: Measure first-text with actual identities/allocation/units and incomplete accounting limits.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: backend.shared.

Attempts: none.

## cost.stream-stalls: untested
Expected: Measure stream-stalls with actual identities/allocation/units and incomplete accounting limits.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: backend.shared.

Attempts: none.

## cost.one-session: untested
Expected: Measure one-session with actual identities/allocation/units and incomplete accounting limits.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: backend.shared.

Attempts: none.

## cost.two-sessions: untested
Expected: Measure two-sessions with actual identities/allocation/units and incomplete accounting limits.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: backend.shared.

Attempts: none.

## cost.direct-managed: untested
Expected: Measure direct-managed with actual identities/allocation/units and incomplete accounting limits.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: backend.shared.

Attempts: none.

## cost.output-frame: untested
Expected: Measure output-frame with actual identities/allocation/units and incomplete accounting limits.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: backend.shared.

Attempts: offline-tooling-output-frame-01 (host/direct pass): Host tooling tests for output-frame completed with exit 0; mock/supervisor checks only. Android backend/runtime acceptance remains untested.; artifacts git:444f9a1:spike/m2/evidence/evidence/offline-checks.json SHA256 cd503f63d82c1b786786f522706875c5cbc11190d3572e7eb8482df5ef049a52; metadata {"limits":["No provider, stock agent or Android execution.","Supervisor tests do not establish Android backend backpressure/cleanup."]}; offline-tooling-54fb8411c6814b8d-output-frame (host/direct pass): Host tooling tests for output-frame completed with exit 0; mock/supervisor checks only. Android backend/runtime acceptance remains untested.; artifacts spike/m2/evidence/evidence/attempts/sha256-54fb8411c6814b8d67fa7d64cc075433e433de3cb371e4cfbf51171bcfae8936.json SHA256 54fb8411c6814b8d67fa7d64cc075433e433de3cb371e4cfbf51171bcfae8936; metadata {"limits":["No provider, stock agent or Android execution.","Supervisor tests do not establish Android backend backpressure/cleanup."]}.

## cost.output-queue: untested
Expected: Measure output-queue with actual identities/allocation/units and incomplete accounting limits.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: backend.shared.

Attempts: offline-tooling-output-queue-01 (host/direct pass): Host tooling tests for output-queue completed with exit 0; mock/supervisor checks only. Android backend/runtime acceptance remains untested.; artifacts git:444f9a1:spike/m2/evidence/evidence/offline-checks.json SHA256 cd503f63d82c1b786786f522706875c5cbc11190d3572e7eb8482df5ef049a52; metadata {"limits":["No provider, stock agent or Android execution.","Supervisor tests do not establish Android backend backpressure/cleanup."]}; offline-tooling-54fb8411c6814b8d-output-queue (host/direct pass): Host tooling tests for output-queue completed with exit 0; mock/supervisor checks only. Android backend/runtime acceptance remains untested.; artifacts spike/m2/evidence/evidence/attempts/sha256-54fb8411c6814b8d67fa7d64cc075433e433de3cb371e4cfbf51171bcfae8936.json SHA256 54fb8411c6814b8d67fa7d64cc075433e433de3cb371e4cfbf51171bcfae8936; metadata {"limits":["No provider, stock agent or Android execution.","Supervisor tests do not establish Android backend backpressure/cleanup."]}.

## cost.timeout: untested
Expected: Measure timeout with actual identities/allocation/units and incomplete accounting limits.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: backend.shared.

Attempts: offline-tooling-timeout-01 (host/direct pass): Host tooling tests for timeout completed with exit 0; mock/supervisor checks only. Android backend/runtime acceptance remains untested.; artifacts git:444f9a1:spike/m2/evidence/evidence/offline-checks.json SHA256 cd503f63d82c1b786786f522706875c5cbc11190d3572e7eb8482df5ef049a52; metadata {"limits":["No provider, stock agent or Android execution.","Supervisor tests do not establish Android backend backpressure/cleanup."]}; offline-tooling-54fb8411c6814b8d-timeout (host/direct pass): Host tooling tests for timeout completed with exit 0; mock/supervisor checks only. Android backend/runtime acceptance remains untested.; artifacts spike/m2/evidence/evidence/attempts/sha256-54fb8411c6814b8d67fa7d64cc075433e433de3cb371e4cfbf51171bcfae8936.json SHA256 54fb8411c6814b8d67fa7d64cc075433e433de3cb371e4cfbf51171bcfae8936; metadata {"limits":["No provider, stock agent or Android execution.","Supervisor tests do not establish Android backend backpressure/cleanup."]}.

## cost.cleanup: untested
Expected: Measure cleanup with actual identities/allocation/units and incomplete accounting limits.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: backend.shared.

Attempts: none.

## cost.constrained-core: untested
Expected: Measure constrained-core with actual identities/allocation/units and incomplete accounting limits.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: backend.shared.

Attempts: none.

## cost.constrained-model: untested
Expected: Measure constrained-model with actual identities/allocation/units and incomplete accounting limits.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: backend.shared.

Attempts: none.

## cost.allocation-restore: untested
Expected: Measure allocation-restore with actual identities/allocation/units and incomplete accounting limits.

Actual: No retained matching execution receipt.

Context: android-app; mode: direct; prerequisites: backend.shared.

Attempts: none.

## physical.abi: blocked
Expected: Measure physical Android14 abi; emulator is not ARM64 proof.

Actual: No connected physical device; physical Android14 ABI and dependent device measurements blocked.

Context: physical-phone; mode: direct; prerequisites: none.

Attempts: runtime-boot-a02-physical-abi (physical-phone/direct blocked): No connected physical device; physical Android14 ABI and dependent device measurements blocked.; artifacts git:b1b8a74:spike/m2/runtime/evidence/boot-attempts.json SHA256 8952a0504a97c93080b1a7a5fa147e8a1cf8d474cdddbb5306f22622019174f8, git:b1b8a74:spike/m2/runtime/evidence/baseline-query-a02.txt SHA256 d695b43a520d226fd72de0a54bbdbdacf1eb220e4b273d38f7cada3941348aa8, git:b1b8a74:spike/m2/runtime/evidence/emulator-identity-a02.txt SHA256 c934583778d9370e3d9425cf48102de360352eac80d7e7d730c9ca822ca6a7c7; metadata {"execution":{"timestampBasis":"Assessment time; original boot attempt UTC and emulator identities retained in artifact.","avd":"Olea_API_36","serial":"emulator-5554","allocation":{"onlineCpus":"0-3","memTotalKiB":4013812}},"limits":["No baseline reinstall, reset, deletion or snapshot restoration performed.","Missing original M1 app/cache cause unproved; historical M1 evidence unchanged.","No physical ABI inference from emulator."]}.

## physical.unix: blocked
Expected: Measure physical Android14 unix; emulator is not ARM64 proof.

Actual: No connected physical device; physical Android14 ABI and dependent device measurements blocked.

Context: physical-phone; mode: direct; prerequisites: none.

Attempts: runtime-boot-a02-physical-unix (physical-phone/direct blocked): No connected physical device; physical Android14 ABI and dependent device measurements blocked.; artifacts git:b1b8a74:spike/m2/runtime/evidence/boot-attempts.json SHA256 8952a0504a97c93080b1a7a5fa147e8a1cf8d474cdddbb5306f22622019174f8, git:b1b8a74:spike/m2/runtime/evidence/baseline-query-a02.txt SHA256 d695b43a520d226fd72de0a54bbdbdacf1eb220e4b273d38f7cada3941348aa8, git:b1b8a74:spike/m2/runtime/evidence/emulator-identity-a02.txt SHA256 c934583778d9370e3d9425cf48102de360352eac80d7e7d730c9ca822ca6a7c7; metadata {"execution":{"timestampBasis":"Assessment time; original boot attempt UTC and emulator identities retained in artifact.","avd":"Olea_API_36","serial":"emulator-5554","allocation":{"onlineCpus":"0-3","memTotalKiB":4013812}},"limits":["No baseline reinstall, reset, deletion or snapshot restoration performed.","Missing original M1 app/cache cause unproved; historical M1 evidence unchanged.","No physical ABI inference from emulator."]}.

## physical.agents: blocked
Expected: Measure physical Android14 agents; emulator is not ARM64 proof.

Actual: No connected physical device; physical Android14 ABI and dependent device measurements blocked.

Context: physical-phone; mode: direct; prerequisites: none.

Attempts: runtime-boot-a02-physical-agents (physical-phone/direct blocked): No connected physical device; physical Android14 ABI and dependent device measurements blocked.; artifacts git:b1b8a74:spike/m2/runtime/evidence/boot-attempts.json SHA256 8952a0504a97c93080b1a7a5fa147e8a1cf8d474cdddbb5306f22622019174f8, git:b1b8a74:spike/m2/runtime/evidence/baseline-query-a02.txt SHA256 d695b43a520d226fd72de0a54bbdbdacf1eb220e4b273d38f7cada3941348aa8, git:b1b8a74:spike/m2/runtime/evidence/emulator-identity-a02.txt SHA256 c934583778d9370e3d9425cf48102de360352eac80d7e7d730c9ca822ca6a7c7; metadata {"execution":{"timestampBasis":"Assessment time; original boot attempt UTC and emulator identities retained in artifact.","avd":"Olea_API_36","serial":"emulator-5554","allocation":{"onlineCpus":"0-3","memTotalKiB":4013812}},"limits":["No baseline reinstall, reset, deletion or snapshot restoration performed.","Missing original M1 app/cache cause unproved; historical M1 evidence unchanged.","No physical ABI inference from emulator."]}.

## physical.phone: blocked
Expected: Measure physical Android14 phone; emulator is not ARM64 proof.

Actual: No connected physical device; physical Android14 ABI and dependent device measurements blocked.

Context: physical-phone; mode: direct; prerequisites: none.

Attempts: runtime-boot-a02-physical-phone (physical-phone/direct blocked): No connected physical device; physical Android14 ABI and dependent device measurements blocked.; artifacts git:b1b8a74:spike/m2/runtime/evidence/boot-attempts.json SHA256 8952a0504a97c93080b1a7a5fa147e8a1cf8d474cdddbb5306f22622019174f8, git:b1b8a74:spike/m2/runtime/evidence/baseline-query-a02.txt SHA256 d695b43a520d226fd72de0a54bbdbdacf1eb220e4b273d38f7cada3941348aa8, git:b1b8a74:spike/m2/runtime/evidence/emulator-identity-a02.txt SHA256 c934583778d9370e3d9425cf48102de360352eac80d7e7d730c9ca822ca6a7c7; metadata {"execution":{"timestampBasis":"Assessment time; original boot attempt UTC and emulator identities retained in artifact.","avd":"Olea_API_36","serial":"emulator-5554","allocation":{"onlineCpus":"0-3","memTotalKiB":4013812}},"limits":["No baseline reinstall, reset, deletion or snapshot restoration performed.","Missing original M1 app/cache cause unproved; historical M1 evidence unchanged.","No physical ABI inference from emulator."]}.

## physical.battery: blocked
Expected: Measure physical Android14 battery; emulator is not ARM64 proof.

Actual: No connected physical device; physical Android14 ABI and dependent device measurements blocked.

Context: physical-phone; mode: direct; prerequisites: none.

Attempts: runtime-boot-a02-physical-battery (physical-phone/direct blocked): No connected physical device; physical Android14 ABI and dependent device measurements blocked.; artifacts git:b1b8a74:spike/m2/runtime/evidence/boot-attempts.json SHA256 8952a0504a97c93080b1a7a5fa147e8a1cf8d474cdddbb5306f22622019174f8, git:b1b8a74:spike/m2/runtime/evidence/baseline-query-a02.txt SHA256 d695b43a520d226fd72de0a54bbdbdacf1eb220e4b273d38f7cada3941348aa8, git:b1b8a74:spike/m2/runtime/evidence/emulator-identity-a02.txt SHA256 c934583778d9370e3d9425cf48102de360352eac80d7e7d730c9ca822ca6a7c7; metadata {"execution":{"timestampBasis":"Assessment time; original boot attempt UTC and emulator identities retained in artifact.","avd":"Olea_API_36","serial":"emulator-5554","allocation":{"onlineCpus":"0-3","memTotalKiB":4013812}},"limits":["No baseline reinstall, reset, deletion or snapshot restoration performed.","Missing original M1 app/cache cause unproved; historical M1 evidence unchanged.","No physical ABI inference from emulator."]}.

## physical.thermals: blocked
Expected: Measure physical Android14 thermals; emulator is not ARM64 proof.

Actual: No connected physical device; physical Android14 ABI and dependent device measurements blocked.

Context: physical-phone; mode: direct; prerequisites: none.

Attempts: runtime-boot-a02-physical-thermals (physical-phone/direct blocked): No connected physical device; physical Android14 ABI and dependent device measurements blocked.; artifacts git:b1b8a74:spike/m2/runtime/evidence/boot-attempts.json SHA256 8952a0504a97c93080b1a7a5fa147e8a1cf8d474cdddbb5306f22622019174f8, git:b1b8a74:spike/m2/runtime/evidence/baseline-query-a02.txt SHA256 d695b43a520d226fd72de0a54bbdbdacf1eb220e4b273d38f7cada3941348aa8, git:b1b8a74:spike/m2/runtime/evidence/emulator-identity-a02.txt SHA256 c934583778d9370e3d9425cf48102de360352eac80d7e7d730c9ca822ca6a7c7; metadata {"execution":{"timestampBasis":"Assessment time; original boot attempt UTC and emulator identities retained in artifact.","avd":"Olea_API_36","serial":"emulator-5554","allocation":{"onlineCpus":"0-3","memTotalKiB":4013812}},"limits":["No baseline reinstall, reset, deletion or snapshot restoration performed.","Missing original M1 app/cache cause unproved; historical M1 evidence unchanged.","No physical ABI inference from emulator."]}.
