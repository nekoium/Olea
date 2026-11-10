# M2 runtime checkpoint

Disposable MIT integration source; runtime components retain their upstream licenses. This checkpoint proves a useful modern-target path, not the complete milestone or production acceptance.

Latest actual continuation, reproduction commands, fresh-repeat/update/resource/lifecycle results: [CHECKPOINT_AFTER_REPEAT.md](CHECKPOINT_AFTER_REPEAT.md). Final graceful stop/current state and explicit **lease relinquishment**: [lease-closeout.json](evidence/lease-closeout.json). Earlier snapshot paragraphs below retain their stated observation times.

## Measured result

On Olea_API_36, Android16/API36 x86_64, target36/min26/compile36 `dev.olea.m2.runtime` executes unmodified Termux PRoot5.1.107.102 from PackageManager's read-only nativeLibraryDir. Its stock packaged loader executes writable Ubuntu24.04.3 shell, upstream Node24.20.0 and nested children in the **actual Kotlin service domain**, `u:r:untrusted_app`, real UID10216. Development run-as is provisioning/observation only.

`core-a01.json` plus its native receipt independently pass shell, fresh Git2.43.0 commit/object equality, DNS, certificate-validated registry HTTPS, ordinary npm is-number7.0.0 install/use, and nested Node result42 with PID/starttime/parentage. APK-extracted PRoot/loader/dependency hashes exactly match verified original payload bytes. Guest loader variables are cleared by stock Android env before Linux Node starts; the remaining generated-linkerconfig warning is retained.

Stock Pi1.5.2 installed through ordinary npm (123 packages, about96s) and declared-bin startup passed. One allocated primary gpt-6.1-terra combined turn completed in44504ms, nine observed rounds, no retry/fallback: independently verified Unix file/dependency/nested behavior, native Accessibility ACTION_CLICK, independently observed fixture foreground **before** cooperating-app intent, and separate-UID10217 oracle equality/positive host-UID denial. Saved transcript resume passed. Usage16268 input/676 output/7998 cacheRead/0 cacheWrite; HTTP request count and remote monetary billing remain unknown. First event31ms, first text42820ms, maximum observed event gap5800ms. Numerical model descendant ancestry is observed during the bash tool interval; fresh runner rechecks alone do not prove the semantics of each model child.

Stock Codex0.167.0 installed and declared-bin startup passed in the same modern service path. Current app-server initialize and thread creation work; supported stdio MCP connects six phone tools with **zero model/phone calls**. Stock sandbox command/exec inside and outside both exit1 with:

```text
error building bubblewrap command: cannot establish app-server socket mount isolation
```

The required inside file was absent. This is a blocked sandbox prerequisite, not a valid outside-denial pass or a provider defect. No lower-level errno was emitted. No sandbox bypass or agent patch was tried. The conditional Android Codex model allocation was **not consumed**.

## Failures and limits retained

