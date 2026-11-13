package dev.olea.app

import android.content.Context
import org.json.JSONObject
import org.json.JSONTokener
import java.io.File
import java.io.FileOutputStream

/** Immutable host mappings; a private file at each guest path prevents an unbound directory fallback. */
class WorkspaceFolders(context: Context, private val store: SessionStore) {
    private val base = context.filesDir.canonicalFile
    private val access = AndroidSharedFolders(context)
    private val record = File(base, "data/connected-folders.json")

    companion object {
        private val lock = Any()
        private val safeId = Regex("[a-zA-Z0-9_-]{1,64}")
        private const val blocked = "Olea connected workspace: a verified shared-folder bind is required.\n"
    }

    private fun read(): JSONObject {
        check(record.canonicalFile == record.absoluteFile) { "Connected-folder registry path was redirected. Saved data was preserved." }
        if (!record.exists()) return JSONObject()
        val parser = JSONTokener(record.readText())
        val values = parser.nextValue() as? JSONObject ?: error("Invalid connected-folder registry. Restore it before starting; saved data was preserved.")
        check(parser.nextClean() == '\u0000') { "Unexpected connected-folder registry content" }
        val known = store.workspaces().associateBy { it.id }
        values.keys().forEach { id ->
            check(safeId.matches(id) && id != "default" && known.containsKey(id)) { "Unknown connected workspace in registry; saved data was preserved." }
            val path = values.get(id) as? String ?: error("Invalid connected-folder path in registry")
            check(path.isNotBlank() && File(path).isAbsolute && path.none { it == ':' || it == '\\' || it.isISOControl() }) { "Invalid connected-folder path in registry" }
        }
        return values
    }

    fun isConnected(workspaceId: String): Boolean = synchronized(lock) { read().has(workspaceId) }

    fun status(workspaceId: String): JSONObject = synchronized(lock) {
        val values = read()
        if (!values.has(workspaceId)) return@synchronized JSONObject().put("connected", false).put("state", "managed")
        val path = values.getString(workspaceId)
        val result = access.access(path)
        JSONObject().put("connected", true).put("path", path)
            .put("state", result.state.name.lowercase()).put("message", result.message)
    }

    fun connect(workspaceId: String, path: String) = synchronized(lock) {
        val workspace = workspace(workspaceId)
        require(workspace.id != "default") { "Connect a new workspace; the original default workspace is preserved." }
        val folder = access.requireAvailable(path)
        val values = read()
        if (values.has(workspaceId)) {
            check(values.getString(workspaceId) == folder.path) { "This workspace already belongs to a different folder. Create a new workspace to use another folder." }
        } else {
            check(store.conversations().none { it.workspaceId == workspaceId } && store.workspaceFile(workspace).list()?.isEmpty() == true) {
                "Connect a new empty workspace before starting conversations; existing workspace files and sessions are preserved."
            }
            val staging = File(record.parentFile, "connected-folders.tmp")
            check(staging.canonicalFile == staging.absoluteFile) { "Connected-folder save path was redirected" }
            FileOutputStream(staging).use { output ->
                output.write(values.put(workspaceId, folder.path).toString().toByteArray(Charsets.UTF_8))
                output.fd.sync()
            }
            check(staging.renameTo(record)) { "Cannot save connected folder. Saved data was preserved." }
        }
        blockFallback(workspace)
    }

    fun requireAvailable(workspaceId: String) = synchronized(lock) {
        val values = read()
        if (values.has(workspaceId)) {
            access.requireAvailable(values.getString(workspaceId))
            blockFallback(workspace(workspaceId))
        }
    }

    fun workspaceFile(workspaceId: String): File = synchronized(lock) {
        val values = read()
        if (values.has(workspaceId)) access.requireAvailable(values.getString(workspaceId))
        else store.workspaceFile(workspace(workspaceId))
    }

    fun workspacePath(workspaceId: String): String = synchronized(lock) {
        val item = workspace(workspaceId)
        val values = read()
        if (!values.has(workspaceId)) return@synchronized store.workspacePath(item)
        access.requireAvailable(values.getString(workspaceId))
        blockFallback(item)
        guestPath(item)
    }

    /** Skip unavailable sources while leaving their guest paths as files, never substitute directories. */
    fun writeBindings(): File = synchronized(lock) {
        val values = read()
        val lines = values.keys().asSequence().mapNotNull { id ->
            val item = workspace(id)
            blockFallback(item)
            val result = access.access(values.getString(id))
            if (!result.available) null else "${checkNotNull(result.folder).path}\t${guestPath(item)}"
        }.toList()
        val file = File(base, "tmp/workspace-binds.tsv")
        check(file.parentFile!!.isDirectory || file.parentFile!!.mkdirs()) { "Cannot create private runtime temporary directory" }
        val staging = File(file.parentFile, "workspace-binds.tmp")
        check(file.canonicalFile == file.absoluteFile && staging.canonicalFile == staging.absoluteFile) { "Workspace binding snapshot path was redirected" }
        FileOutputStream(staging).use { output ->
            output.write(lines.joinToString("\n", postfix = if (lines.isEmpty()) "" else "\n").toByteArray(Charsets.UTF_8))
            output.fd.sync()
        }
        check(staging.renameTo(file)) { "Cannot save workspace binding snapshot" }
        file
    }

    private fun workspace(id: String): WorkspaceInfo = store.workspaces().firstOrNull { it.id == id } ?: error("Unknown workspace")

    private fun guestPath(item: WorkspaceInfo): String {
        check(item.id != "default" && safeId.matches(item.id) && item.relativePath == "workspace-${item.id}") { "Invalid connected workspace identity" }
        return "/workspace/${item.relativePath}"
    }

    private fun blockFallback(item: WorkspaceInfo) {
        guestPath(item)
        val placeholder = File(base, "data/workspace/${item.relativePath}")
        check(placeholder.canonicalFile == placeholder.absoluteFile) { "Connected workspace placeholder was redirected; saved data was preserved." }
        if (placeholder.isDirectory) {
            // Only an empty app-private placeholder is removed; shared folders are never changed here.
            check(placeholder.list()?.isEmpty() == true && placeholder.delete()) {
                "The private placeholder for ${item.name} contains files or cannot be replaced. Preserve its files before repairing this workspace."
            }
        }
        if (!placeholder.exists()) {
            check(placeholder.createNewFile()) { "Cannot block an unbound workspace path" }
            FileOutputStream(placeholder).use { output -> output.write(blocked.toByteArray(Charsets.UTF_8)); output.fd.sync() }
        }
        check(placeholder.isFile && placeholder.length() == blocked.toByteArray(Charsets.UTF_8).size.toLong() && placeholder.readText() == blocked) {
            "The private placeholder for ${item.name} changed. Preserve it before repairing this workspace."
        }
    }
}
