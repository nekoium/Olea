package dev.olea.spike

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView

class MainActivity : Activity() {
    override fun onCreate(state: Bundle?) {
        super.onCreate(state)
        if (intent.getBooleanExtra("capture", false)) startActivityForResult(getSystemService(android.media.projection.MediaProjectionManager::class.java).createScreenCaptureIntent(), 10)
        if (intent.getBooleanExtra("folder", false)) startActivityForResult(Intent(Intent.ACTION_OPEN_DOCUMENT_TREE).addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION or Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION), 11)
        val panel = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(24, 24, 24, 24) }
        panel.addView(TextView(this).apply { text = "Olea disposable feasibility host\nTarget SDK ${applicationInfo.targetSdkVersion}; no automatic action replay." })
        fun button(label: String, action: () -> Unit) { panel.addView(Button(this).apply { text = label; setOnClickListener { action() } }) }
        button("Start bridge / enable phone actions") { startForegroundService(Intent(this, RuntimeService::class.java).setAction("enable")) }
        button("Accessibility settings") { startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)) }
        button("Start shared backend") { startService(Intent(this, RuntimeService::class.java).setAction("backend")) }
        button("Grant location access") { requestPermissions(arrayOf(android.Manifest.permission.ACCESS_FINE_LOCATION, android.Manifest.permission.ACCESS_COARSE_LOCATION), 12) }
        button("Choose test folder") { startActivityForResult(Intent(Intent.ACTION_OPEN_DOCUMENT_TREE), 11) }
        button("Capture test screen") { startActivityForResult(getSystemService(android.media.projection.MediaProjectionManager::class.java).createScreenCaptureIntent(), 10) }
        button("STOP and revoke phone actions") { startService(Intent(this, RuntimeService::class.java).setAction("stop")) }
        setContentView(panel)
        startForegroundService(Intent(this, RuntimeService::class.java))
        if (BuildConfig.FLAVOR == "modern") intent.getStringExtra("m2Probe")?.let { attempt ->
            startService(Intent(this, RuntimeService::class.java).setAction("probe").putExtra("attempt", attempt))
        }
    }
    @Deprecated("Disposable Activity result harness")
    override fun onActivityResult(request: Int, result: Int, data: Intent?) {
        super.onActivityResult(request, result, data)
        if (result != RESULT_OK || data == null) return
        if (request == 10) PhoneApis.startCapture(this, result, data)
        if (request == 11) data.data?.let { uri ->
            contentResolver.takePersistableUriPermission(uri, Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION)
            PhoneApis.folder = uri
        }
    }
}

class FixtureActivity : Activity() {
    override fun onCreate(state: Bundle?) {
        super.onCreate(state)
        val value = intent.getStringExtra("value") ?: "Launcher click reached fixture"
        setContentView(TextView(this).apply { text = "Olea harmless fixture\n$value"; textSize = 24f })
    }
}
