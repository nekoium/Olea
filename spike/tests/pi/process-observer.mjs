// SPDX-License-Identifier: MIT
import { readFile } from 'node:fs/promises';

export function parseProcessStat(text) {
  const end = text.lastIndexOf(')');
  if (end < 0) throw new Error('invalid_proc_stat');
  const fields = text.slice(end + 2).trim().split(/\s+/);
  if (fields.length < 20 || !/^\d+$/.test(fields[19])) throw new Error('invalid_proc_stat');
  return { status: 'observed', state: fields[0], parentPid: Number(fields[1]),
    processGroup: Number(fields[2]), sessionId: Number(fields[3]), startTime: fields[19] };
}

export async function readProcess(pid) {
  try { return parseProcessStat(await readFile(`/proc/${pid}/stat`, 'utf8')); }
  catch (error) {
    if (error.code === 'ENOENT' || error.code === 'ESRCH') return { status: 'absent' };
    return { status: 'unverifiable', reason: /^[A-Z_]+$/.test(error.code ?? '') ? error.code : 'invalid_proc_stat' };
  }
}

// SIGKILL delivery and /proc disappearance are asynchronous, especially under PRoot.
// Permission/parse errors never establish exit, and a reused PID is a different process.
export async function waitForProcessExit(pid, startTime, timeoutMs = 2000, observe = readProcess) {
  const deadline = performance.now() + timeoutMs;
  const observations = [];
  while (true) {
    const state = await observe(pid);
    observations.push(state);
    if (state.status === 'unverifiable') return { exited: false, reason: 'process_observation_unverifiable', observations };
    if (state.status === 'absent' || state.state === 'Z' || state.startTime !== startTime)
      return { exited: true, observations };
    if (performance.now() >= deadline) return { exited: false, reason: 'descendant_still_running', observations };
    await new Promise(resolve => setTimeout(resolve, Math.min(100, Math.max(1, deadline - performance.now()))));
  }
}
