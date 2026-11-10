// SPDX-License-Identifier: MIT
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseProcessStat, waitForProcessExit } from './process-observer.mjs';

test('host-only: proc parser preserves start identity despite spaces and parentheses in process name', () => {
  const fields = ['R', '10', '11', '12', ...Array(15).fill('0'), '987654'];
  assert.deepEqual(parseProcessStat(`123 (worker (test)) ${fields.join(' ')}`), {
    status: 'observed', state: 'R', parentPid: 10, processGroup: 11, sessionId: 12, startTime: '987654',
  });
  assert.throws(() => parseProcessStat('not a proc record'), /invalid_proc_stat/);
});

test('host-only: exit observer waits for delayed termination and never treats denied observation as exit', async () => {
  let reads = 0;
  const delayed = await waitForProcessExit(123, '99', 500, async () => ++reads === 1
    ? { status: 'observed', state: 'R', startTime: '99' } : { status: 'absent' });
  assert.equal(delayed.exited, true);
  assert.equal(reads, 2);
  const denied = await waitForProcessExit(123, '99', 500, async () => ({ status: 'unverifiable', reason: 'EACCES' }));
  assert.equal(denied.exited, false);
  assert.equal(denied.reason, 'process_observation_unverifiable');
  const live = await waitForProcessExit(123, '99', 0, async () => ({ status: 'observed', state: 'S', startTime: '99' }));
  assert.equal(live.exited, false);
  assert.equal(live.reason, 'descendant_still_running');
  const reused = await waitForProcessExit(123, '99', 0, async () => ({ status: 'observed', state: 'R', startTime: '100' }));
  assert.equal(reused.exited, true);
});
