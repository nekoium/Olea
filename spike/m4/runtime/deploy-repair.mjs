// SPDX-License-Identifier: MIT
// Explicit app update is separate from the following same-host backend-only experiment.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,copyFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {device,nativeRequest} from '../../m2/runtime/bridge.mjs';
const shell=s=>device(['shell',s]),hash=b=>createHash('sha256').update(b).digest('hex');
const r={at:new Date().toISOString(),modelRequests:0,scope:'Settled original experiment, preserve installed APK and update same package in place; no uninstall/reset/data clear',source:[],native:[]};
const paths=['files/rootfs/run/olea-provider.json','files/bridge-token','files/bridge-config.json'];
const protectedBefore=paths.map(p=>device(['exec-out','run-as','dev.olea.m2.runtime','cat',p]));
r.capabilitiesBefore=await nativeRequest('/capabilities');assert.equal(r.capabilitiesBefore.body.result.backendRunning,false);assert.equal(r.capabilitiesBefore.body.result.backendStopping,false);
r.processBefore=shell('pidof dev.olea.m2.runtime');
const oldPath=shell('pm path dev.olea.m2.runtime').trim().replace(/^package:/,'');device(['pull',oldPath,'.setup/installed-before-m4.apk']);r.oldApk={path:oldPath,retained:'.setup/installed-before-m4.apk',sha256:hash(readFileSync('.setup/installed-before-m4.apk'))};
copyFileSync('spike/android/app/build/outputs/apk/modern/debug/app-modern-debug.apk','.setup/runtime-m4-a01.apk');r.newApk={retained:'.setup/runtime-m4-a01.apk',sha256:hash(readFileSync('.setup/runtime-m4-a01.apk'))};
for(const p of ['spike/android/app/src/main/java/dev/olea/spike/RuntimeService.kt','spike/android/app/src/main/java/dev/olea/spike/OwnedProcess.kt','spike/android/app/src/main/java/dev/olea/spike/RuntimeProbe.kt','spike/android/app/src/main/java/dev/olea/spike/MainActivity.kt','spike/m4/runtime/backend-recovery.mjs','spike/m4/runtime/build-a01.sh'])r.source.push({path:p,sha256:hash(readFileSync(p)),domain:'checkout bytes'});
for(const p of ['libandroid-shmem.so','libloader.so','libloader32.so','libproot.so','libtalloc.so'])r.native.push({path:p,sha256:hash(readFileSync('spike/android/app/src/modern/jniLibs/x86_64/'+p))});
r.buildExit=JSON.parse(readFileSync('.setup/build-m4-a01-exit.json'));assert.equal(r.buildExit.exitCode,0);r.buildLogSha256=hash(readFileSync('.setup/build-m4-a01.log'));
r.install=execFileSync('C:/Users/Aria/AppData/Local/Android/Sdk/platform-tools/adb.exe',['-s','emulator-5554','install','-r','.setup/runtime-m4-a01.apk'],{encoding:'utf8',timeout:45000});assert(r.install.includes('Success'));
r.launch=shell('am start -f 0x18000000 -n dev.olea.m2.runtime/dev.olea.spike.MainActivity');await new Promise(r=>setTimeout(r,700));
r.processAfter=shell('pidof dev.olea.m2.runtime');r.capabilitiesAfter=await nativeRequest('/capabilities');assert.equal(r.capabilitiesAfter.body.result.phoneEnabled,false);
const installed=shell('pm path dev.olea.m2.runtime').trim().replace(/^package:/,'');r.installedHash=shell(`sha256sum ${installed}`).trim().split(/\s+/)[0];assert.equal(r.installedHash,r.newApk.sha256);
r.protectedEqual=paths.map((p,i)=>({path:p,equal:device(['exec-out','run-as','dev.olea.m2.runtime','cat',p])===protectedBefore[i]}));assert(r.protectedEqual.every(x=>x.equal));r.protectedModes=shell("run-as dev.olea.m2.runtime stat -c '%a %n' files/rootfs/run/olea-provider.json files/bridge-token files/bridge-config.json");
r.captureHash=shell('run-as dev.olea.m2.runtime sha256sum files/capture.png');r.folderSelection='Persisted SAF grant preserved; process-local folder pointer lost during explicit APK update, no dependent folder test or consent claimed.';
r.finishedAt=new Date().toISOString();r.status='pass';writeFileSync('spike/m4/runtime/evidence/deploy-repair-a01.json',JSON.stringify(r,null,2)+'\n',{flag:'wx'});console.log({status:r.status,oldApk:r.oldApk.sha256,newApk:r.newApk.sha256,processBefore:r.processBefore,processAfter:r.processAfter});
