// SPDX-License-Identifier: MIT
// Deterministic stock-RPC shutdown reproduction: no prompt or model request.
import { mkdir, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { Backend } from '../../backend/dist/backend.js';
import { readProcess, waitForProcessExit } from './process-observer.mjs';

if (process.platform !== 'linux') throw new Error('linux_proc_required');
if (!process.env.OLEA_PI_ENTRY || !process.env.OLEA_PROVIDER_CONFIG) throw new Error('protected_runtime_configuration_required');
const workspace = resolve(process.env.OLEA_WORKSPACE ?? '.setup/cleanup-workspace');
const stateDir = resolve(process.env.OLEA_STATE_DIR ?? '.setup/cleanup-state');
await mkdir(workspace, { recursive: true });
const session = 'cleanup_' + randomUUID().replaceAll('-', '').slice(0, 10);
const pidPath = join(workspace, session + '.pid');
const report = { scope: 'linux-runtime-cleanup-only', node: process.version, piVersion: process.env.OLEA_PI_VERSION ?? 'unrecorded',
  modelRequests: 0, status: 'fail', faults: [], processEvidence: {} };
const backend = new Backend({ entry: process.env.OLEA_PI_ENTRY, workspace, stateDir }, event => {
  if (event.type === 'fault') report.faults.push({ code: event.code });
});
async function taskChildren(pid) {
  const tasks = await readdir(`/proc/${pid}/task`);
  if (tasks.length > 256) throw new Error('task_observation_limit');
  const result = [];
  for (const task of tasks) {
    try {
      const children = (await readFile(`/proc/${pid}/task/${task}/children`, 'utf8')).trim();
      result.push({ task: Number(task), children: children ? children.split(/\s+/).map(Number).slice(0, 256) : [] });
    } catch (error) { if (error.code !== 'ENOENT') throw new Error('task_observation_unverifiable'); }
  }
  return result;
}
try {
  const started = await backend.start(session);
  const work = backend.command(session, { type: 'bash', command: `sleep 120 & child=$!; printf '%s' "$child" > '${pidPath.replaceAll("'", "'\\''")}'; wait` }).catch(() => undefined);
  let pid;
  for (let attempt = 0; attempt < 50; attempt++) {
    try { pid = Number(await readFile(pidPath, 'utf8')); if (pid > 1) break; } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  if (!(pid > 1)) throw new Error('child_pid_missing');
  const before = await readProcess(pid);
  if (before.status !== 'observed') throw new Error('child_identity_unverifiable');
  report.processEvidence = { backendPid: process.pid, piPid: started.pid, childPid: pid, childBefore: before,
    piBefore: await readProcess(started.pid), piTaskChildren: await taskChildren(started.pid),
    parentBefore: await readProcess(before.parentPid), parentTaskChildren: await taskChildren(before.parentPid) };
  const began = performance.now();
  await backend.stop(session);
  await work;
  report.stopMs = Math.round(performance.now() - began);
  report.processEvidence.immediateAfter = await readProcess(pid);
  const observation = await waitForProcessExit(pid, before.startTime, 2000);
  report.processEvidence.exitObservation = observation;
  report.status = observation.exited && !report.faults.length ? 'pass' : 'fail';
  if (!observation.exited) {
    // Only clean the captured process identity, never a reused PID.
    const latest = await readProcess(pid);
    if (latest.status === 'observed' && latest.startTime === before.startTime) {
      try { process.kill(pid, 'SIGKILL'); report.emergencyCleanupRequested = true; } catch {}
    }
  }
} catch (error) {
  report.reason = /^[a-z_]+$/.test(error.message ?? '') ? error.message : 'probe_runtime_failure';
} finally {
  await backend.close();
  report.finalSessionCount = backend.status().length;
  await rm(pidPath, { force: true });
  const output = JSON.stringify(report, null, 2) + '\n';
  if (process.env.OLEA_REPORT) await writeFile(process.env.OLEA_REPORT, output, { mode: 0o600 });
  console.log(output);
}
if (report.status !== 'pass') process.exitCode = 1;
