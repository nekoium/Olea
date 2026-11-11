package dev.olea.app

import android.app.Instrumentation
import android.content.Intent
import android.os.Bundle
import android.os.SystemClock
import org.json.JSONObject
import java.io.File
import java.security.MessageDigest

// Finite real stock RPC/STOP/persistence check. No prompt command or provider credentials.
class CoreInstrumentation : Instrumentation() {
    override fun onCreate(arguments: Bundle?) { super.onCreate(arguments); start() }
    override fun onStart() {
        val receipt = JSONObject().put("providerRequests", 0).put("stockAgent", "Pi")
        val base = targetContext.filesDir
        fun await(seconds: Int, condition: () -> Boolean) {
            val deadline = SystemClock.elapsedRealtime() + seconds * 1000L
            var nextReport = SystemClock.elapsedRealtime()
            while (!condition() && SystemClock.elapsedRealtime() < deadline) {
                if (SystemClock.elapsedRealtime() >= nextReport) {
                    sendStatus(1, Bundle().apply { putString("stream", RuntimeService.status + "\n") })
                    nextReport = SystemClock.elapsedRealtime() + 10000
                }
                Thread.sleep(100)
            }
            check(condition()) { "Deadline: ${RuntimeService.status}" }
        }
        fun digest(file: File) = MessageDigest.getInstance("SHA-256").digest(file.readBytes()).joinToString("") { "%02x".format(it) }
        var success = false
        try {
            startActivitySync(Intent(targetContext, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
            await(10) { RuntimeService.current != null }
            RuntimeService.current!!.startEnvironment()
            await(1100) { RuntimeService.conversationReady || (!RuntimeService.busy && RuntimeService.status != "Environment stopped") }
            check(RuntimeService.conversationReady) { RuntimeService.status }
            receipt.put("environmentAndStockRpc", "pass")
            val marker = "core-check-${System.currentTimeMillis()}.txt"
            RuntimeService.current!!.workspace("printf 'preserved workspace\\n' > $marker; cat $marker")
            await(130) { !RuntimeService.busy }
            val workspace = File(base, "data/workspace/$marker")
            check(workspace.readText() == "preserved workspace\n")
            val resume = File(base, "data/sessions/conversation/resume.json")
            check(resume.isFile)
            val saved = JSONObject(resume.readText()).getString("sessionFile")
            val transcript = File(base, "data/sessions/conversation/" + saved.substringAfterLast('/'))
            check(transcript.isFile)
            val workspaceBefore = digest(workspace)
            val transcriptBeforeBytes = transcript.readBytes()
            val transcriptBefore = digest(transcript)
            receipt.put("workspaceTool", "pass").put("workspaceFile", marker).put("savedSession", saved)
            val effect = "must-not-appear-${System.currentTimeMillis()}.txt"
            val started = "stop-started-${System.currentTimeMillis()}.txt"
            RuntimeService.current!!.workspace("echo started > $started; sleep 8; echo unexpected > $effect")
            await(10) { File(base, "data/workspace/$started").isFile }
            RuntimeService.current!!.stopExecution()
            await(15) { !RuntimeService.busy }
            check(RuntimeService.status.startsWith("Stopped.")) { RuntimeService.status }
            Thread.sleep(8500)
            check(!File(base, "data/workspace/$effect").exists())
            receipt.put("stopNoDelayedEffect", "pass")
            RuntimeService.current!!.startEnvironment()
            await(80) { RuntimeService.conversationReady || !RuntimeService.busy }
            check(RuntimeService.conversationReady) { RuntimeService.status }
            check(JSONObject(resume.readText()).getString("sessionFile") == saved)
            check(digest(workspace) == workspaceBefore)
            // A bash interruption may append to history; require the pre-STOP transcript prefix.
            check(transcript.readBytes().take(transcriptBeforeBytes.size).toByteArray().contentEquals(transcriptBeforeBytes))
            receipt.put("sameSessionReopen", "pass").put("workspaceSha256", workspaceBefore)
                .put("transcriptBeforeStopSha256", transcriptBefore).put("transcriptAfterReopenSha256", digest(transcript))
            success = true
        } catch (error: Exception) { receipt.put("failure", error.message).put("status", RuntimeService.status) }
        finally {
            RuntimeService.current?.stopExecution()
            runCatching { await(15) { !RuntimeService.busy } }.onFailure { success = false; receipt.put("cleanupError", it.message) }
            receipt.put("finalStatus", RuntimeService.status).put("passed", success)
            val destination = File(base, "core-check-${System.currentTimeMillis()}.json")
            destination.writeText(receipt.toString(2))
            finish(if (success) -1 else 0, Bundle().apply { putString("stream", receipt.toString(2)); putString("receipt", destination.path) })
        }
    }
}
