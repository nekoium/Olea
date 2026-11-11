// SPDX-License-Identifier: MIT
// Fresh deterministic direct intent deliveries, not replay of the failed Pi turn.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {device,bridge,nativeRequest} from '../../m2/runtime/bridge.mjs';
const shell=s=>device(['shell',s]);const wait=ms=>new Promise(r=>setTimeout(r,ms));
const continuation=process.argv[2]==='--continue-from-anchor';
const attempt=continuation?(process.argv[3]??'fixture-reuse-direct-a02'):'fixture-reuse-direct-a01';
if(!/^fixture-reuse-direct-a\d+$/.test(attempt))throw Error('invalid_attempt');
const r={attempt,startedAt:Date.now(),modelRequests:0,phonePosts:0,actions:[],qualification:continuation?'Two fresh reuse requests against already observed anchor; no anchor repost or Pi/model replay':'Initial repaired-fixture anchor plus two distinct new direct reuse requests; no Pi/model replay'};
function launchLog(){return device(['exec-out','run-as','dev.olea.m2.fixture','cat','files/observed-launches.txt']);}
function foreground(){return shell('dumpsys activity activities').split('\n').filter(l=>/topResumedActivity|mResumedActivity/.test(l)).join('\n').trim();}
function notification(){const lines=shell('dumpsys notification --noredact').split('\n');const i=lines.findIndex(l=>l.includes('NotificationRecord(')&&l.includes('pkg=dev.olea.m2.fixture'));const j=lines.findIndex((l,n)=>n>i&&l.includes('NotificationRecord('));const record=lines.slice(i,j>i?j:i+160).join('\n');const updated=Number(record.match(/mUpdateTimeMs=(\d+)/)?.[1]);return {record,updated};}
async function op(name,args={}){const v=await bridge(name,args);assert.equal(v.body.ok,true,JSON.stringify(v.body.error));return v;}
const preserved=JSON.parse(readFileSync('spike/m3/runtime/evidence/fixture-reuse-preservation-a01.json','utf8'));
try{
 r.apkSha256=createHash('sha256').update(readFileSync('.setup/fixture-reuse-a01.apk')).digest('hex');r.sourceSha256=createHash('sha256').update(readFileSync('spike/android/fixture/src/main/java/dev/olea/fixture/FixtureActivity.kt')).digest('hex');
 r.manifestUnchanged=createHash('sha256').update(readFileSync('spike/android/fixture/src/main/AndroidManifest.xml')).digest('hex')===preserved.fixtureManifestSourceSha256;assert(r.manifestUnchanged);
 r.oracleAfterUpgrade=shell('run-as dev.olea.m2.fixture sha256sum files/oracle-value.txt');assert.equal(r.oracleAfterUpgrade,preserved.oracleHash);
 r.logAfterUpgrade=launchLog();if(continuation)assert(r.logAfterUpgrade.startsWith(preserved.launchLog));else assert.equal(r.logAfterUpgrade,preserved.launchLog);
 r.uid=shell('pm list packages -U dev.olea.m2.fixture');assert(r.uid.includes('10217'));
 r.developmentEnable=shell("run-as dev.olea.m2.runtime sh -c 'touch files/enable-phone-once'");r.developmentRestart=shell('am force-stop dev.olea.m2.runtime; am start -f 0x18000000 -n dev.olea.m2.runtime/dev.olea.spike.MainActivity');
 r.readiness=[];const readyDeadline=Date.now()+7000;let ready;
 while(Date.now()<readyDeadline){try{ready=await nativeRequest('/capabilities');r.readiness.push({at:Date.now(),result:ready});if(ready.body.result?.phoneEnabled)break;}catch(e){r.readiness.push({at:Date.now(),error:e.message});}await wait(200);}
 assert.equal(ready?.body.result?.phoneEnabled,true,'Native host did not become ready before fixture delivery');
 r.listenerBaseline=await op('notifications');assert.equal(r.listenerBaseline.body.result.notifications.length,0);
 let previousLog=launchLog(),previousNotification=notification();let anchor;
 if(continuation){
  const old=JSON.parse(readFileSync('spike/m3/runtime/evidence/fixture-reuse-anchor-observed-a01.json','utf8'));
  const event=previousLog.slice(preserved.launchLog.length).trim().split(/\r?\n/);assert.equal(event.length,1);assert(event[0].includes('callback=onCreate'));
  anchor={front:old.foreground.trim(),task:event[0].match(/task=(\d+)/)[1],instance:event[0].match(/instance=(\d+)/)[1]};r.existingAnchor={...anchor,handlerLog:event[0],notification:previousNotification};
 }
 for(let index=0;index<(continuation?2:3);index++){
  const before=Number(shell('date +%s%3N').trim());const dispatch=await op('fixture_notify');r.phonePosts++;await wait(1000);
  const currentLog=launchLog();assert(currentLog.startsWith(previousLog));const delta=currentLog.slice(previousLog.length).trim().split(/\r?\n/).filter(Boolean);assert.equal(delta.length,1,'One request must have exactly one handler log append');
  const log=delta[0];const callback=log.match(/callback=(\S+)/)?.[1],task=log.match(/task=(\d+)/)?.[1],instance=log.match(/instance=(\d+)/)?.[1];const at=Number(log.split(' ')[0]);assert(at>=before);
  const front=foreground();assert(front.includes('dev.olea.m2.fixture'));
  const currentNotification=notification();assert(Number.isFinite(currentNotification.updated)&&currentNotification.updated>=before&&currentNotification.updated>previousNotification.updated);assert(currentNotification.record.includes('uid=10217')&&currentNotification.record.includes('id=42')&&currentNotification.record.includes('OLEA_NOTIFICATION_FIXTURE'));
  const listener=await op('notifications');assert.equal(listener.body.result.notifications.length,index+1,'One notification callback per request');assert(listener.body.result.notifications.every(n=>n.package==='dev.olea.m2.fixture'&&n.id===42&&n.text==='OLEA_NOTIFICATION_FIXTURE'));
  if(index===0&&!continuation){assert.equal(callback,'onCreate');anchor={front,task,instance};}else{assert.equal(callback,'onNewIntent');assert.equal(front,anchor.front);assert.equal(task,anchor.task);assert.equal(instance,anchor.instance);}
  r.actions.push({index,kind:index===0&&!continuation?'fresh-anchor':'reuse-'+(continuation?index+1:index),before,dispatch,handlerLog:log,callback,task,instance,foreground:front,notification:currentNotification,listenerCount:listener.body.result.notifications.length});
  previousLog=currentLog;previousNotification=currentNotification;
 }
 r.positiveHostReadDenied=false;
 try{device(['shell','run-as','dev.olea.m2.runtime','cat','/data/user/0/dev.olea.m2.fixture/files/oracle-value.txt']);}catch(e){r.positiveHostReadDenied=/Permission denied/.test(String(e.stderr));}
 assert(r.positiveHostReadDenied);
 r.oracleAfter=shell('run-as dev.olea.m2.fixture sha256sum files/oracle-value.txt');assert.equal(r.oracleAfter,preserved.oracleHash);
 r.totalNewHandlerEvents=launchLog().slice(preserved.launchLog.length).trim().split(/\r?\n/).filter(Boolean).length;assert.equal(r.totalNewHandlerEvents,3);
 r.status='pass';
}catch(e){r.status='fail';r.error=e.message;}
finally{
 try{r.stop=await bridge('stop');r.finalCapabilities=await nativeRequest('/capabilities');r.finalAccessibility=shell('settings get secure enabled_accessibility_services; settings get secure accessibility_enabled');r.finalListeners=shell('settings get secure enabled_notification_listeners');r.uidInventory=shell('ps -A -o UID,PID,PPID,NAME').split('\n').filter(l=>/^\s*1021[678]\s/.test(l));}catch(e){r.cleanupError=e.message;r.status='fail';}
 r.endedAt=Date.now();r.budget={consumed:7,unallocated:1,allocated:0};writeFileSync(`spike/m3/runtime/evidence/${r.attempt}.json`,JSON.stringify(r,null,2)+'\n',{flag:'wx'});console.log({status:r.status,error:r.error,actions:r.actions.map(a=>({kind:a.kind,callback:a.callback,task:a.task,instance:a.instance,updated:a.notification.updated,listenerCount:a.listenerCount})),hostReadDenied:r.positiveHostReadDenied,posts:r.phonePosts});
}
