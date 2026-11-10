# Explicit stock full-access candidate

This candidate responds to the user's request to investigate stock full-access operation. It is an explicit alternative access policy, not a repair or silent fallback for the preserved workspace-write failures. No new model request or Android action was performed by this worker.

At Orca source commit `b98a0fba16561fadc06868fe3e8710781d705efd`, `src/shared/codex-permission-policy.ts` maps explicit `full-access` to `sandbox: danger-full-access`, `approvalPolicy: never`, reviewer user. Exact fetched source SHA256: `f2123be7a8a1fdd332f9be8649845a01aa5c27fe76dae9963352607c538510e0`. The launch-resolution snapshot passes `basis.permissionMode ?? 'ask'` unless `own` delegates to configuration. `src/shared/agent-launch/permissions/agent-chat-permission-mode.ts` resolves saved per-agent/global settings and falls back to ask when invalid. Therefore full access is supported, but these inspected paths do **not** establish that Orca universally defaults all agents to YOLO. Pi's inspected adapter supports only full access; that is a distinct agent constraint. Sources informed this original implementation; none were copied.

Stock Codex0.167.0 generated `SandboxMode` includes `danger-full-access`, `workspace-write`, `read-only` (generated-file SHA256 `8a59381e04efa84f9001e5c24444ee26fccf8f9e10bcfb02d2f6a24e85898843`). Generated `AskForApproval` includes `never`, `on-request`, `untrusted` and granular policy (SHA256 `81dd17defd9a7fd4785346d3ce54c14243353b43174c7417827210cbd3ef3c52`). Generated `SandboxPolicy` represents command/exec full access as `{type: dangerFullAccess}`. These are current stock supported interfaces, not a private agent patch.

The shared adapter now accepts explicit `codexAccessMode: full-access`, or server `OLEA_CODEX_ACCESS_MODE=full-access`. Default remains workspace-write/on-request. Invalid values reject. Full access uses both explicit stock thread policy and matching config; start receipts label `accessMode` and `filesystemIsolation: false`. Persisted thread identity includes access mode, and resume rejects changing it rather than silently escalating an existing thread. No provider turn is authorized merely by setting this option.

Sole runtime owner deterministic command, using a fresh task directory under the existing public payload, overall35seconds:

```sh
node /opt/olea/spike/tests/codex/full-access-preflight.mjs \
  /opt/agents/codex/node_modules/@openai/codex/bin/codex.js \
  /opt/olea/evidence/codex-full-access-a01.json full-access
```

The final positional argument is mandatory and exact. It starts stock app-server without real credentials or model calls, configures explicit full access, then issues stock `command/exec` with `{type: dangerFullAccess}`. Two bounded Node commands write known markers inside the disposable workspace and to its designated disposable sibling, with independent exact reads. Success of the sibling write demonstrates **absence of workspace filesystem isolation**, not a security pass. A synthetic noncredential environment marker checks that the provider-variable shell exclusion still applies. No phone operation, install, root, namespace alteration, modified proc view or agent binary patch occurs. This payload has syntax/unit validation only until the runtime owner supplies an actual service-domain receipt.

**Trust boundary:** full access grants ordinary Unix tools the Android app UID's effective filesystem/process authority and omits Codex sandbox/approval checks. It does not grant root or additional Android permissions. Same-UID agent shell can reach private app files, session homes and potentially bridge configuration or other same-UID processes; placing credentials outside workspace and scrubbing child environment is not a filesystem security boundary. Kotlin must still check current Android permission, enabled/stop state and allowed operation on every phone request, including requests made outside MCP; full access must never weaken those native checks. A separate-UID private fixture remains necessary for an inaccessible oracle. Do not claim isolation between same-UID agents or credentials. Accepting this supported policy requires an explicit product/runtime policy choice by the manager/user; historical isolated-sandbox failures remain valid and unchanged.

The conditional native model allocation remains unspent until the manager explicitly selects this route after deterministic results. No additional host provider budget exists. No Rim commands were used.
