// SPDX-License-Identifier: MIT
// Final immutable settlement. No provider/model/phone effect replay.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {device,bridge,nativeRequest} from '../../m2/runtime/bridge.mjs';
const shell=s=>device(['shell',s]);
const model=JSON.parse(readFileSync('spike/m3/runtime/evidence/pi-final-seven-a01.json','utf8'));
const native=JSON.parse(readFileSync('spike/m3/runtime/evidence/pi-final-seven-a01-native.json','utf8'));
const preflight=JSON.parse(readFileSync('spike/m3/runtime/evidence/final-pi-preflight-a02.json','utf8'));
const r={at:new Date().toISOString(),taskId:'task_300be48de965',dispatchId:'ctx_075e0803ad32',leaseOwner:'1f3cf796-8a8d-4588-ada6-5d2cfb7d5bea',lease:'RETAINED; no experiment in flight after settlement',outcome:'Final model group FAILED provider transport before phone calls; no new category acceptance',modelRequestsThisCollector:0};
const deadline=Date.now()+30000;let receipt;
while(Date.now()<deadline){const yes=shell("run-as dev.olea.m2.runtime sh -c 'if [ -f files/m2/m3-final-failed-resume-a01.json ]; then echo READY; fi'").trim();if(yes==='READY'){receipt=device(['exec-out','run-as','dev.olea.m2.runtime','cat','files/m2/m3-final-failed-resume-a01.json']);break;}await new Promise(r=>setTimeout(r,300));}
assert(receipt,'No canonical reconciliation settlement');
r.resumeNative=JSON.parse(receipt);writeFileSync('spike/m3/runtime/evidence/final-failed-resume-a01-native.json',receipt,{flag:'wx'});
const resumed=device(['exec-out','run-as','dev.olea.m2.runtime','cat','files/rootfs/workspace/m3-pi-final-failed-resume-a01.json']);r.resume=JSON.parse(resumed);writeFileSync('spike/m3/runtime/evidence/final-failed-resume-a01.json',resumed,{flag:'wx'});
r.model={topLevelSubmitted:model.provider.topLevelPrompts,tools:model.tools,status:model.status,primaryFailure:model.providerFailures,secondaryRunnerFailure:model.failure,turnMs:model.turnWallMs,usage:model.provider.observedUsage,remainingRequests:0};
assert.equal(r.model.topLevelSubmitted,1);assert.equal(r.model.tools.length,0);assert.equal(model.providerFailures[0]?.classification,'provider_transport');
r.observer=JSON.parse(readFileSync('spike/m3/runtime/evidence/final-pi-observer.json','utf8'));assert.equal(r.observer.nativePhoneCalls,0);assert.equal(r.observer.status,'fail');
r.auditAfter=device(['exec-out','run-as','dev.olea.m2.runtime','cat','files/phone-audit.jsonl']);r.noModelPhoneEffects=r.auditAfter===preflight.auditBaseline;
r.fixtureLaunchAfter=device(['exec-out','run-as','dev.olea.m2.fixture','cat','files/observed-launches.txt']);r.fixtureLaunchUnchanged=r.fixtureLaunchAfter===preflight.fixtureLaunchBaseline;
r.captureModified=shell('run-as dev.olea.m2.runtime stat -c %Y files/capture.png').trim();r.captureUnchanged=Number(r.captureModified)===preflight.previousCaptureModified;
r.identities=[...new Map([...native.finalOwnershipCleanup.owned,...r.resumeNative.finalOwnershipCleanup.owned].map(i=>[`${i.pid}:${i.start}`,i])).values()].map(identity=>({identity,observation:shell(`if [ -d /proc/${identity.pid} ]; then cat /proc/${identity.pid}/stat; else echo ABSENT; fi`).trim()}));
r.allRecordedIdentitiesAbsent=r.identities.every(i=>i.observation==='ABSENT');
r.modelNativeCleanup={timedOut:native.timedOut,exitCode:native.exitCode,rootExitObserved:native.rootExitObserved,cleanup:native.finalOwnershipCleanup};
r.historical=preflight.historical.map(item=>{const actual=shell(`run-as dev.olea.m2.runtime sha256sum ${item.path}`).trim().split(/\s+/)[0];return{path:item.path,expected:item.sha256,actual,equal:item.sha256===actual};});
r.finalSessionHashes=shell('run-as dev.olea.m2.runtime sh -c \'sha256sum files/rootfs/workspace/m3-pi-final-seven-01-state/m2_9221203f0fe1b2c5c9b3eb570ca835e7/*\'');
r.stop=await bridge('stop');r.accessibilityRestore=shell('settings delete secure enabled_accessibility_services; settings put secure accessibility_enabled 0');
r.capabilities=await nativeRequest('/capabilities');r.projection=shell('dumpsys media_projection');r.accessibility=shell('settings get secure enabled_accessibility_services; settings get secure accessibility_enabled');r.listener=shell('settings get secure enabled_notification_listeners');r.uriGrants=shell('dumpsys activity permissions').split('\n').filter(l=>l.includes('10216')||l.includes('OleaM3')).join('\n');r.permissions=shell('dumpsys package dev.olea.m2.runtime').split('\n').filter(l=>/ACCESS_FINE_LOCATION: granted=|ACCESS_COARSE_LOCATION: granted=|POST_NOTIFICATIONS: granted=/.test(l)).join('\n');r.uidInventory=shell('ps -A -o UID,PID,PPID,NAME').split('\n').filter(l=>/^\s*1021[678]\s/.test(l));r.protectedModes=shell("run-as dev.olea.m2.runtime stat -c '%a %n' files/rootfs/run/olea-provider.json files/bridge-token files/bridge-config.json");
r.budget={globalConsumed:8,total:8,allocated:0,unallocated:0,remaining:0,explicitRetries:0,fallbacks:0,replays:0,httpRequests:null,billing:'unknown',zeroReportedUsageNotProofOfZeroRemoteBilling:true};
r.preSubmissionFailures=['Listener nonempty: preserved artifacts, bounded host refresh and actual folder reselection; no final selected-folder loss at submission','Folder request transport uncertainty during restart: snapshot showed no picker; distinct authorized native button selected/granted folder, no provider read yet','First final preflight Accessibilityfalse; explicitly re-enabled without further restart then readiness passed','Initial local consent observer refused MSYS-converted scope argument before any device action; relaunched with exact path conversion disabled before submission'];
r.safetyAssertions={noModelPhoneEffects:r.noModelPhoneEffects,fixtureUnchanged:r.fixtureLaunchUnchanged,captureUnchanged:r.captureUnchanged,historicalUnchanged:r.historical.every(i=>i.equal),identitiesAbsent:r.allRecordedIdentitiesAbsent,phoneDisabled:r.capabilities.body.result.phoneEnabled===false,backendStopped:r.capabilities.body.result.backendRunning===false};
writeFileSync('spike/m3/runtime/evidence/FINAL_RUNTIME_CHECKPOINT_RECEIPT.json',JSON.stringify(r,null,2)+'\n',{flag:'wx'});console.log({outcome:r.outcome,resume:r.resume.status,safety:r.safetyAssertions,budget:r.budget,uid:r.uidInventory});
