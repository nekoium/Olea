// SPDX-License-Identifier: MIT
// Bounded observation of this one submitted turn; never resubmits it.
import {device} from '../../m2/runtime/bridge.mjs';
import {writeFileSync} from 'node:fs';
const extra=process.argv[2]==='extra';
const modelPath=extra?'files/rootfs/workspace/m3-pi-final-seven-02.json':'files/rootfs/workspace/m3-pi-final-seven-01.json';
const stem=extra?'extra-pi-a01':'pi-final-seven-a01';
const outputs=[[modelPath,`spike/m3/runtime/evidence/${stem}.json`],[extra?'files/m2/m3-extra-pi-a01.json':'files/m2/m3-pi-final-seven-a01.json',`spike/m3/runtime/evidence/${stem}-native.json`]];
const saved=new Set();const deadline=Date.now()+220000;
while(Date.now()<deadline&&saved.size<outputs.length){for(const [src,dst]of outputs){if(saved.has(dst))continue;try{const exists=device(['shell',`run-as dev.olea.m2.runtime sh -c 'if [ -f ${src} ]; then echo PRESENT; fi'`]).trim();if(exists!=='PRESENT')continue;const text=device(['exec-out','run-as','dev.olea.m2.runtime','cat',src]);JSON.parse(text);writeFileSync(dst,text,{flag:'wx'});saved.add(dst);}catch{}}if(saved.size<outputs.length)await new Promise(r=>setTimeout(r,1500));}
writeFileSync(`spike/m3/runtime/evidence/${stem}-artifact-observer.json`,JSON.stringify({at:new Date().toISOString(),saved:[...saved],replays:0},null,2)+'\n',{flag:'wx'});
