# Failed-start exit evidence repair

Follow-up to independent `80821f9`. No device operation occurred: user controls in question `msg_0e52c5772ab9` remain pending, and installed app a07 is unchanged.

`OwnedProcess.launch` now throws a typed `LaunchFailure` carrying the actual boolean result from bounded direct-child termination/wait and the distinct gate-never-released fact. An exception or a false2s wait remains `directChildExitObserved=false`; a closed gate does not turn it into observed process exit.

`RuntimeProbe` propagates that failed-start evidence. With no owner it verifies cleanup only for a deliberately suppressed launch, or an explicitly observed failed-start direct-child exit. A missing owner by itself is unverified. Existing owned-process final cleanup still governs paths where ownership was established/published.

App and instrumentation APKs compile, with exact uninstalled hashes in `failed-start-build-a01.json`. The deterministic guard ran **off-device against the newly compiled production Kotlin classes**: a Java Process fixture returns false from waitFor, and the actual production helper requests destruction, retains false exit evidence and the closed-gate distinction. The actual probe classifier rejects both that failure and a bare null owner as cleanup proof, while accepting deliberate suppression. `failed-start-jvm-guard-a01.txt` records the passing result; `FailedStartGuard.java` preserves the exact executable guard source. No Android API is invoked by that JVM guard, so it does not establish Android termination behavior.

The equivalent focused instrumentation case is added, and case selection now permits running just that changed guard after current user capture/folder artifacts are collected and a new install is authorized:

`adb -s emulator-5554 shell am instrument -w -e case failed-start-unobserved-exit dev.olea.m2.runtime.test/dev.olea.spike.SupervisionInstrumentation`

The Android case has not run. No unchanged six-case suite, broad report, provider request or new source-review cycle was run. Current model budget remains5/8 consumed,3unallocated,0allocated here. Sole runtime lease is retained.
