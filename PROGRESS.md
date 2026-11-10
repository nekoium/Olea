# Progress

## Managed backend direction and test-session preparation

- Selected one shared TypeScript/Node integration backend supervised by a Kotlin Android host for feasibility testing. Persistent Pi subprocesses communicate through RPC; saved conversations need not keep agents alive. Production UI, idle shutdown and concurrency policy remain undecided.
- Added resource measurements to the evidence scope: per-process/total memory, startup, idle CPU, streaming, concurrency, bounds and cleanup, with constrained emulator testing and later physical-device validation.
- Original Olea code is intended to use MIT; third-party dependencies and research snapshots retain their licenses. Dependency provenance and distribution obligations remain separate from the project's license.
- Prepared FEASIBILITY_BRIEF.md covering Unix compatibility and ordinary updates, direct and agent-driven phone tests, independent verification, future-agent probes, credentials, automation limits, lifecycle and performance.
- The user requested scope review before opening another session. No build-and-test session has been launched. No test code, dependencies, credential files or device changes were created in this documentation turn.

## Technical discussion — candidate stack recorded

- Recorded the accepted feasibility candidate and unresolved backend boundary in TECH_STACK.md. Kotlin is recommended for Android hosting; minimal Ubuntu/PRoot is the first runtime candidate. Production architecture and UI toolkit remain unvalidated.
- Preserved the maintenance goal: support ordinary upstream agents and updates without recurring private agent ports or patches.
- Recorded the two acceptance areas: expected Unix work and actual agent-driven phone control, with independent outcome checks.
- Added local emulator paths and repeatable diagnostics to AGENTS.md using the previously verified API 36 environment. No emulator configuration changes or new model requests occurred in this documentation turn.
- Updated product and roadmap references without changing the separately recorded UX decisions or phone-use acceptance scope.
- Initialized Git for the documentation checkpoint. The initial snapshot includes existing documentation, visual studies and research; credentials, temporary setup files and running-server state are excluded. Edited-document whitespace checks and a staged credential-pattern check passed. Downloaded source snapshots retain upstream whitespace rather than altering research evidence. The Git commit receipt identifies the checkpoint.
- Rim is not initialized for this documentation-only checkpoint. No product implementation or device feasibility tests were performed.

## Current state — 2026-11-09

The emulator development environment is ready. No Olea app code, product scaffold, or agent runtime has been created yet.

### Product discussion

- Read the supplied chat PDF and recovered its Chinese text using raw extraction.
- Checked key architecture claims against source code and Android documentation.
- Established local on-phone agent execution, Pi first, no root, and acceptable sideloading as product boundaries.
- Recorded the proposed Olea / Olearia split in PRODUCT.md and feasibility sequence in ROADMAP.md.
- Android 14 is the available phone's version, not a decided product requirement.
- The user authorized autonomous installation of the missing development tools and selection of a suitable emulator.

### Continuing product and interface discussion

Agreed decisions and working directions:

- PRODUCT.md owns the full intended product scope; ROADMAP.md owns interim release scope and milestones. Full functionality is not yet determined.
- Build Olea first and extract Olearia after 1.0.0. A reusable foundation is not a prerequisite for the release; separate manager distribution remains undecided.
- Users must be able to update supported agents through ordinary upstream-supported channels after setup without recurring Olea-maintained agent patches or coordinated Olea releases.
- Exclude a Termux-like native Unix environment as the primary agent runtime under that maintenance constraint. PRoot with a standard Linux userland is the working direction, not a validated final architecture.
- Define interface and functionality before continuing detailed architecture discussion. Agent version pinning was raised by the assistant but is not an agreed requirement.
- Conversations are the primary experience, with workspaces also accessible. Workspace-navigation candidate A is selected: parallel Conversations / Workspaces destinations, with workspace selection switching to filtered Conversations. User's stated reason: it shows where users are at all times; hierarchical candidate B risks users getting lost.
- Resume the last active session on launch by default, with a setting to open a fresh chat instead. Reason: the user liked the existing-chat and fresh-chat designs for their respective tasks and wants an entry preference.
- Hide workspace metadata, including files, by default; expose it on demand. Reason: metadata must not push the conversation content down.
- Present visual candidates for subsequent interface decisions.
- Use Orca as a reference for session interactions and choices across sessions, as requested by the user. Specific behaviors must be inspected before adoption; this does not imply Orca protocol integration.
- Alpha phone-use test: open an app through an Accessibility click. User's reason: Accessibility is the most important capability for alpha. An intent launch alone does not satisfy the test.
- Full validation must include a simple successful test for each discussed capability category: intents/app links, structured Android APIs, files/media, notification access, Accessibility, screen capture, and app-specific integrations. User's reason: each category needs a test. PHONE_USE_TESTS.md now records the agreed priorities, reasons, and proposed minimal test matrix; exact fixtures and implementation remain proposals.
- Opening the browser to a supplied link remains a full-validation scenario. Reading page content back is not an agreed requirement. No phone-use tests have run.
- The user clarified that phone-use capabilities are bounded by permissions and special access normally grantable on a personal stock Android phone, not system privileges. Structured Android APIs, intents, content providers, Accessibility, and consent-based screen capture are being discussed as complementary approaches, not approved implementation scope.
- Documentation fetches for this capability discussion failed and web search was unavailable due to provider authentication. The capability overview draws on established Android APIs, not newly retrieved source passages or local device tests.
- Update the three documents each discussion turn. Mark open choices and proposals explicitly instead of treating recommendations as approvals.
- Record only decision reasons explicitly mentioned in this chat. Do not infer missing reasons or reconstruct rationales for inherited decisions from other chats; those are outside this session's scope. Reason: technology changes, and decisions should be reviewed against their actual stated justifications. Record assumptions and revisit conditions only when discussed, distinguishing proposals from agreements.
- Removed the inferred rationale for extracting Olearia after 1.0.0; the sequence remains recorded without an invented reason.

