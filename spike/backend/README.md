# Disposable stock Pi backend experiment

Original code: MIT. This directory implements the selected feasibility spike, not production chat UX.

Build and host checks:

```sh
cd spike/backend
npm ci
npm test
```

Backend start (Node >=22.19.0, fixed matrix baseline Node 24.20.0):

```sh
export OLEA_PI_ENTRY=/opt/olea/pi/node_modules/@earendil-works/pi-coding-agent/dist/bundle/cli.js
export OLEA_WORKSPACE=/workspace
export OLEA_STATE_DIR=/var/lib/olea
export OLEA_PROVIDER_CONFIG=/private/android-test-provider.local.json
export OLEA_BRIDGE_CONFIG=/private/bridge.local.json
node /opt/olea/spike/backend/dist/server.js
```

Resolve the Pi entry from the installed package's `bin.pi`; release 0.74.0 uses `dist/cli.js`, while 1.0.0/1.5.2 use `dist/bundle/cli.js`. Do not change agent files. The provider file contains `baseUrl`, `apiKey`, `primaryModel`, `fallbackModel`; obtain its contents only from the user-authorized ignored absolute configuration. The bridge file contains `{url:"http://127.0.0.1:8766",token:"..."}`. Neither file belongs in payload archives or results. A native bootstrap may instead set `OLEA_BRIDGE_URL` and `OLEA_BRIDGE_TOKEN_FILE`.

JSONL stdin commands:

```json
{"id":"1","type":"start","session":"one"}
{"id":"2","type":"command","session":"one","command":{"type":"prompt","message":"Perform the requested test."}}
{"id":"3","type":"command","session":"one","command":{"type":"abort"}}
{"id":"4","type":"stop","session":"one"}
{"id":"5","type":"start","session":"one","resume":true}
{"id":"6","type":"status"}
```

Responses correlate `id`; events contain `session` and stock Pi `record`. Prompt acceptance does not mean completion. The backend forwards stock events and uses get_state for checkpointing; clients must wait until Pi is idle. No uncertain phone action is automatically repeated. At most two processes run; explicit stop terminates their Unix process groups. EOF/SIGTERM closes all sessions. Output queues cap at 1 MiB, each JSONL record at 256 KiB, outstanding RPC requests at 32 per process. Extension HTTP responses cap at 64 KiB and 10 seconds. Raw Pi stderr is counted and discarded because it may contain provider payloads. Known provider/bridge secrets are redacted from server output.

Native contract, coordinated with Android owner:

- Authenticated loopback `POST /phone`, JSON `{id,operation,args}`.
- Response `{id,ok:true,result}` or `{id,ok:false,error:{code,message}}`; `id` is additive.
- Operations `capabilities`, `accessibility_tree`, `accessibility_click` (`nodeId`), `global_action` (`action:home`), `swipe` (optional integer `x`, `startY`, `endY`), `open_url` (`url`), `fixture_action` (`value`). Empty swipe arguments use Android's default swipe up; explicit coordinates are limited to 0–16383 pixels by the tool schema and current screen bounds by Kotlin.
- Kotlin checks permissions and stop on every request. No oracle operation exists.
- The supported Pi extension registers seven visible phone tools with descriptions. Use `phone_swipe` to reveal the app drawer when the launcher entry is absent, then inspect and click. Launcher click must use Accessibility; `open_url` and `fixture_action` do not satisfy that assertion.

Real stock runner and ordinary update matrix:

```sh
# First verify provider format; no raw headers/responses enter results.
node spike/tests/pi/provider-probe.mjs
# Protected path must be supplied on Linux, where the Windows source path is unavailable.
export OLEA_PROVIDER_CONFIG=/private/android-test-provider.local.json
export OLEA_BRIDGE_CONFIG=/private/bridge.local.json
export OLEA_RUN_PHONE=1
export OLEA_PHONE_TARGET_LABEL='Olea Fixture'
node spike/tests/pi/matrix.mjs
```

Run from repository/payload root. Matrix installs stock `@earendil-works/pi-coding-agent` 0.74.0, then 1.0.0, then 1.5.2 sequentially into the same npm prefix on the unchanged base. Normal install scripts remain enabled. No dependency replacement, agent patch, private shim, or Node change is performed. Install timeout: 240 seconds; each stock suite: 600 seconds; output: 256 KiB per child. Reports are `.setup/pi-matrix/matrix.json` and `pi-<version>.json`. Set `OLEA_MATRIX_DIR` to an app-private writable path. Windows callers should supply `npm_execpath` pointing to stock `npm-cli.js`; Linux uses `npm` directly.

The suite independently reruns the installed is-number dependency, spawns a child, and checks generated files; checks saved transcript after explicit restart; sends concurrent model requests to two persistent sessions and verifies both files; cancels a shell descendant and inspects `/proc`; stops a backend session during another live shell descendant and checks cleanup before explicit resume; compares ten direct/managed get_state calls. Linux memory samples report backend-runner and Pi RSS, plus a one-second idle CPU interval with raw kernel ticks. These omit total Android/PRoot/native-host accounting. Runner/backend source hashes accompany new results. Phone work is run only for baseline 1.5.2. Stock model calls are bounded by deadlines and twelve turns per prompt, and upstream auto-retry is disabled. The default provider model is gpt-6.1-terra; set `OLEA_MODEL=gpt-6.1-sol` for one explicitly recorded fallback run only if needed.

The phone runner returns `awaiting-independent-oracle` after verifying tool invocations and a generated Unix value. Android owner must independently observe Accessibility launcher click and foreground, then compare the cooperating fixture's private oracle with the Unix value file. Keep that oracle outside PRoot binds and registered tools; do not turn this runner status into a phone pass without external evidence. PRoot shares app identity and is not a security sandbox: bridge auth and local files are trusted application integration, not hostile-agent isolation.

Version selection: 0.74.0 is the first published release under the current namespace; 1.0.0 covers the stable-major and bundled-CLI transition; 1.5.2 was registry current at inspection. Engines: 0.74.0 >=20.6.0; both 1.x >=22.19.0. Node 24.20.0 and Node22 >=22.19 satisfy all declared ranges; Node20 is incompatible with 1.x. Only actual executions establish runtime compatibility. Upstream package and dependencies retain their licenses.

References: [upstream RPC](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/rpc.md), [supported extensions](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/extensions.md), [provider API](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/custom-provider.md), [npm package metadata](https://registry.npmjs.org/@earendil-works%2fpi-coding-agent). Local authoritative guides came from the installed stock 1.5.2 package; namespace aliases are documented upstream, and this code uses no legacy namespace imports.
