# Roadmap to 1.0.0

Target: release Olea 1.0.0 by November 15, 2026. Publish useful alpha builds along the way. Design, implementation, and validation receive the main effort; packaging and publication remain short final operations.

This roadmap records interim release scope, milestones, and the agreed schedule. PRODUCT.md owns the full intended product scope. The tech stack, architecture, and detailed implementation plan remain under discussion. PRoot is the working runtime direction, subject to compatibility evidence; it is not an approved implementation design.

## Technical feasibility priority

Current technical discussion prioritizes validating the foundation before further production UX implementation. Use [TECH_STACK.md](TECH_STACK.md) as the candidate stack, without treating it as a validated architecture. First establish stock Pi Unix work and ordinary updates, direct Android bridge behavior, agent-driven phone use, and a combined workflow. Probe Codex and Claude compatibility early. Keep the baseline Linux environment fixed across Pi versions and report independent outcomes, retries, workarounds and blockers. Existing phone-use acceptance in PHONE_USE_TESTS.md remains authoritative.

The Node integration backend and production UI framework remain open. No runtime or agent result follows from emulator readiness alone.

## Release scope

Olea 1.0.0 targets a complete on-phone experience for Pi, Codex, and Claude Code. Build environment management and phone-use capabilities within Olea first; extracting the reusable Olearia foundation follows 1.0.0:

- Local agent execution without a desktop, server, root, or an active ADB connection during normal use. Model requests may require internet access.
- Guided environment preparation and authentication, with actionable errors and recovery paths.
- Agent selection, sessions, streaming replies, tool output, interruption, and saved-session continuation where supported by each agent.
- Resume the last active session when opening the app by default, with a setting to open a fresh chat instead. Rationale: support both continuation and starting a separate task without imposing one entry preference on everyone.
- Keep workspace details and files accessible on demand, not displayed by default in chat. Rationale: preserve space for the conversation. Parallel Conversations / Workspaces destinations are selected; selecting a workspace switches to a filtered conversation list. User's reason: this keeps location clear, whereas nested navigation risks users getting lost. See [workspace-navigation candidate A](.superpowers/brainstorm/9291-1794303031/content/workspace-navigation.html).
- A shared workspace and usable shell tools, including representative dependency installation.
- Basic permission-controlled phone inspection and actions, with a user-accessible stop control.
- Persistent user files and clear behavior when processes stop or the app restarts.

Support means completing real workflows through Olea, not merely installing three CLIs. Agent-specific and Android-specific limits must be tested and stated clearly.

## November 9–10: design and evidence

Settle product behavior and architecture through discussion and parallel feasibility experiments.

