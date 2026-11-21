package dev.olea.app

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.saveable.rememberSaveableStateHolder
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import kotlinx.coroutines.launch
import java.io.File

internal val agentNames = linkedMapOf("pi" to "Pi", "codex" to "Codex", "claude" to "Claude Code")
private fun agentName(id: String?) = agentNames[id] ?: "Choose agent"

@Composable internal fun OleaApp(snapshot: UiSnapshot, failure: String, revision: Long, dismissError: () -> Unit, perform: (() -> Unit) -> Unit, phoneAccess: () -> Unit) {
    val context = LocalContext.current
    val preferences = remember { context.getSharedPreferences("olea-ui", Context.MODE_PRIVATE) }
    var appearance by rememberSaveable { mutableStateOf(preferences.getString("appearance", "system")!!) }
    var palette by rememberSaveable { mutableStateOf(softPalette(preferences.getString("palette", null)).id) }
    val dark = appearance == "dark" || (appearance == "system" && isSystemInDarkTheme())
    SideEffect {
        val activity = context as? android.app.Activity
        if (activity != null) androidx.core.view.WindowCompat.getInsetsController(activity.window, activity.window.decorView).apply {
            isAppearanceLightStatusBars = !dark; isAppearanceLightNavigationBars = !dark
        }
    }
    var setup by rememberSaveable { mutableStateOf(!preferences.getBoolean("setup-complete", false)) }
    var setupStep by rememberSaveable { mutableIntStateOf(preferences.getInt("setup-step", 0)) }
    var setupAgent by rememberSaveable { mutableStateOf(preferences.getString("setup-agent", "")!!) }
    var setupWorkspace by rememberSaveable { mutableStateOf(preferences.getString("setup-workspace", "")!!) }
    var screen by rememberSaveable { mutableStateOf(if (setup) "setup" else if (preferences.getBoolean("fresh-chat", false)) "draft" else "chat") }
    val terminalState = rememberSaveableStateHolder()
    val history = remember { mutableStateListOf<String>() }
    var drawer by rememberSaveable { mutableStateOf(false) }
    var details by rememberSaveable { mutableStateOf(false) }
    var filter by rememberSaveable { mutableStateOf("") }
    var draftAgent by rememberSaveable { mutableStateOf("") }
    var draftWorkspace by rememberSaveable { mutableStateOf("") }
    var managedName by rememberSaveable { mutableStateOf("") }
    var connectionName by rememberSaveable { mutableStateOf("") }
    var connectionForSetup by rememberSaveable { mutableStateOf(false) }
    val foreground = foregroundRevision()
    val sourceRevision = revision + RuntimeService.revision + foreground
    var inspectedWorkspace by rememberSaveable { mutableStateOf("") }
    var providerAgent by rememberSaveable { mutableStateOf("pi") }
    var picker by remember { mutableStateOf("") }
    var confirmStop by remember { mutableStateOf(false) }
    var showDiagnostics by remember { mutableStateOf(false) }
    var search by rememberSaveable { mutableStateOf("") }
    var pendingFirstSend by remember { mutableStateOf<Pair<String, String>?>(null) }
    val operations = rememberUpdatedState(perform)
    LaunchedEffect(snapshot.active?.id, snapshot.ready, pendingFirstSend) {
        val pending = pendingFirstSend
        if (pending != null && snapshot.active?.id == pending.first && snapshot.ready) {
            pendingFirstSend = null
            operations.value {
                val runtime = RuntimeService.current ?: error("Environment is unavailable. Reconnect the conversation.")
                check(runtime.activeConversation().id == pending.first) { "The selected conversation changed. Open your saved draft and send again." }
                check(runtime.prompt(pending.second) == true) { "Message was not sent. Review the saved draft and send again." }
                preferences.edit().remove("draft-${pending.first}").apply()
            }
        }
    }
    val currentWorkspace = snapshot.workspaces.firstOrNull { it.id == (if (screen == "draft") draftWorkspace else snapshot.active?.workspaceId) }
    val workspace = snapshot.workspaces.firstOrNull { it.id == inspectedWorkspace } ?: currentWorkspace
    fun runtime() = RuntimeService.current ?: error("Environment is still opening. Try again shortly.")
    fun go(next: String) { if (screen != next) history.add(screen); screen = next; drawer = false; details = false }
    fun back() { if (history.isNotEmpty()) screen = history.removeAt(history.lastIndex) else if (!setup) screen = "history" }
    fun step(next: Int) { setupStep = next; preferences.edit().putInt("setup-step", next).apply() }
    fun newChat() {
        draftAgent = ""; pendingFirstSend = null; draftWorkspace = filter.ifEmpty { snapshot.active?.workspaceId.orEmpty() }
        go("draft")
    }
    val folderPicker = rememberLauncherForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        if (result.resultCode == android.app.Activity.RESULT_OK) perform {
            val path = result.data?.getStringExtra(SharedFolderActivity.EXTRA_PATH) ?: error("No folder was selected. Try connecting again.")
            val name = connectionName.ifBlank { result.data?.getStringExtra(SharedFolderActivity.EXTRA_NAME).orEmpty() }
            val item = runtime().createConnectedWorkspace(name, path)
            managedName = ""
            if (connectionForSetup) {
                setupWorkspace = item.id
                preferences.edit().putString("setup-workspace", item.id).apply()
            } else {
                filter = item.id; inspectedWorkspace = item.id; go("workspace")
            }
        }
    }
    fun connectFolder(forSetup: Boolean) {
        connectionName = managedName.trim()
        connectionForSetup = forSetup
        folderPicker.launch(Intent(context, SharedFolderActivity::class.java))
    }
    BackHandler(drawer || details || picker.isNotBlank() || confirmStop || history.isNotEmpty() || screen !in listOf("history", "setup")) {
        when { drawer -> drawer = false; details -> details = false; picker.isNotBlank() -> picker = ""; confirmStop -> confirmStop = false; else -> back() }
    }
    CompositionLocalProvider(LocalFlat provides if (dark) softPalette(palette).dark else softPalette(palette).light) {
        val colors = LocalFlat.current
        Column(Modifier.fillMaxSize().background(colors.surface).safeDrawingPadding().imePadding()) {
            val heading = when (screen) {
                "setup" -> "Set up Olea"; "history" -> "Conversations"; "draft" -> "New conversation"
                "chat" -> snapshot.active?.title ?: "Olea"; "workspaces" -> "Workspaces"; "create" -> "Create workspace"
                "workspace" -> workspace?.name ?: "Workspace"; "provider" -> "Configure ${agentName(providerAgent)}"
                "files", "file" -> "Workspace files"; "terminal" -> "${workspace?.name.orEmpty()} · Terminal"
                "phone" -> "Phone access"; "agents" -> "Agents"; "providers" -> "Providers"; "environment" -> "Environment"
                "settings" -> "Settings"; "about" -> "Olea"; "licenses" -> "Licenses"; else -> "Olea"
            }
            val mainDestination = screen in listOf("chat", "draft", "history", "workspaces")
            val keyboardVisible = WindowInsets.ime.getBottom(androidx.compose.ui.platform.LocalDensity.current) > 0
            Row(Modifier.fillMaxWidth().heightIn(min = 68.dp).padding(horizontal = 13.dp, vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
                if (screen == "setup") {
                    if (setupStep > 0) Glyph("‹", "Previous setup step") { step(setupStep - 1) } else Spacer(Modifier.width(10.dp))
                } else Glyph(if (mainDestination) "☰" else "‹", if (mainDestination) "Open app menu" else "Back") { if (mainDestination) drawer = true else back() }
                Column(Modifier.weight(1f).padding(horizontal = 4.dp)) {
                    Label(heading, size = 16, bold = true, maxLines = 1)
                    if (screen == "chat") Label("${currentWorkspace?.name.orEmpty()} / ${agentName(snapshot.active?.agent)}", size = 11, muted = true, maxLines = 1)
                    if (screen == "terminal") Label("Workspace shell", size = 11, muted = true)
                }
                if (!setup && mainDestination) {
                    if (screen != "draft") Glyph("＋", "New conversation") { newChat() }
                    if (screen in listOf("chat", "draft")) Glyph("⋯", "Conversation details") { details = true }
                }
            }
            if (failure.isNotBlank()) Column(Modifier.padding(horizontal = 16.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Notice(failure, true); Action("Dismiss", onClick = dismissError)
            }
            Box(Modifier.weight(1f)) {
                when (screen) {
                    "setup" -> Page {
                        when (setupStep) {
                            0 -> {
                                Spacer(Modifier.height(25.dp))
                                Image(painterResource(R.drawable.seed_icon), "Olea leaf", Modifier.size(63.dp).clip(RoundedCornerShape(23.dp)))
                                Spacer(Modifier.height(10.dp))
                                Label("A little space.\nA lot of possibility.", size = 38)
                                Label("Your agents, conversations and workspace files.\nOn your phone.", size = 13, muted = true)
                                Notice("Agents run locally. Model requests use your chosen provider. Agents can change files and run commands.")
                                Action("Set up Olea", primary = true) { step(1) }
                            }
                            1 -> {
                                Heading("Who will you work with?")
                                Label("Choose one to set up now. You can add the others later.", muted = true)
                                agentNames.forEach { (id, name) -> Choice(name, when (id) { "pi" -> "Stock Pi · Responses provider"; "codex" -> "Stock Codex · Responses provider"; else -> "Stock Claude Code · Anthropic provider" }, if (setupAgent == id) "Selected" else "", setupAgent == id) {
                                    setupAgent = id; preferences.edit().putString("setup-agent", id).apply()
                                } }
                                Action("Continue", primary = true, enabled = setupAgent.isNotBlank()) { step(2) }
                            }
                            2 -> {
                                Heading("Choose a workspace")
                                Label("Workspaces organize conversations and set the starting folder. After Android all-files access, agents can also use shared phone files outside any workspace.", muted = true)
                                SharedStorageAccess(sourceRevision)
                                snapshot.workspaces.forEach { item ->
                                    val source = workspaceSourceStatus(item.id, sourceRevision)
                                    val detail = when {
                                        source == null -> "Checking workspace source…"
                                        source.optString("state") == "error" -> "Source unavailable"
                                        source.optBoolean("connected") -> source.optString("path")
                                        else -> "Managed workspace"
                                    }
                                    Choice(item.name, detail, if (setupWorkspace == item.id) "Selected" else "", setupWorkspace == item.id) { setupWorkspace = item.id; preferences.edit().putString("setup-workspace", item.id).apply() }
                                }
                                Field("New workspace name", managedName, { managedName = it }, "Project name")
                                Action("Create workspace", enabled = managedName.isNotBlank() && snapshot.available) { perform {
                                    val created = runtime().store.createWorkspace(managedName); setupWorkspace = created.id; managedName = ""; preferences.edit().putString("setup-workspace", created.id).apply()
                                } }
                                Action("Connect existing folder", enabled = snapshot.available && !snapshot.busy && !snapshot.summary.startsWith("Backend: running")) { connectFolder(true) }
                                Label("Connecting a folder requires a stopped environment and Android all-files access. Existing content stays in place.", size = 12, muted = true)
                                val selectedSource = workspaceSourceStatus(setupWorkspace, sourceRevision)
                                if (selectedSource != null && selectedSource.optString("state") !in listOf("managed", "available")) {
                                    Notice(selectedSource.optString("message", "Folder access is unavailable."), true)
                                    if (selectedSource.optBoolean("connected")) Action("Android storage settings") { perform { context.startActivity(AndroidSharedFolders(context).settingsIntent()) } }
                                }
                                if (snapshot.busy || snapshot.summary.startsWith("Backend: running")) Action("STOP environment to connect a folder") { confirmStop = true }
                                Action("Continue", primary = true, enabled = setupWorkspace.isNotBlank() && snapshot.available) { perform {
                                    runtime().workspaceFolders.requireAvailable(setupWorkspace)
                                    val existing = preferences.getString("setup-session", null)?.let { id -> runtime().store.conversations().firstOrNull { it.id == id && it.agent == setupAgent && it.workspaceId == setupWorkspace } }
                                    val session = existing ?: runtime().store.createConversation("First conversation", setupAgent, setupWorkspace)
                                    runtime().selectConversation(session.id); preferences.edit().putString("setup-session", session.id).apply(); step(3)
                                } }
                            }
                            3 -> {
                                Heading("Prepare environment")
                                Label("Set up local Linux, Node and workspace tools. Internet and free storage are required. Setup can take several minutes.", muted = true)
                                Notice(snapshot.status, snapshot.status.contains("failed", true))
                                if (snapshot.environmentReady) {
                                    Notice("Linux is prepared. Stop execution before installing an agent or changing provider settings.")
                                    Action("STOP environment", enabled = !snapshot.status.startsWith("Stopping")) { perform { runtime().stopExecution() } }
                                    Action("Continue", primary = true, enabled = !snapshot.busy && !snapshot.summary.startsWith("Backend: running")) { step(4) }
                                } else Action(if (snapshot.busy) "Preparing…" else "Prepare environment", primary = true, enabled = snapshot.available && !snapshot.busy) { perform { runtime().prepareEnvironment() } }
                                if (snapshot.busy) Action("Cancel preparation") { perform { runtime().stopExecution() } }
                            }
                            4 -> {
                                Heading("Install ${agentName(setupAgent)}")
                                Notice(snapshot.status)
                                val installed = agentInstalled(context, setupAgent, revision + if (snapshot.environmentReady) 1 else 0)
                                Label(if (installed) "Agent package is installed. Configure its provider next." else "Install the stock agent through its upstream package channel.", muted = true)
                                if (!installed) Action(if (snapshot.busy) "Installing…" else "Install agent", primary = true, enabled = !snapshot.busy) { perform { runtime().maintainAgent(setupAgent, "install") } }
                                Action("Configure provider", primary = installed, enabled = installed && !snapshot.busy) { step(5) }
                            }
                            5 -> ProviderEditor(setupAgent, snapshot, perform) { step(6) }
                            6 -> {
                                Heading("Phone access")
                                Label("Optional access lets agents interact with your phone. Android controls each grant separately. You can review this later.", muted = true)
                                SharedStorageAccess(sourceRevision)
                                PhoneSummary()
                                Action("Review Android access", onClick = phoneAccess)
                                Action("Skip optional capabilities", primary = true) { step(7) }
                                Action("Continue with current access") { step(7) }
                            }
                            else -> {
                                Heading("Start your first conversation")
                                SoftCard {
                                    Label(agentName(setupAgent), bold = true)
                                    Label(snapshot.workspaces.firstOrNull { it.id == setupWorkspace }?.name.orEmpty(), size = 12, muted = true)
                                    Label(if (snapshot.environmentReady) "Linux prepared · Provider configuration saved" else "Environment needs attention", size = 12, muted = true)
                                }
                                Label("The first reply checks your provider connection. If it fails, edit the provider and retry explicitly.", muted = true)
                                Action("Open conversation", primary = true) {
                                    preferences.edit().putBoolean("setup-complete", true).apply(); setup = false; screen = "chat"; history.clear()
                                }
                            }
                        }
                        if (setupStep in 3..4) Action("View diagnostics") { showDiagnostics = true }
                    }
                    "history" -> Page {
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Action(snapshot.workspaces.firstOrNull { it.id == filter }?.name ?: "All workspaces", Modifier.weight(1f)) { picker = "filter" }
                            if (filter.isNotEmpty()) Action("Details") { inspectedWorkspace = filter; go("workspace") }
                        }
                        Field("Search conversations", search, { search = it }, "Title, workspace or agent")
                        val list = snapshot.conversations.asReversed().filter { item -> (filter.isEmpty() || item.workspaceId == filter) && "${item.title} ${item.agent} ${snapshot.workspaces.firstOrNull { it.id == item.workspaceId }?.name}".contains(search, true) }
                        if (list.isEmpty()) { Heading("No conversations here"); Label("Start a conversation in this workspace.", muted = true) }
                        list.forEach { item ->
                            val name = snapshot.workspaces.firstOrNull { it.id == item.workspaceId }?.name.orEmpty()
                            val state = snapshot.states.firstOrNull { it.id == item.id }
                            ConversationRow(item.title, "${if (filter.isEmpty()) "$name / " else ""}${agentName(item.agent)}",
                                state?.messages?.lastOrNull { it.role == "assistant" || it.role == "user" }?.text.orEmpty(),
                                state?.state?.let(::displayConversationState) ?: "Saved") {
                                pendingFirstSend = null; perform { runtime().selectConversation(item.id); go("chat") }
                            }
                        }
                        Action("New conversation", primary = true) { newChat() }
                    }
                    "draft", "chat" -> ConversationScreen(snapshot, screen == "draft", draftAgent, draftWorkspace, preferences,
                        chooseAgent = { picker = "agent" }, chooseWorkspace = { picker = "workspace" }, perform = perform,
                        provider = {
                            if (screen == "draft" && draftAgent.isEmpty()) picker = "agent"
                            else { providerAgent = if (screen == "draft") draftAgent else snapshot.active?.agent ?: "pi"; go("provider") }
                        },
                        start = { perform { runtime().startEnvironment() } },
                        cancel = { perform { runtime().cancelTurn() } }, stop = { confirmStop = true },
                        send = { text, completed ->
                            val creating = screen == "draft"
                            val chosenAgent = draftAgent
                            val chosenWorkspace = draftWorkspace
                            val targetSession = snapshot.active?.id
                            perform {
                                var accepted = false
                                try {
                                    if (creating) {
                                        check(chosenAgent.isNotBlank()) { "Choose an agent before sending." }
                                        check(chosenWorkspace.isNotBlank()) { "Choose a workspace before sending." }
                                        runtime().workspaceFolders.requireAvailable(chosenWorkspace)
                                        val title = text.lineSequence().first().take(64).replace(Regex("[/\\\\:\\p{Cntrl}]"), " ").trim().takeUnless { it.isEmpty() || it == "." || it == ".." } ?: "Conversation"
                                        val session = runtime().store.createConversation(title, chosenAgent, chosenWorkspace)
                                        runtime().selectConversation(session.id)
                                        preferences.edit().putString("draft-${session.id}", text).remove("draft-new").apply()
                                        pendingFirstSend = session.id to text
                                        screen = "chat"; runtime().startEnvironment()
                                    } else {
                                        check(runtime().activeConversation().id == targetSession) { "The selected conversation changed. Open your draft and send again." }
                                        check(runtime().prompt(text)) { "Conversation is not ready. Start it, then send again." }
                                    }
                                    accepted = true
                                } finally { completed(accepted) }
                            }
                        })
                    "workspaces" -> Page {
                        Heading("Spaces for your work")
                        snapshot.workspaces.forEach { item -> SoftCard {
                            Choice(item.name, "${snapshot.conversations.count { it.workspaceId == item.id }} conversations") { filter = item.id; go("history") }
                        } }
                        Action("Create workspace", primary = true) { managedName = ""; go("create") }
                        Label("Select a workspace to see its conversations. Open conversation details to inspect files and tools.", muted = true)
                    }
                    "create" -> Page {
                        Heading("Create a workspace")
                        Field("Workspace name", managedName, { managedName = it }, "Project name")
                        Action("Create workspace", primary = true, enabled = managedName.isNotBlank()) { perform { val item = runtime().store.createWorkspace(managedName); filter = item.id; inspectedWorkspace = item.id; managedName = ""; go("history") } }
                        Label("Create a private workspace, or connect a folder from primary shared storage. Connected folders keep their existing files; agent edits apply directly.", muted = true)
                        Action("Connect existing folder", enabled = snapshot.available && !snapshot.busy && !snapshot.summary.startsWith("Backend: running")) { connectFolder(false) }
                        if (snapshot.busy || snapshot.summary.startsWith("Backend: running")) {
                            Notice("Stop the environment before connecting a folder. Active conversations and terminals will stop.")
                            Action("STOP environment") { confirmStop = true }
                        }
                    }
                    "workspace" -> Page {
                        Heading(workspace?.name ?: "Workspace")
                        if (workspace != null) {
                            val source = workspaceSourceStatus(workspace.id, sourceRevision)
                            Notice(when {
                                source == null -> "Checking workspace source…"
                                source.optString("state") == "error" -> "Workspace source unavailable"
                                source.optBoolean("connected") -> "Connected folder\n${source.optString("path")}\n/workspace/${workspace.relativePath}"
                                else -> "Managed workspace\n${if (workspace.relativePath.isEmpty()) "/workspace" else "/workspace/${workspace.relativePath}"}"
                            })
                            if (source != null && source.optString("state") !in listOf("managed", "available")) {
                                Notice(source.optString("message", "Folder access is unavailable."), true)
                                if (source.optBoolean("connected")) Action("Android storage settings") { perform { context.startActivity(AndroidSharedFolders(context).settingsIntent()) } }
                            }
                            Choice("Conversations", "Saved sessions in this workspace") { filter = workspace.id; go("history") }
                            Choice("Files", "Browse workspace files") { go("files") }
                            Choice("Terminal", "Workspace command tools") { go("terminal") }
                        }
                    }
                    "files", "file" -> if (workspace != null) WorkspaceFiles(workspace, perform) else Page { Notice("Select a workspace first.") }
                    "terminal" -> terminalState.SaveableStateProvider(workspace?.id.orEmpty()) {
                        WorkspaceTerminal(snapshot, workspace, perform)
                    }
                    "agents" -> Page {
                        Heading("Your agents")
                        Label("Each conversation keeps its agent. Choose another when you start a new conversation.", size = 13, muted = true)
                        agentNames.forEach { (id, name) ->
                            val installed = agentInstalled(context, id, revision + RuntimeService.revision)
                            SoftCard {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                    Column(Modifier.weight(1f)) { Label(name, bold = true); Label(if (installed) "Installed" else "Not installed", size = 11, muted = true) }
                                    Action("Configure") { providerAgent = id; go("provider") }
                                }
                                Action(if (installed) "Update $name" else "Install $name", enabled = snapshot.environmentReady && !snapshot.busy && !snapshot.summary.startsWith("Backend: running")) { perform { runtime().maintainAgent(id, if (installed) "update" else "install") } }
                            }
                        }
                        Notice(snapshot.status)
                        Label("Stop the environment before agent maintenance. Preparing Linux and installing agents are separate steps.", muted = true)
                        Action("Environment") { go("environment") }
                    }
                    "providers" -> Page {
                        Heading("Your connections")
                        Label("Each adapter uses its own connection. Messages and tool results are sent to the provider configured for that agent.", muted = true)
                        agentNames.forEach { (id, name) ->
                            val saved = remember(revision, id) { runCatching { AgentConfiguration(context.filesDir).status(id) }.getOrNull() }
                            Choice(name, saved?.optString("model")?.ifEmpty { "No model configured" } ?: "Configuration needs attention", if (saved?.optBoolean("configured") == true) "Saved" else "Not set up") { providerAgent = id; go("provider") }
                        }
                    }
                    "provider" -> Page { ProviderEditor(providerAgent, snapshot, perform) { back() } }
                    "phone" -> Page {
                        Heading("Phone access")
                        Label("Enable only the capabilities you want. STOP disables phone tools. Android grants can remain enabled; tools must be explicitly enabled again.", muted = true)
                        SharedStorageAccess(sourceRevision)
                        PhoneSummary(); Action("Manage Android access", primary = true, onClick = phoneAccess)
                    }
                    "environment" -> Page {
                        Heading("Local environment")
                        Notice(snapshot.status, snapshot.status.contains("failed", true))
                        SharedStorageAccess(sourceRevision)
                        SelectionContainer { Label(snapshot.summary, mono = true, size = 13) }
                        Label(if (snapshot.environmentReady) "Linux is prepared." else "Linux preparation is required before agents can run.", muted = true)
                        Action(if (snapshot.busy) "Starting or working…" else "Start / reconnect selected conversation", primary = true, enabled = snapshot.available && !snapshot.busy) { perform { runtime().startEnvironment() } }
                        Action("STOP all execution") { confirmStop = true }
                        Choice("Diagnostics", "Setup and installation details") { showDiagnostics = true }
                        Label("Android can end background processes. Saved messages remain available. Restarting does not replay prompts.", muted = true)
                    }
                    "settings" -> Page {
                        SectionLabel("When Olea opens")
                        var fresh by remember { mutableStateOf(preferences.getBoolean("fresh-chat", false)) }
                        Column {
                            PreferenceChoice("Resume last active session", selected = !fresh) { fresh = false; preferences.edit().putBoolean("fresh-chat", false).apply() }
                            PreferenceChoice("Open a fresh chat", selected = fresh) { fresh = true; preferences.edit().putBoolean("fresh-chat", true).apply() }
                        }
                        SectionLabel("Appearance")
                        Column {
                            listOf("system" to "Follow Android", "light" to "Light", "dark" to "Dark").forEach { (value, title) -> PreferenceChoice(title, selected = appearance == value) { appearance = value; preferences.edit().putString("appearance", value).apply() } }
                        }
                        SectionLabel("Color palette")
                        PaletteChoices(palette) { value -> palette = value; preferences.edit().putString("palette", value).apply() }
                    }
                    "about" -> Page {
                        Image(painterResource(R.drawable.seed_icon), "Olea leaf", Modifier.size(76.dp).clip(RoundedCornerShape(18.dp)))
                        Heading("Olea")
                        Label("Your agents. On your phone.", size = 19)
                        Notice("Version ${BuildConfig.VERSION_NAME}\n${BuildConfig.RUNTIME_ABI}")
                        Label("Run stock Pi, Codex and Claude Code locally, with workspace files and permission-controlled phone tools.", muted = true)
                        Choice("Licenses", "Olea and third-party components") { go("licenses") }
                    }
                    "licenses" -> Page {
                        Heading("Licenses")
                        Label("Original Olea code is licensed under the MIT License. Copyright (c) 2026 Olea contributors.")
                        LicenseContent()
                    }
                }
            }
            if (!setup && mainDestination && !keyboardVisible) {
                Row(Modifier.fillMaxWidth().padding(horizontal = 12.dp)) {
                    Destination("Conversations", "chat", screen in listOf("history", "chat", "draft"), Modifier.weight(1f)) { go("history") }
                    Destination("Workspaces", "folder", screen == "workspaces", Modifier.weight(1f)) { go("workspaces") }
                }
            }
        }
        if (showDiagnostics) FlatDialog("Environment diagnostics", { showDiagnostics = false }) {
            SelectionContainer { Label(snapshot.diagnostics.ifEmpty { "No diagnostics recorded yet." }, mono = true, size = 12) }
        }
        if (drawer) FlatDialog("Olea", { drawer = false }) {
            listOf("Agents" to "agents", "Providers" to "providers", "Environment" to "environment", "Phone access" to "phone", "Settings" to "settings", "About" to "about").forEach { (title, target) -> Choice(title) { go(target) } }
        }
        if (details) FlatDialog("Conversation details", { details = false }) {
            Label("${if (screen == "draft") agentName(draftAgent) else agentName(snapshot.active?.agent)} · ${currentWorkspace?.name.orEmpty()}", muted = true)
            Choice("Workspace details", "Location, files and terminal") { inspectedWorkspace = currentWorkspace?.id.orEmpty(); go("workspace") }
            Choice("Phone access", "Permissions and special access") { go("phone") }
            if (screen == "chat") Action("Disconnect conversation", enabled = snapshot.ready) { perform { runtime().disconnectConversation(); details = false } }
            Action("STOP all execution") { details = false; confirmStop = true }
        }
        if (picker.isNotBlank()) FlatDialog(when (picker) { "agent" -> "Choose agent"; "filter" -> "Filter conversations"; else -> "Choose workspace" }, { picker = "" }) {
            if (picker == "agent") agentNames.forEach { (id, name) -> Choice(name, status = if (draftAgent == id) "Selected" else "") { draftAgent = id; picker = "" } }
            else {
                if (picker == "filter") Choice("All workspaces") { filter = ""; picker = "" }
                snapshot.workspaces.forEach { item -> Choice(item.name) { if (picker == "filter") filter = item.id else draftWorkspace = item.id; picker = "" } }
            }
        }
        if (confirmStop) FlatDialog("Stop all execution?", { confirmStop = false }) {
            Label("This interrupts all agent turns and shells. Saved conversations and workspace files remain.")
            Action("STOP environment", primary = true) { perform { runtime().stopExecution(); confirmStop = false } }
            Action("Keep running") { confirmStop = false }
        }
    }
}

