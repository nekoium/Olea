// SPDX-License-Identifier: MIT
// Start before the explicitly allocated final Pi turn. Watches only its public request marker.
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {device} from '../../m2/runtime/bridge.mjs';
import {completeCaptureConsent} from './complete-capture-consent.mjs';
const [attempt,readyPath]=process.argv.slice(2);
if(!/^[a-z0-9-]+$/.test(attempt??'')||!/^\/workspace\/[a-z0-9._/-]+\.json$/.test(readyPath??'')||readyPath.includes('..'))throw Error('explicit_public_observer_scope_required');
const r={attempt,readyPath,startedAt:new Date().toISOString(),modelRequests:0,nativePhoneCalls:0};
try{
 const pending=device(['shell',`run-as dev.olea.m2.runtime sh -c 'if [ -e files/rootfs${readyPath}.request.json ]; then echo EXISTS; fi'`]).trim();assert.equal(pending,'','Refuse a preexisting request; no uncertain replay');
 const previousModified=Number(device(['shell','run-as dev.olea.m2.runtime stat -c %Y files/capture.png']).trim());
 writeFileSync(`spike/m5/runtime/evidence/${attempt}-observer-started.json`,JSON.stringify({readyPath,previousModified,startedAt:r.startedAt})+'\n',{flag:'wx'});
 const deadline=Date.now()+125000;let request;
 while(Date.now()<deadline){const present=device(['shell',`run-as dev.olea.m2.runtime sh -c 'if [ -f files/rootfs${readyPath}.request.json ]; then echo PRESENT; fi'`]).trim();if(present==='PRESENT'){request=JSON.parse(device(['exec-out','run-as','dev.olea.m2.runtime','cat',`files/rootfs${readyPath}.request.json`]));break;}await new Promise(r=>setTimeout(r,200));}
 assert(typeof request?.requestId==='string','No fresh capture request within finite observer deadline');
 r.result=await completeCaptureConsent({attempt:attempt+'-consent',requestId:request.requestId,readyPath,previousModified});r.status='pass';
}catch(e){r.status='fail';r.error=e.message;}
writeFileSync(`spike/m5/runtime/evidence/${attempt}-observer.json`,JSON.stringify(r,null,2)+'\n',{flag:'wx'});console.log({status:r.status,error:r.error});
