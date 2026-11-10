# Actual service-domain Codex sandbox assessment

Assessment time: 2026-11-10T18:07:03Z. Verdict for tested stock Codex0.167.0 sandbox route: **blocked; revise the runtime compatibility candidate**. Do not spend the conditional Codex model prompt while this prerequisite fails. Stock install/startup and actual MCP discovery remain separate passes. Independent fresh-repeat/update preservation work continues.

## Evidence and exact stage boundaries

Runtime commit `7b154a8904101f10984c1fa053b7a73ebea58411` retains stock Linux installation/startup and first sandbox/MCP receipts. Actual target36 service real UID10216 executes the unmodified stock Linux Codex0.167.0 native binary, SHA-256 `cdcb45aaa01d0f14e298985e09465aebccd47f64ecd298aea44814af7b62bbda`. MCP connects and lists six tools without model/phone actions. Both stock sandbox commands fail building bubblewrap arguments with `cannot establish app-server socket mount isolation`; the inside file is absent. That does not pass outside-write restriction.

The subsequent owner receipt `C:/Users/Aria/orca/workspaces/Olea/m2-modern-runtime/spike/m2/runtime/evidence/codex-socket-mount-a02.json` was read in full. Its exact local raw-byte SHA-256 is `a707c408c68d74099ff66ac0ca204b494235aa54cf4741088948d20e35777d87`; owner commit was not yet supplied at this assessment. Do not confuse this raw working-file hash with normalized Git object bytes.

That actual service process reports real UID10216, guest effective UID0, NoNewPrivs1 and Seccomp2. Canonical guest `/tmp` has device254:55/inode567120 and fdinfo mount ID11029. The 24-entry mountinfo view has no mount11029; it describes `/tmp` as mount11010/tmpfs/device0:30 and `/` as mount11012/ext4/device254:55. This directly demonstrates inconsistent descriptor and mount-table identities in the guest view. Stock `daemon_mounts.rs` rejects a supplied descriptor mount ID that has no matching mountinfo entry. It is consistent with the exact earlier mount-identity guard error; no altered/fabricated proc view is acceptable as a fix.

The diagnostic also ran the exact installed stock bundled bwrap, SHA-256 `77360cb751ccedc5971391444ac86a8a33c15b04d6b4a6fe45f5d25496e62c4c`, retaining all requested isolation flags:

```text
--unshare-user --unshare-pid --ro-bind / / --proc /proc --dev /dev -- /bin/true
exit 1
bwrap: Can't read /proc/sys/kernel/overflowuid: Permission denied
```

This is a second concrete prerequisite failure. It is **not a reported CLONE_NEWUSER failure or namespace errno**. The emitted diagnostic contains no numeric errno. Seccomp and Android domain observations do not identify which policy caused that read denial; no SELinux-versus-seccomp causal claim is made.

## Pinned bubblewrap source confirms an earlier mandatory read

Official current Codex tag sources:

| Source | Exact downloaded SHA-256 |
| --- | --- |
| https://raw.githubusercontent.com/openai/codex/rust-v0.167.0/codex-rs/vendor/bubblewrap/bubblewrap.c | `9bc38fb46080b6854e0c414ccb5fbd369d9d7c0230fdfa877283d31aef0c5720` |
| https://raw.githubusercontent.com/openai/codex/rust-v0.167.0/codex-rs/vendor/bubblewrap/utils.c | `c99f12bf7f74bb299e102852fb30ff76a6dfee0a2f6bfed5c840beb3249d4ddb` |

In that exact `bubblewrap.c`, `main` calls `read_overflowids()` at line2939, **before argument parsing**. `read_overflowids()` at lines2807–2826 loads `/proc/sys/kernel/overflowuid` and `/proc/sys/kernel/overflowgid`, aborting when either read fails. The utility `load_file_at()` opens and reads the supplied path; `die_with_error()` formats the current errno text and exits1. The actual receipt does not distinguish failed open versus failed read, so neither syscall is invented here. The `raw_clone` namespace setup occurs later, after clone flags are constructed at approximately lines3090–3150.

These source facts mean the supplied `--unshare-user`/`--unshare-pid` flags have not yet reached their namespace creation test. Removing namespace flags or changing user-ID arguments cannot avoid a mandatory read that occurs before flags are parsed. The early `--version` special case does skip initialization, which explains why a version check cannot establish sandbox execution.

## No evidenced remaining supported alternative

The earlier single conditional standard-runtime proposal was a genuine app-private `/tmp` identity mapping in a newly disposable rootfs, with stock guard and sandbox intact. It could only address a mount-identity mismatch. It does not remedy the now-observed protected proc read, so that proposal is **not viable as a complete fix in the current measured environment**. No mutation of existing `/tmp`, rootfs or proc views was performed by this worker.

The reviewed current official source/docs establish no supported unprivileged configuration that avoids both failures while preserving required isolation. In particular:

- TMPDIR/HOME/CODEX_HOME do not move the fixed canonical `/tmp` daemon root.
- Legacy Landlock explicitly rejects filesystem-restricted execution because it cannot isolate app-server sockets.
- The documented exec-server PID-namespace inheritance option does not remove the fixed socket guard or mandatory startup reads. It does not supply a solution to either observed failure.
- Official support for a genuine system bwrap on PATH is not evidence that another version avoids these prerequisites or works in this Android app domain. No replacement/install/probe is proposed without such evidence.

Do not fill in `/proc/sys` values, fake mountinfo/fdinfo/statx, intercept syscalls, patch Codex/bwrap, alter Android policy, use root/setuid, drop sandbox/approvals, enable full access, or consume provider budget to hide this boundary. The result constrains the tested stock0.167.0/package/runtime route; it is not proof every future upstream release or every modern Android runtime design must fail.

Actual model Unix/dependency/child, causal phone workflow, real model cancellation/approval, and update-followed-by-sandboxed Codex work remain blocked by this prerequisite. Agent/runtime ordinary update installation, preservation hashes, actual resume where feasible, independent Pi/core Unix cases and fresh-repeat recovery can continue, with their own outcomes kept distinct. A new capability/access/runtime strategy or future verified upstream change would require a new evidence basis; none is silently selected here.
