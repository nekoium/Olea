package dev.olea.app

import android.app.Activity
import android.app.Instrumentation
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.os.Build
import android.os.SystemClock
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.view.WindowInsets
import android.view.accessibility.AccessibilityNodeInfo
import android.view.inputmethod.InputMethodManager
import androidx.activity.compose.setContent
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.mutableStateOf
import android.webkit.ConsoleMessage
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.widget.FrameLayout
import org.json.JSONArray
import org.json.JSONObject
import org.json.JSONTokener
import java.util.concurrent.CopyOnWriteArrayList
import java.util.concurrent.CountDownLatch
import java.util.concurrent.Executors
import java.util.concurrent.LinkedBlockingQueue
import java.util.concurrent.TimeUnit

/** Factory, Compose, and real-activity terminal diagnostics; no provider requests. */
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
            .put("blockNetworkLoads", view.settings.blockNetworkLoads)
            .put("allowFileAccess", view.settings.allowFileAccess).put("allowContentAccess", view.settings.allowContentAccess)
            .put("focused", view.hasFocus()).put("windowFocus", view.hasWindowFocus())
            .put("acceptingText", view.context.getSystemService(InputMethodManager::class.java).isAcceptingText)
            .put("imeVisible", if (Build.VERSION.SDK_INT >= 30) view.rootWindowInsets?.isVisible(WindowInsets.Type.ime()) else JSONObject.NULL)
    }
    private fun javascriptState(): Any? = evaluate("""
        JSON.stringify({href:location.href,readyState:document.readyState,viewport:[innerWidth,innerHeight],write:typeof window.oleaWrite,bridge:typeof window.OleaTerminal,xtermNodes:document.querySelectorAll('.xterm').length,styles:document.styleSheets.length,activeElement:document.activeElement?.className,terminal:typeof terminal==='undefined'?null:{cols:terminal.cols,rows:terminal.rows}})
    """.trimIndent()).let { if (it is String) JSONObject(it) else it }
    private fun visualState(): JSONObject {
        val pixels = ui {
        val bitmap = Bitmap.createBitmap(view.width.coerceAtLeast(1), view.height.coerceAtLeast(1), Bitmap.Config.ARGB_8888)
        view.draw(Canvas(bitmap))
        var nonBackground = 0
        var bright = 0
        for (y in 0 until bitmap.height step 4) for (x in 0 until bitmap.width step 4) {
            val pixel = bitmap.getPixel(x, y)
            if (pixel != Color.rgb(23, 27, 22)) nonBackground++
            if (Color.red(pixel) > 100 || Color.green(pixel) > 100 || Color.blue(pixel) > 100) bright++
        }
        bitmap.recycle()
        nonBackground to bright
        }
        return JSONObject(evaluate("""
          (()=>{const q=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect(),c=getComputedStyle(e);
            return {tag:e.tagName,children:e.children.length,width:r.width,height:r.height,display:c.display,visibility:c.visibility,opacity:c.opacity,color:c.color,background:c.backgroundColor,position:c.position,top:c.top,bottom:c.bottom,computedHeight:c.height,inline:e.style.cssText,textChars:e.textContent?.length}};
          return JSON.stringify({supportsDvh:CSS.supports('height','100dvh'),supportsInset:CSS.supports('inset','0'),html:q('html'),body:q('body'),terminal:q('#terminal'),xterm:q('.xterm'),screen:q('.xterm-screen'),rows:q('.xterm-rows'),canvases:Array.from(document.querySelectorAll('canvas'),e=>{const r=e.getBoundingClientRect();return {width:e.width,height:e.height,cssWidth:r.width,cssHeight:r.height}}),rowCount:document.querySelectorAll('.xterm-rows > div').length,renderer:document.querySelector('.xterm-dom-renderer-owner-1')!==null})})()
        """.trimIndent()) as String).put("sampledNonBackground", pixels.first).put("sampledBright", pixels.second)
    }
    private fun capture(receipt: JSONObject, label: String) {
        if (!::view.isInitialized) return
        val screenshot = uiAutomation.takeScreenshot()
        val evidence = java.io.File(targetContext.filesDir, "terminal-$label.png")
        evidence.outputStream().use { screenshot.compress(Bitmap.CompressFormat.PNG, 100, it) }
        screenshot.recycle()
        val labels = mutableListOf<String>()
        fun collect(node: AccessibilityNodeInfo) {
            node.text?.toString()?.let { labels.add(it) }
            for (i in 0 until node.childCount) node.getChild(i)?.let(::collect)
        }
        uiAutomation.rootInActiveWindow?.let(::collect)
        receipt.put("${label}Labels", JSONArray(labels))
        receipt.put(label, JSONObject().put("native", nativeState()).put("javascript", javascriptState()).put("visual", visualState()).put("errors", errors.toString()))
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
    override fun onCreate(arguments: Bundle?) {
        selected = arguments?.getString("case") ?: "factory"
        super.onCreate(arguments)
        if (targetContext.packageName == "dev.olea.terminaltest") {
            targetContext.getSharedPreferences("olea-ui", android.content.Context.MODE_PRIVATE).edit()
                .putBoolean("setup-complete", true).apply()
        }
        start()
    }
    override fun onStart() {
        val receipt = JSONObject().put("providerRequests", 0).put("case", selected)
            .put("targetApk", targetContext.applicationInfo.sourceDir)
            .put("testApk", context.applicationInfo.sourceDir)
            .put("runnerClassLoader", javaClass.classLoader.toString())
            .put("activityClassLoader", MainActivity::class.java.classLoader.toString())
            .put("terminalClassLoader", Class.forName("dev.olea.app.TerminalUiKt").classLoader.toString())
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
            if (selected == "actual") {
                actual(host as MainActivity, receipt)
                passed = true
                return
            }
            if (selected == "viewport" || selected == "pty") {
                if (selected == "pty") pty(host as MainActivity, receipt) else viewport(host as MainActivity, receipt)
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
                check(view.settings.blockNetworkLoads && !view.settings.allowFileAccess && !view.settings.allowContentAccess) { "Native access settings differ from the production factory" }
                val client = view.webViewClient
                val allowedResults = JSONArray()
                val blockedResults = JSONArray()
                receipt.put("allowedRequests", allowedResults).put("blockedRequests", blockedResults)
                val allowed = listOf(
                    Triple(TERMINAL_PAGE_URL, true, "text/html"),
                    Triple("https://olea.invalid/xterm.js", false, "application/javascript"),
                    Triple("https://olea.invalid/xterm.css", false, "text/css")
                )
                for ((url, main, mime) in allowed) {
                    val response = client.shouldInterceptRequest(view, request(url, main))!!
                    if (url == TERMINAL_PAGE_URL) receipt.put("interceptedDocumentCsp", response.responseHeaders["Content-Security-Policy"])
                    allowedResults.put(JSONObject().put("url", url).put("main", main).put("status", response.statusCode).put("mime", response.mimeType))
                    check(response.statusCode == 200 && response.mimeType == mime) { "Allowed $url main=$main returned ${response.statusCode}/${response.mimeType}; expected 200/$mime" }
                    response.data.use { check(it.read() != -1) { "Allowed $url returned an empty resource" } }
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
                        val override = client.shouldOverrideUrlLoading(view, req)
                        blockedResults.put(JSONObject().put("url", req.url).put("main", req.isForMainFrame).put("method", req.method).put("status", response.statusCode).put("override", override))
                        response.data.close()
                        check(response.statusCode == 403) { "Blocked ${req.method} ${req.url} main=${req.isForMainFrame} returned ${response.statusCode}" }
                        check(override) { "Blocked navigation ${req.method} ${req.url} main=${req.isForMainFrame} was permitted" }
                    }
                }
                val mainGetOverride = client.shouldOverrideUrlLoading(view, request(TERMINAL_PAGE_URL, true))
                receipt.put("mainGetOverride", mainGetOverride)
                check(!mainGetOverride) { "Exact main-frame GET was intercepted as navigation" }
                // WebView may request an optional favicon; its rejection must not disable xterm.
                client.onReceivedHttpError(view, request("https://olea.invalid/favicon.ico"), WebResourceResponse("text/plain", "UTF-8", 403, "Blocked", emptyMap(), null))
                receipt.put("errorsAfterOptionalFavicon", errors.toString())
                check(errors.isEmpty()) { "Optional favicon reported a required-resource error: $errors" }
            }
            receipt.put("exactResourceAndNavigationAllowlist", "pass")
            // Exercise browser-enforced CSP as well as the interceptor's exact allowlist.
            stage("CSP connection blocking")
            receipt.put("documentMetaCsp", evaluate("document.querySelector('meta[http-equiv=\"Content-Security-Policy\"]')?.content || null"))
            evaluate("window.cspViolations=[];document.addEventListener('securitypolicyviolation',e=>window.cspViolations.push({directive:e.effectiveDirective,blocked:e.blockedURI,policy:e.originalPolicy}));window.socketBlocked=false; try{const s=new WebSocket('wss://example.com/');s.onerror=()=>{window.socketBlocked=true}}catch(e){window.socketBlocked=e.name==='SecurityError'}")
            awaitScript("window.socketBlocked === true")
            val socketBlocked = evaluate("window.socketBlocked === true")
            receipt.put("socketProbeState", socketBlocked)
            check(socketBlocked == true) { "CSP did not synchronously/ultimately block WebSocket: $socketBlocked" }
            receipt.put("cspWebSocketBlocked", true)
            stage("CSP frame blocking")
            val frameCreated = evaluate("(function(){window.frameProbeFinished=false;const f=document.createElement('iframe');f.id='olea-frame-probe';f.onload=()=>{window.frameProbeFinished=true};f.srcdoc='<script>parent.untrustedFrame=true<\\/script>';document.body.appendChild(f);return true})()")
            receipt.put("frameProbeCreated", frameCreated)
            check(frameCreated == true) { "Inline frame probe did not run: $frameCreated" }
            Thread.sleep(500)
            receipt.put("cspViolations", JSONObject("{\"events\":" + evaluate("JSON.stringify(window.cspViolations)") + "}").getJSONArray("events"))
            receipt.put("frameProbeDetail", evaluate("JSON.stringify({finished:window.frameProbeFinished,markerType:typeof window.untrustedFrame,markerValue:String(window.untrustedFrame),frameUrl:(()=>{try{return document.getElementById('olea-frame-probe').contentWindow.location.href}catch(e){return String(e)}})()})"))
            val frameBlocked = evaluate("window.untrustedFrame === undefined")
            receipt.put("frameProbeBlocked", frameBlocked)
            // Trusted bootstrap code can create same-origin srcdoc in this WebView despite CSP.
            // There is no product path that interprets PTY output as HTML; retain this probe as a limit.
            receipt.put("srcdocPolicyLimitObserved", frameBlocked != true)
            errors.clear() // The deliberately blocked CSP probes can report console errors.
            receipt.put("networkFileContentBlocking", "pass")

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
                .put("failureLocation", error.stackTrace.firstOrNull { it.className.contains("TerminalWebViewInstrumentation") }?.toString())
            runCatching { capture(receipt, "failureState") }.onFailure { receipt.put("captureFailure", it.toString()) }
        } finally {
            ui {
                if (::view.isInitialized && selected == "factory") {
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

        stage("real viewport tap, textarea focus and keyboard")
        tapEditor(receipt, "viewportAfterTap")
        receipt.put("composedTapFocusAndIme", "pass")
    }
    private fun awaitCondition(seconds: Int, description: String, condition: () -> Boolean) {
        val deadline = SystemClock.elapsedRealtime() + seconds * 1000L
        while (!condition() && SystemClock.elapsedRealtime() < deadline) Thread.sleep(50)
        check(condition()) { "Timed out: $description" }
    }
    private fun tapEditor(receipt: JSONObject, label: String) {
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
        awaitCondition(5, "IME presentation after editor focus") {
            ui { Build.VERSION.SDK_INT < 30 || view.rootWindowInsets?.isVisible(WindowInsets.Type.ime()) == true }
        }
        capture(receipt, label)
    }

    private fun accessibilityNode(label: String): AccessibilityNodeInfo? {
        fun find(node: AccessibilityNodeInfo): AccessibilityNodeInfo? {
            if (node.packageName?.toString() == targetContext.packageName &&
                (node.text?.toString() == label || node.contentDescription?.toString() == label)) return node
            for (index in 0 until node.childCount) {
                val child = node.getChild(index) ?: continue
                find(child)?.let { return it }
            }
            return null
        }
        return uiAutomation.rootInActiveWindow?.let(::find)
    }
    private fun clickLabel(label: String) {
        awaitCondition(8, "ordinary UI control $label") { accessibilityNode(label) != null }
        var node = accessibilityNode(label)
        while (node != null && !node.isClickable) node = node.parent
        check(node?.performAction(AccessibilityNodeInfo.ACTION_CLICK) == true) { "Cannot click ordinary UI control $label" }
        Thread.sleep(250)
    }
    private fun activitySnapshot(host: MainActivity, receipt: JSONObject, label: String) {
        ui {
            val field = MainActivity::class.java.getDeclaredField("snapshot\$delegate").apply { isAccessible = true }
            val state = field.get(host) as androidx.compose.runtime.State<*>
            val snapshot = state.value as UiSnapshot
            val failureField = MainActivity::class.java.getDeclaredField("failure\$delegate").apply { isAccessible = true }
            receipt.put("${label}Error", (failureField.get(host) as androidx.compose.runtime.State<*>).value.toString())
            receipt.put(label, JSONObject().put("available", snapshot.available)
                .put("activeWorkspace", snapshot.active?.workspaceId)
                .put("terminalCount", snapshot.terminals.size)
                .put("terminals", JSONArray(snapshot.terminals.map {
                    JSONObject().put("id", it.id).put("workspace", it.workspaceId).put("state", it.state).put("outputChars", it.output.length)
                })))
        }
    }
    private fun actual(host: MainActivity, receipt: JSONObject) {
        stage("ordinary MainActivity/runtime startup")
        awaitCondition(10, "RuntimeService creation") { RuntimeService.current != null }
        val runtime = RuntimeService.current!!
        val selectedBefore = runtime.activeConversation().id
        val workspace = runtime.store.createWorkspace("Terminal regression first ${SystemClock.uptimeMillis()}")
        val wasRunning = runtime.environmentRunning()
        check(wasRunning || !RuntimeService.busy) { "Another environment operation is active" }
        var startedBackend = false
        var created: String? = null
        var failure: Throwable? = null
        try {
            if (!runtime.environmentReady() && targetContext.packageName == "dev.olea.terminaltest") {
                stage("prepare isolated diagnostic environment")
                startedBackend = true
                runtime.prepareEnvironment()
                awaitCondition(1200, "isolated environment preparation") { runtime.environmentReady() && runtime.environmentRunning() && !RuntimeService.busy }
            }
            check(runtime.environmentReady()) { "Actual diagnostic requires the already-prepared environment" }
            if (!runtime.environmentRunning()) {
                startedBackend = true
                runtime.startEnvironment(false)
                awaitCondition(90, "backend without opening an agent") { runtime.environmentRunning() && !RuntimeService.busy }
            }
            val id = runtime.createTerminal(workspace.id, "Actual UI diagnostic")
            created = id
            fun current() = runtime.terminals(workspace.id).single { it.id == id }
            awaitCondition(20, "ordinary diagnostic PTY") { current().state == "running" }
            activitySnapshot(host, receipt, "beforeNavigationSnapshot")
            stage("ordinary OleaApp navigation to workspace terminal")
            // These are the existing user controls, not replacement composition or state injection.
            clickLabel("Workspaces")
            clickLabel(workspace.name)
            clickLabel("Details")
            clickLabel("Terminal")
            adoptViewport(host)
            val original = view
            receipt.put("firstWorkspace", workspace.id)
            receipt.put("actualTimeline", JSONArray())
            val timeline = receipt.getJSONArray("actualTimeline")
            repeat(4) { index ->
                if (index > 0) Thread.sleep(3500)
                val attached = ui { webViews(host.window.decorView) }
                receipt.put("actualWebViewCount", attached.size)
                receipt.put("actualOriginalRetained", original in attached)
                if (attached.isNotEmpty()) view = attached.first()
                val state = JSONObject().put("sample", index).put("native", nativeState()).put("javascript", javascriptState())
                    .put("identity", System.identityHashCode(view))
                    .put("runtimeTerminalState", current().state).put("runtimeOutputChars", current().output.length)
                timeline.put(state)
                activitySnapshot(host, receipt, "actualSnapshot$index")
            }
            stage("ordinary terminal DOM/write availability")
            awaitScript("typeof window.oleaWrite === 'function' && document.querySelectorAll('.xterm').length===1")
            stage("ordinary terminal real tap and keyboard")
            tapEditor(receipt, "actualAfterTap")
            stage("ordinary terminal real bridge printf")
            val tag = java.lang.Long.toHexString(SystemClock.uptimeMillis())
            evaluate(terminalKeyScript("printf '\\n%s%s\\n' 'olea-actual-' '$tag'\r"))
            awaitCondition(8, "ordinary RuntimeService output") { current().output.contains("olea-actual-$tag") }
            awaitScript(bufferContains("olea-actual-$tag"))
            capture(receipt, "actualAfterPrintf")
            val visible = visualState()
            receipt.put("actualPixelProof", visible)
            check(visible.getInt("sampledBright") >= 50 && (visible.optJSONObject("rows")?.optInt("textChars", 0) ?: 0) >= 20) {
                "Real WebView draw lacks text-sized pixels (cursor alone is insufficient): $visible"
            }
            actualRegression(host, receipt, runtime, workspace, id, "olea-actual-$tag")
            activitySnapshot(host, receipt, "actualFinalSnapshot")
            receipt.put("ordinaryActivityTerminal", "pass")
        } catch (error: Throwable) {
            failure = error
            runCatching { capture(receipt, "actualFailureState") }
            runCatching { activitySnapshot(host, receipt, "actualFailureSnapshot") }
            throw error
        } finally {
            runCatching {
                created?.let { runtime.closeTerminal(it) }
                if (startedBackend) {
                    runtime.stopExecution()
                    awaitCondition(25, "actual diagnostic backend cleanup") { !runtime.environmentRunning() && !RuntimeService.busy }
                }
                val preserved = runtime.activeConversation().id == selectedBefore
                receipt.put("selectionPreserved", preserved).put("stoppedOnlyBackendStartedByDiagnostic", startedBackend)
                check(preserved) { "Conversation selection changed" }
            }.onFailure { cleanup ->
                receipt.put("actualCleanupFailure", cleanup.toString())
                if (failure == null) throw cleanup else failure.addSuppressed(cleanup)
            }
        }
    }

    private fun actualRegression(host: MainActivity, receipt: JSONObject, runtime: RuntimeService, workspace: WorkspaceInfo, first: String, firstMarker: String) {
        val tag = java.lang.Long.toHexString(SystemClock.uptimeMillis())
        val shells = mutableListOf<String>()
        fun shell(id: String) = runtime.terminals(workspace.id).first { it.id == id }
        fun painted(marker: String, label: String) {
            awaitScript(bufferContains(marker))
            awaitScript("document.querySelector('.xterm-rows').textContent.includes(${JSONObject.quote(marker)})")
            awaitCondition(5, "painted terminal text") { visualState().getInt("sampledBright") >= 50 }
            Thread.sleep(250) // Allow the compositor to present the verified DOM rows before the screenshot.
            capture(receipt, label)
            check(visualState().getJSONObject("terminal").getDouble("height") > 0)
            check(ui { view.height > 0 })
        }
        fun command(id: String, label: String) {
            val marker = "olea-$label-$tag"
            evaluate(terminalKeyScript("printf '\\n%s%s\\n' 'olea-$label-' '$tag'\r"))
            awaitCondition(8, "PTY command $label") { runtime.store.workspaces().any { w ->
                runtime.terminals(w.id).any { it.id == id && it.output.contains(marker) }
            } }
            painted(marker, label)
        }
        fun hideKeyboard() {
            sendKeyDownUpSync(android.view.KeyEvent.KEYCODE_BACK)
            awaitCondition(5, "keyboard hidden") { ui { view.rootWindowInsets?.isVisible(WindowInsets.Type.ime()) == false } }
        }
        fun switchFrom(name: String, to: String, marker: String, label: String) {
            val old = view
            clickLabel(name)
            clickLabel(to)
            adoptViewport(host, listOf(old))
            painted(marker, label)
        }
        fun openWorkspace(name: String) {
            clickLabel("Back") // Workspace details.
            clickLabel("Back") // Previous conversation list or conversation.
            clickLabel("Workspaces")
            clickLabel(name)
            clickLabel("Details")
            val old = view
            clickLabel("Terminal")
            adoptViewport(host, listOf(old))
        }
        try {
            stage("ordinary keyboard hide/show and real PTY resize")
            val smallRows = (evaluate("terminal.rows") as Number).toInt()
            hideKeyboard()
            awaitCondition(5, "terminal expands after keyboard hide") { (evaluate("terminal.rows") as Number).toInt() > smallRows }
            painted(firstMarker, "keyboardHidden")
            val largeRows = (evaluate("terminal.rows") as Number).toInt()
            tapEditor(receipt, "keyboardShown")
            awaitCondition(5, "terminal shrinks after keyboard show") { (evaluate("terminal.rows") as Number).toInt() < largeRows }
            val rows = (evaluate("terminal.rows") as Number).toInt()
            val cols = (evaluate("terminal.cols") as Number).toInt()
            evaluate(terminalKeyScript("printf '\\n%s' 'olea-size-'; stty size\r"))
            awaitCondition(8, "PTY dimensions $rows $cols") { shell(first).output.contains("olea-size-$rows $cols") }
            painted("olea-size-$rows $cols", "ptyResize")
            receipt.put("keyboardAndPtyResize", JSONObject().put("expandedRows", largeRows).put("keyboardRows", rows).put("columns", cols))

            stage("ordinary Ctrl-C control and continuation")
            evaluate(terminalKeyScript("printf '\\n%s%s\\n' 'olea-busy-' '$tag'; sleep 20; printf '\\n%s%s\\n' 'olea-late-' '$tag'\r"))
            awaitCondition(8, "foreground job started") { shell(first).output.contains("olea-busy-$tag") }
            clickLabel("Ctrl")
            val interrupted = SystemClock.elapsedRealtime()
            evaluate(terminalKeyScript("c"))
            Thread.sleep(300)
            command(first, "after-interrupt")
            check(!shell(first).output.contains("olea-late-$tag"))
            receipt.put("ctrlCContinuationMillis", SystemClock.elapsedRealtime() - interrupted)
            hideKeyboard()

            stage("ordinary session switching")
            val second = runtime.createTerminal(workspace.id, "Regression second shell")
            shells.add(second)
            awaitCondition(20, "second shell prompt") { shell(second).state == "running" && shell(second).output.contains("#") }
            switchFrom("Actual UI diagnostic", "Regression second shell", "#", "secondShellPrompt")
            command(second, "second-shell")
            switchFrom("Regression second shell", "Actual UI diagnostic", "olea-after-interrupt-$tag", "firstShellRestored")
            receipt.put("sessionSwitching", "pass")

            stage("ordinary leave/return preserves selected session")
            val old = view
            clickLabel("Back")
            clickLabel("Terminal")
            adoptViewport(host, listOf(old))
            check(accessibilityNode("Actual UI diagnostic") != null) { "Leaving and returning changed the selected terminal" }
            painted("olea-after-interrupt-$tag", "returnedFirstShell")
            receipt.put("leaveAndReturn", "pass")

            stage("ordinary terminal in a second workspace")
            val other = runtime.store.createWorkspace("Terminal regression $tag")
            val third = runtime.createTerminal(other.id, "Regression other workspace")
            shells.add(third)
            receipt.put("secondWorkspace", other.id)
            awaitCondition(20, "second workspace shell") { runtime.terminals(other.id).any { it.id == third && it.state == "running" } }
            openWorkspace(other.name)
            painted("#", "otherWorkspacePrompt")
            command(third, "other-workspace")
            openWorkspace(workspace.name)
            check(accessibilityNode("Actual UI diagnostic") != null) { "Returning from another workspace changed the selected terminal" }
            painted("olea-after-interrupt-$tag", "returnedFromOtherWorkspace")
            command(first, "final-output")
            receipt.put("secondWorkspaceAndReturn", "pass")
        } finally {
            shells.forEach { runtime.closeTerminal(it) }
        }
    }

    private fun pty(host: MainActivity, receipt: JSONObject) {
        stage("app-owned runtime without opening an agent")
        awaitCondition(10, "RuntimeService creation") { RuntimeService.current != null }
        val runtime = RuntimeService.current!!
        check(runtime.environmentReady()) { "PTY diagnostic requires the already-prepared environment; it will not install packages" }
        val selectedBefore = runtime.activeConversation().id
        val default = runtime.store.workspaces().single { it.id == "default" }
        check(!runtime.workspaceFolders.isConnected(default.id)) { "Default diagnostic workspace must be app-managed" }
        val wasRunning = runtime.environmentRunning()
        val agentsBefore = runtime.conversationStates().filter { it.ready || it.opening }.map { it.id }.toSet()
        check(wasRunning || !RuntimeService.busy) { "Another environment operation is active" }
        val actions = Executors.newSingleThreadExecutor()
        val actionErrors = CopyOnWriteArrayList<String>()
        var startedBackend = false
        var created: String? = null
        var failure: Throwable? = null
        try {
            if (!wasRunning) {
                startedBackend = true
                runtime.startEnvironment(false)
                awaitCondition(90, "backend start without an agent") { runtime.environmentRunning() && !RuntimeService.busy }
            }
            check(runtime.conversationStates().filter { it.opening || it.ready }.all { it.id in agentsBefore }) { "PTY-only instrumentation unexpectedly opened an agent" }
            stage("real Python PTY creation")
            val id = runtime.createTerminal(default.id, "Terminal diagnostic")
            created = id
            fun current() = runtime.terminals(default.id).single { it.id == id }
            awaitCondition(20, "real PTY running") {
                check(current().state != "error") { "PTY creation failed" }
                current().state == "running"
            }
            val initialDeadline = SystemClock.elapsedRealtime() + 2000
            while (current().output.isEmpty() && SystemClock.elapsedRealtime() < initialDeadline) Thread.sleep(50)
            receipt.put("initialPtyOutputChars", current().output.length)
            val terminalState = mutableStateOf(current())
            val previous = ui { webViews(host.window.decorView) }
            ui {
                host.setContent {
                    CompositionLocalProvider(LocalFlat provides lightColors) {
                        WorkspaceTerminal(
                            UiSnapshot(available = true, summary = "Backend: running", terminals = listOf(terminalState.value)), default
                        ) { action ->
                            if (!actions.isShutdown) runCatching {
                                actions.execute { runCatching(action).onFailure { actionErrors.add(it.javaClass.simpleName + ": " + it.message) } }
                            }.onFailure { actionErrors.add(it.javaClass.simpleName) }
                        }
                    }
                }
            }
            adoptViewport(host, previous)
            awaitScript("typeof window.oleaKey === 'function'")
            capture(receipt, "ptyViewportReady")
            fun sync() {
                val next = current()
                check(next.state == "running") { "PTY changed state to ${next.state}" }
                check(actionErrors.isEmpty()) { "Runtime input/resize failed: $actionErrors" }
                ui { terminalState.value = next }
            }
            fun awaitOutput(marker: String, seconds: Int = 8) {
                awaitCondition(seconds, "PTY output marker $marker") { sync(); current().output.contains(marker) }
                awaitScript(bufferContains(marker))
            }
            stage("WebView bridge to real PTY printf and TTY status")
            val tag = java.lang.Long.toHexString(SystemClock.uptimeMillis())
            val marker = "olea-pty-$tag"
            evaluate(terminalKeyScript("printf '\\n%s%s\\n' 'olea-pty-' '$tag'\r"))
            awaitOutput(marker)
            evaluate(terminalKeyScript("if test -t 0 && test -t 1; then printf '\\n%s%s\\n' 'olea-tty-' 'yes'; fi\r"))
            awaitOutput("olea-tty-yes")
            receipt.put("realPtyPrintfAndTty", "pass").put("ptyOutputCharsAfterPrintf", current().output.length)
            capture(receipt, "ptyAfterPrintf")

            stage("real foreground-job Ctrl-C through WebView bridge")
            evaluate(terminalKeyScript("printf '\\n%s%s\\n' 'olea-busy-' '$tag'; sleep 20; printf '\\n%s%s\\n' 'olea-late-' '$tag'\r"))
            awaitOutput("olea-busy-$tag")
            val interruptedAt = SystemClock.elapsedRealtime()
            evaluate(terminalKeyScript(terminalControlInput("c", true)))
            Thread.sleep(300) // Let the foreground process handle SIGINT before entering the next command.
            evaluate(terminalKeyScript("printf '\\n%s%s\\n' 'olea-after-' '$tag'\r"))
            awaitOutput("olea-after-$tag")
            check(!current().output.contains("olea-late-$tag")) { "Foreground job reached its post-sleep command" }
            receipt.put("realPtyCtrlC", "pass").put("ctrlCContinuationMillis", SystemClock.elapsedRealtime() - interruptedAt)
            capture(receipt, "ptyAfterCtrlC")
            tapEditor(receipt, "ptyAfterTap")
            receipt.put("realPtyTapFocusAndIme", "pass")
        } catch (error: Throwable) {
            failure = error
            runCatching { capture(receipt, "ptyFailureState") }
            created?.let { id ->
                runtime.terminals(default.id).firstOrNull { it.id == id }?.let {
                    receipt.put("ptyFailureShellState", it.state).put("ptyFailureOutputChars", it.output.length)
                }
            }
            throw error
        } finally {
            runCatching {
                ui { host.setContent { } }
                actions.shutdown()
                check(actions.awaitTermination(5, TimeUnit.SECONDS)) { "Diagnostic input actions did not settle" }
                created?.let { runtime.closeTerminal(it) }
                if (startedBackend) {
                    runtime.stopExecution()
                    awaitCondition(25, "diagnostic backend cleanup") { !runtime.environmentRunning() && !RuntimeService.busy }
                }
                val preserved = runtime.activeConversation().id == selectedBefore
                receipt.put("selectionPreserved", preserved).put("stoppedOnlyBackendStartedByDiagnostic", startedBackend)
                check(preserved) { "Conversation selection changed during the diagnostic" }
            }.onFailure { cleanup ->
                receipt.put("ptyCleanupFailure", cleanup.javaClass.simpleName + ": " + cleanup.message)
                if (failure == null) throw cleanup else failure.addSuppressed(cleanup)
            }
        }
    }
}
