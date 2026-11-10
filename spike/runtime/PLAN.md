# Android/runtime disposable spike

Original source: MIT. Implements the explicitly authorized feasibility brief, not production UX.

Implementation sequence:
1. Inspect SDK/JDK/AVD; verify Gradle archive; build Kotlin host with compile SDK 36 and explicit target SDK 28 (writable executable compatibility experiment).
2. Verify Ubuntu Base and Termux PRoot package hashes; provision app-private Linux environment; run shell, Node, Git, TLS, package and child-process checks before agents.
3. Serve authenticated loopback HTTP on port 8766 with bounded input/output; permissions and stop checked per phone request; Accessibility launcher click independently observed through ADB.
4. Kotlin owns one shared backend process and its JSONL pipes; Linux payload supplied by backend peer. No automatic phone retries after process death.
5. Capture versions, failures, resource/lifecycle evidence and reproducible commands. Physical ARM64 remains blocked without a connected device.

Files: `spike/android` Gradle host, Kotlin service/bridge/Accessibility/fixture; `spike/runtime` reproducible download/provision/probe scripts, provenance and evidence. Temporary archives/build tools live under ignored `.setup`.

Bridge: `127.0.0.1:8766`, Bearer authentication, `GET /health`, `GET /capabilities`, `POST /phone` body `{id,operation,args}` and response `{id,ok,result,error}`. Operations `capabilities`, `inspect`/`accessibility_tree`, `click`/`accessibility_click`, `home`/`global_action`, `open_url`, `fixture_action`, `stop`. Native-generated node IDs expire on next inspection. Authentication configuration stays app-private and outside model tool output.
