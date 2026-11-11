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
        val messages = ArrayList<String>()
    }
    private val serial = Executors.newSingleThreadExecutor()
    private val generation = AtomicLong()
    private val lock = Any()
    private var child: Process? = null
    private var owner: OwnedProcess? = null
    private var backend = false
    private lateinit var environment: Environment
    private val session = "conversation"
    private val pending = HashMap<String, String>()
    private var assistant = StringBuilder()

    override fun onBind(intent: Intent?): IBinder? = null
    override fun onCreate() {
        super.onCreate()
        current = this
        environment = Environment(this)
        val journal = File(filesDir, "data/conversation.json")
        synchronized(messages) {
            messages.clear()
            runCatching { val saved = JSONArray(journal.readText()); for (index in 0 until saved.length()) messages.add(saved.getString(index)) }
        }
        getSystemService(NotificationManager::class.java).createNotificationChannel(NotificationChannel("runtime", "Local agent runtime", NotificationManager.IMPORTANCE_LOW))
        val stop = PendingIntent.getService(this, 1, Intent(this, RuntimeService::class.java).setAction("stop"), PendingIntent.FLAG_IMMUTABLE)
        val open = PendingIntent.getActivity(this, 0, Intent(this, MainActivity::class.java), PendingIntent.FLAG_IMMUTABLE)
        val notification = Notification.Builder(this, "runtime").setContentTitle("Olea")
            .setContentText("Local runtime · STOP ends execution").setSmallIcon(android.R.drawable.ic_media_play)
            .setContentIntent(open).addAction(Notification.Action.Builder(null, "STOP", stop).build()).build()
        if (android.os.Build.VERSION.SDK_INT >= 34) startForeground(1, notification, android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
        else startForeground(1, notification)
        revision++
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            "start" -> startEnvironment()
            "stop" -> stopExecution()
        }
        return START_NOT_STICKY
    }

    private fun update(text: String) { status = text; revision++ }
    private fun save() {
        val directory = File(filesDir, "data").apply { mkdirs() }
        val temporary = File(directory, "conversation.tmp")
        temporary.writeText(synchronized(messages) { JSONArray(messages).toString() })
        check(temporary.renameTo(File(directory, "conversation.json"))) { "Conversation display could not be saved" }
    }
    private fun add(text: String) {
        synchronized(messages) {
            messages.add(text.take(65536))
            while (messages.sumOf { it.length } > 262144 || messages.size > 300) messages.removeAt(0)
            runCatching { save() }.onFailure { update("Cannot save conversation display. Check storage.") }
        }
        revision++
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
                        if (next == 10) {
                            if (epoch == generation.get()) phases[line.toString()]?.let { update(it) }
                            line.setLength(0)
                        } else if (line.length < 4096) line.append(next.toChar())
                    }
                }
            }
        }.apply { start() }
        val errors = Thread { runCatching { process.errorStream.use { it.copyTo(java.io.OutputStream.nullOutputStream()) } } }.apply { start() }
        val exited = process.waitFor(seconds.toLong(), TimeUnit.SECONDS)
        val result = synchronized(lock) { owner?.stop() }
        if (result?.optBoolean("trackedExitVerified") != true) File(filesDir, "last-cleanup-failure.json").writeText(result?.toString(2) ?: "{}")
        drain.join(1000); errors.join(1000)
        synchronized(lock) {
            if (child === process && result?.optBoolean("trackedExitVerified") == true) { child = null; owner = null }
        }
        check(epoch == generation.get()) { "Stopped" }
        check(exited) { "Preparation timed out. Check connection and retry Start; saved files are preserved." }
        check(process.exitValue() == 0) { "Preparation command failed (${process.exitValue()}). Check internet and free storage, then retry Start." }
        check(result?.optBoolean("trackedExitVerified") == true) { "Process cleanup is incomplete. Tap STOP before restarting." }
    }

    fun startEnvironment() {
        if (busy || conversationReady) return
        busy = true
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
                            // Reject a runaway backend before allocating an unbounded line.
                            val line = StringBuilder()
                            while (true) {
                                val next = reader.read(); if (next < 0) break
                                if (next == 10) {
                                    if (line.isNotEmpty()) synchronized(lock) { if (epoch == generation.get()) receive(JSONObject(line.toString())) }
                                    line.setLength(0)
                                } else { check(line.length < 262144) { "Backend output exceeded limit" }; line.append(next.toChar()) }
                            }
                        }
                        if (epoch == generation.get()) { update("Backend exited. Tap STOP, then Start to reopen the saved conversation."); stopExecution() }
                    } catch (_: Exception) {
                        if (epoch == generation.get()) { stopExecution(); update("Backend stream failed. Saved data remains. Start explicitly to reconnect.") }
                    }
                }.start()
            } catch (error: Exception) {
                if (epoch == generation.get()) update(error.message?.take(240) ?: "Environment failed. Tap STOP, then retry Start.")
                busy = false
            }
        }
    }

    private fun send(type: String, command: JSONObject? = null, resume: Boolean = false) = synchronized(lock) {
        check(backend && child?.isAlive == true) { "Start the environment first" }
        val id = UUID.randomUUID().toString()
        val record = JSONObject().put("id", id).put("session", session).put("type", type)
        if (command != null) record.put("command", command)
        if (resume) record.put("resume", true)
        pending[id] = command?.optString("type") ?: type
        child!!.outputStream.write((record.toString() + "\n").toByteArray())
        child!!.outputStream.flush()
    }

    private fun receive(record: JSONObject) {
        when (record.optString("type")) {
            "ready" -> {
                update("Opening saved Pi conversation…")
                send("start", resume = File(filesDir, "data/sessions/$session/resume.json").isFile)
            }
            "response" -> {
                val action = pending.remove(record.optString("id")) ?: return
                if (!record.optBoolean("success")) {
                    busy = false
                    add("Error: ${record.optString("error", "Request failed")}. No automatic retry was sent.")
                    update("Request failed. STOP and Start to reopen safely.")
                    return
                }
                when (action) {
                    "start" -> send("command", JSONObject().put("type", "get_messages"))
                    "prompt" -> { /* Pi emits agent_end when the streamed turn finishes. */ }
                    "get_messages" -> {
                        val data = record.optJSONObject("data")?.optJSONObject("data")?.optJSONArray("messages")
                        if (data == null) { busy = false; update("Pi history response was invalid. STOP and Start to retry safely."); return }
                        if (data.length() > 0) {
                            synchronized(messages) { messages.clear() }
                            for (index in 0 until data.length()) {
                                val message = data.optJSONObject(index) ?: continue
                                val content = message.opt("content")
                                val text = when (content) {
                                    is String -> content
                                    is JSONArray -> (0 until content.length()).mapNotNull { content.optJSONObject(it)?.optString("text")?.takeIf { it.isNotEmpty() } }.joinToString("\n")
                                    else -> message.optString("output")
                                }
                                val role = if (message.optString("role") == "bashExecution") "Workspace tool" else message.optString("role")
                                if (text.isNotBlank()) add("$role: $text")
                            }
                        }
                        conversationReady = true; busy = false; update("Pi ready")
                    }
                    "bash" -> { busy = false; add("Workspace tool: ${record.optJSONObject("data")?.optJSONObject("data")?.optString("output", "Completed")}") }
                }
            }
            "event" -> {
                val event = record.optJSONObject("record") ?: return
                when (event.optString("type")) {
                    "agent_start" -> { busy = true; assistant = StringBuilder(); update("Pi working…") }
                    "message_update" -> {
                        val delta = event.optJSONObject("assistantMessageEvent")
                        if (delta?.optString("type") == "text_delta") {
                            assistant.append(delta.optString("delta")); if (assistant.length > 65536) assistant.delete(0, assistant.length - 65536)
                            revision++
                        }
                    }
                    "message_end" -> {
                        val message = event.optJSONObject("message")
                        val error = message?.optString("errorMessage").orEmpty()
                        if (error.isNotBlank()) add("Pi: ${error.take(2048)}")
                    }
                    "tool_execution_start" -> add("Tool: ${event.optString("toolName")}")
                    "tool_execution_end" -> {
                        val content = event.optJSONObject("result")?.optJSONArray("content")
                        val output = if (content == null) "" else (0 until content.length()).mapNotNull { content.optJSONObject(it)?.optString("text") }.joinToString("\n").take(8192)
                        add("Tool ${event.optString("toolName")}: ${if (event.optBoolean("isError")) "failed" else "finished"}\n$output")
                    }
                    "agent_end" -> { if (assistant.isNotEmpty()) add("assistant: $assistant"); assistant = StringBuilder(); busy = false; update("Pi ready") }
                }
            }
            "fault", "exit" -> { conversationReady = false; busy = false; update("Pi process stopped. STOP and Start to reopen; no prompt was replayed.") }
        }
        revision++
    }

    fun transcript(): String = synchronized(lock) {
        synchronized(messages) { messages.joinToString("\n\n") } + if (assistant.isNotEmpty()) "\n\nassistant: $assistant" else ""
    }

    fun prompt(text: String) {
        if (!conversationReady || busy || text.isBlank()) return
        busy = true
        serial.execute {
            try { add("user: $text"); send("command", JSONObject().put("type", "prompt").put("message", text)) }
            catch (_: Exception) { busy = false; update("Message delivery uncertain. No automatic replay. Reopen and inspect the saved conversation.") }
        }
    }

    fun workspace(command: String) {
        if (!conversationReady || busy || command.isBlank() || command.length > 16384) return
        busy = true
        serial.execute {
            try { send("command", JSONObject().put("type", "bash").put("command", command)) }
            catch (_: Exception) { busy = false; update("Tool delivery uncertain. No automatic replay was sent.") }
        }
    }

    fun stopExecution() {
        generation.incrementAndGet()
        busy = true; conversationReady = false
        update("Stopping execution…")
        Thread {
            synchronized(lock) {
                backend = false; pending.clear()
                runCatching { child?.outputStream?.close() }
                val result = runCatching { owner?.stop() }.getOrNull()
                if (child == null || result?.optBoolean("trackedExitVerified") == true) {
                    child = null; owner = null
                    update("Stopped. Workspace and conversation saved.")
                } else {
                    File(filesDir, "last-cleanup-failure.json").writeText(result?.toString(2) ?: "{}")
                    update("STOP requested; some tracked exits could not be verified. Tap STOP to retry.")
                }
                if (assistant.isNotEmpty()) { add("assistant (interrupted): $assistant"); assistant = StringBuilder() }
                busy = false
            }
        }.start()
    }

    override fun onDestroy() { current = null; stopExecution(); serial.shutdownNow(); super.onDestroy() }
}