- Initial default-GPU emulator boot stayed offline; selected graceful emulator stop then a bounded cold swiftshader boot succeeded. No wipe/configuration change. The intended current AVD has no historical `dev.olea.spike` package; old host feasibility-android cache path is empty. Cause unknown; M1 historical evidence remains unchanged. Do not reinstall baseline to hide this discrepancy.
- candidate-a01 started before provisioning finished and reported missing linux.sh; candidate-a02 ran after staging checks and passed. This was a fixture ordering failure, not a runtime incompatibility.
- Initial prepare tar failed on bound `/sys` utime. The corrected attempt excluded sys, but its combined download/install exceeded240s during CA configuration; an uncaught InterruptedIOException in the original stream reader killed host4134 before a terminal JSON receipt. The absence of that receipt is incomplete, not a clean-timeout pass.
- Fixed reader catches per-stream IO failures, writes receipts in finally, reports observed/retained bytes and drainer liveness, and resets busy state after write failures. Actual native tests verify a5s timeout without app death,90000/80107 UTF8 output bytes retained at65536 bytes per stream with truncation, and inherited pipes settled in4141ms. Root-only timeout signaling is explicit; generic descendant exit is not proved by an empty session list.
- Ordinary `dpkg --configure -a` recovery passed separately in about53s, with clean dpkg audit, Git and CA bundle. This repairs the existing environment; it does **not** turn the first fresh sequence into a successful fresh-repeat result.
- direct-a01 falsely failed its denial assertion because adb exec-out returned exit0 with Permission-denied text. Shell-exit-aware direct-a02 passes against an existing separate-UID oracle. No actual permission bypass was observed.
- First staged backend tests used the wrong working directory and could not locate mock fixtures. Correct payload-root invocation passes19 tests. No adapter change was made for that setup defect.
- Pi acceptance uses a bounded Node case runner that instantiates the shared TS Backend class under RuntimeService's probe supervisor. It does not start the native long-running `/backend` server; its `backendRunning=false` flag is therefore expected. Native phone stop remains per-operation authority, but stopping all probe-owned Unix descendants through the UI is **not** accepted. The generic probe timeout terminates the root only.
- Corrected fresh repeat and ordinary Pi update now pass at `af2b957`, with explicit verified-cache recovery described below. Broader lifecycle/stop/revocation, constrained allocation and physical-phone tests remain untested; resource samples cover idle explicit processes only. M1 category passes are historical, not new M2 passes.

## Exact retained artifacts

Paths below are inside this worktree; ignored build artifacts were intentionally retained. Do not treat the current Gradle output APK as the already tested primary package: its last build is the repeat package.

| Artifact | SHA256 | Scope |
| --- | --- | --- |
| `.setup/runtime-a03.apk` | `375870be5efcf79a1cd16fb60e95e0a91b68904634164b1c308bdbcb3f99b0ab` | candidate-a01/a02 native baseline only |
| `.setup/runtime-a07.apk` | `dbd494c8f9c533b20a5ed0a067dbb2496a34c2494911a9fc9cb4fb19f6435887` | installed fixed primary; core/Pi/Codex receipts; native source at e3c2148 |
| `spike/android/fixture/build/outputs/apk/modern/debug/fixture-modern-debug.apk` | `5db196cb82ae65278c8106fcff2a11c7d9ea4eeae0b485729daf4cf0fb05c43a` | installed dev.olea.m2.fixture |
| `.setup/repeat-a01.apk` | `0d250d3edd73614cafa24187b46364a3660e17c835777f42842dcee987ed15d7` | installed isolated dev.olea.m2.repeat, port8769; corrected fresh sequence/core |
| `.setup/public-payload-11106c8.tar.gz` | see `evidence/deployed-payload-hashes.txt` | exact public backend/runner deployment from manager11106c8 |

`artifact-manifest.json` records upstream URLs, hashes, native bytes, licenses and source obligations. New verified public downloads, Gradle caches, raw build/install failures and APKs stay under `.setup`; no publication occurred. Original source is MIT, not a relicensing of GPL/LGPL/Ubuntu/Codex artifacts.

## Reproduction and next work

Use the saved public source plus integrated manager-owned backend/evidence/Codex commits. One shared backend is built with `npm ci --prefix spike/backend && npm run build --prefix spike/backend`. This worker staged exact Git11106c8 public files under `.setup/integration`, built there, and deployed only dist/extensions/runners/probes; no credential entered the tar. Correct host test cwd was `.setup/integration`.

`bash spike/m2/runtime/build.sh` verifies archives, stages exact native bytes, builds modern APK with Gradle --no-daemon and a240s bound. Current machine required explicit local proxy/Maven bypass arguments shown in raw build logs; do not assume that proxy on another machine. The separate repeat uses `-Pm2Package=dev.olea.m2.repeat -Pm2BridgePort=8769` and `OLEA_PACKAGE=dev.olea.m2.repeat` for provisioning/probes.

