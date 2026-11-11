// SPDX-License-Identifier: MIT
// Immutable offline assertions; no runtime/provider actions.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { readGitArtifact, sha256, assess, report } from './evidence.mjs';
import { appendReceipts } from './receipt-store.mjs';
const commit = 'c4facc7', base = 'spike/m3/runtime/';
const bytes = p => readGitArtifact(`git:${commit}:${p}`);
const load = n => JSON.parse(bytes(`${base}evidence/${n}.json`));
const artifact = p => ({ path: `git:${commit}:${p}`, sha256: sha256(bytes(p)) });
const active = load('active-recovery-a01'), final = load('followup-final-state-a01'), registration = load('mcp-fourteen-a01'), native = load('mcp-fourteen-a01-native'), guard = load('instrumentation-a03-independent');
assert.equal(active.status, 'pass'); assert.equal(active.startedMarker, 'STARTED');
assert.equal(active.identitiesBeforeInterruption.length, 6);
for (const i of active.identitiesBeforeInterruption) {
  assert.equal(i.uid, 10216); const o = active.independentAfter.find(x => x.identity.pid === i.pid);
  assert.deepEqual(o.identity, i); assert.equal(o.observation, 'ABSENT');
}
assert(active.identitiesBeforeInterruption.some(i => i.pid === active.backendIdentity.pid && i.start === active.backendIdentity.startTicks));
assert.equal(active.afterBackendDeath.body.result.backendRunning, false); assert.equal(active.afterBackendDeath.body.result.phoneEnabled, true);
assert.equal(active.recovered.body.result.phoneEnabled, false); assert.equal(active.recovered.body.result.backendRunning, false);
assert.equal(active.publicStateBefore, active.publicStateAfter); assert.equal(active.publicStateBefore.trim().split('\n').length, 7);
assert.equal(active.protectedPreserved, true); assert.equal(active.oracleUnchanged, true); assert.equal(active.lateEffect, 'ABSENT');
assert(active.endedAt - active.killAt > 20000);
const source = bytes(`${base}active-recovery.mjs`).toString();
assert.match(source, /shift 19; test/); assert.match(source, /kill -9/); assert.match(source, /await wait\(20000\)/);
const incoming = [];
const shared = ['evidence/active-recovery-a01.json', 'active-recovery.mjs', 'evidence/active-recovery-development-setup-a01.json', 'evidence/active-recovery-new-session-after.json', 'evidence/followup-final-state-a01.json'];
function add(id, caseId, summary, files, names, extra = {}) {
 incoming.push({ attemptId: `m3-active-${id}`, caseId, context: 'android-app', mode: 'direct', status: 'pass', startedAt: new Date(active.startedAt).toISOString(), endedAt: final.at, summary,
 artifacts: files.map(p => artifact(base + p)), assertions: names.map(name => ({name,independent:true,passed:true})), provider:{topLevelPrompts:0,modelRequests:0}, provenance:{sourceCommit:commit,installedAppSha256:final.installedAppSha256,installedTestSha256:final.installedTestSha256,licenseLimit:'Original MIT tooling; existing third-party licenses unchanged.'},
 limits:['Combined explicit backend SIGKILL then whole-app force-stop/restart; no autonomous backend-only restart.', 'Historical seven-file hashes only; fresh Pi session lacks before-hash.', 'Original scanner ESRCH/trackedExitVerified=false retained; registration is not generic cleanup.'], ...extra });
}
add('backend-death','lifecycle.backend-death','Active shared Node backend PID5252/start384753 was exact UID/start-rechecked and SIGKILLed after STARTED marker; native reported backendRunning=false while phone remained enabled. Subsequent whole-app interruption settled six observed identities. Combined recovery only; no autonomous backend restart.',shared,['work_started_before_exact_backend_kill','backend_dead_observed','six_original_identities_absent']);
add('app-death','lifecycle.whole-app-death','While deterministic Pi bash/sleep work was active after backend death, explicit whole-app force-stop/restart disabled phone/backend, independently removed original host/PRoot/backend/Pi/bash/sleep identities and prevented delayed effect after20s.',shared,['active_work_interrupted','disabled_explicit_restart','no_delayed_effect_after_full_window']);
add('no-replay','phone.no-replay','STARTED marker proves deterministic command began; after combined backend/app interruption no command replay, oracle unchanged and delayed marker absent beyond20s. Unknown in-flight terminal delivery remains unknown; no model replay/resume inference.',shared,['actual_started_marker','oracle_unchanged','no_late_effect']);
add('hashes','preserve.recovery-hashes','Seven historical canonical config/transcript/combined-value/sentinel hashes identical before/after active interruption. Fresh deterministic session has only a post-interruption resume.json hash; its first read-only diagnostic quoting failure retained, no fresh-session preservation credit.',shared,['seven_exact_preexisting_hashes_preserved']);
add('protected','preserve.credential-preservation','Owner-local protected provider/bridge byte equality persisted across active combined interruption; final modes600. No protected values or digests exported in new receipts.',shared,['owner_local_protected_equality']);
assert.equal(registration.status,'pass'); assert.equal(registration.accessMode,'full-access'); assert.equal(registration.noModelRequests,true);
assert.equal(registration.expectedTools.length,14);
assert.deepEqual([...registration.servers[0].toolNames].sort(), [...registration.expectedTools].sort());
assert.equal(registration.servers[0].runtimeStatus,'connected');
assert.equal(native.rootExitObserved,true); assert.equal(native.finalOwnershipCleanup.trackedExitVerified,false);
assert(native.finalOwnershipCleanup.faults.some(f => /ESRCH/.test(f)));
assert.equal(final.mcpIndependent.length,20);
for(const o of final.mcpIndependent){assert.equal(o.observation,'ABSENT');assert.deepEqual(o.identity,native.finalOwnershipCleanup.owned.find(i=>i.pid===o.identity.pid));}
add('registration','codex.tool-registration','Actual stock Codex0.167 full-access app-server registered exactly14 narrow phone tools without inference or phone effects using synthetic port9 bridge. Native root exited but ESRCH scanner fault retained cleanupVerified=false/launchIdle=false; later independent20identity absence is separate, not clean generic supervision.', ['evidence/mcp-fourteen-a01.json','evidence/mcp-fourteen-a01-native.json','evidence/followup-final-state-a01.json','evidence/mcp-fourteen-deployed-runner.sha256','mcp-fourteen-a01.sh'],['exact_fourteen_stock_registered_tools'],{execution:{accessMode:'full-access',filesystemIsolation:false,nativeTrackedExitVerified:false,independentAbsentIdentities:20}});
assert.equal(guard.summary.cases.length,1); assert.equal(guard.summary.cases[0].status,'pass'); assert.equal(guard.summary.cases[0].name,'failed-start-unobserved-exit');
assert.deepEqual(guard.observations,[]); assert.deepEqual(guard.receipts,[]);
const classifier=bytes('spike/android/app/src/main/java/dev/olea/spike/RuntimeProbe.kt').toString();assert.match(classifier,/suppressed \|\| failure\?\.directChildExitObserved == true/);
const old=JSON.parse(await readFile('spike/m2/evidence/evidence/receipts.json'));assert.equal(old.length,155);
const all=await appendReceipts(resolve('spike/m2/evidence/evidence/receipts.json'),incoming,resolve('.'));assert.deepEqual(all.slice(0,old.length),old);
await writeFile('spike/m3/evidence/active-followup-assessment.json',JSON.stringify({sourceCommit:commit,assessedReceipts:incoming,failedStartGuard:{artifact:artifact(base+'evidence/instrumentation-a03-independent.json'),result:'Android production classifier exercised with false-wait Process fixture; no real child created, empty observation list proves no process exit'},scanner:{faults:native.finalOwnershipCleanup.faults,trackedExitVerified:false,independentAbsent:20,genericCleanupPromotion:false},budget:{consumed:5,allocatedSeparate:1,allocationId:'m3-codex-location-notification-01',unallocated:2,separateAllocationConsumption:'not assessed; await receipt'}},null,2)+'\n');
await report(resolve('spike/m2/evidence/evidence/receipts.json'),resolve('spike/m2/reports'),resolve('.'),'interim');
const rows=assess(all);console.log(JSON.stringify({appended:incoming.length,total:all.length,cases:rows.length,counts:Object.fromEntries(['pass','fail','blocked','untested'].map(s=>[s,rows.filter(r=>r.status===s).length]))}));
