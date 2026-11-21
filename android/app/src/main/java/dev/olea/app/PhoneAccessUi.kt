package dev.olea.app

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp

internal data class PhoneAccessState(
    val available: Boolean = false,
    val enabled: Boolean = false,
    val accessibility: String = "Not enabled",
    val notifications: String = "Not enabled",
    val location: String = "Not allowed",
    val locationOn: Boolean = false,
    val folder: String = "Not selected",
    val appNotifications: Boolean = false,
    val capture: String = "Each capture needs fresh Android consent.",
    val captureBusy: Boolean = false,
    val message: String = "",
    val error: Boolean = false
)

internal enum class PhoneAccessAction {
    Enable, Disable, Accessibility, NotificationAccess, Location, LocationSettings,
    AppSettings, AppNotifications, Folder, RevokeFolder, Capture, DeclineCapture, Return
}

@Composable internal fun PhoneAccessUi(
    state: PhoneAccessState,
    initialPage: String,
    appearance: String,
    component: String,
    action: String,
    onComponent: (String) -> Unit,
    onAction: (String) -> Unit,
    onSaveApp: () -> Unit,
    perform: (PhoneAccessAction) -> Unit
) {
    var page by rememberSaveable { mutableStateOf(initialPage.takeIf { it in listOf("capture", "folder") }.orEmpty()) }
    val dark = appearance == "dark" || (appearance == "system" && isSystemInDarkTheme())
    fun back() {
        if (page == "capture") perform(PhoneAccessAction.DeclineCapture)
        if (page.isNotEmpty()) page = "" else perform(PhoneAccessAction.Return)
    }
    BackHandler { back() }
    CompositionLocalProvider(LocalFlat provides if (dark) darkColors else lightColors) {
        val colors = LocalFlat.current
        Column(Modifier.fillMaxSize().background(colors.surface).safeDrawingPadding().imePadding()) {
            Row(Modifier.fillMaxWidth().padding(horizontal = 6.dp, vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
                Glyph("‹", "Back") { back() }
                Label("Phone access", Modifier.weight(1f).semantics { heading() }, bold = true, size = 18)
            }
            Divider()
            key(page) {
                Column(Modifier.weight(1f).verticalScroll(rememberScrollState()).padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Label(when (page) {
                        "accessibility" -> "Accessibility access"
                        "notifications" -> "Notification access"
                        "location" -> "Location"
                        "folder" -> "Selected Android folder"
                        "capture" -> "Capture your screen"
                        "cooperating" -> "Cooperating app"
                        "app-notifications" -> "Olea notifications"
                        else -> "Choose your capabilities"
                    }, Modifier.semantics { heading() }, size = 25)
                    if (state.message.isNotBlank()) Notice(state.message, error = state.error)
                    if (!state.available) Notice("Environment unavailable. Return to Olea and start it from Environment to enable phone tools.")
                    else {
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
                            Label("Phone tools", Modifier.weight(1f), bold = true)
                            Chip(if (state.enabled) "Enabled" else "Disabled")
                        }
                        Label(if (state.enabled) "Agents can use the capabilities you grant below. You can disable phone tools at any time."
                            else "Enable phone tools explicitly when you want agents to use granted capabilities. Opening this screen grants nothing.", size = 14, muted = true)
                        Action(if (state.enabled) "Disable phone tools" else "Enable phone tools", Modifier.fillMaxWidth(), primary = !state.enabled) {
                            perform(if (state.enabled) PhoneAccessAction.Disable else PhoneAccessAction.Enable)
                        }
                    }
                    when (page) {
                        "accessibility" -> {
                            Chip(state.accessibility)
                            Label("Inspect and interact with app controls exposed to Android Accessibility. Android controls this special access separately.", muted = true)
                            Notice("In Android settings, choose Olea and enable or revoke its Accessibility service. Return here to check the connection.")
                            Action("Open Accessibility settings", Modifier.fillMaxWidth(), primary = true) { perform(PhoneAccessAction.Accessibility) }
                        }
                        "notifications" -> {
                            Chip(state.notifications)
                            Label("Read notifications exposed by Android while phone tools are enabled. Notification access is separate from permission to show Olea notifications.", muted = true)
                            Action("Open notification access settings", Modifier.fillMaxWidth(), primary = true) { perform(PhoneAccessAction.NotificationAccess) }
                            Label("Enable or revoke Olea in Android, then return here. Access may take a moment to connect.", size = 14, muted = true)
                        }
                        "location" -> {
                            Chip(state.location)
                            Label("Allow approximate or precise location for tasks that need it. You can continue other work without location.", muted = true)
                            Label("Android location: ${if (state.locationOn) "on" else "off"}", size = 14)
                            Action("Request location permission", Modifier.fillMaxWidth(), primary = true) { perform(PhoneAccessAction.Location) }
                            Action("Android location settings", Modifier.fillMaxWidth()) { perform(PhoneAccessAction.LocationSettings) }
                            Action("Review or revoke app permissions", Modifier.fillMaxWidth()) { perform(PhoneAccessAction.AppSettings) }
                            Label("If Android no longer shows a permission prompt, allow location in app permissions.", size = 14, muted = true)
                        }
                        "folder" -> {
                            Chip(state.folder)
                            Label("Choose one Android folder for the document-provider phone tools. This optional selection is separate from broad shared-file access at /sdcard after Android’s all-files grant, and does not change the agent’s workspace.", muted = true)
                            Action("Choose folder for read and write", Modifier.fillMaxWidth(), primary = true, enabled = state.available) { perform(PhoneAccessAction.Folder) }
                            if (state.folder == "Granted") Action("Revoke folder access", Modifier.fillMaxWidth()) { perform(PhoneAccessAction.RevokeFolder) }
                            Label("Cancel the Android picker to keep the current selection. Restore lost access by selecting the folder again.", size = 14, muted = true)
                        }
                        "capture" -> {
                            Notice(state.capture)
                            Label("Save one PNG after Android consent. Protected content may be blank. Capturing ends after this image; a later capture needs new consent.", muted = true)
                            Action(if (state.captureBusy) "Capture in progress…" else "Request one screen capture", Modifier.fillMaxWidth(), primary = true,
                                enabled = state.available && state.enabled && !state.captureBusy) { perform(PhoneAccessAction.Capture) }
                            Action(if (state.captureBusy) "Back to capabilities" else "Not now", Modifier.fillMaxWidth()) { perform(PhoneAccessAction.DeclineCapture); page = "" }
                        }
                        "cooperating" -> {
                            Label("Use an app’s documented exported Activity and action. Phone tools send only the bounded string extra named value.", muted = true)
                            Field("Activity (package/class)", component, onComponent, placeholder = "package/class")
                            Field("Action", action, onAction, placeholder = "Documented Android action")
                            Action("Save cooperating app", Modifier.fillMaxWidth(), primary = true, enabled = state.available, onClick = onSaveApp)
                            Label("Clear both fields and save to remove this integration. Android enforces the receiving app’s access rules.", size = 14, muted = true)
                        }
                        "app-notifications" -> {
                            Chip(if (state.appNotifications) "Allowed" else "Not allowed")
                            Label("Let Olea show its own runtime and capture notifications. This does not grant access to other apps’ notifications.", muted = true)
                            Action("Allow Olea notifications", Modifier.fillMaxWidth(), primary = true) { perform(PhoneAccessAction.AppNotifications) }
                            Action("Open Android app settings", Modifier.fillMaxWidth()) { perform(PhoneAccessAction.AppSettings) }
                        }
                        else -> {
                            Label("Grant only the capabilities you want. Optional access can be enabled later.", muted = true)
                            Choice("Accessibility", "Inspect and interact with exposed app controls", status = state.accessibility) { page = "accessibility" }
                            Choice("Notification access", "Read notifications shared by Android", status = state.notifications) { page = "notifications" }
                            Choice("Location", "Approximate or precise location", status = state.location) { page = "location" }
                            Choice("Android folder", "Read and write in a selected folder", status = state.folder) { page = "folder" }
                            Choice("Screen capture", "Fresh Android consent for each image") { page = "capture" }
                            Choice("Cooperating app", "Configure a documented app integration") { page = "cooperating" }
                            Choice("Olea notifications", "Permission to show app notifications", status = if (state.appNotifications) "Allowed" else "Not allowed") { page = "app-notifications" }
                        }
                    }
                    Spacer(Modifier.height(4.dp))
                    Action(if (page.isEmpty()) "Continue without changing access" else "Return to Olea", Modifier.fillMaxWidth()) { perform(PhoneAccessAction.Return) }
                    Label("Android permissions remain under your control. Disabling phone tools stops these bridge operations. Shared-file access through stock file tools follows Android’s separate all-files grant; revoke it in Android settings.", size = 12, muted = true)
                }
            }
        }
    }
}
