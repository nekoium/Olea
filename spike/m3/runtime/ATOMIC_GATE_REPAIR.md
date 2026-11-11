# Atomic publication and cancellation follow-up

Source/build follow-up to `1db5c91`, prompted by manager review. This checkpoint has no device access or model request; user setup hold remains in force.

The launch helper now passes the established owner and a gate-release callback to the probe. `RuntimeProbe.publish()` assigns that owner, checks the cancellation latch and releases the gate **inside the same synchronized monitor** used by `cancel()`. STOP therefore either latches before publication and keeps the gate closed, or sees the published owner after gate release and schedules cleanup. There is no interval where STOP can return with no owner and a later unchecked release can execute the script.

Each probe launch now schedules at most one asynchronous cleanup thread. Repeated cancellations reuse that launch's cleanup request; the probe's existing final synchronous `stop()` retries any recorded live identities. A new launch resets the latch, owner and cleanup-request state under the probe monitor. No unbounded thread queue is created by repeated STOP.

The focused instrumentation suite now has five checks. Its added deterministic interleaving check blocks the real production publication method at the gate-release callback, starts a competing STOP, and requires that STOP remains blocked until publication/release finishes. It then sends20additional cancellations, checks that at most one named cleanup thread is live, and verifies the owned process exits. This check executes first, before another test deliberately leaves a cancellation latch set. The other four startup/teardown checks remain pending with it.

Both app and instrumentation APKs are built off-device. They are uninstalled and the five tests are **not executed** while user setup is pending. Verify the current app's user-selected folder and fresh capture image before any later install/restart. No new deployed-byte or runtime acceptance claim follows from this compilation.
