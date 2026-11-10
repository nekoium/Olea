# Codex 0.167.0 Linux socket isolation boundary

Actual runtime evidence is immutable at `7b154a8904101f10984c1fa053b7a73ebea58411`, under `spike/m2/runtime/evidence/`. Stock Linux 0.167.0 installation/startup and six-tool MCP registration passed in the target36 Kotlin service, real UID10216. Both stock sandbox commands exited1 with `error building bubblewrap command: cannot establish app-server socket mount isolation`. No inside artifact existed; `outsideDenialConfirmed` is false. This blocks the model prerequisite. It does not establish EPERM, a failed user-namespace syscall, or a successful outside-write restriction. No model request should run on that failed prerequisite.

## Pinned official source

All sources below are official tag `rust-v0.167.0`, downloaded read-only into this worker's `.setup/codex-upstream`. No source is copied into Olea implementation. SHA-256 values describe exact downloaded bytes.

| Official source | SHA-256 | Relevant fact |
| --- | --- | --- |
| https://raw.githubusercontent.com/openai/codex/rust-v0.167.0/codex-rs/linux-sandbox/src/daemon_mounts.rs | `bc929ea13aabdb363ed0bea9235bce795867df6c85995649a26ede327efc0352` | `daemon_socket_mask_paths` obtains opened-directory device and fdinfo mount ID, falling back to statx MNT_ID. `check_mounts` compares those facts with `/proc/self/mountinfo` device, destination, root and ancestry; several mismatch branches produce the exact observed diagnostic. |
| https://raw.githubusercontent.com/openai/codex/rust-v0.167.0/codex-rs/uds/src/daemon_directory.rs | `fd1eae1b3292f4fbc98e482a392d16246baa7fac4593dd7c1818a481fed070d6` | Socket root is fixed at `canonicalize("/tmp")/codex-daemon-<geteuid>`. Source explicitly says it must not depend on HOME, TMPDIR, CODEX_HOME or command settings. Directory must be owned by effective UID, mode0700, and not a symlink. |
| https://raw.githubusercontent.com/openai/codex/rust-v0.167.0/codex-rs/linux-sandbox/src/bwrap.rs | `82a48f532e11da94f608ca8785bac1fdd989a3276fe9fe255b9d0c0d3d60dd8d` | `create_filesystem_args` prepares that socket directory and validates its host mount aliases while constructing bubblewrap arguments. The observed build-stage failure is not itself a kernel namespace errno. |
| https://raw.githubusercontent.com/openai/codex/rust-v0.167.0/codex-rs/linux-sandbox/src/linux_run_main.rs | `2c8cdf628b8b8467cccf38227cada5295f5cb6a04888b860ea1b882fe2d19d53` | Filesystem-restricted policies explicitly reject legacy Landlock with `filesystem-restricted execution requires bubblewrap to isolate app-server sockets`. |
| https://raw.githubusercontent.com/openai/codex/rust-v0.167.0/codex-rs/linux-sandbox/README.md | `740f4a60ddb37b4e415cc3fa8da5c49d2d16a0b6b737527bf53d074c53bc220f` | Current official behavior requires bubblewrap for restricted filesystems and uses bundled bwrap if none exists on PATH. User namespace and ordinarily PID namespace isolation remain required; legacy Landlock is not a valid replacement for this policy. |

## One bounded diagnostic, owner only

Deploy the original `spike/tests/codex/socket-mount-diagnostic.mjs` in the existing public payload. The sole runtime owner invokes it through the actual native service and existing PRoot launch, never development run-as:

```sh
node /opt/olea/spike/tests/codex/socket-mount-diagnostic.mjs \
  /opt/olea/evidence/codex-socket-mount-a02.json \
  /opt/agents/codex/node_modules/@openai/codex-linux-x64/vendor/x86_64-unknown-linux-musl/codex-resources/bwrap
```

Use an overall 30-second native phase bound. The script has no credentials, model request, phone operation, installation, mount-table alteration or agent modification. It reads only its own `/tmp`, opened descriptor fdinfo, mountinfo and UID/seccomp status. Each proc input is capped1MiB; only selected/containing/device-relevant mount rows are retained. It records canonical `/tmp`, expected fixed socket path, device/inode, descriptor mount ID and matching mountinfo entry. Node has no builtin statx MNT_ID API; missing fdinfo is explicitly unresolved rather than invented. These observations identify a candidate mismatch, not a reimplementation or bypass of Codex's security decision.

The optional second argument runs only the exact installed stock bundled bwrap as a bounded child, no replacement binary:

```sh
bwrap --unshare-user --unshare-pid --ro-bind / / --proc /proc --dev /dev -- /bin/true
```

It uses a minimal nonsecret environment, a 15-second subprocess deadline, and at most64KiB output. Exact exit/signal/errno text is retained; no root/setuid/elevation or broad kill occurs. This directly tests a namespace prerequisite separate from the earlier mount guard. Success does not pass the complete Codex sandbox or seccomp policy; failure is a distinct measured runtime constraint. Do not retry with isolation flags removed. This diagnostic has a local parser self-check (`--self-test`) but has not been executed by this worker on Android.

## At most one conditional alternative

There is one plausible standard runtime packaging alternative, conditional on the diagnostic: make guest `/tmp` canonicalize to the **genuine kernel-visible app-private temporary directory** on its actual filesystem, using ordinary PRoot path bindings in a fresh disposable runtime. A conventional `/tmp` symlink is consistent with upstream's explicit canonicalization, which already handles `/tmp` aliases; upstream socket/mount validation and all sandbox policy remain unchanged.

For example, the runtime owner could designate a new empty mode0700 directory such as `/data/user/0/dev.olea.m2.runtime/files/codex-tmp-a02`, identity-bind only that directory into the guest at the same absolute path, and package guest `/tmp` as a symlink to it **in a newly provisioned disposable rootfs**. The actual owner must resolve the correct package/data path from current state, check Unix socket length, and compare descriptor device/mount ID/containing mount with the canonical target. This is a proposal, not executed source or compatibility proof. Exposing only that empty directory avoids a broad host-data bind. Preserve current `/tmp`, existing daemon state, credentials and all baseline rootfs data; do not rename/delete them to stage this candidate.

This candidate can only address a real guest/kernel path-identity mismatch. It cannot fix unavailable user namespaces, denied mount/seccomp operations, or a valid unsupported alias detected by stock Codex. If the diagnostic shows no genuine identity mapping can satisfy the guard, or direct bundled bwrap requires denied privileges, the candidate remains blocked. Do not fake `/proc/self/mountinfo`, fdinfo, statx or device numbers; do not intercept syscalls, patch the agent, relax guard checks, disable sandbox/approvals, enable full access, or invoke the provider for a blocked case.

There is no credible second configuration alternative established by current stock source: TMPDIR/CODEX_HOME changes do not move the fixed socket root, and legacy Landlock rejects restricted filesystems. Ordinary public agent/runtime updates and independent fresh-repeat/state-preservation cases can continue without claiming sandbox/model success.
