# Established-capability consolidation record

Status: implementation complete for the established capability list in [the plan](CONSOLIDATION_PLAN.md). Provider-backed acceptance of this integrated build remains unverified. Original tests and failures remain historical evidence; they were not rerun as a release matrix.

## Delivery

Updated maintained application: `dev.olea.app`, version `0.2-base`, versionCode6, target API36/x86_64. Final APK: `.setup/consolidation/olea-0.2-base-x86_64.apk`, also `android/app/build/outputs/apk/debug/app-debug.apk`. SHA256 `b46c681e01bb1852dc7e35887b6d814bee6e70ec077ad6ca7a7a6f16fd0cfdf0`. Original API36/x86_64 core/data and historical packages remain preserved. No remote, publication, clone or old-worktree cleanup occurred.

Capabilities now maintained and exposed:

- Stable saved conversation/workspace registry; original `conversation` and `/workspace` paths preserved. Multiple saved sessions, up to two connected stock-agent sessions. Selection does not submit or replay prompts.
- Stock Pi and optional stock Codex, configurable provider settings, native streaming/tool/history presentation, separate cancel/disconnect and whole-runtime STOP.
- Ordinary upstream install/update controls; updates touch the agent prefix, not copied canonical homes. No migration by cloning Codex state with absolute history references.
- Native authenticated loopback bridge, shared supported Pi extension and Codex MCP; disabled at startup and on STOP/backend/agent failure.
- Normal Android routes for Accessibility, selected folder read/write, location, notification access and explicit MediaProjection consent. Configurable cooperating exported Activity/action and HTTPS browser opening.
- Capture request identity, pending/ready/denied status and PNG metadata; no screenshot pixels in model input.
- Runtime status and preserved resource-measurement references, without continuous sampling or expanded compatibility claims.

The minimal native presentation remains an implementation choice. Parallel production UI discussion files were not changed.

## Meaningful history

| Change | Root commits |
| --- | --- |
| Scope/authority, worker ownership | `8d25828`, `5c9abf5` |
| Runtime maintenance/binds | `704a527` |
| Registry and safe migration | `ee7c936` |
| Shared phone tools, configurable Codex, workspace binding | `158e9fc`, `daf020b`, `6aa79b7` |
| Pi absent reserved-file resume repair | `d346f3d` |
| Native Android capability services/consent bridge | `8de90cf`, `d06142f`, `3d4adeb` |
| Stock Codex history capability and capture request schema | `fb18229` |
| Android integration | `93f903f` |
| Uncertain cancellation/draft preservation | `b601ebe` |
| Backend startup cancellation ownership | `609a250` |
| STOP responsiveness during DocumentsProvider I/O | `fde6b7f` |
| User/contributor documentation and finite checks | `1e4822d` |

## Lean checks and concrete repairs

Full APK build and asset verification passed. Focused backend fixture checks passed (13 after the final startup-race repair); they establish local protocol/validation, not model behavior. Worker-local bounded checks covered registry migration/corruption/path preservation, native auth/STOP/consent admission, and blocked fake-provider cancellation. Temporary check harnesses were removed by their workers; useful source assertions remain only at costly regression boundaries.

Real emulator checks:

- [Final Pi integration](consolidation/FINAL_PI_CHECK.json): two real stock Pi sessions, distinct workspace write/read, selection without replay, local shell cancellation with no delayed effect, Pi remaining connected, oversized draft rejection, bridge authentication and disabled effects, STOP/selection persistence.
- [Codex](consolidation/CODEX_NO_MODEL_CHECK.json): ordinary optional install, stock app-server startup, direct no-model shell write/read, same thread identity after STOP/reopen. Stock0.167.1 returns `list_turns is not supported yet`; a precise metadata-only fallback retains Olea display and reports the limitation. This does not prove canonical history retrieval through that method or model continuation.
- [Capture](consolidation/CAPTURE_CHECK.json): app button, real Android Share entire screen consent, valid1080×2400 PNG, then STOP invalidates a fresh request and denies effects. Exact PNG bytes were valid; model did not see them.
- [Accessibility click](consolidation/LAUNCHER_CLICK.json): enabled through normal Android settings/Allow UI; native HOME/swipe/tree and current-node ACTION_CLICK opened Olea. Subsequent independent UI dump showed the intended MainActivity. Source bounds remain300 nodes/depth24/600 child lookups/10-second node age.
- [Selected folder](consolidation/FINAL_SELECTED_FILE.json): real picker created `Documents/OleaConsolidation`, normal read/write consent, final off-main UUID-file roundtrip. Independent development read found exact `Final off-main SAF roundtrip` bytes. This is not general folder editing/cleanup support.
- [Location](consolidation/LOCATION_CHECK.json): normal runtime permission, returned last-known location with timestamp/age. Aged result is explicitly labeled, not a new position fix.
- [Notifications](consolidation/NOTIFICATION_ACCESS_CHECK.json): normal notification-access settings/Allow UI, bounded active notifications from Android's separate package. This is read access, not posting/scheduling.
- [Cooperating app](consolidation/COOPERATING_APP_CHECK.json): configured actual historical fixture's explicit exported Activity/action using app fields; native dispatch led to independent separate-UID oracle exact value `maintained-native-action`. Fixture is not packaged in Olea and its name is not a product default.
- [URL](consolidation/URL_DISPATCH_CHECK.json): native opened exact `https://example.org/?olea=maintained-base`. A later independent UI dump showed Example Domain, exact address and Connection is secure; Chrome also retained a No internet connection banner. No general network-health claim.

