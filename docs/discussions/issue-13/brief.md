# Issue #13 discussion brief

**OPEN**: [Issue #13](https://github.com/nekoium/Olea/issues/13), “User story: what can this app do on earth?”, remains open. This brief prepares discussion; it does not select product changes or resolve the issue.

## Discussion opener

**AGENT PLAN — suggested wording for the user discussion**:

> The viewer's “I can just open the browser by myself” is a useful objection. Opening a link shows that a phone tool works, but leaves the reason to delegate unclear. Olea's agreed audience already knows Pi, Codex or Claude; its intended benefit is keeping agent work on the phone without a desktop staying online.
>
> What real task were you hoping this person would hand to Olea, and did they already use an agent?

**AGENT PLAN**: Ask that question first. Use their answer to choose one end-to-end job and a visible result before discussing onboarding or promotional copy. Do not assume the viewer represents the agreed audience, or dismiss their feedback if they do not.

## What the evidence supports

**USER DECISION**: The audience is people already literate with Pi, Codex or Claude, not people unfamiliar with agent tools. The first concrete user is a Pi user wanting the complete experience on a phone. Source: [PRODUCT.md, Audience and execution stance / Purpose](../../../PRODUCT.md#audience-and-execution-stance).

**OBSERVED**: The issue reports a viewer struggling to see useful applications and the browser objection. It supplies no task goal, prior agent experience, demo recording, time comparison or successful alternative workflow. Fetched read-only, including comments; no comments were present.

**OBSERVED**: [Physical acceptance](../../releases/0.1.0-phone-acceptance.md) records these bounded results on Android 14 ARM64:

- Pi created/read a synthetic workspace file; native preview independently confirmed its contents.
- Pi continued saved model context after STOP/reopen, and streaming cancellation was exercised.
- Pi read/wrote a synthetic connected folder, with independent host readback and revoked/missing access checks.
- Pi opened example.com, inspected the browser through Accessibility and clicked a link to visible IANA content.
- Codex and Claude Code returned minimal replies. Equivalent real-task or phone-tool coverage was not established.

**OBSERVED**: The [published 0.1.0 release notes](https://github.com/nekoium/Olea/releases/tag/0.1.0) describe an experimental terminal, unverified continuous background execution, shared-storage Linux limitations, and screen capture returning metadata rather than model-visible pixels. Scheduled work, reminders, alarms, general phone-folder cleanup and built-in export/backup are absent. Provider access/network and potentially paid model requests remain necessary. No new execution or device test was performed for this brief.

## Options after the first answer

All options below are **AGENT PLAN**, not implemented or verified end-to-end stories.

| Candidate job | Visible finish | Evidence and tradeoff |
| --- | --- | --- |
| Continue a small project edit while away from the computer | A requested change in a synthetic project file, followed by a later follow-up in the saved conversation | Closest to the agreed audience and verified file/continuation primitives; meaningful project editing still needs a bounded demonstration. Recommended starting point if it matches the user's real need. |
| Turn supplied text notes into a useful draft | A new summary or checklist file next to the supplied notes | Concrete artifact and less coding-specific; summarization quality and this complete workflow remain unverified. Use synthetic or explicitly supplied files, without promising automatic vault maintenance. |
| Complete a useful browser job | An answer or artifact derived from a specific accessible page | Could explain why phone tools matter; only the simple navigation chain is established. Page extraction, authenticated workflows and reliable multi-app automation are unverified. |

**OPEN — next concrete questions, asked sequentially**:

1. After identifying the real task: “What finished result would make that person say delegating was worth it?” This determines the demonstration's endpoint.
2. “Would doing this on the phone matter because their computer is unavailable, or because Olea saves work on the phone?” This distinguishes the value the demonstration must establish.
3. “Which of these jobs matches that need, or is there a better one?” Choose a job before changing copy; do not broaden the audience without an explicit decision.

**AGENT PLAN**: Once a job is selected, propose a small repeatable demonstration showing the starting inputs, user request, actual tools, resulting artifact and one follow-up. Compare manual effort with prompting, setup, waiting and checking the result. Treat “this remains easier manually” as a valid outcome. Any provider-backed demonstration needs a separate explicit allocation; none is authorized by this brief.
