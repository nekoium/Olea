package dev.olea.app

import android.Manifest
import android.app.Activity
import android.content.Intent
import android.media.projection.MediaProjectionManager
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import android.widget.Toast

/** Ordinary user permission routes; opening this Activity never grants or enables phone effects. */
class PhoneAccessActivity : Activity() {
    private var captureId: String? = null
    private var offeredCaptureId: String? = null
    private lateinit var status: TextView
    private fun bridge() = PhoneBridge.current ?: error("Start the environment before changing phone access")
    override fun onCreate(state: Bundle?) {
        super.onCreate(state)
        captureId = state?.getString("captureId")
        offeredCaptureId = state?.getString("offeredCaptureId") ?: intent.getStringExtra("requestId")
        val layout = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(24, 24, 24, 24) }
        setContentView(ScrollView(this).apply { addView(layout) })
        fun text(value: String) { layout.addView(TextView(this).apply { text = value; textSize = 16f; setPadding(0, 12, 0, 8) }) }
        fun button(title: String, action: () -> Unit) {
            layout.addView(Button(this).apply { text = title; setOnClickListener { attempt(action); refresh() } })
        }
        text("Phone access")
        status = TextView(this).also { layout.addView(it) }
        button("Enable phone tools") { bridge().setEnabled(true) }
        button("Disable phone tools") { bridge().stop() }
        button("Accessibility settings") { startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)) }
        button("Notification access settings") { startActivity(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)) }
        button("Allow location") { requestPermissions(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION), 10) }
        button("Android location settings") { startActivity(Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS)) }
        if (Build.VERSION.SDK_INT >= 33) button("Allow Olea notifications") { requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), 11) }
        button("Select folder for read and write") {
            startActivityForResult(Intent(Intent.ACTION_OPEN_DOCUMENT_TREE).addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or
                Intent.FLAG_GRANT_WRITE_URI_PERMISSION or Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION or Intent.FLAG_GRANT_PREFIX_URI_PERMISSION), 12)
        }
        text("Screen capture saves one PNG after Android consent. Protected content may be blank.")
        button("Request one screen capture") {
            check(captureId == null) { "Complete the current Android capture consent first" }
            val phone = bridge()
            val offered = offeredCaptureId
            val id = if (offered != null && phone.capturePending(offered)) offered else phone.beginCapture()
            offeredCaptureId = null
            captureId = id
            try { startActivityForResult(getSystemService(MediaProjectionManager::class.java).createScreenCaptureIntent(), 13) }
            catch (error: Exception) { captureId = null; phone.cancelConsent(id); throw error }
        }
        text("Cooperating app: enter its documented exported Activity (package/class) and action. Only the bounded string extra named value is sent.")
        val component = EditText(this).apply { hint = "package/class"; setSingleLine(); setText(PhoneBridge.current?.cooperatingComponent().orEmpty()) }
        val action = EditText(this).apply { hint = "Action"; setSingleLine(); setText(PhoneBridge.current?.cooperatingAction().orEmpty()) }
        layout.addView(component); layout.addView(action)
        button("Save cooperating app") { bridge().configureCooperatingApp(component.text.toString().trim(), action.text.toString().trim()) }
        button("Back") { finish() }
    }
    private fun attempt(action: () -> Unit) {
        try { action() } catch (error: Exception) { Toast.makeText(this, error.message ?: "Android access request failed", Toast.LENGTH_LONG).show() }
    }
    private fun refresh() {
        val phone = PhoneBridge.current
        status.text = if (phone == null) "Environment is stopped. Start it to configure phone tools."
        else "Phone tools: ${if (phone.isEnabled()) "enabled" else "disabled"}\nAccessibility: ${PhoneAccessibility.active != null}\nNotification access: ${PhoneNotifications.connected}\nSelected folder read/write: ${phone.folderGranted()}"
    }
    override fun onResume() { super.onResume(); refresh() }
    override fun onSaveInstanceState(out: Bundle) { out.putString("captureId", captureId); out.putString("offeredCaptureId", offeredCaptureId); super.onSaveInstanceState(out) }
    @Deprecated("Android platform callback")
    override fun onActivityResult(request: Int, result: Int, data: Intent?) {
        super.onActivityResult(request, result, data)
        attempt {
            when (request) {
                12 -> if (result == RESULT_OK && data?.data != null) bridge().saveFolder(data.data!!, data.flags)
                13 -> {
                    val id = captureId ?: return@attempt
                    captureId = null
                    val phone = PhoneBridge.current ?: return@attempt
                    if (result != RESULT_OK || data == null) phone.cancelConsent(id)
                    else {
                        check(phone.capturePending(id)) { "Capture request expired or phone tools stopped; request consent again" }
                        val service = Intent(this, PhoneCaptureService::class.java).putExtra("requestId", id).putExtra("consent", data)
                        try { startForegroundService(service) }
                        catch (error: Exception) { phone.cancelConsent(id); throw error }
                    }
                }
            }
        }
        refresh()
    }
}
