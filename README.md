# Olea

Olea runs stock coding agents locally on Android. Prepare its packaged Linux environment, use Pi or Codex in saved conversations, work with local files, and expose selected Android capabilities through permission-controlled phone tools. Model requests go to your configured provider; no desktop or server needs to remain online.

This early build targets Android 16 on x86_64. ARM64 phones and Android 14 have not been validated. Claude support is not included.

## Install and start

Build the APK from source using the instructions below. Copy it to the Android device, open it in a file manager, and allow installation from that source when Android asks.

1. Open Olea and tap **Start**. The APK contains Linux, Node and PRoot. First preparation needs internet access to install certificates, Git and stock Pi through ordinary package channels.
2. Wait for **Pi ready**. If preparation fails, check connectivity and free storage, then tap **STOP** before retrying **Start**.
3. Tap **STOP**, then **More → Provider settings → Pi**. Enter an HTTPS OpenAI-compatible Chat Completions base URL, model ID and API key. Save, then tap **Start**.
4. Send a message. Replies stream into the conversation; tool names and bounded output appear alongside them.
5. **Cancel turn** requests cancellation of the selected conversation's work. **STOP** ends all agent execution and disables phone tools. The foreground notification also provides STOP when Android notifications are allowed.

Reopening Olea shows the last selected saved conversation. **Start** explicitly reconnects its agent; reconnecting never resends an earlier prompt. Android may terminate background processes. Inspect the saved conversation before deciding whether to resend an interrupted message.

## Conversations and workspaces

**Conversations** lists saved sessions and creates new ones. Each conversation keeps its agent and workspace. Select a workspace under **Workspaces** to see its conversations or create another. The original conversation and workspace are retained when updating from the first core.

Up to two agent sessions can run in the shared backend. Switching conversations preserves an already connected session. Use **More → Disconnect this conversation** to free a slot, or STOP to end all execution. Saved conversation count is not limited to two.

**More → Workspace shell** runs a local command through the selected agent without a model request. For example, `printf 'hello\n' > hello.txt; cat hello.txt` writes and reads a workspace file. Start the conversation first.

Workspaces are working directories, not security boundaries. Agents share the app's Unix environment and file access; the default workspace also contains directories created for additional workspaces.

## Codex

After preparing Linux, tap STOP and choose **More → Install or update agent → Install Codex**. Configure **More → Provider settings → Codex** with an HTTPS Responses API base URL, model ID and API key. Create a conversation with Codex selected, then tap Start.

Codex uses its supported full-access mode with approval set to never. This permits access to files available to the app; it provides no filesystem isolation from other workspaces, app data or credentials. Android permissions and phone STOP still apply.

Olea preserves the Codex thread and home across reconnects. Some stock builds cannot list saved turns through their app-server interface. Olea then keeps its saved display and reports that limitation while reopening the same thread. Direct Workspace shell commands are displayed by Olea but do not become Codex model turns.

## Phone tools

Open **Phone** to enable tools and manage Android access. Phone tools start disabled after app/process restart. STOP, backend failure and agent-process failure disable them; enable them explicitly again when needed. Enabling tools does not grant Android permissions.

Available capabilities:

- **Accessibility:** inspect a bounded exposed UI tree, click a current node, navigate home, and swipe. Enable Olea in Android Accessibility settings. Coverage depends on the target app; it does not expose every screen or private app data.
- **Browser:** request opening an HTTPS URL. Dispatch alone does not establish successful page loading.
- **Location:** read the most recent available location after permission is granted. Results include timestamp and age; they may be stale or unavailable.
- **Selected folder:** use Android's folder picker to grant read/write access. The current tool creates a bounded text file and reads it back in that folder. It is not a general file browser or cleanup engine.
- **Notifications:** enable notification access to read a bounded list of active notifications from other apps. Scheduled reminders, alarms and notification posting are not included.
- **Screen capture:** request a capture, then press **Request one screen capture** in Phone and complete Android's consent. The result contains request status and PNG metadata. Agents do not receive image pixels through this tool. Protected content may be blank. A new capture requires a new request; STOP invalidates pending consent.
- **Cooperating app:** configure its documented exported Activity (`package/class`) and action. Olea sends a bounded string extra named `value`. The app must support this interface; there is no universal third-party integration.

Pi and Codex expose the same native tools through their supported extension and MCP interfaces. Android may block a tool's attempt to open a consent screen from the background. Open Olea's Phone screen to complete the request yourself. STOP prevents subsequent actions; it cannot undo an already dispatched Android action or a completed file write.

## Agent updates and runtime status

Tap STOP before **More → Install or update agent**. Updates use each agent's ordinary upstream npm channel and leave workspace files, provider settings and saved homes in their separate storage locations. Failed or interrupted updates require an explicit retry and may leave an agent installation needing repair. Compatibility with every future version is not guaranteed. Runtime replacement/recovery controls are not implemented.

**More → Runtime status** shows backend state and connected sessions. Continuous unattended/background survival, peak memory, battery and thermal performance are not established.

## Build from source

Requirements: Bash, Node.js 22.19 or later with npm, curl, tar, xz, gzip, unzip, a JDK supported by Gradle 9.1, and Android SDK Platform 36 / Build Tools 36. Set `JAVA_HOME` and `ANDROID_HOME` to your installed tools.

```bash
bash runtime/build.sh
```

The script downloads and verifies public runtime inputs, builds the backend and Pi extension, packages the runtime, and builds `android/app/build/outputs/apk/debug/app-debug.apk`. First preparation installs stock Pi 1.5.2; optional Codex installation starts with stock 0.167.1. Update controls use upstream `latest`.

## Data and privacy

Workspace files, agent homes, provider settings, saved sessions and the selected-conversation registry live in private app storage, outside the replaceable Linux root filesystem. STOP and ordinary APK updates preserve that storage. Uninstalling Olea or clearing Android storage deletes it. Export and backup controls are not implemented.

API keys remain in private app configuration. The configured provider receives messages and tool results sent by the agent, including phone-tool results when used. PRoot provides Linux compatibility, not isolation from app data or credentials. Phone tools operate with permissions and special access you grant to Olea.

Before the first chat message, Pi may keep shell-only history in memory without creating a canonical transcript. Olea retains its display; that history is not restored into Pi's model context. Display output and RPC frames are bounded, so very large histories can fail to load rather than consuming unlimited memory.

## Current limits

This build integrates previously demonstrated methods, with focused checks of the maintained application. Live provider-backed replies, model-selected phone/tool actions, cancellation during a provider turn and provider-backed continuation still require acceptance verification in this build. Earlier experimental successes do not establish all current integrated outcomes.

OAuth onboarding, general selected-folder editing, scheduled work, complete production navigation and broader lifecycle/device certification remain future work. Normal use needs no root or active ADB connection. Fresh setup and agent maintenance require working package repositories.

## License

Original Olea code is MIT licensed. PRoot, Ubuntu, Node and other dependencies retain their own licenses. See [third-party components](runtime/THIRD_PARTY.md) for provenance and distribution limits.
