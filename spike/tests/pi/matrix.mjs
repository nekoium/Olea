// SPDX-License-Identifier: MIT
// Sequential ordinary npm installs into ONE prefix on ONE fixed Linux base.
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';

const root = resolve(import.meta.dirname, '../../..');
const outputDir = resolve(process.env.OLEA_MATRIX_DIR ?? join(root, '.setup', 'pi-matrix'));
await mkdir(outputDir, { recursive: true, mode: 0o700 });
const prefix = join(outputDir, 'stock');
const report = { platform: process.platform, arch: process.arch, node: process.version,
  scope: process.platform === 'linux' ? 'linux-runtime' : 'host-only',
  policy: 'stock npm package; normal install scripts; fixed Node/base; same prefix for ordinary upgrades',
  installs: [], runs: [] };
async function run(executable, args, env, timeoutMs) {
  return new Promise(resolve => {
    const child = spawn(executable, args, { env, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let bytes = 0; let timedOut = false; let outputLimit = false;
    const hash = createHash('sha256');
    for (const stream of [child.stdout, child.stderr]) stream.on('data', chunk => {
      bytes += chunk.length;
      if (bytes > 256 * 1024) { outputLimit = true; child.kill('SIGKILL'); } else hash.update(chunk);
    });
    const timer = setTimeout(() => { timedOut = true; child.kill('SIGKILL'); }, timeoutMs);
    child.on('error', () => { clearTimeout(timer); resolve({ status: 'blocked', reason: 'spawn_failed', bytes }); });
    child.on('exit', code => { clearTimeout(timer); resolve({ status: code === 0 ? 'pass' : 'fail', code, timedOut, outputLimit, bytes, outputSha256: hash.digest('hex') }); });
  });
}
const npmEntry = process.env.npm_execpath;
// Supply an absolute npm-cli.js on Windows; Linux can use normal npm executable.
const npmCommand = npmEntry ? process.execPath : process.platform === 'win32' ? 'npm.cmd' : 'npm';
for (const version of ['0.74.0', '1.0.0', '1.5.2']) {
  const installArgs = ['install', '--prefix', prefix, '--no-audit', '--no-fund', '--fetch-retries=0', '--fetch-timeout=45000', `@earendil-works/pi-coding-agent@${version}`];
  const started = performance.now();
  const install = await run(npmCommand, npmEntry ? [npmEntry, ...installArgs] : installArgs, process.env, 240_000);
  report.installs.push({ version, ...install, durationMs: Math.round(performance.now() - started) });
  console.log(JSON.stringify({ phase: 'install', version, ...install }));
  if (install.status !== 'pass') { report.runs.push({ version, status: 'blocked', reason: 'install_failed' }); continue; }
  const packageDir = join(prefix, 'node_modules', '@earendil-works', 'pi-coding-agent');
  const packageJson = JSON.parse(await readFile(join(packageDir, 'package.json'), 'utf8'));
  const bin = typeof packageJson.bin === 'string' ? packageJson.bin : packageJson.bin.pi;
  const reportPath = join(outputDir, `pi-${version}.json`);
  const result = await run(process.execPath, [join(root, 'spike/tests/pi/run-stock.mjs')], {
    ...process.env, OLEA_PI_ENTRY: join(packageDir, bin), OLEA_PI_VERSION: version,
    OLEA_WORKSPACE: join(outputDir, 'workspace'), OLEA_STATE_DIR: join(outputDir, 'sessions'), OLEA_REPORT: reportPath,
    // Phone acceptance once on baseline. Earlier versions still register phone tools.
    OLEA_RUN_PHONE: version === '1.5.2' ? process.env.OLEA_RUN_PHONE ?? '0' : '0',
  }, 600_000);
  report.runs.push({ version, actualPackageVersion: packageJson.version, engines: packageJson.engines,
    license: packageJson.license, cliRelativePath: bin, reportPath, ...result });
  console.log(JSON.stringify({ phase: 'run', version, ...result }));
  await writeFile(join(outputDir, 'matrix.json'), JSON.stringify(report, null, 2) + '\n');
}
await writeFile(join(outputDir, 'matrix.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
if (report.installs.some(item => item.status !== 'pass') || report.runs.some(item => item.status !== 'pass')) process.exitCode = 1;
