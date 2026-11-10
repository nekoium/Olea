# M2 evidence and runtime-owner contract

Original code is MIT. This is disposable experiment tooling. No dependencies are added. Existing runtime/APK/agent packages retain their own licenses. No Orca implementation source is copied.

`evidence.mjs` defines the complete expected matrix and consumes retained attempt receipts. `receipt.schema.json` documents the interchange shape. `validateReceipt` enforces the core invariants without an external schema library; it is not a complete JSON Schema validator. Producers must manually sanitize summaries and review credential exposure. The fixed forbidden-pattern check cannot detect arbitrary secrets.

Reports preserve every attempt, including failure before retry/fallback. A failed prerequisite blocks only cases with no matching execution receipt. A direct failed assertion stays failed even when a provider prerequisite also fails. Host, development run-as, target28 comparison, direct/model and modern Android app-domain evidence do not substitute for one another. Rendering tests are tooling checks, never mission passes. Raw Pi runner summaries require explicit case-by-case assessment into schema receipts; do not rename `awaiting-independent-phone-oracle` to pass.

## Offline commands

From the repository root, commands actually run by evidence worker:

```sh
node --test spike/tests/m2/evidence.test.mjs
OLEA_M2_BACKEND_DIST=C:/Users/Aria/Projects/Development/Olea/spike/backend/dist node --test spike/tests/m2/backend-contract.test.mjs
```

The first checks receipt rejection, propagation, HTML escaping, fake local dependency/nested-child assertion behavior, preservation failures, causal phone assertion rejection, process identity, resource incompleteness, actual host child timeout/output bounds and scrubbed environment. Its dependency fixture is local test code, not proof of upstream npm install. The second uses explicitly selected existing compiled backend artifacts and mock Pi only: parser/frame, pending queue, request correlation/timeout and input bound checks. It creates no model request and establishes no Android or stock-agent workflow compatibility. Compiled artifact hashes are in `offline-checks.json`.

Generate offline reports from retained receipts:

```sh
node spike/tests/m2/evidence.mjs spike/m2/evidence/evidence/receipts.json spike/m2/reports .
```

This verifies referenced artifact bytes before writing `M2_REPORT.md`, self-contained `M2_REPORT.html`, and `matrix.json`. Current retained receipt set includes host-only tooling attempts and intentionally yields no Android workflow passes. Manager integrates measured runtime/Codex receipts later; the old M1 report/evidence remain immutable.

## Sole runtime owner: source-only Pi command

No evidence-worker provider allocation or Android execution exists. Do not run the old full Pi matrix. After a manager allocation, the sole runtime owner can create `.setup/private-pi-options.json` containing these path/reference fields; no credential value belongs here:

```json
{
  "allocatedPrompts": 1,
  "allocationId": "MANAGER_ASSIGNED_ALLOCATION",
  "attemptId": "DISTINCT_ATTEMPT_ID",
  "context": "android-app",
  "kind": "combined",
  "backendModule": "/opt/olea/spike/backend/dist/backend.js",
  "entry": "/verified-stock-pi/DECLARED_BIN_ENTRY",
  "workspace": "/workspace/disposable-m2-case",
  "stateDir": "/var/lib/olea/m2",
  "providerConfig": "/run/olea-provider.json",
  "bridgeConfig": "/protected/bridge.local.json",
  "output": "/workspace/evidence/DISTINCT_ATTEMPT_ID.json",
  "targetLabel": "Olea Fixture",
  "model": "gpt-6.1-terra"
}
```

```sh
node spike/tests/m2/pi-single.mjs .setup/private-pi-options.json
```

This command remains source-only until explicitly reported executed. It uses existing `Backend.start/command/stop/close`, preserving Pi compatibility while the Codex owner adds its adapter. It requests one prompt with ordinary upstream is-number installation, randomized arithmetic/file and nested child work. Combined mode additionally requests native phone tool selection, causal launcher click and Unix random-value transfer to cooperating fixture. No expected private oracle value is exposed. Shell environment is allowlisted; provider secret is read only by the existing supported extension through protected config path. Protected rootfs config remains trusted same-UID app state, not hostile-agent isolation.

