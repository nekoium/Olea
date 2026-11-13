package dev.olea.app

import android.app.Activity
import android.app.Instrumentation
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.Build
import android.os.SystemClock
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.view.WindowInsets
import android.view.inputmethod.InputMethodManager
import androidx.activity.compose.setContent
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.mutableStateOf
import android.webkit.ConsoleMessage
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.widget.FrameLayout
import org.json.JSONObject
import org.json.JSONTokener
import java.util.concurrent.CopyOnWriteArrayList
import java.util.concurrent.CountDownLatch
import java.util.concurrent.LinkedBlockingQueue
import java.util.concurrent.TimeUnit

/** Runs the production terminal WebView on Android, without Linux, PTYs or provider requests. */
class TerminalWebViewInstrumentation : Instrumentation() {
    private lateinit var view: WebView
    private var selected = "factory"
    private var phase = "starting"
    private val errors = CopyOnWriteArrayList<String>()
    private fun stage(value: String) {
        phase = value
        sendStatus(1, Bundle().apply { putString("stream", "Terminal diagnostic: $value\n") })
    }
    private fun nativeState() = ui {
        val location = IntArray(2)
        view.getLocationOnScreen(location)
        JSONObject().put("url", view.url).put("progress", view.progress)
            .put("width", view.width).put("height", view.height)
            .put("screenX", location[0]).put("screenY", location[1])
            .put("attached", view.isAttachedToWindow).put("shown", view.isShown)
            .put("focused", view.hasFocus()).put("windowFocus", view.hasWindowFocus())
            .put("acceptingText", view.context.getSystemService(InputMethodManager::class.java).isAcceptingText)
            .put("imeVisible", if (Build.VERSION.SDK_INT >= 30) view.rootWindowInsets?.isVisible(WindowInsets.Type.ime()) else JSONObject.NULL)
    }
    private fun javascriptState(): Any? = evaluate("""
        (()=>{let state=null;try{if(typeof terminal!=='undefined')state={cols:terminal.cols,rows:terminal.rows,
          bufferLines:terminal.buffer?.active?.length,cell:terminal._core?._renderService?.dimensions?.css?.cell}}
          catch(e){state={error:String(e)}}
        return JSON.stringify({href:location.href,readyState:document.readyState,
          viewport:[innerWidth,innerHeight],write:typeof window.oleaWrite,bridge:typeof window.OleaTerminal,
          xtermNodes:document.querySelectorAll('.xterm').length,styles:document.styleSheets.length,
          scripts:Array.from(document.scripts,s=>s.src||'inline'),
          activeElement:document.activeElement&&document.activeElement.className,
          textarea:(()=>{const t=document.querySelector('.xterm-helper-textarea');if(!t)return null;
            const r=t.getBoundingClientRect();return {disabled:t.disabled,readOnly:t.readOnly,width:r.width,height:r.height}})(),
          terminal:state})})()
    """.trimIndent()).let { if (it is String) JSONObject(it) else it }
    private fun capture(receipt: JSONObject, label: String) {
        if (!::view.isInitialized) return
        receipt.put(label, JSONObject().put("native", nativeState()).put("javascript", javascriptState()).put("errors", errors.toString()))
    }
    private fun <T> ui(action: () -> T): T {
        var result: Result<T>? = null
        runOnMainSync { result = runCatching(action) }
        return result!!.getOrThrow()
    }
    private fun evaluate(script: String): Any? {
        val done = CountDownLatch(1)
        var result = "null"
        ui { view.evaluateJavascript(script) { result = it; done.countDown() } }
        check(done.await(5, TimeUnit.SECONDS)) { "JavaScript evaluation timed out" }
        return JSONTokener(result).nextValue()
    }
    private fun awaitScript(script: String) {
        val deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(5)
        while (evaluate(script) != true && System.nanoTime() < deadline) Thread.sleep(20)
        check(evaluate(script) == true) { "JavaScript condition timed out: $script" }
    }
    private fun request(url: String, main: Boolean = false, method: String = "GET") = object : WebResourceRequest {
        override fun getUrl() = Uri.parse(url)
        override fun isForMainFrame() = main
        override fun isRedirect() = false
        override fun hasGesture() = false
        override fun getMethod() = method
        override fun getRequestHeaders() = emptyMap<String, String>()
    }
    override fun onCreate(arguments: Bundle?) { selected = arguments?.getString("case") ?: "factory"; super.onCreate(arguments); start() }
    override fun onStart() {
        val receipt = JSONObject().put("providerRequests", 0).put("case", selected)
        WebView.getCurrentWebViewPackage()?.let { receipt.put("webViewPackage", it.packageName).put("webViewVersion", it.versionName) }
        var activity: Activity? = null
        var passed = false
        try {
            val input = LinkedBlockingQueue<String>()
            val sizes = LinkedBlockingQueue<Pair<Int, Int>>()
            val ready = CountDownLatch(1)
            stage("starting native activity")
            val host = startActivitySync(Intent(targetContext, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
            activity = host
            if (selected == "viewport") {
                viewport(host as MainActivity, receipt)
                passed = true
                return
            }
            stage("factory document/bridge readiness")
            ui {
                view = createTerminalWebView(host, { input.offer(it) }, { c, r -> sizes.offer(c to r) }, { ready.countDown() }, { errors.add(it) })
                host.addContentView(view, FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, 600))
            }
            val becameReady = ready.await(15, TimeUnit.SECONDS)
            receipt.put("readyCallback", becameReady)
            capture(receipt, "factoryAfterReadyWait")
            check(becameReady) { "Bundled xterm did not become ready: $errors" }
            check(errors.isEmpty()) { "Bundled document/assets produced errors: $errors" }
            check(evaluate("location.href") == TERMINAL_PAGE_URL)
            check(evaluate("typeof window.oleaWrite") == "function")
            check(evaluate("document.querySelectorAll('.xterm').length") == 1)
            check(evaluate("document.styleSheets[0].cssRules.length > 0") == true)
            val size = sizes.poll(5, TimeUnit.SECONDS)
            check(size != null && size.first >= 20 && size.second >= 4) { "No real xterm resize reached Android" }
            receipt.put("realBundledDocumentScriptStyleReadyAndResize", "pass")

            stage("resource and navigation allowlist")
            ui {
                check(view.settings.blockNetworkLoads && !view.settings.allowFileAccess && !view.settings.allowContentAccess)
                val client = view.webViewClient
                val allowed = listOf(
                    Triple(TERMINAL_PAGE_URL, true, "text/html"),
                    Triple("https://olea.invalid/xterm.js", false, "application/javascript"),
                    Triple("https://olea.invalid/xterm.css", false, "text/css")
                )
                for ((url, main, mime) in allowed) {
                    val response = client.shouldInterceptRequest(view, request(url, main))!!
                    check(response.statusCode == 200 && response.mimeType == mime)
                    response.data.use { check(it.read() != -1) }
                }
                val blocked = listOf(
                    request("https://example.com/"), request("http://127.0.0.1:8765/"),
                    request("file:///etc/passwd"), request("file:///android_asset/runtime-abi.txt"),
                    request("content://dev.olea/private"), request("data:text/html,untrusted", true),
                    request("https://olea.invalid/other"), request("https://olea.invalid/xterm.js?extra=1"),
                    request("https://olea.invalid/xterm.js", true), request(TERMINAL_PAGE_URL),
                    request(TERMINAL_PAGE_URL, true, "POST")
                )
                for (req in blocked) {
                    client.shouldInterceptRequest(view, req)!!.let { response ->
                        check(response.statusCode == 403)
                        response.data.close()
                    }
                    check(client.shouldOverrideUrlLoading(view, req))
                }
                check(!client.shouldOverrideUrlLoading(view, request(TERMINAL_PAGE_URL, true)))
                // WebView may request an optional favicon; its rejection must not disable xterm.
                client.onReceivedHttpError(view, request("https://olea.invalid/favicon.ico"), WebResourceResponse("text/plain", "UTF-8", 403, "Blocked", emptyMap(), null))
                check(errors.isEmpty())
            }
            // Exercise browser-enforced CSP as well as the interceptor's exact allowlist.
            evaluate("window.socketBlocked=false; try{const s=new WebSocket('wss://example.com/');s.onerror=()=>{window.socketBlocked=true}}catch(e){window.socketBlocked=e.name==='SecurityError'}")
            awaitScript("window.socketBlocked === true")
            check(evaluate("(function(){const f=document.createElement('iframe');f.srcdoc='<script>parent.untrustedFrame=true<\\/script>';document.body.appendChild(f);return true})()") == true)
            Thread.sleep(200)
            check(evaluate("window.untrustedFrame === undefined") == true)
            errors.clear() // The deliberately blocked CSP probes can report console errors.
            receipt.put("networkFileContentAndFrameBlocking", "pass")

            stage("control keys and quoting")
            val keys = listOf("\u001b", "\t", "\u001b[D", "\u001b[B", "\u001b[A", "\u001b[C", "\u0003", "'\"\\\r\n\u2028\u2029雪😀")
            for (key in keys) {
                evaluate(terminalKeyScript(key))
                check(input.poll(5, TimeUnit.SECONDS) == key) { "Input/JavaScript quoting changed control data" }
            }
            check(terminalControlInput("c", true) == "\u0003")
            check(terminalControlInput("C", true) == "\u0003")
            check(terminalControlInput("[", true) == "\u001b")
            check(terminalControlInput("c", false) == "c")
            check(terminalControlInput("paste", true) == "paste")
            check(terminalControlInput("雪", true) == "雪")
            sizes.clear()
            evaluate("OleaTerminal.input('x'.repeat(65537)); OleaTerminal.resize(0,0)")
            check(input.poll(200, TimeUnit.MILLISECONDS) == null)
            check(sizes.poll(200, TimeUnit.MILLISECONDS) == null)
            receipt.put("controlInputQuotingAndBridgeLimits", "pass")

            stage("real xterm output")
            val output = "\u001b[32mANSI\u001b[0m\r\n<script>window.pwned=true</script>\r\n'\"\\雪😀"
            evaluate(terminalWriteScript(output, true))
            evaluate("terminal.write('',()=>{window.testDrained=true})")
            awaitScript("window.testDrained === true")
            val screen = evaluate("Array.from({length:terminal.buffer.active.length},(_,i)=>terminal.buffer.active.getLine(i).translateToString(true)).join('\\n')") as String
            check(screen.contains("ANSI") && screen.contains("<script>window.pwned=true</script>") && screen.contains("'\"\\雪😀")) { screen }
            check(evaluate("window.pwned === undefined") == true)
            check(errors.isEmpty()) { errors.toString() }
            receipt.put("realXtermAnsiAndUntrustedOutput", "pass")

            // Exercise native and JavaScript error reporting; file access stays disabled.
            ui {
                view.webViewClient.onReceivedHttpError(view, request("https://olea.invalid/xterm.js"), WebResourceResponse("text/plain", "UTF-8", 503, "terminal-test-http-error", emptyMap(), null))
                view.webChromeClient!!.onConsoleMessage(ConsoleMessage("terminal-test-js-error", TERMINAL_PAGE_URL, 17, ConsoleMessage.MessageLevel.ERROR))
                view.loadUrl("file:///olea-terminal-test-blocked")
            }
            val errorDeadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(5)
            while (errors.none { it.contains("file:///olea-terminal-test-blocked:") } && System.nanoTime() < errorDeadline) Thread.sleep(20)
            check(errors.any { it.contains("file:///olea-terminal-test-blocked:") && Regex("\\(-?\\d+\\)$").containsMatchIn(it) }) { errors.toString() }
            check(errors.any { it.contains("HTTP 503 terminal-test-http-error") })
            check(errors.any { it.contains(":17: terminal-test-js-error") })
            receipt.put("loadHttpAndJavaScriptErrorCallbacks", "pass")
            passed = true
        } catch (error: Throwable) {
            receipt.put("failure", "${error.javaClass.simpleName}: ${error.message}").put("phase", phase)
            runCatching { capture(receipt, "failureState") }.onFailure { receipt.put("captureFailure", it.toString()) }
        } finally {
            ui {
                if (::view.isInitialized && selected != "viewport") {
                    (view.parent as? android.view.ViewGroup)?.removeView(view)
                    view.removeJavascriptInterface("OleaTerminal")
                    view.destroy()
                }
                activity?.finish()
            }
            receipt.put("passed", passed)
            finish(if (passed) -1 else 0, Bundle().apply { putString("stream", receipt.toString(2)) })
        }
    }

    private fun webViews(root: View): List<WebView> = when (root) {
        is WebView -> listOf(root)
        is ViewGroup -> (0 until root.childCount).flatMap { webViews(root.getChildAt(it)) }
        else -> emptyList()
    }
    private fun adoptViewport(host: Activity, previous: List<WebView> = emptyList()) {
        val deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(5)
        var found: WebView? = null
        while (found == null && System.nanoTime() < deadline) {
            found = ui { webViews(host.window.decorView).firstOrNull { it !in previous } }
            if (found == null) Thread.sleep(20)
        }
        view = checkNotNull(found) { "No attached Compose WebView appeared" }
    }
    private fun bufferContains(marker: String) = """
        (()=>{try{return Array.from({length:terminal.buffer.active.length},(_,i)=>
          terminal.buffer.active.getLine(i).translateToString(true)).join('\n').includes(${JSONObject.quote(marker)})}catch(e){return false}})()
    """.trimIndent()
    private fun viewport(host: MainActivity, receipt: JSONObject) {
        stage("Compose viewport creation and initial output")
        val terminalState = mutableStateOf(RuntimeTerminalState("viewport-one", "fixture", "Terminal diagnostic", "running", "viewport-one$ "))
        val previous = ui { webViews(host.window.decorView) }
        ui {
            host.setContent {
                CompositionLocalProvider(LocalFlat provides lightColors) {
                    WorkspaceTerminal(
                        UiSnapshot(available = true, summary = "Backend: running", terminals = listOf(terminalState.value)),
                        WorkspaceInfo("fixture", "Terminal diagnostic", "")
                    ) { /* Observe UI only; never invoke runtime actions. */ }
                }
            }
        }
        adoptViewport(host, previous)
        val initial = view
        capture(receipt, "viewportCreated")
        awaitScript(bufferContains("viewport-one$"))
        capture(receipt, "viewportInitialOutput")
        check(ui { view.width > 0 && view.height > 0 && view.isAttachedToWindow })
        receipt.put("composedInitialOutput", "pass")

        stage("Compose output recomposition without disposal")
        ui { terminalState.value = terminalState.value.copy(output = terminalState.value.output + "\r\nviewport-two$ ") }
        awaitScript(bufferContains("viewport-two$"))
        check(ui { webViews(host.window.decorView).single() === initial }) { "Output recomposition replaced the WebView" }
        capture(receipt, "viewportUpdatedOutput")
        receipt.put("composedOutputRecomposition", "pass")

        stage("Compose session switch and retained-output replay")
        ui { terminalState.value = terminalState.value.copy(id = "viewport-second", output = "switched-shell$ ") }
        adoptViewport(host, listOf(initial))
        awaitScript(bufferContains("switched-shell$"))
        capture(receipt, "viewportSwitched")
        receipt.put("composedSessionSwitch", "pass")

        stage("real viewport tap and textarea focus")
        val location = ui {
            val result = IntArray(2)
            view.getLocationOnScreen(result)
            result
        }
        val now = SystemClock.uptimeMillis()
        val down = MotionEvent.obtain(now, now, MotionEvent.ACTION_DOWN, location[0] + 32f, location[1] + 32f, 0)
        val up = MotionEvent.obtain(now, now + 50, MotionEvent.ACTION_UP, location[0] + 32f, location[1] + 32f, 0)
        try { sendPointerSync(down); sendPointerSync(up) } finally { down.recycle(); up.recycle() }
        awaitScript("document.activeElement && document.activeElement.classList.contains('xterm-helper-textarea')")
        Thread.sleep(700)
        capture(receipt, "viewportAfterTap")
        receipt.put("composedTapFocus", "pass")
    }
}
