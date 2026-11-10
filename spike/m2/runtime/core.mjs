// Original MIT. No model/provider requests. Run only inside Kotlin-owned modern Linux.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync, readlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { randomBytes, createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { lookup } from 'node:dns/promises';
import https from 'node:https';
const report = { attempt: process.argv[2], startedAt: Date.now(), cases: [] };
const base = `/workspace/${report.attempt}`;
mkdirSync(base, { recursive: false });
function command(bin, args, cwd = base, timeout = 30000) {
  const r = spawnSync(bin, args, { cwd, encoding: 'utf8', timeout, maxBuffer: 65536, env: { ...process.env, GIT_CONFIG_NOSYSTEM: '1' } });
  assert.equal(r.status, 0, `${bin}: ${r.error?.message || r.stderr?.slice(-1500) || r.signal}`);
  return r.stdout;
}
async function check(name, fn) {
  const startedAt = Date.now();
  try { const detail = await fn(); report.cases.push({ name, status: 'pass', startedAt, endedAt: Date.now(), detail }); }
  catch (e) { report.cases.push({ name, status: 'fail', startedAt, endedAt: Date.now(), error: String(e.message).slice(0, 2000) }); }
}
const identity = () => ({ pid: process.pid, ppid: process.ppid, stat: readFileSync('/proc/self/stat', 'utf8').trim(), status: readFileSync('/proc/self/status', 'utf8').split('\n').filter(l => /^(Name|Pid|PPid|Uid|Gid):/.test(l)), domain: readFileSync('/proc/self/attr/current', 'utf8').replaceAll('\0','').trim(), execPath: process.execPath, procExe: readlinkSync('/proc/self/exe'), version: process.version, arch: process.arch, loaderEnvAbsent: !process.env.LD_PRELOAD && !process.env.LD_LIBRARY_PATH });
report.identity = identity();
await check('shell', () => ({ stdout: command('/bin/sh', ['-c', 'set -eu; test "$(printf 42)" = 42; printf SHELL_ASSERT_OK']) }));
await check('nested-node', () => {
  const leaf = `const f=require('fs'); console.log(JSON.stringify({value:42,pid:process.pid,ppid:process.ppid,stat:f.readFileSync('/proc/self/stat','utf8'),uid:f.readFileSync('/proc/self/status','utf8').split('\\n').find(l=>l.startsWith('Uid:'))}));`;
  const child = `const f=require('fs'),c=require('child_process').spawnSync(process.execPath,['-e',${JSON.stringify(leaf)}],{encoding:'utf8'});if(c.status!==0)process.exit(3);console.log(JSON.stringify({pid:process.pid,ppid:process.ppid,stat:f.readFileSync('/proc/self/stat','utf8'),nestedStatus:c.status,nested:JSON.parse(c.stdout)}));`;
  const detail = JSON.parse(command(process.execPath, ['-e', child]));
  assert.equal(detail.ppid, process.pid); assert.equal(detail.nested.ppid, detail.pid);
  assert.equal(detail.nested.value, 42); assert.equal(detail.nestedStatus, 0);
  return { childStatus: 0, ...detail };
});
await check('git-fresh-object', () => {
  const value = randomBytes(24).toString('hex');
  writeFileSync(`${base}/sentinel`, value);
  command('git', ['init', '-q']); command('git', ['add', 'sentinel']);
  command('git', ['-c','user.name=Olea Spike','-c','user.email=spike@invalid.test','commit','-qm','Deterministic M2 fixture']);
  assert.equal(command('git', ['show','HEAD:sentinel']), value);
  return { version: command('git',['--version']).trim(), commit: command('git',['rev-parse','HEAD']).trim(), valueSha256: createHash('sha256').update(value).digest('hex') };
});
await check('dns', async () => await lookup('registry.npmjs.org'));
await check('tls', () => new Promise((resolvePromise, reject) => {
  const req = https.get('https://registry.npmjs.org/is-number/7.0.0', { timeout: 25000 }, res => {
    const authorized = res.socket.authorized;
    let data = ''; res.on('data', b => { data += b; if (data.length > 65536) req.destroy(Error('metadata output bound')); });
    res.on('end', () => { try { assert.equal(res.statusCode, 200); assert.equal(JSON.parse(data).version, '7.0.0'); resolvePromise({ status: res.statusCode, authorized, bytes: Buffer.byteLength(data) }); } catch(e) { reject(e); } });
  }); req.on('timeout', () => req.destroy(Error('TLS deadline'))); req.on('error', reject);
}));
await check('dependency', () => {
  const prefix = `${base}/dependency`; mkdirSync(prefix);
  command('npm', ['install','--prefix',prefix,'--cache','/root/.npm-m2','--fetch-retries=0','--fetch-timeout=25000','--maxsockets=2','--no-audit','--no-fund','is-number@7.0.0'], base, 90000);
  const dependency = createRequire(resolve(prefix,'package.json'))('is-number');
  assert.equal(dependency('42'),true); assert.equal(dependency('olea'),false);
  return { version: JSON.parse(readFileSync(`${prefix}/node_modules/is-number/package.json`)).version, input42: true, inputOlea: false };
});
report.endedAt = Date.now();
writeFileSync(`/workspace/${report.attempt}.json`, JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
if (report.cases.some(c => c.status !== 'pass')) process.exitCode=1;
