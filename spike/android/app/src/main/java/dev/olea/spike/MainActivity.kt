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
        val panel = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; setPadding(24, 24, 24, 24) }
        panel.addView(TextView(this).apply { text = "Olea disposable feasibility host\nTarget SDK 28; no automatic action replay." })
        fun button(label: String, action: () -> Unit) { panel.addView(Button(this).apply { text = label; setOnClickListener { action() } }) }
        button("Start bridge / enable phone actions") { startForegroundService(Intent(this, RuntimeService::class.java).setAction("enable")) }
        button("Accessibility settings") { startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)) }
        button("Start shared backend") { startService(Intent(this, RuntimeService::class.java).setAction("backend")) }
        button("STOP and revoke phone actions") { startService(Intent(this, RuntimeService::class.java).setAction("stop")) }
        setContentView(panel)
        startForegroundService(Intent(this, RuntimeService::class.java))
    }
}

class FixtureActivity : Activity() {
    override fun onCreate(state: Bundle?) {
        super.onCreate(state)
        val value = intent.getStringExtra("value") ?: "Launcher click reached fixture"
        setContentView(TextView(this).apply { text = "Olea harmless fixture\n$value"; textSize = 24f })
    }
}
