// SPDX-License-Identifier: MIT
// Bounded M5 prerequisite evidence only; never reads provider credentials.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {device,nativeRequest} from '../../m2/runtime/bridge.mjs';
const out='spike/m5/runtime/evidence';mkdirSync(out,{recursive:true});
const shell=s=>device(['shell',s]);
const prior=JSON.parse(readFileSync('C:/Users/Aria/Projects/Development/Olea/spike/m4/runtime/evidence/EXPLICIT_LEASE_RELEASE.json'));
const r={at:new Date().toISOString(),leaseGrant:'msg_f59cba7be0b2',owner:'c07b325c-fd1d-49d2-aaa2-abd4f3c02248',dispatch:'ctx_944b2d34dd69',run:'run_794467620612',modelRequests:0,allocation:0};
try {
 r.devices=device(['devices','-l']);r.device=shell('getprop ro.boot.qemu.avd_name; getprop sys.boot_completed; getprop ro.build.version.sdk; getprop ro.product.cpu.abi');
 r.forward=device(['forward','tcp:8768','tcp:8768']);r.capabilities=await nativeRequest('/capabilities');assert.equal(r.capabilities.body.result.phoneEnabled,false);assert.equal(r.capabilities.body.result.backendRunning,false);
 const apk=shell('pm path dev.olea.m2.runtime').trim().replace(/^package:/,'');r.apk={path:apk,sha256:shell(`sha256sum ${apk}`).split(/\s+/)[0]};assert.equal(r.apk.sha256,prior.installedApk.sha256);
 const manifest=JSON.parse(readFileSync('spike/m3/runtime/evidence/final-seven-precondition-state-a01.json'));
 r.deployed=manifest.deployed.map(x=>{const actual=shell(`run-as dev.olea.m2.runtime sha256sum files/rootfs/opt/olea-m3-final-ready-a01/${x.path}`).split(/\s+/)[0];assert.equal(actual,x.actual);return {path:x.path,sha256:actual};});
 r.historical=prior.historical.map(x=>{const actual=shell(`run-as dev.olea.m2.runtime sha256sum ${x.path}`).split(/\s+/)[0];assert.equal(actual,x.actual);return {path:x.path,sha256:actual,originalEquality:x.originalEquality};});
 r.files=shell('ls -l /sdcard/Documents/OleaM3; sha256sum /sdcard/Documents/OleaM3/*');
 r.oldCapture=shell('run-as dev.olea.m2.runtime sha256sum files/capture.png');
 const bytes=execFileSync('C:/Users/Aria/AppData/Local/Android/Sdk/platform-tools/adb.exe',['-s','emulator-5554','exec-out','run-as','dev.olea.m2.runtime','cat','files/capture.png'],{timeout:15000,maxBuffer:4000000});writeFileSync(out+'/preserved-before.png',bytes,{flag:'wx'});
 r.inventory=shell('ps -A -o UID,PID,PPID,NAME').split('\n').filter(l=>/^\s*1021[678]\s/.test(l));r.accessibility=shell('settings get secure enabled_accessibility_services; settings get secure accessibility_enabled');r.projection=shell('dumpsys media_projection');r.grants=shell('dumpsys activity permissions').split('\n').filter(l=>l.includes('10216')||l.includes('OleaM3'));r.status='pass';
} catch(e){r.status='fail';r.error=e.message;}
writeFileSync(out+'/baseline-a01.json',JSON.stringify(r,null,2)+'\n',{flag:'wx'});console.log({status:r.status,error:r.error,apk:r.apk,inventory:r.inventory});
