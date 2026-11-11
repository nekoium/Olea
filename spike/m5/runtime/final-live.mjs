// SPDX-License-Identifier: MIT
// One allocated M5 turn: final live prerequisites, fresh public staging, no provider access.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {device,bridge,nativeRequest} from '../../m2/runtime/bridge.mjs';
const root='spike/m5/runtime',out=root+'/evidence',shell=s=>device(['shell',s]);mkdirSync('.setup',{recursive:true});
const options={...JSON.parse(readFileSync(root+'/proposed-options.json')),allocatedPrompts:1,allocationStatus:'Explicit manager task_432cebde0ee4 / ctx_cddbd39932ba; one primary-terra prompt, no retry/fallback/replay',directReceipt:'78406de live readiness; independent2a61603; final-live-a01.json'};
writeFileSync(root+'/allocated-options.json',JSON.stringify(options,null,2)+'\n',{flag:'wx'});
const r={at:new Date().toISOString(),task:'task_432cebde0ee4',dispatch:'ctx_cddbd39932ba',allocationId:options.allocationId,manager:'pi_6902ee58_e023_4347_8b44_4dd411f1dcff',leaseOwner:'c07b325c-fd1d-49d2-aaa2-abd4f3c02248',budget:{authorized:9,consumed:0,allocated:1,unallocated:8,historicalPreM4Consumed:9,m4Consumed:0},providerRead:false};
try{
 const before=JSON.parse(readFileSync(out+'/baseline-a01.json'));
 r.capabilities=await nativeRequest('/capabilities');assert(r.capabilities.body.result.phoneEnabled&&r.capabilities.body.result.accessibility);assert.equal(r.capabilities.body.result.backendRunning,false);assert.equal(r.capabilities.body.result.backendStopping,false);
 const apk=shell('pm path dev.olea.m2.runtime').trim().replace(/^package:/,'');r.apk=shell(`sha256sum ${apk}`).split(/\s+/)[0];assert.equal(r.apk,before.apk.sha256);
 r.publicHashes=before.deployed.map(x=>{const sha256=shell(`run-as dev.olea.m2.runtime sha256sum files/rootfs/opt/olea-m3-final-ready-a01/${x.path}`).split(/\s+/)[0];assert.equal(sha256,x.sha256);return {...x,sha256};});
 r.identities=['dev.olea.m2.runtime','dev.olea.m2.fixture'].map(pkg=>{const pid=Number(shell('pidof '+pkg).trim());assert(Number.isInteger(pid)&&pid>0);const stat=shell(`run-as ${pkg} cat /proc/${pid}/stat`).trim();const fields=stat.slice(stat.lastIndexOf(')')+2).split(' ');const uid=shell(`run-as ${pkg} id -u`).trim();return{pkg,pid,uid:Number(uid),start:fields[19],stat};});assert.equal(r.identities[0].pid,15565);assert.equal(r.identities[1].pid,7596);
 r.notifications=await bridge('notifications');assert.equal(r.notifications.body.result.notifications.length,0);
 const value='OLEA_M5_FINAL_PREFLIGHT_794467620612';r.file=await bridge('files_write_read',{value});assert(r.file.body.ok);const doc=decodeURIComponent(r.file.body.result.uri.split('/document/')[1]);assert(doc.startsWith('primary:Documents/OleaM3/'));r.independentFile=shell(`cat '/sdcard/${doc.slice(8)}'`);assert.equal(r.independentFile,value);
 r.freshPaths=[options.workspace,options.stateDir,options.output,options.captureReady,options.captureReady+'.request.json','/run/'+options.allocationId+'.started'].map(path=>{const result=shell(`run-as dev.olea.m2.runtime sh -c 'if [ -e files/rootfs${path} ] || [ -L files/rootfs${path} ]; then echo EXISTS; else echo ABSENT; fi'`).trim();assert.equal(result,'ABSENT');return{path,result};});
 r.auditBaseline=device(['exec-out','run-as','dev.olea.m2.runtime','cat','files/phone-audit.jsonl']);r.activityBaseline=device(['exec-out','run-as','dev.olea.m2.runtime','cat','files/activity-request-audit.jsonl']);r.fixtureBaseline=device(['exec-out','run-as','dev.olea.m2.fixture','cat','files/observed-launches.txt']);r.captureBaseline=shell('run-as dev.olea.m2.runtime sha256sum files/capture.png');r.captureModified=Number(shell('run-as dev.olea.m2.runtime stat -c %Y files/capture.png').trim());
 r.historical=before.historical.map(x=>{const actual=shell(`run-as dev.olea.m2.runtime sha256sum ${x.path}`).split(/\s+/)[0];assert.equal(actual,x.sha256);return{...x,actual};});
 r.inventory=shell('ps -A -o UID,PID,PPID,NAME').split('\n').filter(l=>/^\s*1021[678]\s/.test(l));assert.equal(r.inventory.length,2);
 r.stage=device(['push',root+'/allocated-options.json','/data/local/tmp/m5-allocated-options.json']);r.deploy=shell("run-as dev.olea.m2.runtime sh -c 'set -euC; mkdir -p files/rootfs/opt/olea-m3-final-ready-a01/spike/m5/runtime; cat /data/local/tmp/m5-allocated-options.json > files/rootfs/opt/olea-m3-final-ready-a01/spike/m5/runtime/allocated-options.json'");
 r.foreground=shell('dumpsys activity activities').split('\n').filter(l=>/topResumedActivity|mResumedActivity/.test(l));assert(r.foreground.join('').includes('dev.olea.m2.runtime'));
 r.status='ready';
}catch(e){r.status='failed_no_submission';r.error=e.message;}
writeFileSync(out+'/final-live-a01.json',JSON.stringify(r,null,2)+'\n',{flag:'wx'});console.log({status:r.status,error:r.error,identities:r.identities?.map(({pkg,pid,uid,start})=>({pkg,pid,uid,start}))});if(r.status!=='ready')process.exitCode=1;
