# Olea: product

Status: evolving product scope and decision record. The maintained core direction below is approved; the full intended functionality remains under discussion.

## Release 0.1.0

**USER DECISION**: Autonomously complete the app, validate it on the connected phone, and publish a signed APK as **0.1.0** with the repository public if release checks establish readiness. This supersedes the older private 1.0.0 shipping target below. Source: the user's current release instruction, “Go fully automatic” and “The repo should be public with that release in the end, if nothing wrong.”

**USER DECISION**: Use [scenario board 02](docs/ui/scenario-board-02.html) as the production interface and functionality reference, preserving its design language while completing flows and correcting logic flaws. Use `docs/ui/branding/seed-icon.png` as the app icon and `docs/ui/branding/seed-poster-landscape.png` as the public README banner. Write a clear promotional README that explains value and use to nontechnical readers. Source: the same release instruction.

**USER DECISION**: Audit repository files and Git history for private credentials and sensitive information before publication. Use the supplied local signing identity; keep signing material and temporary test credentials outside tracked files. Provider testing uses GPT for Pi/Codex and Claude for Claude Code, cheapest working models for connectivity/run checks, and Pi with `gpt-6.1-sol` only for real functionality and phone-use testing. Source: the same release instruction.

## Shipping-today decisions (superseded release target)

**USER DECISION**: The current release target is today, superseding the older November 15, 2026 calendar target below. Version 1.0.0 retains Pi, Codex, and Claude Code support. Source: the user's shipping discussion, “keep all three agents for 1.0.0”.

**USER DECISION**: Defer scheduled agent work, reminders, alarms, and general personal-folder/vault cleanup and editing workflows from today's release. Source: the user's acceptance, “Additional features go with your recom”, of the recommendation to defer those capabilities. Ordinary agent work with workspace files remains in scope.

**USER DECISION**: Users choose their agent and first-run setup; installing an agent may be a prerequisite. Do not adopt the proposed automatic Pi/default-workspace policy. Detailed first-run UX remains with the separate design session, while independent functional work can proceed. Source: the user's first-run clarification and authorization to build automatable functionality first.

**USER DECISION**: Distribute a signed APK through a private GitHub release. Source: the user's acceptance of the proposed distribution route, “Distribution yeah go with yours”. This does not establish that release signing or APK acceptance is complete.

## Maintained core decision

The user approved building a persistent Olea core through selective reuse of working spike components: Kotlin Android authority, packaged conventional Linux through PRoot, one shared TypeScript/Node backend, stock-agent adapters, and user data kept independent of replaceable runtime components. Maintain the Android environment and Olea integrations rather than private agent ports. Existing evidence is sufficient to build against this route; it does not establish universal compatibility or complete production readiness.

First deliverable: install/open -> prepare/start environment -> stock Pi conversation with replies and tool activity -> user STOP -> reopen saved conversation. Pi supplies the first complete path; the release goal for other agents remains. The production UI uses Kotlin + Jetpack Compose with the current demo’s flat design; detailed UX remains under discussion. The user's reason for establishing this core now: fixes need a persistent implementation to apply to.

[Approved design and autonomous builder assignment](docs/archive/CORE_BUILD_HANDOFF.md) records scope, bounded validation, ownership and known limits. It supersedes earlier candidate-only language for these core responsibilities. Historical feasibility descriptions below retain their original context.

## Document responsibilities

PRODUCT.md describes the full intended Olea product, including agreed boundaries and clearly marked future direction. docs/ROADMAP.md assigns capabilities to interim releases and milestones. docs/PROGRESS.md records what exists, evidence, and unresolved discussion. Intended capabilities are not claims of implemented behavior.

