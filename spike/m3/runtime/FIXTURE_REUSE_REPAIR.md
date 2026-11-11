# Fixture reused-intent repair: direct evidence, no model replay

Assignment `task_c3a0e8a4fd7e` / `ctx_57238a628c53` preserves the failed Pi notification allocation at `89f4caf`. This batch uses0model prompts; global7/8consumed,1unallocated. No provider credential read, agent change, new framework or unchanged suite occurred.

## Minimal implementation

Inspection found both native callers using only `FLAG_ACTIVITY_NEW_TASK`. The separate fixture handled the documented notification/value request only in `onCreate`; it had no `onNewIntent` override. The repair shares that existing handler between `onCreate` and `onNewIntent`, updates the Activity's current intent on redelivery, and adds callback/task/instance metadata to the existing append-only launch log. Value-size validation and app-private oracle file remain unchanged.

Actual direct evidence showed that the handler override alone was insufficient: the existing `NEW_TASK` request could simply foreground the task without delivering a new handling event. Both native fixture callers now use `NEW_TASK | SINGLE_TOP`, making intended reuse delivery explicit. No exported component, intent action, permission, package, arbitrary-file reader or private-oracle tool was added. The fixture manifest source hash is unchanged; only the fixture handler and two caller flags changed.

Original installed fixture and runtime APKs were pulled and preserved before their respective updates. Exact old/new raw APK hashes, build/install results and compiled source hashes are retained. Upgrades used `install -r`, with existing app data/rootfs/cache preserved. No uninstall, data clearing, baseline reset or task wipe occurred.

## Retained attempts

- `fixture-reuse-direct-a01.json`: the repaired fixture received one fresh anchor in `onCreate`, but the observer compared device time with the host clock and failed its timestamp assertion. `fixture-reuse-anchor-observed-a01.json` independently preserves that already-delivered anchor. It was **not reposted**.
- `fixture-reuse-direct-a02.json`: continuation stopped before any notification request because it incorrectly compared the host's foreground after development restart with the fixture anchor's foreground. Posts0; retained observer-precondition failure.
- `fixture-reuse-direct-a03.json`: one distinct new reuse request using the old native `NEW_TASK` flags returned dispatch success but produced **no handler-log append**. This is retained actual direct failure and prompted the caller-flag change. It did not become a successful post by inference.
- `fixture-reuse-direct-a04.json`: after the native APK upgrade, the fixed600ms host startup assumption was insufficient; readiness fetch failed before any fixture post. Posts0. Read-only follow-up observed the host eventually ready. The helper now uses bounded actual native readiness before delivering effects.
- `fixture-reuse-direct-a05.json`: two **new**, distinct direct requests after the caller fix passed. They are neither the Pi turn nor automatic retries of its uncertain request. The anchor and all failed attempts remain unchanged.

No provider/model prompt, historical PID cleanup or private protocol shim was used. Observer corrections repeated only measurements/setup; actual effect requests are individually counted in retained receipts.

## Final two reuse checks

The existing repaired fixture anchor was task60, instance235237402 and ActivityRecord117965953. Both final requests retained exactly that same task, instance and independently observed foreground ActivityRecord.

| Request | Actual handler | Notification update time | Native listener entries after request |
| --- | --- | --- | --- |
| New reuse1 | `onNewIntent`, exactly1new log event |1794375472631|1|
| New reuse2 | `onNewIntent`, exactly1new log event |1794375474131|2|

Each notification-manager update is later than its same-device action timestamp and earlier update, with separate fixtureUID10217/package/id42/exact marker text. One handler append and one listener entry per request establish no duplicated handling for these two deliveries. The initial anchor plus two final handled requests produce exactly3new handler events; the earlier ignored old-flag request has no handler event and stays failed.

The hostUID10216 attempted to read the existing fixture private oracle and received a positive `Permission denied`; the fixtureUID10217 still reads the unchanged exact hash. Manifest/exported interface and private storage boundaries remain unchanged. Only the owner-side measurement can inspect the private oracle; no runtime phone-tool reader was added. Notification payload is the same harmless static fixture marker; unique handling/event/update timestamps distinguish deliveries.

## Preservation and settled state

All7historical canonical file hashes remain equal. Protected provider/bridge modes600, original credentials/rootfs/cache and prior APKs remain intact. Final inventory: runtimePID7996UID10216 and fixturePID7596UID10217 only among reviewed appUIDs. Phone/backend/Accessibilityfalse; location/listener development grants retained. No selected-folder grant/capture image appeared. Emulator remains running, sole mutation lease retained, no experiment in flight.

The **failed Pi model notification read remains failed**. These direct repaired-fixture passes establish fresh reuse behavior only; no new Pi or Codex model claim follows. The final prompt remainsunallocated. URL/Chrome choices, selected-folder/content and explicit capture-consent/fresh image remain separate checkpoint gaps.
