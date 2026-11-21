package dev.olea.app

import android.app.Instrumentation
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.os.Bundle
import android.os.SystemClock
import android.view.KeyEvent
import android.view.accessibility.AccessibilityNodeInfo
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.key
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.dp
import org.json.JSONArray
import org.json.JSONObject
import java.io.File

/** Isolated deterministic UI diagnostics. Synthetic snapshots never exercise a provider. */
class SoftUiInstrumentation : Instrumentation() {
    private lateinit var host: MainActivity
    private lateinit var workspace: WorkspaceInfo
    private var variant = "fixtures"
    private var nonce = 0
    private var phase = "start"
    private val captures = JSONArray()
    private val checks = JSONArray()
    private val prefs get() = targetContext.getSharedPreferences("olea-ui", Context.MODE_PRIVATE)
    private val evidence get() = File(targetContext.filesDir, "soft-evidence").apply { mkdirs() }
    private val session get() = ConversationInfo("soft-fixture", "Review project notes", "pi", workspace.id)
    private val entries = listOf(
        "user: Read the project notes and tell me what needs attention.",
        "assistant: ## Two things to follow up\n\nThe notes are consistent. Two items still need a decision before the next release.\n\n• **Reading view.** Decide how long replies and code should appear on a phone.\n• **Provider setup.** Keep connection settings separate from choosing a model.",
        "Tool read · 3 project files\nPRODUCT.md       8.2 KB\nDESIGN.md       12.4 KB\nproject-notes.md  2.1 KB\n\nRead completed. No files changed."
    )
    override fun onCreate(arguments: Bundle?) {
        variant = arguments?.getString("case") ?: "fixtures"
        super.onCreate(arguments)
        check(targetContext.packageName == "dev.olea.softtest") { "Only the separate Soft diagnostic installation is allowed" }
        start()
    }
    private fun <T> ui(action: () -> T): T {
        var value: Result<T>? = null
        runOnMainSync { value = runCatching(action) }
        return value!!.getOrThrow()
    }
    private fun await(description: String, condition: () -> Boolean) {
        val deadline = SystemClock.elapsedRealtime() + 8000
        while (!condition() && SystemClock.elapsedRealtime() < deadline) Thread.sleep(50)
        check(condition()) { "Timed out: $description" }
    }
    private fun stage(name: String) { phase = name; sendStatus(1, Bundle().apply { putString("stream", "Soft UI: $name\n") }) }
    private fun nodes(): List<AccessibilityNodeInfo> {
        val list = mutableListOf<AccessibilityNodeInfo>()
        fun visit(node: AccessibilityNodeInfo) { list.add(node); for (i in 0 until node.childCount) node.getChild(i)?.let(::visit) }
        uiAutomation.rootInActiveWindow?.let(::visit)
        return list
    }
    private fun find(label: String): AccessibilityNodeInfo? {
        val all = nodes()
        return all.firstOrNull { it.contentDescription?.toString() == label } ?: all.firstOrNull { it.text?.toString() == label }
    }
    private fun click(label: String) {
        await(label) { find(label) != null }
        var node = find(label)
        while (node != null && !node.isClickable) node = node.parent
        check(node?.performAction(AccessibilityNodeInfo.ACTION_CLICK) == true) { "Cannot click $label" }
        waitForIdleSync(); Thread.sleep(200)
    }
    private fun edit(label: String, value: String) {
        click(label)
        val node = nodes().firstOrNull { it.isEditable && (it.contentDescription?.toString() == label || it.text?.toString() == label) }
            ?: nodes().first { it.isEditable }
        check(node.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, Bundle().apply { putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, value) }))
        waitForIdleSync()
    }
    private fun scrollEnd() { repeat(5) { nodes().firstOrNull { it.isScrollable }?.performAction(AccessibilityNodeInfo.ACTION_SCROLL_FORWARD); Thread.sleep(100) }; waitForIdleSync() }
    private fun capture(name: String, kind: String = "fixture", palette: String = prefs.getString("palette", "green") ?: "green", theme: String = prefs.getString("appearance", "light") ?: "light") {
        waitForIdleSync(); Thread.sleep(350)
        val screenshot = checkNotNull(uiAutomation.takeScreenshot())
        val file = File(evidence, "$name.png")
        file.outputStream().use { screenshot.compress(Bitmap.CompressFormat.PNG, 100, it) }
        captures.put(JSONObject().put("file", file.name).put("kind", kind).put("entry", phase).put("palette", palette).put("theme", theme)
            .put("widthPx", screenshot.width).put("heightPx", screenshot.height).put("labels", JSONArray(nodes().mapNotNull { it.text?.toString() })))
        screenshot.recycle()
    }
    private fun snapshot(state: String = "done") = UiSnapshot(
        available = true, workspaces = listOf(workspace), conversations = listOf(session), active = session, entries = entries,
        status = when (state) { "error" -> "Reply failed. Review the connection, then retry explicitly."; "lost" -> "Environment unavailable. Saved messages remain."; else -> "Pi ready" },
        ready = state != "lost" && state != "error", busy = state == "working", environmentReady = true,
        states = listOf(RuntimeConversationState(session.id, session.agent, workspace.id, state, state != "lost", false,
            entries.map { RuntimeMessage("assistant", it) }, if (state == "needs_you") RuntimeInteraction("fixture-request", "question", "Which date should I use? PRODUCT.md says Friday. Your daily note says Monday.", listOf("Use Friday", "Use Monday")) else null)),
        terminals = listOf(RuntimeTerminalState("fixture-shell", workspace.id, "Notes shell", "running", "~/personal $ ls\r\nnotes  projects  README.md\r\n\r\n~/personal $ cat README.md\r\n# Personal workspace\r\nNotes and project material.\r\n\r\n~/personal $ "))
    )
    private fun render(value: UiSnapshot = snapshot(), setup: Int? = null, fresh: Boolean = false, failure: String = "", palette: String = "green", theme: String = "light", narrow: Boolean = false) {
        prefs.edit().putBoolean("setup-complete", setup == null).putInt("setup-step", setup ?: 0).putBoolean("fresh-chat", fresh)
            .putString("palette", palette).putString("appearance", theme).putString("setup-agent", "pi").putString("setup-workspace", workspace.id).commit()
        nonce++
        val instance = nonce
        ui { host.setContent {
            key(instance) {
                val density = LocalDensity.current
                CompositionLocalProvider(LocalDensity provides if (narrow) Density(density.density, 1.5f) else density) {
                    Box(Modifier.fillMaxSize().background(softPalette(palette).light.surface), contentAlignment = Alignment.Center) {
                        Box(if (narrow) Modifier.width(320.dp).fillMaxHeight() else Modifier.fillMaxSize()) {
                            OleaApp(value, failure, 0, {}, { /* Fixture: never execute runtime actions. */ }, {})
                        }
                    }
                }
            }
        } }
        waitForIdleSync(); Thread.sleep(250)
    }
    private fun management(screen: String) { click("Open app menu"); click(screen) }
    override fun onStart() {
        var passed = false
        val receipt = JSONObject().put("providerRequests", 0).put("case", variant).put("package", targetContext.packageName)
            .put("version", BuildConfig.VERSION_NAME).put("abi", BuildConfig.RUNTIME_ABI).put("androidApi", android.os.Build.VERSION.SDK_INT)
            .put("deviceModel", android.os.Build.MODEL).put("captures", captures).put("checks", checks)
        try {
            stage("isolated MainActivity and actual RuntimeService creation")
            host = startActivitySync(Intent(targetContext, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) as MainActivity
            await("RuntimeService") { RuntimeService.current != null }
            val runtime = RuntimeService.current!!
            workspace = runtime.store.workspaces().firstOrNull { it.name == "Soft UI diagnostic" } ?: runtime.store.createWorkspace("Soft UI diagnostic")
            checks.put("Native registry and runtime created; no agent started")
            check(softPalette(null).id == "green" && softPalette("invalid").id == "green")
            check(replyBlocks("## Heading\n\n```sh\nprintf '**literal**'\n```\n\nAfter").map { it.text } == listOf("Heading", "printf '**literal**'", "After"))
            checks.put("Palette default/invalid fallback and fenced-code preservation")
            if (variant == "phone") phone()
            else if (variant == "narrow") narrow()
            else fixtures()
            passed = true
        } catch (error: Throwable) {
            receipt.put("failure", "${error.javaClass.simpleName}: ${error.message}").put("phase", phase).put("location", error.stackTrace.firstOrNull { it.className.contains("SoftUiInstrumentation") }.toString())
            runCatching { capture("failure-$variant") }
        } finally {
            receipt.put("passed", passed)
            File(evidence, "receipt-$variant.json").writeText(receipt.toString(2))
            finish(if (passed) -1 else 0, Bundle().apply { putString("stream", receipt.toString(2)) })
        }
    }
    private fun fixtures() {
        stage("onboarding states; actual production composition with synthetic readiness")
        listOf(0 to "welcome", 1 to "choose-agent", 2 to "setup-workspace", 3 to "prepare", 4 to "install", 5 to "setup-provider", 6 to "setup-access", 7 to "ready").forEach { (step, name) -> render(setup = step); capture(name) }
        render(setup = 3, value = snapshot().copy(environmentReady = false, status = "Setup paused. Download interrupted."), failure = "Environment download could not finish. Your setup choices are saved."); capture("setup-error")
        stage("conversation outcomes, tool disclosure and supported upstream choices")
        for (state in listOf("done", "working", "stopped", "error", "lost", "needs_you")) { render(snapshot(state)); capture("chat-$state") }
        render(); click("Tool read · 3 project files"); capture("tool-detail")
        click("Conversation details"); capture("conversation-details"); click("STOP all execution"); capture("stop-confirm")
        stage("history, workspace filter and search")
        render(); click("Conversations"); capture("history"); edit("Search conversations", "nothing-matches"); sendKeyDownUpSync(KeyEvent.KEYCODE_BACK); capture("empty-history")
        stage("joined draft with real keyboard and palette navigation preservation")
        render(fresh = true); capture("draft")
        click("Choose agent"); capture("draft-agent"); click("Pi")
        click("Choose workspace"); capture("draft-workspace"); click(workspace.name)
        edit("Message", "Review the project notes")
        await("real IME") { ui { host.window.decorView.rootWindowInsets?.isVisible(android.view.WindowInsets.Type.ime()) == true } }
        capture("keyboard", "fixture with real Android IME")
        sendKeyDownUpSync(KeyEvent.KEYCODE_BACK)
        val selected = RuntimeService.current!!.activeConversation().id
        val terminals = RuntimeService.current!!.terminals(workspace.id).map { it.id }
        management("Settings"); capture("settings-top"); scrollEnd(); capture("settings-green")
        click("Rosewood")
        check(prefs.getString("palette", "") == "rose" && prefs.getString("draft-new", "") == "Review the project notes")
        check(RuntimeService.current!!.activeConversation().id == selected && RuntimeService.current!!.terminals(workspace.id).map { it.id } == terminals)
        click("Back"); await("draft returned") { find("Review the project notes") != null }; capture("draft-preserved-rose")
        checks.put("Palette saved independently; draft, selected session and terminal identity preserved through ordinary Settings/Back")
        stage("all six named swatches in both themes")
        for (palette in softPalettes) for (theme in listOf("light", "dark")) {
            render(palette = palette.id, theme = theme); management("Settings"); scrollEnd(); capture("palette-${palette.id}-$theme")
        }
        stage("management routes")
        for (screen in listOf("Agents", "Providers", "Environment", "About")) { render(); management(screen); capture(screen.lowercase()) }
        render(); management("Providers"); click("Pi"); capture("provider")
        render(); click("Open app menu"); capture("menu")
        stage("contextual workspaces and actual native file preview")
        render(); click("Workspaces"); capture("workspaces"); click("Create workspace"); capture("create-workspace")
        render(); click("Conversation details"); click("Workspace details"); capture("workspace-details")
        val fixture = File(RuntimeService.current!!.store.workspaceFile(workspace), "soft-diagnostic.md")
        if (!fixture.exists()) fixture.writeText("# Soft UI diagnostic\n\nSynthetic file owned by this diagnostic.\n")
        click("Files"); capture("files", "actual synthetic filesystem via fixture navigation"); click(fixture.name); capture("file-preview", "actual synthetic filesystem via fixture navigation")
        stage("real bundled xterm with synthetic shell output")
        render(); click("Conversation details"); click("Workspace details"); click("Terminal"); Thread.sleep(1500); capture("terminal", "fixture shell; real xterm WebView")
        click("Notes shell"); capture("terminal-switch"); click("Close dialog"); click("Close"); capture("terminal-close")
        val stopped = snapshot().let { it.copy(terminals = it.terminals.map { shell -> shell.copy(state = "stopped") }) }
        render(stopped); click("Conversation details"); click("Workspace details"); click("Terminal"); Thread.sleep(1000); capture("terminal-lost", "fixture shell; real xterm WebView")
        checks.put("Onboarding, conversation states, management, sheets, files and terminal fixture routes rendered")
        callbackChecks()
    }
    private fun callbackChecks() {
        stage("composer acceptance/rejection and cancel binding without a provider")
        var accept = false
        var received = ""
        var cancelled = false
        val value = snapshot()
        ui { host.setContent {
            CompositionLocalProvider(LocalFlat provides lightColors) {
                ConversationScreen(value, false, "", "", prefs, {}, {}, {}, {}, {}, { cancelled = true }, {}, { text, complete -> received = text; complete(accept) })
            }
        } }
        waitForIdleSync()
        edit("Message", "Keep this draft on rejection")
        click("Send message")
        check(received == "Keep this draft on rejection" && prefs.getString("draft-${session.id}", "") == received)
        accept = true
        click("Send message")
        check(!prefs.contains("draft-${session.id}"))
        ui { host.setContent {
            CompositionLocalProvider(LocalFlat provides lightColors) {
                ConversationScreen(value.copy(busy = true), false, "", "", prefs, {}, {}, {}, {}, {}, { cancelled = true }, {}, { _, complete -> complete(false) })
            }
        } }
        click("■ Stop turn")
        check(cancelled)
        checks.put("Rejected sends preserve draft; accepted sends clear draft only after callback; busy conversation cancel action bound correctly (callbacks only, zero provider requests)")
    }
    private fun narrow() {
        stage("320 dp native layout with scoped 1.5 font scale")
        render(fresh = true, narrow = true); capture("narrow-draft-font150", "320 dp fixture; native sp at 1.5 scale")
        edit("Message", "Review the project notes"); capture("narrow-keyboard-font150", "320 dp fixture; native sp at 1.5 scale and real IME")
        sendKeyDownUpSync(KeyEvent.KEYCODE_BACK)
        management("Settings"); scrollEnd(); capture("narrow-settings-font150", "320 dp fixture; native sp at 1.5 scale")
        render(snapshot("needs_you"), narrow = true); capture("narrow-needs-you-font150", "320 dp fixture; native sp at 1.5 scale")
        checks.put("Narrow and enlarged-text native composition, joined draft/IME and scrollable palette grid rendered")
    }
    private fun phone() {
        stage("actual Android capability activity; diagnostic bridge only")
        prefs.edit().putString("appearance", "light").putString("palette", "green").commit()
        ui { host.startActivity(Intent(host, PhoneAccessActivity::class.java)) }
        await("Phone tools") { find("Phone tools") != null }
        capture("phone-access", "actual Android grant status")
        click("Accessibility"); capture("accessibility", "actual Android grant status")
        click("Open Accessibility settings"); capture("android-accessibility-settings", "actual Android system UI; no grant changed")
        sendKeyDownUpSync(KeyEvent.KEYCODE_BACK); Thread.sleep(500); capture("accessibility-return", "actual Android settings return; still not granted")
        click("Back"); click("Shared phone files"); capture("android-files-settings", "actual Android all-files settings; no grant changed")
        sendKeyDownUpSync(KeyEvent.KEYCODE_BACK); Thread.sleep(500)
        click("Enable phone tools"); click("Screen capture"); capture("capture-request", "actual diagnostic bridge; no capture yet")
        click("Request one screen capture"); capture("android-capture-consent", "actual Android MediaProjection consent")
        sendKeyDownUpSync(KeyEvent.KEYCODE_BACK); Thread.sleep(500); capture("capture-denied", "actual Android consent cancellation")
        click("Back"); click("Disable phone tools")
        check(PhoneBridge.current?.isEnabled() == false)
        checks.put("Actual Accessibility/all-files settings round trips, MediaProjection consent cancellation and bridge disable; no permission granted or image captured")
    }
}
