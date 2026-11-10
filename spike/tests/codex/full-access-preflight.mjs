// SPDX-License-Identifier: MIT
// Explicit stock full-access candidate. No provider key/model/phone operation.
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { CodexProcess } from '../../backend/dist/codex-process.js';
import { codexConfig } from '../../backend/dist/codex-session.js';
const [entryArg, output, mode] = process.argv.slice(2);
if (mode !== 'full-access') throw new Error('explicit_full_access_argument_required');
await mkdir('.setup/codex-full-access', { recursive: true });
const directory = await mkdtemp(resolve('.setup/codex-full-access/attempt-')), workspace = join(directory, 'workspace'), home = join(directory, 'home');
await mkdir(workspace); await mkdir(home);
await writeFile(join(home, 'config.toml'), codexConfig('gpt-6.1-terra', undefined, 'full-access'));
const env = { CODEX_HOME: home, OLEA_CODEX_PROVIDER_KEY: 'synthetic-noncredential' };
for (const key of ['PATH', 'Path', 'SystemRoot', 'WINDIR', 'COMSPEC', 'PATHEXT', 'TEMP', 'TMP', 'HOME', 'USERPROFILE']) if (process.env[key]) env[key] = process.env[key];
const child = new CodexProcess({ command: /\.[cm]?js$/.test(entryArg) ? process.execPath : resolve(entryArg), args: /\.[cm]?js$/.test(entryArg) ? [resolve(entryArg)] : [], cwd: workspace, env });
const report = { accessMode: 'full-access', stockSandbox: 'danger-full-access', approvalPolicy: 'never', filesystemIsolation: false, noModelRequests: true, noPhoneActions: true, directory, platform: process.platform, results: {} };
child.on('record', record => { if (record.error) report.rpcError = record.error; });
try {
  report.initialized = await child.initialize();
  for (const [name, target] of [['inside', join(workspace, 'inside.txt')], ['outside', join(directory, 'outside.txt')]]) {
    report.results[name] = await child.request('command/exec', { command: [process.execPath, '-e', `if(process.env.OLEA_CODEX_PROVIDER_KEY)throw Error('SECRET_INHERITED');require('fs').writeFileSync(${JSON.stringify(target)},'EXPLICIT_FULL_ACCESS_OK');process.stdout.write('OK')`], cwd: workspace, timeoutMs: 10000, outputBytesCap: 4096, sandboxPolicy: { type: 'dangerFullAccess' } }, 15000);
    report.results[name].independentExact = await readFile(target, 'utf8') === 'EXPLICIT_FULL_ACCESS_OK';
  }
  report.status = Object.values(report.results).every(result => result.exitCode === 0 && result.independentExact) ? 'pass' : 'fail';
} catch (error) { report.status = 'blocked'; report.error = error.message; }
finally { report.stop = await child.stop(); await writeFile(output, JSON.stringify(report, null, 2)); console.log(JSON.stringify({ output, status: report.status, accessMode: 'full-access', filesystemIsolation: false })); }
