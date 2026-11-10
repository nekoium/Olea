// SPDX-License-Identifier: MIT
// Explicit-PID observation only; Android execution belongs solely to runtime owner.
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { sampleResources } from './supervise.mjs';
export async function collectResources(pids, { samples = 5, intervalMs = 1000, proc = '/proc', context } = {}) {
  if (!['host', 'android-app', 'target28-comparison'].includes(context) || !Number.isSafeInteger(samples) || samples < 1 || samples > 30 || !Number.isSafeInteger(intervalMs) || intervalMs < 1 || intervalMs > 2000) throw Error('invalid_resource_bounds_context');
  const result = { context, startedAt: new Date().toISOString(), requestedPids: pids, samples: [], cpuIntervals: [], status: 'observed', limits: ['Explicit roots only, not complete app UID inventory or peak.', 'RSS shared pages double-counted; PSS sum is observed subtotal.', 'CPU deltas are raw ticks; no unmeasured CLK_TCK conversion.', 'Missing/denied roots and identity changes remain unknown, never zero-cost.', 'No cmdline, environment, signals, permissions or phone operations.'] };
  let previous;
  for (let i = 0; i < samples; i++) {
    const atMs = Date.now();
    const sample = { atMs, ...await sampleResources(pids, proc) };
    result.samples.push(sample);
    const cpuLength = result.cpuIntervals.length;
    if (previous) for (const current of sample.processes) {
      const old = previous.processes.find(p => p.pid === current.pid);
      const same = old?.status === 'observed' && current.status === 'observed' && old.realUid === current.realUid && old.startTime === current.startTime;
      result.cpuIntervals.push({ pid: current.pid, durationMs: atMs - previous.atMs, status: same ? 'observed' : 'unverifiable', deltaRawTicks: same ? current.cpuTicks - old.cpuTicks : null });
    }
    if (Buffer.byteLength(JSON.stringify(result, null, 2)) > 1000000) { result.samples.pop(); result.cpuIntervals.length = cpuLength; result.status = 'incomplete'; result.reason = 'retention_limit'; break; }
    previous = sample;
    if (i + 1 < samples) await new Promise(r => setTimeout(r, intervalMs));
  }
  result.endedAt = new Date().toISOString();
  return result;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  if (process.argv.length !== 5) throw Error('usage: resources.mjs OWNED_PID,OWNED_PID android-app|host|target28-comparison OUTPUT_JSON');
  const pids = process.argv[2].split(',').map(Number);
  await writeFile(process.argv[4], JSON.stringify(await collectResources(pids, { context: process.argv[3] }), null, 2) + '\n', { mode: 0o600 });
}
