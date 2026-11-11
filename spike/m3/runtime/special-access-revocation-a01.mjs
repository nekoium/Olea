// SPDX-License-Identifier: MIT
// Actual special-access revocation with explicit development provisioning and independent no-effect oracles.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {device,bridge,nativeRequest} from '../../m2/runtime/bridge.mjs';
const shell=s=>device(['shell',s]);const wait=ms=>new Promise(r=>setTimeout(r,ms));
const report={attempt:'special-access-revocation-a01',startedAt:Date.now(),modelRequests:0,setupRoute:'Explicitly authorized development native enable and special-access setup; no system-consent or Chrome choice clicked',operations:[],cases:[]};
const digest=text=>createHash('sha256').update(text).digest('hex');
function notificationRecord(){const lines=shell('dumpsys notification --noredact').split('\n');const start=lines.findIndex(l=>l.includes('NotificationRecord(')&&l.includes('pkg=dev.olea.m2.fixture'));if(start<0)return 'ABSENT';const next=lines.findIndex((l,i)=>i>start&&l.includes('NotificationRecord('));return lines.slice(start,next>start?next:start+160).filter(l=>/NotificationRecord\(|uid=|key=|android.text|postTime|mUpdateTimeMs|mCreationTimeMs/.test(l)).join('\n');}
function oracle(){return {privateValueHash:shell('run-as dev.olea.m2.fixture sha256sum files/oracle-value.txt'),fixtureLaunchLogHash:shell('run-as dev.olea.m2.fixture sha256sum files/observed-launches.txt'),foreground:shell('dumpsys activity activities').split('\n').filter(l=>/topResumedActivity|mResumedActivity/.test(l)).join('\n'),notification:notificationRecord(),auditHash:shell('run-as dev.olea.m2.runtime sha256sum files/phone-audit.jsonl')};}
async function action(operation,args={}){const result=await bridge(operation,args);report.operations.push({at:Date.now(),operation,args,result});return result;}
async function check(name,fn){try{report.cases.push({name,status:'pass',detail:await fn()});}catch(e){report.cases.push({name,status:'fail',error:e.message});}}
const component='dev.olea.m2.runtime/dev.olea.spike.PhoneAccessibility';
const listener='dev.olea.m2.runtime/dev.olea.spike.FixtureNotifications';
let original;
try {
 report.volatile=shell("run-as dev.olea.m2.runtime sh -c 'if [ -f files/capture.png ]; then echo CAPTURE_PRESENT; else echo CAPTURE_ABSENT; fi'");assert(report.volatile.includes('ABSENT'),'Preserve capture before changes');
 report.uriGrantsBefore=shell('dumpsys activity permissions').split('\n').filter(l=>l.includes('10216')||l.includes('OleaM3')).join('\n');assert.equal(report.uriGrantsBefore,'','Preserve selected folder before changes');
 original={accessibility:shell('settings get secure enabled_accessibility_services').trim(),accessibilityFlag:shell('settings get secure accessibility_enabled').trim(),notificationListeners:shell('settings get secure enabled_notification_listeners').trim()};report.original=original;
 report.enableOnce=shell("run-as dev.olea.m2.runtime sh -c 'touch files/enable-phone-once'");report.developmentRestart=shell('am force-stop dev.olea.m2.runtime; am start -f 0x18000000 -n dev.olea.m2.runtime/dev.olea.spike.MainActivity');await wait(600);
 report.capabilitiesBefore=await nativeRequest('/capabilities');assert.equal(report.capabilitiesBefore.body.result.phoneEnabled,true);assert.equal(report.capabilitiesBefore.body.result.backendRunning,false);
 await check('notification-listener-revocation-denies-cached-read-no-effect',async()=>{
  const initial=await action('notifications');assert.equal(initial.body.ok,true);assert(original.notificationListeners.split(':').includes(listener));
  const before=oracle();
  const revokedAt=Date.now();const developmentRevoke=shell(`cmd notification disallow_listener ${listener}`);await wait(700);
  const afterSetting=shell('settings get secure enabled_notification_listeners');assert(!afterSetting.includes(listener));
  const denied=await action('notifications');assert.equal(denied.body.ok,false);assert.equal(denied.body.error?.code,'NOTIFICATION_ACCESS_REVOKED');assert(!denied.body.result);
  const after=oracle();assert.deepEqual(after,before);
  const capabilities=await nativeRequest('/capabilities');assert.equal(capabilities.body.result.phoneEnabled,true);assert.equal(capabilities.body.result.backendRunning,false);
  const developmentRestore=shell(`cmd notification allow_listener ${listener}`);await wait(500);
  return {initial,revokedAt,developmentRevoke,afterSetting,denied,before,after,capabilities,developmentRestore,scope:'Actual notification special-access revoke; native phone flag remains enabled, no cached data disclosed, no fixture post/foreground/oracle/audit mutation'};
 });
 await check('accessibility-revocation-denies-inspection-and-action-no-effect',async()=>{
  const prior=original.accessibility==='null'?[]:original.accessibility.split(':').filter(Boolean);
  const enabled=[...new Set([...prior,component])].join(':');
  const developmentEnable=shell(`settings put secure enabled_accessibility_services ${enabled}; settings put secure accessibility_enabled 1`);
  let capabilities;const deadline=Date.now()+4000;
  while(Date.now()<deadline){capabilities=await nativeRequest('/capabilities');if(capabilities.body.result.accessibility)break;await wait(100);}
  assert.equal(capabilities.body.result.accessibility,true);
  const inspected=await action('accessibility_tree');assert.equal(inspected.body.ok,true);
  const node=inspected.body.result.nodes.find(n=>n.text?.toLowerCase()==='start shared backend');assert(node?.clickable,'Native backend control must be actionable before revoke');
  const before=oracle();
  const revokedAt=Date.now();const developmentRevoke=prior.length?shell(`settings put secure enabled_accessibility_services ${prior.join(':')}`):shell('settings delete secure enabled_accessibility_services; settings put secure accessibility_enabled 0');
  const stopDeadline=Date.now()+4000;
  while(Date.now()<stopDeadline){capabilities=await nativeRequest('/capabilities');if(!capabilities.body.result.accessibility)break;await wait(100);}
  assert.equal(capabilities.body.result.accessibility,false);assert.equal(capabilities.body.result.phoneEnabled,true);
  const inspectDenied=await action('accessibility_tree');assert.equal(inspectDenied.body.error?.code,'ACCESSIBILITY_REVOKED');
  const clickDenied=await action('accessibility_click',{nodeId:node.nodeId});assert.equal(clickDenied.body.error?.code,'ACCESSIBILITY_REVOKED');
  const after=oracle();assert.deepEqual(after,before);
  const afterCapabilities=await nativeRequest('/capabilities');assert.equal(afterCapabilities.body.result.backendRunning,false);assert.equal(afterCapabilities.body.result.phoneEnabled,true);
  return {developmentEnable,enabledSetting:enabled,positiveInspection:{package:inspected.body.result.package,nodeId:node.nodeId,nodeText:node.text,clickable:node.clickable},revokedAt,developmentRevoke,inspectDenied,clickDenied,before,after,afterCapabilities,scope:'Actual Accessibility special-access revoked while phone flag stays enabled; known backend-start node action rejected before execution, same independent foreground/private oracle/notification/audit'};
 });
} catch(e){report.setupFailure=e.message;}
finally {
 try {
  if(original){
   report.restoreAccessibility=original.accessibility==='null'?shell('settings delete secure enabled_accessibility_services'):shell(`settings put secure enabled_accessibility_services ${original.accessibility}`);
   report.restoreAccessibilityFlag=original.accessibilityFlag==='null'?shell('settings delete secure accessibility_enabled'):shell(`settings put secure accessibility_enabled ${original.accessibilityFlag}`);
   const currently=shell('settings get secure enabled_notification_listeners').trim().split(':');
   const wasAllowed=original.notificationListeners.split(':').includes(listener);
   if(wasAllowed!==currently.includes(listener))report.restoreListener=shell(`cmd notification ${wasAllowed?'allow_listener':'disallow_listener'} ${listener}`);
  }
  report.stop=await action('stop');
  report.finalCapabilities=await nativeRequest('/capabilities');
  report.finalAccessibility=shell('settings get secure enabled_accessibility_services; settings get secure accessibility_enabled');
  report.finalListeners=shell('settings get secure enabled_notification_listeners');
  report.finalPermissions=shell('dumpsys package dev.olea.m2.runtime').split('\n').filter(l=>/ACCESS_FINE_LOCATION: granted=|ACCESS_COARSE_LOCATION: granted=/.test(l)).join('\n');
  report.uidInventory=shell('ps -A -o UID,PID,PPID,NAME').split('\n').filter(l=>/^\s*1021[678]\s/.test(l));
 }catch(e){report.cleanupFailure=e.message;}
 report.status=!report.setupFailure&&!report.cleanupFailure&&report.cases.length===2&&report.cases.every(c=>c.status==='pass')?'pass':'fail';report.endedAt=Date.now();
 report.budget={consumed:6,unallocated:2,allocated:0,retryFallbackReplay:0};
 writeFileSync('spike/m3/runtime/evidence/special-access-revocation-a01.json',JSON.stringify(report,null,2)+'\n',{flag:'wx'});
 console.log({status:report.status,setupFailure:report.setupFailure,cleanupFailure:report.cleanupFailure,cases:report.cases.map(c=>({name:c.name,status:c.status,error:c.error})),final:report.finalCapabilities});
}