`provision.sh` defaults to dev.olea.m2.runtime; OLEA_PACKAGE permits only dev.olea.m2.* destinations. It verifies public Ubuntu/Node hashes, uses `claim-rootfs.sh` to fail closed on existing directories/files/guards/symlinks, then stages a fresh rootfs. Six host exact-script preservation tests pass. **Do not rerun on either existing rootfs.** The primary first staging preceded this guard correction. The separately installed repeat used the corrected guard and native bounded bootstrap/update, download-only and offline install/configuration phases. Its first CA download failed SHA verification; the exact public primary APT cached archive matched the original expected SHA and was explicitly staged as a verified input. Offline install/configuration and the final six core assertions then passed, without patching packages or agents. `evidence/repeat-fresh-sequence-a01.json` retains every phase and limit; a network-only fresh success is not established.

`run-probe.sh ATTEMPT SCRIPT` stages a never-used named script and launches an actual Activity/service attempt; current source refuses existing scripts/receipts and includes remote set-euC. Every attempt must be unique. The Pi script additionally atomically claims a durable `/run/m2-android-pi-01.started` directory. **Never rerun it to recover an uncertain turn.**

Provider configuration is already protected in primary rootfs `/run/olea-provider.json` mode600. The only authorized external source is the root project's `.setup/android-test-provider.local.json`. `provision-provider.mjs` reads it programmatically and provisions through protected stdin with no-clobber redirection; never display/copy it into an archive or put its value into argv, tools, environment, logs or Git. The Pi extension receives a filename and registers the key internally. Same UID is not a security boundary.

Offline phone assertion: use canonical `spike/tests/m2/assertions.mjs` against `evidence/pi-combined-a01-native-oracle.json`; manager independently passed assertPhone. Live `assert-pi-phone.mjs OUTPUT BEFORE_AUDIT AFTER_AUDIT FOREGROUND` additionally requires the original unchanged fixture value/workspace plus native audit prefix, before/after JSONL observations, and model summary/native receipts. Its defaults reference task-local `.setup/pi-a01-audit-{before,after}.jsonl` and tracked foreground JSONL; those raw audit copies remain retained. It writes a new output only, never overwrites the original receipt. Tool exclusion booleans represent a **manual source/contract audit** of the exact deployed extension/fixture, while UID denial, ordering and equality are measured; the script does not enumerate every possible tool.

## Settled handoff state

The following state is a historical snapshot before continued repeat/update work, not a lease handoff. At2026-11-10T17:55:13Z: emulator-5554 is booted Olea_API_36/API36/x86_64, CPU0-3/MemTotal4013812KiB; baseline AVD config SHA remains `d52586b2631349deb331f981b2e49d57ce5440e9fe94429a1772935edd7ce502`. Host9619 realUID10216/startticks150689 and fixture9732 realUID10217 are the listed app processes; no listed PRoot/Node/Pi/Codex child remains. Native foreground RuntimeService and Accessibility service are active; phoneEnabled=true, accessibility=true, backendRunning=false. Native bridge8768 and development ADB forward remain; no claim that phone stop/revocation or final app stop was performed. Provider config, bridge token and bridge config are mode600. Native host-only snapshot RSS165740KiB/PSS37105KiB is settled host data, not active total/peak.

Working primary rootfs, stock packages, Pi workspace/transcript/resume, fixtures/oracle, public caches and protected configuration remain intact. No baseline wipe, uninstall, rootfs deletion, snapshot restore, root, broad process kill or destructive Rim operation occurred. The repeat APK was subsequently installed under its distinct UID10218, without modifying primary data. Physical device is absent/ABI unknown. No lease transfer has occurred: the manager explicitly superseded premature handoff instructions and this worker retains the sole mutation lease.

Rim spawn initially timed out30s; tree later showed n3f0763d837c5e6f, while Rim status reported mass changes despite clean Git. Punch failed `no Rim root exists for the current project context`; no repeat spawn or destructive repair. Local Git checkpoints12482c3,328dd71,e3c2148,efb28b4 and this final receipt preserve meaningful progress.
