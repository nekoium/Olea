package dev.olea.app

import android.content.Context
import android.net.ConnectivityManager
import android.os.Build
import java.io.File
import java.security.MessageDigest
import java.util.UUID

class Environment(private val context: Context) {
    val base = context.filesDir
    val ready get() = File(base, "runtime/ready").isFile
    private val hashes by lazy {
        context.assets.open("hashes.txt").bufferedReader().useLines { lines ->
            lines.associate { val parts = it.split(' '); parts[1] to parts[0] }
        }
    }

    fun initialize() {
        check(Build.SUPPORTED_ABIS.contains("x86_64")) { "This build requires an x86_64 device; ARM64 is not packaged yet." }
        for (path in listOf("runtime", "data/workspace", "data/home", "data/sessions", "backend", "tmp", "archives")) File(base, path).mkdirs()
        for (name in listOf("linux.sh", "prepare.sh", "agent-maintenance.sh")) {
            context.assets.open(name).use { input -> File(base, name).outputStream().use { input.copyTo(it) } }
        }
        // Backend code is replaceable; persistent sessions and agent homes are separate binds.
    }

    private fun archive(name: String): File {
        check(context.assets.list("")?.contains(name) == true) { "Packaged archive $name is missing. Reinstall this APK; saved data is preserved." }
        val file = File(base, "archives/$name")
        val temporary = File(base, "archives/$name.part")
        val digest = MessageDigest.getInstance("SHA-256")
        context.assets.open(name).use { input -> temporary.outputStream().use { output ->
            val buffer = ByteArray(65536)
            while (true) { val count = input.read(buffer); if (count < 0) break; output.write(buffer, 0, count); digest.update(buffer, 0, count) }
        } }
        check(digest.digest().joinToString("") { "%02x".format(it) } == hashes[name]) { "Packaged archive verification failed. Reinstall this APK." }
        check(temporary.renameTo(file)) { "Cannot save verified archive. Check available storage." }
        return file
    }

    fun prepare(progress: (String) -> Unit, run: (List<String>, Int) -> Unit) {
        initialize()
        val root = File(base, "runtime/rootfs")
        if (!root.exists()) {
            progress("Verifying packaged Linux and Node archives…")
            val ubuntu = archive("ubuntu.bin")
            val node = archive("node.bin")
            val staging = File(base, "runtime/install-${UUID.randomUUID()}").apply { mkdirs() }
            progress("Extracting Linux…")
            run(listOf("/system/bin/tar", "-xzf", ubuntu.path, "--no-same-owner", "--exclude=usr/bin/perl5.38.2", "--exclude=usr/bin/uncompress", "-C", staging.path), 120)
            val nodeDirectory = File(staging, "opt/node").apply { mkdirs() }
            run(listOf("/system/bin/tar", "-xzf", node.path, "--strip-components=1", "-C", nodeDirectory.path), 120)
            for (path in listOf("workspace", "root", "sessions", "olea", "run")) File(staging, path).mkdirs()
            check(staging.renameTo(root)) { "Cannot activate Linux. Existing files were preserved." }
        }
        refreshDns(root)
        progress("Installing certificates, Git and stock Pi. Internet access is required…")
        stageBackend(run)
        installPackages(run)
    }

    fun installPackages(run: (List<String>, Int) -> Unit) {
        run(linux("/bin/sh", "-c", "dpkg --configure -a && /bin/sh /olea/prepare.sh"), 960)
        File(base, "runtime/ready").writeText("1\n")
    }

    fun stageBackend(run: (List<String>, Int) -> Unit) {
        val archive = archive("backend.bin")
        run(listOf("/system/bin/tar", "-xzf", archive.path, "-C", File(base, "backend").path), 60)
        File(base, "prepare.sh").copyTo(File(base, "backend/prepare.sh"), overwrite = true)
        File(base, "agent-maintenance.sh").copyTo(File(base, "backend/agent-maintenance.sh"), overwrite = true)
    }

    fun refreshDns(root: File = File(base, "runtime/rootfs")) {
        val manager = context.getSystemService(ConnectivityManager::class.java)
        val servers = manager.getLinkProperties(manager.activeNetwork)?.dnsServers.orEmpty().filter { it.hostAddress?.contains(':') == false }
        File(root, "etc/resolv.conf").writeText((servers.mapNotNull { it.hostAddress }.ifEmpty { listOf("1.1.1.1") }).joinToString("\n", postfix = "\n") { "nameserver $it" })
    }

    fun linux(vararg args: String) = listOf("/system/bin/sh", File(base, "linux.sh").path) + args
    fun builder(command: List<String>) = ProcessBuilder(command).directory(base).apply {
        environment()["OLEA_APP_BASE"] = base.path
        environment()["OLEA_NATIVE_DIR"] = context.applicationInfo.nativeLibraryDir
    }
}
