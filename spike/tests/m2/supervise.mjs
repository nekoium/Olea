// SPDX-License-Identifier: MIT
// Development payload: Android execution belongs exclusively to the runtime lease owner.
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { observeProcess } from './assertions.mjs';
export async function sampleResources(pids, proc = '/proc') {
  if (!Array.isArray(pids) || !pids.length || pids.length > 256 || new Set(pids).size !== pids.length) throw Error('invalid_resource_roots');
  const processes = [];
  for (const pid of pids) {
    const identity = await observeProcess(pid, proc);
    if (identity.status !== 'observed') { processes.push(identity); continue; }
    let pssKiB = null;
    try { pssKiB = Number((await readFile(`${proc}/${pid}/smaps_rollup`, 'utf8')).match(/^Pss:\s+(\d+)/m)?.[1] ?? NaN); if (!Number.isFinite(pssKiB)) pssKiB = null; } catch {}
    const after = await observeProcess(pid, proc);
    if (after.status !== 'observed' || after.startTime !== identity.startTime || after.realUid !== identity.realUid) processes.push({ pid, status: 'unverifiable', reason: 'identity_changed_during_sample' });
    else processes.push({ ...after, pssKiB });
  }
  const observed = processes.filter(p => p.status === 'observed');
  return { processes, observedRssSubtotalKiB: observed.reduce((s, p) => s + (p.rssKiB ?? 0), 0), observedPssSubtotalKiB: observed.reduce((s, p) => s + (p.pssKiB ?? 0), 0), completeRequestedSet: observed.length === pids.length && observed.every(p => p.pssKiB !== null && p.rssKiB !== null), limitations: 'Explicit requested PID snapshot, not all app processes or peak; RSS double-counts shared pages; missing/denied PSS is unknown, never zero-cost.' };
}
export function supervise(executable, args, { cwd, timeoutMs = 30000, idleMs = 45000, maxBytes = 1048576, frameBytes = 262144 } = {}) {
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 240000 || !Number.isSafeInteger(idleMs) || idleMs < 1 || idleMs > 45000 || !Number.isSafeInteger(maxBytes) || maxBytes < 1 || maxBytes > 1048576 || !Number.isSafeInteger(frameBytes) || frameBytes < 1 || frameBytes > 262144) throw Error('invalid_bounds');
  return new Promise(resolve => {
    const started = performance.now();
    const environment = Object.fromEntries(['PATH', 'SystemRoot', 'HOME', 'TMPDIR', 'TEMP'].filter(k => process.env[k]).map(k => [k, process.env[k]]));
    const child = spawn(executable, args, { cwd, env: environment, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
    let bytes = 0, lineBytes = 0, reason, settled = false, firstOutputMs = null, last = Date.now();
    const digest = createHash('sha256');
    const terminate = why => { if (reason) return; reason = why; child.kill('SIGKILL'); };
    const settle = (code, signal) => {
      if (settled) return; settled = true; clearTimeout(wall); clearTimeout(pipeTimer); clearInterval(idle);
      child.stdout.destroy(); child.stderr.destroy();
      resolve({ pid: child.pid ?? null, code, signal, reason: reason ?? (code === 0 ? 'completed' : 'nonzero_exit'), durationMs: performance.now() - started, firstOutputMs, observedBytes: bytes, retainedBytes: 0, boundedOutputSha256: digest.digest('hex'), outputTruncated: reason === 'output_limit', ownedRootExitObserved: child.exitCode !== null || child.signalCode !== null, descendantsExitVerified: false });
    };
    const wall = setTimeout(() => terminate('wall_deadline'), timeoutMs);
    const idle = setInterval(() => { if (Date.now() - last >= idleMs) terminate('idle_deadline'); }, Math.min(50, idleMs));
    let pipeTimer;
    const output = (chunk, framing) => {
      last = Date.now(); if (firstOutputMs === null) firstOutputMs = performance.now() - started;
      const previous = bytes; bytes += chunk.length;
      if (previous < maxBytes) digest.update(chunk.subarray(0, maxBytes - previous));
      if (bytes > maxBytes) terminate('output_limit');
      if (framing) for (const byte of chunk) { lineBytes = byte === 10 ? 0 : lineBytes + 1; if (lineBytes > frameBytes) { terminate('frame_limit'); break; } }
    };
    child.stdout.on('data', chunk => output(chunk, true));
    child.stderr.on('data', chunk => output(chunk, false));
    child.on('error', () => { reason = 'spawn_failed'; settle(null, null); });
    child.on('exit', (code, signal) => { pipeTimer = setTimeout(() => settle(code, signal), 2000); });
    child.on('close', (code, signal) => settle(code, signal));
  });
}
