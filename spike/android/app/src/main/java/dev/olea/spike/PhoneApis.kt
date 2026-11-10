package dev.olea.spike

import android.Manifest
import android.app.Activity
import android.app.Notification
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.PixelFormat
import android.hardware.display.DisplayManager
import android.location.LocationManager
import android.media.ImageReader
import android.media.projection.MediaProjection
import android.media.projection.MediaProjectionManager
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.provider.DocumentsContract
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.security.MessageDigest

object PhoneApis {
    var folder: Uri? = null
    var projection: MediaProjection? = null
    var capture: JSONObject? = null
    fun stop() { projection?.stop(); projection = null }
    fun location(context: Context): JSONObject {
        check(context.checkSelfPermission(Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) { "LOCATION_PERMISSION_DENIED" }
        val manager = context.getSystemService(LocationManager::class.java)
        manager.requestLocationUpdates(LocationManager.GPS_PROVIDER, 1000, 0f, object : android.location.LocationListener {
            override fun onLocationChanged(location: android.location.Location) { manager.removeUpdates(this) }
        }, Looper.getMainLooper())
        val location = manager.getLastKnownLocation(LocationManager.GPS_PROVIDER) ?: error("LOCATION_PENDING")
        return JSONObject().put("latitude", location.latitude).put("longitude", location.longitude).put("provider", location.provider).put("accuracy", location.accuracy)
    }
    fun file(context: Context, value: String): JSONObject {
        check(value.length <= 256) { "VALUE_TOO_LONG" }
        val tree = folder ?: error("FOLDER_PERMISSION_REQUIRED")
        check(context.contentResolver.persistedUriPermissions.any { it.uri == tree && it.isReadPermission && it.isWritePermission }) { "FOLDER_PERMISSION_REVOKED" }
        val root = DocumentsContract.buildDocumentUriUsingTree(tree, DocumentsContract.getTreeDocumentId(tree))
        val uri = DocumentsContract.createDocument(context.contentResolver, root, "text/plain", "olea-fixture-${System.currentTimeMillis()}.txt") ?: error("CREATE_FAILED")
        context.contentResolver.openOutputStream(uri, "w")!!.use { it.write(value.toByteArray()) }
        val received = context.contentResolver.openInputStream(uri)!!.bufferedReader().use { it.readText() }
        check(received == value) { "READBACK_MISMATCH" }
        return JSONObject().put("matched", true).put("bytes", received.toByteArray().size).put("uri", uri)
    }
    fun startCapture(activity: Activity, result: Int, data: Intent) {
        stop(); capture = null
        val metrics = activity.resources.displayMetrics
        val width = metrics.widthPixels; val height = metrics.heightPixels
        val reader = ImageReader.newInstance(width, height, PixelFormat.RGBA_8888, 2)
        val manager = activity.getSystemService(MediaProjectionManager::class.java)
        val current = manager.getMediaProjection(result, data) ?: error("PROJECTION_DENIED")
        projection = current
        current.registerCallback(object : MediaProjection.Callback() { override fun onStop() { reader.close() } }, Handler(Looper.getMainLooper()))
        val display = current.createVirtualDisplay("olea-capture", width, height, metrics.densityDpi, DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR, reader.surface, null, null)
        reader.setOnImageAvailableListener({ source ->
            val image = source.acquireLatestImage() ?: return@setOnImageAvailableListener
            try {
                val plane = image.planes[0]
                val paddedWidth = plane.rowStride / plane.pixelStride
                val bitmap = Bitmap.createBitmap(paddedWidth, height, Bitmap.Config.ARGB_8888)
                bitmap.copyPixelsFromBuffer(plane.buffer)
                val cropped = Bitmap.createBitmap(bitmap, 0, 0, width, height)
                val file = File(activity.filesDir, "capture.png")
                file.outputStream().use { cropped.compress(Bitmap.CompressFormat.PNG, 100, it) }
                capture = JSONObject().put("width", width).put("height", height).put("bytes", file.length())
                    .put("sha256", MessageDigest.getInstance("SHA-256").digest(file.readBytes()).joinToString("") { "%02x".format(it) })
                    .put("samplePixel", cropped.getPixel(width / 2, height / 2))
                cropped.recycle(); bitmap.recycle()
            } finally { image.close(); display?.release(); stop() }
        }, Handler(Looper.getMainLooper()))
        Handler(Looper.getMainLooper()).postDelayed({ if (projection === current) stop() }, 10000)
    }
}

class FixtureNotifications : NotificationListenerService() {
    companion object { @Volatile var connected = false; val received = ArrayDeque<JSONObject>() }
    override fun onListenerConnected() { connected = true }
    override fun onListenerDisconnected() { connected = false }
    override fun onNotificationPosted(notification: StatusBarNotification) {
        if (notification.packageName != "dev.olea.fixture") return
        synchronized(received) {
            if (received.size >= 20) received.removeFirst()
            received.addLast(JSONObject().put("package", notification.packageName).put("id", notification.id)
                .put("text", notification.notification.extras.getCharSequence(Notification.EXTRA_TEXT)?.toString()?.take(256)))
        }
    }
}
