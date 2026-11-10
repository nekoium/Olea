package dev.olea.fixture

import android.app.Activity
import android.os.Bundle
import android.widget.TextView
import java.io.File

class FixtureActivity : Activity() {
    override fun onCreate(state: Bundle?) {
        super.onCreate(state)
        val value = intent.getStringExtra("value")
        if (intent.action == "dev.olea.fixture.SET_VALUE" && value != null && value.length <= 256) {
            File(filesDir, "oracle-value.txt").writeText(value)
        }
        File(filesDir, "observed-launches.txt").appendText("${System.currentTimeMillis()} action=${intent.action}\n")
        setContentView(TextView(this).apply { text = "Olea harmless fixture\n${if (value == null) "Opened from launcher" else "Fixture value received"}"; textSize = 24f })
    }
}
