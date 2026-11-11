// SPDX-License-Identifier: MIT
// Requires recorded native-enable/Accessibility setup; direct consent artifacts must be preserved first.
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {device,bridge,nativeRequest} from '../../m2/runtime/bridge.mjs';
const attempt=process.argv[2];if(!/^[a-z0-9-]{1,64}$/.test(attempt??''))throw Error('unique_attempt_required');
const report={attempt,startedAt:Date.now(),modelRequests:0,events:[]};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const shell=s=>device(['shell',s]);
const publicState=()=>shell("run-as dev.olea.m2.runtime sh -c 'find files/rootfs/opt/olea/evidence -type f \\( -name \"*.jsonl\" -o -name combined-value.txt -o -name config.toml \\) -exec sha256sum {} \\;; sha256sum files/rootfs/workspace/sentinel'");
const protectedSnapshot=()=>shell("run-as dev.olea.m2.runtime sh -c 'sha256sum files/rootfs/run/olea-provider.json files/bridge-token files/bridge-config.json'");
function identities(){
 const inventory=shell('ps -A -o UID,PID,PPID,NAME').split('\n').filter(l=>/^\s*10216\s/.test(l));
 return inventory.map(line=>{const fields=line.trim().split(/\s+/);const pid=Number(fields[1]);const stat=shell(`run-as dev.olea.m2.runtime cat /proc/${pid}/stat`).trim();const rest=stat.slice(stat.lastIndexOf(')')+2).split(/\s+/);return {pid,uid:10216,parent:Number(rest[1]),start:rest[19],name:fields[3],stat};});
}
async function events(){const r=await nativeRequest('/events');const e=r.body.result?.events?.map(line=>{try{return JSON.parse(line)}catch{return {}}})??[];report.events.push(...e);return e;}
async function command(id,body,timeout=15000){const r=await nativeRequest('/backend',{id,...body});assert.equal(r.body.ok,true);const end=Date.now()+timeout;while(Date.now()<end){for(const e of await events())if(e.id===id&&e.type==='response')return e;await wait(100);}throw Error(`DELIVERY_UNKNOWN_${id}`);}
async function startBackend(){shell('am start -f 0x18000000 -n dev.olea.m2.runtime/dev.olea.spike.MainActivity');await wait(300);const tree=await bridge('accessibility_tree');assert.equal(tree.body.ok,true);const button=tree.body.result.nodes.find(n=>n.text?.toLowerCase()==='start shared backend');assert(button);assert.equal((await bridge('accessibility_click',{nodeId:button.nodeId})).body.ok,true);await wait(800);assert.equal((await nativeRequest('/capabilities')).body.result.backendRunning,true);await events();}
try {
 const caps=await nativeRequest('/capabilities');assert(caps.body.result.phoneEnabled&&caps.body.result.accessibility);assert.equal(caps.body.result.backendRunning,false);
 const before=publicState();report.publicStateBefore=before;
 const beforeProtected=protectedSnapshot();report.hostsBefore=identities();
 const oracle=shell('run-as dev.olea.m2.fixture sha256sum files/oracle-value.txt');
 await startBackend();
 const start=await command('active-start',{type:'start',session:attempt.replace(/-/g,'_')},30000);assert.equal(start.success,true);report.agentPid=start.data.pid;
 const ready=report.events.find(e=>e.type==='ready');assert(Number.isInteger(ready?.pid)&&ready.pid>0);
 const rootPid=ready.pid;const initial=shell(`run-as dev.olea.m2.runtime cat /proc/${rootPid}/stat`).trim();
 const startTicks=initial.slice(initial.lastIndexOf(')')+2).split(/\s+/)[19];
 report.backendIdentity={pid:rootPid,startTicks,stat:initial};
 report.workDelivery=await nativeRequest('/backend',{id:'active-work',type:'command',session:attempt.replace(/-/g,'_'),command:{type:'bash',command:`printf STARTED > /workspace/m3-backend/${attempt}-started; sleep 20; printf UNEXPECTED > /workspace/m3-backend/${attempt}-late-effect`}});assert.equal(report.workDelivery.body.ok,true);
 const markerDeadline=Date.now()+4000;let marker;
 while(Date.now()<markerDeadline){marker=shell(`run-as dev.olea.m2.runtime sh -c 'if [ -f files/rootfs/workspace/m3-backend/${attempt}-started ]; then cat files/rootfs/workspace/m3-backend/${attempt}-started; fi'`);if(marker==='STARTED')break;await wait(100);}
 report.startedMarker=marker;assert.equal(marker,'STARTED');
 report.identitiesBeforeInterruption=identities(); // Positive PID only, with fresh UID/stat identity checks in the same development measurement shell.
 report.killAt=Date.now();
 report.kill=shell(`run-as dev.olea.m2.runtime sh -c 'set -eu; test "$(stat -c %u /proc/${rootPid})" = "$(id -u)"; current=$(cat /proc/${rootPid}/stat); current=\${current##*) }; set -- $current; shift 19; test "$1" = "${startTicks}"; kill -9 ${rootPid}'`);
 await wait(1000);
 report.afterBackendDeath=await nativeRequest('/capabilities');
 // Unknown in-flight work is never replayed. Whole-app interruption settles any same-UID survivors.
 report.appStop=shell('am force-stop dev.olea.m2.runtime');report.appRestart=shell('am start -f 0x18000000 -n dev.olea.m2.runtime/dev.olea.spike.MainActivity');await wait(600);
 report.recovered=await nativeRequest('/capabilities');assert.equal(report.recovered.body.result.phoneEnabled,false);assert.equal(report.recovered.body.result.backendRunning,false);
 report.publicStateAfter=publicState();assert.equal(report.publicStateAfter,before);
 report.oracleUnchanged=shell('run-as dev.olea.m2.fixture sha256sum files/oracle-value.txt')===oracle;assert(report.oracleUnchanged);
 await wait(20000);
 report.lateEffect=shell(`run-as dev.olea.m2.runtime sh -c 'test ! -e files/rootfs/workspace/m3-backend/${attempt}-late-effect && echo ABSENT'`).trim();assert.equal(report.lateEffect,'ABSENT');
 report.protectedPreserved=protectedSnapshot()===beforeProtected;assert(report.protectedPreserved);
 report.independentAfter=report.identitiesBeforeInterruption.map(identity=>({identity,observation:shell(`if [ -d /proc/${identity.pid} ]; then cat /proc/${identity.pid}/stat; else echo ABSENT; fi`).trim()}));
 assert(report.independentAfter.every(x=>x.observation==='ABSENT'));
 report.finalUidInventory=identities();
 report.status='pass';report.limit='Active backend death followed by whole-app interruption and explicit disabled restart. Delivery before interruption remains unknown; no implicit agent resume or replay claimed.';
} catch(e){report.status='fail';report.error=e.message;}
finally{report.endedAt=Date.now();writeFileSync(`spike/m3/runtime/evidence/${attempt}.json`,JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log({status:report.status,error:report.error});}
