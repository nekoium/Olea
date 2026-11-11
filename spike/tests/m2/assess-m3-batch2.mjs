// SPDX-License-Identifier: MIT
// Offline immutable evidence assessment only; never invokes device or provider tools.
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { readGitArtifact, sha256, assess, report, catalog } from './evidence.mjs';
import { appendReceipts } from './receipt-store.mjs';
const commit = '9c9554c', base = 'spike/m3/runtime/';
const bytes = path => readGitArtifact(`git:${commit}:${path}`);
const load = name => JSON.parse(bytes(`${base}evidence/${name}.json`));
const artifact = path => ({ path: `git:${commit}:${path}`, sha256: sha256(bytes(path)) });
const receipts = [], state = load('batch-2-state');
const sourceDomains = state.source.map(s => {
  const blob = bytes(s.path), raw = s.sha256;
  const relation = sha256(blob) === raw ? 'identical bytes' : sha256(Buffer.from(blob.toString().replace(/\r?\n/g, '\r\n'))) === raw ? 'raw compiled CRLF / Git LF' : 'unverified difference';
  assert.notEqual(relation, 'unverified difference', s.path);
  return { path: s.path, gitBlobSha256: sha256(blob), capturedRawSha256: raw, relation };
});
const add = (id, caseId, status, summary, files, checks, extra = {}) => receipts.push({ attemptId: `m3-b2-${id}`, caseId, context: 'android-app', mode: 'direct', status,
  startedAt: '2026-11-11T03:52:10.640Z', endedAt: state.at, summary,
  artifacts: files.map(p => artifact(p.startsWith('spike/') ? p : base + p)),
  assertions: checks.map(name => ({ name, independent: true, passed: true })),
  provenance: { sourceCommit: commit, sourceDomains, licenseLimit: 'Original tooling MIT; existing stock runtime/agent/third-party licenses unchanged; no distribution clearance.' },
  provider: { topLevelPrompts: 0, modelRequests: 0 },
  limits: ['Direct deterministic Android evidence; no model category/cancellation credit.', 'Finite tracked identities, not arbitrary unseen forks or active backend/app recovery.', 'Earlier failures and previous installed artifact domains remain unchanged.'], ...extra });
const names = ['atomic-owner-publication-and-gate-release', 'cancel-before-launch-gate', 'immediate-stop-after-root-ownership', 'probe-stop-before-owned-assignment', 'probe-post-launch-exception', 'probe-service-teardown-during-startup'];
const summaries = [];
for (const [run, apkIndex] of [['a01', 0], ['a02', 2]]) {
  const r = load(`instrumentation-${run}-independent`);
  assert.deepEqual(r.summary.cases.map(c => c.name), names);
  assert(r.summary.cases.every(c => c.status === 'pass'));
  assert.equal(r.summary.suiteAbortedForUnsettledState, false);
  assert.equal(r.observations.length, 10); assert.equal(r.allAbsent, true);
  const identities = new Map();
  function collect(v) {
    if (!v || typeof v !== 'object') return;
    if (Array.isArray(v.owned)) {
      assert.equal(v.trackedExitVerified, true); assert.equal(v.rootExitObserved, true);
      assert.deepEqual(v.remaining, []); assert.deepEqual(v.faults, []);
      for (const i of v.owned) identities.set(`${i.pid}:${i.start}`, i);
    }
    for (const child of Object.values(v)) collect(child);
  }
  collect(r.summary); collect(r.receipts);
  assert.equal(identities.size, 10);
  for (const o of r.observations) { assert.equal(o.identity.uid, 10216); assert.equal(o.stat, 'ABSENT'); assert.deepEqual(o.identity, identities.get(`${o.identity.pid}:${o.identity.start}`)); }
  assert.equal(r.receipts.length, 3);
  for (const { report: p } of r.receipts) { assert.equal(p.launchIdle, true); assert.equal(p.cleanupVerified, true); assert.equal(p.targetSdk, 36); assert.equal(p.hostRealUid, 10216); }
  const exception = r.receipts.find(x => x.report.attempt.startsWith('m3-exception')).report;
  assert.match(exception.error, /EISDIR/); assert.equal(exception.finalOwnershipCleanup.trackedExitVerified, true);
  assert.equal(r.receipts.find(x => x.report.attempt.startsWith('m3-startup')).report.launchSuppressed, true);
  const raw = bytes(`${base}evidence/instrumentation-${run}.txt`).toString();
  assert.deepEqual(JSON.parse(raw), r.summary);
  const app = state.artifacts[apkIndex], test = state.artifacts[apkIndex + 1];
  summaries.push({ run, apk: app, instrumentationApk: test, sixChecks: names, independentAbsent: 10, sourceAttribution: run === 'a02' ? 'final source, external-settlement guard included' : 'earlier a06 source; final guard not credited retrospectively' });
  add(`supervision-${run}`, 'cost.cleanup', 'pass', `${run === 'a02' ? 'Final a07' : 'Earlier a06'} installed Android six-check supervision suite passes atomic gate/STOP, denied gate, immediate stop, pre-owner cancellation, actual EISDIR post-launch exception cleanup and service teardown; ten exact identities independently absent with no faults. ${run === 'a01' ? 'Final external-settlement guard was not in this build.' : 'Includes corrected external-settlement guard and atomic settled receipt publication.'}`,
    [`evidence/instrumentation-${run}.txt`, `evidence/instrumentation-${run}-independent.json`, 'evidence/batch-2-state.json', run === 'a01' ? 'evidence/build-a11.txt' : 'evidence/build-a12.txt', run === 'a01' ? 'evidence/install-a06.txt' : 'evidence/install-a07.txt', 'spike/android/app/src/main/java/dev/olea/spike/RuntimeProbe.kt', 'spike/android/app/src/main/java/dev/olea/spike/OwnedProcess.kt', 'spike/android/app/src/androidTest/java/dev/olea/spike/SupervisionInstrumentation.kt'],
    ['all_six_actual_android_cases_pass', 'exact_ten_recorded_identities_independently_absent', 'exception_cleanup_and_teardown_settled'], { execution: { app, instrumentationApk: test, scope: 'native instrumentation supervision', sourceAttribution: summaries.at(-1).sourceAttribution } });
}
const rev = load('location-revocation-a01');
assert.equal(rev.status, 'pass'); assert.equal(rev.locationBefore.body.ok, true);
assert.match(rev.permissionAfter, /ACCESS_FINE_LOCATION: granted=false/);
assert.equal(rev.recovered.body.result.phoneEnabled, false);
assert.equal(rev.stopped.body.error.code, 'PHONE_STOPPED');
assert.equal(rev.permissionDenied.body.error.code, 'LOCATION_PERMISSION_DENIED');
assert.equal(rev.before.oracle, rev.after.oracle);
assert.equal(rev.disabledAgain.body.ok, true);
assert(Object.hasOwn(rev, 'developmentGrantRestored'));
add('location-revocation', 'phone.revocation', 'pass', 'Actual fine-location permission revoked after successful read; explicit restart disabled phone actions, then development re-enable still returned LOCATION_PERMISSION_DENIED with granted=false and unchanged separate fixture oracle. Native STOP repeated and original development grant restored; no ordinary consent or other permission-revocation claim.',
  ['evidence/location-revocation-a01.json', 'selective-revocation.mjs', 'evidence/batch-2-state.json'], ['actual_permission_revoked', 'denial_after_phone_reenable_not_only_stop', 'private_oracle_unchanged']);
