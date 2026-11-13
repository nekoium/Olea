// SPDX-License-Identifier: MIT
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, realpath, rm, writeFile, appendFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { Backend } from '../dist/backend.js';
import { ClaudeSession, claudeSettings, claudeMcp } from '../dist/claude-session.js';

const temporary = resolve(import.meta.dirname, '../.setup/tests');
await mkdir(temporary, { recursive: true });
async function fixture(t) {
  const root = await mkdtemp(join(temporary, 'claude-'));
  const workspace = join(root, 'workspace'); await mkdir(workspace);
  const second = join(workspace, 'second'); await mkdir(second);
  const events = [];
  const providerPath = join(root, 'provider.json');
  await writeFile(providerPath, JSON.stringify({ baseUrl: 'https://anthropic.example.test/api', apiKey: 'synthetic-claude-key', model: 'claude-haiku-4-5-20251001' }));
  const options = { entry: join(import.meta.dirname, 'rpc-fixture.mjs'), claudeEntry: join(import.meta.dirname, 'claude-fixture.mjs'), claudeProviderPath: providerPath, workspace, workspaceRoot: workspace, stateDir: join(root, 'sessions'), bridgePath: join(root, 'phone.json') };
  const backend = new Backend(options, record => events.push(record));
  t.after(async () => { await backend.close(); await rm(root, { recursive: true, force: true }); });
  return { backend, options, root, workspace: await realpath(workspace), second: await realpath(second), events };
}
const tick = () => new Promise(resolve => setTimeout(resolve, 30));
async function until(check) { for (let i = 0; i < 100; i++) { if (check()) return; await tick(); } assert.fail('fixture event missing'); }

test('Claude stock stream, tool activity, interrupt and canonical same-home resume never replay', async t => {
  const f = await fixture(t);
  process.env.OLEA_TEST_SECRET = 'must-not-inherit';
  t.after(() => { delete process.env.OLEA_TEST_SECRET; });
  const start = await f.backend.startClaude('claude', false, f.second);
  const launch = JSON.parse(await readFile(join(start.home, 'launch.json'), 'utf8'));
  assert.equal(launch.env.ANTHROPIC_API_KEY, undefined);
  assert.equal(launch.env.OLEA_TEST_SECRET, undefined);
  assert.equal(launch.env.API_MAX_RETRIES, '0');
  assert.equal(launch.env.CLAUDE_CONFIG_DIR, join(start.home, '.claude'));
  assert.ok(launch.args.includes('--session-id'));
  assert.equal(launch.args.includes('--fork-session'), false);
  const settings = await readFile(join(f.options.stateDir, 'claude/claude/settings.json'), 'utf8');
  assert.match(settings, /apiKeyHelper/);
  assert.doesNotMatch(JSON.stringify(launch) + settings, /synthetic-claude-key/);
  assert.equal(claudeMcp('bridge').mcpServers.olea_phone.env.OLEA_BRIDGE_CONFIG, 'bridge');
  assert.deepEqual(claudeSettings(), {});
  assert.deepEqual(await f.backend.claudeCommand('claude', { type: 'get_messages' }), { messages: [] });
  await f.backend.claudeCommand('claude', { type: 'prompt', message: 'wait' });
  await assert.rejects(f.backend.claudeCommand('claude', { type: 'prompt', message: 'second' }), /turn_active/);
  await until(() => f.events.some(record => record.record?.event?.delta?.text === 'fixture reply'));
  await f.backend.claudeCommand('claude', { type: 'abort' });
  const history = await f.backend.claudeCommand('claude', { type: 'get_messages' });
  assert.equal(history.messages[0].content, 'wait');
  assert.equal(history.messages[1].content[0].text, 'fixture reply');
  const transcript = join(start.home, '.claude/projects/fixture', `${start.sessionId}.jsonl`);
  await appendFile(transcript, [
    { type: 'user', uuid: 'abandoned', parentUuid: 'assistant-1', message: { role: 'user', content: 'abandoned branch' } },
    { type: 'user', uuid: 'active', parentUuid: 'assistant-1', message: { role: 'user', content: 'active branch' } },
    { type: 'assistant', uuid: 'sidechain', parentUuid: 'abandoned', isSidechain: true, message: { role: 'assistant', content: 'sidechain' } },
  ].map(record => JSON.stringify(record) + '\n').join(''));
  const branched = await f.backend.claudeCommand('claude', { type: 'get_messages' });
  assert.deepEqual(branched.messages.map(message => typeof message.content === 'string' ? message.content : message.content[0].text), ['wait', 'fixture reply', 'active branch']);
  await f.backend.stop('claude');
  await assert.rejects(f.backend.start('claude', true, f.second), /session_identity_mismatch/);
  await assert.rejects(f.backend.startClaude('claude', true, f.workspace), /session_identity_mismatch/);
  await assert.rejects(f.backend.startClaude('claude', false, f.second), /resume_required/);
  const resumed = await f.backend.startClaude('claude', true, f.second);
  assert.equal(resumed.sessionId, start.sessionId);
  assert.equal(resumed.home, start.home);
  const resumedLaunch = JSON.parse(await readFile(join(start.home, 'launch.json'), 'utf8'));
  assert.ok(resumedLaunch.args.includes('--resume'));
  assert.equal((await readFile(join(start.home, 'submissions.txt'), 'utf8')).trim().split('\n').length, 1);
  await f.backend.start('pi');
  await assert.rejects(f.backend.startClaude('third'), /session_limit/);
});