Retained failures: first device collector used HttpURLConnection and failed Android cleartext policy after Pi/workspace assertions; corrected raw-socket check passed without weakening app policy. First Codex check failed unsupported turn listing after installation; exact stock capability repair passed. A third Codex collector's host command timed out after60s, while the app-owned saved receipt independently records successful completion; exported receipt is retained. An attempted shell launch of non-exported PhoneAccessActivity was correctly denied; ordinary MainActivity Phone navigation remained the use path. Some UI helper sequences ran against stale foreground Settings and failed before reaching controls; observed snapshots were reread before the successful actions. None of these are model/provider attempts or substitutes for missing acceptance.

The review found four actionable source issues and fixes: main-thread DocumentsProvider blocking STOP, lost Cancel after delivery uncertainty, disconnect racing startup, oversized draft loss. Fixed with bounded off-main/cancellable file work, retained uncertain execution state, startup cancellation settlement/stale-open rejection, and accepted-draft return semantics. Slow providers may ignore cancellation; the sole file worker stays occupied and rejects further effects rather than creating more stuck workers. STOP cannot roll back already dispatched effects.

## Resource evidence reused

Historical [feasibility costs](../../spike/reports/FEASIBILITY_REPORT.md) and [one/two-session samples](../../spike/m2/reports/REPEAT_UPDATE_CHECKPOINT.md) remain useful evidence. They are finite named-process samples, not current peak memory, battery, thermals or universal concurrency guarantees. Runtime status exposes connection state only; no needless benchmark infrastructure was imported.

## Final state and worker lifecycle

Manager Run `run_3b684f9f9240`; all implementation/review/fix workers settled and released by exact Dispatch IDs. Three newly created child worktrees were removed only after committed integration and verification of no unique remaining files; the adapter's generated dist/node_modules were disposable and removed first. Existing historical worktrees, user sessions, `.agents/`, `delegations/`, advisory HTML and `docs/ui/` remain untouched. No successor was needed: bounded goal completed before the400k manager budget; exact cumulative usage was not exposed by the harness.

[Final finite state](consolidation/FINAL_STATE.json): normal MainActivity shows `Stopped. Workspace and conversations saved.` Phone bridge disabled. No Node/npm/PRoot process in the reviewed process list. Historical runtime/fixture hosts remain. Emulator/data/grants are preserved. Manager relinquishes sole device mutation ownership with no successor and no work in flight. Final screenshot `.setup/consolidation/final-open.png`; build/attempt logs retained under `.setup/consolidation/`.

## Exact remaining limits

No provider-backed Olea prompt, retry, fallback or replay was submitted; existing provider credential source was not opened. Live integrated Pi/Codex streaming, model-selected phone/tools, cancellation during a provider turn and provider-backed canonical continuation remain unverified under the provider-test freeze. Protocol fixtures, direct stock command calls and previous experiment results do not close them.

Physical Android14/ABI/ARM64, authenticated Claude, scheduled work/alarms, model screenshot interpretation, broad migration/export/backup, general phone-file editing, interrupted-update recovery certification, broad lifecycle/battery/thermal validation and production UI redesign were never established and are outside this consolidation. No continuous team loop remains after completion.
