package dev.olea.app

import android.app.Notification
import android.service.notification.NotificationListenerService
import org.json.JSONArray
import org.json.JSONObject

class PhoneNotifications : NotificationListenerService() {
    companion object {
        @Volatile private var active: PhoneNotifications? = null
        val connected: Boolean get() = active != null
        fun read(limit: Int): JSONObject {
            val service = active ?: error("NOTIFICATION_ACCESS_REQUIRED_OPEN_PHONE_ACCESS")
            val values = service.activeNotifications.orEmpty().asSequence()
                .filter { it.packageName != service.packageName }.sortedByDescending { it.postTime }.take(limit.coerceIn(1, 20))
                .map { item -> JSONObject().put("package", item.packageName).put("id", item.id).put("timeMs", item.postTime)
                    .put("title", item.notification.extras.getCharSequence(Notification.EXTRA_TITLE)?.toString()?.take(256))
                    .put("text", item.notification.extras.getCharSequence(Notification.EXTRA_TEXT)?.toString()?.take(512)) }.toList()
            return JSONObject().put("notifications", JSONArray(values)).put("limit", limit.coerceIn(1, 20))
        }
    }
    override fun onListenerConnected() { active = this }
    override fun onListenerDisconnected() { if (active === this) active = null }
    override fun onDestroy() { if (active === this) active = null; super.onDestroy() }
}
