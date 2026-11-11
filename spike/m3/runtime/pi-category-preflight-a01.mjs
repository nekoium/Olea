// SPDX-License-Identifier: MIT
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {device,bridge,nativeRequest} from '../../m2/runtime/bridge.mjs';
const shell=s=>device(['shell',s]);const wait=ms=>new Promise(r=>setTimeout(r,ms));
const r={attempt:'pi-category-preflight-a01',startedAt:Date.now(),modelRequests:0,allocationId:'m3-pi-location-notification-01',route:'Explicit development native enable/restart; no Accessibility/SAF/MediaProjection or Chrome user decision'};
try{
 const deadline=Date.now()+45000;let ready;
 while(Date.now()<deadline){ready=shell("run-as dev.olea.m2.runtime sh -c 'if [ -f files/m2/m3-pi-registration-a01.json ]; then echo READY; fi'").trim();if(ready==='READY')break;await wait(500);}
 assert.equal(ready,'READY');
 const registration=device(['exec-out','run-as','dev.olea.m2.runtime','cat','files/rootfs/workspace/m3-pi-registration-a01/report.json']);r.registration=JSON.parse(registration);assert.equal(r.registration.status,'pass');assert.equal(r.registration.version,'1.5.2');writeFileSync('spike/m3/runtime/evidence/pi-registration-a01.json',registration,{flag:'wx'});
 const nativeText=device(['exec-out','run-as','dev.olea.m2.runtime','cat','files/m2/m3-pi-registration-a01.json']);r.nativeRegistration=JSON.parse(nativeText);writeFileSync('spike/m3/runtime/evidence/pi-registration-a01-native.json',nativeText,{flag:'wx'});assert.equal(r.nativeRegistration.rootExitObserved,true);
 r.registrationIndependent=r.nativeRegistration.finalOwnershipCleanup.owned.map(identity=>({identity,observation:shell(`if [ -d /proc/${identity.pid} ]; then cat /proc/${identity.pid}/stat; else echo ABSENT; fi`).trim()}));assert(r.registrationIndependent.every(x=>x.observation==='ABSENT'));
 const paths=['spike/backend/extensions/phone.ts','spike/tests/m2/pi-single.mjs','spike/tests/m2/assertions.mjs','spike/tests/m2/evidence.mjs','spike/tests/m2/observe-tree.mjs','spike/m3/runtime/grouped-phone-prompt.mjs','spike/m3/runtime/pi-registration-a01.mjs','spike/m3/runtime/pi-location-notification-options.json',...['backend.js','pi-process.js','process-tree.js','phone-mcp.js','codex-process.js','codex-session.js','server.js'].map(x=>'spike/backend/dist/'+x)];
 r.deployed=paths.map(path=>{const expected=createHash('sha256').update(readFileSync(path)).digest('hex');const actual=shell(`run-as dev.olea.m2.runtime sha256sum files/rootfs/opt/olea-m3-pi-categories-a01/${path}`).trim().split(/\s+/)[0];assert.equal(actual,expected);return{path,expected,actual};});
 r.unclaimed=shell("run-as dev.olea.m2.runtime sh -c 'test ! -e files/rootfs/run/m3-pi-location-notification-01.started && echo UNCLAIMED'").trim();assert.equal(r.unclaimed,'UNCLAIMED');
 r.volatile=shell("run-as dev.olea.m2.runtime sh -c 'if [ -f files/capture.png ]; then echo PRESENT; else echo ABSENT; fi'").trim();assert.equal(r.volatile,'ABSENT');
 r.enable=shell("run-as dev.olea.m2.runtime sh -c 'touch files/enable-phone-once'");r.restart=shell('am force-stop dev.olea.m2.runtime; am start -f 0x18000000 -n dev.olea.m2.runtime/dev.olea.spike.MainActivity');await wait(700);
 r.capabilities=await nativeRequest('/capabilities');assert.equal(r.capabilities.body.result.phoneEnabled,true);assert.equal(r.capabilities.body.result.backendRunning,false);
 r.location=await bridge('location');assert.equal(r.location.body.ok,true);const p=r.location.body.result;assert(Math.abs(p.latitude-24.9876)<0.0001&&Math.abs(p.longitude-121.5432)<0.0001&&p.accuracy>=0);
 r.independentCoordinates=shell('dumpsys location').split('\n').filter(l=>/last location=Location\[gps/.test(l)).join('\n');assert(r.independentCoordinates.includes('24.987600,121.543198'));
 r.notifications=await bridge('notifications');assert.equal(r.notifications.body.ok,true);assert.equal(r.notifications.body.result.notifications.length,0);
 r.fixtureLaunchBaseline=device(['exec-out','run-as','dev.olea.m2.fixture','cat','files/observed-launches.txt']);r.auditBaseline=device(['exec-out','run-as','dev.olea.m2.runtime','cat','files/phone-audit.jsonl']);
 const old=JSON.parse(readFileSync('spike/m3/runtime/evidence/categories-session-preservation-a01.json','utf8')).historicalCanonicalHashes;
 r.preservationBefore=old.map(x=>({path:x.path,sha256:shell(`run-as dev.olea.m2.runtime sha256sum ${x.path}`).trim().split(/\s+/)[0]}));
 r.status='ready';
}catch(e){r.status='failed_prerequisite';r.error=e.message;}
finally{r.endedAt=Date.now();writeFileSync('spike/m3/runtime/evidence/pi-category-preflight-a01.json',JSON.stringify(r,null,2)+'\n',{flag:'wx'});console.log({status:r.status,error:r.error,registration:r.registration?.readiness,version:r.registration?.version});}
