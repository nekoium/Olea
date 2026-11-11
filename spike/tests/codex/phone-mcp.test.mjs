// SPDX-License-Identifier: MIT
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { callPhone, phoneTools } from '../../backend/dist/phone-mcp.js';
test('MCP helper refuses unexpected provider authority without printing its value', () => {
  const result = spawnSync(process.execPath, [resolve('spike/backend/dist/phone-mcp.js'), 'unused'], { env: { OLEA_CODEX_PROVIDER_KEY: 'fixture-only-never-real' }, encoding: 'utf8', timeout: 3000, input: '' });
  assert.equal(result.status, 2);
  assert.equal(result.stdout, ''); assert.equal(result.stderr, '');
});
test('allocated MCP subset blocks extra tools and sixth native delivery', async t => {
  await mkdir('.setup/codex-tests', { recursive: true });
  const directory = await mkdtemp(resolve('.setup/codex-tests/mcp-policy-'));
  let delivered = 0;
  const server = createServer((request, response) => { delivered++; request.resume(); response.end(JSON.stringify({ok:true,result:{fixture:true}})); });
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  const configPath=join(directory,'bridge.json');
  await writeFile(configPath,JSON.stringify({url:`http://127.0.0.1:${server.address().port}`,token:'fixture-only-token'}));
  const child=spawn(process.execPath,[resolve('spike/backend/dist/phone-mcp.js'),configPath],{env:{OLEA_PHONE_CALL_LIMIT:'5',OLEA_PHONE_TOOL_ALLOWLIST:'phone_capabilities,phone_location,phone_fixture_notify,phone_notifications'},stdio:['pipe','pipe','pipe']});
  t.after(async()=>{child.kill();await new Promise(resolve=>server.close(resolve));await rm(directory,{recursive:true,force:true});});
  let id=0,buffer='';const pending=new Map();
  child.stdout.on('data',chunk=>{buffer+=chunk;let index;while((index=buffer.indexOf('\n'))>=0){const reply=JSON.parse(buffer.slice(0,index));buffer=buffer.slice(index+1);pending.get(reply.id)?.(reply.result);pending.delete(reply.id);}});
  const request=(method,params={})=>new Promise((resolve,reject)=>{const current=++id;const timer=setTimeout(()=>reject(Error('policy helper deadline')),3000);pending.set(current,result=>{clearTimeout(timer);resolve(result);});child.stdin.write(JSON.stringify({jsonrpc:'2.0',id:current,method,params})+'\n');});
  const listed=await request('tools/list');assert.equal(listed.tools.length,4);
  assert.equal((await request('tools/call',{name:'phone_open_url',arguments:{url:'https://example.org'}})).isError,true);assert.equal(delivered,0);
  for(let i=0;i<5;i++)assert.equal((await request('tools/call',{name:'phone_capabilities',arguments:{}})).isError,false);
  assert.equal((await request('tools/call',{name:'phone_capabilities',arguments:{}})).isError,true);assert.equal(delivered,5);
});

test('narrow MCP phone mapping authenticates and preserves native denial without replay', async t => {
  await mkdir('.setup/codex-tests', { recursive: true });
  const directory = await mkdtemp(resolve('.setup/codex-tests/mcp-'));
  let count = 0;
  let expectedOperation = 'global_action';
  let expectedArgs = { action: 'home' };
  const server = createServer((request, response) => {
    assert.equal(request.headers.authorization, 'Bearer fixture-only-token');
    let body = ''; request.on('data', chunk => body += chunk);
    request.on('end', () => {
      const record = JSON.parse(body); assert.equal(record.operation, expectedOperation); assert.deepEqual(record.args, expectedArgs);
      count++; response.writeHead(403, { 'content-type': 'application/json' }); response.end(JSON.stringify({ ok: false, error: { code: 'PHONE_STOPPED' } }));
    });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => { await new Promise(resolve => server.close(resolve)); await rm(directory, { force: true, recursive: true }); });
  const configPath = join(directory, 'bridge.json');
  await writeFile(configPath, JSON.stringify({ url: `http://127.0.0.1:${server.address().port}`, token: 'fixture-only-token' }));
  assert.equal((await callPhone('phone_home', {}, configPath)).isError, true);
  assert.equal(count, 1);
  await assert.rejects(callPhone('phone_shell', {}, configPath), /invalid_tool/);
  await assert.rejects(callPhone('phone_click', { nodeId: 'valid', command: 'bad' }, configPath), /invalid_arguments/);
  assert.equal(count, 1);
  await assert.rejects(callPhone('phone_open_url', { url: 'http://example.org' }, configPath), /invalid_arguments/);
  await assert.rejects(callPhone('phone_open_url', { url: 'https://example.org/' + 'x'.repeat(2048) }, configPath), /invalid_arguments/);
  expectedOperation = 'open_url'; expectedArgs = { url: 'https://example.org/' + 'x'.repeat(200) };
  assert.equal((await callPhone('phone_open_url', expectedArgs, configPath)).isError, true);
  assert.equal(count, 2);
  for (const name of ['phone_location', 'phone_files_write_read', 'phone_notifications', 'phone_fixture_notify', 'phone_capture_request', 'phone_capture_result', 'phone_folder_request']) assert(phoneTools.some(tool => tool.name === name));
  assert.ok(phoneTools.every(tool => !/oracle|shell|adb/.test(tool.name)));
});