Keep these documents current as discussion proceeds. Record decisions as agreed, distinguish recommendations from decisions, and retain unresolved questions explicitly. Record only decision reasons explicitly mentioned in this chat. Do not infer missing reasons or reconstruct reasons for decisions from earlier chats; those are outside this session's scope. Preserve inherited decisions without adding rationales. Record assumptions or revisit conditions only when discussed, and distinguish proposed conditions from agreed ones. Reason for this recording policy: technology changes, so decisions need their actual justifications available for later review.

Olea is an Android app for using locally running agents without assembling a terminal environment, dependencies, and a GUI by hand. Its first concrete user is a Pi user who wants the complete experience on a phone.

## Purpose

Combine freedom of agent choice with a low-friction, all-in-one experience. The agent process runs on the phone; model requests may still go to an external provider. Independent execution means no desktop or server must remain online.

## Audience and execution stance

Olea is for users who already have literacy with Pi, Codex or Claude; it is not aimed at people unfamiliar with agent tools. The user expects Olea to be easy to use while retaining a high capability ceiling.

The user's preferred default is "full YOLO": give the agent broad execution authority and expect users to acknowledge the risks of the work they delegate. This records the user's product stance; it does not claim that Android permissions can be bypassed or that the runtime is isolated from other apps.

## Personal-agent scenarios under discussion

The user wants phone-file cleanup, reading daily notes and scattered Obsidian project notes, and automatically maintaining a central project note. The user also requests daily notifications/reminders and setting alarms. These are requested capabilities, not implemented behavior or approved release placement. Actual personal-file access is not authorized by this product discussion.

[Feature audit and proposed priorities](docs/discussions/FEATURE_PRIORITIES.md) separates existing commitments, new requests, dependencies and open decisions. Dedicated cleanup engines, semantic indexing, mandatory per-edit review and a specific scheduled-task UI are not agreed requirements. Notifications, scheduled agent runs and ringing alarms are distinct capabilities. [UI design handoff](docs/archive/UI_DESIGN_HANDOFF.md) assigns a separate session to discuss presentation directly with the user while this session owns functionality/priorities.

## Agreed boundaries

- Target stock or near-stock Android. Android 16 / API 36 is the initial emulator baseline; the available Android 14 phone is a later compatibility target. Neither establishes the product's minimum Android version.
- Require no root and avoid repeated debugging or pairing during normal use.
- Sideloading is acceptable. Google Play is not an initial requirement.
- Target local Pi, Codex, and Claude Code support for the November 15, 2026 version 1.0.0 release. Pi remains the original motivating workflow. Validate all three integrations early rather than assuming compatibility.
- Provide shared workspace files and tools, with agent-driven package installation where supported.
- Provide phone-use capabilities through explicit Android permissions.
- Desktop interfaces and multi-agent task orchestration are outside the initial scope.
- Future integration may let another product connect to agents hosted on the phone. Orca compatibility is exploratory, not a commitment.

## Conversation-first experience

Agreed direction:

- Conversations are the primary experience; workspaces coexist with them rather than competing as an alternative product model.
- Use parallel Conversations and Workspaces destinations. Selecting a workspace switches to Conversations filtered to that workspace. Reason stated by the user: candidate A makes the current location clear at all times, while the hierarchical candidate B could make users get lost.
- By default, reopening Olea resumes the last active session. A setting lets the user choose a fresh chat instead. Reason: the existing-chat design suits continuation, while the fresh-chat design suits starting a new task; users should choose their preferred entry behavior.
- Workspace metadata, including files, must not occupy persistent space above messages or push conversation content down by default. Users can inspect details and files on demand. Reason: the conversation is the primary working surface and metadata should not displace it.
- Each session uses one agent. To use another agent, start a new session. User's stated reason: starting a new session already serves that need, as in Orca; changing agents within a session is unnecessary. Cross-agent switching and handoff are not requirements.
- Use Orca as a reference when designing session interactions, including user choices across different sessions. This is design guidance, not a requirement for Orca protocol compatibility. Inspect the relevant behavior before describing or adopting it; do not infer undocumented Orca behavior.
- Show visual candidates for interface decisions in subsequent discussion, rather than relying on verbal descriptions alone.

