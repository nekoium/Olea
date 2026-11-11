// SPDX-License-Identifier: MIT
// Bounded read-only observations. No configuration contents, grant changes or UI actions.
import { device, bridge, nativeRequest } from '../../m2/runtime/bridge.mjs';
import { writeFileSync } from 'node:fs';
const attempt=process.argv[2] ?? 'consent-observation-a01';
if(!/^[a-z0-9-]{1,64}$/.test(attempt))throw Error('invalid_attempt');
const report={attempt,at:new Date().toISOString(),modelRequests:0,observations:{}};
for(const [name,command] of Object.entries({
 foreground:'dumpsys activity activities | /system/bin/grep -E "topResumedActivity|mResumedActivity"',
 accessibility:'settings get secure enabled_accessibility_services',
 uriGrants:'dumpsys activity permissions',
 capture:'run-as dev.olea.m2.runtime sh -c \'if [ -f files/capture.png ]; then stat -c "%s %Y %n" files/capture.png; sha256sum files/capture.png; else echo CAPTURE_ABSENT; fi\'',
 processes:'ps -A -o UID,PID,PPID,NAME | /system/bin/grep -E "^ *1021[678] "',
})){try{report.observations[name]=device(['shell',command]);}catch(e){report.observations[name]={error:e.message};}}
try { report.capabilities=await nativeRequest('/capabilities'); } catch(e) { report.capabilities={error:e.message}; }
if(report.capabilities.body?.result?.phoneEnabled){report.captureMetadata=await bridge('capture_result');}
const permissions=report.observations.uriGrants;
if(typeof permissions==='string')report.observations.uriGrants=permissions.split('\n').filter((line,i,lines)=>line.includes('10216')||line.includes('dev.olea.m2.runtime')||line.includes('OleaM3')||line.includes('content://com.android.externalstorage.documents')) .join('\n');
// uiautomator writes a development measurement file; avoid even that during read-only hold.
writeFileSync(`spike/m3/runtime/evidence/${attempt}.json`,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify(report));
