// SPDX-License-Identifier: MIT
// Execute only after selected-folder/capture oracles are collected; this revokes development grants.
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {device,bridge,nativeRequest} from '../../m2/runtime/bridge.mjs';
const attempt=process.argv[2];if(!/^[a-z0-9-]{1,64}$/.test(attempt??''))throw Error('unique_attempt_required');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const report={attempt,at:new Date().toISOString(),modelRequests:0,cases:[],provisioning:'Explicit development permission revocation, not normal onboarding'};
const shell=s=>device(['shell',s]);
function unchanged(){return {oracle:shell('run-as dev.olea.m2.fixture sha256sum files/oracle-value.txt'),foreground:shell('dumpsys activity activities').split('\n').filter(l=>/topResumedActivity|mResumedActivity/.test(l)).join('\n')};}
try {
 assert.equal(process.argv[3],'--development-enable','Explicit development enable required');
 async function developmentEnable() {
  shell("run-as dev.olea.m2.runtime sh -c 'touch files/enable-phone-once'");
  shell('am force-stop dev.olea.m2.runtime');
  shell('am start -f 0x18000000 -n dev.olea.m2.runtime/dev.olea.spike.MainActivity');
  await wait(600);
 }
 await developmentEnable();
 const caps=await nativeRequest('/capabilities');assert.equal(caps.body.result.phoneEnabled,true,'Native phone enable prerequisite absent');
 const before=unchanged();
 const permission=shell('dumpsys package dev.olea.m2.runtime');assert(permission.includes('android.permission.ACCESS_FINE_LOCATION: granted=true'));
 report.locationBefore=await bridge('location');assert.notEqual(report.locationBefore.body.error?.code,'LOCATION_PERMISSION_DENIED');
 report.locationRevoke=shell('pm revoke dev.olea.m2.runtime android.permission.ACCESS_FINE_LOCATION');
 // Runtime permission revocation may kill the app. Explicit restart is recovery, never effect replay.
 report.locationRestart=shell('am start -f 0x18000000 -n dev.olea.m2.runtime/dev.olea.spike.MainActivity');await wait(500);
 report.recovered=await nativeRequest('/capabilities');assert.equal(report.recovered.body.result.phoneEnabled,false);
 report.stopped=await bridge('location');assert.equal(report.stopped.body.error?.code,'PHONE_STOPPED');
 report.before=before;report.after=unchanged();assert.equal(report.after.oracle,before.oracle);
 report.permissionAfter=shell('dumpsys package dev.olea.m2.runtime').split('\n').filter(l=>/ACCESS_FINE_LOCATION: granted=/.test(l)).join('\n');assert(report.permissionAfter.includes('granted=false'));
 await developmentEnable();
 report.permissionDenied=await bridge('location');assert.equal(report.permissionDenied.body.error?.code,'LOCATION_PERMISSION_DENIED');
 report.disabledAgain=await bridge('stop');assert.equal(report.disabledAgain.body.ok,true);
 report.developmentGrantRestored=shell('pm grant dev.olea.m2.runtime android.permission.ACCESS_FINE_LOCATION');
 report.status='pass';report.limit='Actual fine-location revocation, explicit disabled restart, development re-enable and direct permission denial; prior development grant restored explicitly. Foreground changes from recovery are expected.';
} catch(e){report.status='fail';report.error=e.message;}
finally{writeFileSync(`spike/m3/runtime/evidence/${attempt}.json`,JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log({status:report.status,error:report.error});}
