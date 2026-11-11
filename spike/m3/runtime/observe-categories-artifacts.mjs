// SPDX-License-Identifier: MIT
// Finite artifact observation only; never resubmits a provider turn or native probe.
import {device} from '../../m2/runtime/bridge.mjs';
import {writeFileSync} from 'node:fs';
const agent=process.argv[2] ?? 'codex';
if(!['pi','codex'].includes(agent))throw Error('invalid_agent');
const deadline=Date.now()+225000;
let modelSaved=false,nativeSaved=false;
while(Date.now()<deadline&&!(modelSaved&&nativeSaved)){
 for(const [source,target,type] of [['files/rootfs/workspace/m3-'+agent+'-location-notification-01.json','spike/m3/runtime/evidence/'+agent+'-location-notification-a01.json','model'],['files/m2/m3-'+agent+'-location-notification-a01.json','spike/m3/runtime/evidence/'+agent+'-location-notification-a01-native.json','native']]){
  if(type==='model'&&modelSaved||type==='native'&&nativeSaved)continue;
  try{const present=device(['shell',`run-as dev.olea.m2.runtime sh -c 'if [ -f ${source} ]; then echo PRESENT; fi'`]).trim();if(present!=='PRESENT')continue;const text=device(['exec-out','run-as','dev.olea.m2.runtime','cat',source]);const parsed=JSON.parse(text);writeFileSync(target,text,{flag:'wx'});if(type==='model')modelSaved=true;else nativeSaved=true;}catch{}
 }
 if(!(modelSaved&&nativeSaved))await new Promise(r=>setTimeout(r,2000));
}
writeFileSync(`spike/m3/runtime/evidence/${agent}-artifact-observer-a01.json`,JSON.stringify({at:new Date().toISOString(),modelSaved,nativeSaved,replays:0},null,2)+'\n',{flag:'wx'});
