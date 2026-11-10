# Feasibility build and test brief

Status: proposed brief for a separate session. The user asked to review the scope before any session is opened. Do not launch the session from this document alone.

## Goal and boundary

Build a disposable experiment, not production Olea UX, to determine whether a stable Android-hosted Unix environment supports ordinary upstream agents without private ports or recurring patches, and whether those agents can use permission-controlled phone tools.

Read PRODUCT.md, TECH_STACK.md, PHONE_USE_TESTS.md, ROADMAP.md, PROGRESS.md and AGENTS.md. Preserve current product requirements and separate proposed experiments from agreed acceptance. Android 16/API 36 x86_64 Olea_API_36 is the prepared emulator baseline. Physical Android 14/ARM64 validation remains separate pending device connection and ABI verification.

## Architecture to exercise

Kotlin Android host supervises one shared TypeScript/Node integration backend inside minimal Ubuntu Base through PRoot. The backend manages persistent stock agent subprocesses using agent-specific adapters. Pi first uses `--mode rpc` over stdin/stdout; supported Pi extensions register phone tools. Kotlin enforces the phone bridge's permissions. Production UI toolkit and idle-session policies are unselected.

## Required investigation and experiment sequence

1. Inspect current toolchain, emulator and repository. Confirm reproducible paths and acceleration. Use Rim for substantive development when safe, preserving existing work. Do not wipe an existing emulator or user environment. Resource tuning is authorized if needed; record allocation and measurements.
2. Create original minimal harness code under a clearly named spike directory. Verify artifact hashes and record source/license provenance. Establish Android executable packaging and target SDK behavior explicitly; no implicit assumption that target 28 or PRoot works on this emulator.
3. Validate Linux shell, supported upstream Node, Git, DNS/TLS, package installation and child processes before agent requests. Keep environment fixed when comparing agent releases.
4. Install stock Pi through its upstream-supported channel. Test one current stable release and two meaningful earlier releases, selecting a Node version compatible with the matrix or explicitly recording incompatible combinations. Exercise structured replies/events, independent file and shell outcomes, representative dependency use, session restart/resume and cancellation/descendant cleanup. Test an ordinary upgrade to the baseline. Do not edit Pi, replace native dependencies or add version-specific shims silently.
5. Check phone operations directly before model-driven tests. Alpha must include opening an app through Accessibility click, not merely an intent. Follow PHONE_USE_TESTS.md for category scope and distinguish proposed fixtures. Use harmless local fixtures with generated task values and independent outcome assertions; keep oracle state inaccessible through the registered agent tools. Validate revocation and stop. Agent actions must use the Android bridge, not host ADB. ADB may install, observe, reset disposable test state and configure development permissions where supported.
6. Verify Pi sees tool descriptions and chooses tools to perform tasks. Include one combined Unix/phone workflow. Agent claims alone are not success evidence. Record failed attempts and retries. Tool output and model conversations must be treated as untrusted input.
7. Probe stock Codex and Claude installation, startup and supported integration entry points early enough to expose fundamental architecture blockers. Missing authentication or subscriptions is blocked, not passed. Do not infer their compatibility from Pi.
8. Measure host/backend/agent/PRoot memory and total cost, cold startup, idle CPU, streaming responsiveness, one and two active sessions, output bounds and process cleanup. Compare direct Pi with managed Pi for the same workload where practical; do not build a second full architecture merely for a benchmark. Repeat core work with constrained emulator allocation. Real thermals/battery require the physical phone.
9. Exercise app switching, screen lock, child-process failure and whole-app process death. Distinguish live execution from restored transcript/workspace. Never automatically repeat uncertain phone actions. Inspect update preservation without destroying user state.

## Automation and credentials

Use bounded timeouts, machine-readable pass/fail/blocked/skipped results, independent assertions, redacted logs and resumable test phases. Network/provider failures must be separate from runtime faults. A failed prerequisite skips dependent cases while independent cases continue. Bound model calls, output retention and retries; report usage where available. Do not launch an unbounded AFK retry loop.

The user authorized a custom OpenAI-compatible endpoint and model order (gpt-6.1-terra, then gpt-6.1-sol). Obtain credentials through secure local untracked configuration during session preparation. No key is included in this brief. Never print credentials, embed them in launch prompts, or commit request headers and raw authentication responses. Verify the provider API format before using it; do not assume a particular Pi provider setting.

## Original implementation and dependency licenses

Original Olea spike code uses MIT. Implement against official Android APIs and supported upstream agent interfaces. Verify third-party license and provenance before incorporating material.

Research snapshots retain their original licenses. Bundling PRoot and Linux packages can carry GPL/LGPL and other obligations even when Olea's original code is MIT. Maintain an inventory of versions, hashes, origins and license obligations. Do not claim a distributed APK is wholly MIT. No publishing is included in this experiment.

## Deliverables

- Reproducible build/run commands, environment manifest and exact tested versions.
- Small original harness and runner, clearly marked disposable.
- Machine-readable results and redacted failure evidence with independent outcome checks.
- Markdown report and self-contained HTML explanation: what passed, failed or remains blocked; actual overhead; all workarounds; recommendation to accept, revise or reject the candidate stack.
- Explicit limits: emulator ABI vs ARM64, model reliability vs deterministic checks, normal permissions vs development provisioning, and process survival vs recovery.

Do not label a missing physical-device test as passed. Do not promise completion by a wall-clock deadline or silently change acceptance to get green results. Do not expand into production chat UX. Keep the research material and existing product decisions intact.
