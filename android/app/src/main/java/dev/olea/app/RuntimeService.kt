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
        private val discardOutput = object : java.io.OutputStream() {
            override fun write(value: Int) = Unit
        }
    }
    private class Display(val info: ConversationInfo, val lines: ArrayList<String> = ArrayList()) {
        var text = StringBuilder()
        var ready = false
        var working = false
        var opening = false
        var shell = false
        var closing = false
        var outcome = "idle"
        var interaction: RuntimeInteraction? = null
        var interactionId: Any? = null
        var stopRequested = false
    }
    private data class Pending(val session: String, val action: String)
    private val serial = Executors.newSingleThreadExecutor()
    private val generation = AtomicLong()
    private val lock = Any()
    private var child: Process? = null
    private var owner: OwnedProcess? = null
    private var backend = false
    private var preparing = false
    private var openAfterPreparation = true
    private val terminalViews = LinkedHashMap<String, RuntimeTerminalState>()
    private val outputLock = Any()
    private val operationOutput = StringBuilder()
    lateinit var agentConfiguration: AgentConfiguration
        private set
    lateinit var workspaceFolders: WorkspaceFolders
        private set
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
        agentConfiguration = AgentConfiguration(filesDir) { synchronized(lock) { child == null && !preparing } }
        store = SessionStore(filesDir)
        workspaceFolders = WorkspaceFolders(this, store)
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
    fun conversationStates(): List<RuntimeConversationState> = synchronized(lock) {
        store.conversations().map { info ->
            val view = display(info)
            val messages = view.lines.map { line ->
                val prefix = line.substringBefore(':', "")
                RuntimeMessage(when { prefix == "user" -> "user"; prefix.startsWith("assistant") -> "assistant"; prefix.startsWith("Tool") || prefix == "Workspace tool" -> "tool"; else -> "system" },
                    if (prefix == "user" || prefix.startsWith("assistant")) line.substringAfter(':').trimStart() else line)
            }.toMutableList()
            if (view.text.isNotEmpty()) messages.add(RuntimeMessage("assistant", view.text.toString(), "streaming"))
            RuntimeConversationState(info.id, info.agent, info.workspaceId,
                when { view.opening -> "opening"; view.interaction != null -> "needs_you"; view.working -> "working"; else -> view.outcome }, view.ready, view.opening, messages, view.interaction)
        }
    }
    fun conversationState(id: String): RuntimeConversationState? = conversationStates().firstOrNull { it.id == id }
    fun environmentReady(): Boolean = environment.ready
    fun environmentRunning(): Boolean = synchronized(lock) { backend && child?.isAlive == true }
    fun diagnostics(): String = synchronized(outputLock) {
        if (operationOutput.isNotEmpty()) agentConfiguration.redact(operationOutput.toString())
        else runCatching { File(filesDir, "data/runtime-diagnostics.txt").readText() }.getOrDefault("")
    }
    private fun beginDiagnostics(label: String) = synchronized(outputLock) {
        operationOutput.setLength(0); operationOutput.append(label).append('\n')
    }
    private fun appendDiagnostic(text: String) = synchronized(outputLock) {
        operationOutput.append(text)
        if (operationOutput.length > 65536) operationOutput.delete(0, operationOutput.length - 65536)
        revision++
    }
    private fun saveDiagnostics() = synchronized(outputLock) {
        runCatching {
            val target = File(filesDir, "data/runtime-diagnostics.txt")
            target.parentFile!!.mkdirs()
            val staged = File(target.parentFile, "runtime-diagnostics.tmp")
            staged.writeText(agentConfiguration.redact(operationOutput.toString()))
            check(staged.renameTo(target))
        }
    }
    fun sharedStorageStatus(): String = synchronized(lock) {
        val access = AndroidSharedFolders(this).access()
        val currentPath = access.takeIf { it.available }?.folder?.path
        val restart = backend && child?.isAlive == true && currentPath != environment.boundSharedStoragePath
        if (restart) "${access.message} STOP the environment, then Start to refresh phone file access."
        else if (access.available) "Phone files are available at /sdcard and /storage when the environment starts. Workspaces set the starting folder, not file reach. Android still protects private app data."
        else access.message
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
        fun drain(stream: java.io.InputStream, label: String) = Thread {
            runCatching {
                stream.bufferedReader().use { reader ->
                    val line = StringBuilder()
                    while (true) {
                        val next = reader.read()
                        if (next < 0) { if (line.isNotEmpty()) appendDiagnostic("$label$line\n"); break }
                        if (next == 10 || line.length >= 4096) {
                            val text = line.toString(); appendDiagnostic("$label$text\n")
                            if (epoch == generation.get() && text in listOf("Preparing Linux certificates and workspace tools", "Terminal support ready", "Environment ready")) update(text)
                            line.setLength(0)
                        } else line.append(next.toChar())
                    }
                }
            }
        }.apply { start() }
        val drain = drain(process.inputStream, "")
        val errors = drain(process.errorStream, "stderr: ")
        val exited = process.waitFor(seconds.toLong(), TimeUnit.SECONDS)
        val result = synchronized(lock) { owner?.stop() }
        if (result?.optBoolean("trackedExitVerified") != true) File(filesDir, "last-cleanup-failure.json").writeText(result?.toString(2) ?: "{}")
        drain.join(1000); errors.join(1000)
        appendDiagnostic(if (exited) "Exit: ${process.exitValue()}\n" else "Timed out after $seconds seconds\n")
        saveDiagnostics()
        synchronized(lock) { if (child === process && result?.optBoolean("trackedExitVerified") == true) { child = null; owner = null } }
        check(epoch == generation.get()) { "Stopped" }
        check(exited) { "Operation timed out. Open diagnostics, check connection, then retry; saved files are preserved." }
        check(process.exitValue() == 0) { "Operation failed (${process.exitValue()}). Open diagnostics for the underlying error, then retry explicitly." }
        check(result?.optBoolean("trackedExitVerified") == true) { "Process cleanup is incomplete. Tap STOP before restarting." }
    }
    fun prepareEnvironment() = startEnvironment(false)
    fun startEnvironment(openConversation: Boolean = true) = synchronized(lock) {
        if (openConversation) workspaceFolders.requireAvailable(selected().info.workspaceId)
        if (preparing) return@synchronized
        if (backend && child?.isAlive == true) { if (openConversation) openSelected(); return@synchronized }
        if (child != null) { update("Tap STOP to finish prior cleanup before starting."); return@synchronized }
        openAfterPreparation = openConversation
        beginDiagnostics("Preparing environment")
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
                Thread { runCatching { process.errorStream.use { it.copyTo(discardOutput) } } }.start()
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
                appendDiagnostic("${error.javaClass.simpleName}: ${error.message}\n"); saveDiagnostics()
                synchronized(lock) { if (epoch == generation.get()) { preparing = false; update(error.message?.take(240) ?: "Environment failed. Tap STOP, then retry Start."); refresh() } }
            }
        }
    }
    private fun taskWorkspacePath(workspaceId: String): String {
        val currentPath = AndroidSharedFolders(this).access().takeIf { it.available }?.folder?.path
        check(currentPath == environment.boundSharedStoragePath) { sharedStorageStatus() }
        val guest = workspaceFolders.workspacePath(workspaceId)
        if (workspaceFolders.isConnected(workspaceId)) check(guest in environment.boundWorkspacePaths) {
            "This folder was unavailable when the environment started. STOP the environment, restore folder access, then start it again."
        }
        return guest
    }

    private fun openSelected() {
        val view = selected()
        val guest = taskWorkspacePath(view.info.workspaceId)
        if (view.ready || view.opening) return
        if (!agentConfiguration.status(view.info.agent).optBoolean("installed")) {
            view.outcome = "error"
            update("${view.info.agent} is not installed. Install it from Agents, then Start.")
            return
        }
        val checkpoint = when (view.info.agent) {
            "codex" -> "data/sessions/codex/${view.info.id}/thread.json"
            "claude" -> "data/sessions/claude/${view.info.id}/session.json"
            else -> "data/sessions/${view.info.id}/resume.json"
        }
        val resume = File(filesDir, checkpoint).isFile
        view.closing = false
        view.opening = true
        update("Opening ${view.info.agent} conversation…")
        send(view.info.id, when (view.info.agent) { "codex" -> "codex_start"; "claude" -> "claude_start"; else -> "start" }, resume = resume, workspace = guest)
        refresh()
    }
    fun createConnectedWorkspace(name: String, path: String): WorkspaceInfo = synchronized(lock) {
        check(child == null && !preparing) { "Stop the environment before connecting a workspace folder." }
        AndroidSharedFolders(this).requireAvailable(path)
        val item = store.createWorkspace(name)
        workspaceFolders.connect(item.id, path)
        update("Folder connected. Start explicitly; saved conversations remain in private storage.")
        refresh()
        item
    }

    fun connectFolder(workspaceId: String, path: String) = synchronized(lock) {
        check(child == null && !preparing) { "Stop the environment before connecting a workspace folder" }
        workspaceFolders.connect(workspaceId, path)
        update("Folder connected. Start explicitly; saved conversations remain in private storage.")
    }
    fun terminals(workspaceId: String): List<RuntimeTerminalState> = synchronized(lock) {
        terminalViews.values.filter { it.workspaceId == workspaceId }.toList()
    }
    fun createTerminal(workspaceId: String, name: String = "Terminal"): String = synchronized(lock) {
        require(name.isNotBlank() && name.length <= 160 && name.none { it.isISOControl() }) { "Enter a terminal name" }
        check(backend && child?.isAlive == true) { "Start the environment before opening a terminal" }
        store.workspaces().firstOrNull { it.id == workspaceId } ?: error("Unknown workspace")
        val guest = taskWorkspacePath(workspaceId)
        val id = UUID.randomUUID().toString()
        terminalViews[id] = RuntimeTerminalState(id, workspaceId, name, "opening", "")
        send(id, "terminal_start", workspace = guest, action = "terminal_start", extra = JSONObject().put("name", name))
        refresh(); id
    }
    fun terminalInput(id: String, text: String) = synchronized(lock) {
        val terminal = terminalViews[id] ?: error("Unknown terminal")
        check(terminal.state == "running") { "Terminal is not running" }
        taskWorkspacePath(terminal.workspaceId)
        require(text.length <= 32768) { "Terminal input is too long" }
        send(id, "terminal_command", JSONObject().put("type", "input").put("text", text), action = "terminal_input")
    }
    fun resizeTerminal(id: String, columns: Int, rows: Int) = synchronized(lock) {
        require(columns in 1..500 && rows in 1..500) { "Invalid terminal size" }
        val view = terminalViews[id] ?: error("Unknown terminal")
        if (view.state == "running") send(id, "terminal_command", JSONObject().put("type", "resize").put("columns", columns).put("rows", rows), action = "terminal_resize")
        terminalViews[id] = view.copy(columns = columns, rows = rows)
    }
    fun interruptTerminal(id: String) = terminalInput(id, "\u0003")
    fun closeTerminal(id: String) = synchronized(lock) {
        val view = terminalViews[id] ?: return@synchronized
        if (backend && child?.isAlive == true) send(id, "terminal_close", action = "terminal_close")
        terminalViews[id] = view.copy(state = "closed"); refresh()
    }
    fun respondToInteraction(sessionId: String, requestId: String, decision: String) = synchronized(lock) {
        val view = displays[sessionId] ?: error("Unknown conversation")
        val interaction = view.interaction ?: error("No pending interaction")
        require(interaction.requestId == requestId && decision in interaction.choices) { "Invalid interaction response" }
        if (decision == "accept") taskWorkspacePath(view.info.workspaceId)
        check(view.info.agent == "codex") { "Interaction is not supported by this agent" }
        send(sessionId, "codex_approval", action = "codex_approval", extra = JSONObject().put("requestId", view.interactionId).put("decision", decision))
        view.interaction = null; view.interactionId = null; refresh()
    }
    private fun send(session: String, type: String, command: JSONObject? = null, resume: Boolean = false, workspace: String? = null, action: String? = null, extra: JSONObject? = null) {
        check(backend && child?.isAlive == true) { "Start the environment first" }
        val id = UUID.randomUUID().toString()
        val record = JSONObject().put("id", id).put("session", session).put("type", type)
        if (command != null) record.put("command", command)
        if (resume) record.put("resume", true)
        if (workspace != null) record.put("workspace", workspace)
        extra?.keys()?.forEach { record.put(it, extra.get(it)) }
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
        if (record.optString("type") == "terminal") {
            val id = record.optString("session")
            val view = terminalViews[id] ?: return
            val event = record.optJSONObject("record") ?: return
            terminalViews[id] = when (event.optString("type")) {
                "ready" -> view.copy(state = "running")
                "output" -> view.copy(output = (view.output + event.optString("text")).takeLast(262144))
                "exit" -> if (view.state in listOf("closed", "stopped")) view else view.copy(state = "exited")
                "fault" -> view.copy(state = "error", output = view.output + "\n${event.optString("code")}\n")
                else -> view
            }
            refresh(); return
        }
        when (record.optString("type")) {
            "ready" -> {
                preparing = false
                if (openAfterPreparation) {
                    try { openSelected() } catch (error: Exception) {
                        selected().outcome = "error"
                        update(error.message ?: "Workspace unavailable. Restore folder access and start explicitly.")
                        refresh()
                    }
                } else update("Environment ready · choose an agent to install or open a terminal")
            }
            "response" -> {
                val request = pending.remove(record.optString("id")) ?: return
                if (request.action.startsWith("terminal_")) {
                    val terminal = terminalViews[request.session] ?: return
                    if (!record.optBoolean("success")) terminalViews[request.session] = terminal.copy(state = "error", output = terminal.output + "\n${record.optString("error")}\n")
                    else if (request.action == "terminal_close") terminalViews[request.session] = terminal.copy(state = "closed")
                    refresh(); return
                }
                val view = displays[request.session] ?: return
                if (!record.optBoolean("success")) {
                    if (request.action in listOf("start", "codex_start", "claude_start", "get_messages", "claude_history", "thread/read")) view.opening = false
                    // A lost acknowledgement can leave execution alive; retain Cancel until terminal evidence.
                    val uncertain = record.optString("error") in listOf("rpc_timeout", "codex_delivery_unknown", "backend_request_failed", "codex_turn_delivery_unknown", "claude_delivery_unknown")
                    if (!uncertain && request.action !in listOf("abort", "abort_bash", "turn/interrupt", "command/exec/terminate")) view.working = false
                    view.outcome = "error"
                    add(view, "Error: ${record.optString("error", "Request failed")}. No automatic retry was sent.")
                    update("Request failed. Inspect the conversation; restart explicitly if needed.")
                    refresh(); return
                }
                when (request.action) {
                    "start" -> if (!view.closing) send(view.info.id, "command", JSONObject().put("type", "get_messages"))
                    "claude_start" -> if (!view.closing) send(view.info.id, "claude_command", JSONObject().put("type", "get_messages"), action = "claude_history")
                    "claude_history" -> {
                        if (view.closing) return
                        val data = record.optJSONObject("data")
                        val messages = data?.optJSONArray("messages")
                        if (messages != null && messages.length() > 0) {
                            view.lines.clear()
                            for (index in 0 until messages.length()) {
                                val message = messages.optJSONObject(index) ?: continue
                                val text = historyText(message)
                                if (text.isNotBlank()) add(view, "${message.optString("role")}: $text")
                            }
                        }
                        view.ready = true; view.opening = false; view.outcome = "ready"
                        update(if (data?.has("historyUnavailable") == true) "Claude ready · saved display; canonical history unavailable" else "Claude ready · full access")
                    }
                    "codex_start" -> if (!view.closing) send(view.info.id, "codex_command", JSONObject().put("method", "thread/read"))
                    "get_messages" -> {
                        if (view.closing) return
                        val messages = record.optJSONObject("data")?.optJSONObject("data")?.optJSONArray("messages") ?: error("Invalid Pi history")
                        if (messages.length() > 0) {
                            view.lines.clear()
                            for (index in 0 until messages.length()) {
                                val message = messages.optJSONObject(index) ?: continue
                                val text = historyText(message)
                                if (text.isNotBlank()) add(view, "${message.optString("role")}: $text")
                            }
                        }
                        view.ready = true; view.opening = false; view.outcome = "ready"; update("Pi ready")
                    }
                    "thread/read" -> {
                        if (view.closing) return
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
                        view.ready = true; view.opening = false; view.outcome = "ready"
                        update(if (data?.has("historyUnavailable") == true) "Codex ready · saved display; stock history listing unavailable" else "Codex ready · full access")
                    }
                    "bash" -> { finish(view); add(view, "Workspace tool: ${record.optJSONObject("data")?.optJSONObject("data")?.optString("output", "Completed")}") }
                    "command/exec" -> { finish(view); add(view, "Workspace tool: ${record.optJSONObject("data")?.optString("stdout").orEmpty()}\n${record.optJSONObject("data")?.optString("stderr").orEmpty()}") }
                    "stop" -> { view.ready = false; view.working = false; view.opening = false; view.outcome = "stopped"; update("Conversation disconnected; saved data retained.") }
                    "abort_bash" -> { view.working = false; view.shell = false; update("Shell cancellation acknowledged. Inspect output before continuing.") }
                }
            }
            "event" -> {
                val view = displays[record.optString("session")] ?: return
                val event = record.optJSONObject("record") ?: return
                when (record.optString("agent")) { "codex" -> codexEvent(view, event); "claude" -> claudeEvent(view, event); else -> piEvent(view, event) }
            }
            "fault", "exit" -> {
                val view = displays[record.optString("session")] ?: return
                view.ready = false; view.working = false; view.opening = false; view.outcome = if (view.closing || view.stopRequested) "stopped" else "error"
                view.interaction = null; view.interactionId = null
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
        view.outcome = when { view.stopRequested -> "stopped"; view.outcome == "error" -> "error"; else -> "done" }
        view.stopRequested = false; view.interaction = null; view.interactionId = null
        if (store.active().id == view.info.id) update("${when (view.info.agent) { "pi" -> "Pi"; "claude" -> "Claude"; else -> "Codex" }} ready")
    }
    private fun piEvent(view: Display, event: JSONObject) {
        when (event.optString("type")) {
            "agent_start" -> { view.working = true; view.text.setLength(0) }
            "message_update" -> { val delta = event.optJSONObject("assistantMessageEvent"); if (delta?.optString("type") == "text_delta") append(view, delta.optString("delta")) }
            "message_end" -> { val error = event.optJSONObject("message")?.optString("errorMessage").orEmpty(); if (error.isNotBlank()) { view.outcome = "error"; add(view, "Pi: ${error.take(2048)}") } }
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
            "item/commandExecution/requestApproval", "item/fileChange/requestApproval" -> {
                val requestId = event.opt("id") ?: return
                view.interactionId = requestId
                view.interaction = RuntimeInteraction(requestId.toString(), event.optString("method"), params.optString("reason", params.optString("command", "Agent requires a decision")), listOf("accept", "decline", "cancel"))
            }
            "turn/completed" -> { val error = params.optJSONObject("turn")?.optJSONObject("error"); if (error != null) { view.outcome = "error"; add(view, "Codex: ${error.optString("message").take(2048)}") }; finish(view) }
            "error" -> { view.outcome = "error"; add(view, "Codex: ${params.optJSONObject("error")?.optString("message", "Agent error")?.take(2048)}") }
        }
    }
    private fun claudeEvent(view: Display, event: JSONObject) {
        when (event.optString("type")) {
            "stream_event" -> {
                val delta = event.optJSONObject("event") ?: return
                when (delta.optString("type")) {
                    "content_block_delta" -> { val value = delta.optJSONObject("delta"); if (value?.optString("type") == "text_delta") append(view, value.optString("text")) }
                    "content_block_start" -> { val block = delta.optJSONObject("content_block"); if (block?.optString("type") == "tool_use") add(view, "Tool: ${block.optString("name")}") }
                }
            }
            "user" -> {
                val blocks = event.optJSONObject("message")?.optJSONArray("content") ?: return
                for (index in 0 until blocks.length()) {
                    val block = blocks.optJSONObject(index) ?: continue
                    if (block.optString("type") == "tool_result") add(view, "Tool result: ${block.opt("content")?.toString()?.take(8192)}")
                }
            }
            "olea_interaction_required" -> { view.outcome = "error"; add(view, "Claude requires an unsupported interaction: ${event.optString("subtype")}. No approval was sent.") }
            "result" -> {
                if (event.optBoolean("is_error")) { view.outcome = "error"; add(view, "Claude request failed (${event.optString("subtype")}). Check installation and Anthropic provider settings. No automatic retry was sent.") }
                finish(view)
            }
        }
    }
    fun prompt(text: String): Boolean = synchronized(lock) {
        val view = selected()
        if (!view.ready || view.working || text.isBlank() || text.length > 32000) return@synchronized false
        taskWorkspacePath(view.info.workspaceId)
        view.working = true; view.outcome = "working"; view.stopRequested = false; refresh()
        try {
            add(view, "user: $text")
            if (view.info.agent == "codex") send(view.info.id, "codex_command", JSONObject().put("method", "turn/start").put("params", JSONObject().put("text", text)))
            else if (view.info.agent == "claude") send(view.info.id, "claude_command", JSONObject().put("type", "prompt").put("message", text))
            else send(view.info.id, "command", JSONObject().put("type", "prompt").put("message", text))
            true
        } catch (_: Exception) { update("Message delivery uncertain. No automatic replay; reopen and inspect saved history."); refresh(); true }
    }
    fun workspace(command: String) = synchronized(lock) {
        val view = selected()
        if (!view.ready || view.working || command.isBlank() || command.length > 16384) return@synchronized
        taskWorkspacePath(view.info.workspaceId)
        check(view.info.agent != "claude") { "Claude has no separate workspace-shell RPC. Ask Claude to use its Bash tool, or use a Pi/Codex conversation." }
        view.working = true; view.shell = true; view.outcome = "working"; view.stopRequested = false; refresh()
        try {
            if (view.info.agent == "codex") send(view.info.id, "codex_command", JSONObject().put("method", "command/exec").put("params", JSONObject().put("command", JSONArray(listOf("/bin/sh", "-c", command)))))
            else send(view.info.id, "command", JSONObject().put("type", "bash").put("command", command))
        } catch (_: Exception) { update("Tool delivery uncertain. Cancel or STOP before continuing; no automatic replay."); refresh() }
    }
    fun cancelTurn() = synchronized(lock) {
        val view = selected()
        if (!view.ready || !view.working) return@synchronized
        view.stopRequested = true
        try {
            val method = if (view.info.agent == "codex") { if (view.shell) "command/exec/terminate" else "turn/interrupt" } else { if (view.shell) "abort_bash" else "abort" }
            send(view.info.id, if (view.info.agent == "codex") "codex_command" else if (view.info.agent == "claude") "claude_command" else "command", JSONObject().put(if (view.info.agent == "codex") "method" else "type", method))
            update("Cancellation requested; waiting for agent completion. STOP ends all execution.")
        } catch (_: Exception) { update("Cancellation delivery uncertain. Use STOP to end execution.") }
    }
    fun disconnectConversation() = synchronized(lock) {
        val view = selected()
        if (!view.ready && !view.opening) return@synchronized
        view.closing = true
        send(view.info.id, "stop")
    }
    fun maintainAgent(agent: String, operation: String) = synchronized(lock) {
        if (agent !in listOf("pi", "codex", "claude") || operation !in listOf("install", "update")) return@synchronized
        if (child != null || preparing) { update("Tap STOP before installing or updating an agent."); return@synchronized }
        if (!environment.ready) { update("Start once to prepare Linux, then STOP before agent maintenance."); return@synchronized }
        preparing = true; phone.setEnabled(false); beginDiagnostics("$operation $agent"); refresh()
        val epoch = generation.get()
        serial.execute {
            try {
                environment.initialize(); environment.refreshDns()
                val runner: (List<String>, Int) -> Unit = { command, seconds -> run(command, seconds, epoch) }
                environment.stageBackend(runner)
                update("${if (operation == "install") "Installing" else "Updating"} stock $agent through npm…")
                run(environment.linux("/bin/sh", "/olea/agent-maintenance.sh", agent, operation), 600, epoch)
                if (epoch == generation.get()) update("$agent $operation complete. Tap Start explicitly.")
            } catch (error: Exception) {
                appendDiagnostic("${error.javaClass.simpleName}: ${error.message}\n"); saveDiagnostics()
                if (epoch == generation.get()) update(error.message?.take(240) ?: "Agent maintenance failed; no automatic retry.")
            }
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
                    view.working = false; view.shell = false; view.outcome = "stopped"
                    view.interaction = null; view.interactionId = null
                }
                terminalViews.replaceAll { _, terminal -> terminal.copy(state = "stopped") }
                preparing = false; refresh()
            }
        }.start()
    }
    override fun onDestroy() { stopExecution(); phone.close(); current = null; serial.shutdownNow(); super.onDestroy() }
}
