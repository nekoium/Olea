package dev.olea.spike

import android.app.Service
import android.os.Build
import android.os.Process
import org.json.JSONObject
import java.io.File
import java.util.concurrent.TimeUnit

// Disposable native runner: provisioning stages a named script; Activity only selects its attempt ID.
object RuntimeProbe {
    @Volatile private var running = false
    @Volatile private var owned: OwnedProcess? = null
    @Volatile private var cancelRequested = false
    private var cleanupThread: Thread? = null
    private fun requestCleanup() {
        val current = owned ?: return
        if (cleanupThread?.isAlive == true) return
        cleanupThread = Thread({ current.stop() }, "m2-probe-cleanup").apply { start() }
    }
    @Synchronized internal fun clearSettled(supervisor: OwnedProcess?, finishing: Boolean = false): Boolean {
        if ((running && !finishing) || owned !== supervisor || cleanupThread?.isAlive == true) return false
        if (supervisor != null && !supervisor.result().getBoolean("trackedExitVerified")) return false
        owned = null; running = false; cancelRequested = false; cleanupThread = null
        return true
    }
    @Synchronized internal fun idle() = !running && owned == null && cleanupThread?.isAlive != true
    internal fun cleanupWithoutOwner(suppressed: Boolean, failure: OwnedProcess.LaunchFailure?) =
        suppressed || failure?.directChildExitObserved == true
    @Synchronized internal fun publish(supervisor: OwnedProcess, release: () -> Unit) {
        owned = supervisor
        if (cancelRequested) requestCleanup() else release()
    }
    @Synchronized fun cancel() {
        if (!running && owned == null) return
        cancelRequested = true
        requestCleanup()
    }
    @Synchronized fun run(service: Service, attempt: String) {
        if (running || owned != null || !attempt.matches(Regex("[a-z0-9-]{1,64}"))) return
        val script = File(service.filesDir, "m2/$attempt.sh")
        if (!script.isFile) return
        cancelRequested = false
        owned = null
        cleanupThread = null
        running = true
        Thread({
            val report = JSONObject().put("attempt", attempt).put("startedAtMs", System.currentTimeMillis())
                .put("package", service.packageName).put("hostPid", Process.myPid()).put("hostRealUid", Process.myUid())
                .put("hostDomain", runCatching { File("/proc/self/attr/current").readText().trim() }.getOrElse { "unavailable:${it.javaClass.simpleName}" })
                .put("hostStat", runCatching { File("/proc/self/stat").readText().trim() }.getOrElse { "unavailable:${it.javaClass.simpleName}" })
                .put("targetSdk", service.applicationInfo.targetSdkVersion).put("androidApi", Build.VERSION.SDK_INT)
                .put("abis", Build.SUPPORTED_ABIS.joinToString(",")).put("nativeLibraryDir", service.applicationInfo.nativeLibraryDir)
            var launchOwner: OwnedProcess? = null
            var failedStart: OwnedProcess.LaunchFailure? = null
            try {
                val cancelledBeforeLaunch = synchronized(this) { cancelRequested }
                if (cancelledBeforeLaunch) {
                    report.put("launchSuppressed", true)
                    return@Thread
                }
                val (child, supervisor) = OwnedProcess.launch(ProcessBuilder("/system/bin/sh", script.absolutePath).apply {
                    directory(service.filesDir)
                    environment()["OLEA_NATIVE_DIR"] = service.applicationInfo.nativeLibraryDir
                    environment()["OLEA_APP_BASE"] = service.filesDir.absolutePath
                }, File(service.filesDir, "m2/$attempt.pid")) { supervisor, release -> publish(supervisor, release) }
                launchOwner = supervisor
                report.put("childPid", JSONObject.NULL)
                val output = java.io.ByteArrayOutputStream()
                val errors = java.io.ByteArrayOutputStream()
                val totals = LongArray(2)
                val drainFaults = arrayOfNulls<String>(2)
                fun drain(source: java.io.InputStream, target: java.io.ByteArrayOutputStream, index: Int) = Thread {
                    try { source.use { input ->
                        val buffer = ByteArray(4096)
                        while (true) { val count = input.read(buffer); if (count < 0) break
                            totals[index] += count
                            synchronized(target) { if (target.size() < 65536) target.write(buffer, 0, minOf(count, 65536 - target.size())) }
                        }
                    } } catch (error: java.io.IOException) { drainFaults[index] = error.javaClass.simpleName }
                }.apply { start() }
                val stdout = drain(child.inputStream, output, 0)
                val stderr = drain(child.errorStream, errors, 1)
                val deadline = File(service.filesDir, "m2/$attempt.deadline-seconds").takeIf { it.exists() }
                    ?.readText()?.trim()?.toLongOrNull()?.coerceIn(1, 240) ?: 240
                report.put("deadlineSeconds", deadline)
                val exited = child.waitFor(deadline, TimeUnit.SECONDS)
                val cleanup = supervisor.stop()
                report.put("ownershipCleanup", cleanup)
                if (child.isAlive) child.waitFor(2, TimeUnit.SECONDS)
                stdout.join(2000); stderr.join(2000)
                val inheritedPipes = stdout.isAlive || stderr.isAlive
                if (inheritedPipes) {
                    runCatching { child.inputStream.close() }; runCatching { child.errorStream.close() }
                    stdout.join(500); stderr.join(500)
                }
                report.put("rootExitObserved", !child.isAlive).put("inheritedPipesAfterJoin", inheritedPipes)
                report.put("timedOut", !exited).put("exitCode", if (exited) child.exitValue() else JSONObject.NULL)
                    .put("stdout", synchronized(output) { output.toString("UTF-8") })
                    .put("stderr", synchronized(errors) { errors.toString("UTF-8") })
                    .put("stdoutObservedBytes", totals[0]).put("stderrObservedBytes", totals[1])
                    .put("stdoutRetainedBytes", output.size()).put("stderrRetainedBytes", errors.size())
                    .put("outputTruncated", totals[0] > output.size() || totals[1] > errors.size())
                    .put("drainersStillAlive", stdout.isAlive || stderr.isAlive)
                    .put("stdoutDrainFault", drainFaults[0] ?: JSONObject.NULL)
                    .put("stderrDrainFault", drainFaults[1] ?: JSONObject.NULL)
                    .put("descendantExitVerified", cleanup.getBoolean("trackedExitVerified"))
                    .put("timeoutCleanupLimit", "Bounded tracked numeric UID/starttime cleanup; unseen forks require independent observation")
            } catch (error: Exception) {
                if (error is OwnedProcess.LaunchFailure) {
                    failedStart = error
                    report.put("failedStart", JSONObject().put("directChildExitObserved", error.directChildExitObserved)
                        .put("gateNeverReleased", error.gateNeverReleased))
                }
                report.put("error", error.toString().take(1024))
            }
            finally {
                launchOwner = launchOwner ?: synchronized(this) { owned }
                var cleanupSettled = cleanupWithoutOwner(report.optBoolean("launchSuppressed"), failedStart)
                try {
                    launchOwner?.let { supervisor ->
                        val cleanup = supervisor.stop()
                        report.put("finalOwnershipCleanup", cleanup)
                        cleanupSettled = cleanup.getBoolean("trackedExitVerified")
                    }
                    synchronized(this) { cleanupThread }?.join(2000)
                } catch (error: Exception) {
                    cleanupSettled = false
                    report.put("finalCleanupError", error.javaClass.simpleName).put("descendantExitVerified", false)
                }
                try {
                    report.put("endedAtMs", System.currentTimeMillis()).put("cancelRequested", cancelRequested)
                    val receipt = File(service.filesDir, "m2/$attempt.json")
                    val temporary = File(receipt.path + ".partial")
                    synchronized(this) {
                        val cleared = cleanupSettled && clearSettled(launchOwner, finishing = true)
                        report.put("launchIdle", cleared).put("cleanupVerified", cleanupSettled)
                        temporary.writeText(report.toString(2))
                        check(temporary.renameTo(receipt)) { "RECEIPT_PUBLICATION_FAILED" }
                    }
                } catch (error: Exception) {
                    android.util.Log.e("OleaM2Probe", "Receipt publication failed: ${error.javaClass.simpleName}")
                }
            }
        }, "m2-runtime-probe").start()
    }
}
