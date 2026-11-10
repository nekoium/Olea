# Explicit full-access no-model result

The manager selected a separate supported stock Codex policy for this bounded experiment: `danger-full-access`, approval `never`, **no agent filesystem isolation**. Historical workspace-write/socket/bubblewrap failures remain unchanged. This result supersedes a blanket inference that Codex cannot perform Unix commands on this runtime; it does not repair the restricted route or establish a model workflow.

Actual target36 Kotlin RuntimeService execution passed in3193ms, with a35s outer deadline. HostPID9619, realUID10216, startticks150689, service domain `u:r:untrusted_app:s0:c216,c256,c512,c768`; APK `.setup/runtime-a07.apk` SHA256 `dbd494c8f9c533b20a5ed0a067dbb2496a34c2494911a9fc9cb4fb19f6435887`. Unmodified stock Codex0.167.0 initialized, then both stock `command/exec` requests using `{type: dangerFullAccess}` exited0/stdoutOK. Known marker bytes matched independently inside the disposable workspace and at its designated sibling path. **Sibling write is expected and proves absence of workspace isolation**, not an outside-denial security pass.

Both commands checked that the synthetic noncredential provider environment variable was absent. No real provider configuration/key was read by this preflight, no model prompt was sent, and no phone operation was called. This only establishes environment-variable exclusion; same-UID tools can still read app-private files, protected credentials and bridge configuration if reachable. Android app UID and Kotlin current phone permission/stop checks remain the intended phone authority.

Exact source deployed from manager-reviewed `fc04ee1`, rebuilt through existing TypeScript build. Public tar `.setup/public-full-access-fc04ee1.tar.gz` and source/dist/probe/native-device hashes are in `evidence/codex-full-access-a01-{source,device,artifact}-hashes.txt`. Previous public payload archives and restricted-route evidence are retained. Native wrapper atomically claims `/run/codex-full-access-a01.started` before running; it cannot be replayed after uncertain delivery.

Receipts:

- `evidence/codex-full-access-a01.json`: stock command replies and independent probe readbacks, explicit mode/approval/isolation labels.
- `evidence/codex-full-access-a01-native.json`: native UID/domain/identity,35s deadline, exit0/no timeout/no truncation/drain faults.
- `evidence/codex-full-access-a01-independent.json`: separate host observer re-read both exact files and asserted all mode/native/permission conditions.
- `evidence/codex-full-access-a01-processes.txt`:18:38:36Z UID-filtered snapshot lists primary9619/fixture9732/repeat12459 only, no listed PRoot/Node/Codex. Adapter reported rootExited=true, descendantsVerified=false; do not replace the latter with a general cleanup guarantee.
- Before/after capabilities independently show phoneEnabled=false, backendRunning=false, Accessibility=true. No native stop flag was re-enabled.

Reproduction command, **historical attempt only, do not replay it**:

```sh
node /opt/olea/spike/tests/codex/full-access-preflight.mjs \
  /opt/agents/codex/node_modules/@openai/codex/bin/codex.js \
  /opt/olea/evidence/codex-full-access-a01.json full-access
```

This result permits manager review of the next separately activated bounded Codex Unix model case. It does not itself spend or authorize that prompt. Global budget remains3/8 consumed; worker Pi1/Codex0. Sole emulator mutation lease remains with this same worker under explicit reacquisition task_f8e1ba69c277; no transfer or successor exists. No further action will run before the manager's concrete activation.
