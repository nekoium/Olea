// SPDX-License-Identifier: MIT
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile, rm } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { catalog, validateReceipt, assess, render, sha256, verifyArtifacts, readGitArtifact } from './evidence.mjs';
import { challenge, unixPrompt, assertUnix, assertPhone, assertPreserved, parseStat, observeProcess, exited } from './assertions.mjs';
import { descendantChains, observeTree } from './observe-tree.mjs';
import { bounded, runPiSingle, classifyProviderError } from './pi-single.mjs';
import { supervise, sampleResources } from './supervise.mjs';
function receipt(extra = {}) {
  return { attemptId: 'unit-synthetic-1', caseId: 'runtime.modern', context: 'android-app', mode: 'direct', status: 'pass', startedAt: '2026-11-10T00:00:00Z', endedAt: '2026-11-10T00:00:01Z', summary: 'synthetic unit fixture, not execution', artifacts: [{ path: 'x', sha256: 'a'.repeat(64) }], assertions: [{ name: 'unit', independent: true, passed: true }], ...extra };
}
test('complete fixed catalog preserves categories and critical modern/update boundaries', () => {
  const c = catalog();
  assert.equal(new Set(c.map(x => x.id)).size, c.length);
  for (const id of ['runtime.fresh', 'runtime.modern', 'runtime.target28', 'codex.approval', 'codex.rejection', 'cost.output-queue', 'preserve.interrupted-update', 'physical.abi', 'phone.pi.capture', 'phone.codex.capture']) assert(c.some(x => x.id === id));
  for (const row of c) for (const id of row.prerequisites) assert(c.some(x => x.id === id));
});
test('missing receipt stays untested; synthetic report test not workflow outcome', () => assert(assess([]).every(r => r.status === 'untested')));
test('failed prerequisite propagates only unexecuted dependents', () => {
  const result = assess([receipt({ status: 'fail' }), receipt({ attemptId: 'unit-two', caseId: 'unix.shell', status: 'fail' })]);
  assert.equal(result.find(x => x.id === 'unix.shell').status, 'fail');
  assert.equal(result.find(x => x.id === 'unix.node').status, 'blocked');
  assert.equal(result.find(x => x.id === 'provenance').status, 'untested');
});
test('host/run-as/target28/direct cannot promote Android app model acceptance', () => {
  const rows = assess([receipt({ context: 'android-runas' }), receipt({ attemptId: 'host', caseId: 'pi.turn', context: 'host', mode: 'model' }), receipt({ attemptId: 'direct', caseId: 'codex.turn' })]);
  for (const id of ['runtime.modern', 'pi.turn', 'codex.turn']) assert.equal(rows.find(x => x.id === id).status, 'untested');
});
test('first failures and retries retained without duplicate attempts', () => {
  const rows = assess([receipt({ status: 'fail' }), receipt({ attemptId: 'retry' })]);
  assert.equal(rows.find(x => x.id === 'runtime.modern').attempts.length, 2);
  assert.throws(() => assess([receipt(), receipt()]), /duplicate_attempt/);
});
test('passes require independent positive assertions and hashed retained artifact', () => {
  for (const extra of [{ artifacts: [] }, { assertions: [] }, { assertions: [{ name: 'unit', independent: false, passed: true }] }, { assertions: [{ name: 'unit', independent: true, passed: false }] }]) assert.throws(() => validateReceipt(receipt(extra)), /pass_requires/);
});
test('secret-like fields and invalid identity/time/hash rejected', () => {
  for (const extra of [{ apiKey: 'redacted' }, { attemptId: '../x' }, { endedAt: 'bad' }, { startedAt: '2027-01-01' }, { artifacts: [{ path: 'x', sha256: 'no' }] }]) assert.throws(() => validateReceipt(receipt(extra)));
});
test('Git evidence references pin exact retained bytes without merging or path traversal', async () => {
  const path = 'git:d17b79f:spike/tests/m2/pi-single.mjs';
  const bytes = readGitArtifact(path);
  await verifyArtifacts([receipt({ artifacts: [{ path, sha256: sha256(bytes) }] })], '.');
  assert.throws(() => readGitArtifact('git:d17b79f:../private'), /invalid_git_artifact/);
  assert.throws(() => readGitArtifact('git:main:spike/file'), /invalid_git_artifact/);
  await assert.rejects(verifyArtifacts([receipt({ artifacts: [{ path, sha256: 'a'.repeat(64) }] })], '.'), /artifact_hash_mismatch/);
});
test('renderer explicitly distinguishes interim from final snapshots', () => {
  assert(render([]).md.includes('interim expected'));
  assert(render([], 'final').md.includes('final expected'));
  assert.throws(() => render([], 'unknown'), /invalid_report_phase/);
});
test('offline renderer escapes injected HTML and includes untouched cases', () => {
  const result = render([receipt({ summary: '<script src="https://invalid">x</script>' })]);
  assert(!result.html.includes('<script'));
  assert(result.html.includes('&lt;script'));
  assert.equal(result.rows.length, catalog().length);
  assert(result.md.includes('runtime.modern'));
});
async function temporary(run) {
  const base = resolve('.setup/m2-unit'); await mkdir(base, { recursive: true });
  const dir = await mkdtemp(join(base, 'case-'));
  try { return await run(dir); } finally { await rm(dir, { recursive: true, force: true }); }
}
test('artifact verification refuses missing/tampered/outside paths', () => temporary(async dir => {
  await writeFile(join(dir, 'x'), 'actual');
  await verifyArtifacts([receipt({ artifacts: [{ path: 'x', sha256: sha256('actual') }] })], dir);
  await assert.rejects(verifyArtifacts([receipt()], dir), /artifact_hash_mismatch/);
  await assert.rejects(verifyArtifacts([receipt({ artifacts: [{ path: '../x', sha256: 'a'.repeat(64) }] })], dir), /artifact_outside_root/);
}));
test('randomized independent Unix checks run nested child and dependency, reject forged result', () => temporary(async dir => {
  const c = challenge(); assert.notEqual(c.nonce, challenge().nonce);
  await mkdir(join(dir, 'node_modules/is-number'), { recursive: true });
  // Local unit fixture only; this is not a representative upstream dependency install pass.
  await writeFile(join(dir, 'node_modules/is-number/index.js'), 'module.exports=x=>Number.isFinite(Number(x));');
  const artifact = { nonce: c.nonce, sum: c.a + c.b, dependency: true, nested: true };
  await writeFile(join(dir, c.file), JSON.stringify(artifact));
  assert.equal((await assertUnix(dir, c)).length, 4);
  await writeFile(join(dir, c.file), JSON.stringify({ ...artifact, sum: 42 }));
  await assert.rejects(assertUnix(dir, c));
}));
function phone() { return { hostRealUid: 10001, fixtureRealUid: 10002, hostOracleReadDenied: true, allRegisteredToolsExcludeOracle: true, oracleOutsideSharedWorkspace: true, oracleEqualsUnixValue: true, valueSha256: 'a'.repeat(64), launcherPackage: 'launcher', targetPackage: 'fixture', before: { atMs: 1, package: 'launcher' }, launcher: { atMs: 2, action: 'ACTION_CLICK', beforePackage: 'launcher' }, foreground: { atMs: 3, package: 'fixture' }, fixtureAction: { atMs: 4 }, interveningLaunchIntentCount: 0, automaticReplayCount: 0 }; }
test('phone assertions reject same UID, intent-only, wrong ordering and oracle mismatch', () => {
  assert(assertPhone(phone()).passed);
  for (const p of [{ ...phone(), fixtureRealUid: 10001 }, { ...phone(), oracleEqualsUnixValue: false }, { ...phone(), interveningLaunchIntentCount: 1 }, { ...phone(), foreground: { atMs: 1, package: 'fixture' } }]) assert.throws(() => assertPhone(p));
});
test('preservation requires nonempty exact previous hashes; added files allowed', () => {
  const h = 'a'.repeat(64); assert(assertPreserved({ x: h }, { x: h, y: h }).passed);
  assert.throws(() => assertPreserved({}, {}));
  assert.throws(() => assertPreserved({ x: h }, {}));
});
test('process identity uses last comm delimiter, UID and start ticks; unavailable not exit', () => {
  const fields = ['S', '12', ...Array(17).fill('0'), '456', '0', '9'];
  assert.equal(parseStat(`20 (odd ) name) ${fields.join(' ')}`).startTime, '456');
  assert.equal(exited({ status: 'observed', startTime: '1', realUid: 5 }, { status: 'unverifiable' }), null);
  assert.equal(exited({ status: 'observed', startTime: '1', realUid: 5 }, { status: 'observed', startTime: '2', realUid: 5 }), true);
  assert.throws(() => parseStat('bad'));
});
test('process observation retains real UID and missing state', () => temporary(async dir => {
  await mkdir(join(dir, '20'));
  const fields = ['S', '12', ...Array(17).fill('0'), '456', '0', '9'];
  await writeFile(join(dir, '20/stat'), `20 (test) ${fields.join(' ')}`);
  await writeFile(join(dir, '20/status'), 'Uid:\t10001 10001 10001 10001\nVmRSS: 15 kB\n');
  assert.equal((await observeProcess(20, dir)).realUid, 10001);
  assert.equal((await observeProcess(21, dir)).status, 'absent');
}));
test('supervisor bounds timeout, frame flood, aggregate output and secret environment inheritance', async () => {
  const envName = 'OLEA_M2_UNIT_PRIVATE'; process.env[envName] = 'unit-only';
  try {
    const normal = await supervise(process.execPath, ['-e', `if(process.env.${envName})process.exit(9);console.log('ok')`], { timeoutMs: 2000 });
    assert.equal(normal.code, 0); assert.equal(normal.retainedBytes, 0);
    const timeout = await supervise(process.execPath, ['-e', 'setInterval(()=>{},1000)'], { timeoutMs: 50 });
    assert.equal(timeout.reason, 'wall_deadline');
    const frame = await supervise(process.execPath, ['-e', 'process.stdout.write("a".repeat(10000))'], { timeoutMs: 2000, frameBytes: 100 });
    assert.equal(frame.reason, 'frame_limit');
    const output = await supervise(process.execPath, ['-e', 'for(let i=0;i<100;i++)console.log("a".repeat(80))'], { timeoutMs: 2000, maxBytes: 100, frameBytes: 262144 });
    assert.equal(output.reason, 'output_limit'); assert.equal(output.descendantsExitVerified, false);
  } finally { delete process.env[envName]; }
});
test('resource sampler records incomplete roots instead of zero-cost full total', () => temporary(async dir => {
  const r = await sampleResources([20], dir);
  assert.equal(r.completeRequestedSet, false); assert.equal(r.processes[0].status, 'absent');
}));
test('model prompt requests actual 1500ms child timers for observable nested arithmetic', () => {
  const c = challenge(); const prompt = unixPrompt(c);
  assert(prompt.includes('1500 ms')); assert(prompt.includes(`${c.a}+${c.b}`));
  assert(prompt.includes('nested child itself emit exact sum'));
});
test('observer ancestry excludes sibling runner children and rejects PID reuse/UID mismatch/caps', () => {
  const root = { status: 'observed', pid: 20, ppid: 10, realUid: 10001, startTime: '1' };
  const snapshot = [root, { ...root, pid: 21, ppid: 20, startTime: '2' }, { ...root, pid: 22, ppid: 21, startTime: '3' }, { ...root, pid: 30, ppid: 10, startTime: '4' }, { ...root, pid: 31, ppid: 30, startTime: '5' }, { ...root, pid: 40, ppid: 20, realUid: 10002 }];
  assert.deepEqual(descendantChains(root, snapshot).records.map(x => x.pid), [20, 21, 22]);
  assert.equal(descendantChains(root, snapshot, 1).reason, 'descendant_limit');
  assert.equal(descendantChains({ ...root, startTime: 'old' }, snapshot).reason, 'root_identity_changed');
});
test('observer stops with explicit unverifiable root and bounded duration', () => temporary(async dir => {
  const observation = await observeTree(20, { proc: dir, durationMs: 50, intervalMs: 50 });
  assert.equal(observation.status, 'unverifiable');
  assert.equal(observation.reason, 'root_not_observed');
}));
test('provider diagnostics classify only fixed safe codes and never return raw message', () => {
  for (const m of ['ECONNRESET secret', 'Connection error', 'Request timed out', 'UND_ERR_CONNECT_TIMEOUT']) assert.equal(classifyProviderError(m), 'provider_transport');
  assert.equal(classifyProviderError('401 key=private'), 'provider_auth');
  assert.equal(classifyProviderError('429'), 'provider_rate_limit');
  assert.equal(classifyProviderError('private arbitrary response'), 'unclassified_provider_error');
});
test('finite timeout fires and no allocation prevents Pi backend/provider startup', async () => {
  await assert.rejects(bounded(new Promise(() => {}), 10, 'test_deadline'), /test_deadline/);
  await assert.rejects(runPiSingle({ allocatedPrompts: 0 }), /explicit_single_prompt/);
});
