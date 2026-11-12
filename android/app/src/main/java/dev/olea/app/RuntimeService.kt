package dev.olea.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.os.IBinder
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.util.UUID
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicLong

class RuntimeService : Service() {
    companion object {
        @Volatile var current: RuntimeService? = null
        @Volatile var status = "Environment stopped"
        @Volatile var revision = 0L
        @Volatile var conversationReady = false
        @Volatile var busy = false
    }
    private class Display(val info: ConversationInfo, val lines: ArrayList<String> = ArrayList()) {
        var text = StringBuilder()
        var ready = false
        var working = false
        var opening = false
        var shell = false
    }
    private data class Pending(val session: String, val action: String)
    private val serial = Executors.newSingleThreadExecutor()
    private val generation = AtomicLong()
    private val lock = Any()
    private var child: Process? = null
    private var owner: OwnedProcess? = null
    private var backend = false
    private var preparing = false
    private lateinit var environment: Environment
    private lateinit var phone: PhoneBridge
    lateinit var store: SessionStore
        private set
    private val displays = LinkedHashMap<String, Display>()
    private val pending = HashMap<String, Pending>()

    override fun onBind(intent: Intent?): IBinder? = null
    override fun onCreate() {
        super.onCreate()
        environment = Environment(this)
        store = SessionStore(filesDir)
        display(store.active())
        phone = PhoneBridge(this)
        phone.start()
        getSystemService(NotificationManager::class.java).createNotificationChannel(NotificationChannel("runtime", "Local agent runtime", NotificationManager.IMPORTANCE_LOW))
        val stop = PendingIntent.getService(this, 1, Intent(this, RuntimeService::class.java).setAction("stop"), PendingIntent.FLAG_IMMUTABLE)
        val open = PendingIntent.getActivity(this, 0, Intent(this, MainActivity::class.java), PendingIntent.FLAG_IMMUTABLE)
        val notification = Notification.Builder(this, "runtime").setContentTitle("Olea")
            .setContentText("Local runtime · STOP ends all execution").setSmallIcon(android.R.drawable.ic_media_play)
            .setContentIntent(open).addAction(Notification.Action.Builder(null, "STOP", stop).build()).build()
        if (android.os.Build.VERSION.SDK_INT >= 34) startForeground(1, notification, android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
        else startForeground(1, notification)
        current = this
        refresh()
    }
    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) { "start" -> startEnvironment(); "stop" -> stopExecution() }
        return START_NOT_STICKY
    }
    private fun update(text: String) { status = text; revision++ }
    private fun selected() = display(store.active())
    private fun refresh() {
        val active = selected()
        conversationReady = active.ready
        busy = preparing || active.working || active.opening
        revision++
    }
    private fun display(info: ConversationInfo): Display = displays.getOrPut(info.id) {
        Display(info).apply {
            val journal = store.journalFile(info)
            if (journal.exists()) {
                try { val saved = JSONArray(journal.readText()); for (index in 0 until saved.length()) lines.add(saved.getString(index)) }
                catch (_: Exception) { lines.add("Saved display could not be read. The original file is retained; canonical agent history will load on Start.") }
            }
        }
    }
    private fun save(view: Display) {
        val journal = store.journalFile(view.info)
        journal.parentFile!!.mkdirs()
        val temporary = File(journal.parentFile, "${journal.name}.tmp")
        temporary.writeText(JSONArray(view.lines).toString())
        check(temporary.renameTo(journal)) { "Conversation display could not be saved" }
    }
    private fun add(view: Display, text: String) {
        view.lines.add(text.take(65536))
        while (view.lines.sumOf { it.length } > 262144 || view.lines.size > 300) view.lines.removeAt(0)
        runCatching { save(view) }.onFailure { update("Cannot save conversation display. Check storage.") }
        revision++
    }
    fun activeConversation(): ConversationInfo = synchronized(lock) { store.active() }
    fun selectConversation(id: String) = synchronized(lock) {
        val info = store.select(id)
        display(info)
        update(if (selected().ready) "${info.agent} ready" else "Saved conversation · tap Start to connect")
        refresh()
    }
    fun transcript(): String = synchronized(lock) {
        val view = selected()
        view.lines.joinToString("\n\n") + if (view.text.isNotEmpty()) "\n\nassistant: ${view.text}" else ""
    }
    fun runtimeSummary(): String = synchronized(lock) {
        val active = displays.values.filter { it.ready || it.opening }
        "Backend: ${if (backend && child?.isAlive == true) "running" else "stopped"}\nActive sessions: ${active.size}/2\n" +
            active.joinToString("\n") { "${it.info.title} · ${it.info.agent}${if (it.working) " · working" else ""}" }
    }
    private fun launch(command: List<String>, epoch: Long): Process = synchronized(lock) {
        check(epoch == generation.get()) { "Stopped" }
        check(child == null) { "Previous execution has not finished stopping" }
        val launched = OwnedProcess.launch(environment.builder(command), File(filesDir, "tmp/process-${UUID.randomUUID()}.pid"))
        child = launched.first; owner = launched.second
        launched.first
    }
    private fun run(command: List<String>, seconds: Int, epoch: Long) {
        val process = launch(command, epoch)
        val drain = Thread {
            runCatching {
                val phases = mapOf("Preparing Linux certificates and workspace tools" to "Installing Linux certificates and Git…", "Installing stock Pi through npm" to "Installing stock Pi through npm…", "Environment ready" to "Verifying prepared environment…")
                process.inputStream.bufferedReader().use { reader ->
                    val line = StringBuilder()
                    while (true) {
                        val next = reader.read(); if (next < 0) break
                        if (next == 10) { if (epoch == generation.get()) phases[line.toString()]?.let { update(it) }; line.setLength(0) }
                        else if (line.length < 4096) line.append(next.toChar())
                    }
                }
            }
        }.apply { start() }
        val errors = Thread { runCatching { process.errorStream.use { it.copyTo(java.io.OutputStream.nullOutputStream()) } } }.apply { start() }
        val exited = process.waitFor(seconds.toLong(), TimeUnit.SECONDS)
        val result = synchronized(lock) { owner?.stop() }
        if (result?.optBoolean("trackedExitVerified") != true) File(filesDir, "last-cleanup-failure.json").writeText(result?.toString(2) ?: "{}")
        drain.join(1000); errors.join(1000)
        synchronized(lock) { if (child === process && result?.optBoolean("trackedExitVerified") == true) { child = null; owner = null } }
        check(epoch == generation.get()) { "Stopped" }
        check(exited) { "Operation timed out. Check connection and retry explicitly; saved files are preserved." }
        check(process.exitValue() == 0) { "Operation failed (${process.exitValue()}). Check connectivity/storage; installed files may need an explicit retry." }
        check(result?.optBoolean("trackedExitVerified") == true) { "Process cleanup is incomplete. Tap STOP before restarting." }
    }
    fun startEnvironment() = synchronized(lock) {
        if (preparing) return@synchronized
        if (backend && child?.isAlive == true) { openSelected(); return@synchronized }
        if (child != null) { update("Tap STOP to finish prior cleanup before starting."); return@synchronized }
        preparing = true; refresh()
        val epoch = generation.get()
        serial.execute {
            try {
                environment.initialize()
                val runner: (List<String>, Int) -> Unit = { command, seconds -> run(command, seconds, epoch) }
                if (!environment.ready) environment.prepare({ update(it) }, runner)
                else { environment.refreshDns(); environment.stageBackend(runner) }
                check(epoch == generation.get()) { "Stopped" }
                update("Starting shared backend…")
                val process = launch(environment.linux("node", "/olea/dist/server.js"), epoch)
                synchronized(lock) { check(epoch == generation.get()); backend = true }
                Thread { runCatching { process.errorStream.use { it.copyTo(java.io.OutputStream.nullOutputStream()) } } }.start()
                Thread {
                    try {
                        process.inputStream.bufferedReader().use { reader ->
                            val line = StringBuilder()
                            while (true) {
                                val next = reader.read(); if (next < 0) break
                                if (next == 10) {
                                    if (line.isNotEmpty()) synchronized(lock) { if (epoch == generation.get()) receive(JSONObject(line.toString())) }
                                    line.setLength(0)
                                } else { check(line.length < 262144) { "Backend output exceeded limit" }; line.append(next.toChar()) }
                            }
                        }
                        if (epoch == generation.get()) stopExecution("Backend exited. Saved data remains; Start explicitly to reconnect.")
                    } catch (_: Exception) {
                        if (epoch == generation.get()) stopExecution("Backend stream failed. Saved data remains; Start explicitly to reconnect.")
                    }
                }.start()
            } catch (error: Exception) {
                synchronized(lock) { if (epoch == generation.get()) { preparing = false; update(error.message?.take(240) ?: "Environment failed. Tap STOP, then retry Start."); refresh() } }
            }
        }
    }
    private fun openSelected() {
        val view = selected()
        if (view.ready || view.opening) return
        val workspace = store.workspaces().first { it.id == view.info.workspaceId }
        val guest = store.workspacePath(workspace)
        val resume = File(filesDir, if (view.info.agent == "codex") "data/sessions/codex/${view.info.id}/thread.json" else "data/sessions/${view.info.id}/resume.json").isFile
        view.opening = true
        update("Opening ${view.info.agent} conversation…")
        send(view.info.id, if (view.info.agent == "codex") "codex_start" else "start", resume = resume, workspace = guest)
        refresh()
    }
    private fun send(session: String, type: String, command: JSONObject? = null, resume: Boolean = false, workspace: String? = null, action: String? = null) {
        check(backend && child?.isAlive == true) { "Start the environment first" }
        val id = UUID.randomUUID().toString()
        val record = JSONObject().put("id", id).put("session", session).put("type", type)
        if (command != null) record.put("command", command)
        if (resume) record.put("resume", true)
        if (workspace != null) record.put("workspace", workspace)
        pending[id] = Pending(session, action ?: command?.optString("type")?.takeIf { it.isNotEmpty() } ?: command?.optString("method") ?: type)
        child!!.outputStream.write((record.toString() + "\n").toByteArray()); child!!.outputStream.flush()
    }
    private fun historyText(message: JSONObject): String {
        val content = message.opt("content")
        return when (content) {
            is String -> content
            is JSONArray -> (0 until content.length()).mapNotNull { content.optJSONObject(it)?.optString("text")?.takeIf { it.isNotEmpty() } }.joinToString("\n")
            else -> message.optString("output", message.optString("text"))
        }
    }
    private fun receive(record: JSONObject) {
        when (record.optString("type")) {
            "ready" -> { preparing = false; openSelected() }
            "response" -> {
                val request = pending.remove(record.optString("id")) ?: return
                val view = displays[request.session] ?: return
                if (!record.optBoolean("success")) {
                    view.working = false; view.opening = false
                    add(view, "Error: ${record.optString("error", "Request failed")}. No automatic retry was sent.")
                    update("Request failed. Inspect the conversation; restart explicitly if needed.")
                    refresh(); return
                }
                when (request.action) {
                    "start" -> send(view.info.id, "command", JSONObject().put("type", "get_messages"))
                    "codex_start" -> send(view.info.id, "codex_command", JSONObject().put("method", "thread/read"))
                    "get_messages" -> {
                        val messages = record.optJSONObject("data")?.optJSONObject("data")?.optJSONArray("messages") ?: error("Invalid Pi history")
                        if (messages.length() > 0) {
                            view.lines.clear()
                            for (index in 0 until messages.length()) {
                                val message = messages.optJSONObject(index) ?: continue
                                val text = historyText(message)
                                if (text.isNotBlank()) add(view, "${message.optString("role")}: $text")
                            }
                        }
                        view.ready = true; view.opening = false; update("Pi ready")
                    }
                    "thread/read" -> {
                        val data = record.optJSONObject("data")
                        val turns = data?.optJSONObject("thread")?.optJSONArray("turns")
                        if (turns != null && turns.length() > 0) {
                            view.lines.clear()
                            for (index in 0 until turns.length()) {
                                val items = turns.optJSONObject(index)?.optJSONArray("items") ?: continue
                                for (itemIndex in 0 until items.length()) {
                                    val item = items.optJSONObject(itemIndex) ?: continue
                                    val text = historyText(item).ifBlank { item.optString("aggregatedOutput") }
                                    if (text.isNotBlank()) add(view, "${item.optString("type")}: $text")
                                }
                            }
                        }
                        view.ready = true; view.opening = false
                        update(if (data?.has("historyUnavailable") == true) "Codex ready · saved display; stock history listing unavailable" else "Codex ready · full access")
                    }
                    "bash" -> { view.working = false; view.shell = false; add(view, "Workspace tool: ${record.optJSONObject("data")?.optJSONObject("data")?.optString("output", "Completed")}") }
                    "command/exec" -> { view.working = false; view.shell = false; add(view, "Workspace tool: ${record.optJSONObject("data")?.optString("stdout").orEmpty()}\n${record.optJSONObject("data")?.optString("stderr").orEmpty()}") }
                    "stop" -> { view.ready = false; view.working = false; view.opening = false; update("Conversation disconnected; saved data retained.") }
                    "abort_bash" -> { view.working = false; view.shell = false; update("Shell cancellation acknowledged. Inspect output before continuing.") }
                }
            }
            "event" -> {
                val view = displays[record.optString("session")] ?: return
                val event = record.optJSONObject("record") ?: return
                if (record.optString("agent") == "codex") codexEvent(view, event) else piEvent(view, event)
            }
            "fault", "exit" -> {
                val view = displays[record.optString("session")] ?: return
                view.ready = false; view.working = false; view.opening = false
                phone.setEnabled(false)
                if (view.text.isNotEmpty()) { add(view, "assistant (interrupted): ${view.text}"); view.text.setLength(0) }
                update("Agent stopped. Phone access disabled; Start explicitly to reopen. No prompt was replayed.")
            }
        }
        refresh()
    }
    private fun append(view: Display, delta: String) { view.text.append(delta); if (view.text.length > 65536) view.text.delete(0, view.text.length - 65536) }
    private fun finish(view: Display) {
        if (view.text.isNotEmpty()) add(view, "assistant: ${view.text}")
        view.text.setLength(0); view.working = false; view.shell = false
        if (store.active().id == view.info.id) update("${if (view.info.agent == "pi") "Pi" else "Codex"} ready")
    }
    private fun piEvent(view: Display, event: JSONObject) {
        when (event.optString("type")) {
            "agent_start" -> { view.working = true; view.text.setLength(0) }
            "message_update" -> { val delta = event.optJSONObject("assistantMessageEvent"); if (delta?.optString("type") == "text_delta") append(view, delta.optString("delta")) }
            "message_end" -> { val error = event.optJSONObject("message")?.optString("errorMessage").orEmpty(); if (error.isNotBlank()) add(view, "Pi: ${error.take(2048)}") }
            "tool_execution_start" -> add(view, "Tool: ${event.optString("toolName")}")
            "tool_execution_end" -> {
                val content = event.optJSONObject("result")?.optJSONArray("content")
                val output = if (content == null) "" else (0 until content.length()).mapNotNull { content.optJSONObject(it)?.optString("text") }.joinToString("\n").take(8192)
                add(view, "Tool ${event.optString("toolName")}: ${if (event.optBoolean("isError")) "failed" else "finished"}\n$output")
            }
            "agent_end" -> finish(view)
        }
    }
    private fun codexEvent(view: Display, event: JSONObject) {
        val params = event.optJSONObject("params") ?: JSONObject()
        when (event.optString("method")) {
            "turn/started" -> { view.working = true; view.text.setLength(0) }
            "item/agentMessage/delta" -> append(view, params.optString("delta"))
            "item/started" -> { val item = params.optJSONObject("item"); if (item?.optString("type") in listOf("commandExecution", "mcpToolCall")) add(view, "Tool: ${item?.optString("type")} ${item?.optString("command", "")}") }
            "item/completed" -> {
                val item = params.optJSONObject("item") ?: return
                if (item.optString("type") in listOf("commandExecution", "mcpToolCall")) add(view, "Tool ${item.optString("type")}: ${item.optString("status")}\n${item.optString("aggregatedOutput", item.opt("result")?.toString() ?: "").take(8192)}")
            }
            "turn/completed" -> { val error = params.optJSONObject("turn")?.optJSONObject("error"); if (error != null) add(view, "Codex: ${error.optString("message").take(2048)}"); finish(view) }
            "error" -> add(view, "Codex: ${params.optJSONObject("error")?.optString("message", "Agent error")?.take(2048)}")
        }
    }
    fun prompt(text: String) = synchronized(lock) {
        val view = selected()
        if (!view.ready || view.working || text.isBlank() || text.length > 32000) return@synchronized
        view.working = true; refresh()
        try {
            add(view, "user: $text")
            if (view.info.agent == "codex") send(view.info.id, "codex_command", JSONObject().put("method", "turn/start").put("params", JSONObject().put("text", text)))
            else send(view.info.id, "command", JSONObject().put("type", "prompt").put("message", text))
        } catch (_: Exception) { view.working = false; update("Message delivery uncertain. No automatic replay; reopen and inspect saved history."); refresh() }
    }
    fun workspace(command: String) = synchronized(lock) {
        val view = selected()
        if (!view.ready || view.working || command.isBlank() || command.length > 16384) return@synchronized
        view.working = true; view.shell = true; refresh()
        try {
            if (view.info.agent == "codex") send(view.info.id, "codex_command", JSONObject().put("method", "command/exec").put("params", JSONObject().put("command", JSONArray(listOf("/bin/sh", "-c", command)))))
            else send(view.info.id, "command", JSONObject().put("type", "bash").put("command", command))
        } catch (_: Exception) { view.working = false; view.shell = false; update("Tool delivery uncertain. No automatic replay was sent."); refresh() }
    }
    fun cancelTurn() = synchronized(lock) {
        val view = selected()
        if (!view.ready || !view.working) return@synchronized
        try {
            val method = if (view.info.agent == "codex") { if (view.shell) "command/exec/terminate" else "turn/interrupt" } else { if (view.shell) "abort_bash" else "abort" }
            send(view.info.id, if (view.info.agent == "codex") "codex_command" else "command", JSONObject().put(if (view.info.agent == "codex") "method" else "type", method))
            update("Cancellation requested; waiting for agent completion. STOP ends all execution.")
        } catch (_: Exception) { update("Cancellation delivery uncertain. Use STOP to end execution.") }
    }
    fun disconnectConversation() = synchronized(lock) {
        val view = selected()
        if (!view.ready && !view.opening) return@synchronized
        send(view.info.id, "stop")
    }
    fun maintainAgent(agent: String, operation: String) = synchronized(lock) {
        if (agent !in listOf("pi", "codex") || operation !in listOf("install", "update")) return@synchronized
        if (child != null || preparing) { update("Tap STOP before installing or updating an agent."); return@synchronized }
        if (!environment.ready) { update("Start once to prepare Linux, then STOP before agent maintenance."); return@synchronized }
        preparing = true; phone.setEnabled(false); refresh()
        val epoch = generation.get()
        serial.execute {
            try {
                environment.initialize(); environment.refreshDns()
                val runner: (List<String>, Int) -> Unit = { command, seconds -> run(command, seconds, epoch) }
                environment.stageBackend(runner)
                update("${if (operation == "install") "Installing" else "Updating"} stock $agent through npm…")
                run(environment.linux("/bin/sh", "/olea/agent-maintenance.sh", agent, operation), 600, epoch)
                if (epoch == generation.get()) update("$agent $operation complete. Tap Start explicitly.")
            } catch (error: Exception) { if (epoch == generation.get()) update(error.message?.take(240) ?: "Agent maintenance failed; no automatic retry.") }
            finally { synchronized(lock) { if (epoch == generation.get()) { preparing = false; refresh() } } }
        }
    }
    fun stopExecution() = stopExecution("Stopped. Workspace and conversations saved.")
    private fun stopExecution(message: String) {
        generation.incrementAndGet()
        phone.setEnabled(false)
        synchronized(lock) { preparing = true; displays.values.forEach { it.ready = false; it.opening = false }; refresh(); update("Stopping execution…") }
        Thread {
            synchronized(lock) {
                backend = false; pending.clear()
                runCatching { child?.outputStream?.close() }
                val result = runCatching { owner?.stop() }.getOrNull()
                if (child == null || result?.optBoolean("trackedExitVerified") == true) { child = null; owner = null; update(message) }
                else { File(filesDir, "last-cleanup-failure.json").writeText(result?.toString(2) ?: "{}"); update("STOP requested; tracked exits could not all be verified. Tap STOP to retry.") }
                displays.values.forEach { view ->
                    if (view.text.isNotEmpty()) { add(view, "assistant (interrupted): ${view.text}"); view.text.setLength(0) }
                    view.working = false; view.shell = false
                }
                preparing = false; refresh()
            }
        }.start()
    }
    override fun onDestroy() { stopExecution(); phone.close(); current = null; serial.shutdownNow(); super.onDestroy() }
}
