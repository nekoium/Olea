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
    private var selected: String? = null
    override fun onCreate(arguments: Bundle?) { selected = arguments?.getString("case"); super.onCreate(arguments); start() }
    override fun onStart() {
        if (selected == "ownership" || selected == "short-exits") { ownership(); return }
        if (selected == "consolidation") { consolidation(); return }
        if (selected == "codex") { codex(); return }
        if (selected == "phone") { phone(); return }
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
            if (selected == "fresh") {
                check(RuntimeService.current == null) { "Fresh validation requires a stopped runtime" }
                val stamp = System.currentTimeMillis()
                val rootfs = File(base, "runtime/rootfs")
                val retained = File(base, "runtime/rootfs-retained-$stamp")
                check(rootfs.isDirectory && rootfs.renameTo(retained)) { "Cannot retain existing rootfs; fresh validation refused" }
                val ready = File(base, "runtime/ready")
                if (ready.exists()) check(ready.renameTo(File(base, "runtime/ready-retained-$stamp")))
                receipt.put("preservedRootfs", retained.path)
            }
            startActivitySync(Intent(targetContext, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
            await(10) { RuntimeService.current != null }
            val reservation = File(base, "data/sessions/conversation/resume.json")
            val reservationBefore = if (reservation.isFile) reservation.readText() else null
            if (selected == "reopen") {
                await(10) { RuntimeService.current!!.transcript().contains("preserved workspace") }
                check(!RuntimeService.conversationReady) { "Reopening unexpectedly started execution" }
                receipt.put("coldDisplayReopen", "pass")
            }
            RuntimeService.current!!.startEnvironment()
            await(1100) { RuntimeService.conversationReady || (!RuntimeService.busy && RuntimeService.status != "Environment stopped") }
            check(RuntimeService.conversationReady) { RuntimeService.status }
            receipt.put("environmentAndStockRpc", "pass")
            if (selected == "reopen") {
                check(reservationBefore != null && reservation.readText() == reservationBefore) { "Session reservation changed after reinstall" }
                receipt.put("savedReservationAfterApkUpdate", "pass")
                success = true
                return
            }
            val marker = "core-check-${System.currentTimeMillis()}.txt"
            RuntimeService.current!!.workspace("printf 'preserved workspace\\n' > $marker; cat $marker")
            await(130) { !RuntimeService.busy }
            val workspace = File(base, "data/workspace/$marker")
            check(workspace.readText() == "preserved workspace\n")
            val resume = File(base, "data/sessions/conversation/resume.json")
            check(resume.isFile)
            val saved = JSONObject(resume.readText()).getString("sessionFile")
            val transcript = File(base, "data/sessions/conversation/" + saved.substringAfterLast('/'))
            val canonicalExists = transcript.isFile
            val workspaceBefore = digest(workspace)
            val transcriptBeforeBytes = if (canonicalExists) transcript.readBytes() else byteArrayOf()
            val transcriptBefore: Any = if (canonicalExists) digest(transcript) else JSONObject.NULL
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
            // Stock Pi does not flush shell-only history before a user/assistant message.
            if (canonicalExists) check(transcript.readBytes().take(transcriptBeforeBytes.size).toByteArray().contentEquals(transcriptBeforeBytes))
            check(RuntimeService.current!!.transcript().contains("preserved workspace")) { "Saved workspace history was not rendered" }
            receipt.put("sameSessionFileReservation", "pass").put("displayHistoryReopen", "pass").put("workspaceSha256", workspaceBefore)
                .put("canonicalTranscript", if (canonicalExists) "preserved_prefix" else "not_created_before_chat")
                .put("transcriptBeforeStopSha256", transcriptBefore).put("transcriptAfterReopenSha256", if (transcript.isFile) digest(transcript) else JSONObject.NULL)
            success = true
        } catch (error: Exception) { receipt.put("failure", error.message).put("status", RuntimeService.status) }
        finally {
            RuntimeService.current?.stopExecution()
            runCatching { await(15) { !RuntimeService.busy } }.onFailure { success = false; receipt.put("cleanupError", it.message) }
            receipt.put("finalStatus", RuntimeService.status).put("passed", success)
            val cleanupFailure = File(base, "last-cleanup-failure.json")
            if (cleanupFailure.isFile) receipt.put("retainedEarlierCleanupFailure", JSONObject(cleanupFailure.readText()))
            val destination = File(base, "core-check-${System.currentTimeMillis()}.json")
            destination.writeText(receipt.toString(2))
            finish(if (success) -1 else 0, Bundle().apply { putString("stream", receipt.toString(2)); putString("receipt", destination.path) })
        }
    }

    private fun consolidation() {
        val receipt = JSONObject().put("providerRequests", 0)
        var success = false
        fun await(seconds: Int, condition: () -> Boolean) {
            val deadline = SystemClock.elapsedRealtime() + seconds * 1000L
            while (!condition() && SystemClock.elapsedRealtime() < deadline) Thread.sleep(100)
            check(condition()) { "Deadline: ${RuntimeService.status}" }
        }
        try {
            startActivitySync(Intent(targetContext, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
            await(10) { RuntimeService.current != null }
            val runtime = RuntimeService.current!!
            runtime.selectConversation("conversation")
            runtime.startEnvironment()
            await(120) { RuntimeService.conversationReady || !RuntimeService.busy }
            check(RuntimeService.conversationReady) { RuntimeService.status }
            val first = runtime.activeConversation()
            val workspace = runtime.store.createWorkspace("Integration ${System.currentTimeMillis()}")
            val second = runtime.store.createConversation("Second Pi", "pi", workspace.id)
            runtime.selectConversation(second.id)
            check(!RuntimeService.conversationReady)
            runtime.startEnvironment()
            await(80) { RuntimeService.conversationReady || !RuntimeService.busy }
            check(RuntimeService.conversationReady) { RuntimeService.status }
            runtime.workspace("printf 'separate workspace\\n' > separation.txt; cat separation.txt")
            await(130) { !RuntimeService.busy }
            check(File(runtime.store.workspaceFile(workspace), "separation.txt").readText() == "separate workspace\n")
            check(!File(targetContext.filesDir, "data/workspace/separation.txt").exists())
            runtime.selectConversation(first.id)
            check(RuntimeService.conversationReady) { "First session was not retained" }
            runtime.selectConversation(second.id)
            check(runtime.transcript().contains("separate workspace"))
            receipt.put("twoStockPiSessions", "pass").put("separateWorkspace", "pass").put("selectionWithoutReplay", "pass")
            val started = "cancel-started-${System.currentTimeMillis()}"
            val effect = "cancel-effect-${System.currentTimeMillis()}"
            runtime.workspace("echo started > $started; sleep 5; echo unexpected > $effect")
            await(10) { File(runtime.store.workspaceFile(workspace), started).isFile }
            runtime.cancelTurn()
            await(15) { !RuntimeService.busy }
            check(RuntimeService.conversationReady) { "Cancel shut down the session" }
            Thread.sleep(5200)
            check(!File(runtime.store.workspaceFile(workspace), effect).exists())
            check(!runtime.prompt("x".repeat(32001))) { "Oversized draft accepted" }
            receipt.put("cancelShellKeepsSessionAndPreventsEffect", "pass").put("oversizedDraftRejected", "pass")
            val config = JSONObject(File(targetContext.filesDir, "phone/config.json").readText())
            fun phone(authorization: Boolean, operation: String): Int {
                val url = java.net.URI(config.getString("url"))
                val body = JSONObject().put("id", "integration").put("operation", operation).put("args", JSONObject()).toString().toByteArray()
                return java.net.Socket("127.0.0.1", url.port).use { socket ->
                    socket.soTimeout = 5000
                    val headers = "POST /phone HTTP/1.1\r\nHost: 127.0.0.1\r\nContent-Type: application/json\r\nContent-Length: ${body.size}\r\n" +
                        (if (authorization) "Authorization: Bearer ${config.getString("token")}\r\n" else "") + "\r\n"
                    socket.getOutputStream().apply { write(headers.toByteArray()); write(body); flush() }
                    socket.getInputStream().bufferedReader().readLine().split(' ')[1].toInt()
                }
            }
            check(phone(false, "capabilities") == 401)
            check(phone(true, "capabilities") == 200)
            check(phone(true, "global_action") != 200)
            receipt.put("bridgeAuthenticationAndDisabledEffects", "pass")
            runtime.stopExecution()
            await(20) { !RuntimeService.busy }
            check(!RuntimeService.conversationReady)
            check(SessionStore(targetContext.filesDir).active().id == second.id)
            receipt.put("stopAndSelectionPersistence", "pass")
            runtime.selectConversation(first.id)
            success = true
        } catch (error: Exception) { receipt.put("failure", error.message).put("status", RuntimeService.status) }
        finally {
            RuntimeService.current?.stopExecution()
            runCatching { await(20) { !RuntimeService.busy } }.onFailure { success = false; receipt.put("cleanupFailure", it.message) }
            receipt.put("passed", success).put("finalStatus", RuntimeService.status)
            val destination = File(targetContext.filesDir, "consolidation-check-${System.currentTimeMillis()}.json")
            destination.writeText(receipt.toString(2))
            finish(if (success) -1 else 0, Bundle().apply { putString("stream", receipt.toString(2)); putString("receipt", destination.path) })
        }
    }

    private fun codex() {
        val receipt = JSONObject().put("providerRequests", 0).put("stockAgent", "Codex")
        var success = false
        fun await(seconds: Int, condition: () -> Boolean) {
            val deadline = SystemClock.elapsedRealtime() + seconds * 1000L
            while (!condition() && SystemClock.elapsedRealtime() < deadline) Thread.sleep(100)
            check(condition()) { "Deadline: ${RuntimeService.status}" }
        }
        try {
            startActivitySync(Intent(targetContext, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
            await(10) { RuntimeService.current != null }
            val runtime = RuntimeService.current!!
            runtime.maintainAgent("codex", "install")
            await(620) { !RuntimeService.busy }
            check(RuntimeService.status.contains("complete")) { RuntimeService.status }
            receipt.put("upstreamInstall", "pass")
            val info = runtime.store.createConversation("Codex check", "codex", "default")
            runtime.selectConversation(info.id)
            runtime.startEnvironment()
            await(90) { RuntimeService.conversationReady || !RuntimeService.busy }
            check(RuntimeService.conversationReady) { RuntimeService.status }
            receipt.put("stockAppServerStart", "pass")
            val thread = File(targetContext.filesDir, "data/sessions/codex/${info.id}/thread.json")
            val identity = JSONObject(thread.readText()).getString("threadId")
            val marker = "codex-check-${System.currentTimeMillis()}.txt"
            runtime.workspace("printf 'codex local shell\\n' > $marker; cat $marker")
            await(130) { !RuntimeService.busy }
            check(File(targetContext.filesDir, "data/workspace/$marker").readText() == "codex local shell\n")
            check(runtime.transcript().contains("codex local shell"))
            receipt.put("directWorkspaceExec", "pass")
            runtime.stopExecution(); await(20) { !RuntimeService.busy }
            runtime.startEnvironment(); await(90) { RuntimeService.conversationReady || !RuntimeService.busy }
            check(RuntimeService.conversationReady) { RuntimeService.status }
            check(JSONObject(thread.readText()).getString("threadId") == identity)
            receipt.put("sameThreadReopenWithoutPrompt", "pass")
            runtime.stopExecution(); await(20) { !RuntimeService.busy }
            runtime.selectConversation("conversation")
            success = true
        } catch (error: Exception) { receipt.put("failure", error.message).put("status", RuntimeService.status) }
        finally {
            RuntimeService.current?.stopExecution()
            runCatching { await(20) { !RuntimeService.busy } }.onFailure { success = false; receipt.put("cleanupFailure", it.message) }
            receipt.put("passed", success).put("finalStatus", RuntimeService.status)
            val destination = File(targetContext.filesDir, "codex-check-${System.currentTimeMillis()}.json")
            destination.writeText(receipt.toString(2))
            finish(if (success) -1 else 0, Bundle().apply { putString("stream", receipt.toString(2)); putString("receipt", destination.path) })
        }
    }

    private fun phone() {
        val receipt = JSONObject().put("providerRequests", 0)
        var success = false
        fun await(seconds: Int, condition: () -> Boolean) {
            val deadline = SystemClock.elapsedRealtime() + seconds * 1000L
            while (!condition() && SystemClock.elapsedRealtime() < deadline) Thread.sleep(100)
            check(condition()) { "Phone check deadline" }
        }
        try {
            startActivitySync(Intent(targetContext, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
            await(10) { PhoneBridge.current != null }
            val bridge = PhoneBridge.current!!
            bridge.setEnabled(true)
            val config = JSONObject(bridge.configFile.readText())
            fun call(operation: String, args: JSONObject = JSONObject()): JSONObject {
                val url = java.net.URI(config.getString("url"))
                val body = JSONObject().put("id", "phone-integration").put("operation", operation).put("args", args).toString().toByteArray()
                return java.net.Socket("127.0.0.1", url.port).use { socket ->
                    socket.soTimeout = 12000
                    socket.getOutputStream().apply { write(("POST /phone HTTP/1.1\r\nHost: localhost\r\nAuthorization: Bearer ${config.getString("token")}\r\nContent-Length: ${body.size}\r\n\r\n").toByteArray()); write(body); flush() }
                    val reader = socket.getInputStream().bufferedReader()
                    reader.readLine()
                    while (reader.readLine().isNotEmpty()) { }
                    JSONObject(reader.readText())
                }
            }
            check(call("capabilities").getJSONObject("result").getBoolean("phoneEnabled"))
            val request = call("capture_request").getJSONObject("result").getString("requestId")
            check(call("capture_result", JSONObject().put("requestId", request)).getBoolean("ok"))
            // The manager drives the normal button/SystemUI consent during this finite wait.
            var metadata = JSONObject()
            await(180) {
                metadata = call("capture_result", JSONObject().put("requestId", request)).optJSONObject("result") ?: JSONObject()
                metadata.optString("status") == "ready"
            }
            val png = File(bridge.directory, metadata.getString("fileName"))
            check(png.isFile && png.length() > 100)
            check(android.graphics.BitmapFactory.decodeFile(png.path) != null)
            receipt.put("normalConsentCapture", "pass").put("capture", metadata)
            val second = bridge.beginCapture()
            bridge.stop()
            check(!call("capture_result", JSONObject().put("requestId", second)).getBoolean("ok"))
            check(!call("open_url", JSONObject().put("url", "https://example.org")).getBoolean("ok"))
            receipt.put("stopInvalidatesCaptureAndEffects", "pass")
            success = true
        } catch (error: Exception) { receipt.put("failure", error.message) }
        finally {
            PhoneBridge.current?.stop()
            RuntimeService.current?.stopExecution()
            receipt.put("passed", success)
            val destination = File(targetContext.filesDir, "phone-check-${System.currentTimeMillis()}.json")
            destination.writeText(receipt.toString(2))
            finish(if (success) -1 else 0, Bundle().apply { putString("stream", receipt.toString(2)); putString("receipt", destination.path) })
        }
    }

    private fun ownership() {
        val directory = File(targetContext.filesDir, "ownership-${System.currentTimeMillis()}").apply { mkdirs() }
        val receipt = JSONObject().put("providerRequests", 0)
        var owner: OwnedProcess? = null
        var success = false
        try {
            if (selected == "short-exits") {
                val results = org.json.JSONArray()
                repeat(10) { index ->
                    val pair = OwnedProcess.launch(ProcessBuilder("/system/bin/true"), File(directory, "short-$index.pid"))
                    owner = pair.second
                    check(pair.first.waitFor(2, java.util.concurrent.TimeUnit.SECONDS) && pair.first.exitValue() == 0)
                    val result = pair.second.stop()
                    results.put(result)
                    receipt.put("shortExitCleanups", results)
                    check(result.getBoolean("trackedExitVerified")) { "Short process exit race failed" }
                }
            } else {
                val pair = OwnedProcess.launch(ProcessBuilder("/system/bin/sh", "-c", "i=0; while [ ${'$'}i -lt 300 ]; do /system/bin/sleep 0.15; i=${'$'}((i+1)); done"), File(directory, "root.pid"))
                owner = pair.second
                check(pair.first.waitFor(75, java.util.concurrent.TimeUnit.SECONDS)) { "Ownership reproduction timed out" }
                val result = owner.stop()
                receipt.put("cleanup", result)
                check(result.getBoolean("trackedExitVerified")) { "Ownership cleanup failed" }
                check(result.getInt("observedIdentities") > 256) { "Reproduction did not observe enough sequential children" }
            }
            success = true
        } catch (error: Exception) { receipt.put("error", error.message) }
        finally {
            owner?.stop()
            receipt.put("passed", success)
            File(directory, "receipt.json").writeText(receipt.toString(2))
            finish(if (success) -1 else 0, Bundle().apply { putString("stream", receipt.toString(2)) })
        }
    }
}
