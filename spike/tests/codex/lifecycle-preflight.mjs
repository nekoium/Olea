// SPDX-License-Identifier: MIT
// Stock deterministic command/exec termination. No model request or phone operation.
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { CodexProcess } from '../../backend/dist/codex-process.js';
import { codexConfig } from '../../backend/dist/codex-session.js';
import { processIdentity } from '../../backend/dist/process-tree.js';
const [entryArg, output] = process.argv.slice(2);
await mkdir('.setup/codex-lifecycle', { recursive: true });
const directory = await mkdtemp(resolve('.setup/codex-lifecycle/attempt-')), workspace = join(directory, 'workspace'), home = join(directory, 'home');
await mkdir(workspace); await mkdir(home);
await writeFile(join(home, 'config.toml'), codexConfig('gpt-6.1-terra'));
const env = { CODEX_HOME: home };
for (const key of ['PATH', 'Path', 'SystemRoot', 'WINDIR', 'COMSPEC', 'PATHEXT', 'TEMP', 'TMP', 'HOME', 'USERPROFILE']) if (process.env[key]) env[key] = process.env[key];
const child = new CodexProcess({ command: /\.[cm]?js$/.test(entryArg) ? process.execPath : resolve(entryArg), args: /\.[cm]?js$/.test(entryArg) ? [resolve(entryArg)] : [], cwd: workspace, env });
const report = { directory, noModelRequests: true, noPhoneActions: true, platform: process.platform, events: [], limits: ['command/exec termination is distinct from model turn/interrupt', 'Windows lacks start-time identity proof', 'No guarantee for after-snapshot forks/reparented children'] };
child.on('record', record => { if (record.method) report.events.push(record.method); if (record.error) report.rpcError = record.error; });
let work;
try {
  report.initialized = await child.initialize();
  const target = join(workspace, 'owned-pids.json');
  const code = `const c=require('node:child_process').spawn(process.execPath,['-e','setTimeout(()=>process.exit(0),10000)'],{stdio:'ignore'});require('node:fs').writeFileSync(${JSON.stringify(target)},JSON.stringify({root:process.pid,child:c.pid}));setTimeout(()=>process.exit(0),10000);`;
  work = child.request('command/exec', { processId: 'olea-bounded-command', command: [process.execPath, '-e', code], cwd: workspace, timeoutMs: 12000, sandboxPolicy: { type: 'workspaceWrite', writableRoots: [workspace], networkAccess: false, excludeTmpdirEnvVar: true, excludeSlashTmp: true } }, 15000);
  work.catch(() => {});
  for (let i = 0; i < 60; i++) {
    try { report.pids = JSON.parse(await readFile(target, 'utf8')); break; } catch {}
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  if (!report.pids?.root || !report.pids?.child) throw new Error('tool_pid_file_missing');
  report.before = {};
  if (process.platform === 'linux') for (const [name, pid] of Object.entries(report.pids)) report.before[name] = await processIdentity(pid);
  report.terminate = await child.request('command/exec/terminate', { processId: 'olea-bounded-command' }, 5000);
  try { report.commandResult = await work; } catch (error) { report.commandError = error.message; }
  const start = performance.now(); report.absent = {};
  for (let i = 0; i < 40; i++) {
    for (const [name, pid] of Object.entries(report.pids)) {
      if (process.platform === 'linux') {
        try { const current = await processIdentity(pid); report.absent[name] = current.start !== report.before[name].start || current.uid !== report.before[name].uid; }
        catch (error) { report.absent[name] = error.code === 'ENOENT' || error.code === 'ESRCH'; }
      } else {
        try { process.kill(pid, 0); report.absent[name] = false; } catch (error) { report.absent[name] = error.code === 'ESRCH'; }
      }
    }
    if (Object.values(report.absent).every(Boolean)) break;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  report.observationMs = performance.now() - start;
  report.status = Object.values(report.absent).every(Boolean) ? 'pass' : 'fail';
} catch (error) { report.status = 'blocked'; report.error = error.message; }
finally { report.stop = await child.stop(); if (work) await work.catch(() => {}); await writeFile(output, JSON.stringify(report, null, 2)); console.log(JSON.stringify({ output, status: report.status, error: report.error })); }
