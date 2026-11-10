// SPDX-License-Identifier: MIT
import { readFile, readdir, stat } from 'node:fs/promises';

export type ProcessIdentity = { pid: number; parent: number; start: string; uid: number };
type ProcIO = { list: () => Promise<string[]>; owner: (pid: number | 'self') => Promise<number>; record: (pid: number) => Promise<string> };
export const procIO: ProcIO = {
  list: () => readdir('/proc'),
  owner: async pid => (await stat(`/proc/${pid}`)).uid,
  record: pid => readFile(`/proc/${pid}/stat`, 'utf8'),
};
function gone(error: any) { return error.code === 'ENOENT' || error.code === 'ESRCH'; }
export async function processIdentity(pid: number, io = procIO): Promise<ProcessIdentity> {
  const uid = await io.owner(pid);
  const text = await io.record(pid);
  const end = text.lastIndexOf(')');
  const fields = text.slice(end + 2).trim().split(/\s+/);
  if (end < 0 || Number(text.slice(0, text.indexOf(' '))) !== pid || !/^\d+$/.test(fields[1] ?? '') || !/^\d+$/.test(fields[19] ?? ''))
    throw new Error('cleanup_stat_unverifiable');
  return { pid, parent: Number(fields[1]), start: fields[19], uid };
}

// Android/PRoot can expose empty task children files. Build the parent map from
// numeric /proc/stat records while the owned Pi is still alive instead.
export async function snapshotOwnedTree(rootPid: number, io = procIO,
  limits = { entries: 4096, descendants: 256, milliseconds: 2000 }): Promise<ProcessIdentity[]> {
  const deadline = performance.now() + limits.milliseconds;
  const checkDeadline = () => { if (performance.now() > deadline) throw new Error('cleanup_scan_limit'); };
  const root = await processIdentity(rootPid, io);
  if (root.uid !== await io.owner('self')) throw new Error('cleanup_owner_unverifiable');
  const names = (await io.list()).filter(name => /^[1-9]\d*$/.test(name));
  if (names.length > limits.entries) throw new Error('cleanup_scan_limit');
  const records = new Map<number, ProcessIdentity>([[rootPid, root]]);
  for (const name of names) {
    checkDeadline();
    const pid = Number(name);
    if (pid === rootPid) continue;
    try {
      if (await io.owner(pid) !== root.uid) continue;
      const record = await processIdentity(pid, io);
      if (record.uid !== root.uid) throw new Error('cleanup_owner_unverifiable');
      records.set(pid, record);
    } catch (error) { if (!gone(error)) throw new Error('cleanup_scan_unverifiable'); }
  }
  const owned = [root];
  const selected = new Set([rootPid]);
  for (let index = 0; index < owned.length; index++) {
    checkDeadline();
    for (const record of records.values()) {
      if (record.parent === owned[index].pid && !selected.has(record.pid)) {
        if (BigInt(record.start) < BigInt(owned[index].start)) throw new Error('cleanup_identity_unverifiable');
        if (owned.length - 1 >= limits.descendants) throw new Error('descendant_limit');
        selected.add(record.pid); owned.push(record);
      }
    }
  }
  const currentRoot = await processIdentity(rootPid, io);
  if (currentRoot.start !== root.start || currentRoot.uid !== root.uid) throw new Error('cleanup_identity_unverifiable');
  checkDeadline();
  return owned;
}

export async function signalOwnedProcess(identity: ProcessIdentity, signal: NodeJS.Signals,
  io = procIO, send: (pid: number, signal: NodeJS.Signals) => unknown = process.kill) {
  try {
    const current = await processIdentity(identity.pid, io);
    if (current.uid !== identity.uid || current.start !== identity.start) throw new Error('cleanup_identity_unverifiable');
    // Positive PID only: a descendant may share a process group with unrelated work.
    send(identity.pid, signal);
  } catch (error) { if (!gone(error)) throw new Error('cleanup_signal_unverifiable'); }
}
