# M2 evidence implementation plan

Goal: retain complete expected acceptance and derive offline reports only from sanitized, independently asserted attempts.

Architecture: original MIT Node standard-library tooling in `spike/tests/m2`; immutable attempt receipts under `spike/m2/evidence/<track>/<attemptId>.json`; offline outputs under `spike/m2/reports`. Existing backend/native/old evidence stay unchanged. Manager explicitly authorized this bounded spike and execution without further design gates.

1. Add catalog, receipt validation, prerequisite propagation and offline Markdown/HTML renderer; test missing evidence, failed prerequisites, malformed receipts and HTML escaping.
2. Add randomized Unix dependency/nested-child independent assertions, separate-UID causal phone assertions, hash-preservation and process-identity observations; test deterministic negative cases.
3. Add a single-prompt Pi runner using existing backend contract, requiring explicit allocated prompt count and protected config, 120s deadline/12 tool rounds/finite events; do not execute provider workflow here.
4. Run offline unit tests and source syntax checks. Record actual tooling outcomes separately from unexecuted Android/model workflows. Commit owned files and send runtime payload contract through manager.

Constraints: zero provider allocation; no Android probe/mutation; sole runtime owner executes Android. No secrets/raw provider diagnostics retained. No automatic retries or effect replay. Modern app-domain/host/run-as/target28 and direct/model evidence remain distinct. Existing results are historical links only. Report tests never count as workflow passes.

Review focus: forged or missing independent assertions; prerequisite failures masking direct failures; duplicate attempts; HTML injection; PID reuse and inaccessible process state; missing hash paths; same-UID oracle access; timeout/output overflow; unsupported strict token caps and unknown remote billing.
