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
    @Synchronized fun cancel() {
        if (!running) return
        cancelRequested = true
        owned?.let { current -> Thread { current.stop() }.start() }
    }
    @Synchronized fun run(service: Service, attempt: String) {
        if (running || !attempt.matches(Regex("[a-z0-9-]{1,64}"))) return
        val script = File(service.filesDir, "m2/$attempt.sh")
        if (!script.isFile) return
        cancelRequested = false
        running = true
        Thread({
            val report = JSONObject().put("attempt", attempt).put("startedAtMs", System.currentTimeMillis())
                .put("package", service.packageName).put("hostPid", Process.myPid()).put("hostRealUid", Process.myUid())
                .put("hostDomain", runCatching { File("/proc/self/attr/current").readText().trim() }.getOrElse { "unavailable:${it.javaClass.simpleName}" })
                .put("hostStat", runCatching { File("/proc/self/stat").readText().trim() }.getOrElse { "unavailable:${it.javaClass.simpleName}" })
                .put("targetSdk", service.applicationInfo.targetSdkVersion).put("androidApi", Build.VERSION.SDK_INT)
                .put("abis", Build.SUPPORTED_ABIS.joinToString(",")).put("nativeLibraryDir", service.applicationInfo.nativeLibraryDir)
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
                }, File(service.filesDir, "m2/$attempt.pid")) { !cancelRequested }
                owned = supervisor
                if (cancelRequested) supervisor.stop()
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
                val deadline = File(service.filesDir, "m2/$attempt.deadline-seconds").takeIf { it.isFile }
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
            } catch (error: Exception) { report.put("error", error.toString().take(1024)) }
            finally {
                try {
                    report.put("endedAtMs", System.currentTimeMillis()).put("cancelRequested", cancelRequested)
                    File(service.filesDir, "m2/$attempt.json").writeText(report.toString(2))
                } catch (error: java.io.IOException) {
                    android.util.Log.e("OleaM2Probe", "Receipt write failed: ${error.javaClass.simpleName}")
                } finally { owned = null; running = false }
            }
        }, "m2-runtime-probe").start()
    }
}
