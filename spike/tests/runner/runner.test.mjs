// Original Olea feasibility tooling, MIT.
import test from 'node:test';
import assert from 'node:assert/strict';
import { run, redact } from './process.mjs';
import { buildMatrix, render } from './report.mjs';
import { parseStat, descendants } from '../../probes/resources.mjs';

test('redacts token material while preserving documented flags', () => {
  assert.equal(redact('--ask-for-approval disk-full-access Bearer token'), '--ask-for-approval disk-full-access Bearer token');
  assert.equal(redact('sk-' + 'a'.repeat(30)), '[REDACTED]');
  assert.equal(redact('Authorization: Bearer ' + 'a'.repeat(30)), 'Authorization: [REDACTED] [REDACTED]');
});
test('successful subprocess captures exit and bounded output', async () => {
  const result = await run(process.execPath, ['-e', 'process.stdout.write("fixture-ok");process.stderr.write("warning")']);
  assert.equal(result.exitCode, 0);
  assert.equal(result.stdout, 'fixture-ok');
  assert.equal(result.stderr, 'warning');
});
test('missing executable settles without retry', async () => {
  const result = await run('olea-fixture-missing-command-92fe', []);
  assert.equal(result.spawnError, 'ENOENT');
});
test('deadline terminates the owned child', async () => {
  const result = await run(process.execPath, ['-e', 'setInterval(()=>{},1000)'], { timeoutMs: 150 });
  assert.equal(result.timedOut, true);
  assert.ok(result.elapsedMs < 5000);
});
test('output overflow terminates producer and caps retained bytes', async () => {
  const result = await run(process.execPath, ['-e', 'setInterval(()=>process.stdout.write("a".repeat(8192)),1)'], { maxBytes: 1024, timeoutMs: 5000 });
  assert.equal(result.overflow, true);
  assert.equal(Buffer.byteLength(result.stdout + result.stderr), 1024);
});
test('deadline cleans a task-owned descendant tree', async () => {
  const script = 'const {spawn}=require("node:child_process");const child=spawn(process.execPath,["-e","setInterval(()=>{},1000)"],{stdio:"ignore"});console.log(child.pid);setInterval(()=>{},1000)';
  const result = await run(process.execPath, ['-e', script], { timeoutMs: 700 });
  const descendant = Number(result.stdout.trim());
  assert.ok(Number.isInteger(descendant) && descendant > 1);
  assert.equal(result.timedOut, true);
  let gone = false;
  for (let attempt = 0; attempt < 10; attempt++) {
    try { process.kill(descendant, 0); } catch (error) { if (error.code === 'ESRCH') { gone = true; break; } throw error; }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  assert.ok(gone, 'owned descendant must exit after parent deadline');
});
test('report refuses fake pass, host scope and unpassed prerequisites', () => {
  assert.throws(() => buildMatrix({ assessments: [{ id: 'runtime.baseline', status: 'pass', scope: 'android-emulator' }] }), /independent assertion/);
  assert.throws(() => buildMatrix({ assessments: [{ id: 'runtime.baseline', status: 'pass', scope: 'host-only', evidence: ['fixture'], independentAssertion: 'fixture' }] }), /Scope mismatch/);
  assert.throws(() => buildMatrix({ assessments: [{ id: 'runtime.node', status: 'pass', scope: 'android-emulator', evidence: ['fixture'], independentAssertion: 'fixture' }] }), /prerequisites/);
});
test('whole brief includes every phone category and physical blockers', () => {
  const cases = buildMatrix();
  assert.equal(cases.filter(item => item.id.startsWith('phone.direct.')).length, 7);
  assert.equal(cases.filter(item => item.id.startsWith('phone.agent.')).length, 7);
  assert.ok(cases.filter(item => item.id.startsWith('physical.')).every(item => item.status === 'blocked'));
  assert.ok(cases.some(item => item.id === 'pi.upgrade'));
  assert.ok(cases.some(item => item.id === 'cost.direct-vs-managed'));
});
test('offline HTML escapes evidence and has no remote asset dependencies', () => {
  const { html, matrix } = render({ actualMission: '<script>alert("bad")</script>' });
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(!html.includes('<script>'));
  assert.ok(!/<(?:script|link|img)[^>]*(?:src|href)=/.test(html));
  assert.equal(matrix.judgment, 'insufficient-evidence');
});
test('proc stat names can contain spaces/parentheses; descendants deduplicate roots', () => {
  const fields = Array(22).fill('0');
  fields[0] = 'S'; fields[1] = '12'; fields[11] = '20'; fields[12] = '30'; fields[19] = '400'; fields[21] = '50';
  const record = parseStat(`42 (node (worker)) ${fields.join(' ')}`);
  assert.equal(record.name, 'node (worker)');
  assert.equal(record.ppid, 12);
  assert.equal(record.userTicks, 20);
  assert.equal(record.startTicks, '400');
  assert.equal(record.rssPages, 50);
  assert.deepEqual(descendants([{ pid: 1, ppid: 0 }, { pid: 2, ppid: 1 }, { pid: 3, ppid: 2 }, { pid: 4, ppid: 0 }], [1, 2]).map(item => item.pid), [1, 2, 3]);
});
