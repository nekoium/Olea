// SPDX-License-Identifier: MIT
// Real stock-Pi runner. Android outcomes require a separate native/ADB oracle report.
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile, access, rm } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { Backend } from '../../backend/dist/backend.js';
import { PiProcess } from '../../backend/dist/pi-process.js';

const entry = process.env.OLEA_PI_ENTRY;
if (!process.env.OLEA_PROVIDER_CONFIG) throw new Error('OLEA_PROVIDER_CONFIG_required');
if (!entry) throw new Error('OLEA_PI_ENTRY_required');
const workspace = resolve(process.env.OLEA_WORKSPACE ?? '.setup/pi-workspace');
const stateDir = resolve(process.env.OLEA_STATE_DIR ?? '.setup/pi-state');
await mkdir(workspace, { recursive: true });
await mkdir(stateDir, { recursive: true, mode: 0o700 });
const report = { scope: process.platform === 'linux' ? 'linux-runtime' : 'host-only',
  platform: process.platform, arch: process.arch, node: process.version,
  piVersion: process.env.OLEA_PI_VERSION ?? 'unrecorded',
  runnerSha256: createHash('sha256').update(await readFile(import.meta.filename)).digest('hex'),
  backendSha256: createHash('sha256').update(await readFile(resolve(import.meta.dirname, '../../backend/dist/backend.js'))).digest('hex'),
  cases: [], phoneCalls: [], measurements: {}, usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }, retryEvents: 0, eventCount: 0 };
