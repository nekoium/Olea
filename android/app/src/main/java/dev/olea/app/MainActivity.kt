package dev.olea.app

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.*
import kotlinx.coroutines.*
import org.json.JSONArray

internal data class UiSnapshot(
    val available: Boolean = false,
    val workspaces: List<WorkspaceInfo> = emptyList(),
    val conversations: List<ConversationInfo> = emptyList(),
    val active: ConversationInfo? = null,
    val entries: List<String> = emptyList(),
    val status: String = "Opening saved conversations…",
    val ready: Boolean = false,
    val busy: Boolean = false,
    val environmentReady: Boolean = false,
    val summary: String = "Backend: stopped",
    val states: List<RuntimeConversationState> = emptyList(),
    val terminals: List<RuntimeTerminalState> = emptyList(),
    val diagnostics: String = "",
    val access: String = ""
)

class MainActivity : ComponentActivity() {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
    @OptIn(ExperimentalCoroutinesApi::class)
    private val operations = Dispatchers.IO.limitedParallelism(1)
    private var polling: Job? = null
    private var snapshot by mutableStateOf(UiSnapshot())
    private var failure by mutableStateOf("")
    private var localRevision by mutableLongStateOf(0)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        attempt { startService(Intent(this, RuntimeService::class.java)) }
        setContent {
            OleaApp(snapshot, failure, localRevision,
                dismissError = { failure = "" },
                perform = { action -> attempt(action) },
                phoneAccess = { startActivity(Intent(this, PhoneAccessActivity::class.java)) })
        }
    }
    private fun attempt(action: () -> Unit) {
        scope.launch {
            try { withContext(operations) { action() }; localRevision++ }
            catch (_: CancellationException) { }
            catch (error: Exception) {
                failure = if (error is org.json.JSONException) "Saved settings could not be read. Existing data was preserved. Check the agent configuration." else error.message?.take(500) ?: "Operation failed. Saved conversations and files were preserved."
            }
        }
    }
    override fun onStart() {
        super.onStart()
        polling = scope.launch {
            var previous = Long.MIN_VALUE
            while (isActive) {
                val revision = RuntimeService.revision + localRevision
                if (revision != previous || !snapshot.available) {
                    try {
                        val next = withContext(Dispatchers.IO) { collectSnapshot() }
                        snapshot = next; previous = revision
                    } catch (_: CancellationException) { throw CancellationException() }
                    catch (_: Exception) { failure = "Saved conversations could not be read. Existing data was preserved. Check storage and restart Olea." }
                }
                delay(300)
            }
        }
    }
    private fun collectSnapshot(): UiSnapshot {
        val runtime = RuntimeService.current ?: return UiSnapshot(status = RuntimeService.status)
        val active = runtime.activeConversation()
        val states = runtime.conversationStates()
        val lines = states.firstOrNull { it.id == active.id }?.messages.orEmpty().map { if (it.role in listOf("tool", "system")) it.text else "${it.role}: ${it.text}" }
        val workspaces = runtime.store.workspaces()
        return UiSnapshot(true, workspaces, runtime.store.conversations(), active,
            lines, RuntimeService.status, RuntimeService.conversationReady, RuntimeService.busy,
            Environment(this).ready, runtime.runtimeSummary(), states, workspaces.flatMap { runtime.terminals(it.id) }, runtime.diagnostics(),
            "${PhoneBridge.current?.isEnabled()} ${PhoneAccessibility.active != null} ${PhoneNotifications.connected} ${PhoneBridge.current?.folderGranted()}")
    }
    override fun onStop() { polling?.cancel(); polling = null; super.onStop() }
    override fun onDestroy() { scope.cancel(); super.onDestroy() }
}
