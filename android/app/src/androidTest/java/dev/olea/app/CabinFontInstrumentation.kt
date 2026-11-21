package dev.olea.app

import android.app.Instrumentation
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.Typeface
import android.os.Bundle
import android.os.SystemClock
import android.view.KeyEvent
import android.view.accessibility.AccessibilityNodeInfo
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.BasicText
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.LocalFontFamilyResolver
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontSynthesis
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.unit.Constraints
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.security.MessageDigest

/** Typeface/resource and native rendering checks only; no agent or terminal process is started. */
class CabinFontInstrumentation : Instrumentation() {
    private lateinit var host: MainActivity
    private var nonce = 0
    private var phase = "start"
    private val captures = JSONArray()
    private val weights = JSONObject()
    private val wrapping = JSONArray()
    private val checks = JSONArray()
    private var resolved = emptyList<Typeface>()
    private val prefs get() = targetContext.getSharedPreferences("olea-ui", Context.MODE_PRIVATE)
    private val evidence get() = File(targetContext.filesDir, "cabin-evidence").apply { mkdirs() }
    private val workspace = WorkspaceInfo("default", "Default", "")
    private val session = ConversationInfo("cabin-fixture", "Review project notes", "pi", workspace.id)
    private val paragraph = "The notes are consistent. Keep the conversation readable while the agent works through a longer task. Open tool details when you need the exact output, then return to the reply without losing your place. Provider settings and workspace files remain available on demand."
    private val longReply = "## Two things to follow up\n\n$paragraph\n\n• **Reading view.** Long replies need a clear rhythm, comfortable spacing and useful headings.\n• **Provider setup.** Keep connection settings separate from choosing a model.\n\n## A small local check\n\n```sh\nprintf 'workspace ready\\n'\ncat project-notes.md\n```\n\nThe code above remains monospace. Read `PRODUCT.md` before making changes.\n\n$paragraph\n\n## Language fallback\n\nEnglish · Français · Ελληνικά · Русский · 中文 · العربية · 日本語 · 😀\n\n$paragraph\n\nEnd of diagnostic reply."
    private fun snapshot() = UiSnapshot(available = true, workspaces = listOf(workspace), conversations = listOf(session), active = session,
        entries = listOf("user: Read the project notes and tell me what needs attention.", "assistant: $longReply", "Tool read · 3 project files\nPRODUCT.md\nDESIGN.md\nproject-notes.md"),
        status = "Saved fixture", ready = true, environmentReady = false,
        states = listOf(RuntimeConversationState(session.id, "pi", workspace.id, "done", true, false, emptyList())))
    override fun onCreate(arguments: Bundle?) {
        super.onCreate(arguments)
        check(targetContext.packageName == "dev.olea.softtest") { "Only the existing isolated diagnostic app is allowed" }
        start()
    }
    private fun <T> ui(action: () -> T): T { var value: Result<T>? = null; runOnMainSync { value = runCatching(action) }; return value!!.getOrThrow() }
    private fun stage(value: String) { phase = value; sendStatus(1, Bundle().apply { putString("stream", "Cabin: $value\n") }) }
    private fun await(description: String, condition: () -> Boolean) {
        val deadline = SystemClock.elapsedRealtime() + 8000
        while (!condition() && SystemClock.elapsedRealtime() < deadline) Thread.sleep(50)
        check(condition()) { "Timed out: $description" }
    }
    private fun nodes(): List<AccessibilityNodeInfo> {
        val all = mutableListOf<AccessibilityNodeInfo>()
        fun visit(node: AccessibilityNodeInfo) { all.add(node); for (index in 0 until node.childCount) node.getChild(index)?.let(::visit) }
        uiAutomation.rootInActiveWindow?.let(::visit)
        return all
    }
    private fun find(label: String): AccessibilityNodeInfo? { val all = nodes(); return all.firstOrNull { it.contentDescription?.toString() == label } ?: all.firstOrNull { it.text?.toString() == label } }
    private fun click(label: String) {
        await(label) { find(label) != null }
        var node = find(label)
        while (node != null && !node.isClickable) node = node.parent
        check(node?.performAction(AccessibilityNodeInfo.ACTION_CLICK) == true) { "Cannot click $label" }
        waitForIdleSync(); Thread.sleep(150)
    }
    private fun edit(label: String, text: String) {
        click(label)
        val node = nodes().firstOrNull { it.isEditable && it.contentDescription?.toString() == label } ?: nodes().first { it.isEditable }
        check(node.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, Bundle().apply { putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, text) }))
        waitForIdleSync()
    }
    private fun scroll(times: Int = 1) { repeat(times) { nodes().firstOrNull { it.isScrollable }?.performAction(AccessibilityNodeInfo.ACTION_SCROLL_FORWARD); Thread.sleep(180) }; waitForIdleSync() }
    private fun capture(name: String, widthDp: Int = 411, scale: Float = 1f, kind: String = "synthetic snapshot; production Composables") {
        waitForIdleSync(); Thread.sleep(300)
        val bitmap = checkNotNull(uiAutomation.takeScreenshot())
        File(evidence, "$name.png").outputStream().use { bitmap.compress(Bitmap.CompressFormat.PNG, 100, it) }
        captures.put(JSONObject().put("file", "$name.png").put("entry", phase).put("font", "Cabin variable upright; wght 400/500/600/700; wdth 100; no synthesis")
            .put("palette", prefs.getString("palette", "green")).put("appearance", prefs.getString("appearance", "light"))
            .put("widthPx", bitmap.width).put("heightPx", bitmap.height).put("contentWidthDp", widthDp).put("fontScale", scale).put("kind", kind))
        bitmap.recycle()
    }
    @Composable private fun ResolveFonts(widthDp: Int, scale: Float) {
        val resolver = LocalFontFamilyResolver.current
        val faces = listOf(FontWeight.Normal, FontWeight.Medium, FontWeight.SemiBold, FontWeight.Bold).map {
            resolver.resolve(SoftFontFamily, it, fontSynthesis = FontSynthesis.None).value as Typeface
        }
        val measurer = rememberTextMeasurer()
        val density = LocalDensity.current
        val layout = measurer.measure(AnnotatedString(paragraph), TextStyle(fontFamily = SoftFontFamily, fontSize = 14.sp, lineHeight = 25.2.sp, fontSynthesis = FontSynthesis.None),
            constraints = Constraints(maxWidth = with(density) { (widthDp - 50).dp.roundToPx() }))
        val systemLayout = measurer.measure(AnnotatedString(paragraph), TextStyle(fontFamily = FontFamily.SansSerif, fontSize = 14.sp, lineHeight = 25.2.sp),
            constraints = Constraints(maxWidth = with(density) { (widthDp - 50).dp.roundToPx() }))
        SideEffect {
            resolved = faces
            if ((0 until wrapping.length()).none { wrapping.getJSONObject(it).getInt("widthDp") == widthDp && wrapping.getJSONObject(it).getDouble("fontScale").toFloat() == scale }) {
                wrapping.put(JSONObject().put("widthDp", widthDp).put("fontScale", scale).put("bodySizeSp", 14).put("lineHeightSp", 25.2)
                    .put("lineCount", layout.lineCount).put("previousSystemSansLineCount", systemLayout.lineCount).put("heightPx", layout.size.height).put("overflowWidth", layout.didOverflowWidth).put("overflowHeight", layout.didOverflowHeight))
            }
        }
    }
    private fun render(setup: Int? = null, draft: Boolean = false, widthDp: Int = 411, scale: Float = 1f, palette: String = "green", appearance: String = "light", entries: List<String>? = null) {
        prefs.edit().putBoolean("setup-complete", setup == null).putInt("setup-step", setup ?: 0).putBoolean("fresh-chat", draft)
            .putString("setup-agent", "pi").putString("setup-workspace", workspace.id).putString("palette", palette).putString("appearance", appearance).commit()
        val instance = ++nonce
        ui { host.setContent { key(instance) {
            val density = LocalDensity.current
            CompositionLocalProvider(LocalDensity provides Density(density.density, scale)) {
                ResolveFonts(widthDp, scale)
                Box(Modifier.fillMaxSize().background(softPalette(palette).let { if (appearance == "dark") it.dark.surface else it.light.surface }), contentAlignment = Alignment.Center) {
                    Box(Modifier.width(widthDp.dp).fillMaxHeight()) { OleaApp(snapshot().let { if (entries == null) it else it.copy(entries = entries) }, "", 0, {}, { /* Rendering only: never execute runtime callbacks. */ }, {}) }
                }
            }
        } } }
        waitForIdleSync(); Thread.sleep(200)
    }
    private fun fontChecks() {
        stage("packaged font, four actual variable weights and fallback")
        fun digest(bytes: ByteArray) = MessageDigest.getInstance("SHA-256").digest(bytes).joinToString("") { "%02x".format(it) }
        check(digest(targetContext.resources.openRawResource(R.font.cabin_variable).use { it.readBytes() }) == "a16576e6cec01cf994c46838ed1c17ffdb62cf6da8430edfbcb011f57dd62457")
        check(digest(targetContext.resources.openRawResource(R.raw.cabin_ofl).use { it.readBytes() }) == "965bf33673aec648a3b399185639e502b58e52693d004fc03f6bbdf21b1a0094")
        render()
        check(resolved.size == 4)
        val coverages = mutableListOf<Long>()
        resolved.forEachIndexed { index, face ->
            val paint = Paint(Paint.ANTI_ALIAS_FLAG).apply { typeface = face; textSize = 48f; color = android.graphics.Color.WHITE; isFakeBoldText = false }
            val bitmap = Bitmap.createBitmap(1000, 100, Bitmap.Config.ARGB_8888)
            Canvas(bitmap).drawText("Cabin Aa Gg Rr 0123456789", 8f, 65f, paint)
            var alpha = 0L
            for (y in 0 until bitmap.height) for (x in 0 until bitmap.width) alpha += android.graphics.Color.alpha(bitmap.getPixel(x, y))
            bitmap.recycle(); coverages.add(alpha)
            val weight = listOf(400, 500, 600, 700)[index]
            weights.put(weight.toString(), JSONObject().put("androidTypefaceWeight", face.weight).put("fakeBold", paint.isFakeBoldText)
                .put("widthPxAt48", paint.measureText("Cabin Aa Gg Rr 0123456789")).put("glyphAlphaCoverage", alpha)
                .put("cjkFallbackGlyph", paint.hasGlyph("中")).put("arabicFallbackGlyph", paint.hasGlyph("ع")).put("emojiFallbackGlyph", paint.hasGlyph("😀")))
            check(paint.hasGlyph("中") && paint.hasGlyph("ع") && paint.hasGlyph("😀"))
        }
        check(coverages.zipWithNext().all { (a, b) -> b > a }) { "Weight shapes did not increase: $coverages" }
        checks.put("APK font/OFL hashes match approved sources; four resolved weight shapes differ with increasing coverage and no fake bold; Android fallback resolves CJK/Arabic/emoji")
        ui { host.setContent { CompositionLocalProvider(LocalFlat provides lightColors) { Box(Modifier.fillMaxSize().background(lightColors.surface).safeDrawingPadding()) { Page {
            Heading("Cabin / real weights")
            listOf(FontWeight.Normal, FontWeight.Medium, FontWeight.SemiBold, FontWeight.Bold).forEach { weight ->
                BasicText("${weight.weight} · Aa Gg Rr 0123456789", style = TextStyle(fontFamily = SoftFontFamily, fontWeight = weight, fontSynthesis = FontSynthesis.None, fontSize = 24.sp, color = lightColors.ink))
            }
            Label("English · Français · Ελληνικά · Русский · 中文 · العربية · 日本語 · 😀")
            Label("printf 'workspace ready\\n'", mono = true)
            Notice("Palettes change color, not typography.")
        } } } } }
        capture("weights-and-fallback")
    }
    override fun onStart() {
        var passed = false
        val receipt = JSONObject().put("providerRequests", 0).put("device", "emulator-5554").put("api", android.os.Build.VERSION.SDK_INT)
            .put("abi", BuildConfig.RUNTIME_ABI).put("registeredFamily", SoftFontFamily.toString()).put("package", targetContext.packageName).put("font", "Cabin").put("captures", captures).put("weights", weights).put("wrapping", wrapping).put("checks", checks)
        try {
            host = startActivitySync(Intent(targetContext, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) as MainActivity
            fontChecks()
            stage("long conversation at default and narrow enlarged text")
            render(); repeat(6) { nodes().firstOrNull { it.isScrollable }?.performAction(AccessibilityNodeInfo.ACTION_SCROLL_BACKWARD); Thread.sleep(100) }; capture("conversation-top"); scroll(3); capture("conversation-end")
            render(entries = listOf("assistant: ## A small local check\n\nThe technical output keeps its original monospace font.\n\n```sh\nprintf 'workspace ready\\n'\ncat project-notes.md\n```\n\nRead `PRODUCT.md` before making changes.")); capture("conversation-code")
            render(widthDp = 320, scale = 1.5f); repeat(6) { nodes().firstOrNull { it.isScrollable }?.performAction(AccessibilityNodeInfo.ACTION_SCROLL_BACKWARD); Thread.sleep(100) }; capture("conversation-narrow-top", 320, 1.5f); scroll(5); capture("conversation-narrow-end", 320, 1.5f)
            render(entries = listOf("user: Read the project notes and tell me what needs attention.", "assistant: ## Two things to follow up\n\nThe notes are consistent. Two items still need a decision before the next release.\n\n• **Reading view.** Decide how long replies and code should appear on a phone.\n• **Provider setup.** Keep connection settings separate from choosing a model.", "Tool read · 3 project files")); capture("conversation-reference")
            stage("joined composer and real IME")
            render(draft = true); capture("draft"); edit("Message", "Review the project notes with Cabin")
            await("real Gboard") { ui { host.window.decorView.rootWindowInsets?.isVisible(android.view.WindowInsets.Type.ime()) == true } }
            capture("draft-keyboard", kind = "synthetic draft with actual Android IME")
            sendKeyDownUpSync(KeyEvent.KEYCODE_BACK)
            stage("Settings palette change retains Cabin and draft")
            click("Open app menu"); click("Settings"); capture("settings"); scroll(3)
            val before = resolved.toList()
            click("Soft purple"); capture("settings-purple")
            check(resolved.zip(before).all { (after, prior) -> after == prior })
            check(prefs.getString("draft-new", "") == "Review the project notes with Cabin")
            click("Back"); capture("draft-purple")
            checks.put("Ordinary palette selection preserves four resolved Cabin typefaces and unsent draft")
            render(draft = true, widthDp = 320, scale = 1.5f); edit("Message", "Review project notes")
            capture("draft-narrow-keyboard", 320, 1.5f, "320 dp / 1.5× sp; actual Android IME")
            sendKeyDownUpSync(KeyEvent.KEYCODE_BACK)
            render(widthDp = 320, scale = 1.5f); click("Open app menu"); click("Settings"); scroll(3); capture("settings-narrow", 320, 1.5f)
            render(palette = "purple", appearance = "dark"); click("Open app menu"); click("Settings"); capture("settings-purple-dark")
            stage("onboarding, provider fields, phone access and license inclusion")
            render(setup = 0); capture("onboarding")
            render(setup = 0, widthDp = 320, scale = 1.5f); capture("onboarding-narrow", 320, 1.5f)
            render(setup = 5); edit("HTTPS API base URL", "https://api.example.test/v1"); sendKeyDownUpSync(KeyEvent.KEYCODE_BACK); capture("provider")
            render(setup = 5, widthDp = 320, scale = 1.5f); capture("provider-narrow", 320, 1.5f); scroll(2); capture("provider-narrow-actions", 320, 1.5f)
            render(); click("Open app menu"); click("Phone access"); capture("phone-access")
            render(); click("Open app menu"); click("About"); click("Licenses"); scroll(2); capture("cabin-license")
            checks.put("Production labels/replies/fields/composer/settings/onboarding/phone/license paths rendered; code remains monospace")
            check((0 until wrapping.length()).all { !wrapping.getJSONObject(it).getBoolean("overflowWidth") && !wrapping.getJSONObject(it).getBoolean("overflowHeight") })
            passed = true
        } catch (error: Throwable) {
            receipt.put("failure", "${error.javaClass.simpleName}: ${error.message}").put("phase", phase).put("location", error.stackTrace.firstOrNull { it.className.contains("CabinFontInstrumentation") }.toString())
            runCatching { capture("failure") }
        } finally {
            receipt.put("passed", passed)
            File(evidence, "receipt.json").writeText(receipt.toString(2))
            finish(if (passed) -1 else 0, Bundle().apply { putString("stream", receipt.toString(2)) })
        }
    }
}
