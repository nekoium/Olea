# Feasibility checkpoint and manager handoff policy

User instruction recorded during M2. This applies to following managers as well as the current manager.

## Goal

Prove a viable backend base that actually works on Android under this maintenance constraint:

> We can tolerate maintaining the Android runtime. We want to avoid maintaining a private port of every agent.

The base must support different stock-agent installations and ordinary upstream updates, real Unix/dependency/file work, and the phone-use set in [PHONE_USE_TESTS.md](../../PHONE_USE_TESTS.md). Preserve Kotlin permission/lifecycle authority and one shared TypeScript/Node integration backend. Keep production UX outside this feasibility experiment. A CLI startup, completed protocol turn or model claim alone does not establish a working workflow.

## Checkpoint behavior

1. Save meaningful progress locally before reporting or handing off: code, exact artifacts/versions/hashes, retained attempts and failures, measured outcomes, remaining work, active process/device ownership, credentials policy, and consumed/reserved request budget. Preserve concurrent work and historical evidence.
2. If the goal is reached, report the actual result and its limits in plain language.
3. If a genuinely vital changed constraint blocks the goal, explain the decision in plain language with the evidence and credible bounded alternatives. Routine implementation choices, provider transport failures and unexecuted independent cases do not require user approval.
4. **Reach the current manager's declared interim checkpoint before handing off.** Passing only part of it, exhausting a worker's preparation, or preferring a context reset is not sufficient. Once it is reached, if the final goal remains, define the next manager's explicit bounded interim checkpoint and hand off to a fresh manager and worker team. Give the next manager the exact existing Olea root/repository and saved checkpoint; do not create duplicate repositories or invent remotes/trackers.
5. Transfer the sole emulator mutation lease only after the old owner's current operation is settled or its uncertainty is explicitly recorded. Never run two mutation owners. Never automatically replay uncertain phone effects or provider turns.
6. Verify the new manager/team launch and prompt delivery before retiring the old team. Then clean up retired sessions through supported exact-session orchestration actions. Preserve worktrees, commits, APKs, rootfs, caches and evidence; session cleanup is not authorization to wipe data or prune worktrees. Do not stop an in-flight process by assuming that silence proves exit. Keep the new team available for delivery.

## Lean validation

- Use the smallest tests that resolve the acceptance question. Group compatible assertions into a bounded workflow; retain independent oracles.
- Reuse established deterministic/core and source-validation evidence. Do not rerun a whole suite after documentation, manifest or unchanged source checkpoints.
- Add or rerun focused tests only for changed behavior, observed failures, uncertain integration or a required acceptance gap. Do not expand helper frameworks or acceptance counts to create apparent progress.
- Count top-level test prompts, actual observed model requests/tool rounds and usage separately. Preserve first failures and bounded retries. A worker-chat provider failure does not justify replaying a test-provider request.
- The existing case matrix records coverage, including blocked and untested work; it is not an instruction to run every case redundantly. Do not remove required acceptance to obtain a green result.

## Recovering a provider-failed structured worker

`orchestration send` can queue a message while the existing structured chat remains **Paused**. Delivery is not continuation proof. Open that exact worker's existing chat and use the actual **Resume** control when paused. Verify new **Working / Agent is responding** state or subsequent tool activity. Preserve the same session, assignment and ownership. Do not create replacement workers merely because of a transport failure.

The current CLI exposed no equivalent structured-chat resume verb at Orca 1.4.250. The manager used Orca computer use for this control, after loading its version-matched guide. Prefer a supported programmatic resume command if a later executable documents one.
