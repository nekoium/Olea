// SPDX-License-Identifier: MIT
import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, mkdtemp, readFile, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import ts from 'typescript';
import { Backend } from '../dist/backend.js';
import { codexConfig, codexPolicy, validateProvider } from '../dist/codex-session.js';
import { CodexProcess } from '../dist/codex-process.js';
import { callPhone, phoneTools } from '../dist/phone-mcp.js';
import { JsonLines } from '../dist/pi-process.js';

const temporary = resolve(import.meta.dirname, '../.setup/tests');
await mkdir(temporary, { recursive: true });
async function fixture(t) {
  const root = await mkdtemp(join(temporary, 'adapters-'));
  const workspace = join(root, 'workspace'); await mkdir(workspace);
  const second = join(workspace, 'second'); await mkdir(second);
  const outside = join(root, 'outside'); await mkdir(outside);
  const events = [];
  const options = { entry: join(import.meta.dirname, 'rpc-fixture.mjs'), codexEntry: join(import.meta.dirname, 'codex-fixture.mjs'), workspace, workspaceRoot: workspace, stateDir: join(root, 'sessions') };
  const backend = new Backend(options, record => events.push(record));
  t.after(async () => { await backend.close(); await rm(root, { recursive: true, force: true }); });
  return { root, workspace: await realpath(workspace), second: await realpath(second), outside, backend, options, events };
}

test('explicit provider accepts HTTPS and arbitrary model, never embeds key in Codex config', () => {
  const provider = validateProvider({ baseUrl: 'https://responses.example.test/custom/v1/', apiKey: 'synthetic-key', model: 'custom-model' });
  const config = codexConfig(provider, '/olea-phone/config.json');
  assert.match(config, /base_url = "https:\/\/responses.example.test\/custom\/v1"/);
  assert.match(config, /model = "custom-model"/);
  assert.match(config, /request_max_retries = 0/);
  assert.match(config, /stream_max_retries = 0/);
  assert.match(config, /OLEA_BRIDGE_CONFIG = "\/olea-phone\/config.json"/);
  assert.doesNotMatch(config, /synthetic-key|chiyi|terra|PHONE_CALL_LIMIT|ALLOWLIST/);
  assert.deepEqual(codexPolicy(), { sandbox: 'danger-full-access', approvalPolicy: 'never' });
  assert.throws(() => codexPolicy('invalid'), /invalid_access_mode/);
  for (const baseUrl of ['http://example.test', 'https://user:pass@example.test', 'https://example.test/#secret', 'https://example.test/?key=secret']) assert.throws(() => validateProvider({ ...provider, baseUrl }), /invalid_provider_config/);
  for (const patch of [{ apiKey: '' }, { model: '' }, { model: 'line\nbreak' }]) assert.throws(() => validateProvider({ ...provider, ...patch }), /invalid_provider_config/);
});

