// SPDX-License-Identifier: MIT
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { Backend } from '../../backend/dist/backend.js';
import { CodexProcess } from '../../backend/dist/codex-process.js';
import { codexConfig, codexPolicy } from '../../backend/dist/codex-session.js';

const root = resolve('.setup/codex-tests');
await mkdir(root, { recursive: true });
async function fixture(t) {
  const path = await mkdtemp(join(root, 'case-'));
  const workspace = join(path, 'workspace'); await mkdir(workspace);
  const events = [];
  const backend = new Backend({ entry: '', codexEntry: resolve('spike/tests/codex/mock-codex.mjs'), workspace, stateDir: join(path, 'state') }, event => events.push(event));
  t.after(async () => { await backend.close(); await rm(path, { recursive: true, force: true }); });
  const start = await backend.startCodex('one');
  return { backend, events, path, start };
}
test('persistent handshake, thread, correlated turn, canonical resume', async t => {
  const f = await fixture(t);
  assert.equal(f.events[0].record.method, 'olea/process');
  assert.equal(f.start.threadId, 'thread-proved');
  const turn = await f.backend.codexCommand('one', { method: 'turn/start', params: { text: 'complete' } });
  assert.match(turn.turn.id, /^turn-/);
  await f.backend.stop('one');
  const resumed = await f.backend.startCodex('one', true);
  assert.equal(resumed.threadId, f.start.threadId);
  assert.equal(resumed.home, f.start.home);
  assert.equal(resumed.cwd, f.start.cwd);
  const saved = JSON.parse(await readFile(join(f.path, 'state/codex/one/thread.json'), 'utf8'));
  saved.cwd += '-wrong'; await writeFile(join(f.path, 'state/codex/one/thread.json'), JSON.stringify(saved));
  await f.backend.stop('one');
  await assert.rejects(f.backend.startCodex('one', true), /resume_identity_mismatch/);
});
test('approval is pending until explicit rejection; cannot resolve twice', async t => {
  const f = await fixture(t);
  await f.backend.codexCommand('one', { method: 'turn/start', params: { text: 'approval' } });
  await new Promise(resolve => setTimeout(resolve, 30));
  assert.equal(f.events.some(event => event.record?.method === 'fixture/approvalDecision'), false);
  f.backend.codexApproval('one', 'approval', 'decline');
  assert.throws(() => f.backend.codexApproval('one', 'approval', 'accept'), /approval_missing/);
  await new Promise(resolve => setTimeout(resolve, 30));
  assert.equal(f.events.find(event => event.record?.method === 'fixture/approvalDecision').record.params.decision, 'decline');
});
test('interrupt carries proved turn identity', async t => {
  const f = await fixture(t);
  const turn = await f.backend.codexCommand('one', { method: 'turn/start', params: { text: 'wait' } });
  await f.backend.codexCommand('one', { method: 'turn/interrupt' });
  await new Promise(resolve => setTimeout(resolve, 30));
  assert.ok(f.events.some(event => event.record?.params?.turn?.id === turn.turn.id && event.record.params.turn.status === 'interrupted'));
});
for (const text of ['malformed', 'oversize', 'exit']) test(text + ' fails pending calls without replay', async t => {
  const f = await fixture(t);
  await assert.rejects(f.backend.codexCommand('one', { method: 'turn/start', params: { text } }), /codex_/);
  assert.ok(f.events.some(event => event.type === 'fault'));
});
test('no acknowledgement is delivery unknown, never automatic replay', async t => {
  const child = new CodexProcess({ command: process.execPath, args: [resolve('spike/tests/codex/mock-codex.mjs')], cwd: process.cwd(), env: {} });
  t.after(() => child.stop()); await child.initialize();
  await assert.rejects(child.request('turn/start', { input: [{ text: 'noack' }] }, 25), /delivery_unknown/);
});
test('observed root exit removes exact session and allows same ID restart', async t => {
  const f = await fixture(t);
  await assert.rejects(f.backend.codexCommand('one', { method: 'turn/start', params: { text: 'exit' } }), /codex_/);
  await new Promise(resolve => setTimeout(resolve, 30));
  assert.equal(f.backend.status().length, 0);
  assert.equal((await f.backend.startCodex('one', true)).threadId, f.start.threadId);
});
test('late unrelated completion and foreign tool events never clear active turn', async t => {
  const f = await fixture(t);
  await f.backend.codexCommand('one', { method: 'turn/start', params: { text: 'foreign' } });
  await new Promise(resolve => setTimeout(resolve, 30));
  await assert.rejects(f.backend.codexCommand('one', { method: 'turn/start', params: { text: 'complete' } }), /turn_active/);
  assert.equal(f.events.some(event => event.code === 'codex_tool_round_limit'), false);
  await f.backend.codexCommand('one', { method: 'turn/interrupt' });
});
test('tool notifications before acknowledgement reconcile by turn ID and trigger limit', async t => {
  const f = await fixture(t);
  const turn = await f.backend.codexCommand('one', { method: 'turn/start', params: { text: 'preack' } });
  await new Promise(resolve => setTimeout(resolve, 30));
  assert.ok(f.events.some(event => event.code === 'codex_tool_round_limit'));
  assert.ok(f.events.some(event => event.record?.params?.turn?.id === turn.turn.id && event.record.params.turn.status === 'interrupted'));
});
test('unknown server request is rejected without action', async t => {
  const f = await fixture(t);
  await f.backend.codexCommand('one', { method: 'turn/start', params: { text: 'unknown' } });
  await new Promise(resolve => setTimeout(resolve, 30));
  assert.ok(f.events.some(event => event.record?.method === 'fixture/unknownRejected' && event.record.params.code === -32601));
});
test('inherited output pipes have bounded draining without false descendant-exit proof', async t => {
  const f = await fixture(t);
  await f.backend.codexCommand('one', { method: 'turn/start', params: { text: 'pipe-holder' } });
  const started = performance.now();
  const result = await f.backend.stop('one');
  assert.ok(performance.now() - started < 1500);
  assert.equal(result.descendantsVerified, false);
});
test('full access is explicit stock policy and invalid mode fails closed', () => {
  assert.deepEqual(codexPolicy(), { sandbox: 'workspace-write', approvalPolicy: 'on-request' });
  assert.deepEqual(codexPolicy('full-access'), { sandbox: 'danger-full-access', approvalPolicy: 'never' });
  assert.throws(() => codexPolicy('unknown'), /invalid_access_mode/);
  assert.match(codexConfig('gpt-6.1-terra', undefined, 'full-access'), /sandbox_mode = "danger-full-access"/);
  assert.match(codexConfig('gpt-6.1-terra', undefined, 'full-access'), /approval_policy = "never"/);
});
test('provider config bounds retries and scrubs shell secret inheritance', () => {
  const config = codexConfig('gpt-6.1-terra');
  assert.match(config, /env_key = "OLEA_CODEX_PROVIDER_KEY"/);
  assert.match(config, /wire_api = "responses"/);
  assert.match(config, /request_max_retries = 0/);
  assert.match(config, /stream_max_retries = 0/);
  assert.match(config, /inherit = "core"/);
  assert.match(config, /exclude = \["OLEA_\*"/);
  assert.doesNotMatch(config, /danger-full-access|approval_policy = "never"/);
});
