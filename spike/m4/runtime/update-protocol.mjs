// SPDX-License-Identifier: MIT
// Runs inside actual Android service Linux; no turn/start and no provider credentials.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,cpSync,readdirSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {CodexProcess} from '/opt/olea-m3-final-ready-a01/spike/backend/dist/codex-process.js';
import {codexConfig} from '/opt/olea-m3-final-ready-a01/spike/backend/dist/codex-session.js';
const root='/workspace/m4-update-a01';const prefix='/opt/agents/codex-m4-a01';
const oldHome='/opt/olea/evidence/attempt-1794337061452-dffc52fe/state/codex/case/home';
const oldWorkspace='/opt/olea/evidence/attempt-1794337061452-dffc52fe/workspace';
const protectedPaths=['/run/olea-provider.json','/run/olea-bridge.json'];
const protectedBefore=protectedPaths.map(p=>readFileSync(p));
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const files=[];function inventory(p){for(const n of readdirSync(p)){const f=p+'/'+n;if(statSync(f).isDirectory())inventory(f);else if(['package.json','codex','codex.js','rg','bwrap'].includes(n))files.push({path:f,bytes:statSync(f).size,sha256:hash(f)});}}
const r={at:new Date().toISOString(),modelRequests:0,phoneActions:0,policy:{sandbox:'danger-full-access',approvalPolicy:'never',filesystemIsolation:false},files,protocol:[],failures:[]};
let child;
try{
 const p=JSON.parse(readFileSync(prefix+'/node_modules/@openai/codex/package.json'));r.version=p.version;r.license=p.license;assert.equal(p.version,'0.167.1');
 const lock=JSON.parse(readFileSync(prefix+'/package-lock.json'));r.packages=Object.entries(lock.packages).filter(([k])=>k.includes('@openai/')).map(([path,v])=>({path,version:v.version,resolved:v.resolved,integrity:v.integrity}));inventory(prefix+'/node_modules/@openai');
 r.startup=spawnSync(process.execPath,[prefix+'/node_modules/@openai/codex/bin/codex.js','--version'],{encoding:'utf8',timeout:15000});r.startup={status:r.startup.status,stdout:r.startup.stdout,stderr:r.startup.stderr};assert.equal(r.startup.status,0);
 const home=root+'/protocol-home',workspace=root+'/workspace';cpSync(oldHome,home,{recursive:true,errorOnExist:true,force:false});cpSync(oldWorkspace,workspace,{recursive:true,errorOnExist:true,force:false});
 // Only disposable config is rewritten; historical home/session/workspace stay untouched.
 writeFileSync(home+'/config.toml',codexConfig('gpt-6.1-terra',undefined,'full-access'),{mode:0o600});
 const transcript=home+'/sessions/2026/11/10/rollout-2026-11-10T18-57-42-01a1c6d2-bf9b-7670-a6c0-49be86a0f916.jsonl';
 const transcriptBefore=hash(transcript);r.copiedCanonicalBefore=transcriptBefore;r.threadId='01a1c6d2-bf9b-7670-a6c0-49be86a0f916';
 const env={PATH:process.env.PATH,HOME:root+'/install-home',CODEX_HOME:home,LANG:'C.UTF-8'};
 async function launch(){child=new CodexProcess({command:process.execPath,args:[prefix+'/node_modules/@openai/codex/bin/codex.js'],cwd:workspace,env});child.on('fault',code=>r.failures.push(code));const initialized=await child.initialize();r.protocol.push({method:'initialize',result:initialized});}
 await launch();
 const resumed=await child.request('thread/resume',{threadId:r.threadId,cwd:workspace,model:'gpt-6.1-terra',modelProvider:'olea',sandbox:'danger-full-access',approvalPolicy:'never'});assert.equal(resumed.thread.id,r.threadId);r.protocol.push({method:'thread/resume',sameThread:true,turns:resumed.thread.turns?.length??null});
 const history=await child.request('thread/read',{threadId:r.threadId,includeTurns:true});assert.equal(history.thread.id,r.threadId);assert(history.thread.turns.length>0);r.protocol.push({method:'thread/read',sameThread:true,turns:history.thread.turns.length});
 const result=await child.request('command/exec',{command:[process.execPath,'-e','require("fs").writeFileSync("updated-tool.txt","M4_UPDATE_TOOL_OK");process.stdout.write("OK")'],cwd:workspace,timeoutMs:10000,outputBytesCap:4096,sandboxPolicy:{type:'dangerFullAccess'}},15000);assert.equal(result.exitCode,0);assert.equal(readFileSync(workspace+'/updated-tool.txt','utf8'),'M4_UPDATE_TOOL_OK');r.protocol.push({method:'command/exec',exitCode:result.exitCode,independentExact:true});
 r.firstStop=await child.stop();child=undefined;
 await launch();const again=await child.request('thread/resume',{threadId:r.threadId,cwd:workspace,model:'gpt-6.1-terra',modelProvider:'olea',sandbox:'danger-full-access',approvalPolicy:'never'});assert.equal(again.thread.id,r.threadId);r.protocol.push({method:'thread/resume',afterRestart:true,sameThread:true});
 r.copiedTranscriptAfter=hash(transcript);r.copiedTranscriptUnchanged=r.copiedTranscriptAfter===transcriptBefore;assert(r.copiedTranscriptUnchanged);
 r.originalWorkspaceValueUnchanged=hash(oldWorkspace+'/combined-value.txt')===hash(workspace+'/combined-value.txt');assert(r.originalWorkspaceValueUnchanged);
 r.status='pass';
}catch(e){r.status='fail';r.error=e.message;}
finally{if(child)r.finalStop=await child.stop();r.protectedEqual=protectedPaths.map((p,i)=>({path:p,equal:readFileSync(p).equals(protectedBefore[i])}));if(!r.protectedEqual.every(x=>x.equal))r.status='fail';writeFileSync(root+'/protocol.json',JSON.stringify(r,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({status:r.status,error:r.error,version:r.version,protocol:r.protocol,protectedEqual:r.protectedEqual}));}
if(r.status!=='pass')process.exitCode=1;
