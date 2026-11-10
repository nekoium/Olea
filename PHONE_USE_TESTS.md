# Phone-use tests

Status: agreed coverage and alpha priority; individual full-test fixtures are proposals. No phone-use test has run yet.

## Access boundary

Use only permissions and special access a user can normally grant on a stock personal Android phone. No root, system privileges, or active ADB connection during normal product use. Accessibility enablement and screen-capture consent are distinct system interactions.

## Alpha acceptance

The agent must open an app by clicking its launcher entry through Accessibility. An intent-only launch does not satisfy this test. Verify that the target app becomes foreground because of the click.

User's stated reason: Accessibility is the most important capability to test in alpha.

Proposed procedure: begin on a supported launcher screen, inspect its exposed nodes, locate the target app, and invoke its click action. If no clickable node is exposed, evaluate an Accessibility gesture rather than substituting an intent launch. Exact launcher, target app, and evidence collection remain to be selected.

## Full validation coverage

Run a simple successful test for each category. User's stated reason: each category needs coverage. This does not commit Olea to exposing every Android API.

The following individual checks are assistant proposals, pending implementation design:

| Capability | Minimal test | Evidence of success |
| --- | --- | --- |
| Intents and app links | Request opening a supplied HTTPS URL in the browser. | Browser displays the intended destination; dispatch alone is insufficient. |
| Structured Android APIs | Read the device's current location after the user grants access. | A valid location result is returned. Permission/provider failures must be actionable but do not count as the successful scenario. |
| Files and media | Create and read back a small test file in a folder selected through Android's file picker. | Read-back content matches; access uses the granted folder. |
| Notification access | Post a test notification from a separate test app and read it through the notification listener. | Expected test notification is received; reading Olea's own notification alone is insufficient. |
| Accessibility | Locate an app entry on a supported launcher and activate it with Accessibility. | Target app becomes foreground as a result of the click. |
| Screen capture | Capture a harmless test screen through MediaProjection after system consent. | Captured image contains the expected non-protected content. |
| App-specific integration | Invoke a documented exported interface on a cooperating test app. | Test app confirms the requested action; fixture success makes no claim about arbitrary third-party apps. |

Opening the browser to a supplied link was the user's first concrete phone-use scenario. Reading page content back is not an agreed requirement.

## Results

Not run. Record actual device/Android version, app and fixture versions, granted access, observed outcome, and evidence when tests execute. Emulator results do not establish physical-phone compatibility.

## Related documents

- [Product scope and capability discussion](PRODUCT.md#phone-use-scenario-and-approaches)
- [Release milestones](ROADMAP.md)
- [Current progress](PROGRESS.md)
