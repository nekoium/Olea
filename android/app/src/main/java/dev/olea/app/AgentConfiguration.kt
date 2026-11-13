package dev.olea.app

import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.net.URI

/** Agent configuration stays outside workspaces and replaceable runtime files. */
class AgentConfiguration(private val base: File, private val canChange: () -> Boolean = { true }) {
    private fun file(agent: String): File {
        require(agent in listOf("pi", "codex", "claude")) { "Unknown agent" }
        return File(base, when (agent) {
            "pi" -> "data/home/.pi/agent/models.json"
            "claude" -> "data/home/.olea/claude-provider.json"
            else -> "data/home/.olea/provider.json"
        })
    }
    private fun read(file: File): JSONObject = if (file.exists()) JSONObject(file.readText()) else JSONObject()
    private fun provider(agent: String): JSONObject {
        val values = read(file(agent))
        return if (agent == "pi") values.optJSONObject("providers")?.optJSONObject("olea") ?: JSONObject() else values
    }
    fun status(agent: String): JSONObject {
        val config = provider(agent)
        val entry = File(base, "runtime/rootfs/opt/agents/" + when (agent) {
            "pi" -> "lib/node_modules/@earendil-works/pi-coding-agent/dist/cli.js"
            "codex" -> "lib/node_modules/@openai/codex/bin/codex.js"
            else -> "bin/claude"
        })
        val version = File(base, "data/home/.olea/$agent-version.txt")
        return JSONObject().put("agent", agent).put("installed", entry.exists())
            .put("version", if (version.isFile) version.readText().trim().take(160) else "")
            .put("configured", config.optString("apiKey").isNotBlank())
            .put("authMode", if (config.optString("apiKey").isNotBlank()) "provider" else "upstream_cli")
            .put("baseUrl", config.optString("baseUrl"))
            .put("model", if (agent == "pi") config.optJSONArray("models")?.optJSONObject(0)?.optString("id") ?: "" else config.optString("model"))
    }
    fun saveProvider(agent: String, baseUrl: String, apiKey: String, model: String) {
        check(canChange()) { "Stop the environment before changing provider settings" }
        val uri = runCatching { URI(baseUrl.trim()) }.getOrNull()
        require(uri?.scheme == "https" && !uri.host.isNullOrBlank() && uri.userInfo == null && uri.query == null && uri.fragment == null) { "Enter an HTTPS API base URL" }
        val modelId = model.trim()
        require(modelId.isNotBlank() && modelId.length <= 256 && modelId.none { it.isISOControl() }) { "Enter a valid model ID" }
        val key = apiKey.ifEmpty { provider(agent).optString("apiKey") }
        require(key.isNotBlank() && key.length <= 16384 && key.none { it.isISOControl() }) { "Enter an API key" }
        val target = file(agent)
        val config = if (agent == "pi") read(target) else JSONObject()
        val value = JSONObject().put("baseUrl", baseUrl.trim().trimEnd('/')).put("apiKey", key)
        if (agent == "pi") {
            value.put("api", "openai-responses").put("models", org.json.JSONArray().put(JSONObject()
                .put("id", modelId).put("name", modelId).put("reasoning", false)
                .put("input", org.json.JSONArray().put("text")).put("contextWindow", 128000).put("maxTokens", 4096)
                .put("cost", JSONObject().put("input", 0).put("output", 0).put("cacheRead", 0).put("cacheWrite", 0))))
            val providers = config.optJSONObject("providers") ?: JSONObject()
            providers.put("olea", value); config.put("providers", providers)
        } else value.put("model", modelId)
        atomic(target, if (agent == "pi") config else value)
        if (agent == "pi") {
            val settings = File(target.parentFile, "settings.json")
            atomic(settings, read(settings).put("defaultProvider", "olea").put("defaultModel", modelId))
        }
    }
    fun clearProvider(agent: String) {
        check(canChange()) { "Stop the environment before changing provider settings" }
        val target = file(agent)
        if (agent == "pi") {
            val config = read(target)
            config.optJSONObject("providers")?.remove("olea")
            atomic(target, config)
            val settings = File(target.parentFile, "settings.json")
            val values = read(settings)
            if (values.optString("defaultProvider") == "olea") { values.remove("defaultProvider"); values.remove("defaultModel"); atomic(settings, values) }
        } else if (target.exists()) check(target.delete()) { "Cannot remove provider configuration" }
    }
    internal fun redact(text: String): String {
        var safe = text
        for (agent in listOf("pi", "codex", "claude")) runCatching {
            val key = provider(agent).optString("apiKey")
            if (key.isNotEmpty()) safe = safe.replace(key, "[REDACTED]")
        }
        return safe.replace(Regex("(?i)(bearer\\s+|(?:api[_-]?key|token|password)\\s*[=:]\\s*)[^\\s,;]+"), "$1[REDACTED]")
    }
    private fun atomic(file: File, json: JSONObject) {
        check(file.parentFile!!.isDirectory || file.parentFile!!.mkdirs()) { "Cannot create configuration directory" }
        val staging = File(file.parentFile, "${file.name}.tmp")
        FileOutputStream(staging).use { it.write(json.toString().toByteArray()); it.fd.sync() }
        staging.setReadable(false, false); staging.setWritable(false, false)
        check(staging.setReadable(true, true) && staging.setWritable(true, true)) { "Cannot protect provider configuration" }
        check(staging.renameTo(file)) { "Cannot save provider configuration" }
    }
}
