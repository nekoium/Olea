package dev.olea.app

import android.app.Instrumentation
import android.os.Bundle
import java.io.File

/** Provider-free storage check. Run only in a separate synthetic test installation. */
class BroadStorageInstrumentation : Instrumentation() {
    private var mode = "denied"
    override fun onCreate(arguments: Bundle?) {
        mode = arguments?.getString("mode") ?: mode
        super.onCreate(arguments)
        start()
    }
    override fun onStart() {
        var passed = false
        var message = ""
        try {
            check(targetContext.packageName == "dev.olea.broadtest") { "Use the separate test installation" }
            val environment = Environment(targetContext)
            environment.initialize()
            fun run(command: List<String>, seconds: Int): String {
                val process = environment.builder(command).redirectErrorStream(true).start()
                val output = StringBuilder()
                val drain = Thread { process.inputStream.bufferedReader().useLines { lines -> lines.forEach { output.appendLine(it) } } }.apply { start() }
                check(process.waitFor(seconds.toLong(), java.util.concurrent.TimeUnit.SECONDS)) { process.destroyForcibly(); "Timed out" }
                drain.join(1000)
                check(process.exitValue() == 0) { output.toString().takeLast(4000) }
                return output.toString()
            }
            val access = AndroidSharedFolders(targetContext)
            if (mode == "bootstrap") {
                val root = File(environment.base, "runtime/rootfs")
                if (!root.exists()) {
                    check(root.mkdirs())
                    fun extract(asset: String, destination: File, strip: Boolean = false) {
                        val archive = File(environment.base, "archives/$asset")
                        targetContext.assets.open(asset).use { input -> archive.outputStream().use { input.copyTo(it) } }
                        run(listOf("/system/bin/tar", "-xzf", archive.path, "--no-same-owner") +
                            (if (strip) listOf("--strip-components=1") else listOf("--exclude=usr/bin/perl5.38.2", "--exclude=usr/bin/uncompress")) +
                            listOf("-C", destination.path), 120)
                    }
                    extract("ubuntu.bin", root)
                    val node = File(root, "opt/node").apply { mkdirs() }
                    extract("node.bin", node, true)
                }
                environment.refreshDns()
                environment.stageBackend { command, seconds -> run(command, seconds) }
                run(environment.linux("/bin/sh", "/olea/agent-maintenance.sh", "pi", "install"), 600)
                message = "prepared with stock Pi 1.5.2; no model requests"
            } else {
                check(File(environment.base, "runtime/rootfs/opt/node/bin/node").isFile) { "Bootstrap first" }
                val state = access.access().state
                if (mode == "granted") {
                    check(state == AndroidSharedFolders.State.AVAILABLE) { state.name }
                    val root = access.primaryRoot()
                    val fixture = File(root, "Olea-broad-access-synthetic")
                    check(!fixture.exists()) { "Fixture already exists; preserve it" }
                    check(fixture.mkdir())
                    try {
                        File(fixture, "note.txt").writeText("synthetic before\n")
                        message = run(environment.linux("/bin/sh", "-ec", "test \"\u0024PWD\" = /workspace; ls /sdcard/Olea-broad-access-synthetic; cat /sdcard/Olea-broad-access-synthetic/note.txt; printf 'synthetic after\\n' > /sdcard/Olea-broad-access-synthetic/note.txt; cat /storage/emulated/0/Olea-broad-access-synthetic/note.txt; test \"\u0024PWD\" = /workspace"), 30)
                        check(File(fixture, "note.txt").readText() == "synthetic after\n")
                        val tools = File(targetContext.filesDir, "data/workspace/broad-stock-tools.mjs")
                        tools.writeText("""
                            import assert from 'node:assert/strict';
                            import { createReadTool } from '/opt/agents/lib/node_modules/@earendil-works/pi-coding-agent/dist/core/tools/read.js';
                            import { createEditTool } from '/opt/agents/lib/node_modules/@earendil-works/pi-coding-agent/dist/core/tools/edit.js';
                            const path = '/sdcard/Olea-broad-access-synthetic/note.txt';
                            assert.equal(process.cwd(), '/workspace');
                            const read = await createReadTool(process.cwd()).execute('synthetic-read', { path });
                            assert.match(JSON.stringify(read), /synthetic after/);
                            await createEditTool(process.cwd()).execute('synthetic-edit', { path, edits: [{ oldText: 'synthetic after', newText: 'stock edited' }] });
                            assert.equal(process.cwd(), '/workspace');
                            console.log('stock Pi read/edit outside workspace: pass');
                        """.trimIndent())
                        try { message += run(environment.linux("node", "/workspace/broad-stock-tools.mjs"), 60) }
                        finally { tools.delete() }
                        check(File(fixture, "note.txt").readText() == "stock edited\n")
                        val store = SessionStore(targetContext.filesDir)
                        val workspace = store.createWorkspace("Synthetic connected")
                        WorkspaceFolders(targetContext, store).connect(workspace.id, fixture.path)
                        message += run(environment.linux("/bin/sh", "-ec", "cd /workspace/workspace-${workspace.id}; test -f note.txt; test -d /sdcard/Download; printf 'connected cwd separate\\n'"), 30)
                    } finally {
                        File(fixture, "note.txt").delete()
                        check(fixture.delete())
                    }
                } else {
                    if (mode == "revoked") check(state == AndroidSharedFolders.State.PERMISSION_REVOKED) { state.name }
                    else {
                        access.settingsIntent() // records a real settings request without granting it
                        check(access.access().state == AndroidSharedFolders.State.PERMISSION_DENIED) { access.access().state.name }
                    }
                    message = run(environment.linux("/bin/sh", "-ec", "test ! -d /sdcard/Download; test ! -d /storage/emulated/0/Download; test \"\u0024PWD\" = /workspace; printf 'managed cwd available; no shared binding\\n'"), 30)
                    check(environment.boundSharedStoragePath == null)
                }
                message = "${state.name}: $message"
            }
            passed = true
        } catch (error: Throwable) { message = "${error.javaClass.simpleName}: ${error.message}" }
        finish(if (passed) -1 else 0, Bundle().apply { putString("stream", "$mode: $message"); putBoolean("passed", passed) })
    }
}
