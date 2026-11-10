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
    @Synchronized fun run(service: Service, attempt: String) {
        if (running || !attempt.matches(Regex("[a-z0-9-]{1,64}"))) return
        val script = File(service.filesDir, "m2/$attempt.sh")
        if (!script.isFile) return
        running = true
        Thread({
            val report = JSONObject().put("attempt", attempt).put("startedAtMs", System.currentTimeMillis())
                .put("package", service.packageName).put("hostPid", Process.myPid()).put("hostRealUid", Process.myUid())
                .put("hostDomain", File("/proc/self/attr/current").readText().trim())
                .put("hostStat", File("/proc/self/stat").readText().trim())
                .put("targetSdk", service.applicationInfo.targetSdkVersion).put("androidApi", Build.VERSION.SDK_INT)
                .put("abis", Build.SUPPORTED_ABIS.joinToString(",")).put("nativeLibraryDir", service.applicationInfo.nativeLibraryDir)
            try {
                val child = ProcessBuilder("/system/bin/sh", script.absolutePath).apply {
                    directory(service.filesDir)
                    environment()["OLEA_NATIVE_DIR"] = service.applicationInfo.nativeLibraryDir
                    environment()["OLEA_APP_BASE"] = service.filesDir.absolutePath
                }.start()
                // Android's public java.lang.Process API does not expose a child PID.
                report.put("childPid", JSONObject.NULL)
                val output = StringBuilder()
                val errors = StringBuilder()
                fun drain(source: java.io.InputStream, target: StringBuilder) = Thread {
                    source.bufferedReader().use { reader ->
                        val buffer = CharArray(4096)
                        while (true) { val count = reader.read(buffer); if (count < 0) break
                            synchronized(target) { if (target.length < 524288) target.append(buffer, 0, minOf(count, 524288 - target.length)) }
                        }
                    }
                }.apply { start() }
                val stdout = drain(child.inputStream, output)
                val stderr = drain(child.errorStream, errors)
                val exited = child.waitFor(240, TimeUnit.SECONDS)
                if (!exited) child.destroyForcibly()
                stdout.join(2000); stderr.join(2000)
                report.put("timedOut", !exited).put("exitCode", if (exited) child.exitValue() else JSONObject.NULL)
                    .put("stdout", output.toString()).put("stderr", errors.toString())
            } catch (error: Exception) { report.put("error", error.toString().take(1024)) }
            report.put("endedAtMs", System.currentTimeMillis())
            File(service.filesDir, "m2/$attempt.json").writeText(report.toString(2))
            running = false
        }, "m2-runtime-probe").start()
    }
}
