package dev.olea.app

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.graphics.Path
import android.graphics.Rect
import android.os.SystemClock
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID

class PhoneAccessibility : AccessibilityService() {
    companion object { @Volatile var active: PhoneAccessibility? = null; private set }
    private val nodes = mutableMapOf<String, AccessibilityNodeInfo>()
    private var inspectedAt = 0L
    override fun onServiceConnected() { active = this }
    override fun onAccessibilityEvent(event: AccessibilityEvent?) { clearNodes() }
    override fun onInterrupt() { clearNodes() }
    override fun onDestroy() { if (active === this) active = null; clearNodes(); super.onDestroy() }

    @Suppress("DEPRECATION")
    fun clearNodes() { nodes.values.forEach { it.recycle() }; nodes.clear() }

    fun inspect(): JSONObject {
        clearNodes()
        val root = rootInActiveWindow ?: error("NO_ACCESSIBLE_WINDOW")
        val result = JSONArray()
        val generation = UUID.randomUUID().toString()
        var truncated = false
        fun visit(node: AccessibilityNodeInfo, depth: Int) {
            val id = "$generation:${result.length()}"
            nodes[id] = node
            val bounds = Rect().also { node.getBoundsInScreen(it) }
            result.put(JSONObject().put("nodeId", id).put("text", if (node.isPassword) null else node.text?.toString()?.take(500))
                .put("description", if (node.isPassword) null else node.contentDescription?.toString()?.take(500))
                .put("viewId", node.viewIdResourceName?.take(500)).put("clickable", node.isClickable)
                .put("className", node.className?.toString()?.take(200)).put("depth", depth)
                .put("bounds", JSONArray(listOf(bounds.left, bounds.top, bounds.right, bounds.bottom))))
            for (i in 0 until node.childCount) {
                if (result.length() >= 300 || depth >= 24) { truncated = true; break }
                node.getChild(i)?.let { visit(it, depth + 1) }
            }
        }
        visit(root, 0)
        inspectedAt = SystemClock.elapsedRealtime()
        return JSONObject().put("package", root.packageName?.toString()).put("nodes", result).put("truncated", truncated)
    }

    @Suppress("DEPRECATION")
    fun click(id: String): JSONObject {
        check(SystemClock.elapsedRealtime() - inspectedAt <= 10000) { "STALE_NODE_INSPECT_AGAIN" }
        var node = nodes[id] ?: error("STALE_NODE_INSPECT_AGAIN")
        check(node.refresh()) { "STALE_NODE_INSPECT_AGAIN" }
        val parents = mutableListOf<AccessibilityNodeInfo>()
        try {
            var depth = 0
            while (!node.isClickable && depth++ < 6) {
                node = (node.parent ?: error("NOT_CLICKABLE")).also { parents.add(it) }
            }
            check(node.isClickable && node.performAction(AccessibilityNodeInfo.ACTION_CLICK)) { "CLICK_REJECTED" }
            return JSONObject().put("clicked", true).put("action", "ACTION_CLICK")
        } finally { parents.forEach { it.recycle() }; clearNodes() }
    }

    fun swipe(args: JSONObject): JSONObject {
        val width = resources.displayMetrics.widthPixels
        val height = resources.displayMetrics.heightPixels
        val x = args.optInt("x", width / 2)
        val startY = args.optInt("startY", height * 4 / 5)
        val endY = args.optInt("endY", height / 4)
        check(x in 0 until width && startY in 0 until height && endY in 0 until height) { "INVALID_GESTURE" }
        val path = Path().apply { moveTo(x.toFloat(), startY.toFloat()); lineTo(x.toFloat(), endY.toFloat()) }
        val gesture = GestureDescription.Builder().addStroke(GestureDescription.StrokeDescription(path, 0, 350)).build()
        clearNodes()
        check(dispatchGesture(gesture, null, null)) { "GESTURE_REJECTED" }
        return JSONObject().put("dispatched", true)
    }
}
