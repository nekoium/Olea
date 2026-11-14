# Discussion 02 — settings coverage and simulation controls

**USER DECISION**: Simulation-control logic that leaked into the phone should move to the external demo controls. Source: this session's user follow-up, “some simulation control logic leaked into phone, should be moved out of phone into the control button.” This specifies the intended correction; this session still owns audit documents only.

**OBSERVED**: The user identified incomplete Settings coverage. The current `settings` screen contains launch preference and appearance; `about` contains a sample version and license navigation. Agents, Providers, Environment and Phone access exist separately under a provisional menu. Their existence does not establish complete configuration behavior.

## FC-11 — Simulation events appear as app actions

**OBSERVED**: In `scenario-demo.js`, `setupBody()` exposes “View sample failure”; `connectionScreen()` exposes “Show authentication failure”; app-away/locked screens expose “Show environment interruption”. Those inject conditions that a user of the actual app would not trigger through an app button. Android illustration screens additionally contain “Enable sample service”, “Unlock sample phone” and sample-oriented language. Diagnostics contain invented results. Capture returns with a “sample capture attached” notice without adding a transcript artifact.

**AGENT PLAN**: Put fixture selection, injected preparation/install/authentication failure, connection loss, permission revocation, runtime termination, app switching, lock/unlock and controlled agent events in external controls. Enable controls only in states where they make sense, and name their target conversation/workspace/capability. An injected event must update that target even if the phone currently shows another session. Keep scenario reset distinct from app reopen; reopen must not silently reset the fixture.

**AGENT PLAN**: Keep actual product actions in the phone: Retry preparation, Check connection, open Android settings, cancel permission/capture, Stop turn, disconnect session, stop/start environment, inspect diagnostics and return to the requesting task. These operations remain simulated internally. Moving simulation controls outside does not remove legitimate product recovery actions.

**AGENT PLAN**: Keep illustrative Android permission/consent screens in the phone because users encounter them, with system identification outside the product content. Use product-representative labels on their controls. Treat app switching and lock/unlock as external/system events, not Olea actions. Put demo instructions, fixture assumptions and technical-feasibility caveats in the surrounding review controls/instructions. Proposed unsupported functionality must remain explicitly conditional in review coverage; removing caveats must not imply support.

**OPEN**: Exact control grouping belongs to the demo implementation session. No style or placement redesign is proposed here.

## FC-12 — Settings and management are destinations without complete contracts

**USER DECISION**: Resume the last active session by default, with a fresh-chat setting. Source: PRODUCT.md, Conversation-first experience. Agent choice is explicit; one agent belongs to each session. Phone capabilities use distinct Android grants. Source: PRODUCT.md/DESIGN.md.

**OBSERVED**: No approved comprehensive Settings list was found. The provisional separation of app preferences and management screens should not be treated as final. A complete content audit must cover both Settings and those management destinations without assuming everything belongs on one Settings page.

| Area | Required content/behavior to resolve | Current gap / authority |
| --- | --- | --- |
| App entry preference | Current value, change, leave/return, relaunch, setup-incomplete and environment-unavailable behavior | Launch choice approved; persistence and combinations not demonstrated |
| Appearance | Current choice and persistence if retained | Light/dark exists in the demo; a user preference requirement is not inferred from its presence; no visual critique |
| Agents | Version, installed/readiness state per agent, supported configuration, install/update result and failure, effect on active sessions | Three agents approved; demo readiness is inaccurate and adding an agent bypasses installation |
| Provider/model configuration | Actual supported protocol, endpoint, credential handling, model identity, validation/save/cancel, saved versus verified state, expired authentication | Maintained app has per-agent endpoint/model/key fields; demo has display-name/endpoint fixtures and a generic login option |
| Environment | Preparing/ready/stopped/failed, start/stop scope, installation/maintenance progress, useful diagnostics and recovery | App-wide interruption and cleanup-pending behavior absent from the sample contract |
| Phone access | Phone-tools enablement, actual grants, notification posting versus reading, Android routes, return/cancel/revocation | Demo checklist omits separate bridge enablement and conflates denial types |
| About/licenses | Actual build/version identity and included-component licenses | Browser placeholders do not establish production content |

**AGENT PLAN**: Do not add speculative language, telemetry, backup, account, reset-data, scheduled work or notification-preference settings to make the page look complete. Add requirements only when they serve approved current behavior or the user explicitly selects them. General destructive data-management flows are not authorized by this audit.

## Proposed fixes, in order

All entries below are **AGENT PLAN**, not implementation authorization.

1. **Clean the product/action boundary (FC-11).** Move condition injection outside the phone, retain real app recovery actions, and remove sample-oriented promises from product-facing results. Establish contextual event controls rather than adding a button for every card.
2. **Correct the first usable journey (FC-01, FC-02, FC-03, FC-09).** Prevent onboarding bypass; track readiness per agent; retain explicit workspace/agent selection; bind tools to workspace identity; repair grant/deny/cancel/return paths; connect setup to first conversation without reseeding.
3. **Specify Settings plus management content (FC-12, FC-05).** Make supported agent/provider/model/environment/capability state inspectable and editable through complete save/cancel/error/return journeys. Explain changes that interrupt running sessions. Distinguish persisted configuration from verified readiness.
4. **Make session behavior faithful (FC-04, FC-05).** Define Working/Needs you/Done/Error/Stopped from agent events. Cover cancellation pending/failure, upstream interactions, live-session capacity and explicit disconnect. Keep proposed concurrency policy open pending user agreement.
5. **Preserve work through navigation/recovery (FC-06).** Assign drafts to context; specify Back and root exit; distinguish saved display from canonical continuation; cover reconnect, interrupted reply, storage/save failure and uncertain effects without replay.
6. **Complete an actual phone task (FC-10).** Connect URL request, bridge availability, dispatch, observed/unconfirmed outcome and return to its transcript. Keep permission grant separate from task success. Show capture output only when an artifact/result actually exists in the fixture.
7. **Bound the larger promises (FC-07, FC-08).** Keep external folders conditional on feasibility. Specify terminal independence and PTY requirements, rather than equating the existing command runner with named persistent shells.

## Acceptance for a later demo correction

**AGENT PLAN**: Review connected journeys, not card counts. For each corrected path, record entry prerequisites; real user action versus external event; affected conversation/workspace; visible state transition; preserved draft/transcript; Back/cancel/exit; and recovery outcome. Focused checks should assert those contracts.

**OPEN**: Retaining the two-live-session limit, exact provider/model mutability and unsupported upstream interaction handling remain unsettled. The user has not approved the preceding batch's capacity recommendation merely by asking for further findings.

**OBSERVED**: This follow-up changes only this audit record. Demo files, root records and maintained code remain untouched. Findings rely on the inspected source and previous bounded state probes; no new device/provider/browser acceptance is claimed.
