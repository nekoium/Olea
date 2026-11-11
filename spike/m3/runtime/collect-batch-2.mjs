// SPDX-License-Identifier: MIT
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {device,nativeRequest} from '../../m2/runtime/bridge.mjs';
const before=JSON.parse(readFileSync('spike/m3/runtime/evidence/backend-recovery-a02.json','utf8')).historyBefore;
const current=device(['shell',"run-as dev.olea.m2.runtime sh -c 'find files/rootfs/opt/olea/evidence -type f \\( -name \"*.jsonl\" -o -name combined-value.txt -o -name config.toml \\) -exec sha256sum {} \\;; sha256sum files/rootfs/workspace/sentinel'"]);
const artifacts=['.setup/m3-runtime-a06.apk','.setup/m3-supervision-a03.apk','.setup/m3-runtime-a07.apk','.setup/m3-supervision-a04.apk'].map(path=>({path,sha256:createHash('sha256').update(readFileSync(path)).digest('hex')}));
const source=['spike/android/app/src/main/java/dev/olea/spike/RuntimeProbe.kt','spike/android/app/src/main/java/dev/olea/spike/OwnedProcess.kt','spike/android/app/src/androidTest/java/dev/olea/spike/SupervisionInstrumentation.kt'].map(path=>({path,sha256:createHash('sha256').update(readFileSync(path)).digest('hex'),domain:'raw compiled working-tree bytes'}));
const report={at:new Date().toISOString(),modelRequests:0,artifacts,source,canonicalHistoryUnchanged:current===before,canonicalHistory:current,protectedModes:device(['shell',"run-as dev.olea.m2.runtime stat -c '%a %n' files/rootfs/run/olea-provider.json files/bridge-token files/bridge-config.json"]),capabilities:await nativeRequest('/capabilities'),uidInventory:device(['shell','ps -A -o UID,PID,PPID,NAME']).split('\n').filter(l=>/^\s*1021[678]\s/.test(l)),providerBudget:{globalConsumed:5,unallocated:3,workerAllocated:0}};
writeFileSync('spike/m3/runtime/evidence/batch-2-state.json',JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log({canonicalHistoryUnchanged:report.canonicalHistoryUnchanged,capabilities:report.capabilities,uidInventory:report.uidInventory});
