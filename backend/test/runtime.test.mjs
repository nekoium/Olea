// SPDX-License-Identifier: MIT
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile, lstat, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { TerminalSession } from '../dist/terminal-session.js';
import { Backend } from '../dist/backend.js';
import { linkUpstreamAuth } from '../dist/upstream-auth.js';
const temporary = resolve(import.meta.dirname, '../.setup/tests');
await mkdir(temporary, { recursive: true });
const fixture = join(import.meta.dirname, 'terminal-fixture.mjs');
async function eventually(check) {
  const deadline = Date.now() + 3000;
  while (!check()) { if (Date.now() >= deadline) assert.fail('terminal event did not arrive'); await new Promise(resolve => setTimeout(resolve, 10)); }
}

test('terminal transport preserves raw control/UTF-8 input, resize, bounded output and independent shell lifecycle', async t => {
  const root = await mkdtemp(join(temporary, 'terminal-'));
  let first, second;
  t.after(async () => { await first?.stop(); await second?.stop(); await rm(root, { recursive: true, force: true }); });
  first = await TerminalSession.start(root, 'First', () => {}, process.execPath, fixture);
  second = await TerminalSession.start(root, 'Second', () => {}, process.execPath, fixture);
  const raw = '\x03\x1b[A雪\r';
  first.write({ type: 'input', text: raw });
  await eventually(() => first.status().output === raw);
  assert.equal(second.status().output, '');
  first.write({ type: 'resize', columns: 120, rows: 40 });
  await eventually(() => first.status().output.endsWith('120x40'));
  assert.throws(() => first.write({ type: 'resize', columns: 0, rows: 40 }), /terminal_invalid_size/);
  assert.throws(() => first.write({ type: 'input', text: 'x'.repeat(32769) }), /terminal_invalid_input/);
  for (let index = 0; index < 10; index++) first.write({ type: 'input', text: String(index).repeat(32768) });
  await eventually(() => first.status().output.endsWith('9'.repeat(32768)));
  assert.equal(first.status().output.length, 262144);
  await first.stop();
  assert.throws(() => first.write({ type: 'input', text: 'no replay' }), /terminal_not_running/);
  second.write({ type: 'input', text: 'still alive' });
  await eventually(() => second.status().output === 'still alive');
});

test('upstream auth refreshes share a file without replacing existing per-session credentials', async t => {
  if (process.platform === 'win32') { t.skip('Windows host cannot create unprivileged file symlinks; Linux/Android acceptance required'); return; }
  const root = await mkdtemp(join(temporary, 'auth-link-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const source = join(root, 'upstream.json'), target = join(root, 'session.json');
  await linkUpstreamAuth(source, target);
  await assert.rejects(lstat(target), { code: 'ENOENT' });
  await writeFile(source, 'synthetic-first');
  await linkUpstreamAuth(source, target);
  assert.equal((await lstat(target)).isSymbolicLink(), true);
  assert.equal(await readFile(target, 'utf8'), 'synthetic-first');
  await writeFile(source, 'synthetic-refreshed');
  assert.equal(await readFile(target, 'utf8'), 'synthetic-refreshed');
  const existing = join(root, 'existing.json');
  await writeFile(existing, 'session-owned');
  await linkUpstreamAuth(source, existing);
  assert.equal(await readFile(existing, 'utf8'), 'session-owned');
});

test('two conversations keep workspace writes and prompt delivery independent when one is disconnected', async t => {
  const root = await mkdtemp(join(temporary, 'independent-'));
  const workspace = join(root, 'workspace'), second = join(workspace, 'second');
  await mkdir(second, { recursive: true });
  const stateDir = join(root, 'sessions');
  const backend = new Backend({ entry: join(import.meta.dirname, 'rpc-fixture.mjs'), workspace, workspaceRoot: workspace, stateDir }, () => {});
  t.after(async () => { await backend.close(); await rm(root, { recursive: true, force: true }); });
  await Promise.all([backend.start('one'), backend.start('two', false, second)]);
  await Promise.all(['one', 'two'].map(session => backend.command(session, { type: 'bash', command: 'fixture' })));
  assert.equal(await readFile(join(workspace, 'workspace-kept.txt'), 'utf8'), 'kept\n');
  assert.equal(await readFile(join(second, 'workspace-kept.txt'), 'utf8'), 'kept\n');
  await backend.stop('one');
  assert.deepEqual(backend.status().map(item => item.session), ['two']);
  await backend.command('two', { type: 'prompt', message: 'second conversation only' });
  assert.equal(await readFile(join(stateDir, 'two/submissions.txt'), 'utf8'), 'second conversation only\n');
  await assert.rejects(readFile(join(stateDir, 'one/submissions.txt')), { code: 'ENOENT' });
});

test('terminal startup rejects workspace escapes and settles pending STOP without late publication', async t => {
  const root = await mkdtemp(join(temporary, 'terminal-start-'));
  const workspace = join(root, 'workspace'), outside = join(root, 'outside');
  await mkdir(workspace); await mkdir(outside);
  const backend = new Backend({ entry: '', workspace, workspaceRoot: workspace, stateDir: join(root, 'sessions') }, () => {});
  const gate = Promise.withResolvers();
  t.after(async () => { gate.resolve(); await backend.close(); await rm(root, { recursive: true, force: true }); });
  await assert.rejects(backend.startTerminal('escape', outside), /workspace_outside_root/);
  const original = backend.workspace.bind(backend);
  backend.workspace = async (...args) => { await gate.promise; return original(...args); };
  const start = assert.rejects(backend.startTerminal('pending', workspace), /start_cancelled/);
  const stopped = backend.closeTerminal('pending');
  gate.resolve();
  await Promise.all([start, stopped]);
  assert.deepEqual(backend.terminalStatus(), []);
});
