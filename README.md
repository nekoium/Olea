# Olea

Olea runs stock coding agents locally on Android. The current core focuses on Pi: prepare a Linux environment, chat with streaming replies and tool activity, stop execution, and reopen a saved conversation. Model requests go to your configured provider.

This early build targets Android 16 on x86_64. ARM64 phones and Android 14 have not been validated. Codex adapter source is retained, but a complete Codex interface and Claude support are not included in this core.

## Install and use

Build an APK from source using the instructions below. Copy the APK to the Android device, open it in a file manager, and allow installation from that source when Android asks.

1. Open Olea and tap **Start**. The APK contains Linux, Node and PRoot. First preparation needs internet access to install certificates, Git and stock Pi through ordinary package channels.
2. Wait for **Pi ready**. If preparation fails, check connectivity and available storage, then tap **STOP** before retrying **Start**.
3. Tap **STOP**, open **Settings**, and enter an HTTPS OpenAI-compatible API base URL, model ID and API key. Save, then tap **Start**.
4. Send a message. Replies stream into the conversation; tool names, completion and bounded text output appear alongside them.
5. Tap **STOP** to end execution. A foreground notification also provides STOP when notifications are allowed in Android settings.
6. Reopen Olea to see the saved conversation. Tap **Start** to reconnect Pi to that session. Reconnecting never resends an earlier prompt.

**Workspace** opens a local shell command dialog. For example, `printf 'hello\n' > hello.txt; cat hello.txt` writes and reads a workspace file without a model request. This command runs with the app's file access.

Normal use needs no desktop, root or active ADB connection. Android may terminate background processes. Start again explicitly after termination and inspect the saved conversation before deciding whether to resend an interrupted message.

## Build from source

Requirements: Bash, Node.js 22.19 or later with npm, curl, tar, xz, gzip, unzip, a JDK supported by Gradle 9.1, and Android SDK Platform 36 / Build Tools 36. Set `JAVA_HOME` and `ANDROID_HOME` to your installed tools.

```bash
bash runtime/build.sh
```

The script downloads and verifies public runtime inputs, builds the backend, packages the runtime and builds `android/app/build/outputs/apk/debug/app-debug.apk`. First preparation on Android additionally installs stock Pi 1.5.2. Inside Workspace, `npm install -g --prefix /opt/agents @earendil-works/pi-coding-agent@latest` uses Pi's ordinary upstream update channel; compatibility with every future version is not guaranteed.

## Data and privacy

Workspace files, Pi home, provider settings and saved sessions live in private app storage, outside the replaceable Linux root filesystem. STOP and ordinary app updates preserve that storage. Uninstalling Olea or clearing its Android storage deletes it. Export and backup controls are not implemented yet.

API keys remain in the app's private Pi configuration. The configured provider receives messages and tool results sent by Pi. Agents and their tools share the app's Unix environment and UID; PRoot provides Linux compatibility, not isolation from app data or credentials. This first core does not expose phone-control tools.

## Current limits

One Pi conversation and one workspace are presented. Full production navigation, more agent interfaces, OAuth onboarding and runtime replacement/recovery controls remain future work. Large outputs are bounded in the display; Pi retains its session files separately. Interrupted preparation can retain staging files, and low-storage recovery may require manual support. Fresh setup requires working package repositories.

Live provider-backed replies, model-selected tool actions and provider-backed continuation require separate acceptance verification. Local startup, shell execution and persistence checks do not establish those outcomes.

## License

Original Olea code is MIT licensed. PRoot, Ubuntu, Node and other dependencies retain their own licenses. See [third-party components](runtime/THIRD_PARTY.md) for provenance and distribution limits.
