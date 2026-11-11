# M3 startup cancellation repair: source/build checkpoint

This checkpoint answers independent review `d2872f2` findings1,2,4,5. It is **off-device only** while the user completes browser/folder/capture decisions. No install, test execution, permission change, process signal, UI action or new device observation occurred in this checkpoint. Sole lease and model budget remain unchanged: global5/8 consumed,3 unallocated,0 allocated here.

`RuntimeProbe.cancel()` now latches cancellation for the current launch even when its owner is not assigned. Before launch, the worker checks that latch under the same monitor as cancellation; cancellation at that boundary suppresses launch. The launch helper also checks the latch before releasing its script gate, and the worker checks it after owner assignment. `RuntimeService.onDestroy()` now invokes probe cancellation.

`OwnedProcess` establishes root PID/UID/starttime synchronously before it returns. Its shell wrapper writes the PID, then waits for an explicit owner-ready file before executing the requested command. The wait has a finite150iteration/20ms bound; failed ownership establishment forcibly stops the directly held, still-gated Java child and waits at most2s. A failed launch does not assert descendant exit. Repeated `stop()` calls retry still-live recorded identities. Empty inventories remain unverified, and verified exit now also requires observed Java root exit. A disappearing process status file during a scan is treated as gone only when its process directory also disappeared.

Four focused Android instrumentation checks are compiled without a new test dependency:

1. A denied launch gate never executes its effect; repeated stop verifies a nonempty owned inventory.
2. Immediate stop after synchronous root establishment settles the child.
3. Holding the probe monitor across `run` and `cancel` deterministically cancels before owner assignment; receipt must show launch suppression and no effect.
4. Controlled RuntimeService destruction during a newly launched probe must latch cancellation, settle the owned identities and suppress the delayed effect.

Both modern app and Android test APKs compile. Build logs retain the exact result; **these tests have not run**. After the manager releases the user-setup hold, first verify the selected-folder/capture artifacts on the currently installed a03 app. Installing the repaired app and running instrumentation will restart/stop the service, so they must follow that verification. The eventual focused command is `adb -s emulator-5554 shell am instrument -w dev.olea.m2.runtime.test/dev.olea.spike.SupervisionInstrumentation` after explicit APK installation. It requires no provider/model request and does not touch historical rootfs data. Retain its raw result plus independent PID absence before crediting startup/teardown acceptance.

`preserve-baseline.mjs` no longer includes the protected provider configuration in its file-hash search. Historical immutable baseline remains unchanged. `hash-deployed-public.mjs` is prepared to inventory only individual public backend dist/extension files after the next actual deployment; it has not been executed during this hold. Protected values remain owner-local equality/mode checks.

Capture metadata remains metadata. No delivered model image input is claimed; direct capture still needs the actual fresh PNG bytes, hash/dimensions and independent harmless-content inspection.
