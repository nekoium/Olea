# Broad phone-file access (#13)

**USER DECISION**: The default agent can use phone files covered by Android's broad all-files grant without per-folder authorization; workspaces organize work rather than constrain reach. Android's grant and private-app protections remain. Source: [PRODUCT.md, issue triage](../../PRODUCT.md#issue-triage-decisions), current delegated access-scope assignment.

**USER DECISION**: This implementation takes care of issue #13; leave issue closure to coordinator review. Source: coordinator relay of the user's current instruction. The usefulness/UI complaints and unsuccessful Obsidian edit from #13/#14 are context, not reproduced failures or an approved redesign.

## Implementation

**OBSERVED**: `Environment.builder` checks the actual Android grant with `AndroidSharedFolders.access()` at every Linux process launch. After a successful check, `runtime/linux.sh` binds primary shared storage at `/sdcard` and its Android path, and exposes `/storage` for Android storage paths. Stock tools inherit these mappings from the shared backend. The workspace cwd, conversation identity, connected-folder bindings, private workspace files, agent homes and saved sessions retain their existing roles. No backend workspace-root expansion is necessary: that validation selects cwd, while Pi has ordinary file tools, Codex already uses full access, and Claude already uses bypass permissions.

**OBSERVED**: There is no per-folder approval for this broad access and no dependency on the phone-tools enable switch. The existing selected document-provider folder and connected-workspace features remain available. Phone bridge capabilities now report broad storage state separately from the selected document folder.

**OBSERVED**: Setup, Phone access and Environment expose the Android all-files settings route and explain the accessible paths and Android/private-data limits. Permission-required, denied and revoked states stay actionable; no grant leaves managed workspace work available. The service checks the current shared-storage path against its launch snapshot before new sessions, prompts, local commands and terminal input. A changed grant requires STOP/Start to refresh bindings rather than silently changing a running conversation's mounts. The status includes this recovery step. Android controls access by running processes; PRoot does not bypass revocation or other Android restrictions.

## Checks and evidence

**OBSERVED**: Selected device `emulator-5554`, Android API 36 x86_64. Inspected existing package identities before mutation. Created coexisting `dev.olea.broadtest` / `dev.olea.broadtest.test`; no normal Olea installation, signing identity or user data was cleared or replaced. Fixtures use only the dedicated test app's files and its exclusively created `Olea-broad-access-synthetic` shared directory. No personal-file content was inspected or edited; no model/provider requests were made.

**OBSERVED**: Focused host checks: backend TypeScript build passed; `node --test backend/test/runtime.test.mjs` passed three checks (terminal transport/lifecycle, two-conversation workspace/prompt separation, terminal startup path/cancel checks). One unrelated auth-symlink check was skipped because the Windows host cannot create unprivileged symlinks. `bash -n runtime/linux.sh` passed. Detailed ignored logs: `.setup/broad-file-access/backend-build.log`, `backend-tests.log`.

**OBSERVED**: x86_64 APK and Android-test APK compilation passed, including the final production source and isolated test identity (`.setup/broad-file-access/build-complete.log`); the final Pi test-script correction also compiled (`build-test-correction.log`). Initial direct Gradle attempt failed because cached assets were ARM64; normal `runtime/build.sh` regenerated and verified x86_64 inputs. The first test bootstrap invoked full Linux package setup and was stopped in the isolated test app while apt was still installing; the diagnostic now extracts only the packaged Linux/Node and installs stock Pi, keeping storage checks independent of unrelated apt setup. The original stopped attempt remains recorded at `.setup/broad-file-access/native-bootstrap.log`.

**OBSERVED**: All final native cases passed, each with `passed=true` and `INSTRUMENTATION_CODE: -1`:

| Case | Actual evidence |
| --- | --- |
| No grant / deny | Initial state `PERMISSION_REQUIRED`; a settings request without a grant transitions to `PERMISSION_DENIED`; `/sdcard/Download` and `/storage/emulated/0/Download` remain unbound while cwd stays `/workspace`. |
| Granted | Actual Android all-files AppOp set to allow for the isolated test installation; `AndroidSharedFolders` reports `AVAILABLE`; ordinary `ls`, `cat`, and shell write reach the synthetic note through `/sdcard` and `/storage/emulated/0`; stock Pi 1.5.2 `createReadTool` and `createEditTool` read/edit the same file outside `/workspace` without a model; Android reads back `stock edited`; a connected workspace still has its own cwd and independent `/sdcard` reach. |
| Revoked | The isolated installation's actual grant is set to ignore; state reports `PERMISSION_REVOKED`; the next Linux launch has no broad binds and managed `/workspace` remains usable. |

**OBSERVED**: Native receipts are `.setup/broad-file-access/native-denied.log`, `native-granted.log`, and `native-revoked.log`; minimal bootstrap with stock Pi passed (`native-bootstrap-minimal.log`). The first granted run failed because the diagnostic used an older Pi edit argument shape; this was a test-script error, corrected to Pi 1.5.2's `edits` array. The failed receipt is retained at `native-granted-initial-failure.log`. The granted receipt includes `stock Pi read/edit outside workspace: pass` and `connected cwd separate`. Benign Android linker-configuration warnings remain visible in all receipts.

**OBSERVED**: Grant/deny/revoke were exercised through real Android permission state and fresh Linux process launches, not mocked grant checks. The permission settings screen itself was not manually exercised. The test installation's final all-files state is revoked; synthetic shared files and test processes were cleaned up. Its isolated runtime remains installed for review. The original ARM64 generated asset set/ABI marker was restored from verified local input caches after the x86_64 build; no generated assets are part of the commit.

## Limits and handoff

**OPEN**: This is source implementation, not a published APK update. Physical phone acceptance, OEM permission-screen UX, service-level STOP/Start after a live grant change, secondary/removable volumes, actual read-only/unmounted storage and in-flight revocation during an already-running tool remain unverified unless recorded above. Other apps' private data remains outside the grant; shared-storage execution/symlink limitations remain. No scheduled cleanup engine, extra provider spend or UI redesign was added. The earlier failed Obsidian interaction and UI/responsiveness complaints were not reproduced and are not claimed fixed.

**OBSERVED**: Central progress is intentionally left to the coordinator to avoid concurrent ownership. Coordinator should record the commit, checks and these limits in `docs/PROGRESS.md`, review #13 closure, and keep unrelated UI discussion edits intact.
