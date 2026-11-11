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
        fun test(name: String, action: () -> Unit) {
            try { action(); results.put(JSONObject().put("name", name).put("status", "pass")) }
            catch (error: Exception) { results.put(JSONObject().put("name", name).put("status", "fail").put("error", error.toString())) }
        }
        test("cancel-before-launch-gate") {
            val effect = File(directory, "gate-effect")
            val (child, owner) = OwnedProcess.launch(ProcessBuilder("/system/bin/sh", "-c", "echo UNEXPECTED > \"$1\"", "effect", effect.path), File(directory, "gate.pid")) { false }
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
        val report = JSONObject().put("at", System.currentTimeMillis()).put("cases", results)
            .put("modelRequests", 0).put("directory", directory.path)
        File(directory, "results.json").writeText(report.toString(2))
        finish(if ((0 until results.length()).all { results.getJSONObject(it).getString("status") == "pass" }) -1 else 0,
            Bundle().apply { putString("stream", report.toString(2)); putString("receipt", File(directory, "results.json").path) })
    }
}
