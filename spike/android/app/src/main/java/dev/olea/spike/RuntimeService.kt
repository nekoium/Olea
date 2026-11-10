package dev.olea.spike

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.net.Uri
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.net.InetAddress
import java.net.ServerSocket
import java.net.Socket
import java.security.MessageDigest
import java.security.SecureRandom
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

class RuntimeService : Service() {
    private var server: ServerSocket? = null
    private var backend: Process? = null
    private val main = Handler(Looper.getMainLooper())
    private lateinit var token: String
    @Volatile private var enabled = false
    private val events = ArrayDeque<String>()
    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        val provisionedEnable = File(filesDir, "enable-phone-once")
        enabled = provisionedEnable.exists()
        provisionedEnable.delete()
        val tokenFile = File(filesDir, "bridge-token")
        token = if (tokenFile.exists()) tokenFile.readText().trim() else ByteArray(32).also { SecureRandom().nextBytes(it) }.joinToString("") { "%02x".format(it) }.also { tokenFile.writeText(it) }
        tokenFile.setReadable(false, false); tokenFile.setReadable(true, true)
        File(filesDir, "bridge-config.json").writeText(JSONObject().put("url", "http://127.0.0.1:8766").put("token", token).toString())
        getSystemService(NotificationManager::class.java).createNotificationChannel(NotificationChannel("runtime", "Feasibility runtime", NotificationManager.IMPORTANCE_LOW))
        val stop = PendingIntent.getService(this, 1, Intent(this, RuntimeService::class.java).setAction("stop"), PendingIntent.FLAG_IMMUTABLE)
        startForeground(1, Notification.Builder(this, "runtime").setContentTitle("Olea feasibility bridge")
            .setContentText("Phone actions disabled until enabled in host").setSmallIcon(android.R.drawable.ic_media_play)
            .addAction(Notification.Action.Builder(null, "STOP", stop).build()).build())
        server = ServerSocket(8766, 8, InetAddress.getByName("127.0.0.1"))
        Thread({ while (server?.isClosed == false) { try { server?.accept()?.let { handle(it) } } catch (_: Exception) {} } }, "native-bridge").start()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            "enable" -> enabled = true
            "stop" -> { enabled = false; PhoneApis.stop(); stopBackend() }
            "backend" -> startBackend()
        }
        // Process death requires explicit restart; uncertain phone actions are never replayed.
        return START_NOT_STICKY
    }

    private fun startBackend() {
        if (backend?.isAlive == true) return
        val script = File(filesDir, "start-runtime.sh")
        if (!script.exists()) return
        backend = ProcessBuilder("/system/bin/sh", script.absolutePath).directory(filesDir).apply {
            environment()["OLEA_BRIDGE_CONFIG"] = File(filesDir, "bridge-config.json").absolutePath
            environment()["OLEA_BRIDGE_TOKEN_FILE"] = File(filesDir, "bridge-token").absolutePath
        }.start()
        val current = backend ?: return
        Thread({ current.inputStream.bufferedReader().useLines { lines -> lines.forEach { line -> synchronized(events) { if (events.size == 200) events.removeFirst(); events.addLast(line.take(16384)) } } } }, "backend-stdout").start()
        Thread({ current.errorStream.bufferedReader().useLines { lines -> lines.forEach { /* Drain diagnostics without retaining credentials. */ } } }, "backend-stderr").start()
    }

    private fun stopBackend() {
        backend?.let { process ->
            try { process.outputStream.bufferedWriter().apply { write("{\"id\":\"native-stop\",\"command\":\"stop\"}\n"); flush() } } catch (_: Exception) {}
            process.destroy()
            Thread { if (!process.waitFor(3, TimeUnit.SECONDS)) process.destroyForcibly() }.start()
        }
        backend = null
    }

    private fun capabilities() = JSONObject().put("phoneEnabled", enabled)
        .put("accessibility", PhoneAccessibility.active != null).put("targetSdk", applicationInfo.targetSdkVersion)
        .put("backendRunning", backend?.isAlive == true)
        .put("operations", JSONArray(listOf("capabilities", "accessibility_tree", "accessibility_click", "global_action", "swipe", "open_url", "fixture_action", "location", "files_write_read", "notifications", "capture_request", "capture_result", "folder_request", "fixture_notify", "stop")))

    private fun phone(request: JSONObject): JSONObject {
        val operation = request.getString("operation")
        if (operation == "capabilities") return capabilities()
        if (operation == "stop") { enabled = false; PhoneApis.stop(); stopBackend(); return JSONObject().put("stopped", true) }
        check(enabled) { "PHONE_STOPPED" }
        val args = request.optJSONObject("args") ?: JSONObject()
        fun accessibility() = PhoneAccessibility.active ?: error("ACCESSIBILITY_REVOKED")
        return when (operation) {
            "inspect", "accessibility_tree" -> accessibility().inspect()
            "swipe" -> accessibility().swipe(args)
            "click", "accessibility_click" -> accessibility().click(args.getString("nodeId"))
            "home", "global_action" -> {
                val action = if (operation == "home") "home" else args.getString("action")
                val code = when (action) { "home" -> 2; "back" -> 1; else -> error("INVALID_ACTION") }
                check(accessibility().performGlobalAction(code)) { "ACTION_REJECTED" }
                JSONObject().put("performed", action)
            }
            "open_url" -> {
                val uri = Uri.parse(args.getString("url"))
                check(uri.scheme in listOf("http", "https") && !uri.host.isNullOrBlank()) { "INVALID_URL" }
                startActivity(Intent(Intent.ACTION_VIEW, uri).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
                JSONObject().put("dispatched", true)
            }
            "location" -> PhoneApis.location(this)
            "files_write_read" -> PhoneApis.file(this, args.getString("value"))
            "notifications" -> { check(FixtureNotifications.connected) { "NOTIFICATION_ACCESS_REVOKED" }; synchronized(FixtureNotifications.received) { JSONObject().put("notifications", JSONArray(FixtureNotifications.received.toList())) } }
            "capture_request", "folder_request" -> {
                startActivity(Intent(this, MainActivity::class.java).putExtra(if (operation == "capture_request") "capture" else "folder", true).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
                JSONObject().put("consentRequested", true)
            }
            "capture_result" -> PhoneApis.capture ?: error("CAPTURE_NOT_READY")
            "fixture_notify" -> {
                startActivity(Intent("dev.olea.fixture.SET_VALUE").setComponent(android.content.ComponentName("dev.olea.fixture", "dev.olea.fixture.FixtureActivity")).putExtra("postNotification", true).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
                JSONObject().put("dispatched", true)
            }
            "fixture_action" -> {
                val value = args.getString("value"); check(value.length <= 256) { "VALUE_TOO_LONG" }
                startActivity(Intent("dev.olea.fixture.SET_VALUE").setComponent(android.content.ComponentName("dev.olea.fixture", "dev.olea.fixture.FixtureActivity")).putExtra("value", value).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
                JSONObject().put("dispatched", true)
            }
            else -> error("UNKNOWN_OPERATION")
        }
    }

    private fun onMain(action: () -> JSONObject): JSONObject {
        val latch = CountDownLatch(1)
        var result: JSONObject? = null
        var failure: Exception? = null
        main.post { try { result = action() } catch (error: Exception) { failure = error } finally { latch.countDown() } }
        check(latch.await(5, TimeUnit.SECONDS)) { "MAIN_TIMEOUT" }
        failure?.let { throw it }
        return result ?: error("EMPTY_RESULT")
    }

    private fun handle(socket: Socket) = socket.use {
        it.soTimeout = 5000
        var id: Any = JSONObject.NULL
        var status = 200
        val response = try {
            val input = it.getInputStream()
            fun line(): String {
                val bytes = ArrayList<Byte>()
                while (bytes.size <= 8192) { val next = input.read(); check(next >= 0) { "BAD_HTTP" }; if (next == 10) return bytes.toByteArray().toString(Charsets.US_ASCII).trimEnd('\r'); bytes.add(next.toByte()) }
                error("HEADER_TOO_LONG")
            }
            val first = line().split(' '); check(first.size == 3) { "BAD_HTTP" }
            val headers = mutableMapOf<String, String>()
            var total = 0
            while (true) { val header = line(); total += header.length; check(total <= 16384) { "HEADERS_TOO_LONG" }; if (header.isEmpty()) break; val pair = header.split(':', limit = 2); check(pair.size == 2); headers[pair[0].lowercase()] = pair[1].trim() }
            val supplied = headers["authorization"] ?: ""
            if (!MessageDigest.isEqual(supplied.toByteArray(), "Bearer $token".toByteArray())) { status = 401; error("UNAUTHORIZED") }
            check(headers["transfer-encoding"] == null) { "UNSUPPORTED_ENCODING" }
            val length = headers["content-length"]?.toInt() ?: 0
            check(length in 0..65536) { "BODY_TOO_LARGE" }
            val body = ByteArray(length)
            var offset = 0
            while (offset < length) { val count = input.read(body, offset, length - offset); check(count > 0); offset += count }
            val result = when {
                first[0] == "GET" && first[1] in listOf("/health", "/capabilities") -> capabilities()
                first[0] == "POST" && first[1] == "/phone" -> {
                    val request = JSONObject(body.toString(Charsets.UTF_8)); id = request.opt("id") ?: JSONObject.NULL
                    onMain {
                        val operation = request.getString("operation")
                        val before = PhoneAccessibility.active?.rootInActiveWindow?.packageName?.toString()
                        val result = phone(request)
                        val audit = JSONObject().put("atMs", System.currentTimeMillis()).put("operation", operation)
                            .put("beforePackage", before).put("afterPackage", PhoneAccessibility.active?.rootInActiveWindow?.packageName?.toString())
                        if (operation in listOf("click", "accessibility_click")) audit.put("nodeId", request.optJSONObject("args")?.optString("nodeId")).put("action", "ACTION_CLICK")
                        File(filesDir, "phone-audit.jsonl").appendText(audit.toString() + "\n")
                        result
                    }
                }
                first[0] == "POST" && first[1] == "/backend" -> {
                    check(backend?.isAlive == true) { "BACKEND_NOT_RUNNING" }
                    check(!body.contains(10.toByte())) { "ONE_COMMAND_ONLY" }
                    backend!!.outputStream.write(body + byteArrayOf(10)); backend!!.outputStream.flush()
                    JSONObject().put("queued", true)
                }
                first[0] == "GET" && first[1] == "/events" -> synchronized(events) { JSONObject().put("events", JSONArray(events.toList())).also { events.clear() } }
                else -> { status = 404; error("NOT_FOUND") }
            }
            JSONObject().put("id", id).put("ok", true).put("result", result)
        } catch (error: Exception) {
            if (status == 200) status = 400
            JSONObject().put("id", id).put("ok", false).put("error", JSONObject().put("code", error.message?.take(160) ?: "BRIDGE_ERROR").put("message", "Native operation rejected"))
        }
        val bytes = response.toString().toByteArray(Charsets.UTF_8)
        try { it.getOutputStream().apply { write("HTTP/1.1 $status Result\r\nContent-Type: application/json\r\nContent-Length: ${bytes.size}\r\nConnection: close\r\n\r\n".toByteArray()); write(bytes); flush() } } catch (_: Exception) {}
    }

    override fun onDestroy() { enabled = false; PhoneApis.stop(); server?.close(); stopBackend(); super.onDestroy() }
}
