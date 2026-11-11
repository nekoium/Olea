// SPDX-License-Identifier: MIT
import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdir,mkdtemp,writeFile,readFile,rm} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import extension from '../../backend/extensions/phone.ts';
test('Pi supported extension selects four tools and denies sixth native delivery',async t=>{
 await mkdir('.setup/pi-policy-tests',{recursive:true});const dir=await mkdtemp(resolve('.setup/pi-policy-tests/case-'));
 let count=0;const server=createServer((request,response)=>{count++;request.resume();response.end(JSON.stringify({ok:true,result:{fixture:true}}));});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const keys=['OLEA_PROVIDER_CONFIG','OLEA_PHONE_CALL_LIMIT','OLEA_PHONE_TOOL_ALLOWLIST','OLEA_PHONE_READINESS','OLEA_BRIDGE_CONFIG'];const prior=Object.fromEntries(keys.map(k=>[k,process.env[k]]));
 t.after(async()=>{for(const k of keys){if(prior[k]===undefined)delete process.env[k];else process.env[k]=prior[k];}await new Promise(r=>server.close(r));await rm(dir,{recursive:true,force:true});});
 delete process.env.OLEA_PROVIDER_CONFIG;
 Object.assign(process.env,{OLEA_PHONE_CALL_LIMIT:'5',OLEA_PHONE_TOOL_ALLOWLIST:'phone_capabilities,phone_location,phone_fixture_notify,phone_notifications',OLEA_PHONE_READINESS:join(dir,'ready.json'),OLEA_BRIDGE_CONFIG:join(dir,'bridge.json')});
 await writeFile(process.env.OLEA_BRIDGE_CONFIG,JSON.stringify({url:`http://127.0.0.1:${server.address().port}`,token:'fixture-only-token'}));
 const tools=[],handlers={};let active=[];
 extension({registerTool:tool=>tools.push(tool),on:(name,handler)=>handlers[name]=handler,getAllTools:()=>tools,setActiveTools:names=>active=names,getActiveTools:()=>active});
 handlers.session_start({reason:'startup'});
 assert.deepEqual([...active].sort(),['phone_capabilities','phone_location','phone_fixture_notify','phone_notifications'].sort());
 assert.equal(tools.length,4);assert(!tools.some(t=>t.name==='phone_open_url'));
 const readiness=JSON.parse(await readFile(process.env.OLEA_PHONE_READINESS,'utf8'));assert.equal(readiness.active.length,4);
 const capabilities=tools.find(t=>t.name==='phone_capabilities');
 for(let i=0;i<5;i++)await capabilities.execute(String(i),{});
 await assert.rejects(capabilities.execute('sixth',{}),/phone_policy_denied_no_native_delivery/);assert.equal(count,5);
});