test('workspace selection blocks realpath escapes, binds agent/workspace, and keeps two-session cap', async t => {
  const f = await fixture(t);
  await assert.rejects(f.backend.start('relative', false, 'relative'), /invalid_workspace/);
  await assert.rejects(f.backend.start('outside', false, f.outside), /workspace_outside_root/);
  const linked = join(f.workspace, 'escape');
  await symlink(f.outside, linked, process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(f.backend.start('escape', false, linked), /workspace_outside_root/);
  const started = await f.backend.start('one', false, f.second);
  assert.equal(started.workspace, f.second);
  assert.equal(f.backend.status()[0].workspace, f.second);
  await f.backend.command('one', { type: 'bash', command: 'fixture' });
  await f.backend.startCodex('two');
  await assert.rejects(f.backend.start('three'), /session_limit/);
  await f.backend.stop('one');
  await assert.rejects(f.backend.start('one', true, f.workspace), /session_identity_mismatch/);
  await assert.rejects(f.backend.startCodex('one', true, f.second), /session_identity_mismatch/);
  assert.equal((await f.backend.start('one', true, f.second)).state.resumed, true);
});

test('configured default remains usable without the Android workspace root on host', async t => {
  const f = await fixture(t);
  const backend = new Backend({ ...f.options, workspaceRoot: join(f.root, 'absent-root') }, () => {});
  try { assert.equal((await backend.start('default')).workspace, f.workspace); }
  finally { await backend.close(); }
});

test('Pi legacy checkpoint migrates only in configured default workspace', async t => {
  const f = await fixture(t);
  const directory = join(f.options.stateDir, 'legacy'); await mkdir(directory, { recursive: true });
  const sessionFile = join(directory, 'old.jsonl'); await writeFile(sessionFile, 'saved\n');
  await writeFile(join(directory, 'resume.json'), JSON.stringify({ sessionFile }));
  await assert.rejects(f.backend.start('legacy', true, f.second), /session_identity_mismatch/);
  assert.equal((await f.backend.start('legacy', true)).workspace, f.workspace);
});

test('Pi reopens an absent reserved session file without creating a transcript or replaying', async t => {
  const f = await fixture(t);
  const start = await f.backend.start('reserved');
  const checkpoint = join(f.options.stateDir, 'reserved/resume.json');
  const saved = JSON.parse(await readFile(checkpoint, 'utf8'));
  assert.equal(saved.sessionFile, start.state.sessionFile);
  await assert.rejects(readFile(saved.sessionFile), { code: 'ENOENT' });
  await f.backend.stop('reserved');
  const resumed = await f.backend.start('reserved', true);
  assert.equal(resumed.state.resumed, true);
  assert.equal(resumed.state.sessionFile, saved.sessionFile);
  await assert.rejects(readFile(saved.sessionFile), { code: 'ENOENT' });
  await assert.rejects(readFile(join(f.options.stateDir, 'reserved/submissions.txt')), { code: 'ENOENT' });
});

test('Pi rejects traversal and symlink ancestors for existing and absent resume leaves', async t => {
  const f = await fixture(t);
  const directory = join(f.options.stateDir, 'hostile'); await mkdir(directory, { recursive: true });
  const link = join(directory, 'escape');
  await symlink(f.outside, link, process.platform === 'win32' ? 'junction' : 'dir');
  await writeFile(join(f.outside, 'existing.jsonl'), 'outside\n');
  for (const sessionFile of [join(f.outside, 'absent.jsonl'), directory + '/child/../reserved.jsonl', join(link, 'existing.jsonl'), join(link, 'absent.jsonl')]) {
    await writeFile(join(directory, 'resume.json'), JSON.stringify({ sessionFile }));
    await assert.rejects(f.backend.start('hostile', true), /invalid_resume_path/);
  }
});

test('Codex preserves stream/history/interrupt and same-home resume without test turn limits', async t => {
  const f = await fixture(t);
  const providerPath = join(f.root, 'provider.json');
  await writeFile(providerPath, JSON.stringify({ baseUrl: 'https://provider.example.test/v1', apiKey: 'synthetic-key', model: 'custom-model' }));
  f.options.codexProviderPath = providerPath;
  const start = await f.backend.startCodex('codex', false, f.second);
  assert.equal(start.accessMode, 'full-access');
  assert.equal(start.filesystemIsolation, false);
  assert.equal(start.workspace, f.second);
  const config = await readFile(join(start.home, 'config.toml'), 'utf8');
  assert.match(config, /model = "custom-model"/);
  assert.doesNotMatch(config, /synthetic-key/);
  const turn = await f.backend.codexCommand('codex', { method: 'turn/start', params: { text: 'wait' } });
  await assert.rejects(f.backend.codexCommand('codex', { method: 'turn/start', params: { text: 'second' } }), /turn_active/);
  assert.equal(f.events.filter(event => event.record?.method === 'item/started').length, 20);
  assert.equal(f.events.find(event => event.record?.method === 'item/agentMessage/delta').record.params.delta, 'streamed');
  assert.equal(f.events.some(event => event.code === 'codex_tool_round_limit'), false);
  const interrupted = await f.backend.codexCommand('codex', { method: 'turn/interrupt' });
  assert.equal(interrupted.interrupted, turn.turn.id);
  const history = await f.backend.codexCommand('codex', { method: 'thread/read' });
  assert.equal(history.includeTurns, true);
  assert.equal(history.thread.turns[0].items[0].text, 'history');
  const exec = await f.backend.codexCommand('codex', { method: 'command/exec', params: { command: ['sh', '-lc', 'pwd'], cwd: f.outside, timeoutMs: 1000 } });
  assert.equal(exec.received.cwd, f.second);
  assert.equal(exec.received.outputBytesCap, 65536);
  await assert.rejects(f.backend.codexCommand('codex', { method: 'command/exec', params: { command: ['sh'], timeoutMs: 300001 } }), /invalid_exec/);
  await f.backend.stop('codex');
  await assert.rejects(f.backend.startCodex('codex', true, f.workspace), /session_identity_mismatch/);
  const resumed = await f.backend.startCodex('codex', true, f.second);
  assert.equal(resumed.home, start.home);
  assert.equal(resumed.threadId, start.threadId);
  await f.backend.stop('codex');
  const path = join(f.options.stateDir, 'codex/codex/thread.json');
  const saved = JSON.parse(await readFile(path, 'utf8')); saved.home += '-copy';
  await writeFile(path, JSON.stringify(saved));
  await assert.rejects(f.backend.startCodex('codex', true, f.second), /resume_identity_mismatch/);
});

test('unknown Codex delivery is never replayed', async t => {
  const child = new CodexProcess({ command: process.execPath, args: [join(import.meta.dirname, 'codex-fixture.mjs')], cwd: import.meta.dirname, env: {} });
  t.after(() => child.stop());
  const events = []; child.on('record', event => events.push(event));
  await child.initialize();
  await assert.rejects(child.request('turn/start', { threadId: 'thread', input: [{ text: 'noack' }] }, 50), /delivery_unknown/);
  assert.equal(events.filter(event => event.method === 'turn/started').length, 1);
});

test('Pi and MCP share registration, phone denials are actionable and redact token, malformed calls never deliver', async t => {
  const f = await fixture(t);
  const requests = [];
  const token = 'synthetic-phone-token';
  const server = createServer(async (request, response) => {
    let body = ''; for await (const chunk of request) body += chunk;
    requests.push(JSON.parse(body));
    assert.equal(request.headers.authorization, `Bearer ${token}`);
    response.writeHead(403, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ ok: false, error: { code: 'ACCESSIBILITY_DISABLED', message: `Enable Accessibility in Android settings ${token}` } }));
  });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const configPath = join(f.root, 'bridge.json');
  await writeFile(configPath, JSON.stringify({ url: `http://127.0.0.1:${server.address().port}/phone`, token }));
  const result = await callPhone('phone_inspect', {}, configPath);
  assert.equal(result.isError, true);
  assert.match(result.content[0].text, /ACCESSIBILITY_DISABLED: Enable Accessibility/);
  assert.doesNotMatch(result.content[0].text, /synthetic-phone-token/);
  await assert.rejects(callPhone('phone_swipe', { x: 'wrong' }, configPath), /invalid_arguments/);
  await assert.rejects(callPhone('phone_click', {}, configPath), /invalid_arguments/);
  await assert.rejects(callPhone('phone_fixture_notify', {}, configPath), /invalid_tool/);
  assert.equal(requests.length, 1);
  await callPhone('phone_app_action', { value: 'hello' }, configPath);
  assert.equal(requests[1].operation, 'cooperating_app_action');
  const registered = [];
  // Transpile the shipped TypeScript extension; preserve its real shared import.
  const source = await readFile(join(import.meta.dirname, '../extensions/phone.ts'), 'utf8');
  const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText.replace('../dist/phone-mcp.js', new URL('../dist/phone-mcp.js', import.meta.url).href);
  const extension = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
  extension.default({ registerTool: tool => registered.push(tool) });
  assert.deepEqual(registered.map(tool => tool.name), phoneTools.map(tool => tool.name));
  const backend = new Backend({ ...f.options, bridgePath: configPath }, () => {});
  try {
    const started = await backend.start('pi');
    assert.ok(started.state.argv.includes('--extension'));
    const registeredPath = started.state.argv[started.state.argv.indexOf('--extension') + 1];
    await readFile(registeredPath);
  } finally { await backend.close(); }
  const mcp = spawn(process.execPath, [join(import.meta.dirname, '../dist/phone-mcp.js')], { env: { OLEA_BRIDGE_CONFIG: configPath }, stdio: ['pipe', 'pipe', 'pipe'] });
  t.after(() => { mcp.stdin.end(); mcp.kill(); });
  const listed = new Promise(resolve => { const lines = new JsonLines(record => resolve(record)); mcp.stdout.on('data', chunk => lines.push(chunk)); });
  mcp.stdin.write(JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }) + '\n');
  assert.deepEqual((await listed).result.tools.map(tool => tool.name), registered.map(tool => tool.name));
});
