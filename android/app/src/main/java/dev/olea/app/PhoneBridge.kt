package dev.olea.app

import android.Manifest
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.location.LocationManager
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.provider.DocumentsContract
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.net.InetAddress
import java.net.ServerSocket
import java.net.Socket
import java.security.MessageDigest
import java.security.SecureRandom
import java.util.UUID
import java.util.Timer
import java.util.TimerTask
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Service-owned native authority; start disabled, explicitly enable, disable on STOP/backend death,
 * and close on service destruction. Bind [directory] to /olea-phone in Linux; config.json contains
 * {url: loopback /phone endpoint, token: random Bearer token}. POST {id?, operation, args?} returns
 * {id, ok, result} or {id, ok:false, error:{code,message}}. capture_request returns requestId;
 * capture_result requires args.requestId and returns pending/ready/failed metadata, never pixels.
 */
class PhoneBridge(context: Context) : AutoCloseable {
    companion object { @Volatile var current: PhoneBridge? = null; private set }
    private val context = context.applicationContext
    private val main = Handler(Looper.getMainLooper())
    private val lock = Any()
    private val timeouts = Timer("olea-phone-timeouts", true)
    private val preferences = context.getSharedPreferences("phone-access", Context.MODE_PRIVATE)
    val directory = File(context.filesDir, "phone")
    val configFile = File(directory, "config.json")
    @Volatile private var server: ServerSocket? = null
    @Volatile private var connection: Socket? = null
    private var enabled = false
    private var authorityEpoch = 0L
    private var closed = false
    private var requestId: String? = null
    private var requestAt = 0L
    private var capture: JSONObject? = null
    private var captureCancel: (() -> Unit)? = null
    private var token = ""

    fun start(): File = synchronized(lock) {
        check(!closed) { "BRIDGE_CLOSED" }
        if (server != null) return@synchronized configFile
        check(current == null || current === this) { "BRIDGE_ALREADY_RUNNING" }
        directory.mkdirs()
        directory.listFiles()?.filter { it.name.endsWith(".png") || it.name.endsWith(".tmp") }?.forEach { it.delete() }
        token = ByteArray(32).also { SecureRandom().nextBytes(it) }.joinToString("") { "%02x".format(it) }
        val socket = ServerSocket(0, 4, InetAddress.getByName("127.0.0.1"))
        try {
            val temp = File(directory, "config.tmp")
            temp.writeText(JSONObject().put("url", "http://127.0.0.1:${socket.localPort}/phone").put("token", token).toString())
            check(temp.renameTo(configFile)) { "CONFIG_WRITE_FAILED" }
        } catch (failure: Exception) { socket.close(); throw failure }
        server = socket
        current = this
        Thread({
            while (!socket.isClosed) {
                try {
                    val client = socket.accept()
                    connection = client
                    if (socket.isClosed) client.close() else handle(client)
                    connection = null
                } catch (_: Exception) { /* A closed listener terminates the finite accept loop. */ }
            }
        }, "olea-phone-bridge").apply { isDaemon = true; start() }
        configFile
    }

    fun setEnabled(value: Boolean) = synchronized(lock) {
        check(!closed || !value) { "BRIDGE_CLOSED" }
        check(!value || server != null) { "BRIDGE_NOT_STARTED" }
        enabled = value
        if (!value) {
            authorityEpoch++
            requestId = null
            capture = null
            captureCancel?.invoke()
            captureCancel = null
            main.post { PhoneAccessibility.active?.clearNodes() }
        }
    }

    /** STOP revokes authority but keeps transport available for capability/status reads. */
    fun stop() { setEnabled(false) }
    override fun close() = synchronized(lock) {
        stop()
        closed = true
        server?.close(); server = null
        connection?.close(); connection = null
        timeouts.cancel()
        configFile.delete()
        if (current === this) current = null
    }