Limits: startup30s, turn120s, idle45s, reactive12-round cancellation, bounded4096events/128tool names/256tool digests and existing backend256KiB frame/1MiB queues. No retries/fallback/automatic replay. Tool arguments/results are hashed and counted, never retained raw. Message errors become fixed transport/auth/rate-limit/unknown classifications; exact provider payload is discarded. First event/text and maximum inter-event gap timings exclude startup events. HTTP request count is unknown unless separately observed; tool/model rounds are not HTTP counts. Remote billing and strict token caps remain unknown. Reactive cancellation cannot prevent an already in-flight remote request. First lost acknowledgement is delivery unknown, not permission to resend.

Model child visibility: the prompt now asks actual child and nested child each to stay alive1500ms. The runner starts `observe-tree.mjs` rooted at actual Pi PID, requests100ms sampling with actual epoch timestamps, and stops the observer BEFORE its fresh `assertUnix` child work. Pi ancestry excludes those later runner sibling children. The observer retains only numeric stat/status identities, with4096numeric-entry/4096record/256descendant/120s/1MiB bounds. It checks final serialized diagnostic size including whitespace. A cap, denied read or changed root remains unverifiable; missing model-child snapshots remain untested. Numeric ancestry does not establish executable semantics: native owner must correlate tool intervals/digests and separately observed process image when available. No descendant is silently assumed to be Node. Standalone source-only command for runtime owner: `node spike/tests/m2/observe-tree.mjs OWNED_PI_PID 120000 .setup/model-child-observation.json`.

Independent runner checks exact resulting file, reruns installed dependency, spawns fresh nested children and verifies exit/stdout. These establish available behavior and artifact equality. They do not independently prove that the model executed each requested child instead of writing anticipated results. Tool-start/end digests preserve invocation provenance, while native process observation or a separate child-causality receipt is required to claim independently verified model child execution.

## Native observations returned through manager

Record current actual package/rootfs/APK hashes, Android/API/ABI, compile/min/target SDK, real Android UID, domain Activity/service versus run-as, boot identity, allocation and each owned PID/start ticks/real UID. `run-as` cannot pass modern app-domain acceptance. No stale PID is a cleanup target. Preserve baseline `dev.olea.spike` rootfs.

Phone assertions consume: `hostRealUid`, distinct `fixtureRealUid`, `hostOracleReadDenied`, `allRegisteredToolsExcludeOracle`, `oracleOutsideSharedWorkspace`, `oracleEqualsUnixValue`, `valueSha256`, `launcherPackage`, `targetPackage`, `before{atMs,package}`, `launcher{atMs,action:ACTION_CLICK,beforePackage}`, `foreground{atMs,package}`, `fixtureAction{atMs}`, `interveningLaunchIntentCount:0`, and `automaticReplayCount:0`. All timestamps must use a documented common clock. Foreground must follow native launcher click and precede fixture action, with no intervening launch intent. Require permission/revocation/stop denial and independent no-effect checks separately. Oracle receipt remains separate UID and outside all registered tools/shared Unix binds.

`supervise.mjs` exports finite host/runtime-owner process execution and explicit-PID resource snapshots. It counts/discards output with bounded hashing, terminates only the child it created, and reports descendant exit unverified. Resource snapshots include requested roots and unknown/missing records; PSS/RSS subtotals are not complete application cost or peak. Android use belongs exclusively to runtime owner. `assertPreserved` compares all original file hashes, permits additions and rejects empty inventory; protected credential preservation should use an owner-local equality result, never expose key bytes or key hashes in public evidence.

## Coordination and Rim

Worktree lineage independently identifies exact Olea root and head1775d536fb8650f7335729af90530733984614ea. Full dispatch records associate creator manager session, assignee fresh worker session and Run. Legacy Run coordinator_handle and projection.parent remain null; no repair is claimed. Manager explicitly activated work after verifying all three session/dispatch bindings.

`rim spawn --tag m2-evidence-contract` timed out after20s. Subsequent `rim status` and `rim punch` report no Rim root for current project context. No candidate ID is verified and no destructive repair was attempted. Local Git checkpoints preserve owned files.
