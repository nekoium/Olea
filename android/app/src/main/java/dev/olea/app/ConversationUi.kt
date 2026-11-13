package dev.olea.app

import android.content.SharedPreferences
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.semantics.*
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import java.io.File
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@Composable internal fun ConversationScreen(snapshot: UiSnapshot, draft: Boolean, draftAgent: String, draftWorkspace: String, preferences: SharedPreferences,
    chooseAgent: () -> Unit, chooseWorkspace: () -> Unit, provider: () -> Unit, perform: (() -> Unit) -> Unit, start: () -> Unit, cancel: () -> Unit, stop: () -> Unit, send: (String, (Boolean) -> Unit) -> Unit) {
    val colors = LocalFlat.current
    val id = if (draft) "new" else snapshot.active?.id ?: "new"
    var text by rememberSaveable(id) { mutableStateOf(preferences.getString("draft-$id", "")!!) }
    var sending by remember(id) { mutableStateOf(false) }
    val keyboard = LocalSoftwareKeyboardController.current
    val scroll = rememberLazyListState()
    LaunchedEffect(snapshot.entries) {
        if (!draft && !preferences.contains("draft-$id")) text = ""
    }
    val nearBottom by remember { derivedStateOf { scroll.layoutInfo.visibleItemsInfo.lastOrNull()?.index?.let { it >= scroll.layoutInfo.totalItemsCount - 3 } ?: true } }
    LaunchedEffect(snapshot.entries, snapshot.busy) { if (nearBottom && snapshot.entries.isNotEmpty()) scroll.animateScrollToItem(snapshot.entries.lastIndex) }
    Column(Modifier.fillMaxSize()) {
        if (draft) Box(Modifier.weight(1f).fillMaxWidth().padding(28.dp), contentAlignment = Alignment.Center) { Label("What’s on your mind?", size = 26) }
        else LazyColumn(Modifier.weight(1f).fillMaxWidth(), state = scroll, contentPadding = PaddingValues(horizontal = 20.dp, vertical = 12.dp), verticalArrangement = Arrangement.spacedBy(18.dp)) {
            itemsIndexed(snapshot.entries) { index, entry -> MessageEntry(entry, "${snapshot.active?.id}-$index") }
            item {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    val state = snapshot.states.firstOrNull { it.id == snapshot.active?.id }
                    if (state != null) Chip(when (state.state) { "needs_you" -> "Needs you"; "opening" -> "Opening"; "working" -> "Working"; "done" -> "Done"; "stopped" -> "Stopped"; "error" -> "Error"; "ready" -> "Ready"; else -> "Saved" })
                    if (snapshot.entries.isEmpty()) Label("Start this conversation, then send your first message.", muted = true)
                    if (!snapshot.ready || snapshot.status.contains("uncertain", true) || snapshot.status.contains("failed", true)) {
                        Notice(snapshot.status, snapshot.status.contains("failed", true) || snapshot.status.contains("uncertain", true))
                        if (!snapshot.busy) Action(if (snapshot.environmentReady) "Start / reconnect conversation" else "Prepare and start environment", onClick = start)
                    }
                    if (state?.state == "stopped") Label("Execution stopped. Review the last result, then reconnect to continue.", muted = true)
                    if (state?.state == "error") Label("Review saved results before retrying. No message is replayed automatically.", muted = true)
                    state?.interaction?.let { interaction ->
                        Notice(interaction.text)
                        interaction.choices.forEach { choice -> Action(choice) {
                            perform { val runtime = RuntimeService.current ?: error("Environment is unavailable. Reconnect the conversation."); runtime.respondToInteraction(state.id, interaction.requestId, choice) }
                        } }
                    }
                }
            }
        }
        Column(Modifier.padding(horizontal = 14.dp).padding(bottom = 12.dp), verticalArrangement = Arrangement.spacedBy(0.dp)) {
            if (draft) Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp)).background(colors.panel).padding(10.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Action(snapshot.workspaces.firstOrNull { it.id == draftWorkspace }?.name ?: "Choose workspace", Modifier.weight(1f), onClick = chooseWorkspace)
                Action(agentNames[draftAgent] ?: "Choose agent", Modifier.weight(1f), onClick = chooseAgent)
            }
            Column(Modifier.fillMaxWidth().border(1.dp, colors.line, RoundedCornerShape(16.dp)).padding(12.dp)) {
                BasicTextField(text, { value ->
                    if (value.length <= 32000) { text = value; preferences.edit().putString("draft-$id", value).apply() }
                }, Modifier.fillMaxWidth().heightIn(min = 62.dp, max = 160.dp).verticalScroll(rememberScrollState()).semantics { contentDescription = "Message" },
                    textStyle = TextStyle(color = colors.ink, fontSize = 15.sp, lineHeight = 22.sp), cursorBrush = SolidColor(colors.accent),
                    decorationBox = { inner -> Box { if (text.isEmpty()) Label(if (draft) "Ask anything…" else "Message ${agentNames[snapshot.active?.agent].orEmpty()}…", muted = true); inner() } })
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Action("Provider ⌄", onClick = provider)
                    if (!draft && snapshot.busy) Action("■ Stop turn", enabled = snapshot.ready, onClick = cancel)
                    else Action("↑ Send", primary = true, enabled = !sending && text.isNotBlank() && if (draft) draftAgent.isNotEmpty() && draftWorkspace.isNotEmpty() else snapshot.ready) {
                        keyboard?.hide(); sending = true
                        send(text) { accepted ->
                            sending = false
                            if (accepted) { text = ""; preferences.edit().remove("draft-$id").apply() }
                        }
                    }
                }
            }
            if (!draft && snapshot.busy) Action("STOP all execution", Modifier.fillMaxWidth(), onClick = stop)
        }
    }
}

