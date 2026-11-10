// SPDX-License-Identifier: MIT
import assert from 'node:assert/strict';
import { randomBytes, randomInt } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
export function challenge() {
  return { nonce: randomBytes(16).toString('hex'), a: randomInt(101, 1000), b: randomInt(1001, 2000), file: `m2-${randomBytes(12).toString('hex')}.json` };
}
export function unixPrompt(c) {
  return `Use actual Unix tools in this workspace. Install stock is-number@7.0.0 using npm --no-audit --no-fund --save-exact. Run Node, require is-number and assert it accepts '${c.a}' and rejects 'olea'. Spawn a Node child that spawns another Node child computing ${c.a}+${c.b}, assert both exit0 and exact stdout. Only after execution succeeds, write ${c.file} as JSON {nonce:'${c.nonce}',sum:${c.a + c.b},dependency:true,nested:true}. Do not merely write anticipated results. Finish briefly.`;
}
export function assertUnix(workspace, c) {
  const script = `const a=require('node:assert/strict'); const n=require('is-number'); a(n('${c.a}')); a(!n('olea')); const cp=require('node:child_process'); const inner=${JSON.stringify(`process.stdout.write(String(${c.a}+${c.b}))`)}; const outer='const c=require("node:child_process").spawnSync(process.execPath,["-e",'+JSON.stringify(inner)+'],{encoding:"utf8",timeout:5000,maxBuffer:8192});require("node:assert/strict").equal(c.status,0);process.stdout.write(c.stdout)'; const child=cp.spawnSync(process.execPath,['-e',outer],{encoding:'utf8',timeout:10000,maxBuffer:8192}); a.equal(child.status,0); a.equal(child.stdout,'${c.a + c.b}');`;
  const result = spawnSync(process.execPath, ['-e', script], { cwd: workspace, timeout: 15000, maxBuffer: 16384, env: { PATH: process.env.PATH, SystemRoot: process.env.SystemRoot } });
  assert.equal(result.status, 0, 'independent_dependency_nested_child_failed');
  return readFile(resolve(workspace, c.file), 'utf8').then(text => {
    assert.deepEqual(JSON.parse(text), { nonce: c.nonce, sum: c.a + c.b, dependency: true, nested: true });
    return ['file', 'dependency', 'child', 'nested-child'].map(name => ({ name, independent: true, passed: true }));
  });
}
export function assertPhone(p) {
  assert(Number.isSafeInteger(p.hostRealUid) && Number.isSafeInteger(p.fixtureRealUid));
  assert.notEqual(p.hostRealUid, p.fixtureRealUid, 'oracle_same_uid');
  assert.equal(p.hostOracleReadDenied, true);
  assert.equal(p.allRegisteredToolsExcludeOracle, true);
  assert.equal(p.oracleOutsideSharedWorkspace, true);
  assert.equal(p.oracleEqualsUnixValue, true);
  assert.match(p.valueSha256, /^[a-f0-9]{64}$/);
  assert.equal(p.launcher.action, 'ACTION_CLICK');
  assert.equal(p.launcher.beforePackage, p.launcherPackage);
  assert.equal(p.foreground.package, p.targetPackage);
  assert(p.before.atMs < p.launcher.atMs && p.launcher.atMs < p.foreground.atMs && p.foreground.atMs < p.fixtureAction.atMs);
  assert.equal(p.before.package, p.launcherPackage);
  assert.equal(p.interveningLaunchIntentCount, 0);
  assert.equal(p.automaticReplayCount, 0);
  return { independent: true, passed: true, name: 'separate_uid_causal_phone_oracle' };
}
export function assertPreserved(before, after) {
  assert(Object.keys(before).length > 0, 'empty_preservation_inventory');
  for (const [path, hash] of Object.entries(before)) {
    assert.match(hash, /^[a-f0-9]{64}$/);
    assert.equal(after[path], hash, `preservation_mismatch:${path}`);
  }
  return { independent: true, passed: true, name: 'all_previous_hashes_preserved' };
}
export function parseStat(text) {
  const end = text.lastIndexOf(')');
  if (end < 1) throw Error('invalid_stat');
  const f = text.slice(end + 2).trim().split(/\s+/);
  const pid = Number(text.slice(0, text.indexOf(' ')));
  if (!Number.isSafeInteger(pid) || pid < 1 || f.length < 22 || !/^\d+$/.test(f[19])) throw Error('invalid_stat');
  return { pid, state: f[0], ppid: Number(f[1]), startTime: f[19], cpuTicks: Number(f[11]) + Number(f[12]), rssPages: Number(f[21]) };
}
export async function observeProcess(pid, proc = '/proc') {
  if (!Number.isSafeInteger(pid) || pid < 1) throw Error('invalid_pid');
  try {
    const first = parseStat(await readFile(`${proc}/${pid}/stat`, 'utf8'));
    const status = await readFile(`${proc}/${pid}/status`, 'utf8');
    const last = parseStat(await readFile(`${proc}/${pid}/stat`, 'utf8'));
    if (first.startTime !== last.startTime) return { status: 'unverifiable', reason: 'identity_changed', pid };
    const uid = status.match(/^Uid:\s+(\d+)/m);
    if (!uid) return { status: 'unverifiable', reason: 'uid_missing', pid };
    return { status: 'observed', ...last, realUid: Number(uid[1]), rssKiB: Number(status.match(/^VmRSS:\s+(\d+)/m)?.[1] ?? NaN) || null };
  } catch (e) { return { status: e.code === 'ENOENT' ? 'absent' : 'unverifiable', pid }; }
}
export function exited(original, current) {
  assert.equal(original.status, 'observed');
  if (current.status === 'absent') return true;
  if (current.status !== 'observed') return null;
  return current.startTime !== original.startTime || current.realUid !== original.realUid || current.state === 'Z';
}
