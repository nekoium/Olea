// SPDX-License-Identifier: MIT
// Collect exact instrumentation receipts and independently inspect each recorded identity.
import {readFileSync,writeFileSync} from 'node:fs';
import {device} from '../../m2/runtime/bridge.mjs';
const attempt=process.argv[2];if(!/^[a-z0-9-]{1,64}$/.test(attempt??''))throw Error('unique_attempt_required');
const raw=readFileSync(`.setup/${attempt}.txt`,'utf8');
const start=raw.indexOf('{'),end=raw.lastIndexOf('}');const summary=JSON.parse(raw.slice(start,end+1));
const output=`spike/m3/runtime/evidence/${attempt}`;
writeFileSync(`${output}.txt`,raw,{flag:'wx'});
const identities=new Map();
function collect(o){if(!o||typeof o!=='object')return;if(Array.isArray(o.owned))for(const i of o.owned)identities.set(`${i.pid}:${i.start}`,i);for(const x of Object.values(o))collect(x);}
collect(summary);
const probes=device(['shell',"run-as dev.olea.m2.runtime sh -c 'ls files/m2/m3-startup-*.json files/m2/m3-exception-*.json files/m2/m3-teardown-*.json'"]).trim().split(/\r?\n/);
const receipts=[];
for(const path of probes){const text=device(['exec-out','run-as','dev.olea.m2.runtime','cat',path]);const r=JSON.parse(text);if(r.startedAtMs<summary.at-60000)continue;collect(r);receipts.push({path,report:r});}
const observations=[...identities.values()].map(identity=>({identity,stat:device(['shell',`if [ -d /proc/${identity.pid} ]; then cat /proc/${identity.pid}/stat; else echo ABSENT; fi`]).trim()}));
writeFileSync(`${output}-independent.json`,JSON.stringify({at:new Date().toISOString(),summary,receipts,observations,allAbsent:observations.every(o=>o.stat==='ABSENT'),uidInventory:device(['shell','ps -A -o UID,PID,PPID,NAME']).split('\n').filter(l=>/^\s*10216\s/.test(l))},null,2)+'\n',{flag:'wx'});
console.log({cases:summary.cases.map(x=>({name:x.name,status:x.status})),identities:observations.length,allAbsent:observations.every(o=>o.stat==='ABSENT')});
