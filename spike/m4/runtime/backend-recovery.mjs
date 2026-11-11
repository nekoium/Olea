// SPDX-License-Identifier: MIT
// Actual backend-only interruption: no app force-stop; exact owned root only.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {device,bridge,nativeRequest} from '../../m2/runtime/bridge.mjs';
const attempt=process.argv[2];assert(/^m4-backend-[a-z0-9-]+$/.test(attempt));
const r={attempt,at:new Date().toISOString(),modelRequests:0,events:[],ui:[],failures:[]};
const wait=ms=>new Promise(r=>setTimeout(r,ms)),shell=s=>device(['shell',s]);
const secretPaths=['files/rootfs/run/olea-provider.json','files/bridge-token','files/bridge-config.json'];
const protectedBefore=secretPaths.map(p=>device(['exec-out','run-as','dev.olea.m2.runtime','cat',p]));
const baseline=JSON.parse(readFileSync('spike/m4/runtime/evidence/baseline-a01.json'));
const host=()=>shell('pidof dev.olea.m2.runtime').trim();
function identity(pid){const stat=shell(`run-as dev.olea.m2.runtime cat /proc/${pid}/stat`).trim();const f=stat.slice(stat.lastIndexOf(')')+2).split(/\s+/);return{pid,parent:Number(f[1]),start:f[19],uid:10216,stat};}
function identities(){return shell('ps -A -o UID,PID,PPID,NAME').split('\n').filter(l=>/^\s*10216\s/.test(l)).map(l=>identity(Number(l.trim().split(/\s+/)[1])));}
async function tap(text){shell(`uiautomator dump /data/local/tmp/${attempt}.xml`);const xml=device(['exec-out','cat',`/data/local/tmp/${attempt}.xml`]);const nodes=(xml.match(/<node\b[^>]*>/g)??[]).filter(n=>n.toLowerCase().includes(`text="${text.toLowerCase()}"`));assert.equal(nodes.length,1);const b=nodes[0].match(/bounds="\[(\d+),(\d+)\]\[(\d+),(\d+)\]"/);assert(b);const x=Math.floor((+b[1]+ +b[3])/2),y=Math.floor((+b[2]+ +b[4])/2);r.ui.push({at:Date.now(),text,x,y,route:'Authorized development UI input on existing native host'});device(['shell','input','tap',String(x),String(y)]);await wait(300);}
async function events(){const result=await nativeRequest('/events');const e=result.body.result.events.map(JSON.parse);r.events.push(...e);return e;}
async function command(id,body,timeout=15000){assert.equal((await nativeRequest('/backend',{id,...body})).body.ok,true);const end=Date.now()+timeout;while(Date.now()<end){for(const e of await events())if(e.id===id&&e.type==='response')return e;await wait(100);}throw Error('DELIVERY_UNKNOWN_'+id);}
try{
 r.hostBefore=identity(Number(host()));r.capabilitiesBefore=await nativeRequest('/capabilities');assert.equal(r.capabilitiesBefore.body.result.backendRunning,false);
 r.fixtureBefore=shell('run-as dev.olea.m2.fixture sha256sum files/oracle-value.txt files/observed-launches.txt');
 shell('am start -f 0x18000000 -n dev.olea.m2.runtime/dev.olea.spike.MainActivity');
 await tap('Start bridge / enable phone actions');await events();await tap('Start shared backend');
 const start=await command(attempt+'-start',{type:'start',session:attempt.replace(/-/g,'_')},30000);assert.equal(start.success,true);r.agentStart=start;
 const ready=r.events.find(e=>e.type==='ready');assert(ready?.pid);r.backendIdentity=identity(ready.pid);
 r.work=await nativeRequest('/backend',{id:attempt+'-work',type:'command',session:attempt.replace(/-/g,'_'),command:{type:'bash',command:`printf STARTED > /workspace/m3-backend/${attempt}-started; sleep 12; printf UNEXPECTED > /workspace/m3-backend/${attempt}-late-effect`}});assert.equal(r.work.body.ok,true);
 const end=Date.now()+5000;while(Date.now()<end){r.started=shell(`run-as dev.olea.m2.runtime sh -c 'if [ -f files/rootfs/workspace/m3-backend/${attempt}-started ]; then cat files/rootfs/workspace/m3-backend/${attempt}-started; fi'`).trim();if(r.started==='STARTED')break;await wait(100);}assert.equal(r.started,'STARTED');await wait(300);
 r.beforeInterruption=identities();const {pid,start:startTicks}=r.backendIdentity;r.interruptedAt=Date.now();
 r.kill=shell(`run-as dev.olea.m2.runtime sh -c 'set -eu; test "$(stat -c %u /proc/${pid})" = "$(id -u)"; current=$(cat /proc/${pid}/stat); current=\${current##*) }; set -- $current; shift 19; test "$1" = "${startTicks}"; kill -9 ${pid}'`);
 await wait(2000);r.afterDeath=await nativeRequest('/capabilities');
 r.automaticDisabled=r.afterDeath.body.result.phoneEnabled===false;r.automaticCleanup=r.afterDeath.body.result.backendCleanup?.trackedExitVerified===true;
 if(!r.automaticDisabled)r.failures.push('UNEXPECTED_BACKEND_DEATH_RETAINS_PHONE_AUTHORITY');
 if(!r.automaticCleanup)r.failures.push('UNEXPECTED_BACKEND_DEATH_HAS_NO_VERIFIED_TRACKED_CLEANUP');
 // Existing native STOP is explicit bounded recovery, never app death or action replay.
 r.explicitStop=await bridge('stop');const cleanupEnd=Date.now()+7000;
 while(Date.now()<cleanupEnd){r.afterStop=await nativeRequest('/capabilities');if(!r.afterStop.body.result.backendStopping)break;await wait(100);}
 r.cleanup=r.afterStop.body.result.backendCleanup;
 r.oldIdentities=r.beforeInterruption.filter(i=>i.pid!==r.hostBefore.pid).map(i=>({identity:i,observation:shell(`if [ -d /proc/${i.pid} ]; then run-as dev.olea.m2.runtime cat /proc/${i.pid}/stat; else echo ABSENT; fi`).trim()}));
 assert(r.oldIdentities.every(i=>i.observation==='ABSENT'));assert.equal(host(),String(r.hostBefore.pid));
 await tap('Start shared backend');const status=await command(attempt+'-status',{type:'status'});r.restart=status;assert.equal(status.success,true);r.afterRestart=await nativeRequest('/capabilities');assert.equal(r.afterRestart.body.result.phoneEnabled,false);
 await wait(Math.max(0,r.interruptedAt+14000-Date.now()));r.lateEffect=shell(`run-as dev.olea.m2.runtime sh -c 'test ! -e files/rootfs/workspace/m3-backend/${attempt}-late-effect && echo ABSENT'`).trim();assert.equal(r.lateEffect,'ABSENT');
 r.fixtureUnchanged=shell('run-as dev.olea.m2.fixture sha256sum files/oracle-value.txt files/observed-launches.txt')===r.fixtureBefore;assert(r.fixtureUnchanged);
 r.status=r.failures.length?'fail':'pass';
}catch(e){r.status='fail';r.error=e.message;}
finally{
 r.finalStop=await bridge('stop');const end=Date.now()+7000;while(Date.now()<end){r.finalCapabilities=await nativeRequest('/capabilities');if(!r.finalCapabilities.body.result.backendStopping)break;await wait(100);}
 r.hostAfter=identity(Number(host()));r.sameNativeHost=r.hostBefore?.start===r.hostAfter.start&&r.hostBefore?.pid===r.hostAfter.pid;
 r.protectedEqual=secretPaths.map((p,i)=>({path:p,equal:device(['exec-out','run-as','dev.olea.m2.runtime','cat',p])===protectedBefore[i]}));
 r.historical=baseline.historical.map(x=>({path:x.path,expected:x.expected,actual:shell(`run-as dev.olea.m2.runtime sha256sum ${x.path}`).trim().split(/\s+/)[0]}));r.historicalUnchanged=r.historical.every(x=>x.actual===x.expected);
 r.sessionHashesUnchanged=shell("run-as dev.olea.m2.runtime sh -c 'sha256sum files/rootfs/workspace/m3-pi-final-seven-02-state/m2_204a30734b03aa49c10ca0241a11175c/*'")===baseline.sessionHashes;
 r.finalInventory=identities();r.finishedAt=new Date().toISOString();r.limit='Finite exact PID/UID/start snapshots; no universal unseen-fork guarantee. No model turn or whole-app interruption.';
 if(!r.sameNativeHost||!r.protectedEqual.every(x=>x.equal)||!r.historicalUnchanged||!r.sessionHashesUnchanged)r.status='fail';
 writeFileSync(`spike/m4/runtime/evidence/${attempt}.json`,JSON.stringify(r,null,2)+'\n',{flag:'wx'});console.log({status:r.status,error:r.error,failures:r.failures,sameNativeHost:r.sameNativeHost,afterDeath:r.afterDeath?.body.result,final:r.finalCapabilities.body.result,inventory:r.finalInventory.map(i=>i.pid)});
}