@Composable private fun MessageEntry(entry: String, key: String) {
    val colors = LocalFlat.current
    val user = entry.startsWith("user:") || entry.startsWith("userMessage:")
    val tool = entry.startsWith("tool:") || entry.startsWith("Tool") || entry.startsWith("Workspace tool:") || entry.startsWith("toolResult:") || entry.startsWith("commandExecution:")
    val error = entry.startsWith("Error:") || entry.startsWith("Pi:") || entry.startsWith("Codex:") || entry.startsWith("Claude request failed")
    var expanded by rememberSaveable(key) { mutableStateOf(false) }
    if (tool) Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(8.dp)).background(colors.tool).padding(horizontal = 12.dp)) {
        Row(Modifier.fillMaxWidth().clickable(role = Role.Button) { expanded = !expanded }.padding(vertical = 12.dp).semantics { stateDescription = if (expanded) "Expanded" else "Collapsed" }, verticalAlignment = Alignment.CenterVertically) {
            Label(entry.lineSequence().first(), Modifier.weight(1f), size = 14, maxLines = 2); Label(if (expanded) "⌃" else "⌄")
        }
        if (expanded) SelectionContainer { Label(entry.substringAfter('\n', "No additional tool output."), Modifier.padding(bottom = 12.dp), size = 12, mono = true) }
    } else {
        val text = when { user -> entry.substringAfter(": ", entry); entry.startsWith("assistant:") || entry.startsWith("agentMessage:") -> entry.substringAfter(": ", entry); else -> entry }
        SelectionContainer {
            Label(text, Modifier.fillMaxWidth().then(if (user) Modifier.padding(start = 24.dp).clip(RoundedCornerShape(16.dp)).background(colors.panel).padding(horizontal = 14.dp, vertical = 12.dp) else if (error) Modifier.clip(RoundedCornerShape(12.dp)).background(colors.error).padding(12.dp) else Modifier), color = if (error) colors.errorInk else colors.ink)
        }
    }
}

