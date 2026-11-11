// SPDX-License-Identifier: MIT
// Independent Android oracles and safe stop; never replays the allocated model or notification.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {device,bridge,nativeRequest} from '../../m2/runtime/bridge.mjs';
const shell=s=>device(['shell',s]);
const model=JSON.parse(readFileSync('spike/m3/runtime/evidence/codex-location-notification-a01.json','utf8'));
const native=JSON.parse(readFileSync('spike/m3/runtime/evidence/codex-location-notification-a01-native.json','utf8'));
const preflight=JSON.parse(readFileSync('spike/m3/runtime/evidence/categories-preflight-a01.json','utf8'));
const report={attempt:'categories-independent-a01',observedAt:new Date().toISOString(),modelRequests:0,cases:[],allocationId:'m3-codex-location-notification-01'};
async function check(name,action){try{report.cases.push({name,status:'pass',detail:await action()});}catch(e){report.cases.push({name,status:'fail',error:e.message});}}
function tool(name){const r=model.toolReceipts.filter(r=>r.tool===name);assert.equal(r.length,1);assert.equal(r[0].status,'completed');assert.equal(r[0].error,'');return JSON.parse(JSON.parse(r[0].output).content.find(c=>c.type==='text').text);}
report.auditAfter=device(['exec-out','run-as','dev.olea.m2.runtime','cat','files/phone-audit.jsonl']);
assert(report.auditAfter.startsWith(preflight.auditBaseline));
report.nativeOperations=report.auditAfter.slice(preflight.auditBaseline.length).trim().split(/\r?\n/).filter(Boolean).map(l=>JSON.parse(l));
report.fixtureLaunchAfter=device(['exec-out','run-as','dev.olea.m2.fixture','cat','files/observed-launches.txt']);
const notificationDump=shell('dumpsys notification');const lines=notificationDump.split('\n');
const index=lines.findIndex(l=>l.includes('NotificationRecord(')&&l.includes('pkg=dev.olea.m2.fixture'));
const end=lines.findIndex((l,i)=>i>index&&l.includes('NotificationRecord('));
report.separateNotificationRecord=lines.slice(index,end>index?end:index+160).join('\n');
await check('actual-model-four-scoped-phone-calls',async()=>{
 assert.equal(model.topLevelPrompts,1);assert.equal(model.outcomes.completedTurn,'pass');assert.equal(model.errors.length,0);assert.equal(model.toolReceipts.length,4);
 assert.deepEqual(report.nativeOperations.map(r=>r.operation),['capabilities','location','fixture_notify','notifications']);
 for(const name of ['phone_capabilities','phone_location','phone_fixture_notify','phone_notifications'])tool(name);
 assert(!model.items.commandExecution);assert.equal(model.registration.toolNames.length,4);
 return {toolNames:model.toolReceipts.map(r=>r.tool),nativeOperationCount:report.nativeOperations.length,scope:'Hard scoped MCP4tool allowlist/5native-delivery cap; this turn used4',threadId:model.start.threadId,turnId:model.turn.id};
});
await check('structured-last-known-location-independent-coordinates',async()=>{
 const p=tool('phone_location');assert(Number.isFinite(p.latitude)&&Math.abs(p.latitude-24.9876)<0.0001);assert(Number.isFinite(p.longitude)&&Math.abs(p.longitude-121.5432)<0.0001);assert.equal(p.provider,'gps');assert(p.accuracy>=0&&p.ageMs>=0);
 report.independentLocation=shell('dumpsys location').split('\n').filter(l=>/last location=Location\[gps/.test(l)).join('\n');assert(report.independentLocation.includes('24.987600,121.543198'));
 return {modelLocation:p,independentCoordinates:{latitude:24.9876,longitude:121.5432},freshness:'Last-known only; reported age retained, no current/fresh-under5s claim',permissionRoute:'Retained explicitly development-granted fine location; actual revocation denial passed separately'};
});
await check('separate-notification-new-causal-post-and-listener',async()=>{
 assert.equal(preflight.notifications.body.result.notifications.length,0);assert(report.fixtureLaunchAfter.startsWith(preflight.fixtureLaunchBaseline));
 const delta=report.fixtureLaunchAfter.slice(preflight.fixtureLaunchBaseline.length).trim().split(/\r?\n/).filter(Boolean);assert.equal(delta.length,1);
 const postedAt=Number(delta[0].split(' ')[0]);assert(postedAt>=native.startedAtMs&&postedAt<=native.endedAtMs);
 const action=report.nativeOperations.find(r=>r.operation==='fixture_notify');assert(action.atMs<=postedAt+100);assert(postedAt<=report.nativeOperations.find(r=>r.operation==='notifications').atMs);
 const notifications=tool('phone_notifications').notifications;assert.equal(notifications.length,1);assert.deepEqual(notifications[0],{package:'dev.olea.m2.fixture',id:42,text:'OLEA_NOTIFICATION_FIXTURE'});
 assert(report.separateNotificationRecord.includes('uid=10217'));assert(report.separateNotificationRecord.includes('id=42'));assert(report.separateNotificationRecord.includes('OLEA_NOTIFICATION_FIXTURE'));
 return {beforeEmpty:true,newFixtureLaunch:delta[0],postedAt,listener:notifications[0],postingUid:10217,listenerUid:10216,oracle:'Separate notification-manager record and separate-UID fixture launch append after native dispatch; cached preexisting notification cannot explain empty-to-new listener delta',developmentGrants:true};
});
await check('canonical-resume-no-additional-prompt',async()=>{
 assert.equal(model.outcomes.resume,'pass');for(const key of ['threadId','home','cwd','accessMode'])assert.equal(model.resume[key],model.start[key]);
 return {threadId:model.start.threadId,home:model.start.home,workspace:model.start.cwd,accessMode:model.start.accessMode,topLevelPrompts:1};
});
report.identities=native.finalOwnershipCleanup.owned.map(identity=>({identity,observation:shell(`if [ -d /proc/${identity.pid} ]; then cat /proc/${identity.pid}/stat; else echo ABSENT; fi`).trim()}));
await check('native-tracked-cleanup-and-independent-absence',async()=>{
 assert.equal(native.timedOut,false);assert.equal(native.rootExitObserved,true);assert.equal(native.finalOwnershipCleanup.trackedExitVerified,true);assert.equal(native.finalOwnershipCleanup.faults.length,0);assert(report.identities.length>0&&report.identities.every(i=>i.observation==='ABSENT'));
 return {count:report.identities.length,allAbsent:true,nativeElapsedMs:native.endedAtMs-native.startedAtMs,limit:native.finalOwnershipCleanup.limit};
});
const beforeStopOracle=shell('run-as dev.olea.m2.fixture sha256sum files/oracle-value.txt');
report.stop=await bridge('stop');report.stoppedInspection=await bridge('notifications');
report.privateOracleUnchanged=shell('run-as dev.olea.m2.fixture sha256sum files/oracle-value.txt')===beforeStopOracle;
report.capabilities=await nativeRequest('/capabilities');
report.permissions=shell('dumpsys package dev.olea.m2.runtime').split('\n').filter(l=>/ACCESS_FINE_LOCATION: granted=|ACCESS_COARSE_LOCATION: granted=/.test(l)).join('\n');
report.accessibility=shell('settings get secure enabled_accessibility_services');
report.notificationListener=shell('settings get secure enabled_notification_listeners');
report.protectedModes=shell("run-as dev.olea.m2.runtime stat -c '%a %n' files/rootfs/run/olea-provider.json files/bridge-token files/bridge-config.json");
report.uidInventory=shell('ps -A -o UID,PID,PPID,NAME').split('\n').filter(l=>/^\s*1021[678]\s/.test(l));
await check('safe-native-stop-no-further-delivery',async()=>{assert.equal(report.stop.body.ok,true);assert.equal(report.stoppedInspection.body.error?.code,'PHONE_STOPPED');assert(report.privateOracleUnchanged);assert.equal(report.capabilities.body.result.phoneEnabled,false);assert.equal(report.capabilities.body.result.backendRunning,false);return {privateOracleUnchanged:true,inspectionDenied:'PHONE_STOPPED'};});
report.status=report.cases.every(c=>c.status==='pass')?'pass':'fail';
report.budget={globalConsumed:6,unallocated:2,workerAllocated:0,explicitRetriesFallbackReplays:0,observedModelPhoneCalls:4,lastCumulativeUsage:model.usage.at(-1)?.total,httpRequests:null,billing:'unknown'};
report.qualification='Prior discovery ESRCH/unverified cleanup receipt remains unchanged; independent20absence did not rewrite it. This new model native run has its own no-fault tracked cleanup result.';
writeFileSync('spike/m3/runtime/evidence/categories-independent-a01.json',JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log({status:report.status,cases:report.cases.map(c=>({name:c.name,status:c.status,error:c.error})),budget:report.budget,identities:report.identities.length});
