package dev.olea.app

import android.app.Activity
import android.app.AlertDialog
import android.text.InputType
import org.json.JSONObject
import java.io.File
import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.Gravity
import android.view.ViewGroup
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView

class MainActivity : Activity() {
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
        root.setOnApplyWindowInsetsListener { view, insets ->
            view.setPadding(24, insets.systemWindowInsetTop + 16, 24, insets.systemWindowInsetBottom + 16)
            insets
        }
        val title = TextView(this).apply { text = "Olea · Pi"; textSize = 24f; setTextColor(Color.BLACK) }
        status = TextView(this).apply { textSize = 14f; setPadding(0, 8, 0, 8) }
        val controls = LinearLayout(this).apply { gravity = Gravity.CENTER_VERTICAL }
        fun button(label: String, action: () -> Unit) = Button(this).apply { text = label; isAllCaps = false; setPadding(4, 0, 4, 0); maxLines = 1; setOnClickListener { action() }; controls.addView(this, LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f)) }
        button("Start") { service("start") }
        button("STOP") { service("stop") }
        button("Settings") { configure() }
        button("Workspace") {
            val command = EditText(this).apply { hint = "Shell command in /workspace" }
            AlertDialog.Builder(this).setTitle("Workspace shell").setView(command)
                .setMessage("Runs locally through Pi without a model request.")
                .setNegativeButton("Cancel", null).setPositiveButton("Run") { _, _ -> RuntimeService.current?.workspace(command.text.toString()) }.show()
        }
        transcript = TextView(this).apply { textSize = 16f; setTextColor(Color.DKGRAY); setPadding(0, 12, 0, 12) }
        scroll = ScrollView(this).apply { addView(transcript) }
        input = EditText(this).apply { hint = "Message Pi"; setSingleLine(false); maxLines = 4 }
        val send = Button(this).apply { text = "Send"; setOnClickListener {
            val value = input.text.toString()
            if (RuntimeService.conversationReady && !RuntimeService.busy && value.isNotBlank()) { RuntimeService.current?.prompt(value); input.text.clear() }
        } }
        root.addView(title); root.addView(status); root.addView(controls); root.addView(scroll, LinearLayout.LayoutParams(-1, 0, 1f)); root.addView(input); root.addView(send)
        setContentView(root)
        startService(Intent(this, RuntimeService::class.java))
    }
    private fun configure() {
        if (RuntimeService.busy || RuntimeService.conversationReady) {
            AlertDialog.Builder(this).setMessage("Tap STOP before changing provider settings.").setPositiveButton("OK", null).show()
            return
        }
        val fields = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(32, 8, 32, 8) }
        val url = EditText(this).apply { hint = "HTTPS OpenAI-compatible base URL"; inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_URI }
        val model = EditText(this).apply { hint = "Model ID"; setSingleLine(true) }
        val key = EditText(this).apply { hint = "API key"; inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD }
        fields.addView(url); fields.addView(model); fields.addView(key)
        val config = File(filesDir, "data/home/.pi/agent/models.json")
        runCatching {
            val saved = JSONObject(config.readText()).getJSONObject("providers").getJSONObject("olea")
            url.setText(saved.getString("baseUrl")); model.setText(saved.getJSONArray("models").getJSONObject(0).getString("id"))
        }
        val dialog = AlertDialog.Builder(this).setTitle("Pi provider").setView(fields)
            .setMessage("Stored in private Pi home. Model messages leave the phone for this provider. Leave API key blank to retain the saved key.")
            .setNegativeButton("Cancel", null).setPositiveButton("Save", null).create()
        dialog.setOnShowListener {
            dialog.getButton(AlertDialog.BUTTON_POSITIVE).setOnClickListener {
                val baseUrl = url.text.toString().trim()
                val modelId = model.text.toString().trim()
                val uri = android.net.Uri.parse(baseUrl)
                if (uri.scheme != "https" || uri.host.isNullOrBlank() || modelId.isBlank()) { url.error = "Enter an HTTPS URL and model ID"; return@setOnClickListener }
                val savedKey = runCatching { JSONObject(config.readText()).getJSONObject("providers").getJSONObject("olea").getString("apiKey") }.getOrDefault("")
                val apiKey = key.text.toString().ifEmpty { savedKey }
                if (apiKey.isBlank()) { key.error = "Enter an API key"; return@setOnClickListener }
                try {
                    config.parentFile!!.mkdirs()
                    val provider = JSONObject().put("baseUrl", baseUrl).put("apiKey", apiKey).put("api", "openai-completions")
                        .put("models", org.json.JSONArray().put(JSONObject().put("id", modelId).put("name", modelId).put("reasoning", false)
                            .put("input", org.json.JSONArray().put("text")).put("contextWindow", 128000).put("maxTokens", 4096)
                            .put("cost", JSONObject().put("input", 0).put("output", 0).put("cacheRead", 0).put("cacheWrite", 0))))
                    val temporary = File(config.parentFile, "models.tmp")
                    temporary.writeText(JSONObject().put("providers", JSONObject().put("olea", provider)).toString())
                    temporary.setReadable(false, false); temporary.setReadable(true, true)
                    check(temporary.renameTo(config))
                    val settings = File(config.parentFile, "settings.json")
                    val values = runCatching { JSONObject(settings.readText()) }.getOrDefault(JSONObject())
                    values.put("defaultProvider", "olea").put("defaultModel", modelId)
                    settings.writeText(values.toString())
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
        status.text = RuntimeService.status
        transcript.text = runtime.transcript()
        if (follow) scroll.post { scroll.fullScroll(ScrollView.FOCUS_DOWN) }
    }
    override fun onResume() { super.onResume(); handler.post(refresh) }
    override fun onPause() { handler.removeCallbacks(refresh); super.onPause() }
}