    fun isEnabled(): Boolean = synchronized(lock) { enabled && !closed }
    fun selectedFolder(): Uri? = preferences.getString("folder", null)?.let(Uri::parse)
    fun folderGranted(): Boolean {
        val uri = selectedFolder() ?: return false
        return context.contentResolver.persistedUriPermissions.any { it.uri == uri && it.isReadPermission && it.isWritePermission }
    }

    fun saveFolder(uri: Uri, flags: Int) {
        val wanted = Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION
        check(flags and wanted == wanted) { "FOLDER_REQUIRES_READ_AND_WRITE" }
        context.contentResolver.takePersistableUriPermission(uri, wanted)
        check(context.contentResolver.persistedUriPermissions.any { it.uri == uri && it.isReadPermission && it.isWritePermission }) { "FOLDER_GRANT_NOT_PERSISTED" }
        val previous = selectedFolder()
        check(preferences.edit().putString("folder", uri.toString()).commit()) { "FOLDER_SAVE_FAILED" }
        if (previous != null && previous != uri) runCatching { context.contentResolver.releasePersistableUriPermission(previous, wanted) }
    }

    fun cooperatingComponent(): String = preferences.getString("component", "") ?: ""
    fun cooperatingAction(): String = preferences.getString("action", "") ?: ""
    fun configureCooperatingApp(component: String, action: String) {
        val parsed = ComponentName.unflattenFromString(component)
        check(component.isBlank() && action.isBlank() || parsed != null && action.length in 1..256 && action.none { it.isWhitespace() }) { "ENTER_EXPLICIT_PACKAGE_CLASS_AND_ACTION" }
        check(preferences.edit().putString("component", component).putString("action", action).commit()) { "APP_CONFIG_SAVE_FAILED" }
    }

    fun beginCapture(): String = synchronized(lock) {
        check(enabled && !closed) { "PHONE_DISABLED_ENABLE_IN_PHONE_ACCESS" }
        captureCancel?.invoke(); captureCancel = null
        directory.listFiles()?.filter { it.name.endsWith(".png") }?.forEach { it.delete() }
        capture = null
        UUID.randomUUID().toString().also { requestId = it; requestAt = SystemClock.elapsedRealtime() }
    }

    fun capturePending(id: String): Boolean = synchronized(lock) {
        enabled && !closed && requestId == id && SystemClock.elapsedRealtime() - requestAt < 120000 && capture == null
    }

    /** The projection service consumes consent once; a stale Activity cannot restore stopped authority. */
    internal fun attachCapture(id: String, cancel: () -> Unit, start: () -> Unit) = synchronized(lock) {
        check(capturePending(id) && captureCancel == null) { "CAPTURE_CONSENT_STALE_REQUEST_AGAIN" }
        captureCancel = cancel
        capture = JSONObject().put("requestId", id).put("status", "capturing")
        try { start() } catch (failure: Exception) { finishCapture(id, null, "CAPTURE_START_FAILED"); throw failure }
    }

    internal fun finishCapture(id: String, result: JSONObject?, error: String?) = synchronized(lock) {
        if (enabled && !closed && requestId == id) {
            if (capture?.optString("status") == "capturing") {
                capture = result ?: JSONObject().put("requestId", id).put("status", "failed").put("error", error)
            }
            captureCancel = null
        }
    }

    internal fun commitCapture(id: String, writer: () -> JSONObject): Boolean = synchronized(lock) {
        if (!enabled || closed || requestId != id || capture?.optString("status") != "capturing") return@synchronized false
        capture = writer()
        true
    }

    fun cancelConsent(id: String) = synchronized(lock) {
        if (requestId == id && capture == null) {
            capture = JSONObject().put("requestId", id).put("status", "denied").put("error", "CAPTURE_CONSENT_DENIED_REQUEST_AGAIN")
        }
    }

