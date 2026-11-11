// SPDX-License-Identifier: MIT
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {randomBytes,createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {device,bridge,nativeRequest} from '../../m2/runtime/bridge.mjs';
import {completeCaptureConsent} from './complete-capture-consent.mjs';
const shell=s=>device(['shell',s]);
const attempt=process.argv[2]??'final-seven-direct-a01';if(!/^final-seven-direct-a\d+$/.test(attempt))throw Error('invalid_attempt');
const r={attempt,startedAt:Date.now(),modelRequests:0,calls:[],scope:'Exact proposed final Pi7native-call order, direct deterministic prerequisite only'};
const ui=id=>execFileSync(process.execPath,['spike/m3/runtime/development-ui.mjs',id,'snapshot'],{encoding:'utf8',timeout:15000,maxBuffer:500000});
async function call(operation,args={}){const value=await bridge(operation,args);r.calls.push({at:Date.now(),operation,args,result:value});assert.equal(value.body.ok,true,JSON.stringify(value.body.error));return value.body.result;}
try{
 r.setup=JSON.parse(readFileSync('spike/m3/runtime/evidence/final-seven-setup-a01.json','utf8'));
 r.prerequisite=await nativeRequest('/capabilities');assert(r.prerequisite.body.result.phoneEnabled&&r.prerequisite.body.result.accessibility);
 r.emptyListener=await bridge('notifications');assert.equal(r.emptyListener.body.result.notifications.length,0);
 r.activityAuditBefore=device(['exec-out','run-as','dev.olea.m2.runtime','cat','files/activity-request-audit.jsonl']);
 r.phoneAuditBefore=device(['exec-out','run-as','dev.olea.m2.runtime','cat','files/phone-audit.jsonl']);
 r.fixtureLaunchBefore=device(['exec-out','run-as','dev.olea.m2.fixture','cat','files/observed-launches.txt']);
 const previousModified=Number(shell('run-as dev.olea.m2.runtime stat -c %Y files/capture.png').trim());
 await call('capabilities');
 await call('capture_request');
 r.consent=await completeCaptureConsent({attempt:attempt+'-capture',requestId:attempt,readyPath:`/workspace/m3-${attempt}-ready.json`,previousModified});
 r.capture=await call('capture_result');assert.equal(r.capture.sha256,r.consent.sha256);
 const value='M3_FINAL_READY_'+randomBytes(16).toString('hex');r.file=await call('files_write_read',{value});
 const doc=decodeURIComponent(r.file.uri.split('/document/')[1]);assert(doc.startsWith('primary:Documents/OleaM3/'));
 r.fileOracle={value,path:'/sdcard/'+doc.slice('primary:'.length)};r.fileOracle.actual=device(['exec-out','cat',r.fileOracle.path]);assert.equal(r.fileOracle.actual,value);r.fileOracle.sha256=createHash('sha256').update(r.fileOracle.actual).digest('hex');
 await call('fixture_notify');await new Promise(r=>setTimeout(r,700));r.notifications=await call('notifications');assert.deepEqual(r.notifications.notifications,[{package:'dev.olea.m2.fixture',id:42,text:'OLEA_NOTIFICATION_FIXTURE'}]);
 r.fixtureLaunchAfter=device(['exec-out','run-as','dev.olea.m2.fixture','cat','files/observed-launches.txt']);assert(r.fixtureLaunchAfter.startsWith(r.fixtureLaunchBefore));assert.equal(r.fixtureLaunchAfter.slice(r.fixtureLaunchBefore.length).trim().split(/\r?\n/).length,1);
 r.url=`https://example.org/?olea=m3-${attempt}`;await call('open_url',{url:r.url});
 let arrived=false;
 for(let i=0;i<4;i++){const id=`${attempt}-url-${i}`;ui(id);const xml=readFileSync(`spike/m3/runtime/evidence/${id}-ui.xml`,'utf8');r.urlSnapshot=id;if(xml.includes('Example Domain')&&xml.includes(`example.org/?olea=m3-${attempt}`)&&xml.includes('Connection is secure')){arrived=true;break;}await new Promise(r=>setTimeout(r,800));}
 assert(arrived,'Exact final URL did not display intended destination');
 r.activityAuditAfter=device(['exec-out','run-as','dev.olea.m2.runtime','cat','files/activity-request-audit.jsonl']);assert(r.activityAuditAfter.startsWith(r.activityAuditBefore));r.requestDelta=r.activityAuditAfter.slice(r.activityAuditBefore.length).trim().split(/\r?\n/).map(l=>JSON.parse(l));assert.equal(r.requestDelta.length,1);assert.equal(r.requestDelta[0].kind,'capture');assert.equal(r.requestDelta[0].delivery,'onNewIntent');
 const folder=r.activityAuditBefore.trim().split(/\r?\n/).map(l=>JSON.parse(l)).findLast(event=>event.kind==='folder');assert(folder);assert.equal(folder.kind,'folder');assert.equal(folder.delivery,'onNewIntent');assert.equal(r.requestDelta[0].task,folder.task);assert.equal(r.requestDelta[0].instance,folder.instance);
 r.phoneAuditAfter=device(['exec-out','run-as','dev.olea.m2.runtime','cat','files/phone-audit.jsonl']);assert(r.phoneAuditAfter.startsWith(r.phoneAuditBefore));r.nativeOperations=r.phoneAuditAfter.slice(r.phoneAuditBefore.length).trim().split(/\r?\n/).map(l=>JSON.parse(l));assert.deepEqual(r.nativeOperations.map(x=>x.operation),['capabilities','capture_request','capture_result','files_write_read','fixture_notify','notifications','open_url']);
 r.status='pass';
}catch(e){r.status='fail';r.error=e.message;}
finally{
 try{r.stop=await bridge('stop');r.restoreAccessibility=shell('settings delete secure enabled_accessibility_services; settings put secure accessibility_enabled 0');r.finalCapabilities=await nativeRequest('/capabilities');r.finalProjection=shell('dumpsys media_projection');r.finalUidInventory=shell('ps -A -o UID,PID,PPID,NAME').split('\n').filter(l=>/^\s*1021[678]\s/.test(l));}catch(e){r.cleanupError=e.message;r.status='fail';}
 r.endedAt=Date.now();r.budget={consumed:7,unallocated:1,allocated:0};writeFileSync(`spike/m3/runtime/evidence/${attempt}.json`,JSON.stringify(r,null,2)+'\n',{flag:'wx'});console.log({status:r.status,error:r.error,calls:r.calls.map(c=>c.operation),requestDelta:r.requestDelta,final:r.finalCapabilities});
}
