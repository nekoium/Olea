package dev.olea.app

import android.content.SharedPreferences
import androidx.compose.animation.animateContentSize
import androidx.compose.animation.core.tween
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
import androidx.compose.ui.text.font.FontSynthesis
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
        if (draft) Column(Modifier.weight(1f).fillMaxWidth().padding(horizontal = 50.dp), verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
            Label("What’s on\nyour mind?", Modifier.widthIn(max = 230.dp), size = 27, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
            Label("Start with a question, a file, or something you want to get done.", Modifier.widthIn(max = 230.dp).padding(top = 18.dp), size = 13, muted = true, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
        }
        else LazyColumn(Modifier.weight(1f).fillMaxWidth(), state = scroll, contentPadding = PaddingValues(horizontal = 25.dp, vertical = 14.dp), verticalArrangement = Arrangement.spacedBy(25.dp)) {
            itemsIndexed(snapshot.entries) { index, entry -> MessageEntry(entry, "${snapshot.active?.id}-$index") }
            item {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    val state = snapshot.states.firstOrNull { it.id == snapshot.active?.id }
                    if (state != null) Chip(displayConversationState(state.state))
                    if (snapshot.entries.isEmpty()) Label("Start this conversation, then send your first message.", muted = true)
                    if (!snapshot.ready || snapshot.status.contains("uncertain", true) || snapshot.status.contains("failed", true)) {
                        Notice(snapshot.status, snapshot.status.contains("failed", true) || snapshot.status.contains("uncertain", true))
                        if (!snapshot.busy) Action(if (snapshot.environmentReady) "Start / reconnect conversation" else "Prepare and start environment", onClick = start)
                    }
                    if (state?.state == "stopped") Label(if (snapshot.ready) "Turn stopped. Review the partial reply, then send a follow-up to continue." else "Execution stopped. Review the last result, then reconnect to continue.", muted = true)
                    if (state?.state == "error") Label("Review saved results before retrying. No message is replayed automatically.", muted = true)
                    state?.interaction?.let { interaction ->
                        SoftCard {
                            Label("Needs your answer", size = 12, bold = true, color = colors.accent)
                            Label(interaction.text)
                            interaction.choices.forEach { choice -> Action(choice) {
                                perform { val runtime = RuntimeService.current ?: error("Environment is unavailable. Reconnect the conversation."); runtime.respondToInteraction(state.id, interaction.requestId, choice) }
                            } }
                        }
                    }
                }
            }
        }
        Column(Modifier.padding(horizontal = 18.dp).padding(bottom = 10.dp).animateContentSize(tween(280))) {
            if (draft) Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(topStart = 23.dp, topEnd = 23.dp)).background(colors.soft).padding(horizontal = 15.dp, vertical = 8.dp), horizontalArrangement = Arrangement.spacedBy(9.dp)) {
                DraftChoice("Workspace", snapshot.workspaces.firstOrNull { it.id == draftWorkspace }?.name ?: "Choose workspace", Modifier.weight(1f), chooseWorkspace)
                DraftChoice("Agent", agentNames[draftAgent] ?: "Choose agent", Modifier.weight(1f), chooseAgent)
            }
            val shape = if (draft) RoundedCornerShape(bottomStart = 24.dp, bottomEnd = 24.dp) else RoundedCornerShape(24.dp)
            Column(Modifier.fillMaxWidth().clip(shape).background(colors.paper).padding(16.dp)) {
                BasicTextField(text, { value ->
                    if (value.length <= 32000) { text = value; preferences.edit().putString("draft-$id", value).apply() }
                }, Modifier.fillMaxWidth().heightIn(min = 48.dp, max = 128.dp).verticalScroll(rememberScrollState()).semantics { contentDescription = "Message" },
                    textStyle = TextStyle(color = colors.ink, fontSize = 14.sp, lineHeight = 21.sp, fontFamily = SoftFontFamily, fontSynthesis = FontSynthesis.None), cursorBrush = SolidColor(colors.accent),
                    decorationBox = { inner -> Box { if (text.isEmpty()) Label(if (draft) "What would you like to do?" else "Message ${agentNames[snapshot.active?.agent].orEmpty()}…", muted = true); inner() } })
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Box(Modifier.weight(1f).heightIn(min = 48.dp).clickable(role = Role.Button, onClick = provider).semantics { contentDescription = "Provider configuration" }, contentAlignment = Alignment.CenterStart) {
                        Label("${agentNames[if (draft) draftAgent else snapshot.active?.agent] ?: "Provider"} / Connection ⌄", size = 10, muted = true)
                    }
                    if (!draft && snapshot.busy) Action("■ Stop turn", enabled = snapshot.ready, onClick = cancel)
                    else {
                        val enabled = !sending && text.isNotBlank() && if (draft) draftAgent.isNotEmpty() && draftWorkspace.isNotEmpty() else snapshot.ready
                        Box(Modifier.size(48.dp).clip(androidx.compose.foundation.shape.CircleShape).clickable(enabled = enabled, role = Role.Button) {
                            keyboard?.hide(); sending = true
                            send(text) { accepted ->
                                sending = false
                                if (accepted) { text = ""; preferences.edit().remove("draft-$id").apply() }
                            }
                        }.semantics { contentDescription = "Send message" }, contentAlignment = Alignment.Center) {
                            Box(Modifier.size(34.dp).clip(androidx.compose.foundation.shape.CircleShape).background(if (enabled) colors.accent else colors.soft), contentAlignment = Alignment.Center) {
                                SoftIcon("↑", color = if (enabled) colors.surface else colors.muted)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable private fun MessageEntry(entry: String, key: String) {
    val colors = LocalFlat.current
    val user = entry.startsWith("user:") || entry.startsWith("userMessage:")
    val tool = entry.startsWith("tool:") || entry.startsWith("Tool") || entry.startsWith("Workspace tool:") || entry.startsWith("toolResult:") || entry.startsWith("commandExecution:")
    val error = entry.startsWith("Error:") || entry.startsWith("Pi:") || entry.startsWith("Codex:") || entry.startsWith("Claude request failed")
    var expanded by rememberSaveable(key) { mutableStateOf(false) }
    if (tool) Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(13.dp)).background(colors.paper).padding(horizontal = 14.dp)) {
        Row(Modifier.fillMaxWidth().heightIn(min = 48.dp).clickable(role = Role.Button) { expanded = !expanded }.padding(vertical = 14.dp).semantics { stateDescription = if (expanded) "Expanded" else "Collapsed" }, verticalAlignment = Alignment.CenterVertically) {
            Label(entry.lineSequence().first(), Modifier.weight(1f), size = 11, muted = true, maxLines = 2); Label(if (expanded) "⌃" else "⌄", muted = true)
        }
        if (expanded) SelectionContainer { Label(entry.substringAfter('\n', "No additional tool output."), Modifier.padding(bottom = 14.dp), size = 11, mono = true) }
    } else {
        val text = when { user -> entry.substringAfter(": ", entry); entry.startsWith("assistant:") || entry.startsWith("assistant (") || entry.startsWith("agentMessage:") -> entry.substringAfter(": ", entry); else -> entry }
        SelectionContainer {
            if (user || error) Label(text, Modifier.fillMaxWidth().then(if (user) Modifier.padding(start = 23.dp)
                .clip(RoundedCornerShape(topStart = 22.dp, topEnd = 22.dp, bottomStart = 22.dp, bottomEnd = 5.dp)).background(colors.soft).padding(horizontal = 16.dp, vertical = 14.dp)
                else Modifier.clip(RoundedCornerShape(16.dp)).background(colors.error).padding(16.dp)), size = 14, color = if (error) colors.errorInk else colors.ink)
            else ReplyBody(text)
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
        Heading("Connect a provider")
        Label("For ${agentNames[agent]} · ${if (agent == "claude") "Anthropic Messages API" else "OpenAI Responses API"}", size = 13, muted = true)
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

@Composable internal fun foregroundRevision(): Int {
    var revision by remember { mutableIntStateOf(0) }
    val owner = LocalContext.current as? androidx.lifecycle.LifecycleOwner
    DisposableEffect(owner) {
        val observer = androidx.lifecycle.LifecycleEventObserver { _, event ->
            if (event == androidx.lifecycle.Lifecycle.Event.ON_RESUME) revision++
        }
        owner?.lifecycle?.addObserver(observer)
        onDispose { owner?.lifecycle?.removeObserver(observer) }
    }
    return revision
}

@Composable internal fun workspaceSourceStatus(id: String, revision: Long): org.json.JSONObject? {
    val status by produceState<org.json.JSONObject?>(null, id, revision) {
        value = withContext(Dispatchers.IO) {
            try { RuntimeService.current?.workspaceFolders?.status(id) }
            catch (cancelled: kotlinx.coroutines.CancellationException) { throw cancelled }
            catch (error: Exception) { org.json.JSONObject().put("state", "error").put("message", error.message ?: "Cannot read connected-folder metadata. Saved data was preserved.") }
        }
    }
    return status
}

@Composable internal fun WorkspaceFiles(workspace: WorkspaceInfo, perform: (() -> Unit) -> Unit) {
    val context = LocalContext.current
    val foreground = foregroundRevision()
    var relative by rememberSaveable(workspace.id) { mutableStateOf("") }
    var listing by remember { mutableStateOf<List<File>>(emptyList()) }
    var preview by remember { mutableStateOf<String?>(null) }
    var issue by remember { mutableStateOf("") }
    var loading by remember { mutableStateOf(true) }
    var refresh by remember { mutableIntStateOf(0) }
    val source = workspaceSourceStatus(workspace.id, RuntimeService.revision + foreground + refresh)
    LaunchedEffect(workspace.id, relative, foreground, refresh) {
        loading = true; issue = ""; listing = emptyList(); preview = null
        try {
            val result = withContext(Dispatchers.IO) {
                val runtime = RuntimeService.current ?: error("Workspace is unavailable.")
                val root = runtime.workspaceFolders.workspaceFile(workspace.id).canonicalFile
                val selected = File(root, relative).canonicalFile
                check(selected.toPath().startsWith(root.toPath())) { "This link points outside the workspace." }
                if (selected.isDirectory) {
                    val files = selected.listFiles()?.sortedWith(compareBy<File> { !it.isDirectory }.thenBy { it.name.lowercase() }) ?: error("Folder could not be read.")
                    files to null
                } else {
                    check(selected.isFile) { "This file is missing. Restore it or refresh the parent folder." }
                    val bytes = selected.inputStream().use { input ->
                        val buffer = ByteArray(262145)
                        var count = 0
                        while (count < buffer.size) {
                            val next = input.read(buffer, count, buffer.size - count)
                            if (next < 0) break
                            count += next
                        }
                        check(count <= 262144) { "This file is larger than the 256 KB preview limit. Ask the agent to inspect it." }
                        buffer.copyOf(count)
                    }
                    check(bytes.none { it == 0.toByte() }) { "Binary file. Ask the agent to inspect it." }
                    emptyList<File>() to bytes.toString(Charsets.UTF_8)
                }
            }
            listing = result.first; preview = result.second
        } catch (cancelled: kotlinx.coroutines.CancellationException) {
            throw cancelled
        } catch (error: Exception) {
            issue = error.message ?: "Files could not be read."
        } finally { loading = false }
    }
    Page {
        Heading(if (preview == null) "Files" else relative.substringAfterLast('/'))
        Label(workspace.name, size = 12, muted = true)
        if (source?.optBoolean("connected") == true) Label(source.optString("path"), mono = true, size = 12, muted = true)
        Label(if (relative.isEmpty()) "/" else relative, mono = true, size = 12, muted = true)
        if (relative.isNotEmpty()) Action("Parent folder") { relative = relative.substringBeforeLast('/', "") }
        if (issue.isNotEmpty()) {
            Notice(issue, true)
            if (source?.optBoolean("connected") == true) Action("Android storage settings") { perform { context.startActivity(AndroidSharedFolders(context).settingsIntent()) } }
        }
        Action("Refresh files", enabled = !loading) { refresh++ }
        if (loading) Label("Reading workspace…", muted = true)
        preview?.let { SelectionContainer { Label(it.ifEmpty { "Empty file" }, size = 13, mono = true) } }
        if (!loading && preview == null && listing.isEmpty() && issue.isEmpty()) Label("This folder is empty.", muted = true)
        listing.forEach { file -> Choice(file.name + if (file.isDirectory) "/" else "", if (file.isDirectory) "Folder" else "File") { relative = if (relative.isEmpty()) file.name else "$relative/${file.name}" } }
    }
}

@Composable internal fun LicenseContent() {
    val context = LocalContext.current
    val license = remember { context.resources.openRawResource(R.raw.olea_license).bufferedReader().use { it.readText() } }
    val androidUiNotices = remember { context.resources.openRawResource(R.raw.android_ui_notices).bufferedReader().use { it.readText() } }
    val cabinLicense = remember { context.resources.openRawResource(R.raw.cabin_ofl).bufferedReader().use { it.readText() } }
    SelectionContainer { Label(license, size = 13) }
    Heading("Cabin typeface")
    Label("Cabin is bundled under the SIL Open Font License 1.1. Copyright and full terms follow.", muted = true)
    SelectionContainer { Label(cabinLicense, size = 13) }
    Heading("Android UI licenses")
    Label("AndroidX, Kotlin and kotlinx.coroutines licenses and attributions appear below, including Apache 2.0, BSD and Boost terms. xterm.js uses the MIT License.", muted = true)
    SelectionContainer { Label(androidUiNotices, size = 13) }
    Label("Packaged Linux, Node, PRoot and agents: see the third-party notices supplied with the release. Agent updates can change installed third-party components.", muted = true)
}
