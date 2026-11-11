// SPDX-License-Identifier: MIT
// Final authorized allocation: atomic claim then source-identity comparison, no credential output.
import {readFileSync,writeFileSync} from 'node:fs';
import {device} from '../../m2/runtime/bridge.mjs';
const r={allocationId:'m3-pi-final-seven-01',at:new Date().toISOString(),globalBefore:7,allocated:1,unallocated:0,topLevelSubmittedAtClaim:0,retriesFallbackReplays:0};
try{
 const p=JSON.parse(readFileSync('spike/m3/runtime/evidence/final-pi-preflight-a02.json','utf8'));if(p.status!=='ready')throw Error('not ready');
 const observer=JSON.parse(readFileSync('.setup/final-pi-observer-started.json','utf8'));if(observer.readyPath!=='/workspace/m3-pi-final-seven-capture-ready.json')throw Error('observer not ready');
 device(['shell','run-as dev.olea.m2.runtime mkdir files/rootfs/run/m3-pi-final-seven-01.started']);r.claim='created_before_provider_read';
 const root=JSON.parse(readFileSync('C:/Users/Aria/Projects/Development/Olea/.setup/android-test-provider.local.json','utf8'));
 const retained=JSON.parse(device(['exec-out','run-as','dev.olea.m2.runtime','cat','files/rootfs/run/olea-provider.json']));
 r.keyEqualsAuthorizedRoot=typeof root.apiKey==='string'&&!!root.apiKey&&root.apiKey===retained.apiKey;r.endpointEquals=root.baseUrl==='https://api.chiyi.cc/v1'&&retained.baseUrl===root.baseUrl;
 if(!r.keyEqualsAuthorizedRoot||!r.endpointEquals)throw Error('identity mismatch');r.status='claimed_and_ready';
}catch{r.status='failed_no_retry';}
writeFileSync('spike/m3/runtime/evidence/final-pi-allocation-claim-a01.json',JSON.stringify(r,null,2)+'\n',{flag:'wx'});console.log({status:r.status,remainingUnallocated:0});if(r.status!=='claimed_and_ready')process.exitCode=1;
