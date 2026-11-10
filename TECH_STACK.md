# Technical feasibility stack

Status: agreed candidate for feasibility testing, not a validated production architecture. Product requirements remain in PRODUCT.md; phone-use priorities remain in PHONE_USE_TESTS.md.

## Objective

Maintain the Android runtime, rather than private ports of individual agents. Supported agents must install and update through their ordinary upstream-supported channels without recurring Olea patches or coordinated app releases.

Two independent acceptance areas are required:

1. Stock agents install, run and perform expected Unix work, including tools, dependencies, child processes, saved sessions and ordinary updates.
2. Agents discover the supplied phone capabilities and actually use them successfully, with independent verification of Android state.

## Candidate components

| Responsibility | Candidate | Decision boundary |
| --- | --- | --- |
| Android host, permissions and services | Kotlin with Android SDK | Selected for the feasibility experiment; production acceptance depends on results. |
| Unix environment | Minimal Ubuntu Base through Termux PRoot | First candidate to test. Debian remains an alternative. |
| Agent runtime | Standard upstream Linux Node.js compatible with tested Pi releases | No Android-specific Pi port or replacement native dependencies. |
| Integration host | One shared TypeScript/Node backend inside the Linux environment | Selected feasibility direction: manage persistent agent processes through agent-specific adapters. |
| Phone bridge | Kotlin Accessibility service and ordinary Android APIs/intents | Preserve the capability scope and alpha Accessibility-click acceptance in PHONE_USE_TESTS.md. |
| Pi phone tools | Small TypeScript extension through supported Pi APIs | Integration code, not modification of Pi. Must test registration and actual agent use. |
| Automated runner | Host-side Node.js/TypeScript plus ADB | Test infrastructure only. Agent phone actions must use the bridge, not host ADB commands. |
| Test presentation | Minimal native test harness and standalone HTML results | Disposable feasibility tooling, not production UX. |
| Production UI | Unselected | Existing UI discussion remains separate; no framework decision is implied. |
| Future integrations | Codex app-server and Claude Agent SDK | Probe stock installation/startup and integration early; Pi success is insufficient evidence. |

## Why Kotlin is proposed

Kotlin is a programming language with first-class Android tooling and direct access to Android SDK APIs. Services, Accessibility, permissions, lifecycle callbacks and process management are central to this experiment. Kotlin avoids an additional cross-language bridge for these responsibilities.

Java can implement the same Android functions and is a credible alternative. Flutter and React Native can provide the UI, while native Android components still implement the platform responsibilities. Rust/C++ can support native utilities but add interoperation work for Android services and permissions. These alternatives are not technically disqualified; Kotlin is proposed because the immediate work is Android platform integration. This reasoning does not select Jetpack Compose or reject Flutter for the eventual UI.

## Selected direction: shared Node integration backend

The agent's Node runtime and an Olea integration backend are different components. Pi needs its Node runtime regardless of whether Olea adds a backend.

A backend would be a long-lived Node process inside the Linux environment, owned by the Android service. It would manage agent adapters, invoke JavaScript SDKs, and translate messages for the Android client. Persistent means across multiple requests while the service is running, not guaranteed survival after Android terminates it.

Without this backend, Kotlin can launch Pi and exchange RPC messages directly. Codex app-server also exposes a structured protocol. Claude's official JavaScript SDK makes Node useful; a small Node bridge dedicated to Claude is another option. A single shared backend is not required merely because one adapter needs Node.

Tradeoff: Node makes JavaScript SDK use straightforward, but adds startup, memory, process supervision, another communication boundary and recovery work. Kotlin-only avoids that process for Pi but does not directly import JavaScript SDKs.

The user selected the managed backend direction after discussing its value and Android resource constraints. Use one shared backend, with a Pi adapter that maintains a Pi subprocess using `--mode rpc` and stdin/stdout. Saved conversations do not require live agent processes. Idle shutdown and concurrency policies remain proposals to validate. The backend owns agent/session integration; Kotlin owns Android permissions, phone tools and process supervision. No Electron, desktop editor, browser fleet or desktop indexing infrastructure is implied.

Measure per-process and total memory, startup, idle CPU, streaming behavior, concurrency and descendant cleanup. Compare direct Pi against managed Pi using the same workload where practical. Emulator resources can hide problems; constrained runs and later physical-phone thermal/battery measurements are needed.

## Original code and licensing

Use MIT for original Olea code. Verify the license and provenance of third-party material before incorporating it. Architectural research informs the design; it does not change the license of the researched material.

The MIT license for original code does not relicense third-party components or reference snapshots. PRoot, Linux packages and other redistributed dependencies retain their own licenses and may require source availability, notices or other distribution actions. Record component versions, source URLs, hashes, licenses and any obligations before publishing an APK. Research source snapshots remain reference material, outside the original-code MIT grant.

## Evidence required

- Android executable packaging and target SDK strategy. Target 28 is a candidate based on DSH Go, not a proven long-term solution.
- Stock Pi across selected releases, native dependencies, Unix work, RPC, cancellation, resume and ordinary updates on one fixed base.
- Direct bridge tests followed by agent-driven phone tasks and one combined Unix/phone workflow. Verify outcomes independently of agent claims.
- Codex and Claude stock installation/startup and usable integration entry points.
- Lifecycle, process-tree cleanup, state recovery and environment update preservation.
- ARM64 phone validation after confirming device ABI; emulator x86_64 success cannot establish it.

The current emulator baseline is Android 16/API 36; the available physical phone runs Android 14. Do not replace this baseline with the older handoff's API 34 proposal.

## Automation proposal

Use bounded cases with timeouts, independent assertions, captured protocol events and redacted diagnostics. Separate download/model outages from runtime failures. Keep the Linux base fixed while changing Pi versions. Record retries and workarounds; never silently patch an agent to convert a failure into a pass.

Use the user-authorized provider and model order from local untracked configuration. Never store API keys in documentation, artifacts, command logs or Git.

No agent execution or phone-control feasibility result is established by this document. The user authorized a separate session to build and test the disposable feasibility harness described in FEASIBILITY_BRIEF.md. Keeping spike code as production implementation requires a separate decision.