@Composable internal fun Page(content: @Composable ColumnScope.() -> Unit) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(horizontal = 25.dp, vertical = 14.dp), verticalArrangement = Arrangement.spacedBy(12.dp), content = content)
}
@Composable internal fun Heading(text: String) { Label(text, size = 29, bold = true, modifier = Modifier.semantics { heading() }) }
@Composable internal fun FlatDialog(title: String, dismiss: () -> Unit, content: @Composable ColumnScope.() -> Unit) {
    val windowSize = androidx.compose.ui.platform.LocalWindowInfo.current.containerSize
    val sheetHeight = with(androidx.compose.ui.platform.LocalDensity.current) { windowSize.height.toDp() * .85f }
    Dialog(dismiss, DialogProperties(usePlatformDefaultWidth = false)) {
        Box(Modifier.fillMaxSize().imePadding(), contentAlignment = Alignment.BottomCenter) {
            Column(Modifier.fillMaxWidth().heightIn(max = sheetHeight)
                .clip(RoundedCornerShape(topStart = 27.dp, topEnd = 27.dp)).background(LocalFlat.current.surface)
                .verticalScroll(rememberScrollState()).padding(horizontal = 24.dp).padding(top = 12.dp, bottom = 25.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Box(Modifier.align(Alignment.CenterHorizontally).width(32.dp).height(4.dp).clip(RoundedCornerShape(3.dp)).background(LocalFlat.current.line))
                Row(verticalAlignment = Alignment.CenterVertically) { Label(title, Modifier.weight(1f).semantics { heading() }, size = 21, bold = true); Glyph("×", "Close dialog", dismiss) }
                content()
            }
        }
    }
}

@Composable private fun SharedStorageAccess(revision: Long) {
    val context = LocalContext.current
    var error by remember { mutableStateOf("") }
    val message = remember(revision) { RuntimeService.current?.sharedStorageStatus() ?: AndroidSharedFolders(context).access().message }
    Notice(message)
    if (error.isNotEmpty()) Notice(error, true)
    Action("Android phone file access", enabled = android.os.Build.VERSION.SDK_INT >= 30) {
        runCatching { context.startActivity(AndroidSharedFolders(context).settingsIntent()) }
            .onFailure { error = "Open Android Settings › Special app access › All files access › Olea. Android storage settings could not open here." }
    }
    Label("The Android all-files grant exposes shared storage to stock file tools at /sdcard and /storage, independently of phone tools. After changing it, STOP and Start the environment. Other apps’ private files remain protected.", size = 12, muted = true)
}

@Composable private fun PhoneSummary() {
    val phone = PhoneBridge.current
    Notice("Phone tools: ${if (phone?.isEnabled() == true) "Enabled for this runtime" else "Disabled"}")
    Label("Accessibility: ${if (PhoneAccessibility.active != null) "Enabled" else "Not enabled"}\nNotification access: ${if (PhoneNotifications.connected) "Enabled" else "Not enabled"}\nSelected Android folder: ${if (phone?.folderGranted() == true) "Access granted" else "Not selected"}\nScreen capture: Android consent for each request", muted = true)
}

private fun agentInstalled(context: Context, agent: String, @Suppress("UNUSED_PARAMETER") revision: Long): Boolean =
    runCatching { AgentConfiguration(context.filesDir).status(agent).optBoolean("installed") }.getOrDefault(false)
