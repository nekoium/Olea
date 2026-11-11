// SPDX-License-Identifier: MIT
// Read-only canonical session reconciliation after failed final turn; never sends prompt/phone action.
import {Backend} from '../../backend/dist/backend.js';
import {readFile,readdir,writeFile} from 'node:fs/promises';
const root='/workspace/m3-pi-final-seven-01-state';
const session='m2_9221203f0fe1b2c5c9b3eb570ca835e7';
const r={at:new Date().toISOString(),modelRequests:0,phoneActions:0,scope:'Resume/get_messages only after failed provider turn, no turn replay',session};
const before=JSON.parse(await readFile(root+'/'+session+'/resume.json','utf8'));const raw=await readFile(before.sessionFile,'utf8');
const env={PATH:process.env.PATH,HOME:process.env.HOME,OLEA_PROVIDER_CONFIG:'/run/olea-provider.json',OLEA_MODEL:'gpt-6.1-terra',OLEA_BRIDGE_CONFIG:'/run/olea-bridge.json',OLEA_PHONE_CALL_LIMIT:'7',OLEA_PHONE_TOOL_ALLOWLIST:'phone_capabilities,phone_capture_request,phone_capture_result,phone_files_write_read,phone_fixture_notify,phone_notifications,phone_open_url',OLEA_PHONE_READINESS:'/workspace/m3-final-failed-resume-readiness.json',OLEA_PHONE_CAPTURE_READY:'/workspace/m3-final-failed-resume-capture.json'};
const backend=new Backend({entry:'/opt/agents/pi/node_modules/@earendil-works/pi-coding-agent/dist/cli.js',workspace:'/workspace/m3-pi-final-seven-01',stateDir:root,env},()=>{});
try{
 r.start=await backend.start(session,true);r.sameSessionFile=r.start.state.sessionFile===before.sessionFile;
 const history=await backend.command(session,{type:'get_messages'});const messages=history.data?.messages??history.data??[];
 r.historyCount=Array.isArray(messages)?messages.length:null;r.originalAcceptanceMarkerPresent=JSON.stringify(messages).includes('9221203f0fe1b2c5c9b3eb570ca835e7');r.providerErrorPresent=JSON.stringify(messages).includes('error');r.noPromptSent=true;
 if(!r.sameSessionFile||!r.originalAcceptanceMarkerPresent)throw Error('canonical failed-session reconciliation mismatch');r.status='pass';
}catch(e){r.status='fail';r.error=e.message;}finally{await backend.close();r.originalTranscriptBytesUnchanged=raw===await readFile(before.sessionFile,'utf8');await writeFile('/workspace/m3-pi-final-failed-resume-a01.json',JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify({status:r.status,error:r.error,noPromptSent:true}));}
