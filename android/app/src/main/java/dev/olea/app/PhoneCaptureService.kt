package dev.olea.app

import android.app.Activity
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.content.pm.ServiceInfo
import android.graphics.Bitmap
import android.graphics.PixelFormat
import android.hardware.display.DisplayManager
import android.hardware.display.VirtualDisplay
import android.media.ImageReader
import android.media.projection.MediaProjection
import android.media.projection.MediaProjectionManager
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import org.json.JSONObject
import java.io.File
import java.security.MessageDigest
import java.util.concurrent.atomic.AtomicBoolean

/** Separate foreground lifetime: the runtime never needs mediaProjection authority when idle. */
class PhoneCaptureService : Service() {
    private val handler = Handler(Looper.getMainLooper())
    private var cancel: (() -> Unit)? = null
    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val bridge = PhoneBridge.current
        val id = intent?.getStringExtra("requestId")
        @Suppress("DEPRECATION") val data = intent?.getParcelableExtra<Intent>("consent")
        if (bridge == null || id == null || data == null || !bridge.capturePending(id)) { stopSelf(startId); return START_NOT_STICKY }
        var projection: MediaProjection? = null
        var reader: ImageReader? = null
        var display: VirtualDisplay? = null
        val ended = AtomicBoolean(false)
        val timeout = Runnable { cancel?.invoke() }
        fun end(error: String?) {
            if (!ended.compareAndSet(false, true)) return
            handler.removeCallbacks(timeout)
            reader?.let { runCatching { it.setOnImageAvailableListener(null, null) } }
            display?.let { runCatching { it.release() } }; display = null
            reader?.let { runCatching { it.close() } }; reader = null
            projection?.let { runCatching { it.stop() } }; projection = null
            bridge.finishCapture(id, null, error ?: "CAPTURE_ENDED")
            handler.post { stopForeground(STOP_FOREGROUND_REMOVE); stopSelf(startId) }
        }
        cancel = { end("CAPTURE_CANCELLED_OR_TIMEOUT_REQUEST_AGAIN") }
        try {
            bridge.attachCapture(id, { end("CAPTURE_STOPPED_REQUEST_AGAIN") }) {
                val manager = getSystemService(NotificationManager::class.java)
                manager.createNotificationChannel(NotificationChannel("phone-capture", "Screen capture", NotificationManager.IMPORTANCE_LOW))
                val notification = Notification.Builder(this, "phone-capture").setSmallIcon(android.R.drawable.ic_menu_camera)
                    .setContentTitle("Olea screen capture").setContentText("Saving one consented screen image").build()
                if (Build.VERSION.SDK_INT >= 29) startForeground(22, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PROJECTION)
                else startForeground(22, notification)
                val current = getSystemService(MediaProjectionManager::class.java).getMediaProjection(Activity.RESULT_OK, data)
                    ?: error("CAPTURE_CONSENT_DENIED")
                projection = current
                current.registerCallback(object : MediaProjection.Callback() {
                    override fun onStop() { end("CAPTURE_PROJECTION_REVOKED_REQUEST_AGAIN") }
                }, handler)
                val metrics = resources.displayMetrics
                val width = metrics.widthPixels; val height = metrics.heightPixels
                check(width > 0 && height > 0 && width.toLong() * height <= 16000000) { "CAPTURE_DIMENSIONS_TOO_LARGE" }
                val source = ImageReader.newInstance(width, height, PixelFormat.RGBA_8888, 2)
                reader = source
                source.setOnImageAvailableListener({ images ->
                    if (ended.get()) return@setOnImageAvailableListener
                    val image = runCatching { images.acquireLatestImage() }.getOrNull() ?: return@setOnImageAvailableListener
                    try {
                        val plane = image.planes[0]
                        check(plane.pixelStride == 4) { "CAPTURE_PIXEL_FORMAT_UNSUPPORTED" }
                        val padded = Bitmap.createBitmap(plane.rowStride / plane.pixelStride, height, Bitmap.Config.ARGB_8888)
                        try {
                            // Some ImageReader buffers omit padding after the last row.
                            val pixels = java.nio.ByteBuffer.allocate(padded.byteCount)
                            pixels.put(plane.buffer); pixels.rewind()
                            padded.copyPixelsFromBuffer(pixels)
                            val cropped = Bitmap.createBitmap(padded, 0, 0, width, height)
                            try {
                                val committed = bridge.commitCapture(id) {
                                    val file = File(bridge.directory, "capture-$id.png")
                                    val temp = File(bridge.directory, "capture-$id.tmp")
                                    temp.outputStream().use { check(cropped.compress(Bitmap.CompressFormat.PNG, 100, it)) { "CAPTURE_PNG_FAILED" } }
                                    check(temp.renameTo(file)) { "CAPTURE_SAVE_FAILED" }
                                    val digest = MessageDigest.getInstance("SHA-256")
                                    file.inputStream().use { input ->
                                        val buffer = ByteArray(8192)
                                        while (true) { val count = input.read(buffer); if (count < 0) break; digest.update(buffer, 0, count) }
                                    }
                                    JSONObject().put("requestId", id).put("status", "ready").put("capturedAtMs", System.currentTimeMillis())
                                        .put("width", width).put("height", height).put("bytes", file.length()).put("mimeType", "image/png")
                                        .put("fileName", file.name).put("path", "/olea-phone/${file.name}")
                                        .put("sha256", digest.digest().joinToString("") { "%02x".format(it) })
                                }
                                if (committed) end(null) else end("CAPTURE_STOPPED_REQUEST_AGAIN")
                            } finally { if (cropped !== padded) cropped.recycle() }
                        } finally { padded.recycle() }
                    } catch (_: Exception) { end("CAPTURE_SAVE_FAILED_REQUEST_AGAIN") }
                    finally { image.close() }
                }, handler)
                display = current.createVirtualDisplay("olea-one-shot-capture", width, height, metrics.densityDpi,
                    DisplayManager.VIRTUAL_DISPLAY_FLAG_AUTO_MIRROR, source.surface, null, handler)
                handler.postDelayed(timeout, 10000)
            }
        } catch (_: Exception) { end("CAPTURE_START_FAILED_REQUEST_AGAIN") }
        return START_NOT_STICKY
    }

    override fun onDestroy() { cancel?.invoke(); cancel = null; super.onDestroy() }
}
