// SPDX-License-Identifier: MIT
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { JsonLines, PiProcess } from '../../backend/dist/pi-process.js';
import { Backend } from '../../backend/dist/backend.js';
import phoneExtension from '../../backend/extensions/phone.ts';

const root = resolve(import.meta.dirname, '../../../');
const tempRoot = join(root, '.setup', 'backend-tests');
await mkdir(tempRoot, { recursive: true });
const fixture = resolve(import.meta.dirname, 'mock-pi.mjs');

test('host-only: JSONL preserves Unicode separators and split UTF8, caps complete/incomplete lines', () => {
  const records = [];
  const parser = new JsonLines(record => records.push(record), 100);
  const line = Buffer.from(JSON.stringify({ text: '雪\u2028\u2029' }) + '\r\n');
  for (const byte of line) parser.push(Buffer.from([byte]));
  assert.equal(records[0].text, '雪\u2028\u2029');
  assert.throws(() => new JsonLines(() => {}, 10).push(Buffer.from('x'.repeat(11))), /record_limit/);
  assert.throws(() => new JsonLines(() => {}, 10).push(Buffer.from('x'.repeat(11) + '\n')), /record_limit/);
});

test('host-only: persistent subprocess correlates requests, times out, rejects oversized output and shuts down', async () => {
  const pi = new PiProcess({ entry: fixture, cwd: root });
  try {
    const [a, b] = await Promise.all([pi.request({ type: 'prompt', message: 'a' }), pi.request({ type: 'prompt', message: 'b' })]);
    assert.equal(a.data.echo, 'a'); assert.equal(b.data.echo, 'b');
    await assert.rejects(pi.request({ type: 'hang' }, 30), /rpc_timeout/);
    const fault = once(pi, 'fault');
    await assert.rejects(pi.request({ type: 'oversize' }), /pi_stopped|pi_exited/);
    assert.equal((await fault)[0], 'invalid_or_oversize_rpc');
  } finally { await pi.stop(); }
});

test('host-only: two sessions, explicit resume and no silent prompt replay', async () => {
  const stateDir = await mkdtemp(join(tempRoot, 'sessions-'));
  const backend = new Backend({ entry: fixture, workspace: root, stateDir }, () => {});
  try {
    const starts = await Promise.allSettled([backend.start('a'), backend.start('b'), backend.start('c')]);
    assert.equal(starts.filter(result => result.status === 'fulfilled').length, 2);
    assert.equal(starts[2].status, 'rejected');
    assert.equal(backend.status().length, 2);
    await assert.rejects(backend.start('c'), /session_limit/);
    await assert.rejects(backend.start('../escape'), /invalid_session/);
    await backend.stop('a'); await backend.start('a', true);
    assert.equal(backend.status().length, 2);
    await assert.rejects(backend.command('a', { type: 'switch_session' }), /unsupported_command/);
  } finally { await backend.close(); await rm(stateDir, { recursive: true, force: true }); }
});

test('host-only: supported extension registers phone tools, authenticates calls and honors native denial', async () => {
  const temp = await mkdtemp(join(tempRoot, 'bridge-'));
  const previous = process.env.OLEA_BRIDGE_CONFIG;
  let denied = false;
  const calls = [];
  const server = createServer(async (request, response) => {
    assert.equal(request.headers.authorization, 'Bearer fixture-token');
    let body = ''; for await (const chunk of request) body += chunk;
    calls.push(JSON.parse(body));
    response.setHeader('content-type', 'application/json');
    response.end(JSON.stringify(denied ? { ok: false, error: { code: 'permission_revoked' } } : { ok: true, result: { nodes: [{ nodeId: 'launcher:1', text: 'Fixture' }] } }));
  });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  try {
    const config = join(temp, 'bridge.json');
    await writeFile(config, JSON.stringify({ url: `http://127.0.0.1:${server.address().port}`, token: 'fixture-token' }));
    process.env.OLEA_BRIDGE_CONFIG = config;
    const tools = [];
    phoneExtension({ registerTool: tool => tools.push(tool), registerProvider: () => {} });
    assert.equal(tools.length, 6);
    assert.equal(tools.some(tool => /oracle/i.test(tool.name)), false);
    await tools.find(tool => tool.name === 'phone_click').execute('test-1', { nodeId: 'launcher:1' });
    assert.deepEqual(calls[0], { id: 'test-1', operation: 'accessibility_click', args: { nodeId: 'launcher:1' } });
    denied = true;
    await assert.rejects(tools[0].execute('test-2', {}), /bridge_denied:permission_revoked/);
  } finally {
    if (previous === undefined) delete process.env.OLEA_BRIDGE_CONFIG; else process.env.OLEA_BRIDGE_CONFIG = previous;
    server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
    await rm(temp, { recursive: true, force: true });
  }
});