Resolved agent ownership: one agent per session. Users start a new session to use another agent. User's reason: this already serves the need, as in Orca; switching agents within a session is unnecessary. Cross-agent switching and handoff are not requirements. The assistant's candidate B introduced unnecessary scope and is rejected. Workspace defaults, an all-workspace conversation view, and detailed feature scope remain open. Launch behavior and parallel navigation are agreed.

Visual references must be included in the documents. The [visual decision index](PRODUCT.md#visual-decision-references) links each study and records its selection status. This preserves the actual candidates alongside the decisions.

Four interactive, local HTML navigation studies were created under `.superpowers/brainstorm/9291-1794303031/content/`: `conversation-layouts.html`, `launch-behavior.html`, and `workspace-navigation.html`, and `agent-ownership.html`. The workspace study compares parallel and hierarchical navigation with on-demand files and previews the agreed launch preference. The latest study proposed separate conversations per agent against a handoff-based combined UI. It is resolved in favor of one agent per session; the unnecessary handoff proposal is rejected. These are disposable discussion mockups, not product app code or a selected app stack. The visual companion serves them on loopback port 65408 while active. JavaScript syntax and HTTP serving were checked; browser rendering and interactions were not independently inspected. The 21st CLI was unavailable, so the wireframes were drawn locally.

Rim was not used for these discussion artifacts or document updates. Olea is not currently a Git repository; no Rim initialization or candidate creation was attempted.

### UI/UX discussion handoff

The user requested a separate session to handle interface and user experience design. Launch a normal Pi session in the same existing workspace, not a supervised worker or a new Git worktree. Its scope is UI/UX discussion and visual mockups; product implementation still requires an approved design. This session can retain architecture discussion.

The UI/UX session should read all three documents and the visual decision references first, preserve agreed navigation and session boundaries, and record only reasons actually mentioned in discussion. Avoid concurrent overwrites of shared documents: reread before targeted edits, keep UI decisions in their relevant sections, and do not rewrite architecture sections owned by the technical discussion.

The separate normal Pi UI/UX session was launched in the same workspace and received its brief (`prompt.outcome: journaled`). Session ID: `pi_89eaca40_3b96_48c0_a05a_71d8b7beea85`; agent handle: `structured-agent-session-pi_89eaca40_3b96_48c0_a05a_71d8b7beea85`. No supervised task or new checkout was created. This session now owns technical discussion.

At the user's request, moved the detailed phone-use test list into [PHONE_USE_TESTS.md](PHONE_USE_TESTS.md) and replaced the product matrix with a reference.

Next technical proposal, not an agreed stack: compare a Kotlin/Jetpack Compose Android host against Flutter with Kotlin platform services. Both retain the working PRoot runtime direction. The assistant recommends Kotlin/Compose because this Android-only product relies heavily on Android services, permissions, Accessibility, and process lifecycle management.

### UI/UX discussion continuation

The separate normal UI/UX session read PRODUCT.md, ROADMAP.md, PROGRESS.md, PHONE_USE_TESTS.md, and all four inherited visual studies. It continues design discussion in the same workspace without product implementation.

Created [new-conversation setup study 05](.superpowers/brainstorm/9291-1794303031/content/new-conversation-setup-05.html) with fresh filename `new-conversation-setup-05.html`. A places workspace and agent controls beside the first message; B opens a setup sheet before composing. Both allow changing choices before sending and preserve one agent per session. Assistant recommends A because users can begin writing immediately while retaining access to both choices. No user selection yet. Sample Pi/Olea selections do not settle defaults. Existing studies were preserved.

The existing visual companion responded with HTTP 200 on port 65408; the new study's JavaScript passed a syntax check. Browser rendering and interactions were not independently inspected. Rim was not used: this turn created a discussion artifact and made targeted documentation edits only.

### Development machine

- Windows computer with AMD Ryzen AI MAX+ 395, 64-bit processor, and approximately 60 GB reported RAM.
- Firmware virtualization enabled.
- Emulator acceleration diagnostic passes: Windows Hypervisor Platform is installed and usable.
- Android Studio: C:\Program Files\Android\Android Studio.
- Configured SDK: C:\Users\Aria\AppData\Local\Android\Sdk, confirmed from Android Studio settings.
- Bundled Java: C:\Program Files\Android\Android Studio\jbr.

### SDK inventory and setup

On reinspection, Platform-Tools 37.0.1, Emulator 37.2.13, Build Tools 36.0.0, and SDK Platform/Sources 37.0 were already installed. Earlier inspection had found fewer components; this later inventory supersedes it.

Installed during this setup:

- Android SDK Command-line Tools 23, under cmdline-tools\latest.
- Google's Android CLI, under android-cli\android.exe. The latest sdkmanager delegates SDK operations to this newer CLI.
- SDK Platform 36, revision 2.
- Android 16 / API 36 Google APIs x86_64 system image, revision 7, without Play Store.

Command-line tools, platform, and system image archives were checked against Google's published SHA-1 checksums before use. The new CLI stalled while downloading packages; direct downloads succeeded. The large image download stalled once, then completed using byte ranges and passed a whole-file checksum check.

Existing SDK components were retained. No system-wide or user PATH changes were required.

### Virtual device

- Name: Olea_API_36.
- Hardware profile: Pixel 7a.
- Android: 16, API 36.
- ABI: x86_64.
- CPU: 4 virtual cores.
- RAM: 4 GB.
- GPU: enabled, automatic backend selection.
- Physical keyboard input: enabled.
- AVD configuration: C:\Users\Aria\.android\avd\Olea_API_36.avd\config.ini.

This is a mature emulator baseline, not the product's minimum Android version or a claim of ARM64 compatibility.

### Verification

- emulator -accel-check reports WHPX installed and usable.
- The new AVD starts and Android reaches sys.boot_completed=1.
- adb devices reports emulator-5554 connected in device state.
- Device properties report Android 16, API 36, and x86_64.
- Emulator startup confirms Windows Hypervisor Platform acceleration is operational.

The emulator was left running for use. Temporary emulator logs remain under .setup while the process is active; downloaded archives and staging files are removed after installation.

### How to use it

In Android Studio, open Tools > Device Manager and select Olea_API_36. It can be started again from there after closing the emulator.

For shell use, executable paths are:

- C:\Users\Aria\AppData\Local\Android\Sdk\platform-tools\adb.exe
- C:\Users\Aria\AppData\Local\Android\Sdk\emulator\emulator.exe
- C:\Users\Aria\AppData\Local\Android\Sdk\android-cli\android.exe

No manual preparation is currently required. A physical Android 14 phone is available for later validation; model and ABI remain unrecorded. Model credentials are needed only when testing end-to-end Pi requests.

### Next steps

1. Continue technical architecture and stack discussion here; detailed UI/UX discussion is assigned to the separate normal Pi session. No final app stack has been selected.
2. Follow ROADMAP.md: November 9–10 design and evidence, November 11–13 implementation, November 14–15 validation and hardening, and November 15 release.
3. Target Olea 1.0.0 by November 15 with local Pi, Codex, and Claude Code support. Publish alpha builds along the way.
4. Keep design, building, and testing as the main effort. Packaging and publication are short final operations.
5. Update PRODUCT.md from agreed decisions and measured findings.

The user approved this schedule and expanded release target on November 9. This does not approve a particular technology stack or architecture; those remain for the next discussion.

### Limits and workspace tooling

No product software tests, Pi execution tests, or phone-control experiments have run. A working emulator is preparation, not evidence that PRoot or an agent is compatible.

Rim was not initialized: this session covered documentation and development-tool installation, with no product implementation work.
