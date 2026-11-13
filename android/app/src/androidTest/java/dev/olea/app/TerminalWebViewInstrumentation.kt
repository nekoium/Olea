package dev.olea.app

import android.app.Activity
import android.app.Instrumentation
import android.content.Intent
import android.net.Uri
import android.os.Bundle
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
    override fun onCreate(arguments: Bundle?) { super.onCreate(arguments); start() }
    override fun onStart() {
        val receipt = JSONObject().put("providerRequests", 0)
        var activity: Activity? = null
        var passed = false
        try {
            val input = LinkedBlockingQueue<String>()
            val sizes = LinkedBlockingQueue<Pair<Int, Int>>()
            val errors = CopyOnWriteArrayList<String>()
            val ready = CountDownLatch(1)
            val host = startActivitySync(Intent(targetContext, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
            activity = host
            ui {
                view = createTerminalWebView(host, { input.offer(it) }, { c, r -> sizes.offer(c to r) }, { ready.countDown() }, { errors.add(it) })
                host.addContentView(view, FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, 600))
            }
            check(ready.await(15, TimeUnit.SECONDS)) { "Bundled xterm did not become ready: $errors" }
            check(errors.isEmpty()) { "Bundled document/assets produced errors: $errors" }
            check(evaluate("location.href") == TERMINAL_PAGE_URL)
            check(evaluate("typeof window.oleaWrite") == "function")
            check(evaluate("document.querySelectorAll('.xterm').length") == 1)
            check(evaluate("document.styleSheets[0].cssRules.length > 0") == true)
            val size = sizes.poll(5, TimeUnit.SECONDS)
            check(size != null && size.first >= 20 && size.second >= 4) { "No real xterm resize reached Android" }
            receipt.put("realBundledDocumentScriptStyleReadyAndResize", "pass")

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
            receipt.put("failure", "${error.javaClass.simpleName}: ${error.message}")
        } finally {
            ui {
                if (::view.isInitialized) {
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
}
