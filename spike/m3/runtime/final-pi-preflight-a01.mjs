// SPDX-License-Identifier: MIT
// Final deterministic readiness; no provider read or inference.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {randomBytes,createHash} from 'node:crypto';
import {device,bridge,nativeRequest} from '../../m2/runtime/bridge.mjs';
const shell=s=>device(['shell',s]);
const attempt=process.argv[2]??'final-pi-preflight-a01';if(!/^final-pi-preflight-a\d+$/.test(attempt))throw Error('invalid_attempt');
const r={attempt,at:new Date().toISOString(),modelRequests:0};
try{
 const previous=JSON.parse(readFileSync('spike/m3/runtime/evidence/final-seven-precondition-state-a01.json','utf8'));
 r.deployed=previous.deployed.map(x=>{const actual=shell(`run-as dev.olea.m2.runtime sha256sum files/rootfs/opt/olea-m3-final-ready-a01/${x.path}`).trim().split(/\s+/)[0];assert.equal(actual,x.actual);return{path:x.path,expected:x.actual,actual};});
 r.capabilities=await nativeRequest('/capabilities');assert(r.capabilities.body.result.phoneEnabled&&r.capabilities.body.result.accessibility);assert.equal(r.capabilities.body.result.backendRunning,false);
 r.notifications=await bridge('notifications');assert.equal(r.notifications.body.ok,true);assert.equal(r.notifications.body.result.notifications.length,0);
 // One deterministic file verifies current volatile folder after actual reselection; outside future model7call scope.
 const value='FINAL_PREFLIGHT_'+randomBytes(12).toString('hex');r.folder=await bridge('files_write_read',{value});assert.equal(r.folder.body.ok,true);
 const document=decodeURIComponent(r.folder.body.result.uri.split('/document/')[1]);assert(document.startsWith('primary:Documents/OleaM3/'));r.folderIndependent=device(['exec-out','cat','/sdcard/'+document.slice(8)]);assert.equal(r.folderIndependent,value);
 const options=JSON.parse(readFileSync('spike/m3/runtime/final-seven-proposed-options.json','utf8'));options.allocatedPrompts=1;options.directReceipt='final-seven-readonly-correction-a01.json;final-seven-registration-a01.json;final-pi-preflight-a01.json';options.fileValue='OLEA_M3_FINAL_'+randomBytes(16).toString('hex');
 writeFileSync('spike/m3/runtime/final-seven-allocated-options.json',JSON.stringify(options,null,2)+'\n',{flag:'wx'});
 device(['push','spike/m3/runtime/final-seven-allocated-options.json','/data/local/tmp/m3-final-options-a01.json']);
 device(['shell',"run-as dev.olea.m2.runtime sh -c 'set -euC; cat /data/local/tmp/m3-final-options-a01.json > files/rootfs/opt/olea-m3-final-ready-a01/spike/m3/runtime/final-seven-allocated-options.json'"]);
 r.options=options;r.optionsSha256=createHash('sha256').update(readFileSync('spike/m3/runtime/final-seven-allocated-options.json')).digest('hex');r.optionsDeployedHash=shell('run-as dev.olea.m2.runtime sha256sum files/rootfs/opt/olea-m3-final-ready-a01/spike/m3/runtime/final-seven-allocated-options.json').split(/\s+/)[0];assert.equal(r.optionsSha256,r.optionsDeployedHash);
 r.claimAbsent=shell("run-as dev.olea.m2.runtime sh -c 'test ! -e files/rootfs/run/m3-pi-final-seven-01.started && test ! -e files/rootfs/workspace/m3-pi-final-seven-capture-ready.json && test ! -e files/rootfs/workspace/m3-pi-final-seven-capture-ready.json.request.json && echo ABSENT'").trim();assert.equal(r.claimAbsent,'ABSENT');
 r.auditBaseline=device(['exec-out','run-as','dev.olea.m2.runtime','cat','files/phone-audit.jsonl']);r.fixtureLaunchBaseline=device(['exec-out','run-as','dev.olea.m2.fixture','cat','files/observed-launches.txt']);r.activityBaseline=device(['exec-out','run-as','dev.olea.m2.runtime','cat','files/activity-request-audit.jsonl']);
 r.previousCaptureModified=Number(shell('run-as dev.olea.m2.runtime stat -c %Y files/capture.png').trim());
 r.historical=previous.historical.map(x=>{const sha=shell(`run-as dev.olea.m2.runtime sha256sum ${x.path}`).trim().split(/\s+/)[0];assert.equal(sha,x.actual);return{path:x.path,sha256:sha};});
 r.foreground=shell('dumpsys activity activities').split('\n').filter(l=>/topResumedActivity|mResumedActivity/.test(l)).join('\n');assert(r.foreground.includes('dev.olea.m2.runtime'));
 r.status='ready';
}catch(e){r.status='failed_prerequisite';r.error=e.message;}
writeFileSync(`spike/m3/runtime/evidence/${attempt}.json`,JSON.stringify(r,null,2)+'\n',{flag:'wx'});console.log({status:r.status,error:r.error,selectedFolder:r.folder?.body.result,notifications:r.notifications?.body.result});if(r.status!=='ready')process.exitCode=1;
