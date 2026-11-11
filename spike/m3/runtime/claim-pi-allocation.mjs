// SPDX-License-Identifier: MIT
import {readFileSync,writeFileSync} from 'node:fs';
import {device} from '../../m2/runtime/bridge.mjs';
const r={allocationId:'m3-pi-location-notification-01',at:new Date().toISOString(),globalConsumedBeforeSubmission:6,claimedAllocation:1,unallocated:1,submitted:0,explicitRetryFallbackReplay:0};
try{
 const preflight=JSON.parse(readFileSync('spike/m3/runtime/evidence/pi-category-preflight-a01.json','utf8'));if(preflight.status!=='ready')throw Error('not ready');
 const finalRunner=JSON.parse(readFileSync('spike/m3/runtime/evidence/pi-runner-result-preflight-a01.json','utf8'));if(finalRunner.actual!==finalRunner.expected)throw Error('not ready');
 device(['shell','run-as dev.olea.m2.runtime mkdir files/rootfs/run/m3-pi-location-notification-01.started']);r.claim='created_before_provider_read';
 const original=JSON.parse(readFileSync('C:/Users/Aria/Projects/Development/Olea/.setup/android-test-provider.local.json','utf8'));
 const retained=JSON.parse(device(['exec-out','run-as','dev.olea.m2.runtime','cat','files/rootfs/run/olea-provider.json']));
 r.keyEqualsAuthorizedSource=typeof original.apiKey==='string'&&!!original.apiKey&&original.apiKey===retained.apiKey;
 r.endpointEqualsAuthorizedSource=original.baseUrl==='https://api.chiyi.cc/v1'&&retained.baseUrl===original.baseUrl;
 if(!r.keyEqualsAuthorizedSource||!r.endpointEqualsAuthorizedSource)throw Error('identity mismatch');r.status='claimed_and_ready';
}catch{r.status='failed_no_retry';}
writeFileSync('spike/m3/runtime/evidence/pi-allocation-claim-a01.json',JSON.stringify(r,null,2)+'\n',{flag:'wx'});console.log({status:r.status,globalConsumedBeforeSubmission:r.globalConsumedBeforeSubmission,unallocated:1});if(r.status!=='claimed_and_ready')process.exitCode=1;
