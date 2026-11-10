// Original source MIT. One bounded network retry for each previously failed ordinary update; no 0.74 model rerun.
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { run } from '../tests/runner/process.mjs';
const root = '/opt/olea';
const base = `${root}/.setup/pi-matrix`;
const prefix = `${base}/stock`;
const output = '/workspace/evidence/retry-upgrades';
await mkdir(output, { recursive: true });
const report = { scope: 'android-service-supervised-linux', node: process.version, pid: process.pid, attempts: [] };
async function preservation() {
  const files = [];
  async function visit(directory) {
    for (const item of await readdir(directory, { withFileTypes: true }).catch(() => [])) {
      const file = join(directory, item.name);
      if (item.isDirectory()) await visit(file);
      else if (item.isFile()) files.push({ file, sha256: createHash('sha256').update(await readFile(file)).digest('hex') });
    }
  }
  await visit(`${base}/sessions`);
  const sentinel = await readFile(`${base}/workspace/upgrade-preservation.txt`).catch(() => Buffer.from('missing'));
  return { files, sentinelSha256: createHash('sha256').update(sentinel).digest('hex') };
}
for (const version of ['1.0.0', '1.5.2']) {
  const before = await preservation();
  const install = await run('npm', ['install', '--prefix', prefix, '--no-audit', '--no-fund', '--maxsockets=2', '--fetch-retries=1', '--fetch-timeout=60000', `@earendil-works/pi-coding-agent@${version}`], { timeoutMs: 240000, maxBytes: 65536 });
  const after = await preservation();
  const preserved = before.sentinelSha256 === after.sentinelSha256 && before.files.every(file => after.files.some(other => other.file === file.file && other.sha256 === file.sha256));
  const record = { version, install, preservation: { preserved, existingTranscriptFiles: before.files.length, beforeSentinel: before.sentinelSha256, afterSentinel: after.sentinelSha256 } };
  report.attempts.push(record);
  await writeFile(`${output}/results.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ type: 'upgrade-retry-install', version, exitCode: install.exitCode, timedOut: install.timedOut, preserved }));
  if (install.exitCode !== 0 || install.timedOut || install.overflow || install.pipeClosureTimeout) continue;
  const directory = `${prefix}/node_modules/@earendil-works/pi-coding-agent`;
  const pkg = JSON.parse(await readFile(`${directory}/package.json`, 'utf8'));
  const entry = resolve(directory, typeof pkg.bin === 'string' ? pkg.bin : pkg.bin.pi);
  record.actualVersion = pkg.version;
  record.runner = await run(process.execPath, [`${root}/spike/tests/pi/run-stock.mjs`], { timeoutMs: 600000, maxBytes: 65536, cwd: root,
    env: { ...process.env, OLEA_PI_ENTRY: entry, OLEA_PI_VERSION: version, OLEA_WORKSPACE: `${base}/workspace`, OLEA_STATE_DIR: `${base}/sessions`,
      OLEA_REPORT: `${output}/pi-${version}.json`, OLEA_RUN_PHONE: version === '1.5.2' ? '1' : '0', OLEA_PHONE_TARGET_LABEL: 'Olea Fixture' } });
  await writeFile(`${output}/results.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ type: 'upgrade-retry-run', version, exitCode: record.runner.exitCode }));
}
console.log(JSON.stringify({ type: 'retry-done', attempts: report.attempts.map(record => ({ version: record.version, install: record.install.exitCode, run: record.runner?.exitCode })) }));
