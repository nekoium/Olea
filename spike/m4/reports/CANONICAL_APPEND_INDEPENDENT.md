# M4 supplement: original rollout append diagnosed, preservation still failed

**The original143981-byte rollout contains the exact143382-byte preserved old rollout followed by one599-byte `thread_settings_applied` event. Independent read-only SQLite queries confirm the copied home's thread index still names the original canonical rollout. Original canonical preservation remains FAIL.** This diagnoses the measured mutation without rewriting earlier results or restoring historical bytes.

Assessed runtime `5575d5e`, imported as `3a572f4`, after interim assessment `a9629a7`. Task `task_2c03fabe490b` / dispatch `ctx_da13f4de88f0`, independent worker `8a0e3f58-54c3-4e78-8b2a-a03d60598a23`. [Machine evidence](../evidence/CANONICAL_APPEND_INDEPENDENT.json) pins and verifies all **six new Git artifact references** using existing verifyArtifacts; predecessor210/291 and the previous14-reference batch were not rerun. Historical readiness and interim report remain unchanged.

## Independently verified retained bytes

Used exact5575d5eGit blob bytes, avoiding checkout newline conversion. Both exported transcript byte lengths/SHA256 match runtime export metadata and the earlier recorded old/new hashes:

| Retained export | Bytes / JSONL records | SHA256 |
| --- | --- | --- |
| copied-unchanged-rollout.jsonl |143382 /61|345b0884b097ec53e8fad3431de2b5f47d59b32a5212557227777869e4d7d284|
| original-changed-rollout.jsonl |143981 /62|0a5b101f13c8974a79ac1a6308243d75b539da57c738d19f62e696b43463b4f0|

The old export equals the first143382bytes of the changed export exactly. The599remaining bytes parse to exactly one JSONL event, deep-equal to the runtime diagnosis record: timestamp `2026-11-11T08:00:16.196Z`, ordinal61, outer `event_msg`, payload `thread_settings_applied`, thread `01a1c6d2-bf9b-7670-a6c0-49be86a0f916`. Applied settings name the copied workspace `/workspace/m4-update-a01/workspace`, model gpt-6.1-terra, provider olea, approval never and disabled permission profile. This is a settings event, not another model turn or a repaired workflow. The prefix comparison establishes no removal or alteration within the retained earlier bytes; it does not establish byte-identical preservation of the whole original file.

## Independent SQLite attribution and causal limit

Read only the runtime worker's already exported local `.setup/canonical-diagnosis/{original-changed,copied-unchanged}-state_5.sqlite` plus corresponding WAL/SHM. Copied those six files into this worktree's task-local temporary directory, queried local copies with Node SQLite `DatabaseSync(...,{readOnly:true})`, then removed only those temporary copies. Before/after hashes confirm runtime worker's original exported snapshot files were unchanged. Exact snapshot byte lengths/hashes and selected query results are retained in machine evidence; full databases are not added to Git.

Both rows match the runtime diagnosis exactly for id, rollout_path, cwd, cli_version and updated_at. Both `threads.rollout_path` values point at:

`/opt/olea/evidence/attempt-1794337061452-dffc52fe/state/codex/case/home/sessions/2026/11/10/rollout-2026-11-10T18-57-42-01a1c6d2-bf9b-7670-a6c0-49be86a0f916.jsonl`

The original row retains original workspace, cli_version0.167.0, updated_at1794337122. The copied row names copied cwd `/workspace/m4-update-a01/workspace` while retaining that original rollout path and cli_version0.167.0; its updated_at1794384016 matches the append's second. Metadata cli_version is historical row data, not evidence that the updated executable remained0.167.0.

Existing exact33bd1d3protocol source calls stock thread/resume on this same thread with copied cwd. The original path in the copied index, copied-cwd append and matching protocol time strongly corroborate that copied-home resume followed its retained absolute rollout reference and appended there. No syscall trace, pre-resume database snapshot or upstream path-resolution inspection is retained, so this is corroborated causal attribution rather than an independently traced file-open sequence. Sequential database/WAL/SHM exports are also not an atomic live Android snapshot; successful local queries establish the retained snapshot row contents only. Copying CODEX_HOME did not isolate all paths it referenced.

## Credential checks and preserved failure

Neither transcript was printed or opened in a user-facing tool response. An in-memory comparison against credential-bearing values from the sole authorized absolute-root provider configuration found no matches in either exact export; no credential value or digest was output or stored. Independent scans also found zero tested long provider-key/Bearer patterns. Runtime export source5575d5e `preserve-changed-canonical.mjs` separately asserts absence of actual native provider apiKey and bridge token before writing each transcript. The current bridge token is unavailable offline for another independent exact comparison; arbitrary unknown secret formats are outside these bounded scans. No suspected credential was found by these checks.

Original preservation FAIL is retained even though the diagnosed append preserves prior transcript content. Do not restore/reset the canonical file or relabel it unchanged. The earlier ordinary copied-prefix install and direct/no-model protocol results remain narrow passes. This new batch adds no measurement of the other six canonical files, old binary, complete workspace, protected modes or repaired cleanup; any equality claim for those must cite its own retained receipt. Prior batch separately measured six canonical hashes, Pi session/resume hashes and protected equality; post-update old-prefix hash proof was missing there.

Current M4 allowance is **9authorized /0consumed /0allocated /9unallocated**, predecessor consumption9immutable and cumulative9sofar. This independent batch made zero model requests, agent launches, phone calls or device actions and acquired no runtime lease. Local read-only artifact inspection is distinct from normal phone execution. No full suite, provider replay/fallback, runtime implementation or production UX work occurred; Git only, no Rim as instructed.

Runtime repair compiling is not repaired Android acceptance. Focused repaired recovery, actual final process/grant/data state and runtime lease disposition remain pending a separate immutable batch. Original model failures and missing Pi URL/files/repaired notification/completed capture_result/image input remain; full phone/backend goal is incomplete. PhysicalAndroid14 ABI/ARM64, battery/thermal, broader updates and universal process cleanup remain unproved. Session/worktree remain open.
