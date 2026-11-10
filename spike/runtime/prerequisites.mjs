// Original source MIT. Runs in Linux under the Kotlin-owned process tree.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { lookup } from 'node:dns/promises';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
const report = { scope: 'android-service-supervised-linux', pid: process.pid, ppid: process.ppid, node: process.version, arch: process.arch, cases: [] };
async function check(name, action) {
  try { const detail = await action(); report.cases.push({ name, status: 'pass', ...detail }); }
  catch (error) { report.cases.push({ name, status: 'fail', reason: error.code ?? 'assertion_failed' }); }
}
function run(executable, args) {
  const result = spawnSync(executable, args, { encoding: 'utf8', timeout: 45000, maxBuffer: 65536 });
  assert.equal(result.status, 0); return result.stdout.trim();
}
await mkdir('/workspace/prerequisites', { recursive: true });
await check('shell', () => ({ result: run('/bin/sh', ['-c', 'test "$(printf olea)" = olea; uname -m']) }));
await check('node_and_child_process', () => ({ result: run(process.execPath, ['-e', "const a=require('assert');const c=require('child_process').spawnSync(process.execPath,['-e','console.log(6*7)'],{encoding:'utf8'});a.equal(c.status,0);a.equal(c.stdout.trim(),'42');console.log('CHILD_OK')"]) }));
await check('git', () => {
  const directory = `/workspace/prerequisites/git-${randomUUID()}`;
  const result = run('/bin/sh', ['-ec', `mkdir '${directory}'; cd '${directory}'; git init -q; git config user.name Olea; git config user.email olea@example.invalid; printf hello > test.txt; git add test.txt; git commit -qm fixture; git show HEAD:test.txt`]);
  assert.equal(result, 'hello');
  return { version: run('git', ['--version']), result };
});
await check('dns', async () => ({ address: (await Promise.race([lookup('registry.npmjs.org'), new Promise((_, reject) => setTimeout(() => reject(Object.assign(Error(), { code: 'DNS_TIMEOUT' })), 10000))])).address }));
await check('tls', async () => { const response = await fetch('https://registry.npmjs.org/is-number/7.0.0', { signal: AbortSignal.timeout(20000) }); assert.equal(response.status, 200); assert.equal((await response.json()).version, '7.0.0'); return { certificateValidation: 'default-enabled' }; });
await check('dependency_install', async () => {
  run('npm', ['install', '--prefix', '/workspace/prerequisites', '--no-audit', '--no-fund', '--fetch-retries=0', '--fetch-timeout=30000', 'is-number@7.0.0']);
  return { result: run(process.execPath, ['-e', "const a=require('assert');const n=require('/workspace/prerequisites/node_modules/is-number');a(n('42'));a(!n('olea'));console.log('PACKAGE_OK')"]) };
});
await check('real_android_uid', async () => {
  const status = await readFile('/proc/self/status', 'utf8');
  return { uidLine: status.match(/^Uid:.*$/m)?.[0], note: 'PRoot emulates uid0 inside syscalls; /proc independently reports Android app UID' };
});
await writeFile('/workspace/prerequisites/results.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ type: 'prerequisites', cases: report.cases, pid: process.pid }));
if (report.cases.some(item => item.status === 'fail')) process.exitCode = 1;
