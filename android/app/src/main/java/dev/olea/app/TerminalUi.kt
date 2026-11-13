package dev.olea.app

import android.annotation.SuppressLint
import android.content.Context
import android.view.GestureDetector
import android.view.MotionEvent
import android.view.inputmethod.InputMethodManager
import android.webkit.ConsoleMessage
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
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
import kotlinx.coroutines.delay
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

internal const val TERMINAL_PAGE_URL = "https://olea.invalid/terminal.html"

internal fun terminalControlInput(text: String, ctrl: Boolean): String =
    if (ctrl && text.length == 1 && text[0].code in 64..127) ((text[0].code and 31).toChar()).toString() else text

internal fun terminalWriteScript(data: String, reset: Boolean) = "window.oleaWrite(${JSONObject.quote(data)},$reset)"
internal fun terminalKeyScript(data: String) = "window.oleaKey(${JSONObject.quote(data)})"

// The document and its two assets are APK resources; no request falls through to the network.
@SuppressLint("SetJavaScriptEnabled", "ClickableViewAccessibility")
internal fun createTerminalWebView(context: Context, input: (String) -> Unit, resize: (Int, Int) -> Unit, loaded: () -> Unit, failed: (String) -> Unit): WebView =
    WebView(context).apply {
        setBackgroundColor(android.graphics.Color.rgb(23, 27, 22))
        settings.javaScriptEnabled = true
        settings.allowFileAccess = false; settings.allowContentAccess = false
        settings.domStorageEnabled = false; settings.blockNetworkLoads = true
        settings.mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_NEVER_ALLOW
        settings.builtInZoomControls = false; settings.displayZoomControls = false
        isFocusable = true; isFocusableInTouchMode = true
        // WebView focus alone does not focus xterm's hidden editor on Android.
        val taps = GestureDetector(context, object : GestureDetector.SimpleOnGestureListener() {
            override fun onDown(event: MotionEvent) = true
            override fun onSingleTapUp(event: MotionEvent): Boolean {
                post {
                    requestFocus()
                    evaluateJavascript("(function(){if(typeof window.oleaFocus!=='function')return false;window.oleaFocus();return document.activeElement.classList.contains('xterm-helper-textarea')})()") { focused ->
                        if (focused == "true") post { context.getSystemService(InputMethodManager::class.java).showSoftInput(this@apply, InputMethodManager.SHOW_IMPLICIT) }
                    }
                }
                return false
            }
        })
        setOnTouchListener { _, event -> taps.onTouchEvent(event); false }
        addJavascriptInterface(TerminalBridge(
            { text -> post { input(text) } },
            { columns, rows -> post { resize(columns, rows) } },
            { post { loaded() } }), "OleaTerminal")
        webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean =
                !(request.isForMainFrame && request.method == "GET" && request.url.toString() == TERMINAL_PAGE_URL)

            override fun shouldInterceptRequest(view: WebView, request: WebResourceRequest): WebResourceResponse {
                val resource = if (request.method != "GET") null else when (request.url.toString()) {
                    TERMINAL_PAGE_URL -> if (request.isForMainFrame) R.raw.terminal to "text/html" else null
                    "https://olea.invalid/xterm.js" -> if (!request.isForMainFrame) R.raw.xterm to "application/javascript" else null
                    "https://olea.invalid/xterm.css" -> if (!request.isForMainFrame) R.raw.xterm_style to "text/css" else null
                    else -> null
                }
                val headers = mapOf(
                    "Content-Security-Policy" to "default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-src 'none'; child-src 'none'; frame-ancestors 'none'",
                    "X-Content-Type-Options" to "nosniff",
                    "Cache-Control" to "no-store"
                )
                return if (resource != null) WebResourceResponse(resource.second, "UTF-8", 200, "OK", headers, resources.openRawResource(resource.first))
                else WebResourceResponse("text/plain", "UTF-8", 403, "Blocked", headers, java.io.ByteArrayInputStream(ByteArray(0)))
            }

            private fun isRequired(request: WebResourceRequest) = request.isForMainFrame ||
                request.url.toString() in listOf("https://olea.invalid/xterm.js", "https://olea.invalid/xterm.css")

            override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
                if (isRequired(request)) failed("${request.url}: ${error.description} (${error.errorCode})")
            }

            override fun onReceivedHttpError(view: WebView, request: WebResourceRequest, errorResponse: WebResourceResponse) {
                if (isRequired(request)) failed("${request.url}: HTTP ${errorResponse.statusCode} ${errorResponse.reasonPhrase}")
            }
        }
        webChromeClient = object : WebChromeClient() {
            override fun onConsoleMessage(message: ConsoleMessage): Boolean {
                if (message.messageLevel() == ConsoleMessage.MessageLevel.ERROR &&
                    message.sourceId() in listOf(TERMINAL_PAGE_URL, "https://olea.invalid/xterm.js", "https://olea.invalid/xterm.css")) {
                    failed("${message.sourceId()}:${message.lineNumber()}: ${message.message().take(300)}")
                }
                return true
            }
        }
        loadUrl(TERMINAL_PAGE_URL)
    }