    private fun capabilities(): JSONObject = JSONObject().put("phoneEnabled", enabled).put("accessibility", PhoneAccessibility.active != null)
        .put("folderSelected", selectedFolder() != null).put("folderReadWriteGranted", folderGranted()).put("notificationAccess", PhoneNotifications.connected)
        .put("locationPermission", locationPermission()).put("cooperatingAppConfigured", cooperatingComponent().isNotEmpty())
        .put("captureStatus", capture?.optString("status") ?: if (requestId != null) "consent_pending" else "idle")
        .put("operations", JSONArray(listOf("capabilities", "accessibility_tree", "accessibility_click", "global_action", "swipe", "open_url", "location", "files_write_read", "notifications", "folder_request", "capture_request", "capture_result", "cooperating_app_action", "stop")))

    private fun locationPermission(): Boolean = listOf(Manifest.permission.ACCESS_FINE_LOCATION, Manifest.permission.ACCESS_COARSE_LOCATION)
        .any { context.checkSelfPermission(it) == PackageManager.PERMISSION_GRANTED }

    private fun location(): JSONObject {
        check(locationPermission()) { "LOCATION_PERMISSION_REQUIRED_OPEN_PHONE_ACCESS" }
        val manager = context.getSystemService(LocationManager::class.java)
        check(manager.isProviderEnabled(LocationManager.GPS_PROVIDER) || manager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) { "LOCATION_DISABLED_ENABLE_ANDROID_LOCATION" }
        val locations = manager.getProviders(true).mapNotNull { provider -> runCatching { manager.getLastKnownLocation(provider) }.getOrNull() }
        val location = locations.maxByOrNull { it.elapsedRealtimeNanos } ?: error("LOCATION_UNAVAILABLE_USE_LOCATION_APP_AND_RETRY")
        return JSONObject().put("latitude", location.latitude).put("longitude", location.longitude).put("accuracy", location.accuracy)
            .put("provider", location.provider).put("timeMs", location.time).put("ageMs", ((SystemClock.elapsedRealtimeNanos() - location.elapsedRealtimeNanos) / 1000000).coerceAtLeast(0))
            .put("lastKnown", true)
    }

    private fun writeRead(value: String): JSONObject {
        val bytes = value.toByteArray(Charsets.UTF_8)
        check(bytes.size <= 4096) { "VALUE_MAX_4096_BYTES" }
        val tree = selectedFolder() ?: error("FOLDER_REQUIRED_OPEN_PHONE_ACCESS")
        check(folderGranted()) { "FOLDER_PERMISSION_REVOKED_SELECT_FOLDER_AGAIN" }
        val root = DocumentsContract.buildDocumentUriUsingTree(tree, DocumentsContract.getTreeDocumentId(tree))
        val name = "olea-${UUID.randomUUID()}.txt"
        val uri = DocumentsContract.createDocument(context.contentResolver, root, "text/plain", name) ?: error("FOLDER_CREATE_FAILED")
        context.contentResolver.openOutputStream(uri, "w")?.use { it.write(bytes) } ?: error("FOLDER_WRITE_FAILED")
        val read = context.contentResolver.openInputStream(uri)?.use { input ->
            val output = java.io.ByteArrayOutputStream()
            val buffer = ByteArray(1024)
            while (true) { val count = input.read(buffer); if (count < 0) break; check(output.size() + count <= 4096) { "FOLDER_READ_TOO_LARGE" }; output.write(buffer, 0, count) }
            output.toByteArray()
        } ?: error("FOLDER_READ_FAILED")
        check(bytes.contentEquals(read)) { "FOLDER_READBACK_MISMATCH" }
        return JSONObject().put("matched", true).put("bytes", read.size).put("uri", uri.toString()).put("name", name)
    }