- First define the intended interface and functionality using visual candidates. Then discuss and document the tech stack and architecture around those workflows. Link visual studies from the documents with their selection status; PRODUCT.md contains the [visual decision references](PRODUCT.md#visual-decision-references).
- Keep PRODUCT.md, ROADMAP.md, and PROGRESS.md synchronized with each discussion turn, separating decisions, proposals, and open questions. Record only reasons explicitly mentioned in this chat; do not infer rationales or reconstruct reasons for inherited decisions from other chats. Record assumptions or revisit conditions only when discussed, distinguishing proposals from agreements. Reason: changing technology can change whether a decision's stated justification still holds.
- Resolve new-conversation setup placement using [interactive study 05](.superpowers/brainstorm/9291-1794303031/content/new-conversation-setup-05.html): workspace and agent controls beside the draft versus a setup sheet first. Both are proposals; default selection policies remain open. This discussion does not authorize product implementation.
- Define environment ownership, package installation, workspace sharing, credential boundaries, runtime updates, and recovery.
- Define agent integration boundaries for sessions, events, tools, cancellation, and authentication without assuming identical behavior across agents. Different agents use separate sessions. To use another agent, users start a new session; in-session switching and cross-agent handoff are not requirements. User's reason: a new session already meets that need.
- Define the Android phone bridge, permission checks, stop behavior, and capability reporting. First establish a concrete user-facing phone task for 1.0; its required actions remain under discussion.
- Consult Orca's actual session interactions as a design reference where useful. This does not add Orca integration to release scope.
- Probe Pi, Codex, and Claude Code in parallel. Establish execution, authentication, a tool action, and an interface suitable for integration.
- Test competing runtime approaches when evidence is uncertain; record measurements and limitations.
- Validate on the physical phone early, rather than postponing ARM64 and device-specific failures until the end.
- Write and review the architecture design, then prepare the implementation plan.

Outcome: an approved design grounded in experiments, explicit compatibility findings for all three agents, and concrete acceptance scenarios. Investigate unresolved blockers immediately and make any necessary scope changes explicit.

## November 11–13: build complete workflows

Implement the agreed design using parallel workers with clear interfaces and frequent integration.

- Build local environment management and phone-use capabilities inside Olea alongside its user experience. Do not make Olearia extraction a release prerequisite.
- Develop the three agent integrations in parallel once their shared contracts are established.
- Complete fresh install → environment preparation → authentication → session → tool execution flows.
- Connect phone tools to the supported agents and exercise harmless end-to-end tasks. Alpha phone-use acceptance prioritizes opening an app through an Accessibility click; an intent launch alone does not meet that test. User's reason: Accessibility is the most important alpha capability.
- Implement persistence, interruption, process failure handling, permission changes, and installation retry paths as part of the relevant features.
- Test each integrated increment and review architectural assumptions as evidence changes.
- Publish alpha APKs whenever they provide a useful, testable milestone; publication does not require a separate development phase.

Outcome: all three agents perform real tasks locally through Olea, use the shared workspace, and access the basic phone bridge. The full experience is available for intensive testing.

## November 14–15: validate and harden

Concentrate on real use, integration defects, and recovery. Avoid optional feature expansion.

- Test clean installation, environment preparation, authentication, and session workflows for all three agents.
- Verify dependency installation, file persistence, agent switching, and saved-session continuation where supported.
- Run at least one simple successful test for each phone-use category: intents/app links, structured Android APIs, files/media, notification access, Accessibility, screen capture, and app-specific integration. User's reason: full validation should cover each category. Proposed fixtures and success evidence are in [PHONE_USE_TESTS.md](PHONE_USE_TESTS.md); specific fixtures are not yet approved.
- Browser scenario in full validation: open the user's browser to a supplied URL and verify that the browser reached the intended destination. This was the user's first concrete phone-use example; Accessibility app launching now has alpha priority.
- Phone-use access must stay within permissions and special access users can grant normally on a stock personal Android phone; no system privilege is implied.
- Exercise cancellation during tool and phone actions, permission revocation, app switching, screen lock, process termination, and reboot.
- Verify that failure states explain what stopped, what persisted, and how to recover.
- Repeat core scenarios on the available physical Android 14 phone after confirming its ABI. Do not infer ARM64 compatibility from emulator success.
- Fix acceptance failures and review the resulting architecture for security, data-loss risks, and unnecessary complexity.
- Complete PRODUCT.md from the agreed purpose and observed behavior. Keep installation guidance and known limitations accurate as alpha builds evolve.

Outcome: release evidence for the core workflows, resolved material defects, and explicit user-relevant limitations.

## November 15: release 1.0.0

The release milestone overlaps the final validation phase; it is not an additional day or a full day reserved for publishing.

- Finish the acceptance review and any remaining release-blocking fixes.
- Produce the versioned 1.0.0 APK and tagged source.
- Publish the APK with concise installation instructions, release notes, and known limitations.
- Record remaining work and measured compatibility findings for the next iteration.

The date is a delivery commitment, not evidence of correctness. Surface blockers as they emerge; do not silently substitute CLI installation for usable agent support or hide failing core workflows behind the version number.

## Working method

- Use parallel agents for independent compatibility probes, agent integrations, phone capabilities, app work, and targeted reviews.
- Keep integration ownership clear and merge small working increments frequently.
- Run tests throughout design and implementation. November 14–15 deepens validation rather than starting it.
- Keep documentation current so release day does not become a documentation backlog.
- Use existing delegation tools; building an automatic fleet platform is outside this release.

## After 1.0.0

Extract Olearia from Olea as a reusable foundation for local environment management and permission-controlled phone use. Its module boundaries and distribution should follow the validated Olea implementation. A separate manager app remains undecided; extraction does not imply separate distribution.

## Deferred scope

- Orca host compatibility and desktop integrations.
- Desktop interfaces and multi-agent task orchestration.
- Independently distributed Olearia manager app; no separate distribution decision has been made.
- Broad device certification, elaborate customization, and guaranteed unattended operation through every Android lifecycle event.
- Google Play distribution.

## Prepared development environment

The Android 16 / API 36 x86_64 Google APIs emulator Olea_API_36 is installed and boot-verified with hardware acceleration. This is a development baseline, not a minimum supported Android version. The available Android 14 phone supplies a later physical-device compatibility target. Tooling details and verification results are in PROGRESS.md.
