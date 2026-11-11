// SPDX-License-Identifier: MIT
import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdir,mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import extension from '../../backend/extensions/phone.ts';
for(const limit of [5,7])test(`Pi scoped ${limit}-call policy blocks excess delivery${limit===7?' and waits for matching consent observer':''}`,async t=>{
 await mkdir('.setup/pi-policy-tests',{recursive:true});const dir=await mkdtemp(resolve('.setup/pi-policy-tests/case-'));
 let count=0;const server=createServer((request,response)=>{count++;request.resume();response.end(JSON.stringify({ok:true,result:{fixture:true}}));});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const keys=['OLEA_PROVIDER_CONFIG','OLEA_PHONE_CALL_LIMIT','OLEA_PHONE_TOOL_ALLOWLIST','OLEA_PHONE_READINESS','OLEA_BRIDGE_CONFIG','OLEA_PHONE_CAPTURE_READY'];const prior=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 t.after(async()=>{for(const k of keys){if(prior[k]===undefined)delete process.env[k];else process.env[k]=prior[k];}await new Promise(r=>server.close(r));await rm(dir,{recursive:true,force:true});});
 delete process.env.OLEA_PROVIDER_CONFIG;
 const names=limit===5?['phone_capabilities','phone_location','phone_fixture_notify','phone_notifications']:['phone_capabilities','phone_capture_request','phone_capture_result','phone_files_write_read','phone_fixture_notify','phone_notifications','phone_open_url'];
 Object.assign(process.env,{OLEA_PHONE_CALL_LIMIT:String(limit),OLEA_PHONE_TOOL_ALLOWLIST:names.join(','),OLEA_PHONE_READINESS:join(dir,'ready.json'),OLEA_BRIDGE_CONFIG:join(dir,'bridge.json'),OLEA_PHONE_CAPTURE_READY:join(dir,'capture-ready.json')});
 await writeFile(process.env.OLEA_BRIDGE_CONFIG,JSON.stringify({url:`http://127.0.0.1:${server.address().port}`,token:'fixture-only-token'}));
 const tools=[],handlers={};let active=[];
 extension({registerTool:tool=>tools.push(tool),on:(name,handler)=>handlers[name]=handler,getAllTools:()=>tools,setActiveTools:values=>active=values,getActiveTools:()=>active});
 handlers.session_start({reason:'startup'});
 assert.deepEqual([...active].sort(),[...names].sort());assert.equal(tools.length,names.length);
 assert.equal(JSON.parse(await readFile(process.env.OLEA_PHONE_READINESS,'utf8')).maxNativeCalls,limit);
 if(limit===7){
  await tools.find(t=>t.name==='phone_capture_request').execute('fresh-request',{});
  const request=JSON.parse(await readFile(process.env.OLEA_PHONE_CAPTURE_READY+'.request.json','utf8'));assert.equal(request.requestId,'fresh-request');
  await writeFile(process.env.OLEA_PHONE_CAPTURE_READY,JSON.stringify({requestId:'stale',status:'ready'}));
  const result=tools.find(t=>t.name==='phone_capture_result').execute('read',{});await new Promise(r=>setTimeout(r,50));assert.equal(count,1,'No native result call before matching observer');
  await writeFile(process.env.OLEA_PHONE_CAPTURE_READY,JSON.stringify({requestId:'fresh-request',status:'ready'}));await result;assert.equal(count,2);
 }
 const caps=tools.find(t=>t.name==='phone_capabilities');while(count<limit)await caps.execute(String(count),{});
 await assert.rejects(caps.execute('excess',{}),/phone_policy_denied_no_native_delivery/);assert.equal(count,limit);
});
