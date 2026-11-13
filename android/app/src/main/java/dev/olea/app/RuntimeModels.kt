package dev.olea.app

data class RuntimeMessage(val role: String, val text: String, val status: String = "")
data class RuntimeInteraction(val requestId: String, val method: String, val text: String, val choices: List<String>)
data class RuntimeConversationState(
    val id: String, val agent: String, val workspaceId: String, val state: String,
    val ready: Boolean, val opening: Boolean, val messages: List<RuntimeMessage>,
    val interaction: RuntimeInteraction? = null
)
data class RuntimeTerminalState(
    val id: String, val workspaceId: String, val name: String,
    val state: String, val output: String, val columns: Int = 80, val rows: Int = 24
)
