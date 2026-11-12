package dev.olea.app

import org.json.JSONArray
import org.json.JSONObject
import org.json.JSONTokener
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import java.util.UUID

data class WorkspaceInfo(val id: String, val name: String, val relativePath: String)
data class ConversationInfo(val id: String, val title: String, val agent: String, val workspaceId: String)

/** Metadata and display paths only; selecting a conversation never starts or replays an agent. */
class SessionStore(filesDir: File) {
    private val base = filesDir.canonicalFile
    private val data = File(base, "data")
    private val registry = File(data, "session-registry.json")
    private val temporary = File(data, "session-registry.tmp")
    private val workspaceRoot = File(data, "workspace")
    private val journals = File(data, "journals")

    private data class State(
        val workspaces: List<WorkspaceInfo>,
        val conversations: List<ConversationInfo>,
        val activeId: String
    )

    companion object {
        // The app uses one process; sharing this lock also prevents stale writes from separate store instances.
        private val lock = Any()
        private val safeId = Regex("[a-zA-Z0-9_-]{1,64}")
    }

    init {
        synchronized(lock) {
            directory(data)
            exactPath(registry)
            exactPath(temporary)
            if (!registry.exists()) {
                check(!temporary.exists()) {
                    "Session registry save was interrupted at ${temporary.path}. Preserve it and recover the registry before reopening."
                }
                exactPath(journals)
                check(!journals.exists() || (journals.isDirectory && journals.list()?.isEmpty() == true)) {
                    "Session registry is missing but display journals remain at ${journals.path}. Restore the registry before reopening; saved data was preserved."
                }
                // Keep the original display and Pi /sessions/conversation resume files in place.
                save(State(listOf(WorkspaceInfo("default", "Default", "")),
                    listOf(ConversationInfo("conversation", "Conversation", "pi", "default")), "conversation"))
            }
            load()
            directory(workspaceRoot)
            directory(journals)
        }
    }

    fun workspaces(): List<WorkspaceInfo> = synchronized(lock) { load().workspaces }
    fun conversations(): List<ConversationInfo> = synchronized(lock) { load().conversations }
    fun active(): ConversationInfo = synchronized(lock) {
        val state = load()
        state.conversations.single { it.id == state.activeId }
    }

    fun createWorkspace(name: String): WorkspaceInfo = synchronized(lock) {
        val cleanName = label(name.trim(), "Workspace name")
        val state = load()
        directory(workspaceRoot)
        var workspace: WorkspaceInfo
        var folder: File
        do {
            val id = UUID.randomUUID().toString()
            workspace = WorkspaceInfo(id, cleanName, "workspace-$id")
            folder = workspaceFileChecked(workspace)
        } while (state.workspaces.any { it.id == workspace.id } || folder.exists())
        check(folder.mkdir()) { "Cannot create workspace at ${folder.path}. Check available storage." }
        save(state.copy(workspaces = state.workspaces + workspace))
        workspace
    }

    /** Creation leaves selection unchanged; call select explicitly to open the new conversation. */
    fun createConversation(title: String, agent: String, workspaceId: String): ConversationInfo = synchronized(lock) {
        val cleanTitle = label(title.trim(), "Conversation title")
        require(agent == "pi" || agent == "codex") { "Agent must be pi or codex; use a new conversation to change agents." }
        identifier(workspaceId)
        val state = load()
        require(state.workspaces.any { it.id == workspaceId }) { "Unknown workspace: $workspaceId" }
        var session: ConversationInfo
        do {
            session = ConversationInfo(UUID.randomUUID().toString(), cleanTitle, agent, workspaceId)
        } while (state.conversations.any { it.id == session.id } || File(journals, "${session.id}.json").exists()
            || File(data, "sessions/${session.id}").exists() || File(data, "sessions/codex/${session.id}").exists())
        save(state.copy(conversations = state.conversations + session))
        session
    }

    fun select(id: String): ConversationInfo = synchronized(lock) {
        identifier(id)
        val state = load()
        val session = state.conversations.singleOrNull { it.id == id }
            ?: throw IllegalArgumentException("Unknown conversation: $id")
        if (state.activeId != id) save(state.copy(activeId = id))
        session
    }

    fun journalFile(session: ConversationInfo): File = synchronized(lock) {
        require(load().conversations.contains(session)) { "Unknown or changed conversation: ${session.id}" }
        directory(journals)
        val file = if (session.id == "conversation") File(data, "conversation.json") else File(journals, "${session.id}.json")
        exactPath(file)
        file
    }

    fun workspaceFile(workspace: WorkspaceInfo): File = synchronized(lock) {
        require(load().workspaces.contains(workspace)) { "Unknown or changed workspace: ${workspace.id}" }
        directory(workspaceRoot)
        workspaceFileChecked(workspace).also { directory(it) }
    }

