// SPDX-License-Identifier: MIT
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {device,bridge,nativeRequest} from '../../m2/runtime/bridge.mjs';
const shell=s=>device(['shell',s]);const r={at:new Date().toISOString(),allocationId:'m3-pi-final-seven-02',modelRequests:0};
try{
 const previous=JSON.parse(readFileSync('spike/m3/runtime/evidence/final-pi-preflight-a02.json','utf8'));r.deployed=previous.deployed.map(x=>{const actual=shell(`run-as dev.olea.m2.runtime sha256sum files/rootfs/opt/olea-m3-final-ready-a01/${x.path}`).split(/\s+/)[0];assert.equal(actual,x.actual);return{path:x.path,expected:x.actual,actual};});
 r.capabilities=await nativeRequest('/capabilities');assert(r.capabilities.body.result.phoneEnabled&&r.capabilities.body.result.accessibility);assert.equal(r.capabilities.body.result.backendRunning,false);
 r.notifications=await bridge('notifications');assert.equal(r.notifications.body.result.notifications.length,0);
 const value='EXTRA_PREFLIGHT_'+Date.now();r.folder=await bridge('files_write_read',{value});assert(r.folder.body.ok);const doc=decodeURIComponent(r.folder.body.result.uri.split('/document/')[1]);assert(doc.startsWith('primary:Documents/OleaM3/'));assert.equal(device(['exec-out','cat','/sdcard/'+doc.slice(8)]),value);
 device(['push','spike/m3/runtime/extra-pi-options.json','/data/local/tmp/m3-extra-pi-options.json']);device(['shell',"run-as dev.olea.m2.runtime sh -c 'set -euC; cat /data/local/tmp/m3-extra-pi-options.json > files/rootfs/opt/olea-m3-final-ready-a01/spike/m3/runtime/extra-pi-options.json'"]);
 r.options=JSON.parse(readFileSync('spike/m3/runtime/extra-pi-options.json'));r.optionsSha256=createHash('sha256').update(readFileSync('spike/m3/runtime/extra-pi-options.json')).digest('hex');assert.equal(shell('run-as dev.olea.m2.runtime sha256sum files/rootfs/opt/olea-m3-final-ready-a01/spike/m3/runtime/extra-pi-options.json').split(/\s+/)[0],r.optionsSha256);
 r.claimAbsent=shell("run-as dev.olea.m2.runtime sh -c 'test ! -e files/rootfs/run/m3-pi-final-seven-02.started && test ! -e files/rootfs/workspace/m3-pi-final-seven-02-capture-ready.json.request.json && echo ABSENT'");assert(r.claimAbsent.includes('ABSENT'));
 r.auditBaseline=device(['exec-out','run-as','dev.olea.m2.runtime','cat','files/phone-audit.jsonl']);r.activityBaseline=device(['exec-out','run-as','dev.olea.m2.runtime','cat','files/activity-request-audit.jsonl']);r.fixtureBaseline=device(['exec-out','run-as','dev.olea.m2.fixture','cat','files/observed-launches.txt']);r.captureBefore=shell('run-as dev.olea.m2.runtime sha256sum files/capture.png');r.captureModified=Number(shell('run-as dev.olea.m2.runtime stat -c %Y files/capture.png').trim());r.historical=previous.historical;
 r.foreground=shell('dumpsys activity activities').split('\n').filter(l=>/topResumedActivity|mResumedActivity/.test(l)).join('\n');assert(r.foreground.includes('dev.olea.m2.runtime'));r.status='ready';
}catch(e){r.status='failed_prerequisite';r.error=e.message;}
writeFileSync('spike/m3/runtime/evidence/extra-pi-preflight-a01.json',JSON.stringify(r,null,2)+'\n',{flag:'wx'});console.log({status:r.status,error:r.error});if(r.status!=='ready')process.exitCode=1;
