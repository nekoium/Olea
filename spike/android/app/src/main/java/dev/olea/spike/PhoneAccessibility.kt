package dev.olea.spike

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID

class PhoneAccessibility : AccessibilityService() {
    companion object { @Volatile var active: PhoneAccessibility? = null }
    private val nodes = mutableMapOf<String, AccessibilityNodeInfo>()
    override fun onServiceConnected() { active = this }
    override fun onAccessibilityEvent(event: AccessibilityEvent?) {}
    override fun onInterrupt() { nodes.clear() }
    override fun onDestroy() { active = null; nodes.clear(); super.onDestroy() }

    fun inspect(): JSONObject {
        nodes.clear()
        val root = rootInActiveWindow ?: error("NO_WINDOW")
        val result = JSONArray()
        val generation = UUID.randomUUID().toString().take(8)
        fun visit(node: AccessibilityNodeInfo, depth: Int) {
            if (result.length() >= 300 || depth > 24) return
            val id = "$generation:${result.length()}"
            nodes[id] = node
            val bounds = android.graphics.Rect().also { node.getBoundsInScreen(it) }
            result.put(JSONObject().put("nodeId", id).put("text", node.text?.toString()?.take(500))
                .put("description", node.contentDescription?.toString()?.take(500)).put("viewId", node.viewIdResourceName)
                .put("clickable", node.isClickable).put("className", node.className?.toString())
                .put("bounds", JSONArray(listOf(bounds.left, bounds.top, bounds.right, bounds.bottom))).put("depth", depth))
            for (i in 0 until node.childCount) node.getChild(i)?.let { visit(it, depth + 1) }
        }
        visit(root, 0)
        return JSONObject().put("package", root.packageName).put("nodes", result).put("truncated", result.length() >= 300)
    }

    fun click(id: String): JSONObject {
        var node = nodes.remove(id) ?: error("STALE_NODE")
        if (!node.refresh()) error("STALE_NODE")
        var depth = 0
        while (!node.isClickable && depth++ < 6) node = node.parent ?: error("NOT_CLICKABLE")
        nodes.clear()
        check(node.performAction(AccessibilityNodeInfo.ACTION_CLICK)) { "CLICK_REJECTED" }
        return JSONObject().put("clicked", true).put("action", "ACTION_CLICK")
    }
}