    private fun phone(request: JSONObject, admittedEpoch: Long, admittedEnabled: Boolean): JSONObject = synchronized(lock) {
        val operation = request.getString("operation")
        if (operation == "capabilities") return@synchronized capabilities()
        if (operation == "stop") { stop(); return@synchronized JSONObject().put("stopped", true) }
        check(enabled && !closed && admittedEnabled && admittedEpoch == authorityEpoch) { "PHONE_DISABLED_ENABLE_IN_PHONE_ACCESS" }
        val args = request.optJSONObject("args") ?: JSONObject()
        fun accessibility() = PhoneAccessibility.active ?: error("ACCESSIBILITY_REQUIRED_OPEN_PHONE_ACCESS")
        when (operation) {
            "inspect", "accessibility_tree" -> accessibility().inspect()
            "click", "accessibility_click" -> accessibility().click(args.getString("nodeId"))
            "swipe" -> accessibility().swipe(args)
            "home", "global_action" -> {
                val action = if (operation == "home") "home" else args.getString("action")
                val code = when (action) { "home" -> 2; "back" -> 1; else -> error("INVALID_GLOBAL_ACTION") }
                check(accessibility().performGlobalAction(code)) { "GLOBAL_ACTION_REJECTED" }
                JSONObject().put("dispatched", true).put("action", action)
            }
            "open_url" -> {
                val url = args.getString("url")
                check(url.length <= 4096) { "URL_TOO_LONG" }
                val uri = Uri.parse(url)
                check(uri.scheme == "https" && !uri.host.isNullOrBlank() && uri.userInfo == null) { "HTTPS_URL_REQUIRED" }
                context.startActivity(Intent(Intent.ACTION_VIEW, uri).addCategory(Intent.CATEGORY_BROWSABLE).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
                JSONObject().put("dispatched", true)
            }
            "location" -> location()
            "files_write_read" -> writeRead(args.getString("value"))
            "notifications" -> PhoneNotifications.read(args.optInt("limit", 20))
            "folder_request", "capture_request" -> {
                val id = if (operation == "capture_request") beginCapture() else null
                context.startActivity(Intent(context, PhoneAccessActivity::class.java).putExtra("request", if (id != null) "capture" else "folder")
                    .putExtra("requestId", id).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
                JSONObject().put("consentRequested", true).put("requestId", id).put("instruction", "Open Olea Phone access if Android blocks background activity launch; consent requires user interaction")
            }
            "capture_result" -> {
                val id = args.getString("requestId")
                check(id == requestId) { "CAPTURE_REQUEST_UNKNOWN_OR_STOPPED" }
                capture ?: JSONObject().put("requestId", id).put("status", if (capturePending(id)) "consent_pending" else "expired")
            }
            "cooperating_app_action" -> {
                val component = ComponentName.unflattenFromString(cooperatingComponent()) ?: error("COOPERATING_APP_REQUIRED_OPEN_PHONE_ACCESS")
                val action = cooperatingAction(); check(action.isNotBlank()) { "COOPERATING_APP_ACTION_REQUIRED" }
                val value = args.getString("value"); check(value.toByteArray(Charsets.UTF_8).size <= 256) { "VALUE_MAX_256_BYTES" }
                @Suppress("DEPRECATION") val info = context.packageManager.getActivityInfo(component, 0)
                check(info.exported && info.enabled && info.applicationInfo.enabled && component.packageName != context.packageName) { "COOPERATING_APP_EXPORTED_ACTIVITY_REQUIRED" }
                context.startActivity(Intent(action).setComponent(component).putExtra("value", value).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP))
                JSONObject().put("dispatched", true).put("component", component.flattenToString())
            }
            else -> error("UNKNOWN_OPERATION")
        }
    }

    private fun onMain(request: JSONObject): JSONObject {
        val admission = synchronized(lock) { authorityEpoch to enabled }
        val latch = CountDownLatch(1)
        val live = AtomicBoolean(true)
        var result: JSONObject? = null
        var failure: Exception? = null
        val task = Runnable {
            try { if (live.compareAndSet(true, false)) result = phone(request, admission.first, admission.second) }
            catch (error: Exception) { failure = error }
            finally { latch.countDown() }
        }
        main.post(task)
        if (!latch.await(10, TimeUnit.SECONDS)) {
            live.set(false); main.removeCallbacks(task)
            error("NATIVE_TIMEOUT_OUTCOME_UNCERTAIN_DO_NOT_REPLAY")
        }
        failure?.let { throw it }
        return result ?: error("REQUEST_CANCELLED")
    }

    private fun handle(socket: Socket) = socket.use { client ->
        client.soTimeout = 3000
        val deadline = SystemClock.elapsedRealtime() + 5000
        val timeout = object : TimerTask() { override fun run() { runCatching { client.close() } } }
        timeouts.schedule(timeout, 15000)
        var id: Any = JSONObject.NULL
        var status = 200
        val response = try {
            val input = client.getInputStream()
            fun line(): String {
                val bytes = java.io.ByteArrayOutputStream()
                while (bytes.size() <= 4096) {
                    check(SystemClock.elapsedRealtime() < deadline) { "HTTP_READ_DEADLINE" }
                    val next = input.read(); check(next >= 0) { "BAD_HTTP" }
                    if (next == 10) return bytes.toString("US-ASCII").trimEnd('\r')
                    bytes.write(next)
                }
                error("HTTP_LINE_TOO_LONG")
            }
            val first = line().split(' ')
            check(first.size == 3 && first[2] == "HTTP/1.1") { "BAD_HTTP" }
            val headers = mutableMapOf<String, String>()
            var total = 0
            while (true) {
                val header = line(); total += header.length + 2; check(total <= 16384) { "HEADERS_TOO_LONG" }
                if (header.isEmpty()) break
                val pair = header.split(':', limit = 2)
                check(pair.size == 2) { "BAD_HEADER" }
                val name = pair[0].lowercase(java.util.Locale.ROOT)
                check(!headers.containsKey(name)) { "DUPLICATE_HEADER" }
                headers[name] = pair[1].trim()
            }
            if (!MessageDigest.isEqual((headers["authorization"] ?: "").toByteArray(), "Bearer $token".toByteArray())) {
                status = 401; error("UNAUTHORIZED")
            }
            check(headers["transfer-encoding"] == null) { "TRANSFER_ENCODING_UNSUPPORTED" }
            val length = headers["content-length"]?.toInt() ?: 0
            check(length in 0..16384) { "BODY_MAX_16384_BYTES" }
            val body = ByteArray(length)
            var offset = 0
            while (offset < length) {
                check(SystemClock.elapsedRealtime() < deadline) { "HTTP_READ_DEADLINE" }
                val count = input.read(body, offset, length - offset); check(count > 0) { "INCOMPLETE_BODY" }; offset += count
            }
            val result = when {
                first[0] == "GET" && first[1] in listOf("/health", "/capabilities") -> synchronized(lock) { capabilities() }
                first[0] == "POST" && first[1] == "/phone" -> {
                    val request = JSONObject(body.toString(Charsets.UTF_8)); id = request.opt("id") ?: JSONObject.NULL
                    onMain(request)
                }
                else -> { status = 404; error("NOT_FOUND") }
            }
            JSONObject().put("id", id).put("ok", true).put("result", result)
        } catch (error: Exception) {
            if (status == 200) status = 400
            val code = when (error) {
                is SecurityException -> "ANDROID_PERMISSION_DENIED_OPEN_PHONE_ACCESS"
                is android.content.ActivityNotFoundException -> "ANDROID_ACTIVITY_NOT_FOUND"
                is java.net.SocketTimeoutException -> "HTTP_TIMEOUT"
                else -> error.message?.takeIf { it.matches(Regex("[A-Z0-9_]{1,100}")) } ?: "NATIVE_OPERATION_FAILED"
            }
            JSONObject().put("id", id).put("ok", false).put("error", JSONObject().put("code", code).put("message", code.lowercase().replace('_', ' ')))
        }
        val bytes = response.toString().toByteArray(Charsets.UTF_8)
        runCatching { client.getOutputStream().apply {
            write("HTTP/1.1 $status Result\r\nContent-Type: application/json\r\nContent-Length: ${bytes.size}\r\nConnection: close\r\n\r\n".toByteArray(Charsets.US_ASCII))
            write(bytes); flush()
        } }
        timeout.cancel(); timeouts.purge()
        Unit
    }
}
