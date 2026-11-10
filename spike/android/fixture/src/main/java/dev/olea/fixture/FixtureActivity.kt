package dev.olea.fixture

import android.app.Activity
import android.os.Bundle
import android.widget.TextView
import java.io.File

class FixtureActivity : Activity() {
    override fun onCreate(state: Bundle?) {
        super.onCreate(state)
        if (intent.getBooleanExtra("testWritableExecutable", false)) {
            val result = try {
                val process = ProcessBuilder(File(filesDir, "proot").absolutePath, "--version").apply {
                    environment()["LD_LIBRARY_PATH"] = File(filesDir, "lib").absolutePath
                }.redirectErrorStream(true).start()
                if (!process.waitFor(5, java.util.concurrent.TimeUnit.SECONDS)) { process.destroyForcibly(); "TIMEOUT" }
                else "exit=${process.exitValue()}\n${process.inputStream.bufferedReader().readText().take(4096)}"
            } catch (error: Exception) { "${error.javaClass.simpleName}: ${error.message}" }
            File(filesDir, "execution-result.txt").writeText("uid=${android.os.Process.myUid()} target=${applicationInfo.targetSdkVersion}\n$result")
        }
        val value = intent.getStringExtra("value")
        if (intent.action == "dev.olea.fixture.SET_VALUE" && value != null && value.length <= 256) {
            File(filesDir, "oracle-value.txt").writeText(value)
        }
        File(filesDir, "observed-launches.txt").appendText("${System.currentTimeMillis()} action=${intent.action}\n")
        setContentView(TextView(this).apply { text = "Olea harmless fixture\n${if (value == null) "Opened from launcher" else "Fixture value received"}"; textSize = 24f })
    }
}