@Composable private fun TerminalViewport(terminal: RuntimeTerminalState, modifier: Modifier, perform: (() -> Unit) -> Unit) {
    val context = LocalContext.current
    var browser by remember(terminal.id) { mutableStateOf<WebView?>(null) }
    var ready by remember(terminal.id) { mutableStateOf(false) }
    var loadError by remember(terminal.id) { mutableStateOf<String?>(null) }
    var rendered by remember(terminal.id) { mutableStateOf("") }
    var ctrl by remember(terminal.id) { mutableStateOf(false) }
    val canInput = terminal.state == "running"
    val latestId by rememberUpdatedState(terminal.id)
    val latestCanInput by rememberUpdatedState(canInput)
    Column(modifier.fillMaxWidth().background(Color(0xff171b16))) {
        loadError?.let { Notice("Terminal display failed: $it. Reopen the terminal to retry.", true) }
        key(terminal.id) {
            AndroidView(factory = {
                createTerminalWebView(it,
                    { text ->
                        val id = latestId
                        val data = terminalControlInput(text, ctrl)
                        ctrl = false
                        if (latestCanInput) perform { RuntimeService.current?.terminalInput(id, data) }
                    },
                    { columns, rows -> val id = latestId; perform { RuntimeService.current?.resizeTerminal(id, columns, rows) } },
                    { if (loadError == null) ready = true },
                    { error -> if (loadError == null) loadError = error; ready = false }
                ).also { browser = it }
            }, modifier = Modifier.weight(1f).fillMaxWidth(), onRelease = { browser = null; it.removeJavascriptInterface("OleaTerminal"); it.destroy() })
        }
        Row(Modifier.fillMaxWidth().background(LocalFlat.current.panel).padding(horizontal = 3.dp), horizontalArrangement = Arrangement.SpaceEvenly) {
            listOf("Esc" to "\u001b", "Ctrl" to "", "Tab" to "\t", "←" to "\u001b[D", "↓" to "\u001b[B", "↑" to "\u001b[A", "→" to "\u001b[C").forEach { (label, data) ->
                Box(Modifier.weight(1f)) {
                    Action(label, primary = label == "Ctrl" && ctrl, enabled = canInput && ready, compact = true) {
                        if (label == "Ctrl") ctrl = !ctrl else browser?.evaluateJavascript(terminalKeyScript(data), null)
                    }
                }
            }
        }
    }
    LaunchedEffect(terminal.id, browser) {
        if (browser != null) {
            delay(10000)
            if (!ready && loadError == null) loadError = "The bundled terminal page did not become ready within 10 seconds."
        }
    }
    LaunchedEffect(terminal.id, ready, terminal.output) {
        if (ready) {
            val reset = !terminal.output.startsWith(rendered)
            val data = if (reset) terminal.output else terminal.output.removePrefix(rendered)
            if (data.isNotEmpty() || reset) browser?.evaluateJavascript(terminalWriteScript(data, reset), null)
            rendered = terminal.output
        }
    }
}