const old = JSON.parse(readGitArtifact('git:d73a82e:spike/m3/runtime/evidence/backend-recovery-a02.json'));
assert.equal(state.canonicalHistory, old.historyBefore); assert.equal(state.canonicalHistoryUnchanged, true);
assert.equal(state.canonicalHistory.trim().split('\n').length, 7);
assert(state.protectedModes.trim().split('\n').every(l => l.startsWith('600 ')));
assert.equal(state.capabilities.body.result.phoneEnabled, false); assert.equal(state.capabilities.body.result.backendRunning, false);
add('preservation', 'preserve.recovery-hashes', 'pass', 'Seven exact historical config/transcript/combined-value/sentinel hashes equal batch1 after boot, a06/a07 native installs and focused checks; protected modes600, no new protected values/digests. Equality across this batch does not establish protected-config byte preservation or active crash/no-replay.',
  ['evidence/batch-2-state.json', 'evidence/boot-restored-data-a01.json', 'evidence/boot-restored-service-a01.json', 'evidence/deployed-after-boot-a01-deployed-public-hashes.txt'], ['seven_canonical_hashes_equal_prior_batch', 'disabled_final_state']);
const boot = load('boot-m3-a01'); assert.equal(boot.configBefore, boot.configAfter); assert.equal(boot.status, 'booted');
const consent = load('consent-observation-a03'); assert.equal(consent.observations.uriGrants, ''); assert.match(consent.observations.capture, /CAPTURE_ABSENT/);
add('boot-context', 'lifecycle.reboot', 'untested', 'Existing AVD booted after unknown shutdown; API36/x86_64, same config hash and retained packages/data observed before install. No controlled active reboot, in-flight/no-replay or permission-persistence acceptance. First absent-device diagnostic failure retained; no selected-folder grant/capture existed at preinstall observation.',
  ['evidence/boot-m3-a01.json', 'evidence/boot-restored-data-a01.json', 'evidence/boot-restored-service-a01.json', 'evidence/consent-observation-a01-failure.json', 'evidence/consent-observation-a02.json', 'evidence/consent-observation-a03.json'], []);
const deployment = bytes(`${base}evidence/deployed-after-boot-a01-deployed-public-hashes.txt`).toString().trim().split('\n').map(l => {
  const m = /^([a-f0-9]{64})\s+(.+)$/.exec(l.trim()); assert(m); assert.match(m[2], /^files\/rootfs\/opt\/olea-m3-a02\/spike\/backend\/(dist|extensions)\//); return { deployedPath: m[2], sha256: m[1] };
});
assert.equal(deployment.length, 8);
assert.equal(load('batch-2-prepared-source').activeRecovery, 'prepared, not executed');
const path = resolve('spike/m2/evidence/evidence/receipts.json');
const previous = JSON.parse(await readFile(path)); assert.equal(previous.length, 150);
const all = await appendReceipts(path, receipts, resolve('.'));
assert.deepEqual(all.slice(0, previous.length), previous); assert.equal(catalog().length, 112);
await mkdir('spike/m3/evidence', { recursive: true });
await writeFile('spike/m3/evidence/batch-2-assessment.json', JSON.stringify({ sourceCommit: commit, summaries, sourceDomains, deployment, assessedReceipts: receipts, preparedRunners: 'not deployed/executed; no acceptance credit', budget: { consumed: 5, unallocated: 3, assessmentConsumed: 0 } }, null, 2) + '\n');
await report(path, resolve('spike/m2/reports'), resolve('.'), 'interim');
const rows = assess(all);
console.log(JSON.stringify({ appended: receipts.length, totalReceipts: all.length, cases: rows.length, counts: Object.fromEntries(['pass','fail','blocked','untested'].map(s => [s, rows.filter(r => r.status === s).length])) }));
