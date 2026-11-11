// SPDX-License-Identifier: MIT
// Read-only reconciliation after install succeeded but collector lost its old HTTP connection.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {device,nativeRequest} from '../../m2/runtime/bridge.mjs';
const shell=s=>device(['shell',s]),hash=b=>createHash('sha256').update(b).digest('hex');
const r={at:new Date().toISOString(),modelRequests:0,scope:'Reconcile existing install; no install retry or app restart',priorCollectorFailure:'deploy-repair.mjs performed install -r and explicit launch, then GET capabilities reused dead old HTTP socket (UND_ERR_SOCKET other side closed); no prior report published',source:[],native:[]};
r.oldApk={retained:'.setup/installed-before-m4.apk',sha256:hash(readFileSync('.setup/installed-before-m4.apk'))};r.newApk={retained:'.setup/runtime-m4-a01.apk',sha256:hash(readFileSync('.setup/runtime-m4-a01.apk'))};
const installed=shell('pm path dev.olea.m2.runtime').trim().replace(/^package:/,'');r.installed={path:installed,sha256:shell(`sha256sum ${installed}`).trim().split(/\s+/)[0]};assert.equal(r.installed.sha256,r.newApk.sha256);
for(const p of ['spike/android/app/src/main/java/dev/olea/spike/RuntimeService.kt','spike/android/app/src/main/java/dev/olea/spike/OwnedProcess.kt','spike/android/app/src/main/java/dev/olea/spike/RuntimeProbe.kt','spike/android/app/src/main/java/dev/olea/spike/MainActivity.kt','spike/m4/runtime/backend-recovery.mjs','spike/m4/runtime/build-a01.sh'])r.source.push({path:p,sha256:hash(readFileSync(p)),domain:'checkout bytes'});
for(const p of ['libandroid-shmem.so','libloader.so','libloader32.so','libproot.so','libtalloc.so'])r.native.push({path:p,sha256:hash(readFileSync('spike/android/app/src/modern/jniLibs/x86_64/'+p))});
r.buildExit=JSON.parse(readFileSync('.setup/build-m4-a01-exit.json'));r.buildLogSha256=hash(readFileSync('.setup/build-m4-a01.log'));writeFileSync('spike/m4/runtime/evidence/build-m4-a01.txt',readFileSync('.setup/build-m4-a01.log'),{flag:'wx'});
r.capabilities=await nativeRequest('/capabilities');assert.equal(r.capabilities.body.result.phoneEnabled,false);assert.equal(r.capabilities.body.result.backendRunning,false);
r.hostPid=shell('pidof dev.olea.m2.runtime').trim();r.hostStat=shell(`run-as dev.olea.m2.runtime cat /proc/${r.hostPid}/stat`);
const local=JSON.parse(readFileSync('C:/Users/Aria/Projects/Development/Olea/.setup/android-test-provider.local.json'));const deployed=JSON.parse(device(['exec-out','run-as','dev.olea.m2.runtime','cat','files/rootfs/run/olea-provider.json']));
r.protectedProviderEquality={apiKeyEqual:local.apiKey===deployed.apiKey,baseUrlEqual:local.baseUrl===deployed.baseUrl};assert(r.protectedProviderEquality.apiKeyEqual&&r.protectedProviderEquality.baseUrlEqual);
const bridgeConfig=JSON.parse(device(['exec-out','run-as','dev.olea.m2.runtime','cat','files/bridge-config.json']));r.bridgeTokenConsistent=bridgeConfig.token===device(['exec-out','run-as','dev.olea.m2.runtime','cat','files/bridge-token']).trim();assert(r.bridgeTokenConsistent);
r.protectedModes=shell("run-as dev.olea.m2.runtime stat -c '%a %n' files/rootfs/run/olea-provider.json files/bridge-token files/bridge-config.json");r.protectedAcrossInstall='Not retained: original collector held before bytes in memory and died before equality/report; no retrospective equality asserted.';
r.captureHash=shell('run-as dev.olea.m2.runtime sha256sum files/capture.png');r.folderSelection='Persisted SAF grant retained; volatile pointer lost at explicit APK update. No folder action/test depends on it in this batch.';
r.status='pass';writeFileSync('spike/m4/runtime/evidence/deploy-reconcile-a01.json',JSON.stringify(r,null,2)+'\n',{flag:'wx'});console.log({status:r.status,installed:r.installed.sha256,hostPid:r.hostPid,providerEqual:r.protectedProviderEquality});
