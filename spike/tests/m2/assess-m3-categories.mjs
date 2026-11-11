// SPDX-License-Identifier: MIT
// Offline assessment only; no device/provider execution.
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {readGitArtifact,sha256,assess,report} from './evidence.mjs';
import {appendReceipts} from './receipt-store.mjs';
const commit='d176722',base='spike/m3/runtime/';
const bytes=p=>readGitArtifact(`git:${commit}:${p}`);
const artifact=p=>({path:`git:${commit}:${p}`,sha256:sha256(bytes(p))});
const load=n=>JSON.parse(bytes(`${base}evidence/${n}.json`));
const r=load('codex-location-notification-a01'),n=load('codex-location-notification-a01-native'),pre=load('categories-preflight-a01'),ind=load('categories-independent-a01'),notification=load('notification-oracle-a02'),ledger=load('categories-ledger-settlement-a01'),claim=load('categories-allocation-claim-a01'),preserve=load('categories-session-preservation-a01');
assert.equal(claim.status,'claimed_and_ready');assert.equal(claim.submissionAttempted,false);assert.equal(claim.keyEqualsAuthorizedSource,true);assert.equal(claim.endpointEqualsAuthorizedSource,true);
assert.equal(ledger.topLevelSubmitted,1);assert.equal(ledger.globalConsumedAfter,6);assert.equal(ledger.replays,0);assert.equal(ledger.explicitRetries,0);assert.equal(ledger.fallbacks,0);
assert.equal(r.topLevelPrompts,1);assert.equal(r.model,'gpt-6.1-terra');assert.equal(r.turn.status,'completed');assert.equal(r.ack.turn.id,r.turn.id);
const expected=['phone_capabilities','phone_location','phone_fixture_notify','phone_notifications'];
assert.deepEqual(r.toolReceipts.map(t=>t.tool),expected);assert.equal(r.items.mcpToolCall,4);assert.equal(r.items.commandExecution??0,0);
assert.deepEqual([...r.registration.toolNames].sort(),[...expected].sort());assert.deepEqual(ind.nativeOperations.map(o=>o.operation),['capabilities','location','fixture_notify','notifications']);
for(const t of r.toolReceipts){const {sha256:hash,...rest}=t;assert.equal(sha256(JSON.stringify(rest)),hash);assert.equal(t.status,'completed');}
const output=t=>JSON.parse(JSON.parse(t.output).content[0].text);
const location=output(r.toolReceipts[1]);assert.equal(location.ageMs,87578);assert.equal(location.accuracy,5);assert.equal(location.provider,'gps');assert(Math.abs(location.latitude-24.9876)<0.0001);assert(Math.abs(location.longitude-121.5432)<0.0001);assert.match(ind.independentLocation,/24\.987600,121\.543198/);
assert.deepEqual(pre.notifications.body.result.notifications,[]);assert.deepEqual(output(r.toolReceipts[3]).notifications,notification.modelNotification);
assert.equal(notification.status,'pass');assert.equal(notification.notificationPosts,0);assert.equal(notification.nativePhoneOperations,0);
assert.match(notification.independentFixtureRecord,/uid=10217/);assert.match(notification.independentFixtureRecord,/OLEA_NOTIFICATION_FIXTURE/);
const order=notification.causalOrdering;assert(order.nativeNotifyAt<order.separateFixtureAt&&order.separateFixtureAt<order.nativeReadAt);assert.equal(notification.launchDelta.length,1);
assert.equal(ind.cases.find(c=>c.name==='separate-notification-new-causal-post-and-listener').status,'fail');
assert.equal(r.start.threadId,r.resume.threadId);assert.equal(r.start.home,r.resume.home);assert.equal(r.start.cwd,r.resume.cwd);assert.equal(r.resume.accessMode,'full-access');
assert.equal(n.timedOut,false);assert.equal(n.rootExitObserved,true);assert.equal(n.finalOwnershipCleanup.trackedExitVerified,true);assert.deepEqual(n.finalOwnershipCleanup.faults,[]);assert.equal(n.finalOwnershipCleanup.owned.length,34);assert.equal(ind.identities.length,34);
for(const i of n.finalOwnershipCleanup.owned){const o=ind.identities.find(o=>o.identity.pid===i.pid);assert.deepEqual(o.identity,i);assert.equal(i.uid,10216);assert.equal(o.observation,'ABSENT');}
assert.equal(ind.stoppedInspection.body.error.code,'PHONE_STOPPED');assert.equal(ind.privateOracleUnchanged,true);
assert.equal(preserve.historicalCanonicalHashes.length,7);assert(preserve.historicalCanonicalHashes.every(h=>h.equal&&h.actual===h.expected));
for(const h of pre.deployedHashes)assert.equal(h.expected,h.actual);
for(const [path,hash]of Object.entries(r.sourceSha256)){const item=pre.deployedHashes.find(h=>path.endsWith(h.path));assert(item);assert.equal(item.actual,hash);}
const domains=ledger.source.map(s=>{const b=bytes(s.path);const relation=sha256(b)===s.sha256?'identical':sha256(Buffer.from(b.toString().replace(/\r?\n/g,'\r\n')))===s.sha256?'compiled/deployed raw CRLF vs Git LF':'unverified';assert.notEqual(relation,'unverified');return {...s,gitBlobSha256:sha256(b),relation};});
const receipts=[];const common=['evidence/codex-location-notification-a01.json','evidence/codex-location-notification-a01-native.json','evidence/categories-preflight-a01.json','evidence/categories-independent-a01.json','evidence/notification-oracle-a02.json','evidence/categories-ledger-settlement-a01.json','evidence/categories-allocation-claim-a01.json','evidence/categories-deployed-final-a01.json'];
function add(id,caseId,status,summary,mode='direct',extraFiles=[]){receipts.push({attemptId:`m3-categories-${id}`,caseId,context:'android-app',mode,status,startedAt:r.observedAt,endedAt:preserve.at,summary,artifacts:[...common,...extraFiles].map(p=>artifact(base+p)),assertions:status==='pass'?[{name:'immutable_model_native_independent_outcome',independent:true,passed:true}]:[],provider:id==='turn'?{allocationId:ledger.allocationId,model:r.model,topLevelPrompts:1,lastCumulativeUsage:ledger.lastCumulativeUsage,httpRequestCount:null,billing:'unknown',retries:0,replays:0}:{accountingReference:'m3-categories-turn'},execution:{accessMode:'full-access',filesystemIsolation:false,approvalPolicy:'never',targetSdk:36,hostRealUid:10216,fixtureRealUid:10217,threadId:r.start.threadId,turnId:r.turn.id},provenance:{sourceCommit:commit,sourceDomains:domains,deployedSourceHashes:r.sourceSha256},limits:['Last-known location age87578ms; no freshness/normal-user-grant claim.','Prior discovery ESRCH/unverified cleanup retained; new no-fault run is separate.','Five-delivery cap is per MCP helper instance, not a persistent allocation-wide security bound.','No stock-agent patch; full access has no same-UID filesystem credential isolation.']});}
add('turn','codex.turn','pass','One actual primary-terra streamed stock Codex turn completed with exactly4named MCP calls and zero commandExecution; native audit independently matches. One allocation consumed, no explicit retry/fallback/replay.','model');
add('notification-observer-failed','phone.codex.notification','fail','First independent default dumpsys notification text assertion failed because output redacted extras; retained unchanged. No model/tool replay; later read-only --noredact correction assesses same causal post.','model');
add('location','phone.codex.structured-api','pass','Model-selected phone_location returned exact independently matched GPS coordinates24.9876/121.54319833333334 accuracy5 and age87578ms. Valid last-known only, not fresh/current-under5s; grants development-provisioned.','model');
add('notification','phone.codex.notification','pass','Model-selected notify/read changed empty listener into exact modern fixtureUID10217/id42/text; one separate fixture event between dispatch/read plus independent --noredact record proves new post without repeated effects.','model');
add('resume','codex.resume','pass','Explicit stock restart/resume retained exact proved thread/home/workspace/full-access mode; no additional prompt. Startup2401ms/resume2086ms. New transcript/thread hashes retained after resume, not full before/after transcript immutability.','model',['evidence/categories-session-preservation-a01.json']);
add('cleanup','cost.cleanup','pass','This model run native wrapper settled40866ms without timeout/fault, root and all34tracked UID/start identities independently absent. Finite snapshot scope only; prior discovery ESRCH failure qualification unchanged.');
add('stop','phone.stop','pass','Native STOP then denied notification read PHONE_STOPPED; separate private fixture oracle unchanged, phone/backend/Accessibility false. No revocation/rollback inference.');
add('hashes','preserve.recovery-hashes','pass','Seven prior canonical historical hashes identical after model turn/resume; corrected read-only hash diagnostic retained after shell-escaping failure. New canonical session artifacts hashed after resume only.','direct',['evidence/categories-session-preservation-a01.json']);
const path=resolve('spike/m2/evidence/evidence/receipts.json');const old=JSON.parse(await readFile(path));assert.equal(old.length,161);const all=await appendReceipts(path,receipts,resolve('.'));assert.deepEqual(all.slice(0,old.length),old);
await writeFile('spike/m3/evidence/codex-categories-assessment.json',JSON.stringify({sourceCommit:commit,receipts,budget:{consumed:6,unallocated:2,assessmentConsumed:0},policy:{registered:expected,observedCalls:4,maxDeliveriesPerHelper:5},sourceDomains:domains},null,2)+'\n');
await report(path,resolve('spike/m2/reports'),resolve('.'),'interim');const rows=assess(all);console.log(JSON.stringify({appended:receipts.length,total:all.length,cases:rows.length,counts:Object.fromEntries(['pass','fail','blocked','untested'].map(s=>[s,rows.filter(r=>r.status===s).length]))}));
