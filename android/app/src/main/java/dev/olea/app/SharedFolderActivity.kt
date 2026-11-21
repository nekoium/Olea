package dev.olea.app

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File

/** Returns an explicitly chosen host path; the caller owns durable workspace registration. */
class SharedFolderActivity : ComponentActivity() {
    companion object {
        const val EXTRA_PATH = "dev.olea.app.sharedFolderPath"
        const val EXTRA_NAME = "dev.olea.app.sharedFolderName"
    }

    private val folders by lazy { AndroidSharedFolders(this) }
    private var revision by mutableIntStateOf(0)

    override fun onResume() {
        super.onResume()
        revision++
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setResult(Activity.RESULT_CANCELED)
        setContent {
            val appearance = getSharedPreferences("olea-ui", MODE_PRIVATE).getString("appearance", "system")
            val dark = appearance == "dark" || (appearance == "system" && isSystemInDarkTheme())
            val palette = softPalette(getSharedPreferences("olea-ui", MODE_PRIVATE).getString("palette", "green"))
            CompositionLocalProvider(LocalFlat provides if (dark) palette.dark else palette.light) {
                SharedFolderScreen(folders, revision, onSettings = {
                    startActivity(folders.settingsIntent())
                }, onConnect = { folder ->
                    setResult(Activity.RESULT_OK, Intent().putExtra(EXTRA_PATH, folder.path)
                        .putExtra(EXTRA_NAME, folder.name.ifBlank { "Primary shared storage" }))
                    finish()
                }, onBack = { finish() })
            }
        }
    }
}

@Composable
private fun SharedFolderScreen(
    folders: AndroidSharedFolders,
    revision: Int,
    onSettings: () -> Unit,
    onConnect: (File) -> Unit,
    onBack: () -> Unit
) {
    var path by rememberSaveable { mutableStateOf<String?>(null) }
    var access by remember { mutableStateOf<AndroidSharedFolders.Access?>(null) }
    var children by remember { mutableStateOf(emptyList<File>()) }
    var loading by remember { mutableStateOf(true) }
    var message by remember { mutableStateOf("") }
    var retry by remember { mutableIntStateOf(0) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(path, revision, retry) {
        loading = true
        children = emptyList()
        message = ""
        try {
            val result = withContext(Dispatchers.IO) {
                val status = folders.access(path)
                status to if (status.available) folders.childFolders(checkNotNull(status.folder).path) else emptyList()
            }
            access = result.first
            children = result.second
        } catch (cancelled: CancellationException) {
            throw cancelled
        } catch (error: Exception) {
            message = error.message ?: "Cannot list folders. Check access and retry."
        } finally {
            loading = false
        }
    }

    fun choose(create: Boolean) {
        scope.launch {
            loading = true
            try {
                val selected = withContext(Dispatchers.IO) {
                    if (create) folders.createVisibleOleaFolder()
                    else folders.requireAvailable(checkNotNull(access?.folder).path)
                }
                if (create) {
                    path = selected.path
                    retry++
                } else onConnect(selected)
            } catch (cancelled: CancellationException) {
                throw cancelled
            } catch (error: Exception) {
                message = error.message ?: "Folder access changed. Check Android access and retry."
                access = folders.access(path)
            } finally {
                loading = false
            }
        }
    }

    Column(Modifier.fillMaxSize().background(LocalFlat.current.surface).safeDrawingPadding()
        .verticalScroll(rememberScrollState()).padding(horizontal = 25.dp, vertical = 14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Row(Modifier.fillMaxWidth().heightIn(min = 54.dp), verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
            Glyph("‹", "Cancel", onBack)
            Label("Connect a folder", Modifier.weight(1f), size = 16, bold = true)
        }
        Heading("Bring your files")
        Label("Choose an existing folder in primary shared storage. Agent changes apply directly to its files.", muted = true)
        Label("All-files access is broader than this folder. Android still protects other apps’ private data. Linux tools and credentials stay in Olea’s private storage.", size = 13, muted = true)
        val current = access
        if (current != null && !current.available) Notice(current.message, error = true)
        if (message.isNotEmpty()) Notice(message, error = current?.available != true)
        val permissionStates = setOf(AndroidSharedFolders.State.PERMISSION_REQUIRED,
            AndroidSharedFolders.State.PERMISSION_DENIED, AndroidSharedFolders.State.PERMISSION_REVOKED)
        if (current?.state in permissionStates) Action("Open Android storage settings", enabled = !loading, primary = true) {
            try { onSettings() } catch (error: Exception) {
                message = "Android storage settings could not open. Find Olea under Special app access › All files access. ${error.message.orEmpty()}"
            }
        }
        if (path != null) Action("Primary storage", enabled = !loading) { path = null }
        if (current?.available == true) {
            val folder = checkNotNull(current.folder)
            Label(folder.path, size = 13, mono = true)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Action("Up", enabled = !loading && path != null) {
                    val root = folders.primaryRoot()
                    path = folder.parentFile?.takeIf { it.path.startsWith(root.path + File.separator) }?.path
                }
                Action("Connect this folder", enabled = !loading, primary = true) { choose(false) }
            }
            if (path == null) {
                Action("Create Olea folder", enabled = !loading) { choose(true) }
                Label("Creates an Olea folder here only when you tap. If it already exists, its content is preserved.", size = 12, muted = true)
            }
            Divider()
            if (!loading && children.isEmpty()) Label("No subfolders. You can connect this folder.", muted = true)
            children.forEach { child ->
                Choice(child.name, onClick = { if (!loading) path = child.path })
            }
        }
        if (loading) Label("Checking folder access…", muted = true)
        Action("Refresh access", enabled = !loading) { retry++ }
    }
}
