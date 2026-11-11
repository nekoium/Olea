package dev.olea.spike

import android.app.Instrumentation
import android.content.Intent
import android.os.Bundle
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicReference

// Focused Android checks; no provider/model/rootfs access. Each case must settle before the next.
class SupervisionInstrumentation : Instrumentation() {
    override fun onCreate(arguments: Bundle?) { super.onCreate(arguments); start() }
    override fun onStart() {
        val results = JSONArray()
        val directory = File(targetContext.filesDir, "m3-supervision-${System.currentTimeMillis()}")
        check(directory.mkdir())
        var abortSuite = false
        val owned = mutableListOf<OwnedProcess>()
        fun await(ms: Long, condition: () -> Boolean) {
            val deadline = android.os.SystemClock.elapsedRealtime() + ms
            while (!condition() && android.os.SystemClock.elapsedRealtime() < deadline) Thread.sleep(10)
            check(condition()) { "SETTLEMENT_DEADLINE" }
        }
        fun test(name: String, action: () -> Unit) {
            if (abortSuite) return
            val row = JSONObject().put("name", name)
            try { check(RuntimeProbe.idle()); action(); row.put("status", "pass") }
            catch (error: Exception) { row.put("status", "fail").put("error", error.toString()) }
            finally {
                try {
                    RuntimeProbe.cancel()
                    targetContext.stopService(Intent(targetContext, RuntimeService::class.java))
                    val cleanups = owned.map { it.stop() }
                    row.put("cleanup", JSONArray(cleanups))
                    check(cleanups.all { it.getBoolean("trackedExitVerified") })
                    await(4000) {
                        val last = owned.lastOrNull()
                        RuntimeProbe.idle() || RuntimeProbe.clearSettled(last)
                    }
                    check(RuntimeProbe.idle())
                    owned.clear()
                } catch (error: Exception) {
                    row.put("status", "fail").put("settlementError", error.toString())
                    abortSuite = true
                }
                results.put(row)
            }
        }
        fun launch(name: String, publish: (OwnedProcess, () -> Unit) -> Unit = { _, release -> release() }): Pair<java.lang.Process, OwnedProcess> {
            val pair = OwnedProcess.launch(ProcessBuilder("/system/bin/sleep", "30"), File(directory, "$name.pid"), publish)
            owned.add(pair.second)
            return pair
        }
        test("atomic-owner-publication-and-gate-release") {
            val entered = CountDownLatch(1); val allowRelease = CountDownLatch(1); val attempted = CountDownLatch(1)
            val returned = AtomicBoolean(false); val failure = AtomicReference<Throwable?>()
            val pair = AtomicReference<Pair<java.lang.Process, OwnedProcess>>()
            val launcher = Thread {
                try { pair.set(launch("atomic") { owner, release -> RuntimeProbe.publish(owner) {
                    entered.countDown(); check(allowRelease.await(2, TimeUnit.SECONDS)); release()
                } }) } catch (error: Throwable) { failure.set(error) }
            }.apply { start() }
            var stopper: Thread? = null
            try {
                check(entered.await(2, TimeUnit.SECONDS))
                stopper = Thread { attempted.countDown(); RuntimeProbe.cancel(); returned.set(true) }.apply { start() }
                check(attempted.await(1, TimeUnit.SECONDS))
                await(1000) { stopper.state == Thread.State.BLOCKED || returned.get() }
                check(stopper.state == Thread.State.BLOCKED && !returned.get()) { "STOP_RETURNED_BEFORE_RELEASE" }
                check(!File(directory, "atomic.pid.ready").exists())
                allowRelease.countDown(); launcher.join(2000); stopper.join(2000)
                check(!launcher.isAlive && !stopper.isAlive && returned.get())
                failure.get()?.let { throw IllegalStateException("LAUNCH_FAILED", it) }
                repeat(20) { RuntimeProbe.cancel() }
                check(Thread.getAllStackTraces().keys.count { it.isAlive && it.name == "m2-probe-cleanup" } <= 1)
                check(pair.get().first.waitFor(2, TimeUnit.SECONDS))
            } finally {
                allowRelease.countDown(); launcher.join(2500); stopper?.join(2500)
                check(!launcher.isAlive && stopper?.isAlive != true) { "INTERLEAVING_THREADS_UNSETTLED" }
                pair.get()?.second?.stop()
            }
        }
        test("cancel-before-launch-gate") {
            val effect = File(directory, "gate-effect")
            val pair = OwnedProcess.launch(ProcessBuilder("/system/bin/sh", "-c", "echo UNEXPECTED > \"$1\"", "effect", effect.path), File(directory, "gate.pid")) { owner, _ -> owner.stop() }
            owned.add(pair.second)
            check(pair.first.waitFor(2, TimeUnit.SECONDS) && !effect.exists())
            check(pair.second.stop().getBoolean("trackedExitVerified"))
            check(pair.second.stop().getJSONArray("owned").length() > 0)
        }
        test("immediate-stop-after-root-ownership") {
            val pair = launch("immediate")
            check(pair.second.stop().getBoolean("trackedExitVerified"))
            check(pair.first.waitFor(2, TimeUnit.SECONDS))
        }
        fun probe(name: String, suppress: Boolean = false, deadlineFailure: Boolean = false): JSONObject {
            val attempt = "m3-$name-${System.currentTimeMillis()}"
            val probes = File(targetContext.filesDir, "m2").apply { mkdirs() }
            val effect = File(directory, "$name-effect")
            File(probes, "$attempt.sh").writeText("#!/system/bin/sh\nsleep 15\necho UNEXPECTED > '${effect.path}'\n")
            val deadline = File(probes, "$attempt.deadline-seconds")
            if (deadlineFailure) check(deadline.mkdir()) else deadline.writeText("30\n")
            if (suppress) {
                val service = object : android.app.Service() {
                    init { attachBaseContext(targetContext) }
                    override fun onBind(intent: Intent?): android.os.IBinder? = null
                }
                synchronized(RuntimeProbe) { RuntimeProbe.run(service, attempt); RuntimeProbe.cancel() }
            } else {
                targetContext.startForegroundService(Intent(targetContext, RuntimeService::class.java).setAction("probe").putExtra("attempt", attempt))
            }
            val receipt = File(probes, "$attempt.json")
            if (!suppress && !deadlineFailure) {
                await(3000) { File(probes, "$attempt.pid").exists() }
                check(targetContext.stopService(Intent(targetContext, RuntimeService::class.java)))
            }
            await(7000) { receipt.exists() }
            val report = JSONObject(receipt.readText())
            check(report.getBoolean("launchIdle") && report.getBoolean("cleanupVerified"))
            check(RuntimeProbe.idle() && !effect.exists())
            return report
        }
        test("probe-stop-before-owned-assignment") {
            val report = probe("startup", suppress = true)
            check(report.getBoolean("cancelRequested") && report.getBoolean("launchSuppressed"))
        }
        test("probe-post-launch-exception") {
            val report = probe("exception", deadlineFailure = true)
            check(report.has("error"))
            check(report.getJSONObject("finalOwnershipCleanup").getBoolean("trackedExitVerified"))
        }
        test("probe-service-teardown-during-startup") {
            val report = probe("teardown")
            check(report.getBoolean("cancelRequested") && report.getBoolean("rootExitObserved"))
            check(report.getJSONObject("finalOwnershipCleanup").getBoolean("trackedExitVerified"))
        }
        val report = JSONObject().put("at", System.currentTimeMillis()).put("cases", results)
            .put("suiteAbortedForUnsettledState", abortSuite).put("modelRequests", 0).put("directory", directory.path)
        File(directory, "results.json").writeText(report.toString(2))
        finish(if (!abortSuite && results.length() == 6 && (0 until results.length()).all { results.getJSONObject(it).getString("status") == "pass" }) -1 else 0,
            Bundle().apply { putString("stream", report.toString(2)); putString("receipt", File(directory, "results.json").path) })
    }
}