@Composable internal fun ProviderEditor(agent: String, snapshot: UiSnapshot, perform: (() -> Unit) -> Unit, saved: () -> Unit) {
    val context = LocalContext.current
    val connection = remember(agent) { runCatching { AgentConfiguration(context.filesDir).status(agent) }.getOrNull() }
    var endpoint by rememberSaveable(agent) { mutableStateOf(connection?.optString("baseUrl").orEmpty()) }
    var model by rememberSaveable(agent) { mutableStateOf(connection?.optString("model").orEmpty()) }
    // API keys never enter saved instance state or preferences.
    var key by remember(agent) { mutableStateOf("") }
    var visible by remember(agent) { mutableStateOf(false) }
    var saving by remember { mutableStateOf(false) }
    val canSave = !snapshot.busy && !snapshot.summary.startsWith("Backend: running")
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Heading("Configure ${agentNames[agent]}")
        Label(if (agent == "claude") "Anthropic Messages API" else "OpenAI Responses API", muted = true)
        Notice("Credentials stay in private app storage. Prompts and tool results go to this endpoint. Leave API key blank to keep the saved key.")
        Field("HTTPS API base URL", endpoint, { endpoint = it }, if (agent == "claude") "https://api.anthropic.com" else "https://api.openai.com/v1")
        Field("Model ID", model, { model = it }, "Your provider’s model ID")
        Field("API key", key, { key = it }, if (connection?.optBoolean("configured") == true) "Saved key retained when blank" else "Enter API key", secret = !visible)
        Action(if (visible) "Hide API key" else "Show API key") { visible = !visible }
        if (!canSave) {
            Notice("Stop the environment before changing a provider. All active sessions and terminals will be interrupted.")
            Action("STOP environment") { perform { RuntimeService.current?.stopExecution() } }
        }
        Action(if (saving) "Saving…" else "Save connection", primary = true, enabled = canSave && !saving && endpoint.isNotBlank() && model.isNotBlank()) {
            saving = true
            perform {
                try {
                    val runtime = RuntimeService.current ?: error("Environment is still opening.")
                    runtime.agentConfiguration.saveProvider(agent, endpoint.trim(), key, model.trim())
                    key = ""; saved()
                } finally { saving = false }
            }
        }
        Label("Saving checks configuration format. The first reply verifies the connection. Upstream CLI login, when supported by the agent, is available in the workspace terminal.", muted = true)
    }
}

@Composable internal fun WorkspaceFiles(workspace: WorkspaceInfo, perform: (() -> Unit) -> Unit) {
    val runtime = RuntimeService.current
    val root = remember(workspace.id) { runtime?.store?.workspaceFile(workspace) }
    var relative by rememberSaveable(workspace.id) { mutableStateOf("") }
    var listing by remember { mutableStateOf<List<File>>(emptyList()) }
    var preview by remember { mutableStateOf<String?>(null) }
    var issue by remember { mutableStateOf("") }
    LaunchedEffect(workspace.id, relative) {
        withContext(Dispatchers.IO) {
            try {
                check(root != null) { "Workspace is unavailable." }
                val selected = File(root, relative)
                check(selected.canonicalFile.toPath().startsWith(root.canonicalFile.toPath())) { "This link points outside the workspace." }
                if (selected.isDirectory) {
                    preview = null; listing = selected.listFiles()?.sortedWith(compareBy<File> { !it.isDirectory }.thenBy { it.name.lowercase() }) ?: error("Folder could not be read.")
                } else {
                    check(selected.length() <= 262144) { "This file is larger than the 256 KB preview limit. Ask the agent to inspect it." }
                    val bytes = selected.readBytes()
                    check(bytes.none { it == 0.toByte() }) { "Binary file. Ask the agent to inspect it." }
                    preview = bytes.toString(Charsets.UTF_8); listing = emptyList()
                }
                issue = ""
            } catch (error: Exception) { issue = error.message ?: "Files could not be read."; listing = emptyList(); preview = null }
        }
    }
    Page {
        Label(workspace.name, size = 20)
        Label(if (relative.isEmpty()) "/" else relative, mono = true, size = 12, muted = true)
        if (relative.isNotEmpty()) Action("Parent folder") { relative = relative.substringBeforeLast('/', "") }
        if (issue.isNotEmpty()) Notice(issue, true)
        preview?.let { SelectionContainer { Label(it.ifEmpty { "Empty file" }, size = 13, mono = true) } }
        if (preview == null && listing.isEmpty() && issue.isEmpty()) Label("This folder is empty.", muted = true)
        listing.forEach { file -> Choice(file.name + if (file.isDirectory) "/" else "", if (file.isDirectory) "Folder" else "${file.length()} bytes") { relative = if (relative.isEmpty()) file.name else "$relative/${file.name}" } }
    }
}

@Composable internal fun LicenseContent() {
    val context = LocalContext.current
    val license = remember { context.resources.openRawResource(R.raw.olea_license).bufferedReader().use { it.readText() } }
    val xtermLicense = remember { context.resources.openRawResource(R.raw.xterm_license).bufferedReader().use { it.readText() } }
    SelectionContainer { Label(license, size = 13) }
    Heading("xterm.js")
    SelectionContainer { Label(xtermLicense, size = 13) }
    Label("Android Jetpack Compose and AndroidX: Apache License 2.0. Kotlin: Apache License 2.0. xterm.js: MIT License. Runtime components retain their upstream licenses.", muted = true)
    Label("Packaged Linux, Node, PRoot and agents: see the third-party notices supplied with the release. Agent updates can change installed third-party components.", muted = true)
}