Still open:

- Whether Conversations also offers an all-workspace view. This appeared in the selected navigation mockup but has not been explicitly discussed as a requirement.
- Workspace defaults and creation behavior, agent selection behavior, and the full set of conversation and phone-use functions.
- New-conversation setup placement: [study 05](.superpowers/brainstorm/9291-1794303031/content/new-conversation-setup-05.html) compares A, workspace and agent controls beside the first message, with B, a setup sheet before composing. Assistant recommendation: A, because it lets users begin writing immediately while keeping both choices available. Neither is approved. Both use sample selections; default agent and workspace policies remain open.

## Phone-use scenario and approaches

The first concrete phone-use test scenario is opening the user's browser to a supplied link. The user selected this to exercise phone use. It is not yet a complete definition of 1.0 phone-use scope.

Approaches under discussion, not selected implementations:

- Android intents and app links can request supported actions such as opening a URL, sharing text, or opening an app's supported destination. Browser opening should first be evaluated through an `ACTION_VIEW` web intent; user defaults or a chooser may determine the browser. Dispatching the intent does not establish that the page loaded.
- Android APIs and permission-controlled content providers can expose structured capabilities, such as selected files, media, contacts, or calendars, subject to each API's permissions and restrictions.
- Accessibility can inspect exposed UI nodes, activate actions, enter text, perform gestures, and invoke supported system navigation. Coverage depends on the app and Android restrictions.
- Screen capture plus visual interpretation can supplement inaccessible UI. MediaProjection normally requires explicit system consent; secure content can be excluded. Capture alone does not grant input control.
- Cooperating apps can expose explicit integration interfaces. Access depends on the interface they provide, not merely on Olea having broad permissions.

The user clarified that the capability ceiling is permissions and special access a user can normally grant to an app on their own stock Android phone, not privileged system access. Accessibility and screen capture require their own enablement or consent; they are not a single blanket permission.

Stock Android has no ordinary-app permission granting unrestricted phone access. Other apps' private data, silent permission grants, unrestricted shell privileges, and reliable control of every app remain outside what ordinary permissions establish. Device-owner provisioning and debugging-based privilege bridges are distinct deployment approaches, not capabilities implied by normal permission grants, and are not selected for Olea.

These are API-level possibilities, not local validation results or a commitment to implement every capability.

## Phone-use validation scope

The test list, agreed priorities and reasons, proposed fixtures, and results now live in [PHONE_USE_TESTS.md](docs/PHONE_USE_TESTS.md). Alpha prioritizes opening an app through an Accessibility click; full validation covers every discussed capability category. Individual full-test fixtures remain proposals.

## Visual decision references

Keep relative links to the visual studies beside the decisions they illustrate. Candidate letters are local to each study. These HTML files are discussion artifacts, not product implementation; superseded alternatives remain useful references for understanding the choice.

| Study | Status and relevance |
| --- | --- |
| [Initial conversation/workspace layouts](.superpowers/brainstorm/9291-1794303031/content/conversation-layouts.html) | B was the closest initial fit; the later workspace-navigation study refines it. |
| [Launch behavior](.superpowers/brainstorm/9291-1794303031/content/launch-behavior.html) | B for existing chats and C for fresh chats; resume the last active session by default, with a fresh-chat setting. |
| [Workspace navigation](.superpowers/brainstorm/9291-1794303031/content/workspace-navigation.html) | A selected: parallel destinations, workspace selection switches to filtered Conversations. User's reason: clearer location; B risks disorientation. |
| [Agent ownership](.superpowers/brainstorm/9291-1794303031/content/agent-ownership.html) | Resolved: one agent per session; start a new session for another agent. User's reason: a new session already serves the need. B was an unnecessary assistant proposal and is rejected. |
| [New-conversation setup](.superpowers/brainstorm/9291-1794303031/content/new-conversation-setup-05.html) | Open: A places workspace and agent choices beside the draft; B asks in a setup sheet first. Assistant recommends A to allow immediate writing. Defaults are illustrative, not agreed. |

