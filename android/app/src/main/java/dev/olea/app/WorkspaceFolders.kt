package dev.olea.app

import android.content.Context
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.util.UUID

/** Direct shared-folder binds require ordinary Android all-files special access, not a SAF URI. */
class WorkspaceFolders(context: Context, private val store: SessionStore) {
    private val base = context.filesDir
    private val access = AndroidSharedFolders(context)
    private val record = File(base, "data/connected-folders.json")
    private fun read(): JSONObject = if (record.exists()) JSONObject(record.readText()) else JSONObject()
    fun permissionGranted(): Boolean = android.os.Build.VERSION.SDK_INT >= 30 && android.os.Environment.isExternalStorageManager()
    fun status(workspaceId: String): JSONObject {
        val saved = read().optString(workspaceId)
        if (saved.isEmpty()) return JSONObject().put("connected", false).put("state", "managed")
        val result = access.access(saved)
        return JSONObject().put("connected", true).put("path", saved)
            .put("state", result.state.name.lowercase()).put("message", result.message)
    }
    fun connect(workspaceId: String, path: String) {
        check(permissionGranted()) { "Grant All files access in Android settings before connecting a folder. Folder-picker access alone is insufficient." }
        val workspace = store.workspaces().firstOrNull { it.id == workspaceId } ?: error("Unknown workspace")
        require(workspace.id != "default") { "Connect a new workspace; the original default workspace is preserved" }
        val folder = access.requireAvailable(path)
        val values = read()
        val existing = values.optString(workspaceId)
        if (existing.isEmpty()) {
            check(store.conversations().none { it.workspaceId == workspaceId } && store.workspaceFile(workspace).list()?.isEmpty() == true) { "Connect a new empty workspace before starting conversations; existing workspace files and sessions are preserved" }
        } else check(existing == folder.path) { "This workspace already belongs to a different folder. Create a new workspace to use another folder." }
        val probe = File(folder, ".olea-access-${UUID.randomUUID()}")
        check(probe.createNewFile()) { "Cannot write to selected folder" }
        try {
            probe.writeText("olea-folder-access\n")
            check(probe.readText() == "olea-folder-access\n") { "Folder read/write verification failed" }
        } finally { check(probe.delete()) { "Could not remove Olea's temporary access probe at ${probe.path}" } }
        record.parentFile!!.mkdirs()
        val staging = File(record.parentFile, "connected-folders.tmp")
        FileOutputStream(staging).use { it.write(values.put(workspaceId, folder.path).toString().toByteArray()); it.fd.sync() }
        check(staging.renameTo(record)) { "Cannot save connected folder" }
    }
    /** Fail before launching PRoot; never silently run against a managed-folder fallback. */
    fun writeBindings(): File {
        val values = read()
        val workspaces = store.workspaces().associateBy { it.id }
        val lines = values.keys().asSequence().map { id ->
            val workspace = workspaces[id] ?: error("Connected workspace is missing from registry")
            check(status(id).optString("state") == "available") { "Connected folder for ${workspace.name} is unavailable. Restore access in Android settings; saved conversations are preserved." }
            val path = values.getString(id)
            val folder = access.requireAvailable(path)
            check(folder.path == path) { "Invalid connected-folder binding" }
            "$path\t${store.workspacePath(workspace)}"
        }.toList()
        val file = File(base, "tmp/workspace-binds.tsv")
        file.parentFile!!.mkdirs(); file.writeText(lines.joinToString("\n", postfix = if (lines.isEmpty()) "" else "\n"))
        return file
    }
}
