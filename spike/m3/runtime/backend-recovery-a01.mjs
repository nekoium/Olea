// SPDX-License-Identifier: MIT
// Actual shared native/backend lifecycle. No model inference; ADB provisions/measures only.
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {device,bridge} from '../../m2/runtime/bridge.mjs';
const attempt=process.argv[2] ?? 'backend-recovery-a02';
const report={attempt,startedAt:Date.now(),modelRequests:0,operations:[],cases:[]};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const shell=s=>device(['shell',s]);
async function native(path,body){const config=JSON.parse(device(['exec-out','run-as','dev.olea.m2.runtime','cat','files/bridge-config.json']));const r=await fetch(`http://127.0.0.1:8768${path}`,{method:body?'POST':'GET',headers:{Authorization:`Bearer ${config.token}`,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(7000)});const value=await r.json();report.operations.push({at:Date.now(),path,body,response:value});return value;}
const protectedSnapshot=()=>shell("run-as dev.olea.m2.runtime sh -c 'sha256sum files/rootfs/run/olea-provider.json files/bridge-token files/bridge-config.json'");
const history=()=>shell("run-as dev.olea.m2.runtime sh -c 'find files/rootfs/opt/olea/evidence -type f \\( -name \"*.jsonl\" -o -name combined-value.txt -o -name config.toml \\) -exec sha256sum {} \\;; sha256sum files/rootfs/workspace/sentinel'");
async function command(id,body,timeout=10000){const r=await native('/backend',{id,...body});assert.equal(r.ok,true);const end=Date.now()+timeout;while(Date.now()<end){await wait(200);const e=await native('/events');const result=e.result?.events?.map(line=>{try{return JSON.parse(line)}catch{return {}}}).find(x=>x.type==='response'&&x.id===id);if(result)return result;}throw new Error(`RESPONSE_NOT_OBSERVED_${id}`);}
async function startFromHost(){const tree=await bridge('accessibility_tree');assert.equal(tree.body.ok,true);const node=tree.body.result.nodes.find(n=>n.text?.toLowerCase()==='start shared backend');assert(node,'Native backend button absent');const r=await bridge('accessibility_click',{nodeId:node.nodeId});assert.equal(r.body.ok,true);await wait(1000);return native('/health');}
try {
 const beforeProtected=protectedSnapshot();const beforeHistory=history();report.historyBefore=beforeHistory;
 report.provisioning={scope:'Explicit host launch; existing development enable state required',flagAbsent:shell("run-as dev.olea.m2.runtime sh -c 'test ! -e files/enable-phone-once && echo ABSENT'"),launch:shell('am start -f 0x18000000 -n dev.olea.m2.runtime/dev.olea.spike.MainActivity')};
 assert.equal((await native('/health')).result.phoneEnabled,true);
 await wait(500);
 report.started=await startFromHost();assert.equal(report.started.result.backendRunning,true);
 report.ready=await native('/events');
 report.piStart=await command('m3-pi-start',{type:'start',session:'m3_deterministic'},30000);assert.equal(report.piStart.success,true,JSON.stringify(report.piStart));
 report.piState=await command('m3-pi-state',{type:'command',session:'m3_deterministic',command:{type:'get_state'}});assert.equal(report.piState.success,true);
 report.bashDelivery=await native('/backend',{id:'m3-pi-bash',type:'command',session:'m3_deterministic',command:{type:'bash',command:'sleep 20; printf UNEXPECTED > /workspace/m3-backend/late-effect-a01'}});assert.equal(report.bashDelivery.ok,true);
 await wait(600);
 report.abortAt=Date.now();report.abort=await command('m3-pi-abort',{type:'command',session:'m3_deterministic',command:{type:'abort_bash'}});assert.equal(report.abort.success,true);
 report.nativeStopAt=Date.now();report.nativeStop=await bridge('stop');assert.equal(report.nativeStop.body.ok,true);
 await wait(1800);
 report.stopped=await native('/health');assert.equal(report.stopped.result.backendRunning,false);assert.equal(report.stopped.result.backendStopping,false);assert.equal(report.stopped.result.backendCleanup.trackedExitVerified,true);
 report.identities=report.stopped.result.backendCleanup.owned.map(identity=>({identity,observation:shell(`if [ -d /proc/${identity.pid} ]; then cat /proc/${identity.pid}/stat; else echo ABSENT; fi`).trim()}));assert(report.identities.every(x=>x.observation==='ABSENT'));
 report.historyAfterStop=history();assert.equal(report.historyAfterStop,beforeHistory);
 const beforeRestartAudit=shell('run-as dev.olea.m2.runtime sha256sum files/phone-audit.jsonl');
 const beforeRestartOracle=shell('run-as dev.olea.m2.fixture sha256sum files/oracle-value.txt');
 report.forceStop={at:Date.now(),result:shell('am force-stop dev.olea.m2.runtime')};
 report.explicitRestart={at:Date.now(),result:shell('am start -f 0x18000000 -n dev.olea.m2.runtime/dev.olea.spike.MainActivity')};
 await wait(700);
 report.recovered=await native('/health');assert.equal(report.recovered.result.phoneEnabled,false);assert.equal(report.recovered.result.backendRunning,false);
 report.noReplay={auditUnchanged:shell('run-as dev.olea.m2.runtime sha256sum files/phone-audit.jsonl')===beforeRestartAudit,oracleUnchanged:shell('run-as dev.olea.m2.fixture sha256sum files/oracle-value.txt')===beforeRestartOracle};assert(report.noReplay.auditUnchanged&&report.noReplay.oracleUnchanged);
 report.historyAfterRestart=history();assert.equal(report.historyAfterRestart,beforeHistory);
 report.protectedPreserved=protectedSnapshot()===beforeProtected;assert(report.protectedPreserved);
 report.protectedModes=shell("run-as dev.olea.m2.runtime stat -c '%a %n' files/rootfs/run/olea-provider.json files/bridge-token files/bridge-config.json");assert(report.protectedModes.trim().split('\n').every(l=>l.startsWith('600 ')));
 report.lateEffect=shell("run-as dev.olea.m2.runtime sh -c 'test ! -e files/rootfs/workspace/m3-backend/late-effect-a01 && test ! -e files/rootfs/workspace/m3-native-cancel-a01/late-effect && echo ABSENT'").trim();assert.equal(report.lateEffect,'ABSENT');
 report.status='pass';
} catch(e){report.status='fail';report.error=e.message;}
finally{report.endedAt=Date.now();writeFileSync(`spike/m3/runtime/evidence/${attempt}.json`,JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log({status:report.status,error:report.error,stopped:report.stopped,recovered:report.recovered});}
