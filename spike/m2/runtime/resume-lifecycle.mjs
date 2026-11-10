// Original MIT. No-model resume/state recovery on the proved canonical Pi session.
import { Backend } from '/opt/olea/spike/backend/dist/backend.js';
import { bounded } from '/opt/olea/spike/tests/m2/pi-single.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const attempt=process.argv[2];if(!/^[a-z0-9-]+$/.test(attempt))throw Error('invalid_attempt');
const report={attempt,modelRequests:0,startedAt:Date.now(),pid:process.pid,stat:readFileSync('/proc/self/stat','utf8'),status:'fail'};
const session='m2_8865356727f591733b3ad698173276cb';
const env={PATH:process.env.PATH,HOME:process.env.HOME,OLEA_PROVIDER_CONFIG:'/run/olea-provider.json',OLEA_MODEL:'gpt-6.1-terra',OLEA_BRIDGE_CONFIG:'/run/olea-bridge.json'};
const backend=new Backend({entry:'/opt/agents/pi-update/node_modules/@earendil-works/pi-coding-agent/dist/bundle/cli.js',workspace:'/workspace/pi-a01',stateDir:'/opt/olea/state/pi-a01',env},()=>{});
try{
 writeFileSync(`/workspace/${attempt}.started`,String(Date.now()));
 await new Promise(r=>setTimeout(r,6000));
 writeFileSync(`/workspace/${attempt}.completed`,String(Date.now()));
 const start=await bounded(backend.start(session,true),30000,'resume_deadline');
 const messages=await bounded(backend.command(session,{type:'get_messages'}),30000,'messages_deadline');
 assert(JSON.stringify(messages.data).includes('8865356727f591733b3ad698173276cb'));
 report.resume={pid:start.pid,startupMs:start.startupMs,sessionId:start.state.sessionId,sessionFile:start.state.sessionFile,historyMarker:true};
 report.status='pass';
}catch(e){report.error=e.message.slice(0,1000);}finally{await backend.close();report.endedAt=Date.now();writeFileSync(`/workspace/${attempt}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report));}
if(report.status!=='pass')process.exitCode=1;
