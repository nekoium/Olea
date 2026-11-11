// SPDX-License-Identifier: MIT
// Reconcile only; no prompt/phone call. Extra allocation failed after capture request.
import {Backend} from '../../backend/dist/backend.js';
import {readFile,writeFile} from 'node:fs/promises';
const root='/workspace/m3-pi-final-seven-02-state',session='m2_204a30734b03aa49c10ca0241a11175c';
const saved=JSON.parse(await readFile(root+'/'+session+'/resume.json','utf8')),before=await readFile(saved.sessionFile,'utf8');
const r={at:new Date().toISOString(),modelRequests:0,phoneCalls:0,session};
const env={PATH:process.env.PATH,HOME:process.env.HOME,OLEA_PROVIDER_CONFIG:'/run/olea-provider.json',OLEA_MODEL:'gpt-6.1-terra',OLEA_BRIDGE_CONFIG:'/run/olea-bridge.json',OLEA_PHONE_CALL_LIMIT:'7',OLEA_PHONE_TOOL_ALLOWLIST:'phone_capabilities,phone_capture_request,phone_capture_result,phone_files_write_read,phone_fixture_notify,phone_notifications,phone_open_url',OLEA_PHONE_READINESS:'/workspace/m3-extra-resume-readiness.json',OLEA_PHONE_CAPTURE_READY:'/workspace/m3-extra-resume-capture.json'};
const backend=new Backend({entry:'/opt/agents/pi/node_modules/@earendil-works/pi-coding-agent/dist/cli.js',workspace:'/workspace/m3-pi-final-seven-02',stateDir:root,env},()=>{});
try{r.start=await backend.start(session,true);const history=await backend.command(session,{type:'get_messages'});r.sameFile=r.start.state.sessionFile===saved.sessionFile;r.markerPresent=JSON.stringify(history.data).includes('204a30734b03aa49c10ca0241a11175c');r.captureRequestPresent=JSON.stringify(history.data).includes('phone_capture_request');if(!r.sameFile||!r.markerPresent||!r.captureRequestPresent)throw Error('reconciliation mismatch');r.status='pass';}catch(e){r.status='fail';r.error=e.message;}finally{await backend.close();r.originalTranscriptBytesUnchanged=before===await readFile(saved.sessionFile,'utf8');await writeFile('/workspace/m3-extra-resume-a01.json',JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify({status:r.status,error:r.error}));}
