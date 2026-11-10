
## Continued checkpoint: fresh repeat, updates and bounded lifecycle

The manager superseded the early handoff pause. The same worker retained the sole emulator lease; no successor owner or lease transfer exists. At `af2b957` the separately installed `dev.olea.m2.repeat` (UID10218, same target36 service/domain) completed the corrected fresh sequence and all six core assertions. `repeat-fresh-sequence-a01.json` is the phase index. Network download rejected one CA package hash mismatch. The exact public archive in the primary APT cache matched the **original expected** SHA256 `f9fbacd417b515450b831032cc39d18059e9874e67525679a43c16071dabf9a0`,140064 bytes; staging it into the repeat cache allowed ordinary offline install/configuration to pass. No mismatched bytes were accepted. The reproducible successful sequence therefore requires that verified archive as an explicit public input; unassisted network-only fresh installation is not proved. All first failures remain.

Actual corrected repeat commands, from this worktree, were:

```bash
# The repeat APK was built with -Pm2Package=dev.olea.m2.repeat -Pm2BridgePort=8769.
# Install the recorded .setup/repeat-a01.apk, never the valuable primary package over a new target.
OLEA_PACKAGE=dev.olea.m2.repeat bash spike/m2/runtime/provision.sh
OLEA_PACKAGE=dev.olea.m2.repeat bash spike/m2/runtime/run-probe.sh repeat-bootstrap-a01 spike/m2/runtime/repeat-bootstrap-a01.sh
OLEA_PACKAGE=dev.olea.m2.repeat bash spike/m2/runtime/run-probe.sh repeat-download-a01 spike/m2/runtime/repeat-download-a01.sh
# First download failed; first offline install was blocked, both preserved.
# Stage exact verified public CA archive from evidence/repeat-ca-cache-recovery-a02.json.
OLEA_PACKAGE=dev.olea.m2.repeat bash spike/m2/runtime/run-probe.sh repeat-install-a02 spike/m2/runtime/repeat-install-a02.sh
# Stage unchanged core.mjs to fresh rootfs /workspace/core.mjs, then:
OLEA_PACKAGE=dev.olea.m2.repeat bash spike/m2/runtime/run-probe.sh core-repeat-a02 spike/m2/runtime/core-repeat-a02.sh
```

These are historical attempt IDs/destinations, **not permission to rerun over existing state**. A future reproduction must use a new package/data destination and new attempt IDs. The native receipts retain per-phase times/deadlines/actual UID/domain, exact scripts and all output bounds.

Ordinary agent update passed with zero model requests: fresh disposable `/opt/agents/pi-update` first installed stock1.5.1, resumed the already proved canonical workspace/account/session, then ordinary same-prefix npm installed1.5.2. Both releases resumed sessionId `01a1c68c-6ece-7232-840a-21315443a774`, exact transcript path and marker. All11 previous workspace/transcript/resume hashes, installed workspace dependency behavior, protected credential bytes and mode600 survived install and subsequent resume. The original primary agent prefix `/opt/agents/pi` remained untouched. Release metadata changed1.5.1→1.5.2; the observed entry SHA was identical across these two release artifacts, so this does not prove a changed native dependency update. Separate full runtime/Ubuntu refresh and interrupted agent update remain untested; interrupted APT configuration recovery was measured earlier.

Three explicit idle samples per one/two stock persistent RPC sessions recorded actual host/PRoot/shared runner Node/Pi PSS/RSS, real UID and stable startticks. First one-session PSS subtotal177256KiB; first two-session subtotal246832KiB. The collector itself and PRoot accrue CPU during collection, so raw tick intervals are retained without claiming settled no-overhead idle. These are explicit-process idle subtotals, not total app-UID inventory, model workload peak, memory-pressure certification or battery/thermal measurement.

The already started short lifecycle case completed before the manager's next no-extra-runs instruction: host service owned Node15212, a6s timer/marker progressed after HOME and screen sleep, and actual stock Pi resumed the proved transcript while independently observed power was Dozing/Asleep. `lifecycle-lock-a01{,-native}.json` and the independent power observation pass this narrow case with zero provider requests. It does not establish indefinite Doze survival, reboot recovery, whole-app death, or stop/revocation behavior.

Codex's final finite diagnostic is `codex-socket-mount-a02{,-native}.json`: guest `/tmp` fd mountId11029 was absent from mountinfo, and the exact installed bundled bwrap SHA `77360cb751ccedc5971391444ac86a8a33c15b04d6b4a6fe45f5d25496e62c4c` exited1 on `Can't read /proc/sys/kernel/overflowuid: Permission denied`. This occurs before a namespace success proof; no kernel namespace errno was invented. Specialist inspection found no evidenced supported unprivileged fix preserving current stock guard/sandbox. No private/tmp rewrite, flag-removal fallback, fake proc, agent patch, root or model call followed.

At2026-11-10T18:15:51Z, after all these phases settled: intended emulator is still booted API36, CPU0-3/MemTotal4013812KiB, screen **Asleep**. Listed processes are primary host9619 UID10216/start150689, fixture9732 UID10217, repeat host12459 UID10218/start348349; no listed PRoot/Node/Pi/Codex child remains. Primary phoneEnabled=true/accessibility=true/backendRunning=false; exact primary Accessibility service remains enabled. Repeat bridge8769 is active but phone-disabled by default. Development ADB forward8768 remains. No stop/revoke/wake/force-stop or further experiment was issued after the last instruction to save the current checkpoint. Current lease remained held at this observation time. Later authorized closeout disabled primary phone actions through the native stop control, independently queried flags and saved exact owned process identities, then relinquished the lease; see [lease-closeout.json](evidence/lease-closeout.json).

Global provider budget: this worker consumed exactly **one** top-level Pi primary prompt; Codex conditional prompt was never consumed. Manager reports global total3/8 (two host Codex plus this Android Pi); no automatic replay/retry/fallback. Remaining PHONE_USE categories/new model category coverage, permission revocation/stop, broader lifecycle/reboot/constrained/physical and full runtime refresh are explicit gaps; earlier M1 results remain separate. Current source/artifact hashes and state live in `checkpoint-artifact-hashes.txt`, `checkpoint-after-repeat-state.txt`, `checkpoint-after-repeat-capabilities.json`, and the final manifest.
