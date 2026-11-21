# Shipping-day provider and device preflight

**USER DECISION**: Test the supplied temporary third-party provider credentials locally before agent integration. Pi and Codex use GPT connectivity candidates; Claude Code uses a Claude connectivity candidate. Small/old usable models are only for minimal connection-and-run checks, after which Codex/Claude provider-backed testing stops. All real or token-intensive functionality tests, including phone access, use Pi only with `gpt-6.1-sol`. Source: the user's current shipping discussion and follow-up model/agent clarifications.

**USER DECISION**: Today's tests may use the supplied credentials without a specific spending cap. This is task-specific authorization, superseding the prior provider-test freeze for these tests; it is not recurring or unattended spending authorization. Credentials must stay out of shared files and history. No credential value is recorded here.

## Local results

**OBSERVED**: Both supplied credentials authenticated against model-list endpoints. The gateway advertised GPT models beginning at version 5.6; no older GPT model was advertised. Model-list metadata did not supply prices, so no cheapest-model claim is established.

| Protocol | Connectivity candidate | Tool-call check | Streamed tool-result continuation |
| --- | --- | --- | --- |
| OpenAI Chat Completions | `gpt-5.6-sol` | HTTP 200, synthetic tool argument validated | HTTP 200, SSE, exact expected reply |
| OpenAI Responses | `gpt-5.6-sol` | HTTP 200, synthetic tool argument validated | HTTP 200, SSE, exact expected reply |
| Anthropic Messages | `claude-haiku-4-5-20251001` | HTTP 200, synthetic tool argument validated | HTTP 200, SSE, exact expected reply |

**OBSERVED**: The advertised `claude-3-5-haiku-20241022`, both dated Claude 3.5 Sonnet candidates, and `claude-3-7-sonnet-20250219` returned HTTP 502 for synthetic tool-call requests. These failures are retained; advertised availability did not imply successful inference.

**OBSERVED**: An exploratory synthetic single-message request for `gpt-6.1-sol` also passed through the gateway's Anthropic-compatible Messages route using the GPT credential. This predates the user's clarified mapping and will not be used for Claude Code tests: Claude Code uses Claude. This is protocol compatibility evidence only, not stock Claude Code support or phone behavior.

**OBSERVED**: One authorized physical Android device was connected: model XQ-CT72, Android 14 / API 34, ARM64 with 32-bit ARM compatibility. Olea was not installed at preflight. No app installation, data deletion, permission changes, personal-file access, or phone control was performed by this preflight. ADB uses the explicitly selected physical device; its serial is excluded from this report.

## Installed desktop-agent connectivity

**OBSERVED**: Installed stock Pi 1.5.0 returned the exact synthetic reply using `gpt-5.6-sol`. Installed Codex CLI 0.163.0 returned the synthetic reply and exited normally using `gpt-5.6-sol`. Installed Claude Code 2.1.292 answered a plain arithmetic prompt correctly and exited normally using `claude-haiku-4-5-20251001`. These isolated local runs used the supplied temporary credentials, no phone tools, and no real user task. They prove desktop connectivity only; the packaged on-phone versions still need their finite connection checks.

**OBSERVED**: Retained initial limitations: Claude's first synthetic marker prompt elicited a refusal rather than the exact marker, despite a successful API turn. Replacing that diagnostic with a plain arithmetic prompt passed. The first Codex run returned the expected reply but the diagnostic wrapper waited on ignored stdin and needed timeout cleanup; explicitly piping and closing stdin yielded a normal exit. The initial receipts remain local and were not relabeled successful.

## Connectivity model update

**USER DECISION**: Prefer `gpt-6.1-terra` over `gpt-5.6-sol` for GPT connectivity checks if normal operation is verified. Source: the user's report that 5.6 Sol costs more than 6.1 Terra. This is a user-supplied price comparison, not independently measured billing.

**OBSERVED**: Stock desktop Pi and Codex each returned the exact synthetic connectivity reply with `gpt-6.1-terra` and exited normally (approximately 3.9 seconds and 22.7 seconds respectively). Local Pi/Codex connectivity profiles now select `gpt-6.1-terra`; prior 5.6 results remain historical evidence. Claude Code connectivity stays on `claude-haiku-4-5-20251001`. Real functionality/phone testing stays Pi-only with `gpt-6.1-sol`.

## Credential handling and limits

**OBSERVED**: Credential configuration, request scripts, synthetic receipts, and device connection details are under Git-ignored `.setup/provider-check/`. Requests supplied credentials in HTTP headers, never process arguments. Credential values were not printed or copied into product source, reports, worker prompts, or commits. Raw errors are not suitable for shared reports; local checks redact known credential values.

**OPEN**: These are host-side API/protocol checks. They do not establish stock Pi/Codex/Claude connectivity, ARM64 runtime startup, actual phone-tool behavior, model identity behind a third-party gateway, pricing, or final release readiness. Reported token usage is gateway-provided, not independently verified billing.

**AGENT PLAN**: Keep connectivity profiles separate from functionality profiles. Verify stock agents after ARM64 packaging and Claude integration. Stop Codex/Claude provider-backed testing once minimal connection-and-run checks pass; other lifecycle checks can use deterministic fixtures. Real functionality and physical phone-access scenarios use only Pi with `gpt-6.1-sol`. Keep UX decisions with the separate design session and avoid assuming default agent selection or automatic installation.
