package dev.olea.app

import android.annotation.SuppressLint
import android.webkit.JavascriptInterface
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import org.json.JSONObject

@Composable internal fun WorkspaceTerminal(snapshot: UiSnapshot, workspace: WorkspaceInfo?, perform: (() -> Unit) -> Unit) {
    if (workspace == null) { Page { Notice("Choose a workspace before opening a terminal.") }; return }
    val context = LocalContext.current
    var selected by rememberSaveable(workspace.id) { mutableStateOf("") }
    var sessions by remember { mutableStateOf(false) }
    var closing by remember { mutableStateOf(false) }
    val backendRunning = snapshot.summary.startsWith("Backend: running")
    val terminals = snapshot.terminals.filter { it.workspaceId == workspace.id }
    val terminal = terminals.firstOrNull { it.id == selected } ?: terminals.lastOrNull()
    LaunchedEffect(terminal?.id) { selected = terminal?.id.orEmpty() }
    fun runtime() = RuntimeService.current ?: error("Start the environment first.")
    Column(Modifier.fillMaxSize()) {
        Row(Modifier.padding(horizontal = 12.dp, vertical = 6.dp), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            Action(terminal?.name ?: "Terminal sessions", Modifier.weight(1f)) { sessions = true }
            Action("＋", description = "New terminal", enabled = backendRunning) { perform { selected = runtime().createTerminal(workspace.id, "Terminal ${terminals.size + 1}") } }
            if (terminal != null) Action("Close") { closing = true }
        }
        if (terminal == null) Page {
            Heading("Workspace terminal")
            Label("${workspace.name} · Independent Linux shell", muted = true)
            Label("Terminal processes remain open when you return to chat. STOP ends all shells. Android can end background processes.", muted = true)
            Action("New terminal", primary = true, enabled = backendRunning) { perform { selected = runtime().createTerminal(workspace.id, "Terminal 1") } }
            if (!backendRunning) Action(if (snapshot.environmentReady) "Start environment" else "Prepare environment", enabled = !snapshot.busy) { perform { runtime().prepareEnvironment() } }
            if (!snapshot.environmentReady) Notice("Prepare the environment first from the app menu.")
        } else {
            Row(Modifier.padding(horizontal = 14.dp, vertical = 4.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Chip(terminal.state.replaceFirstChar { it.uppercase() })
                Action("Interrupt", enabled = terminal.state == "running") { perform { runtime().interruptTerminal(terminal.id) } }
                Action("Copy output") {
                    val plain = terminal.output.replace(Regex("\\u001B\\[[0-?]*[ -/]*[@-~]"), "").replace(Regex("\\u001B\\][^\\u0007]*(?:\\u0007|\\u001B\\\\)"), "")
                    context.getSystemService(android.content.ClipboardManager::class.java).setPrimaryClip(android.content.ClipData.newPlainText(terminal.name, plain))
                }
            }
            if (terminal.state in listOf("closed", "error", "exited", "stopped")) Notice("Shell disconnected. Output is retained. Create a new terminal to run more commands.", terminal.state == "error")
            TerminalViewport(terminal, Modifier.weight(1f), perform)
        }
    }
    if (sessions) FlatDialog("Terminal sessions · ${workspace.name}", { sessions = false }) {
        if (terminals.isEmpty()) Label("No terminals in this workspace.", muted = true)
        terminals.forEach { item -> Choice(item.name, item.state, if (item.id == selected) "Selected" else "") { selected = item.id; sessions = false } }
        Action("New terminal", primary = true, enabled = backendRunning) { perform { selected = runtime().createTerminal(workspace.id, "Terminal ${terminals.size + 1}"); sessions = false } }
    }
    if (closing && terminal != null) FlatDialog("Close this shell?", { closing = false }) {
        Label("This ends ${terminal.name}. Leaving the terminal view keeps the shell open.")
        Action("End shell", primary = true) { perform { runtime().closeTerminal(terminal.id); closing = false } }
        Action("Keep shell") { closing = false }
    }
}

private class TerminalBridge(private val input: (String) -> Unit, private val resize: (Int, Int) -> Unit, private val loaded: () -> Unit) {
    @JavascriptInterface fun input(text: String) { if (text.length <= 65536) input.invoke(text) }
    @JavascriptInterface fun resize(columns: Int, rows: Int) { if (columns in 20..500 && rows in 4..200) resize.invoke(columns, rows) }
    @JavascriptInterface fun ready() = loaded()
}

@SuppressLint("SetJavaScriptEnabled")
@Composable private fun TerminalViewport(terminal: RuntimeTerminalState, modifier: Modifier, perform: (() -> Unit) -> Unit) {
    val context = LocalContext.current
    var browser by remember(terminal.id) { mutableStateOf<WebView?>(null) }
    var ready by remember(terminal.id) { mutableStateOf(false) }
    var rendered by remember(terminal.id) { mutableStateOf("") }
    var ctrl by remember(terminal.id) { mutableStateOf(false) }
    val canInput = terminal.state == "running"
    val latestId by rememberUpdatedState(terminal.id)
    val latestCanInput by rememberUpdatedState(canInput)
    Column(modifier.fillMaxWidth().background(Color(0xff171b16))) {
        key(terminal.id) {
            AndroidView(factory = {
                WebView(it).apply {
                    setBackgroundColor(android.graphics.Color.rgb(23, 27, 22))
                    settings.javaScriptEnabled = true
                    settings.allowFileAccess = false; settings.allowContentAccess = false
                    settings.domStorageEnabled = false; settings.blockNetworkLoads = true
                    settings.builtInZoomControls = false; settings.displayZoomControls = false
                    isFocusable = true; isFocusableInTouchMode = true
                    addJavascriptInterface(TerminalBridge(
                        { text -> if (latestCanInput) perform { RuntimeService.current?.terminalInput(latestId, if (ctrl && text.length == 1 && text[0].code in 64..127) ((text[0].code and 31).toChar()).toString() else text) }; ctrl = false },
                        { columns, rows -> perform { RuntimeService.current?.resizeTerminal(latestId, columns, rows) } },
                        { post { ready = true } }), "OleaTerminal")
                    webViewClient = object : WebViewClient() {
                        override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean = true
                        override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse {
                            val id = when (request.url.toString()) { "https://olea.invalid/xterm.js" -> R.raw.xterm; "https://olea.invalid/xterm.css" -> R.raw.xterm_style; else -> null }
                            return if (id != null) WebResourceResponse(if (id == R.raw.xterm) "application/javascript" else "text/css", "UTF-8", resources.openRawResource(id))
                            else WebResourceResponse("text/plain", "UTF-8", 404, "Not found", emptyMap(), java.io.ByteArrayInputStream(ByteArray(0)))
                        }
                    }
                    val html = resources.openRawResource(R.raw.terminal).bufferedReader().use { it.readText() }
                    loadDataWithBaseURL("https://olea.invalid/", html, "text/html", "UTF-8", null)
                    browser = this
                }
            }, modifier = Modifier.weight(1f).fillMaxWidth(), onRelease = { it.removeJavascriptInterface("OleaTerminal"); it.destroy() })
        }
        Row(Modifier.fillMaxWidth().background(LocalFlat.current.panel).padding(horizontal = 3.dp), horizontalArrangement = Arrangement.SpaceEvenly) {
            listOf("Esc" to "\u001b", "Ctrl" to "", "Tab" to "\t", "←" to "\u001b[D", "↓" to "\u001b[B", "↑" to "\u001b[A", "→" to "\u001b[C").forEach { (label, data) ->
                Box(Modifier.weight(1f)) {
                    Action(label, primary = label == "Ctrl" && ctrl, enabled = canInput) {
                        if (label == "Ctrl") ctrl = !ctrl else browser?.evaluateJavascript("window.oleaKey(${JSONObject.quote(data)})", null)
                    }
                }
            }
        }
    }
    LaunchedEffect(terminal.id, ready, terminal.output) {
        if (ready) {
            val reset = !terminal.output.startsWith(rendered)
            val data = if (reset) terminal.output else terminal.output.removePrefix(rendered)
            if (data.isNotEmpty() || reset) browser?.evaluateJavascript("window.oleaWrite(${JSONObject.quote(data)},$reset)", null)
            rendered = terminal.output
        }
    }
}
