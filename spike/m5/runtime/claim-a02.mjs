// SPDX-License-Identifier: MIT
// Claim exactly the original manager allocation after fresh prerequisites/observer, then verify authorized identity without exporting secrets.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {device} from '../../m2/runtime/bridge.mjs';
const r={at:new Date().toISOString(),allocationId:'m5-pi-final-seven-01',task:'task_f99d0400d37b',dispatch:'ctx_2ac934704b0e',topLevelSubmitted:0,budget:{authorized:9,consumed:0,allocated:1,unallocated:8},retry:0,fallback:0,replay:0};
try{
 const p=JSON.parse(readFileSync('spike/m5/runtime/evidence/final-live-a02.json'));assert.equal(p.status,'ready');
 const observer=JSON.parse(readFileSync('spike/m5/runtime/evidence/m5-final-a02-observer-started.json'));const processInfo=JSON.parse(readFileSync('.setup/m5-observer-process-a02.json'));process.kill(processInfo.pid,0);assert.equal(observer.readyPath,'/workspace/m5-pi-final-seven-01-capture-ready.json');
 for(const {path} of p.freshPaths){const state=device(['shell',`run-as dev.olea.m2.runtime sh -c 'if [ -e files/rootfs${path} ] || [ -L files/rootfs${path} ]; then echo EXISTS; else echo ABSENT; fi'`]).trim();assert.equal(state,'ABSENT');}
 device(['shell','run-as dev.olea.m2.runtime mkdir files/rootfs/run/m5-pi-final-seven-01.started']);r.claim='atomic_new_directory_before_provider_access';
 const local=JSON.parse(readFileSync('C:/Users/Aria/Projects/Development/Olea/.setup/android-test-provider.local.json'));const deployed=JSON.parse(device(['exec-out','run-as','dev.olea.m2.runtime','cat','files/rootfs/run/olea-provider.json']));
 r.providerIdentity={apiKeyEqual:typeof local.apiKey==='string'&&!!local.apiKey&&local.apiKey===deployed.apiKey,baseUrlEqual:local.baseUrl===deployed.baseUrl,primaryModelEqual:(local.primaryModel??'gpt-6.1-terra')===(deployed.primaryModel??'gpt-6.1-terra')};assert(Object.values(r.providerIdentity).every(Boolean));
 r.status='claimed_and_ready';
}catch(e){r.status='failed_no_launch';r.error='claim_or_identity_prerequisite_failed';}
writeFileSync('spike/m5/runtime/evidence/claim-a02.json',JSON.stringify(r,null,2)+'\n',{flag:'wx'});console.log({status:r.status,allocationId:r.allocationId});if(r.status!=='claimed_and_ready')process.exitCode=1;
