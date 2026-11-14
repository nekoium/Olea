# Shipping discussion session brief

**USER DECISION**: The existing session remains the engineering manager and follows `.agents/skills/olea-engineering-manager/SKILL.md`. Open a separate Pi session for direct product/release discussion with the user. This is a discussion session, not a manager handoff.

## Role and boundaries

Help the user resolve remaining release choices with short, concrete options. Read `PRODUCT.md`, `.agents/skills/olea-engineering-manager/SKILL.md`, `docs/PROGRESS.md`, `docs/superpowers/plans/2026-11-13-shipping-functional.md`, and `delegations/shipping-preflight/result.md`. Preserve concurrent edits. Treat only explicit user decisions as decisions; record exact wording and avoid inventing rationale.

Do not take over worker management, create duplicate workers, run builds/provider requests, mutate the phone, change credentials, or edit implementation files. Do not read ignored credential stores or session transcripts. No credential values belong in this session's prompt, notes, reports, or shared files.

Coordinate concrete user decisions with the current manager through Orca mailbox `run:run_5cc25899a3ee` using a concise subject/body. The current coordinator retains device/build integration ownership. Do not send terminal input to worker agents. Shared product/progress records can change concurrently: make surgical edits only when recording an explicit decision and notify manager of exact paths.

## Established decisions

- Ship today; keep Pi, Codex and Claude Code for 1.0.0.
- Defer schedules, reminders, alarms and general personal-vault cleanup/editing from today. Ordinary workspace file work remains in scope.
- Kotlin + Jetpack Compose + Material 3 for production Android UI. Separate UI session owns ongoing browser-only design demo; do not replace or duplicate it.
- Users choose first-run agent/setup; install prerequisites and precise UX remain with design discussion. No automatic Pi/default-workspace policy was adopted.
- Signed APK distribution through private GitHub releases. Repository is already private at https://github.com/nekoium/Olea; repository publication is not app release completion.
- GPT connectivity uses `gpt-6.1-terra` for Pi/Codex. Claude Code connectivity uses `claude-haiku-4-5-20251001`. Those desktop smoke checks passed.
- All real/token-intensive functionality and phone-access tests use Pi only with `gpt-6.1-sol`. No real Codex/Claude phone/functional provider runs.
- Temporary third-party credentials are authorized for today's tests without a fixed cap, retained only in ignored local configuration. No values are included here.

## Active workers retained by manager

Run `run_5cc25899a3ee`:

- ARM64 packaging: dispatch `ctx_f087e808e922`, Task `task_ea4c969d3bff`. Owns packaging, ABI input provenance, build.gradle and Environment. Verifies x86/ARM64 in an isolated committed-source snapshot plus owned overlays; results are pre-Claude, not integrated acceptance. Expected report `delegations/shipping-arm64/result.md`.
- Claude integration: dispatch `ctx_36c6df166286`, Task `task_3f2b3afbaed1`. Owns backend adapter/fixtures, agent maintenance and minimal existing Android UI/service/session integration. Deterministic tests preferred; no phone mutation. Expected report `delegations/shipping-claude/result.md`.

Do not infer completion from source files or elapsed time. Last source inspection showed both implementations in progress with uncommitted changes. Other UI/doc changes are concurrent user work.

## Remaining work and useful discussion

1. Integrated ARM64 APK and physical Android 14 startup; then on-phone minimal connectivity for three agents.
2. Pi-only live functional checks: saved conversations, workspace/tool execution, cancellation/STOP/reopen, and permission-controlled phone actions. User may need to complete Android consent screens.
3. Final native UI implementation/acceptance after the separate design session provides decisions. Current browser demo is not shipped native UI.
4. Signing-key custody: ask whether an existing key must be reused or a dedicated Olea key should be generated locally. Explain the secure backup needed for future updates. Do not generate or upload a key in this discussion session.
5. Release build/signing, third-party redistribution materials, final security/credential scan, data-preservation acceptance, source commit/tag, checksum and private APK release.

Open the discussion with a concise remaining-work list and focus first on signing-key custody. The manager continues technical execution independently; avoid asking the user to decide routine implementation details.
