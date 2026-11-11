// SPDX-License-Identifier: MIT
// Atomic allocation consumption precedes all provider reads; prints only equality/status metadata.
import {readFileSync,writeFileSync} from 'node:fs';
import {device} from '../../m2/runtime/bridge.mjs';
const report={allocationId:'m3-codex-location-notification-01',claimedAt:new Date().toISOString(),globalConsumedAfterClaim:6,unallocatedRemaining:2,allocatedRemaining:0,submissionAttempted:false,retryFallbackReplay:0};
try{
 const preflight=JSON.parse(readFileSync('spike/m3/runtime/evidence/categories-preflight-a01.json','utf8'));if(preflight.status!=='ready')throw Error('prerequisite_failed');
 device(['shell','run-as dev.olea.m2.runtime mkdir files/rootfs/run/m3-codex-location-notification-01.started']);
 report.claim='created';
 const original=JSON.parse(readFileSync('C:/Users/Aria/Projects/Development/Olea/.setup/android-test-provider.local.json','utf8'));
 const retained=JSON.parse(device(['exec-out','run-as','dev.olea.m2.runtime','cat','files/rootfs/run/olea-provider.json']));
 report.authorizedSource='C:/Users/Aria/Projects/Development/Olea/.setup/android-test-provider.local.json';
 report.keyEqualsAuthorizedSource=typeof original.apiKey==='string'&&!!original.apiKey&&original.apiKey===retained.apiKey;
 report.endpointEqualsAuthorizedSource=original.baseUrl==='https://api.chiyi.cc/v1'&&retained.baseUrl===original.baseUrl;
 report.protectedReuse='Existing mode600 provider file; no credential copied into payload, argv, prompt or shell/MCP environment';
 if(!report.keyEqualsAuthorizedSource||!report.endpointEqualsAuthorizedSource)throw Error('provider_identity_mismatch');
 report.status='claimed_and_ready';
}catch{report.status='claim_or_identity_failed_no_retry';}
writeFileSync('spike/m3/runtime/evidence/categories-allocation-claim-a01.json',JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log({status:report.status,consumed:report.globalConsumedAfterClaim,unallocated:report.unallocatedRemaining});
if(report.status!=='claimed_and_ready')process.exitCode=1;