## Future reusable foundation: Olearia

The working name is Olearia.

Olearia has two responsibilities:

1. Prepare and maintain the local execution environment, shared workspace, tools, and process lifecycle.
2. Expose phone inspection and control through a permission-controlled Android bridge.

Build Olea first. Extract Olearia after Olea 1.0.0. No separate reason for this sequence was explicitly given; do not supply an inferred rationale.

Olea's intended capabilities include environment setup, chat, sessions, interruption and environment management. Broad execution authority is the intended default; support for any upstream-required interaction does not imply mandatory Olea approval prompts. Detailed behavior is still being designed. Agent integrations translate each agent's session protocol into the interface's needs. MCP may expose phone tools; it is not assumed to replace the agent session protocol.

An installed Android app is required for permissions and Accessibility services. The reusable foundation can be code modules within that app. A separately distributed Olearia manager app is a possible later delivery form, not an initial requirement. One repository and one APK are the initial proposal.

## Runtime approaches

| Approach | Benefit | Cost or uncertainty |
| --- | --- | --- |
| Native Android runtimes and tools | Avoid PRoot translation overhead; use Android-compatible binaries. | Linux vendor binaries and native dependencies may require ports or patches. |
| Minimal Linux userland through PRoot | Broader compatibility with standard Linux packages and agent distributions. | Syscall translation overhead, unsupported kernel features, Android execution and lifecycle constraints. |
| Tightly bundled Pi runtime | Small, controlled initial feature set. | General package installation and additional agents may require substantial runtime changes. |

A minimal Linux userland through PRoot is the working runtime direction. Ubuntu Base and Debian remain candidates; the distribution and packaging strategy are not selected. DSH Go demonstrates that this approach works in multiple scenarios, not that Olea's three agents or their update paths are already validated. PRoot is not hardware emulation or Docker security isolation. It shares Android's kernel and runs under the app's permissions.

Maintenance constraint: after one-time environment setup, users must be able to install and update supported agents through their ordinary upstream-supported channels without recurring Olea-maintained agent ports, patches, or matching Olea releases. A Termux-like Android-native Unix environment is excluded as the primary agent runtime under this constraint. This does not exclude Android-native app and phone-bridge components or the reuse of suitable bootstrap tools.

Runtime decision rationale: ordinary upstream agent updates must remain usable without continuous Olea-specific porting work. PRoot offers a conventional Linux userland and DSH Go supplies precedent. The assistant proposed revisiting this choice if tests show that core agent workflows or ordinary updates require recurring patches, or if another approach meets the same maintenance constraint with better evidence. These revisit conditions have not been separately agreed. This is not proof of universal Linux compatibility.

Runtime feasibility remains an evidence requirement. Initial interface and phone-use boundaries are established enough to begin technical discussion; detailed UI/UX design continues in a separate normal session in the same workspace. Agent version pinning or recovery policies have not been agreed and are not current scope decisions.

## Technical implementation direction

