// SPDX-License-Identifier: MIT
// Development observation only. Never reads credential/config contents into receipts.
import { device, bridge } from '../../m2/runtime/bridge.mjs';
import { mkdirSync, writeFileSync } from 'node:fs';
const out = 'spike/m3/runtime/evidence';
mkdirSync(out, {recursive:true});
const shell = command => device(['shell', command]);
const receipt = {observedAt:new Date().toISOString(), repoId:'d55c3648-a5ff-4d7b-96d8-e80071701415', runId:'run_b5b2bce33e72', taskId:'task_68e5ff34d5a6', dispatchId:'ctx_4f9fe071d696', owner:'1f3cf796-8a8d-4588-ada6-5d2cfb7d5bea', lease:'EXCLUSIVE granted by manager msg_ec866d1031d1; former release930f00f', modelBudget:{globalConsumed:5,globalTotal:8,allocated:0}, operations:[]};
for (const [name,command] of Object.entries({
 device:'getprop sys.boot_completed; getprop ro.build.version.sdk; getprop ro.product.cpu.abi; cat /sys/devices/system/cpu/online; head -1 /proc/meminfo',
 packages:'pm list packages -U | /system/bin/grep dev.olea.m2',
 processes:'ps -A -o UID,PID,PPID,NAME | /system/bin/grep -E "u0_a216|u0_a217|u0_a218"',
 permissions:'dumpsys package dev.olea.m2.runtime | /system/bin/grep -E "ACCESS_FINE_LOCATION|ACCESS_COARSE_LOCATION|POST_NOTIFICATIONS|granted="; settings get secure enabled_accessibility_services; settings get secure enabled_notification_listeners',
 foreground:'dumpsys activity activities | /system/bin/grep -E "topResumedActivity|mResumedActivity"',
 data:'run-as dev.olea.m2.runtime sh -c \'stat -c "%a %s %n" files/rootfs/run/olea-provider.json files/bridge-token files/bridge-config.json; find files/rootfs/workspace files/rootfs/workspaces files/rootfs/root/.pi files/rootfs/root/.codex -type f 2>/dev/null | head -100 | xargs -r sha256sum\'',
 installed:'pm path dev.olea.m2.runtime; pm path dev.olea.m2.fixture; pm path dev.olea.m2.repeat',
 identities:'for p in 9619 9732 12459; do cat /proc/$p/stat; done',
})){try { receipt[name]=shell(command); } catch(e) {receipt[name]={error:e.message,stderr:String(e.stderr)};}}
try { receipt.capabilities=await bridge('capabilities'); }catch(e){receipt.capabilities={error:e.message};}
writeFileSync(`${out}/initial-baseline.json`,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({saved:`${out}/initial-baseline.json`,capabilities:receipt.capabilities,processes:receipt.processes,modelBudget:receipt.modelBudget}));
