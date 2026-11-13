package dev.olea.app

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.Settings
import java.io.File

/** Direct filesystem access only. A document-tree grant does not satisfy this contract. */
class AndroidSharedFolders(context: Context) {
    private val context = context.applicationContext
    private val observed = context.getSharedPreferences("shared-folder-access", Context.MODE_PRIVATE)

    enum class State {
        AVAILABLE, UNSUPPORTED, PERMISSION_REQUIRED, PERMISSION_DENIED, PERMISSION_REVOKED,
        STORAGE_UNAVAILABLE, STORAGE_READ_ONLY, FOLDER_MISSING, NOT_A_FOLDER, ACCESS_DENIED, INVALID_PATH
    }

    data class Access(val state: State, val message: String, val folder: File? = null) {
        val available: Boolean get() = state == State.AVAILABLE
    }

    @Suppress("DEPRECATION")
    fun primaryRoot(): File = Environment.getExternalStorageDirectory().canonicalFile

    /** Call on foreground return and before every external task/terminal start; never caches a grant. */
    fun access(path: String? = null): Access {
        if (Build.VERSION.SDK_INT < 30) return Access(State.UNSUPPORTED,
            "Connected folders require Android 11 or later. Use an Olea-managed workspace on this device.")
        if (!Environment.isExternalStorageManager()) {
            val state = when {
                observed.getBoolean("ever-granted", false) -> State.PERMISSION_REVOKED
                observed.getBoolean("requested", false) -> State.PERMISSION_DENIED
                else -> State.PERMISSION_REQUIRED
            }
            return Access(state, when (state) {
                State.PERMISSION_REVOKED -> "Shared-storage access was revoked. Open Android settings and allow all-files access for Olea again."
                State.PERMISSION_DENIED -> "Shared-storage access was not granted. Open Android settings and allow all-files access, or use an Olea-managed workspace."
                else -> "Allow all-files access in Android settings to connect a folder from primary shared storage."
            })
        }
        if (!observed.getBoolean("ever-granted", false)) observed.edit().putBoolean("ever-granted", true).apply()
        val storage = Environment.getExternalStorageState()
        if (storage == Environment.MEDIA_MOUNTED_READ_ONLY) return Access(State.STORAGE_READ_ONLY,
            "Primary shared storage is read-only. Restore writable storage before starting this workspace.")
        if (storage != Environment.MEDIA_MOUNTED) return Access(State.STORAGE_UNAVAILABLE,
            "Primary shared storage is unavailable. Reconnect or unlock storage, then retry. Saved conversations are preserved.")
        return try {
            val root = primaryRoot()
            val folder = checkedPath(path ?: root.path, root)
            when {
                !folder.exists() -> Access(State.FOLDER_MISSING,
                    "The connected folder is missing. Restore it at the same location or connect another folder as a new workspace; Olea will not recreate it.", folder)
                !folder.isDirectory -> Access(State.NOT_A_FOLDER, "This location is a file. Choose an existing folder.", folder)
                !folder.canRead() || !folder.canWrite() || folder.list() == null -> Access(State.ACCESS_DENIED,
                    "Android does not allow reading and writing this folder. Check all-files access or choose another shared-storage folder.", folder)
                else -> Access(State.AVAILABLE, "Folder access is available.", folder)
            }
        } catch (error: IllegalArgumentException) {
            Access(State.INVALID_PATH, error.message ?: "Choose a folder in primary shared storage.")
        } catch (_: Exception) {
            Access(State.ACCESS_DENIED, "Cannot inspect this folder. Check Android storage access and retry.")
        }
    }

    fun requireAvailable(path: String): File {
        val result = access(path)
        check(result.available) { result.message }
        return checkNotNull(result.folder)
    }

    /** User-initiated settings route; launching this intent does not grant access. */
    fun settingsIntent(): Intent {
        check(Build.VERSION.SDK_INT >= 30) { "All-files access requires Android 11 or later." }
        observed.edit().putBoolean("requested", true).apply()
        val specific = Intent(Settings.ACTION_MANAGE_APP_ALL_FILES_ACCESS_PERMISSION,
            Uri.parse("package:${context.packageName}"))
        return if (specific.resolveActivity(context.packageManager) != null) specific
            else Intent(Settings.ACTION_MANAGE_ALL_FILES_ACCESS_PERMISSION)
    }

    fun childFolders(path: String): List<File> {
        val folder = requireAvailable(path)
        val children = folder.listFiles() ?: error("Cannot list this folder. Check Android storage access and retry.")
        val root = primaryRoot()
        return children.filter { child ->
            child.isDirectory && runCatching { checkedPath(child.path, root) }.isSuccess
        }.sortedWith(compareBy(String.CASE_INSENSITIVE_ORDER) { it.name })
    }

    /** Only the explicit UI action calls this. Existing files and directories are never replaced. */
    fun createVisibleOleaFolder(): File {
        val root = requireAvailable(primaryRoot().path)
        val target = checkedPath(File(root, "Olea").path, root)
        if (!target.exists()) check(target.mkdir() || target.isDirectory) {
            "Cannot create the Olea folder. Check free storage and Android access."
        }
        return requireAvailable(target.path)
    }

    private fun checkedPath(path: String, root: File): File {
        require(path.isNotBlank() && path.none { it == ':' || it == '\\' || it.isISOControl() }) {
            "Folder paths cannot contain colons, backslashes or control characters."
        }
        val supplied = File(path)
        require(supplied.isAbsolute) { "Choose an absolute folder path in primary shared storage." }
        val folder = supplied.canonicalFile
        require(folder == root || folder.path.startsWith(root.path + File.separator)) {
            "Choose a folder in primary shared storage. Removable storage and document-provider folders are not supported."
        }
        require(folder == supplied.absoluteFile) { "Choose the folder's direct path without symbolic links or parent-directory segments." }
        val relative = folder.relativeTo(root).invariantSeparatorsPath
        require(listOf("Android/data", "Android/obb").none { relative.equals(it, true) || relative.startsWith("$it/", true) }) {
            "Android restricts this app-data folder. Choose another folder in primary shared storage."
        }
        return folder
    }
}
