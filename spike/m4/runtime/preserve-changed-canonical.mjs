// SPDX-License-Identifier: MIT
// Preserve changed canonical bytes before read-only SQLite diagnosis. No agent launch.
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {device} from '../../m2/runtime/bridge.mjs';
const read=p=>device(['exec-out','run-as','dev.olea.m2.runtime','cat',p]);
const original='files/rootfs/opt/olea/evidence/attempt-1794337061452-dffc52fe/state/codex/case/home';
const copied='files/rootfs/workspace/m4-update-a01/protocol-home';
const suffix='/sessions/2026/11/10/rollout-2026-11-10T18-57-42-01a1c6d2-bf9b-7670-a6c0-49be86a0f916.jsonl';
const secretConfig=JSON.parse(read('files/rootfs/run/olea-provider.json')),bridgeConfig=JSON.parse(read('files/bridge-config.json'));
const r={at:new Date().toISOString(),modelRequests:0,agentLaunches:0,transcripts:[]};
mkdirSync('.setup/canonical-diagnosis',{recursive:true});
for(const [name,home]of[['original-changed',original],['copied-unchanged',copied]]){
 const text=read(home+suffix);assert(![secretConfig.apiKey,bridgeConfig.token].filter(Boolean).some(s=>text.includes(s)),'PROTECTED_VALUE_IN_EXPORT');
 const out=`spike/m4/runtime/evidence/${name}-rollout.jsonl`;writeFileSync(out,text,{flag:'wx'});
 const rows=text.trim().split('\n').map(JSON.parse);r.transcripts.push({name,path:home+suffix,export:out,bytes:Buffer.byteLength(text),sha256:createHash('sha256').update(text).digest('hex'),stat:device(['shell',`run-as dev.olea.m2.runtime stat -c '%s %Y %n' ${home+suffix}`]).trim(),rows:rows.map(x=>({timestamp:x.timestamp,type:x.type,payloadType:x.payload?.type,threadId:x.payload?.id,cwd:x.payload?.cwd,source:x.payload?.source,cliVersion:x.payload?.cli_version}))});
 const listing=device(['shell',`run-as dev.olea.m2.runtime sh -c 'find ${home} -maxdepth 1 -type f -name "*.sqlite*"'`]).trim().split(/\r?\n/).filter(Boolean);
 r[name+'Databases']=listing;
 for(const path of listing){const filename=path.split('/').pop();const bytes=execFileSync('C:/Users/Aria/AppData/Local/Android/Sdk/platform-tools/adb.exe',['-s','emulator-5554','exec-out','run-as','dev.olea.m2.runtime','cat',path],{timeout:15000,maxBuffer:32*1024*1024,env:{...process.env,MSYS_NO_PATHCONV:'1'}});writeFileSync(`.setup/canonical-diagnosis/${name}-${filename}`,bytes,{flag:'wx'});}
}
writeFileSync('spike/m4/runtime/evidence/canonical-change-a01.json',JSON.stringify(r,null,2)+'\n',{flag:'wx'});console.log(r.transcripts.map(x=>({name:x.name,hash:x.sha256,rows:x.rows.length,tail:x.rows.slice(-4)})));
