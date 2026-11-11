// SPDX-License-Identifier: MIT
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {device,bridge} from '../../m2/runtime/bridge.mjs';
const report={attempt:'location-a02',startedAt:Date.now(),modelRequests:0,previousFailure:'direct-categories-a01 stale cached callback removed listener before fresh injection',operations:[]};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
try {
 report.provisioning=[device(['shell',"run-as dev.olea.m2.runtime sh -c 'touch files/enable-phone-once'"]),device(['shell','am start -f 0x18000000 -n dev.olea.m2.runtime/dev.olea.spike.MainActivity'])];
 await wait(500);
 report.registration=await bridge('location');
 await wait(800);
 report.independentInput={longitude:121.5432,latitude:24.9876,at:Date.now(),result:device(['emu','geo','fix','121.5432','24.9876'])};
 await wait(1800);
 report.result=await bridge('location');
 const p=report.result.body.result;
 assert.equal(report.result.body.ok,true);assert(Math.abs(p.latitude-24.9876)<0.0001);assert(Math.abs(p.longitude-121.5432)<0.0001);assert(p.ageMs>=0&&p.ageMs<5000);assert(p.timeMs>=report.startedAt-5000);
 report.status='pass';
} catch(e){report.status='fail';report.error=e.message;}
finally{report.endedAt=Date.now();writeFileSync('spike/m3/runtime/evidence/location-a02.json',JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(report));}
