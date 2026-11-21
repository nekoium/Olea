# Native mapping and verification route

**OBSERVED**: Starting checkout `39e3a41`, branch `nekoium/soft-native-ui`; approved reference `ccabc09`; broad file implementation `94fb76f` is in the starting history. Supplied brief already exists in `../brief.md`. Sole worker, no provider requests or physical devices.

**AGENT PLAN**: Preserve runtime, session registry, Android permission authority and backend. Translate Soft into Compose Foundation components and native sans-serif, with dp/sp dimensions and real system insets. Six palettes use one registry; appearance and palette preferences are independent. Retain current setup ordering and explicit selections so persisted setup progress remains interpretable.

**OBSERVED**: Emulator selected explicitly: `emulator-5554`, Android 16, x86_64. Production `dev.olea` and older diagnostic apps already exist. No uninstall/clear is allowed. Use a separate `dev.olea.softtest` diagnostic identity for this assignment, keeping production identity/version/signing untouched. Build assets are regenerated here with `OLEA_ABI=x86_64`; no original-checkout credentials/configuration are copied.

This matrix maps all **51** reference specimens to production surfaces. “Fixture” means deterministic presentation evidence, never connected-agent or PTY acceptance. Actual observed check status and screenshots are in the result/check records.

| # | Reference ID | Native route/state | Capability and evidence boundary |
| --- | --- | --- | --- |
| 1 | welcome | Setup step 0 | Actual onboarding entry |
| 2 | choose-agent | Setup step 1 | Explicit Pi/Codex/Claude choice; no automatic selection |
| 3 | prepare | Setup step 3 | Actual status and cancellation, no invented percentage |
| 4 | setup-error | Setup step 3 plus failure notice/diagnostics | Failure from real snapshot or labeled fixture |
| 5 | install | Setup step 4 | Actual agent installation status/actions |
| 6 | setup-provider | Setup step 5 / ProviderEditor | Adapter-specific endpoint/model/key; no connection-success fiction |
| 7 | setup-workspace | Setup step 2 | Managed or connected workspace; kept before preparation to preserve existing setup state |
| 8 | setup-access | Setup step 6 | Optional review or explicit skip; broad grant separate |
| 9 | ready | Setup step 7 | Saved configuration summary; first reply checks provider |
| 10 | history | Conversations | Actual session registry and runtime states |
| 11 | search | Conversations search field | Actual title/workspace/agent filtering |
| 12 | empty-history | Conversations with no matches/filter | Native empty state |
| 13 | draft | New conversation | Joined setup/composer; explicit agent before send |
| 14 | draft-agent | Choose agent bottom sheet | Only available before accepted first send |
| 15 | draft-workspace | Choose workspace bottom sheet | Workspace remains distinct from file authority |
| 16 | keyboard | Draft with real Android IME | Native keyboard and safe insets |
| 17 | working | Chat / working | Actual state; fixture evidence does not prove a model request |
| 18 | tool-detail | Expandable message tool row | Real output selectable; fixture labeled |
| 19 | needs-you | Chat interaction card | Existing supported upstream choices and request ID binding |
| 20 | done | Chat / done | Turn completion, not goal completion |
| 21 | stopped | Chat / stopped | Partial output and explicit continuation |
| 22 | reply-error | Chat error/failure | Saved draft, no automatic prompt replay |
| 23 | concurrent | Conversations / independent states | Session selection does not stop others |
| 24 | conversation-details | Chat overflow bottom sheet | Workspace/phone/disconnect/global STOP on demand |
| 25 | runtime-lost | Chat unavailable status | Saved messages remain; no survival claim |
| 26 | reconnect | Chat Start/reconnect / Environment | Explicit restart; no automatic replay |
| 27 | stop-confirm | Global STOP bottom sheet | Distinct from cancel-turn and shell close |
| 28 | workspaces | Workspaces | Select opens filtered Conversations |
| 29 | create-workspace | Create workspace | Managed storage creation |
| 30 | connect-folder | Create workspace → SharedFolderActivity | Existing actual all-files Android route, not browser picker fiction |
| 31 | workspace-details | Workspace details | Contextual conversations, files, terminal and location |
| 32 | files | WorkspaceFiles directory | Actual filesystem; empty/loading/error preserved |
| 33 | file-preview | WorkspaceFiles selected file | Read-only bounded native preview |
| 34 | folder-lost | Workspace details/files access error | Actual source status plus Android settings; no data removal |
| 35 | menu | App menu bottom sheet | Quiet destination rows; dismiss preserves context |
| 36 | agents | Agents | Per-agent install/update/configure group |
| 37 | providers | Providers | Agent-specific actual configuration status |
| 38 | provider | ProviderEditor | No unsupported presets/auth/hot model switching |
| 39 | environment | Environment | Actual status/summary; diagnostics on demand |
| 40 | settings | Settings | Launch preference, appearance, six saved palettes |
| 41 | about | About and Licenses | Real version/ABI and retained notices |
| 42 | phone-access | Phone access → PhoneAccessActivity | Actual grants, explicit bridge enablement |
| 43 | accessibility | PhoneAccessActivity accessibility page | Actual Android settings route/status refresh |
| 44 | permission-needed | Chat tool/interaction failure → Phone access | Existing adapter/tool messages; no new automatic permission workflow |
| 45 | permission-denied | PhoneAccessActivity permission state/message | Actual denial/revocation status; Android owns grant UI |
| 46 | capture-consent | PhoneAccessActivity capture page → SystemUI | Fresh real consent; never a permanent grant |
| 47 | terminal | WorkspaceTerminal | Actual PTY / isolated WebView; fixture viewport is separate |
| 48 | terminal-switch | Terminal sessions bottom sheet | Workspace-specific sessions and saved selected shell |
| 49 | terminal-running | Terminal viewport and footer/extra keys | Input, resize, Ctrl-C and native interrupt retained |
| 50 | terminal-close | Close shell bottom sheet | Shell termination distinct from leaving view |
| 51 | terminal-lost | Disconnected viewport notice | Output retained, new terminal required |

**OBSERVED**: Initial mapping was made before edits; final verification is recorded in [result.md](../result.md), [capture manifest](native/captures.json) and [comparisons](comparisons.html). There are 68 unique native UI captures from five deterministic/UI cases, plus seven selected real-terminal images. All five UI cases passed; the real PTY suite, focused live-palette continuity and WebView factory checks passed separately. The keyboard/phone/folder checks include actual Android UI; the remaining synthetic snapshots are labeled.

**OBSERVED — evidence limits by mapping**: `prepare`, `setup-error`, `install`, `setup-provider`, `ready`, working/Needs-you/reply outcomes and reconnect presentation use synthetic snapshot state, with actual native package/configuration/status bindings preserved. No upstream provider question or model reply was generated. `permission-needed` maps to existing tool/interaction errors plus phone access rather than a new automatic permission workflow. `folder-lost` remains mapped to the real source-error path but was not forced by revoking a user's folder. Connected-folder permission-required/cancel, actual Accessibility return, capture cancellation, native files and real terminal paths were exercised. No browser sample is treated as permission or runtime success.

**OBSERVED**: Also retained native-only location/notification/cooperating-app controls, app notifications, selected document folder, all-files grant, provider key visibility, binary/large-file errors and third-party licenses. The presentation changes do not alter their underlying authority or storage behavior; only focused phone/file paths were exercised, not every optional grant.
