// Original MIT. Ordinary disposable-prefix Pi update; same proved workspace/account/session, no model request.
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { Backend } from '/opt/olea/spike/backend/dist/backend.js';
import { bounded } from '/opt/olea/spike/tests/m2/pi-single.mjs';
import { collectResources } from '/opt/olea/spike/tests/m2/resources.mjs';
import { parseStat } from '/opt/olea/spike/tests/m2/assertions.mjs';
const workspace='/workspace/pi-a01', stateDir='/opt/olea/state/pi-a01', session='m2_8865356727f591733b3ad698173276cb';
const prefix='/opt/agents/pi-update', packageDir=prefix+'/node_modules/@earendil-works/pi-coding-agent';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
function snapshot(){const files={};function walk(dir){for(const e of readdirSync(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory())walk(p);else if(e.isFile())files[p]=hash(readFileSync(p));}}walk(workspace);walk(stateDir);return files;}
function unchanged(before,after){return Object.keys(before).every(p=>after[p]===before[p]);}
const credentialHash=hash(readFileSync('/run/olea-provider.json'));
const report={attempt:'pi-update-a01',modelRequests:0,startedAt:Date.now(),steps:[],status:'fail',originalPrimaryPrefixUntouched:'/opt/agents/pi',canonicalWorkspace:workspace,canonicalStateDir:stateDir,session};
const original=snapshot();
async function resume(resources=false){
 const p=JSON.parse(readFileSync(packageDir+'/package.json'));const entry=resolve(packageDir,typeof p.bin==='string'?p.bin:p.bin.pi);
 const env={PATH:process.env.PATH,HOME:process.env.HOME,OLEA_PROVIDER_CONFIG:'/run/olea-provider.json',OLEA_MODEL:'gpt-6.1-terra',OLEA_BRIDGE_CONFIG:'/run/olea-bridge.json'};
 const backend=new Backend({entry,workspace,stateDir,env},()=>{});
 try{
  const start=await bounded(backend.start(session,true),30000,'resume_deadline');
  const history=await bounded(backend.command(session,{type:'get_messages'}),30000,'history_deadline');
  assert(JSON.stringify(history.data).includes('8865356727f591733b3ad698173276cb'));
  if(resources){
   const prootPid=process.ppid,hostPid=parseStat(readFileSync(`/proc/${prootPid}/stat`,'utf8')).ppid;
   const one=[hostPid,prootPid,process.pid,start.pid];
   const sampleOne=await collectResources(one,{samples:3,intervalMs:500,context:'android-app'});
   writeFileSync('/workspace/pi-update-one-resources-a01.json',JSON.stringify(sampleOne,null,2));
   const second=await bounded(backend.start('m2_resource_a01'),30000,'second_start_deadline');
   const sampleTwo=await collectResources([...one,second.pid],{samples:3,intervalMs:500,context:'android-app'});
   writeFileSync('/workspace/pi-update-two-resources-a01.json',JSON.stringify(sampleTwo,null,2));
   await bounded(backend.stop('m2_resource_a01'),10000,'second_stop_deadline');
   report.resourceArtifacts={one:'/workspace/pi-update-one-resources-a01.json',two:'/workspace/pi-update-two-resources-a01.json',pids:[...one,second.pid],scope:'Three500ms samples of idle stock persistent RPC sessions, not concurrent model workloads/peak/battery'};
  }
  return{version:p.version,entrySha256:hash(readFileSync(entry)),pid:start.pid,startupMs:start.startupMs,sessionFile:start.state.sessionFile,sessionId:start.state.sessionId,provedHistoryMarker:true};
 }
 finally{await bounded(backend.close(),10000,'close_deadline');}
}
try{
 report.steps.push({name:'before-update-resume',...await resume()});
 const before=snapshot();report.originalFilesPreservedAfterEarlierReleaseResume=unchanged(original,before);assert(report.originalFilesPreservedAfterEarlierReleaseResume);
 const update=spawnSync('npm',['install','--prefix',prefix,'--cache','/root/.npm-m2','--fetch-retries=0','--fetch-timeout=45000','--maxsockets=2','--no-audit','--no-fund','@earendil-works/pi-coding-agent@1.5.2'],{encoding:'utf8',timeout:150000,maxBuffer:65536});
 report.steps.push({name:'ordinary-npm-update',exitCode:update.status,signal:update.signal,outputBytes:Buffer.byteLength((update.stdout||'')+(update.stderr||'')),diagnosis:update.status===0?null:/ECONNRESET|ETIMEDOUT|network/i.test(update.stderr||'')?'network':'install_failure'});
 const afterInstall=snapshot();report.previousFileHashes=before;report.allPreviousHashesPreservedAfterInstall=unchanged(before,afterInstall);assert(report.allPreviousHashesPreservedAfterInstall);assert.equal(update.status,0);
 report.steps.push({name:'after-update-resume',...await resume(true)});
 const after=snapshot();report.allPreviousHashesPreservedAfterResume=unchanged(before,after);assert(report.allPreviousHashesPreservedAfterResume);
 const dependency=spawnSync(process.execPath,['-e','const n=require("is-number");if(!n("42")||n("olea"))process.exit(1)'],{cwd:workspace,encoding:'utf8',timeout:10000});assert.equal(dependency.status,0);report.installedWorkspaceDependencyStillWorks=true;
 report.protectedCredentialBytesPreserved=hash(readFileSync('/run/olea-provider.json'))===credentialHash;report.protectedCredentialMode=(statSync('/run/olea-provider.json').mode&0o777).toString(8);assert(report.protectedCredentialBytesPreserved);assert.equal(report.protectedCredentialMode,'600');
 assert.equal(JSON.parse(readFileSync(packageDir+'/package.json')).version,'1.5.2');report.status='pass';
}catch(error){report.error=error.message?.replace(/https?:\/\/\S+/g,'[url]').slice(0,1500)||'update_assertion_failed';report.originalFilesPreservedAtFailure=unchanged(original,snapshot());report.protectedCredentialBytesPreserved=hash(readFileSync('/run/olea-provider.json'))===credentialHash;}
finally{report.endedAt=Date.now();writeFileSync('/workspace/pi-update-a01.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));}
if(report.status!=='pass')process.exitCode=1;
