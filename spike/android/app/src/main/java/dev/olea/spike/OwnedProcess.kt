package dev.olea.spike

import android.os.Process
import android.system.Os
import android.system.OsConstants
import org.json.JSONArray
import org.json.JSONObject
import java.io.File

// Bound numeric ownership observations; never signal by process name or a whole UID/group.
class OwnedProcess(private val process: java.lang.Process, private val identityFile: File) {
    data class Identity(val pid: Int, val parent: Int, val group: Int, val tracer: Int, val start: Long, val uid: Int) {
        fun json() = JSONObject().put("pid", pid).put("parent", parent).put("group", group).put("tracer", tracer).put("start", start).put("uid", uid)
    }
    private val identities = linkedMapOf<Int, Identity>()
    private val faults = mutableSetOf<String>()
    @Volatile private var observing = true
    @Volatile private var stopping = false
    private val observer = Thread({
        try {
            val deadline = android.os.SystemClock.elapsedRealtime() + 2000
            while (!identityFile.isFile && android.os.SystemClock.elapsedRealtime() < deadline) Thread.sleep(20)
            val pid = identityFile.readText().trim().toInt()
            val root = read(pid) ?: error("ROOT_IDENTITY_UNAVAILABLE")
            check(root.uid == Process.myUid()) { "ROOT_UID_MISMATCH" }
            synchronized(this) { identities[pid] = root }
            while (observing) {
                snapshot()
                if (!process.isAlive) observing = false else Thread.sleep(100)
            }
        } catch (error: Exception) { synchronized(this) { faults.add(error.message?.take(100) ?: "OWNERSHIP_UNVERIFIABLE") } }
    }, "owned-process-observer").apply { start() }

    private fun read(pid: Int): Identity? {
        val directory = File("/proc/$pid")
        if (!directory.exists()) return null
        val uid = try { Os.stat(directory.path).st_uid } catch (error: android.system.ErrnoException) {
            if (error.errno == OsConstants.ENOENT) return null else throw error
        }
        if (uid != Process.myUid()) error("OWNED_UID_CHANGED")
        val text = try { File(directory, "stat").readText() } catch (error: java.io.FileNotFoundException) {
            if (!directory.exists()) return null else throw error
        }
        val fields = text.substring(text.lastIndexOf(')') + 2).trim().split(Regex("\\s+"))
        val tracer = File(directory, "status").useLines { lines -> lines.first { it.startsWith("TracerPid:") }.substringAfter(':').trim().toInt() }
        return Identity(pid, fields[1].toInt(), fields[2].toInt(), tracer, fields[19].toLong(), uid)
    }

    @Synchronized private fun snapshot() {
        val root = identities.values.firstOrNull() ?: return
        val directories = File("/proc").listFiles()?.filter { it.name.matches(Regex("[1-9][0-9]*")) } ?: error("PROC_LIST_UNAVAILABLE")
        check(directories.size <= 4096) { "PROC_ENTRY_LIMIT" }
        val deadline = android.os.SystemClock.elapsedRealtime() + 1000
        val records = mutableListOf<Identity>()
        for (directory in directories) {
            check(android.os.SystemClock.elapsedRealtime() <= deadline) { "PROC_TIME_LIMIT" }
            try {
                if (Os.stat(directory.path).st_uid == root.uid) read(directory.name.toInt())?.let { records.add(it) }
            } catch (error: android.system.ErrnoException) { if (error.errno != OsConstants.ENOENT) throw error }
        }
        val liveOwned = records.filter { record -> identities[record.pid]?.let { it.start == record.start && it.uid == record.uid } == true }.map { it.pid }.toMutableSet()
        var added: Boolean
        do {
            added = false
            for (record in records) if (record.pid !in identities && record.start >= root.start &&
                (record.parent in liveOwned || record.tracer in liveOwned || (root.pid in liveOwned && root.group == root.pid && record.group == root.pid))) {
                check(identities.size < 256) { "OWNED_PROCESS_LIMIT" }
                identities[record.pid] = record; liveOwned.add(record.pid); added = true
            }
        } while (added)
    }

    @Synchronized fun stop(): JSONObject {
        if (stopping) return result()
        stopping = true
        // Observer releases this monitor between bounded scans.
        observing = false
        runCatching { snapshot() }.onFailure { faults.add(it.message ?: "FINAL_SCAN_FAILED") }
        for (signal in listOf(OsConstants.SIGTERM, OsConstants.SIGKILL)) {
            for (identity in identities.values.toList().asReversed()) {
                try {
                    val current = read(identity.pid)
                    if (current != null) {
                        check(current.uid == identity.uid && current.start == identity.start) { "PID_REUSED" }
                        Os.kill(identity.pid, signal)
                    }
                } catch (error: android.system.ErrnoException) { if (error.errno != OsConstants.ESRCH) faults.add("SIGNAL_UNVERIFIABLE") }
                catch (error: Exception) { faults.add(error.message ?: "SIGNAL_UNVERIFIABLE") }
            }
            Thread.sleep(300)
        }
        return result()
    }

    @Synchronized fun result(): JSONObject {
        val remaining = JSONArray()
        for (identity in identities.values) {
            try { read(identity.pid)?.let { if (it.start == identity.start && it.uid == identity.uid) remaining.put(it.json()) } }
            catch (_: Exception) { faults.add("EXIT_UNVERIFIABLE") }
        }
        return JSONObject().put("owned", JSONArray(identities.values.map { it.json() }))
            .put("remaining", remaining).put("faults", JSONArray(faults.toList()))
            .put("trackedExitVerified", identities.isNotEmpty() && remaining.length() == 0 && faults.isEmpty())
            .put("limit", "Finite 100ms ownership snapshots; unseen forks/whole-service death require independent observation")
    }

    companion object {
        fun launch(builder: ProcessBuilder, identityFile: File): Pair<java.lang.Process, OwnedProcess> {
            check(!identityFile.exists()) { "IDENTITY_FILE_EXISTS" }
            val original = builder.command().toList()
            // Paths are generated by the harness; pass argv, never shell-interpolate script contents.
            builder.command(listOf("/system/bin/sh", "-c", "umask 077; echo $$ > \"$1\"; shift; exec \"$@\"", "owned-process", identityFile.absolutePath) + original)
            val child = builder.start()
            return child to OwnedProcess(child, identityFile)
        }
    }
}
