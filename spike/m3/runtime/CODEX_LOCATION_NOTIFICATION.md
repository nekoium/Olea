# Stock Codex location and separate-notification group

Allocation `m3-codex-location-notification-01` consumed exactly **one** primary `gpt-6.1-terra` top-level prompt, with no explicit retry, fallback or replay. Global budget is now **6/8 consumed,2unallocated**. This run covers structured last-known location and separate-app notification only. It does not attempt URL, selected files or capture, and does not provide image input to the model.

## Prerequisites, deployment and bounded call policy

`categories-preflight-a01.json` compares every changed deployed runner/shared-prompt/backend byte hash with its exact working-tree input. Public code was staged separately at `/opt/olea-m3-categories-a01`; older deployed trees remain unchanged. `categories-deployed-final-a01.json` records the same individual final bytes plus public payload SHA256. Native APK remained the installed a08 from the prior failed-start repair; no new Android build/install was needed.

Development setup explicitly enabled native phone actions through the existing enable-once flag and host restart. Accessibility stayed disabled because this group does not need it. Fine/coarse location and notification-listener grants were already provisioned development state; they are not ordinary user consent evidence. Direct preflight returned valid GPS last-known24.9876/121.54319833333334, matching independent GPS-state coordinates, and a connected **empty** fixture-notification listener. Separate fixture remainsUID10217, native bridgeUID10216. No model call was made before this readiness passed.

The existing MCP integration now accepts an optional validated allocation policy. For this run it lists only capabilities/location/fixture_notify/notifications and refuses other tool names; it allows at most5native deliveries per helper instance, counting attempts before dispatch. The focused policy test proves that an unlisted URL tool and a sixth call cause no native delivery. Three affected MCP tests pass (`allocated-policy-tests-a01.txt`), without repeating the previous successful suites. These changes are original integration code using stock MCP, not an agent patch or protocol shim.

The host atomically created the unique allocation claim before any provider read. It then programmatically compared the retained protected provider config with the **sole authorized absolute root source**, outputting equality booleans only. No secret/config value, protected digest or header entered reports, arguments, payload, prompts or shell/MCP environment. The existing Codex adapter uses provider environment only inside the stock app-server process and explicitly excludes it from shell/MCP inheritance. Same-UID filesystem credential isolation remains absent in full access.

A native launch subclaim and the existing runner allocation claim prevent accidental replay. `categories-allocation-claim-a01.json` is the immutable pre-submission claim snapshot (`submissionAttempted=false` at that time); `categories-ledger-settlement-a01.json` separately records the later actual one submitted/completed turn. No uncertain action was retried.

## Actual stock execution and independent outcomes

Stock Codex0.167 used explicit `danger-full-access`/approval `never`, with no filesystem isolation, through actual target36 Kotlin runtime/PRoot/Node. The shared Backend class owned this one Codex adapter; there was no second long-running shared server. Before submitting the prompt, stock app-server registration independently confirmed exactly the four allocated tools. Prior all14tool discovery is reused and remains a separate receipt.

The real model completed exactly4MCP calls, once each, in order:

1. `phone_capabilities`
2. `phone_location`
3. `phone_fixture_notify`
4. `phone_notifications`

Native audit independently records the same4operations. No Unix command item, permission change or unallocated category call occurred. `codex-location-notification-a01.json` retains per-tool names and bounded actual results rather than only a generic MCP count.

The model location result is latitude24.9876, longitude121.54319833333334, GPS accuracy5m and reported age87578ms. Independent location-service state matches the coordinates. This passes **last-known** location use; it does not pass fresh/current-under5s location or physical-device location coverage.

The notification listener changed from empty to exactly package `dev.olea.m2.fixture`, id42, text `OLEA_NOTIFICATION_FIXTURE`. Independent separate-UID fixture launch appended exactly one new interface event between native notification dispatch and read. Recorded times are dispatch1794373658277, fixture event1794373658883, native read1794373662576. Independent Android notification-manager record confirms fixtureUID10217/id42/exact text.

The first independent collector used default `dumpsys notification`, which redacts text; its text assertion failed and remains unchanged in `categories-independent-a01.json`. The successful **read-only** correction `notification-oracle-a02.json` collected that same fixture record with `--noredact`. It did not post a notification, call another native tool or replay a model turn. Empty listener baseline, exact tool output, one causal fixture event and independent notification record establish new separate-app receipt; a cached historical notification alone cannot explain those deltas.

Thread `01a1c900-c8ef-76e0-a2b3-258d748a325f`, completed turn `01a1c900-cd9f-7963-a971-f1a44fa32986`. Explicit stop/restart/resume used the same thread/home/workspace/full-access mode and required **no additional prompt**. Startup2401ms, resume2086ms, complete runner38788ms. Native wrapper elapsed40866ms, did not time out, observed root exit and reported no cleanup faults. All34tracked UID/start identities are independently absent. Finite snapshots still do not prove arbitrary unseen-fork cleanup.

All seven historical canonical file hashes remain identical, and the new same-thread resume metadata/transcript hashes are retained in `categories-session-preservation-a01.json`. Its first read-only compound hash diagnostic failed shell escaping; explicit previously recorded paths then verified equality, without any work/effect replay.

Native STOP then rejected another notification read as `PHONE_STOPPED`, without changing the separate private fixture oracle. Latest final state in `categories-final-state-a01.json`: host5925UID10216 and fixture6139UID10217 only in reviewed app inventory, phone/backend/Accessibility false, no SAF grant/capture file, emulator running. Development location/listener grants remain. Sole mutation lease is retained and no experiment is in flight.

## Budget, qualifications and remaining acceptance

The last cumulative usage snapshot is68372input/274output/46930cached-input/0cache-write/68646total tokens, including24reasoning-output tokens. Repeated cumulative updates were not summed. Actual HTTP/model transport request count and remote billing remain unknown; one top-level prompt can contain multiple inference requests. Existing120s turn,45s idle,12observed tool-round,256KiB frame and bounded queued/output protections remain; no strict remote token/billing guarantee is claimed. This group actually used4phone calls, below its enforced5delivery policy.

The historical all14tool discovery's ESRCH scan fault/`trackedExitVerified=false` remains unchanged. Its independent20identity absence is not rewritten into a generic cleanup pass. This new run has its own separate no-fault34identity cleanup result. The original M2 failures, stale-location attempts and redacted-observer failure are retained.

`providerConfigSha256` in the existing model runner hashes its generated **stock Codex config.toml policy**, which contains no provider key; it is not a digest of protected `/run/olea-provider.json`. Protected source identity is recorded only as equality booleans.

Still required: actual browser first-run choices and HTTPS destination proof; actual SAF folder selection plus independent content readback; actual MediaProjection consent and independently inspected fresh PNG. None blocks the now-completed location/notification group, and none is claimed by it. No further model request is allocated by this receipt.
