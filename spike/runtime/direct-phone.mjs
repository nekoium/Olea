// Original source MIT. Deterministic direct bridge tests; ADB observes only.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { adb, bridge } from './bridge-client.mjs';
const output = process.argv[2] ?? '.setup/android-direct.json';
const report = { started: new Date().toISOString(), cases: [], observations: [] };
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function call(operation, args = {}) {
  const result = await bridge('/phone', { id: `direct-${report.observations.length}`, operation, args });
  report.observations.push({ at: new Date().toISOString(), operation, args, result });
  assert.equal(result.ok, true, JSON.stringify(result)); return result.result;
}
function foreground() {
  const text = adb(['shell', 'dumpsys', 'activity', 'activities']);
  return text.split('\n').filter(line => /topResumedActivity|mResumedActivity/.test(line)).join('\n').trim();
}
async function check(name, action) {
  try { const detail = await action(); report.cases.push({ name, status: 'pass', ...detail }); }
  catch (error) { report.cases.push({ name, status: 'fail', reason: String(error.message).slice(0, 1000) }); }
}
await check('authentication_rejects_missing_token', async () => {
  const response = await fetch('http://127.0.0.1:8766/health', { signal: AbortSignal.timeout(5000) }); assert.equal(response.status, 401);
});
await check('accessibility_launcher_click_foregrounds_fixture', async () => {
  await call('global_action', { action: 'home' }); await delay(700);
  const before = foreground(); assert(!before.includes('dev.olea.fixture'));
  let tree = await call('accessibility_tree');
  let node = tree.nodes.find(item => item.text === 'Olea Fixture' || item.description === 'Olea Fixture');
  if (!node) {
    await call('swipe'); await delay(700); tree = await call('accessibility_tree');
    node = tree.nodes.find(item => item.text === 'Olea Fixture' || item.description === 'Olea Fixture');
  }
  assert(node, 'launcher fixture node missing');
  const clickedAt = new Date().toISOString(); const clicked = await call('accessibility_click', { nodeId: node.nodeId });
  assert.equal(clicked.action, 'ACTION_CLICK'); await delay(700);
  const after = foreground(); assert(after.includes('dev.olea.fixture'));
  return { before, clickedAt, nodeId: node.nodeId, after, independentlyObservedAt: new Date().toISOString() };
});
await check('fixture_uid_private_state_not_readable_by_host_uid', async () => {
  let denied = false;
  try { adb(['shell', 'run-as', 'dev.olea.spike', 'cat', '/data/user/0/dev.olea.fixture/files/oracle-value.txt'], { stdio: ['ignore', 'pipe', 'pipe'] }); } catch { denied = true; }
  assert(denied); return { appUidBoundaryDeniedRead: true };
});
await check('stop_revokes_phone_actions', async () => {
  await call('stop');
  const rejected = await bridge('/phone', { id: 'after-stop', operation: 'accessibility_tree', args: {} });
  assert.equal(rejected.ok, false); assert.equal(rejected.error.code, 'PHONE_STOPPED');
});
await mkdir(output.replace(/[/\\][^/\\]+$/, ''), { recursive: true });
await writeFile(output, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report.cases, null, 2));
if (report.cases.some(item => item.status !== 'pass')) process.exitCode = 1;