**USER DECISION**: The browser demo uses categorized journey rows with connected flows and branches within each row (layout option D). Scenario cards open repeatable interactive phone states. Source: the user's UI discussion selection, “D is dope. Let's go D and update the demo.” [Visual reference](docs/ui/experience-map-options-06.html#hybrid); [interactive demo](docs/ui/scenario-board-02.html). This selects the review structure; detailed flows remain subject to design feedback. **USER DECISION**: Tighten card spacing and the phone column to maximize visible scenarios, keeping cards at least their existing size. Source: the user's density correction, “include as many cards as possible in the canvas, while making them not smaller than the current design.”

The previously selected feasibility stack is now the approved maintained-core direction: Kotlin Android hosting, packaged Linux/PRoot, stock Pi RPC, supported extension-based phone tools, and one shared TypeScript/Node backend. Kotlin owns Android platform authority and supervises the backend. **USER DECISION**: The production Android UI uses Kotlin + Jetpack Compose with a flat design based on the current browser demo. Material Design is no longer the selected design system. Source: the user's latest correction, “We don't use material design anymore, we'll use the flat design as the current demo.” This supersedes the earlier Material 3 selection. iOS is a future possibility, not a required target. Detailed UI behavior and the web prototype structure remain under discussion. **USER DECISION**: The design demo runs entirely in the browser with sample behavior; real functionality and an emulator/device connection are not required. Its UI, UX and motion should approximate real phone use as closely as possible so it can serve as an implementation reference. Source: the user's continued prototype discussion, “We use Browser-only phone demo” and “we don't need real functionalities for the demo.” **USER DECISION**: The prototype review page must fit one viewport without page scrolling. The full phone and demo controls must be visible together. Use compact scenario cards for an at-a-glance overview, rather than long descriptive list items; scroll only inside content regions. Source: the user's viewport/layout correction in the UI discussion. [TECH_STACK.md](docs/TECH_STACK.md) records implementation notes; the core assignment is historical bounded scope. Original Olea code uses MIT; third-party components retain their own licenses. [FEASIBILITY_BRIEF.md](docs/archive/FEASIBILITY_BRIEF.md) is historical and grants no new execution or provider budget.

## Limits we must establish

- Which executable packaging and target SDK strategy works on Android 14 and has an acceptable upgrade path?
- Can Pi and its required dependencies run reliably on x86_64 Android and ARM64 hardware?
- Which Codex and Claude Code requirements could block future support, particularly sandboxing, authentication, and native binaries?
- What survives app switching, screen lock, process death, and reboot? Permission persistence and process persistence are different properties.
- How do runtime updates preserve user files, installed packages, and credentials?
- What is the measured installation size, setup time, and execution overhead?
- What authentication and capability boundaries protect phone tools and workspace access?

Shared files do not imply shared conversations, terminal state, or live environment-variable changes. Accessibility cannot promise complete visibility into every app or guaranteed background operation.

## Research basis

- [DSH Go runtime build](https://github.com/ccch1mneyyy/dsh-go/blob/main/runtime/build-runtime.sh): packages Ubuntu Base, Node, Python, and PRoot.
- [DSH Go architecture](https://github.com/ccch1mneyyy/dsh-go/blob/main/docs/architecture.md): describes its local environment and deliberate API 28 target.
- [Android executable restrictions](https://developer.android.com/about/versions/10/behavior-changes-10#execute-permission): explains execution restrictions for writable app directories.
- [PRoot-Distro](https://github.com/termux/proot-distro): explains the compatibility mechanism and limitations.
- [Pi RPC](https://github.com/badlogic/pi-mono/blob/main/packages/coding-agent/docs/rpc.md): candidate interface for the first agent integration.
- [Claude Code setup](https://code.claude.com/docs/en/setup): documents native distributions; Node alone is not sufficient evidence of compatibility.
- [HAPI](https://github.com/tiann/hapi) and [Happy](https://github.com/slopus/happy): adjacent products with mobile access to agents.
- [Mobilerun](https://github.com/droidrun/droidrun): adjacent phone-control framework.

These findings come from documentation and source inspection, not local runtime tests. The original chat's claims about native-only DSH Go execution, Docker-like isolation, and guaranteed background survival were not reliable. The landscape review was not exhaustive.

## Documentation outcome

Evolve this product document as agreements and observed behavior change. docs/ROADMAP.md records the November 15, 2026 release target and full release goals. The maintained core direction and production Android UI toolkit are settled; detailed product behavior and broader compatibility remain open. Historical research and experimental proposals do not grant execution authority.
