// SPDX-License-Identifier: MIT
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {device,bridge} from '../../m2/runtime/bridge.mjs';
import {execFileSync} from 'node:child_process';
const report={attempt:'native-cancel-a01',startedAt:Date.now(),modelRequests:0};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
try {
 report.launch=execFileSync('C:/Program Files/Git/bin/bash.exe',['spike/m2/runtime/run-probe.sh','m3-native-cancel-a01','spike/m3/runtime/native-cancel-a01.sh'],{encoding:'utf8',timeout:15000});
 await wait(1500);
 report.before=device(['shell',"run-as dev.olea.m2.runtime cat files/rootfs/workspace/m3-native-cancel-a01/started"]);
 report.cancelAt=Date.now(); report.stop=await bridge('stop'); assert.equal(report.stop.body.ok,true);
 await wait(2000);
 report.denied=await bridge('fixture_action',{value:'CANCEL_MUST_NOT_APPLY'});assert.equal(report.denied.body.error?.code,'PHONE_STOPPED');
 report.native=JSON.parse(device(['exec-out','run-as','dev.olea.m2.runtime','cat','files/m2/m3-native-cancel-a01.json']));
 assert.equal(report.native.rootExitObserved,true);assert.equal(report.native.ownershipCleanup.trackedExitVerified,true);
 report.independentIdentities=report.native.ownershipCleanup.owned.map(identity=>({identity,observation:device(['shell',`if [ -d /proc/${identity.pid} ]; then cat /proc/${identity.pid}/stat; else echo ABSENT; fi`]).trim()}));
 assert(report.independentIdentities.every(x=>x.observation==='ABSENT'));
 report.lateEffect=device(['shell',"run-as dev.olea.m2.runtime sh -c 'test ! -e files/rootfs/workspace/m3-native-cancel-a01/late-effect && echo ABSENT'"]).trim();assert.equal(report.lateEffect,'ABSENT');
 report.status='pass';
} catch(e){report.status='fail';report.error=e.message;}
finally{report.endedAt=Date.now();writeFileSync('spike/m3/runtime/evidence/native-cancel-a01.json',JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log({status:report.status,error:report.error,cleanup:report.native?.ownershipCleanup});}
