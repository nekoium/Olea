// SPDX-License-Identifier: MIT
// Stock deterministic command/exec, no provider credentials or model requests.
import { mkdir, mkdtemp, readFile, writeFile, access } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { CodexProcess } from '../../backend/dist/codex-process.js';
import { codexConfig } from '../../backend/dist/codex-session.js';
const [entryArg, outputArg] = process.argv.slice(2);
const root = resolve('.setup/codex-sandbox-preflight'); await mkdir(root, { recursive: true });
const attempt = await mkdtemp(join(root, 'attempt-')), workspace = join(attempt, 'workspace'), home = join(attempt, 'home');
await mkdir(workspace); await mkdir(home);
await writeFile(join(home, 'config.toml'), codexConfig('gpt-6.1-terra'));
const env = {};
for (const key of ['PATH', 'Path', 'SystemRoot', 'WINDIR', 'COMSPEC', 'PATHEXT', 'TEMP', 'TMP', 'HOME', 'USERPROFILE']) if (process.env[key]) env[key] = process.env[key];
env.CODEX_HOME = home;
const js = /\.[cm]?js$/.test(entryArg);
const child = new CodexProcess({ command: js ? process.execPath : resolve(entryArg), args: js ? [resolve(entryArg)] : [], cwd: workspace, env });
const report = { attempt, platform: process.platform, noModelRequests: true, requestedSandbox: process.platform === 'win32' ? 'unelevated' : 'stock Linux workspaceWrite', events: [], results: {} };
child.on('record', record => { if (record.method) report.events.push(record.method); if (record.error) report.rpcError = record.error; });
try {
  report.initialized = await child.initialize();
  const policy = { type: 'workspaceWrite', writableRoots: [workspace], networkAccess: false, excludeTmpdirEnvVar: true, excludeSlashTmp: true };
  const outputCap = process.platform === 'win32' ? {} : { outputBytesCap: 4096 };
  report.outputCap = process.platform === 'win32' ? 'custom outputBytesCap unsupported; stock default plus adapter frame256KiB' : '4096';
  const target = join(workspace, 'inside.txt'), outside = join(attempt, 'outside.txt');
  report.results.inside = await child.request('command/exec', { command: [process.execPath, '-e', `require('fs').writeFileSync(${JSON.stringify(target)},'INSIDE_OK');process.stdout.write('INSIDE_OK')`], cwd: workspace, timeoutMs: 10000, ...outputCap, sandboxPolicy: policy }, 15000);
  try { report.results.outside = await child.request('command/exec', { command: [process.execPath, '-e', `require('fs').writeFileSync(${JSON.stringify(outside)},'OUTSIDE_BAD')`], cwd: workspace, timeoutMs: 10000, ...outputCap, sandboxPolicy: policy }, 15000); }
  catch (error) { report.results.outside = { rpcError: error.message }; }
  report.insideExact = await readFile(target, 'utf8') === 'INSIDE_OK';
  try { await access(outside); report.outsideDenied = false; } catch { report.outsideDenied = true; }
  report.status = report.insideExact && report.outsideDenied && report.results.inside.exitCode === 0 && report.results.outside.exitCode !== 0 ? 'pass' : 'fail';
} catch (error) { report.status = 'blocked'; report.error = error.message; }
finally {
  report.stop = await child.stop();
  try { report.sandboxLog = (await readFile(join(home, '.sandbox', `sandbox.${new Date().toISOString().slice(0,10)}.log`), 'utf8')).slice(0, 16384); } catch {}
  await writeFile(outputArg, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ output: outputArg, status: report.status, error: report.error }));
}
