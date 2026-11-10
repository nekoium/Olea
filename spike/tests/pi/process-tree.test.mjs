// SPDX-License-Identifier: MIT
import test from 'node:test';
import assert from 'node:assert/strict';
import { signalOwnedProcess, snapshotOwnedTree } from '../../backend/dist/process-tree.js';

function fixture() {
  const records = new Map([
    [100, { parent: 1, uid: 42, start: '10' }],
    [101, { parent: 100, uid: 42, start: '11' }],
    [102, { parent: 101, uid: 42, start: '12' }],
    [103, { parent: 1, uid: 42, start: '13' }],
    [104, { parent: 100, uid: 99, start: '14' }],
    [105, { parent: 104, uid: 42, start: '15' }],
  ]);
  const io = {
    list: async () => [...records.keys()].map(String),
    owner: async pid => pid === 'self' ? 42 : records.get(pid).uid,
    record: async pid => {
      const item = records.get(pid);
      return `${pid} (process (name)) ${['S', String(item.parent), '999', '999', ...Array(15).fill('0'), item.start].join(' ')}`;
    },
  };
  return { records, io };
}

test('host-only: numeric parent map finds descendants without task children and excludes foreign/unrelated processes', async () => {
  const { io } = fixture();
  const tree = await snapshotOwnedTree(100, io);
  assert.deepEqual(tree.map(record => record.pid), [100, 101, 102]);
  const signals = [];
  for (const identity of [...tree].reverse()) await signalOwnedProcess(identity, 'SIGTERM', io, (pid, signal) => signals.push({ pid, signal }));
  assert.deepEqual(signals.map(item => item.pid), [102, 101, 100]);
  assert(signals.every(item => item.pid > 0));
});

test('host-only: UID changes and PID reuse prevent signals even when the process group is shared', async () => {
  const { io, records } = fixture();
  const tree = await snapshotOwnedTree(100, io);
  const sent = [];
  records.get(102).start = '999';
  await assert.rejects(signalOwnedProcess(tree[2], 'SIGKILL', io, pid => sent.push(pid)), /cleanup_signal_unverifiable/);
  records.get(101).uid = 99;
  await assert.rejects(signalOwnedProcess(tree[1], 'SIGKILL', io, pid => sent.push(pid)), /cleanup_signal_unverifiable/);
  assert.deepEqual(sent, []);
});

test('host-only: process/descendant/time caps and denied same-UID evidence never yield a complete snapshot', async () => {
  const { io, records } = fixture();
  await assert.rejects(snapshotOwnedTree(100, io, { entries: 2, descendants: 256, milliseconds: 2000 }), /cleanup_scan_limit/);
  await assert.rejects(snapshotOwnedTree(100, io, { entries: 4096, descendants: 1, milliseconds: 2000 }), /descendant_limit/);
  await assert.rejects(snapshotOwnedTree(100, io, { entries: 4096, descendants: 256, milliseconds: -1 }), /cleanup_scan_limit/);
  const record = io.record;
  io.record = async pid => { if (pid === 101) throw Object.assign(new Error(), { code: 'EACCES' }); return record(pid); };
  await assert.rejects(snapshotOwnedTree(100, io), /cleanup_scan_unverifiable/);
  io.record = record;
  records.get(100).uid = 99;
  await assert.rejects(snapshotOwnedTree(100, io), /cleanup_owner_unverifiable/);
});