test('reserved Claude identity reopens before first prompt; uncertain delivery cannot create a fresh session', async t => {
  const f = await fixture(t);
  const start = await f.backend.startClaude('reserved');
  await f.backend.stop('reserved');
  assert.equal((await f.backend.startClaude('reserved', true)).sessionId, start.sessionId);
  await f.backend.claudeCommand('reserved', { type: 'prompt', message: 'die' });
  await until(() => f.backend.status().length === 0);
  await assert.rejects(f.backend.startClaude('reserved', true), /resume_history_missing/);
  assert.equal((await readFile(join(start.home, 'submissions.txt'), 'utf8')).trim().split('\n').length, 1);
  const checkpoint = join(f.options.stateDir, 'claude/reserved/session.json');
  const saved = JSON.parse(await readFile(checkpoint, 'utf8')); saved.home += '-copy';
  await writeFile(checkpoint, JSON.stringify(saved));
  await assert.rejects(f.backend.startClaude('reserved', true), /resume_identity_mismatch/);
});

test('stop and close own Claude startup before publication', async t => {
  const f = await fixture(t);
  const entered = Promise.withResolvers(), release = Promise.withResolvers();
  t.after(() => release.resolve());
  const save = f.backend.saveIdentity.bind(f.backend);
  f.backend.saveIdentity = async (...args) => { entered.resolve(); await release.promise; return save(...args); };
  const starting = f.backend.startClaude('pending');
  const rejection = assert.rejects(starting, /start_cancelled/);
  await entered.promise;
  await assert.rejects(f.backend.start('pending'), /already_running/);
  const stopping = f.backend.stop('pending');
  release.resolve(); await Promise.all([rejection, stopping]);
  assert.deepEqual(f.backend.status(), []);
  f.backend.saveIdentity = save;
  const childEntered = Promise.withResolvers(), childRelease = Promise.withResolvers();
  const originalStart = ClaudeSession.start;
  let pid;
  ClaudeSession.start = async (...args) => {
    const result = await originalStart(...args);
    pid = result.instance.process.child.pid;
    childEntered.resolve(); await childRelease.promise;
    return result;
  };
  try {
    const childStart = assert.rejects(f.backend.startClaude('child'), /start_cancelled/);
    await childEntered.promise;
    const childStop = f.backend.stop('child');
    process.kill(pid, 0);
    childRelease.resolve();
    await Promise.all([childStart, childStop]);
    assert.throws(() => process.kill(pid, 0), { code: 'ESRCH' });
  } finally { childRelease.resolve(); ClaudeSession.start = originalStart; }
  const enteredAgain = Promise.withResolvers(), releaseAgain = Promise.withResolvers();
  t.after(() => releaseAgain.resolve());
  const workspace = f.backend.workspace.bind(f.backend);
  f.backend.workspace = async (...args) => { enteredAgain.resolve(); await releaseAgain.promise; return workspace(...args); };
  const secondStart = assert.rejects(f.backend.startClaude('closing'), /backend_closed/);
  await enteredAgain.promise;
  const closing = f.backend.close(); releaseAgain.resolve();
  await Promise.all([secondStart, closing]);
  assert.deepEqual(f.backend.status(), []);
});

test('Claude auth helper exposes only the validated API key to stock CLI and installation failure preserves agent identity', async t => {
  const f = await fixture(t);
  const helper = join(import.meta.dirname, '../dist/claude-auth.js');
  const success = spawnSync(process.execPath, [helper, f.options.claudeProviderPath], { encoding: 'utf8', env: {} });
  assert.equal(success.status, 0);
  assert.equal(success.stdout, 'synthetic-claude-key');
  assert.equal(success.stderr, '');
  await writeFile(f.options.claudeProviderPath, JSON.stringify({ baseUrl: 'http://invalid.test', apiKey: 'synthetic-claude-key', model: 'model' }));
  const invalid = spawnSync(process.execPath, [helper, f.options.claudeProviderPath], { encoding: 'utf8', env: {} });
  assert.equal(invalid.status, 1);
  assert.equal(invalid.stdout + invalid.stderr, '');
  f.options.claudeProviderPath = undefined;
  f.options.claudeEntry = join(f.root, 'not-installed');
  await assert.rejects(f.backend.startClaude('missing'), /claude_not_installed/);
  await assert.rejects(f.backend.start('missing'), /session_identity_mismatch/);
});
