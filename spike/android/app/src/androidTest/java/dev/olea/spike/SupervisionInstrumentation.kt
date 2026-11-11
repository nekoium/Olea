package dev.olea.spike

import android.app.Instrumentation
import android.content.Intent
import android.os.Bundle
import android.system.OsConstants
import org.json.JSONArray
import org.json.JSONObject
import java.io.File

// Focused real-Android checks, no model/provider/rootfs access. Run only after consent work settles.
class SupervisionInstrumentation : Instrumentation() {
    override fun onCreate(arguments: Bundle?) { super.onCreate(arguments); start() }
    override fun onStart() {
        val results = JSONArray()
        val directory = File(targetContext.filesDir, "m3-supervision-${System.currentTimeMillis()}")
        check(directory.mkdir())
        val checks = mutableListOf<Pair<String, () -> Unit>>()
        fun test(name: String, action: () -> Unit) { checks.add(name to action) }
        test("cancel-before-launch-gate") {
            val effect = File(directory, "gate-effect")
            val (child, owner) = OwnedProcess.launch(ProcessBuilder("/system/bin/sh", "-c", "echo UNEXPECTED > \"$1\"", "effect", effect.path), File(directory, "gate.pid")) { owner, _ -> owner.stop() }
            check(child.waitFor(2, java.util.concurrent.TimeUnit.SECONDS))
            check(!effect.exists())
            val first = owner.stop(); val second = owner.stop()
            check(first.getBoolean("trackedExitVerified") && second.getBoolean("trackedExitVerified"))
            check(second.getJSONArray("owned").length() > 0)
        }
        test("immediate-stop-after-root-ownership") {
            val (child, owner) = OwnedProcess.launch(ProcessBuilder("/system/bin/sleep", "30"), File(directory, "immediate.pid"))
            val result = owner.stop()
            check(child.waitFor(2, java.util.concurrent.TimeUnit.SECONDS))
            check(result.getBoolean("trackedExitVerified"))
            check(result.getJSONArray("owned").length() > 0)
        }
        test("probe-stop-before-owned-assignment") {
            val attempt = "m3-startup-${System.currentTimeMillis()}"
            val probeDirectory = File(targetContext.filesDir, "m2").apply { mkdirs() }
            val effect = File(directory, "startup-effect")
            File(probeDirectory, "$attempt.sh").writeText("#!/system/bin/sh\necho UNEXPECTED > '${effect.path}'\n")
            val service = object : android.app.Service() {
                init { attachBaseContext(targetContext) }
                override fun onBind(intent: Intent?): android.os.IBinder? = null
            }
            synchronized(RuntimeProbe) { RuntimeProbe.run(service, attempt); RuntimeProbe.cancel() }
            val receipt = File(probeDirectory, "$attempt.json")
            val deadline = android.os.SystemClock.elapsedRealtime() + 3000
            while (!receipt.exists() && android.os.SystemClock.elapsedRealtime() < deadline) Thread.sleep(20)
            check(receipt.exists()) { "STARTUP_CANCEL_NOT_SETTLED" }
            val result = JSONObject(receipt.readText())
            check(result.getBoolean("cancelRequested") && result.getBoolean("launchSuppressed"))
            check(!effect.exists())
        }
        test("probe-service-teardown-during-startup") {
            val attempt = "m3-teardown-${System.currentTimeMillis()}"
            val probeDirectory = File(targetContext.filesDir, "m2").apply { mkdirs() }
            val effect = File(directory, "teardown-effect")
            File(probeDirectory, "$attempt.sh").writeText("#!/system/bin/sh\nsleep 15\necho UNEXPECTED > '${effect.path}'\n")
            File(probeDirectory, "$attempt.deadline-seconds").writeText("30\n")
            val intent = Intent(targetContext, RuntimeService::class.java).setAction("probe").putExtra("attempt", attempt)
            targetContext.startForegroundService(intent)
            val pidFile = File(probeDirectory, "$attempt.pid")
            val receipt = File(probeDirectory, "$attempt.json")
            val startDeadline = android.os.SystemClock.elapsedRealtime() + 3000
            while (!pidFile.exists() && !receipt.exists() && android.os.SystemClock.elapsedRealtime() < startDeadline) Thread.sleep(10)
            check(pidFile.exists()) { "PROBE_NOT_STARTED" }
            check(targetContext.stopService(Intent(targetContext, RuntimeService::class.java)))
            val deadline = android.os.SystemClock.elapsedRealtime() + 6000
            while (!receipt.exists() && android.os.SystemClock.elapsedRealtime() < deadline) Thread.sleep(20)
            check(receipt.exists()) { "TEARDOWN_NOT_SETTLED" }
            val result = JSONObject(receipt.readText())
            check(result.getBoolean("cancelRequested"))
            check(result.getBoolean("rootExitObserved"))
            check(result.getJSONObject("ownershipCleanup").getBoolean("trackedExitVerified"))
            check(!effect.exists())
        }
        test("atomic-owner-publication-and-gate-release") {
            val entered = java.util.concurrent.CountDownLatch(1)
            val allowRelease = java.util.concurrent.CountDownLatch(1)
            val stopAttempted = java.util.concurrent.CountDownLatch(1)
            val stopReturned = java.util.concurrent.atomic.AtomicBoolean(false)
            val launchFailure = java.util.concurrent.atomic.AtomicReference<Throwable?>()
            val launched = java.util.concurrent.atomic.AtomicReference<Pair<java.lang.Process, OwnedProcess>>()
            val pidFile = File(directory, "atomic.pid")
            val launcher = Thread {
                try {
                    launched.set(OwnedProcess.launch(ProcessBuilder("/system/bin/sleep", "30"), pidFile) { owner, release ->
                        RuntimeProbe.publish(owner) {
                            entered.countDown()
                            check(allowRelease.await(2, java.util.concurrent.TimeUnit.SECONDS))
                            release()
                        }
                    })
                } catch (error: Throwable) { launchFailure.set(error) }
            }.apply { start() }
            try {
                check(entered.await(2, java.util.concurrent.TimeUnit.SECONDS))
                val stopper = Thread { stopAttempted.countDown(); RuntimeProbe.cancel(); stopReturned.set(true) }.apply { start() }
                check(stopAttempted.await(1, java.util.concurrent.TimeUnit.SECONDS))
                val deadline = android.os.SystemClock.elapsedRealtime() + 1000
                while (stopper.state != Thread.State.BLOCKED && !stopReturned.get() && android.os.SystemClock.elapsedRealtime() < deadline) Thread.sleep(5)
                check(stopper.state == Thread.State.BLOCKED && !stopReturned.get()) { "STOP_RETURNED_BEFORE_GATE_RELEASE" }
                check(!File(pidFile.path + ".ready").exists())
                allowRelease.countDown()
                launcher.join(2000); stopper.join(2000)
                check(!launcher.isAlive && !stopper.isAlive && stopReturned.get())
                launchFailure.get()?.let { throw IllegalStateException("LAUNCH_FAILED", it) }
                repeat(20) { RuntimeProbe.cancel() }
                check(Thread.getAllStackTraces().keys.count { it.isAlive && it.name == "m2-probe-cleanup" } <= 1) { "CLEANUP_NOT_COALESCED" }
                val (child, owner) = launched.get()
                check(child.waitFor(2, java.util.concurrent.TimeUnit.SECONDS))
                check(owner.stop().getBoolean("trackedExitVerified"))
            } finally { allowRelease.countDown(); launcher.join(2500); launched.get()?.second?.stop() }
        }
        // Run the publication test before a cancelled probe leaves its latch set.
        for ((name, action) in checks.sortedBy { if (it.first == "atomic-owner-publication-and-gate-release") 0 else 1 }) {
            try { action(); results.put(JSONObject().put("name", name).put("status", "pass")) }
            catch (error: Exception) { results.put(JSONObject().put("name", name).put("status", "fail").put("error", error.toString())) }
        }
        val report = JSONObject().put("at", System.currentTimeMillis()).put("cases", results)
            .put("modelRequests", 0).put("directory", directory.path)
        File(directory, "results.json").writeText(report.toString(2))
        finish(if ((0 until results.length()).all { results.getJSONObject(it).getString("status") == "pass" }) -1 else 0,
            Bundle().apply { putString("stream", report.toString(2)); putString("receipt", File(directory, "results.json").path) })
    }
}
