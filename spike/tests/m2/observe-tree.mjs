// SPDX-License-Identifier: MIT
// Read-only Linux supervision payload; only runtime lease owner executes on Android.
import { readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { observeProcess } from './assertions.mjs';
export function descendantChains(root, snapshot, maxDescendants = 256) {
  if (root.status !== 'observed') return { status: 'unverifiable', reason: 'root_not_observed', records: [] };
  const identities = new Map(snapshot.filter(p => p.status === 'observed' && p.realUid === root.realUid).map(p => [p.pid, p]));
  const current = identities.get(root.pid);
  if (!current || current.startTime !== root.startTime) return { status: 'unverifiable', reason: 'root_identity_changed', records: [] };
  const owned = new Set([root.pid]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const p of identities.values()) if (!owned.has(p.pid) && owned.has(p.ppid)) {
      owned.add(p.pid); changed = true;
      if (owned.size - 1 > maxDescendants) return { status: 'unverifiable', reason: 'descendant_limit', records: [] };
    }
  }
  return { status: 'observed', records: [...owned].map(pid => identities.get(pid)) };
}
export async function observeTree(rootPid, { durationMs = 120000, intervalMs = 100, maxEntries = 4096, maxRecords = 4096, proc = '/proc', shouldStop = () => false } = {}) {
  if (!Number.isSafeInteger(durationMs) || durationMs < 1 || durationMs > 120000 || intervalMs < 50 || intervalMs > 1000 || maxEntries < 1 || maxEntries > 4096 || maxRecords < 1 || maxRecords > 4096) throw Error('invalid_observer_limits');
  const root = await observeProcess(rootPid, proc);
  const started = Date.now();
  const result = { startedAt: new Date().toISOString(), root, samples: [], limits: { durationMs, intervalMs, maxEntries, maxRecords, retainedBytes: 1048576 }, status: 'observed', limitations: ['Finite numeric /proc snapshots may miss short processes, after-snapshot forks and already-reparented children.', 'PPID/startticks/real UID establish observed ancestry, not tool command semantic content.', 'No signals, cmdline, environ or oracle reads. Sampling itself has overhead.'] };
  let records = 0, retainedBytes = 0;
  while (Date.now() - started < durationMs && !shouldStop()) {
    const names = (await readdir(proc)).filter(n => /^\d+$/.test(n));
    if (names.length > maxEntries) { result.status = 'unverifiable'; result.reason = 'entry_limit'; break; }
    const snapshot = [];
    for (const name of names) {
      if (Date.now() - started >= durationMs || shouldStop()) break;
      snapshot.push(await observeProcess(Number(name), proc));
    }
    if (shouldStop()) break;
    const sample = { atMs: Date.now(), elapsedMs: Date.now() - started, ...descendantChains(root, snapshot) };
    records += sample.records.length;
    retainedBytes += Buffer.byteLength(JSON.stringify(sample));
    if (records > maxRecords || retainedBytes > 1048576) { result.status = 'unverifiable'; result.reason = 'retention_limit'; break; }
    result.samples.push(sample);
    if (sample.status !== 'observed') { result.status = 'unverifiable'; result.reason = sample.reason; break; }
    const remaining = durationMs - (Date.now() - started);
    if (remaining > 0) await new Promise(r => setTimeout(r, Math.min(intervalMs, remaining)));
  }
  result.endedAt = new Date().toISOString();
  return result;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  if (process.argv.length !== 5) throw Error('usage: observe-tree.mjs OWNED_ROOT_PID DURATION_MS OUTPUT_JSON');
  await writeFile(process.argv[4], JSON.stringify(await observeTree(Number(process.argv[2]), { durationMs: Number(process.argv[3]) }), null, 2) + '\n', { mode: 0o600 });
}
