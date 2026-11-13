package dev.olea.app

import android.app.Activity
import android.app.AlertDialog
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.text.InputType
import android.view.ViewGroup
import android.widget.*
import org.json.JSONArray
import org.json.JSONObject
import java.io.File

class MainActivity : Activity() {
    private lateinit var title: TextView
    private lateinit var status: TextView
    private lateinit var transcript: TextView
    private lateinit var input: EditText
    private lateinit var scroll: ScrollView
    private var shownRevision = -1L
    private val handler = Handler(Looper.getMainLooper())
    private val refresh = object : Runnable { override fun run() { render(); handler.postDelayed(this, 250) } }

    override fun onCreate(state: Bundle?) {
        super.onCreate(state)
        window.decorView.systemUiVisibility = android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR or android.view.View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
        val root = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(24, 24, 24, 16) }
        root.setOnApplyWindowInsetsListener { view, insets -> view.setPadding(24, insets.systemWindowInsetTop + 16, 24, insets.systemWindowInsetBottom + 16); insets }
        title = TextView(this).apply { text = "Olea"; textSize = 22f; setTextColor(Color.BLACK) }
        status = TextView(this).apply { textSize = 14f; setPadding(0, 8, 0, 8) }
        fun row(vararg actions: Pair<String, () -> Unit>) = LinearLayout(this).apply {
            for ((label, action) in actions) addView(Button(this@MainActivity).apply {
                text = label; isAllCaps = false; maxLines = 1; setPadding(4, 0, 4, 0)
                setOnClickListener { attempt(action) }
            }, LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f))
        }
        transcript = TextView(this).apply { textSize = 16f; setTextColor(Color.DKGRAY); setPadding(0, 12, 0, 12); setTextIsSelectable(true) }
        scroll = ScrollView(this).apply { addView(transcript) }
        input = EditText(this).apply { hint = "Message agent"; setSingleLine(false); maxLines = 4 }
        val send = Button(this).apply { text = "Send"; setOnClickListener {
            val value = input.text.toString()
            if (value.length > 32000) { input.error = "Messages can contain at most 32000 characters" }
            else if (RuntimeService.conversationReady && !RuntimeService.busy && value.isNotBlank()) {
                attempt { if (RuntimeService.current?.prompt(value) == true) input.text.clear() }
            }
        } }
        root.addView(title); root.addView(status)
        root.addView(row("Conversations" to { conversations() }, "Workspaces" to { workspaces() }, "Phone" to { startActivity(Intent(this, PhoneAccessActivity::class.java)) }))
        root.addView(row("Start" to { service("start") }, "Cancel turn" to { RuntimeService.current?.cancelTurn() }, "STOP" to { service("stop") }, "More" to { more() }))
        root.addView(scroll, LinearLayout.LayoutParams(-1, 0, 1f)); root.addView(input); root.addView(send)
        setContentView(root)
        startService(Intent(this, RuntimeService::class.java))
    }
    private fun attempt(action: () -> Unit) {
        try { action() } catch (error: Exception) { AlertDialog.Builder(this).setMessage(error.message?.take(300) ?: "Operation failed. Saved files are retained.").setPositiveButton("OK", null).show() }
    }
    private fun runtime() = RuntimeService.current ?: error("Runtime is still opening. Try again shortly.")
    private fun more() {
        val choices = arrayOf("Workspace shell", "Provider settings", "Install or update agent", "Disconnect this conversation", "Runtime status")
        AlertDialog.Builder(this).setItems(choices) { _, item -> attempt {
            when (item) {
                0 -> workspaceShell()
                1 -> AlertDialog.Builder(this).setTitle("Provider").setItems(arrayOf("Pi · Chat Completions", "Codex · Responses", "Claude · Anthropic")) { _, agent -> configure(listOf("pi", "codex", "claude")[agent]) }.show()
                2 -> maintenance()
                3 -> runtime().disconnectConversation()
                4 -> AlertDialog.Builder(this).setTitle("Runtime").setMessage(runtime().runtimeSummary()).setPositiveButton("OK", null).show()
            }
        } }.show()
    }
    private fun conversations(workspaceId: String? = null) {
        val runtime = runtime()
        val items = runtime.store.conversations().filter { workspaceId == null || it.workspaceId == workspaceId }
        val labels = items.map { "${it.title} · ${it.agent}" } + "New conversation"
        AlertDialog.Builder(this).setTitle("Conversations").setItems(labels.toTypedArray()) { _, index -> attempt {
            if (index == items.size) newConversation(workspaceId) else runtime.selectConversation(items[index].id)
        } }.show()
    }
    private fun workspaces() {
        val items = runtime().store.workspaces()
        val labels = items.map { it.name } + "New workspace"
        AlertDialog.Builder(this).setTitle("Workspaces").setItems(labels.toTypedArray()) { _, index -> attempt {
            if (index == items.size) {
                val name = EditText(this).apply { hint = "Workspace name" }
                AlertDialog.Builder(this).setTitle("New workspace").setView(name).setNegativeButton("Cancel", null)
                    .setPositiveButton("Create") { _, _ -> attempt { val workspace = runtime().store.createWorkspace(name.text.toString()); newConversation(workspace.id) } }.show()
            } else conversations(items[index].id)
        } }.show()
    }
    private fun newConversation(workspaceId: String?) {
        val runtime = runtime()
        val available = runtime.store.workspaces()
        val fields = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(24, 8, 24, 8) }
        val name = EditText(this).apply { hint = "Conversation title"; setSingleLine(true) }
        val agent = Spinner(this).apply { adapter = ArrayAdapter(this@MainActivity, android.R.layout.simple_spinner_dropdown_item, listOf("Pi", "Codex", "Claude Code")) }
        val workspace = Spinner(this).apply {
            adapter = ArrayAdapter(this@MainActivity, android.R.layout.simple_spinner_dropdown_item, available.map { it.name })
            setSelection(available.indexOfFirst { it.id == (workspaceId ?: runtime.activeConversation().workspaceId) }.coerceAtLeast(0))
        }
        fields.addView(name); fields.addView(agent); fields.addView(workspace)
        AlertDialog.Builder(this).setTitle("New conversation").setView(fields)
            .setMessage("Each conversation keeps its agent. Codex and Claude require installation and provider setup; both use full access to app files.")
            .setNegativeButton("Cancel", null).setPositiveButton("Create") { _, _ -> attempt {
                val info = runtime.store.createConversation(name.text.toString().ifBlank { "New conversation" }, listOf("pi", "codex", "claude")[agent.selectedItemPosition], available[workspace.selectedItemPosition].id)
                runtime.selectConversation(info.id)
            } }.show()
    }
    private fun workspaceShell() {
        val command = EditText(this).apply { hint = "Shell command in selected workspace" }
        AlertDialog.Builder(this).setTitle("Workspace shell").setView(command)
            .setMessage("Runs locally through the selected agent without a model request. Start the conversation first.")
            .setNegativeButton("Cancel", null).setPositiveButton("Run") { _, _ -> attempt { runtime().workspace(command.text.toString()) } }.show()
    }
    private fun maintenance() {
        AlertDialog.Builder(this).setTitle("Agent maintenance").setItems(arrayOf("Install Codex", "Install Claude", "Update Pi", "Update Codex", "Update Claude")) { _, index -> attempt {
            val agent = listOf("codex", "claude", "pi", "codex", "claude")[index]
            val operation = if (index < 2) "install" else "update"
            runtime().maintainAgent(agent, operation)
        } }.show()
    }
    private fun configure(agent: String) {
        if (RuntimeService.busy || RuntimeService.conversationReady || runtime().runtimeSummary().startsWith("Backend: running")) {
            AlertDialog.Builder(this).setMessage("Tap STOP before changing provider settings.").setPositiveButton("OK", null).show(); return
        }
        val fields = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(32, 8, 32, 8) }
        val url = EditText(this).apply { hint = "HTTPS API base URL"; inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_URI }
        val model = EditText(this).apply { hint = "Model ID"; setSingleLine(true) }
        val key = EditText(this).apply { hint = "API key"; inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD }
        fields.addView(url); fields.addView(model); fields.addView(key)
        val config = File(filesDir, when (agent) { "pi" -> "data/home/.pi/agent/models.json"; "claude" -> "data/home/.olea/claude-provider.json"; else -> "data/home/.olea/provider.json" })
        fun saved(): JSONObject = if (agent == "pi") JSONObject(config.readText()).getJSONObject("providers").getJSONObject("olea") else JSONObject(config.readText())
        runCatching { val old = saved(); url.setText(old.getString("baseUrl")); model.setText(if (agent == "pi") old.getJSONArray("models").getJSONObject(0).getString("id") else old.getString("model")) }
        val dialog = AlertDialog.Builder(this).setTitle(when (agent) { "pi" -> "Pi provider"; "claude" -> "Claude Anthropic provider"; else -> "Codex Responses provider" }).setView(fields)
            .setMessage("Saved in private app storage. Messages and tool results go to this provider. Leave API key blank to retain it.")
            .setNegativeButton("Cancel", null).setPositiveButton("Save", null).create()
        dialog.setOnShowListener {
            dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener {
                val baseUrl = url.text.toString().trim()
                val modelId = model.text.toString().trim()
                val uri = android.net.Uri.parse(baseUrl)
                if (uri.scheme != "https" || uri.host.isNullOrBlank() || uri.userInfo != null || uri.query != null || uri.fragment != null || modelId.isBlank() || modelId.length > 256 || modelId.any { it.isISOControl() }) { url.error = "Enter an HTTPS URL and model ID"; return@setOnClickListener }
                val oldKey = runCatching { saved().getString("apiKey") }.getOrDefault("")
                val apiKey = key.text.toString().ifEmpty { oldKey }
                if (apiKey.isBlank() || apiKey.any { it == '\r' || it == '\n' }) { key.error = "Enter an API key"; return@setOnClickListener }
                try {
                    config.parentFile!!.mkdirs()
                    val provider = JSONObject().put("baseUrl", baseUrl).put("apiKey", apiKey)
                    val record = if (agent != "pi") provider.put("model", modelId) else {
                        provider.put("api", "openai-completions").put("models", JSONArray().put(JSONObject().put("id", modelId).put("name", modelId).put("reasoning", false)
                            .put("input", JSONArray().put("text")).put("contextWindow", 128000).put("maxTokens", 4096)
                            .put("cost", JSONObject().put("input", 0).put("output", 0).put("cacheRead", 0).put("cacheWrite", 0))))
                        JSONObject().put("providers", JSONObject().put("olea", provider))
                    }
                    val temporary = File(config.parentFile, "${config.name}.tmp")
                    temporary.writeText(record.toString()); temporary.setReadable(false, false); temporary.setReadable(true, true)
                    check(temporary.renameTo(config))
                    if (agent == "pi") {
                        val settings = File(config.parentFile, "settings.json")
                        val values = runCatching { JSONObject(settings.readText()) }.getOrDefault(JSONObject())
                        values.put("defaultProvider", "olea").put("defaultModel", modelId)
                        val staged = File(config.parentFile, "settings.tmp"); staged.writeText(values.toString()); check(staged.renameTo(settings))
                    }
                    key.text.clear(); dialog.dismiss()
                } catch (_: Exception) { key.error = "Settings could not be saved. Check available storage." }
            }
        }
        dialog.show()
    }
    private fun service(action: String) { startService(Intent(this, RuntimeService::class.java).setAction(action)) }
    private fun render() {
        val runtime = RuntimeService.current ?: return
        if (shownRevision == RuntimeService.revision) return
        shownRevision = RuntimeService.revision
        val follow = scroll.scrollY >= transcript.height - scroll.height - 100
        val active = runtime.activeConversation()
        title.text = "${active.title} · ${active.agent}"
        input.hint = "Message ${active.agent}"
        status.text = RuntimeService.status
        transcript.text = runtime.transcript()
        if (follow) scroll.post { scroll.fullScroll(ScrollView.FOCUS_DOWN) }
    }
    override fun onResume() { super.onResume(); handler.post(refresh) }
    override fun onPause() { handler.removeCallbacks(refresh); super.onPause() }
}