    fun workspacePath(workspace: WorkspaceInfo): String = synchronized(lock) {
        workspaceFile(workspace)
        if (workspace.relativePath.isEmpty()) "/workspace" else "/workspace/${workspace.relativePath}"
    }

    private fun load(): State {
        try {
            exactPath(registry)
            check(registry.isFile) { "Registry file is missing" }
            val parser = JSONTokener(registry.readText())
            val json = parser.nextValue() as? JSONObject ?: error("Expected a registry object")
            check(parser.nextClean() == '\u0000') { "Unexpected content after registry" }
            check(json.get("version") == 1) { "Unsupported registry version" }
            val workspaceArray = json.getJSONArray("workspaces")
            val conversationArray = json.getJSONArray("conversations")
            val workspaces = (0 until workspaceArray.length()).map { index ->
                val value = workspaceArray.getJSONObject(index)
                WorkspaceInfo(text(value, "id"), text(value, "name"), text(value, "relativePath"))
            }
            val conversations = (0 until conversationArray.length()).map { index ->
                val value = conversationArray.getJSONObject(index)
                ConversationInfo(text(value, "id"), text(value, "title"), text(value, "agent"), text(value, "workspaceId"))
            }
            return State(workspaces, conversations, text(json, "activeSessionId")).also { validate(it) }
        } catch (error: Exception) {
            throw IOException("Cannot read session registry at ${registry.path}. Saved data was preserved; restore a valid registry before reopening. ${error.message}", error)
        }
    }

    private fun validate(state: State) {
        check(state.workspaces.map { it.id }.distinct().size == state.workspaces.size) { "Duplicate workspace ID" }
        check(state.conversations.map { it.id }.distinct().size == state.conversations.size) { "Duplicate conversation ID" }
        check(state.workspaces.any { it.id == "default" && it.relativePath.isEmpty() }) { "Default workspace is missing" }
        check(state.conversations.any { it.id == "conversation" && it.agent == "pi" && it.workspaceId == "default" }) { "Original Pi conversation is missing or changed" }
        for (workspace in state.workspaces) {
            identifier(workspace.id)
            label(workspace.name, "Workspace name")
            check(workspace.relativePath == if (workspace.id == "default") "" else "workspace-${workspace.id}") { "Invalid workspace path" }
            workspaceFileChecked(workspace)
        }
        for (session in state.conversations) {
            identifier(session.id)
            label(session.title, "Conversation title")
            check(session.agent == "pi" || session.agent == "codex") { "Invalid conversation agent" }
            check(state.workspaces.any { it.id == session.workspaceId }) { "Conversation workspace is missing" }
        }
        check(state.conversations.any { it.id == state.activeId }) { "Selected conversation is missing" }
    }

    private fun save(state: State) {
        validate(state)
        val json = JSONObject().put("version", 1).put("activeSessionId", state.activeId)
            .put("workspaces", JSONArray().apply { state.workspaces.forEach {
                put(JSONObject().put("id", it.id).put("name", it.name).put("relativePath", it.relativePath))
            } })
            .put("conversations", JSONArray().apply { state.conversations.forEach {
                put(JSONObject().put("id", it.id).put("title", it.title).put("agent", it.agent).put("workspaceId", it.workspaceId))
            } })
        try {
            exactPath(registry)
            exactPath(temporary)
            FileOutputStream(temporary).use { output ->
                output.write(json.toString(2).toByteArray(Charsets.UTF_8))
                output.fd.sync()
            }
            // Same-directory rename replaces atomically on Android; the previous file survives any failed rename.
            check(temporary.renameTo(registry)) { "Could not replace registry" }
        } catch (error: Exception) {
            throw IOException("Cannot save session registry at ${registry.path}. Check free storage; preserve the registry and temporary file before recovery. ${error.message}", error)
        }
    }

    private fun workspaceFileChecked(workspace: WorkspaceInfo): File {
        val file = if (workspace.relativePath.isEmpty()) workspaceRoot else File(workspaceRoot, workspace.relativePath)
        exactPath(file)
        return file
    }

    private fun exactPath(file: File) {
        check(file.canonicalFile == file.absoluteFile) { "Unsafe redirected storage path: ${file.path}" }
    }

    private fun directory(file: File) {
        exactPath(file)
        check(file.isDirectory || file.mkdirs()) { "Cannot create storage directory at ${file.path}. Check available storage." }
    }

    private fun identifier(value: String) {
        require(safeId.matches(value)) { "Invalid ID; use 1–64 letters, digits, underscores or hyphens." }
    }

    private fun label(value: String, field: String): String {
        require(value.isNotBlank() && value.length <= 160 && value != "." && value != ".."
            && value.none { it == '/' || it == '\\' || it == ':' || it.isISOControl() }) {
            "$field must be 1–160 characters without path separators, colons or control characters."
        }
        return value
    }

    private fun text(value: JSONObject, key: String): String = value.get(key) as? String
        ?: error("Expected text for $key")
}
