// SPDX-License-Identifier: MIT
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, access, rm } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { Backend } from '../dist/backend.js';
import { JsonLines } from '../dist/pi-process.js';
const rootDirectory = resolve(import.meta.dirname, '../..');
const temporary = join(rootDirectory, 'backend/.setup/tests');
await mkdir(temporary, { recursive: true });
const entry = join(import.meta.dirname, 'rpc-fixture.mjs');

test('saved session and workspace survive STOP/reopen without automatic prompt replay', async t => {
  const root = await mkdtemp(join(temporary, 'persistence-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const workspace = join(root, 'workspace'); await mkdir(workspace);
  const stateDir = join(root, 'sessions');
  let backend = new Backend({ entry, workspace, stateDir }, () => {});
  let state = await backend.start('conversation');
  assert.equal(state.state.resumed, false);
  assert.equal(state.state.argv.includes('--provider'), false);
  assert.equal(state.state.argv.includes('--extension'), false);
  await backend.command('conversation', { type: 'bash', command: 'fixture' });
  const savedBefore = await readFile(join(stateDir, 'conversation/resume.json'), 'utf8');
  await backend.close();
  backend = new Backend({ entry, workspace, stateDir }, () => {});
  try {
    await assert.rejects(backend.start('conversation', false), /pi_resume_required/);
    assert.equal(await readFile(join(stateDir, 'conversation/resume.json'), 'utf8'), savedBefore);
    state = await backend.start('conversation', true);
    assert.equal(state.state.resumed, true);
    assert.equal(await readFile(join(workspace, 'workspace-kept.txt'), 'utf8'), 'kept\n');
    assert.equal(await readFile(join(stateDir, 'conversation/resume.json'), 'utf8'), savedBefore);
    await assert.rejects(access(join(stateDir, 'conversation/submissions.txt')));
    await assert.rejects(backend.command('conversation', { type: 'prompt', message: '' }), /invalid_message/);
    await backend.stop('conversation');
    assert.equal(backend.status().length, 0);
    await assert.rejects(backend.command('conversation', { type: 'prompt', message: 'must not run' }), /session_not_running/);
    await assert.rejects(access(join(stateDir, 'conversation/submissions.txt')));
  } finally { await backend.close(); }
});

test('output parser bounds complete/incomplete records and preserves split UTF-8', () => {
  const records = [];
  const parser = new JsonLines(record => records.push(record), 100);
  for (const byte of Buffer.from('{"text":"雪 "}\n')) parser.push(Buffer.from([byte]));
  assert.equal(records[0].text, '雪 ');
  assert.throws(() => new JsonLines(() => {}, 8).push(Buffer.from('x'.repeat(9))), /record_limit/);
  assert.throws(() => new JsonLines(() => {}, 8).push(Buffer.from('x'.repeat(9) + '\n')), /record_limit/);
});
