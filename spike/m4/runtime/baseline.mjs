// SPDX-License-Identifier: MIT
// Read-only development measurement. Protected bytes/digests never enter evidence.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {device,nativeRequest} from '../../m2/runtime/bridge.mjs';
const shell=s=>device(['shell',s]);
mkdirSync('spike/m4/runtime/evidence',{recursive:true});
const old=JSON.parse(readFileSync('spike/m3/runtime/evidence/EXTRA_PROMPT_FINAL_RELEASE_RECEIPT.json'));
const r={at:new Date().toISOString(),leaseMessage:'msg_0cadfcb34a63',worker:'9e78162f-c4b8-4db0-987c-12277b05c76d',dispatch:'ctx_ace1a863c3a3',run:'run_dd39824405ae',modelRequests:0};
r.device=shell('getprop ro.boot.qemu.avd_name; getprop sys.boot_completed; getprop ro.build.version.sdk; getprop ro.product.cpu.abi; cat /sys/devices/system/cpu/online; head -1 /proc/meminfo');
r.inventory=shell('ps -A -o UID,PID,PPID,NAME').split('\n').filter(l=>/^\s*1021[678]\s/.test(l));
r.retainedPreparationFailure='First baseline collector tried runtime run-as for fixture /proc/7596/stat; Android denied cross-UID access, no mutation occurred; corrected to each package identity.';
r.identities=r.inventory.map(line=>{const fields=line.trim().split(/\s+/),pid=Number(fields[1]),packageName=fields[3];assert(/^dev\.olea\.m2\.(runtime|fixture|repeat)$/.test(packageName));return{pid,packageName,stat:shell(`run-as ${packageName} cat /proc/${pid}/stat`).trim()};});
r.forward=device(['forward','tcp:8768','tcp:8768']);
r.capabilities=await nativeRequest('/capabilities');
assert.equal(r.capabilities.body.result.phoneEnabled,false);assert.equal(r.capabilities.body.result.backendRunning,false);
r.projection=shell('dumpsys media_projection');r.accessibility=shell('settings get secure enabled_accessibility_services; settings get secure accessibility_enabled');
r.listeners=shell('settings get secure enabled_notification_listeners');
r.permissions=shell('dumpsys package dev.olea.m2.runtime; dumpsys package dev.olea.m2.fixture').split('\n').filter(l=>/ACCESS_FINE_LOCATION: granted=|ACCESS_COARSE_LOCATION: granted=|POST_NOTIFICATIONS: granted=/.test(l));
r.uriGrants=shell('dumpsys activity permissions').split('\n').filter(l=>l.includes('10216')||l.includes('OleaM3'));
r.retainedFiles=shell('ls -l /sdcard/Documents/OleaM3');
r.historical=old.historical.map(x=>{const actual=shell(`run-as dev.olea.m2.runtime sha256sum ${x.path}`).trim().split(/\s+/)[0];return{path:x.path,expected:x.expected,actual,equal:actual===x.expected};});assert(r.historical.every(x=>x.equal));
r.sessionHashes=shell("run-as dev.olea.m2.runtime sh -c 'sha256sum files/rootfs/workspace/m3-pi-final-seven-02-state/m2_204a30734b03aa49c10ca0241a11175c/*'");assert.equal(r.sessionHashes,old.sessionHashes);
r.publicFiles=shell("run-as dev.olea.m2.runtime sh -c 'sha256sum files/capture.png files/start-runtime.sh files/linux.sh; find files/rootfs/opt/agents/codex/node_modules/@openai -type f \\( -name package.json -o -name codex.js -o -name codex \\) -exec sha256sum {} \\;'");
r.protectedModes=shell("run-as dev.olea.m2.runtime stat -c '%a %n' files/rootfs/run/olea-provider.json files/bridge-token files/bridge-config.json");
r.status='pass';r.budget={consumed:9,authorized:9,remaining:0};
writeFileSync('spike/m4/runtime/evidence/baseline-a01.json',JSON.stringify(r,null,2)+'\n',{flag:'wx'});
console.log({status:r.status,inventory:r.inventory,capabilities:r.capabilities.body.result,canonicalEqual:true});