const events = new Map();
const backend = new Backend({ entry, workspace, stateDir }, event => {
  if (event.type === 'event') {
    report.eventCount++;
    if (/retry/i.test(event.record.type)) report.retryEvents++;
    const usage = event.record.type === 'message_end' ? event.record.message?.usage : undefined;
    if (usage) for (const key of ['input', 'output', 'cacheRead', 'cacheWrite']) report.usage[key] += Number(usage[key] ?? 0);
    const list = events.get(event.session) ?? [];
    // Retain only bounded metadata, never raw model/provider content.
    if (list.length >= 4096) throw new Error('event_limit');
    list.push({ type: event.record.type, toolName: event.record.toolName });
    events.set(event.session, list);
  }
});
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
async function caseRun(name, run) {
  const start = performance.now();
  try { const detail = await run(); report.cases.push({ name, status: 'pass', durationMs: Math.round(performance.now() - start), ...detail }); }
  catch (error) { report.cases.push({ name, status: 'fail', reason: error?.code === 'ENOENT' ? 'independent_file_missing' : /^[a-z_]+$/.test(error?.message ?? '') ? error.message : 'assertion_or_runtime_failure', durationMs: Math.round(performance.now() - start) }); }
}
async function prompt(session, message, timeout = 120_000) {
  events.set(session, []);
  const before = 0;
  await backend.command(session, { type: 'prompt', message });
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const records = (events.get(session) ?? []).slice(before);
    if (records.filter(record => record.type === 'turn_start').length > 12) {
      await backend.command(session, { type: 'abort' });
      throw new Error('model_turn_limit');
    }
    if (records.some(record => record.type === 'agent_end' || record.type === 'agent_settled')) {
      const state = await backend.command(session, { type: 'get_state' });
      if (!state.data.isStreaming && !state.data.isCompacting) return records;
    }
    await sleep(100);
  }
  await backend.command(session, { type: 'abort' });
  throw new Error('model_deadline');
}
async function sampleMemory() {
  if (process.platform !== 'linux') return { status: 'untested', reason: 'linux_proc_required' };
  const samples = [];
  for (const item of [{ session: 'backend-runner', pid: process.pid }, ...backend.status()]) {
    try {
      const status = await readFile(`/proc/${item.pid}/status`, 'utf8');
      samples.push({ ...item, rssKiB: Number(status.match(/^VmRSS:\s+(\d+)/m)?.[1] ?? 0) });
    } catch { samples.push({ ...item, status: 'unavailable' }); }
  }
  return samples;
}
let mainReady = false;
const mainSession = 'run_' + randomUUID().replaceAll('-', '').slice(0, 10);
const secondSession = mainSession + '_two';
const challenge = randomUUID();
const fileOne = 'unix-' + randomUUID() + '.json';
const fileTwo = 'two-' + randomUUID() + '.txt';
try {
  await caseRun('stock_startup_and_persistent_rpc', async () => {
    const start = await backend.start(mainSession); mainReady = true;
    report.measurements.managedStartupMs = start.startupMs;
    const state = await backend.command(mainSession, { type: 'get_state' });
    assert.equal(state.success, true);
    return { pid: start.pid, startupMs: Math.round(start.startupMs) };
  });
  if (mainReady) {
    await caseRun('model_unix_dependency_child_and_file', async () => {
      const records = await prompt(mainSession,
        `Perform this disposable Unix test using your tools in the current workspace. Remember marker ${challenge} for a later request. Run npm install --no-audit --no-fund --save-exact is-number@7.0.0. Then create ${fileOne} by running Node: require('is-number') must accept '42' and reject 'olea'; spawn a child Node process that computes 6*7; write JSON {packageResult:true,childResult:42,marker:'${challenge}'} only after those assertions pass. Do not merely write anticipated results; execute the dependency and child process. Finish briefly.`, 150_000);
      const data = JSON.parse(await readFile(join(workspace, fileOne), 'utf8'));
      assert.deepEqual(data, { packageResult: true, childResult: 42, marker: challenge });
      // Independent re-execution verifies installed dependency and a fresh child.
      const { spawnSync } = await import('node:child_process');
      const check = spawnSync(process.execPath, ['-e', "const a=require('assert');const n=require('is-number');a(n('42'));a(!n('olea'));const c=require('child_process').spawnSync(process.execPath,['-e','process.stdout.write(String(6*7))'],{encoding:'utf8'});a.strictEqual(c.status,0);a.strictEqual(c.stdout,'42');"], { cwd: workspace, timeout: 15_000, maxBuffer: 8192 });
      assert.equal(check.status, 0);
      assert(records.some(record => record.type === 'tool_execution_start'));
      return { independentDependencyAssertion: true, independentChildAssertion: true, independentFileAssertion: true };
    });
    await caseRun('restart_resume_without_replaying_actions', async () => {
      await backend.command(mainSession, { type: 'get_state' });
      await backend.stop(mainSession); await backend.start(mainSession, true);
      // Read transcript through stock RPC, without asking the model to repeat a phone action.
      const messages = await backend.command(mainSession, { type: 'get_messages' });
      assert(JSON.stringify(messages.data).includes(challenge));
      return { persistedTranscriptVerified: true, uncertainActionsReplayed: false };
    });
    await caseRun('two_persistent_sessions', async () => {
      const start = await backend.start(secondSession);
      assert.equal(backend.status().length, 2);
      const parallelFile = 'parallel-' + randomUUID() + '.txt';
      await Promise.all([
        prompt(secondSession, `Use a shell tool to run a Node child process that writes the exact text OLEA_TWO_OK to ${fileTwo}. Do the work, then reply briefly.`),
        prompt(mainSession, `Use a shell tool to write the exact text OLEA_PARALLEL_OK to ${parallelFile} in this workspace. Finish briefly.`),
      ]);
      assert.equal(await readFile(join(workspace, fileTwo), 'utf8'), 'OLEA_TWO_OK');
      assert.equal(await readFile(join(workspace, parallelFile), 'utf8'), 'OLEA_PARALLEL_OK');
      report.measurements.twoSessionMemory = await sampleMemory();
      if (process.platform === 'linux') {
        const cpu = process.cpuUsage();
        const wall = performance.now();
        const before = new Map();
        for (const session of backend.status()) {
          try { before.set(session.pid, await readFile(`/proc/${session.pid}/stat`, 'utf8')); } catch {}
        }
        await sleep(1000);
        const after = [];
        for (const [pid, stat] of before) {
          try {
            const latest = await readFile(`/proc/${pid}/stat`, 'utf8');
            const ticks = value => { const fields = value.slice(value.lastIndexOf(')') + 2).split(' '); return Number(fields[11]) + Number(fields[12]); };
            after.push({ pid, idleCpuTicks: ticks(latest) - ticks(stat) });
          } catch { after.push({ pid, status: 'unavailable' }); }
        }
        report.measurements.idle = { wallMs: performance.now() - wall, backendCpuMicros: process.cpuUsage(cpu), piCpuTicks: after,
          limitation: 'ticks are raw kernel accounting; no assumed CLK_TCK conversion' };
      }
      return { secondStartupMs: Math.round(start.startupMs), independentFileAssertion: true, concurrentPrompts: 2 };
    });
    if (process.platform === 'linux') await caseRun('cancel_shell_and_descendant_cleanup', async () => {
      const pidPath = join(workspace, 'cancel-' + randomUUID() + '.pid');
      const command = `sleep 120 & child=$!; printf '%s' "$child" > '${pidPath.replaceAll("'", "'\\''")}'; wait`;
      const work = backend.command(mainSession, { type: 'bash', command }).catch(() => undefined);
      let pid;
      for (let attempt = 0; attempt < 50; attempt++) {
        try { pid = Number(await readFile(pidPath, 'utf8')); if (pid > 1) break; } catch {}
        await sleep(100);
      }
      assert(pid > 1);
      await backend.command(mainSession, { type: 'abort_bash' });
      await work;
      await sleep(500);
      let alive = false;
      try { const status = await readFile(`/proc/${pid}/stat`, 'utf8'); alive = !/\) Z /.test(status); } catch {}
      assert.equal(alive, false);
      await rm(pidPath, { force: true });
      return { descendantPid: pid, independentProcAssertion: true };
    }); else report.cases.push({ name: 'cancel_shell_and_descendant_cleanup', status: 'untested', reason: 'linux_proc_required' });

    if (process.platform === 'linux') await caseRun('backend_shutdown_descendant_cleanup', async () => {
      const pidPath = join(workspace, 'shutdown-' + randomUUID() + '.pid');
      const command = `sleep 120 & child=$!; printf '%s' "$child" > '${pidPath.replaceAll("'", "'\\''")}'; wait`;
      const work = backend.command(mainSession, { type: 'bash', command }).catch(() => undefined);
      let pid;
      for (let attempt = 0; attempt < 50; attempt++) {
        try { pid = Number(await readFile(pidPath, 'utf8')); if (pid > 1) break; } catch {}
        await sleep(100);
      }
      assert(pid > 1);
      await backend.stop(mainSession);
      await work;
      let alive = false;
      try { const status = await readFile(`/proc/${pid}/stat`, 'utf8'); alive = !/\) Z /.test(status); } catch {}
      if (alive) { try { process.kill(pid, 'SIGKILL'); } catch {} }
      await backend.start(mainSession, true);
      await rm(pidPath, { force: true });
      assert.equal(alive, false);
      return { descendantPid: pid, independentProcAssertion: true, explicitResume: true, uncertainActionsReplayed: false };
    }); else report.cases.push({ name: 'backend_shutdown_descendant_cleanup', status: 'untested', reason: 'linux_proc_required' });

    if (process.env.OLEA_RUN_PHONE === '1') await caseRun('model_combined_unix_phone_tools', async () => {
      const phoneFile = 'phone-value-' + randomUUID() + '.txt';
      const target = process.env.OLEA_PHONE_TARGET_LABEL ?? 'Olea Fixture';
      const records = await prompt(mainSession,
        `Perform a combined Unix/Android task. First generate a fresh random 16-byte hexadecimal value with Node crypto and save it to ${phoneFile}. Then discover the supplied phone tools, check capabilities, go HOME, inspect launcher nodes, and click the launcher entry named ${JSON.stringify(target)} using Accessibility. Inspect again to confirm foreground. Finally send the generated file value with phone_fixture_action to the cooperating app. Do not use a shell/ADB/intent to open the target; launcher Accessibility click is required. Never query or alter any verification/oracle state. Stop if permission is denied.`, 150_000);
      const value = (await readFile(join(workspace, phoneFile), 'utf8')).trim();
      assert.match(value, /^[0-9a-f]{32}$/);
      const used = records.filter(record => record.type === 'tool_execution_start').map(record => record.toolName);
      report.phoneCalls = used.filter(name => typeof name === 'string' && name.startsWith('phone_'));
      for (const tool of ['phone_capabilities', 'phone_home', 'phone_inspect', 'phone_click', 'phone_fixture_action']) assert(used.includes(tool));
      return { status: 'awaiting-independent-oracle', unixValueFile: phoneFile, toolDiscoveryAndInvocationVerified: true,
        reason: 'runtime_owner_must_compare_fixture_private_oracle_and_foreground_click_evidence' };
    }); else report.cases.push({ name: 'model_combined_unix_phone_tools', status: 'untested', reason: 'native_bridge_execution_not_requested' });

    await caseRun('direct_pi_same_state_workload_comparison', async () => {
      const direct = new PiProcess({ entry, cwd: workspace, args: ['--mode', 'rpc', '--no-session', '--extension', resolve(import.meta.dirname, '../../backend/extensions/phone.ts'), '--provider', 'olea-test', '--model', process.env.OLEA_MODEL ?? 'gpt-6.1-terra'] });
      try {
        await direct.request({ type: 'get_state' }, 60_000);
        report.measurements.directStartupMs = performance.now() - direct.startedAt;
        const began = performance.now();
        for (let i = 0; i < 10; i++) await direct.request({ type: 'get_state' });
        report.measurements.directTenStateMs = performance.now() - began;
        const managedBegan = performance.now();
        for (let i = 0; i < 10; i++) await backend.command(mainSession, { type: 'get_state' });
        report.measurements.managedTenStateMs = performance.now() - managedBegan;
        return { workload: 'ten_get_state_commands', limitation: 'not_model_latency_or_android_total_memory' };
      } finally { await direct.stop(); }
    });
  } else {
    for (const name of ['model_unix_dependency_child_and_file', 'restart_resume_without_replaying_actions', 'two_persistent_sessions', 'cancel_shell_and_descendant_cleanup', 'model_combined_unix_phone_tools', 'direct_pi_same_state_workload_comparison'])
      report.cases.push({ name, status: 'blocked', reason: 'stock_pi_startup_failed' });
  }
} finally {
  await backend.close();
  report.measurements.finalBackendSessionCount = backend.status().length;
  const output = JSON.stringify(report, null, 2);
  if (process.env.OLEA_REPORT) await writeFile(process.env.OLEA_REPORT, output + '\n', { mode: 0o600 });
  console.log(output);
}
if (report.cases.some(item => item.status === 'fail')) process.exitCode = 1;
