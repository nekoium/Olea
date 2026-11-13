# M2 coordination record

Status: new team activated after independent workspace and dispatch creator-session verification. Run coordinator projection remains limited. This is not runtime feasibility evidence.

## Authority and baseline

The user transferred full delivery ownership to fresh manager session `pi_1d9a3114_30c1_4a4f_b8a6_22cd565c2373` in the existing Olea root checkout. No approval from the previous manager is required. The autonomous bounded mission and acceptance remain in [NEXT_MILESTONE_HANDOFF.md](NEXT_MILESTONE_HANDOFF.md). No tracker, remote, publishing, production UX or scope-classification workflow is introduced.

Initial inspection found a clean `master` at `1775d536fb8650f7335729af90530733984614ea`, including M1 tag `feasibility-m1` and closeout `d9457eb`. Git has no remote. Historical reports and runtime evidence remain unchanged. The prepared emulator's last closeout was already off; no current Android state is inferred from that historical observation.

## New team

Run: `run_aa0011145bf9`, objective “Olea M2 modern Android runtime and stock Pi/Codex app-server feasibility”. Orca 1.4.250, executable `C:/Users/Aria/AppData/Local/Programs/orca/resources/bin/orca.exe` selected from this session's `ORCA_CLI_COMMAND`.

| Track | New child workspace | Task | Dispatch |
| --- | --- | --- | --- |
| Modern runtime | `C:/Users/Aria/orca/workspaces/Olea/m2-modern-runtime` | `task_504381bfa5d3` | `ctx_dc93a74c270c` |
| Stock Codex adapter | `C:/Users/Aria/orca/workspaces/Olea/m2-stock-codex` | `task_e642cfcfa230` | `ctx_e9ea2c11901f` |
| Independent repro/evidence | `C:/Users/Aria/orca/workspaces/Olea/m2-repro-evidence` | `task_7b818dcb76f7` | `ctx_4a3a6240027c` |

Each launch used `worker-start --worktree new-child --agent pi --keep-open --repo id:d55c3648-a5ff-4d7b-96d8-e80071701415 --base-branch master`, explicit new Run and actual manager handle. Receipts report ready, observed turn start, accepted input and retained sessions. Old workers remain untouched.

All three `worktree show` records independently verify exact root parent ID `d55c3648-a5ff-4d7b-96d8-e80071701415::C:/Users/Aria/Projects/Development/Olea`, root instance `9d97b621-2073-4d97-9dd7-9cf9d82b9ef0`, same registered repository, and initial head `1775d53`.

Full `run-show` and `run-current` project `coordinator_handle: null`; full worker projections show `parent: null`. Those projections alone do not establish session parentage. The evidence worker identified a separate supported inspection: `orchestration dispatch-show --task <task-id> --json --full`. Manager independently ran it for all three tasks. Every record explicitly names `creator_orca_session_id: pi_1d9a3114_30c1_4a4f_b8a6_22cd565c2373`, its fresh `assignee_orca_session_id`, `run_id: run_aa0011145bf9`, and depth 1. Assignee sessions are runtime `ad49162f-2db0-4879-a32c-86461b7a9675`, Codex `cc044b90-f129-4179-9b83-3bf705a89d12`, evidence `9c05a62d-0bee-4e57-8cf0-9458a2938b92`. This independently verifies creator-session/dispatch/Run association, separately from workspace lineage. Worker messages also arrived automatically in the new manager session. It does **not** prove a non-null Run-level coordinator field or repair its projection; the evidence worker correctly retains that narrower limitation. No speculative takeover, reset or replacement Run was attempted. The CLI session fence additionally identifies this manager's actual caller; a mismatched prefixed `--from` was refused before any request. After checking explicit creator-session evidence, manager activated all three workers through their exact dispatches.

Runtime worker's initial turn reported providerRejected “Connection error”; task remains assigned to its exact chat. Manager sent one bounded resume message to the same dispatch, preserving the first failure. No duplicate worker was launched.

## Ownership and budgets

- Runtime worker owns `spike/android/**` and new `spike/m2/runtime/**`. Manager explicitly activated its sole emulator mutation lease after verifying dispatch creator-session evidence. It must freshly observe current state before mutation.
- Codex worker owns `spike/backend/**`, new `spike/tests/codex/**` and `spike/m2/codex/**`. Preserve Pi interface/tests. No Android execution by this worker.
- Evidence worker owns new `spike/tests/m2/**`, `spike/m2/evidence/**` and `spike/m2/reports/**`. Manager owns integration and root progress updates. Other workers send Android payloads through manager/runtime owner.
- Eight top-level provider-backed prompts total, including retries/fallbacks. Two allocated to Codex host workflow on activation; six remain unallocated. No runtime/evidence prompt allocation yet. Worker-agent coordination traffic is not a test-provider workflow pass or test budget usage.
- Bounds: 12 tool rounds per prompt, install/build 240 seconds per attempt, initialize 30 seconds, turn 120 seconds, stream idle 45 seconds, frame 256 KiB, retained diagnostics 1 MiB per case. One diagnosed install/network retry; explicit fallback only within allocation. Count HTTP/model requests and usage separately. No automatic replay of uncertain effects.
- Credentials are read programmatically only from the single user-authorized ignored configuration. Never embed secret values in messages, arguments, tracked files or retained logs. No Claude requests.
- Preserve historical app/rootfs and evidence. Fresh provisioning requires a separately identified disposable package/data destination. No baseline wipe or normal-use ADB dependency.

## Workspace checkpoints

Rim initial `status` reported no root for the current project context. `rim spawn --tag m2-manager-start` then succeeded, node `nf6bf529a79c1206`. Git remains the reliable local checkpoint. No destructive Rim repair or cleanup was attempted.
