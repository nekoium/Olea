// SPDX-License-Identifier: MIT
// Authorized one-app SystemUI traversal and independent fresh-image measurement. No model/phone calls.
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {device} from '../../m2/runtime/bridge.mjs';
export async function completeCaptureConsent({attempt,requestId,readyPath,previousModified}) {
 if(!/^[a-z0-9-]+$/.test(attempt)||!/^\/workspace\/[a-z0-9._/-]+\.json$/.test(readyPath)||readyPath.includes('..'))throw Error('invalid_observer_scope');
 const r={stabilitySamples:[],at:new Date().toISOString(),attempt,requestId,readyPath,previousModified,route:'Agent-operated real SystemUI Share one app/Next/Olea Fixture; no silent grant',modelRequests:0,nativePhoneCalls:0};
 const ui=(id,action,...args)=>execFileSync(process.execPath,['spike/m5/runtime/prerequisite-ui.mjs',id,action,...args],{encoding:'utf8',timeout:15000,maxBuffer:300000});
 let dialog;
 for(let i=0;i<3;i++){const name=`${attempt}-dialog-${i}`;ui(name,'snapshot');const xml=readFileSync(`spike/m5/runtime/evidence/${name}-ui.xml`,'utf8');if(xml.includes('Share your screen with Olea M2 Runtime?')){dialog=name;break;}await new Promise(r=>setTimeout(r,200));}
 assert(dialog,'Actual capture consent dialog did not appear');
 const xml=readFileSync(`spike/m5/runtime/evidence/${dialog}-ui.xml`,'utf8');assert(xml.includes('Share one app'));
 ui(`${attempt}-next`,'tap',dialog,'Next');
 const picker=`${attempt}-picker`;ui(picker,'snapshot');assert(readFileSync(`spike/m5/runtime/evidence/${picker}-ui.xml`,'utf8').includes('Choose app to share'));
 ui(`${attempt}-select`,'tap',picker,'Olea Fixture');
 const deadline=Date.now()+6000;let modified;
 while(Date.now()<deadline){modified=Number(device(['shell','run-as dev.olea.m2.runtime stat -c %Y files/capture.png']).trim());if(modified>previousModified)break;await new Promise(r=>setTimeout(r,100));}
 assert(modified>previousModified,'Fresh capture file did not replace prior artifact');
 let bytes,sha,previousSha,stable=0;const imageDeadline=Date.now()+6000;
 while(Date.now()<imageDeadline){
  bytes=execFileSync('C:/Users/Aria/AppData/Local/Android/Sdk/platform-tools/adb.exe',['-s','emulator-5554','exec-out','run-as','dev.olea.m2.runtime','cat','files/capture.png'],{timeout:10000,maxBuffer:4000000});
  sha=createHash('sha256').update(bytes).digest('hex');
  const complete=bytes.subarray(-12).toString('hex')==='0000000049454e44ae426082';
  stable=complete&&sha===previousSha?stable+1:0;previousSha=sha; r.stabilitySamples.push({at:new Date().toISOString(),sha256:sha,bytes:bytes.length,complete,stable});
  writeFileSync(`spike/m5/runtime/evidence/${attempt}-stability-${r.stabilitySamples.length}.json`,JSON.stringify(r.stabilitySamples.at(-1))+'\n',{flag:'wx'});
  if(stable>=2)break;await new Promise(r=>setTimeout(r,150));
 }
 assert(stable>=2,'Complete PNG bytes did not stabilize');
 assert.equal(bytes.readUInt32BE(16),1080);assert.equal(bytes.readUInt32BE(20),2400);
 r.modified=modified;r.sha256=createHash('sha256').update(bytes).digest('hex');r.width=1080;r.height=2400;r.bytes=bytes.length;
 writeFileSync(`spike/m5/runtime/evidence/${attempt}.png`,bytes,{flag:'wx'});
 const marker={requestId,status:'ready',captureSha256:r.sha256,modified};
 const local=`.setup/${attempt}-ready.json`;writeFileSync(local,JSON.stringify(marker)+'\n',{flag:'wx'});
 device(['push',local,`/data/local/tmp/${attempt}-ready.json`]);
 device(['shell',`run-as dev.olea.m2.runtime sh -c 'set -euC; umask 077; cat /data/local/tmp/${attempt}-ready.json > files/rootfs${readyPath}'`]);
 r.dialog=dialog;r.picker=picker;r.readyMarker=marker;
 writeFileSync(`spike/m5/runtime/evidence/${attempt}.json`,JSON.stringify(r,null,2)+'\n',{flag:'wx'});return r;
}
