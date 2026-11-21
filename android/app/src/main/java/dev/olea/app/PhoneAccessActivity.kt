package dev.olea.app

import android.Manifest
import android.app.NotificationManager
import android.content.ComponentName
import android.content.Intent
import android.content.pm.PackageManager
import android.location.LocationManager
import android.media.projection.MediaProjectionManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue

/** Ordinary user permission routes; opening this Activity never grants or enables phone effects. */
class PhoneAccessActivity : ComponentActivity() {
    private var captureId: String? = null
    private var offeredCaptureId: String? = null
    private var resultCaptureId: String? = null
    private var captureMessage by mutableStateOf("Each capture needs fresh Android consent.")
    private var captureBusy = false
    private var returningFromSettings = false
    private var state by mutableStateOf(PhoneAccessState())
    private var component by mutableStateOf("")
    private var cooperatingAction by mutableStateOf("")
    private val handler = Handler(Looper.getMainLooper())
    private val observed by lazy { getSharedPreferences("phone-access-ui", MODE_PRIVATE) }
    private val refreshTask = object : Runnable {
        override fun run() { refresh(); handler.postDelayed(this, 1000) }
    }

    private fun bridge() = PhoneBridge.current ?: error("Environment unavailable. Return to Olea and start it from Environment.")

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        captureId = savedInstanceState?.getString("captureId")
        offeredCaptureId = if (savedInstanceState != null) savedInstanceState.getString("offeredCaptureId") else intent.getStringExtra("requestId")
        resultCaptureId = savedInstanceState?.getString("resultCaptureId")
        returningFromSettings = savedInstanceState?.getBoolean("returningFromSettings") ?: false
        captureMessage = savedInstanceState?.getString("captureMessage") ?: if (offeredCaptureId != null)
            "A task requested one screen capture. Review it, then request Android consent or choose Not now." else captureMessage
        component = savedInstanceState?.getString("component") ?: PhoneBridge.current?.cooperatingComponent().orEmpty()
        cooperatingAction = savedInstanceState?.getString("action") ?: PhoneBridge.current?.cooperatingAction().orEmpty()
        refresh()
        setContent {
            PhoneAccessUi(state, intent.getStringExtra("request").orEmpty(),
                getSharedPreferences("olea-ui", MODE_PRIVATE).getString("appearance", "system") ?: "system",
                getSharedPreferences("olea-ui", MODE_PRIVATE).getString("palette", "green") ?: "green",
                component, cooperatingAction, { component = it }, { cooperatingAction = it },
                onSaveApp = { attempt {
                    bridge().configureCooperatingApp(component.trim(), cooperatingAction.trim())
                    component = component.trim(); cooperatingAction = cooperatingAction.trim()
                    message(if (component.isEmpty()) "Cooperating app removed." else "Cooperating app saved.")
                } }, perform = { action -> attempt { perform(action) } })
        }
    }

    private fun perform(action: PhoneAccessAction) {
        when (action) {
            PhoneAccessAction.Enable -> { bridge().setEnabled(true); message("Phone tools enabled. Android grants remain separate.") }
            PhoneAccessAction.Disable -> {
                bridge().stop()
                offeredCaptureId = null; resultCaptureId = null
                captureBusy = false; captureMessage = "Capture stopped. Enable phone tools and request fresh consent for another capture."
                message("Phone tools disabled. Android permissions can be revoked in their settings.")
            }
            PhoneAccessAction.Accessibility -> openSettings(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
            PhoneAccessAction.NotificationAccess -> openSettings(Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS))
            PhoneAccessAction.Location -> requestPermissions(arrayOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION), 10)
            PhoneAccessAction.LocationSettings -> openSettings(Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS))
            PhoneAccessAction.AppSettings -> openSettings(Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:$packageName")))
            PhoneAccessAction.AppNotifications -> if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                message("If Android does not show a prompt, allow notifications in Olea’s app settings.")
                requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), 11)
            } else openSettings(Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE, packageName))
            PhoneAccessAction.SharedFiles -> openSettings(AndroidSharedFolders(this).settingsIntent())
            PhoneAccessAction.Folder -> {
                bridge()
                startActivityForResult(Intent(Intent.ACTION_OPEN_DOCUMENT_TREE).addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or
                    Intent.FLAG_GRANT_WRITE_URI_PERMISSION or Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION or Intent.FLAG_GRANT_PREFIX_URI_PERMISSION), 12)
            }
            PhoneAccessAction.RevokeFolder -> {
                val uri = bridge().selectedFolder() ?: error("No Android folder is selected.")
                contentResolver.releasePersistableUriPermission(uri, Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
                message("Folder access revoked. Select the folder again to restore access.")
            }
            PhoneAccessAction.Capture -> requestCapture()
            PhoneAccessAction.DeclineCapture -> declineCapture()
            PhoneAccessAction.Return -> finish()
        }
    }

    private fun openSettings(intent: Intent) {
        startActivity(intent)
        returningFromSettings = true
        message("Return from Android settings to check the updated access state.")
    }

    private fun requestCapture() {
        check(captureId == null && !captureBusy) { "Complete the current capture first." }
        val phone = bridge()
        check(phone.isEnabled()) { "Enable phone tools before requesting capture." }
        val offered = offeredCaptureId
        if (offered != null && !phone.capturePending(offered)) {
            offeredCaptureId = null
            captureMessage = "The task’s capture request expired or stopped. Ask the task to request capture again."
            error(captureMessage)
        }
        val id = offered ?: phone.beginCapture()
        offeredCaptureId = null
        resultCaptureId = null
        captureId = id
        captureMessage = "Waiting for Android consent. Cancel in Android to decline this capture."
        captureBusy = true
        try { startActivityForResult(getSystemService(MediaProjectionManager::class.java).createScreenCaptureIntent(), 13) }
        catch (error: Exception) {
            captureId = null; captureBusy = false; phone.cancelConsent(id)
            captureMessage = "Android capture consent could not open. Request fresh consent to try again."
            throw error
        }
    }

    private fun declineCapture() {
        offeredCaptureId?.let { PhoneBridge.current?.cancelConsent(it) }
        offeredCaptureId = null
        if (!captureBusy) captureMessage = "Capture not requested. A later capture needs fresh Android consent."
    }

    private fun message(text: String, error: Boolean = false) { state = state.copy(message = text, error = error) }
    private fun attempt(action: () -> Unit) {
        try { action() }
        catch (error: Exception) { message(error.message ?: "Android access request failed. Review app permissions and try again.", error = true) }
        refresh()
    }

    private fun grantStatus(key: String, granted: Boolean, missing: String): String {
        if (granted && !observed.getBoolean(key, false)) observed.edit().putBoolean(key, true).apply()
        return if (granted) "Granted" else if (observed.getBoolean(key, false)) "Revoked" else missing
    }

    private fun refresh() {
        try {
            val phone = PhoneBridge.current
            val accessibilityComponent = ComponentName(this, PhoneAccessibility::class.java)
            val accessibilityAllowed = Settings.Secure.getInt(contentResolver, Settings.Secure.ACCESSIBILITY_ENABLED, 0) == 1 &&
                Settings.Secure.getString(contentResolver, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES).orEmpty().split(':')
                    .any { ComponentName.unflattenFromString(it) == accessibilityComponent }
            val notificationComponent = ComponentName(this, PhoneNotifications::class.java)
            val notificationAllowed = if (Build.VERSION.SDK_INT >= 27) getSystemService(NotificationManager::class.java).isNotificationListenerAccessGranted(notificationComponent)
                else Settings.Secure.getString(contentResolver, "enabled_notification_listeners").orEmpty().split(':')
                    .any { ComponentName.unflattenFromString(it) == notificationComponent }
            val precise = checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED
            val approximate = checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
            val accessibilityStatus = grantStatus("accessibility", accessibilityAllowed, "Not enabled")
            val notificationStatus = grantStatus("notifications", notificationAllowed, "Not enabled")
            val locationStatus = grantStatus("location", precise || approximate, "Not allowed")
            updateCapture(phone)
            state = state.copy(available = phone != null, enabled = phone?.isEnabled() == true,
                accessibility = if (accessibilityAllowed && PhoneAccessibility.active == null) "Connecting" else accessibilityStatus,
                notifications = if (notificationAllowed && !PhoneNotifications.connected) "Connecting" else notificationStatus,
                location = if (precise) "Precise" else if (approximate) "Approximate" else locationStatus,
                locationOn = getSystemService(LocationManager::class.java).let {
                    it.isProviderEnabled(LocationManager.GPS_PROVIDER) || it.isProviderEnabled(LocationManager.NETWORK_PROVIDER)
                },
                sharedFiles = RuntimeService.current?.sharedStorageStatus() ?: AndroidSharedFolders(this).access().message,
                folder = when { phone == null -> "Unavailable"; phone.folderGranted() -> "Granted"; phone.selectedFolder() != null -> "Access lost"; else -> "Not selected" },
                appNotifications = getSystemService(NotificationManager::class.java).areNotificationsEnabled(),
                capture = captureMessage, captureBusy = captureBusy)
        } catch (_: Exception) { message("Access status could not be refreshed. Return to Olea and reopen Phone access.", error = true) }
    }

    private fun updateCapture(phone: PhoneBridge?) {
        if (captureId != null) {
            captureBusy = true
            if (phone == null || !phone.capturePending(captureId!!)) captureMessage = "Capture request expired or stopped. Android consent cannot restore it."
            return
        }
        val id = resultCaptureId ?: run { captureBusy = false; return }
        val result = phone?.captureResult(id)
        captureBusy = result?.optString("status") in listOf("consent_pending", "capturing")
        captureMessage = when (result?.optString("status")) {
            "ready" -> "Capture complete. One PNG was saved for the task. Capture has ended; another capture needs fresh consent."
            "capturing" -> "Saving one screen image… Capture will end automatically."
            "consent_pending" -> "Android consent returned. Waiting for capture to start…"
            "denied" -> "Screen capture was declined. Request fresh Android consent to try again."
            "failed" -> "Screen capture did not complete. Request fresh Android consent to try again."
            "expired" -> "Capture request expired. Request fresh Android consent to try again."
            else -> "Capture stopped or the request is no longer available. Request fresh Android consent to try again."
        }
    }

    override fun onResume() {
        super.onResume()
        handler.removeCallbacks(refreshTask); refreshTask.run()
        if (returningFromSettings) {
            returningFromSettings = false
            message("Returned from Android settings. Access status refreshed.")
        }
    }
    override fun onPause() { handler.removeCallbacks(refreshTask); super.onPause() }
    override fun onDestroy() { handler.removeCallbacks(refreshTask); super.onDestroy() }
    override fun finish() {
        // Leaving without consent must not leave a task waiting for an implicit grant.
        offeredCaptureId?.let { PhoneBridge.current?.cancelConsent(it) }
        captureId?.let { PhoneBridge.current?.cancelConsent(it) }
        offeredCaptureId = null; captureId = null
        super.finish()
    }
    override fun onSaveInstanceState(out: Bundle) {
        out.putString("captureId", captureId); out.putString("offeredCaptureId", offeredCaptureId)
        out.putString("resultCaptureId", resultCaptureId); out.putString("captureMessage", captureMessage)
        out.putBoolean("returningFromSettings", returningFromSettings)
        out.putString("component", component); out.putString("action", cooperatingAction)
        super.onSaveInstanceState(out)
    }
    @Deprecated("Android platform callback")
    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        refresh()
        when (requestCode) {
            10 -> message(if (state.location in listOf("Precise", "Approximate")) "Location permission updated."
                else "Location not allowed. Continue other work, retry, or allow location in app permissions.")
            11 -> message(if (state.appNotifications) "Olea notifications allowed." else "Olea notifications not allowed. You can change this in Android app settings.")
        }
    }
    @Deprecated("Android platform callback")
    override fun onActivityResult(request: Int, result: Int, data: Intent?) {
        super.onActivityResult(request, result, data)
        attempt {
            when (request) {
                12 -> if (result == RESULT_OK && data?.data != null) {
                    bridge().saveFolder(data.data!!, data.flags)
                    message("Folder read and write access saved.")
                } else message("Folder selection cancelled. Existing access was kept.")
                13 -> {
                    val id = captureId ?: return@attempt
                    captureId = null; captureBusy = false; resultCaptureId = id
                    val phone = PhoneBridge.current
                    if (phone == null) {
                        captureMessage = "Environment stopped during consent. Start it and request fresh capture consent."
                        return@attempt
                    }
                    if (result != RESULT_OK || data == null) phone.cancelConsent(id)
                    else {
                        check(phone.capturePending(id)) { "Capture request expired or phone tools stopped. Request fresh consent." }
                        val service = Intent(this, PhoneCaptureService::class.java).putExtra("requestId", id).putExtra("consent", data)
                        try { startForegroundService(service) }
                        catch (error: Exception) { phone.cancelConsent(id); throw error }
                    }
                }
            }
        }
    }
}
