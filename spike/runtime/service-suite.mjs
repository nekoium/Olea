// Original source MIT. Kotlin owns this suite process; each stage is bounded and records independent failures.
import { spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
const root = '/opt/olea';
const output = '/workspace/evidence';
await mkdir(output, { recursive: true });
const summary = { started: new Date().toISOString(), pid: process.pid, ppid: process.ppid, stages: [] };
async function run(name, script, args, timeout, env = process.env) {
  const began = Date.now();
  const result = await new Promise(resolve => {
    const child = spawn(process.execPath, [script, ...args], { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'] });
    let bytes = 0; let text = ''; let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; child.kill('SIGTERM'); setTimeout(() => child.kill('SIGKILL'), 3000).unref(); }, timeout);
    for (const stream of [child.stdout, child.stderr]) stream.on('data', chunk => { bytes += chunk.length; if (bytes <= 256 * 1024) text += chunk; else child.kill('SIGKILL'); });
    child.on('error', () => { clearTimeout(timer); resolve({ code: null, reason: 'spawn_failed', bytes }); });
    child.on('close', code => { clearTimeout(timer); resolve({ code, timedOut, bytes, text }); });
  });
  // All child scripts emit sanitized facts only. Provider/bridge secrets never appear in arguments or reports.
  await writeFile(`${output}/${name}.log`, result.text ?? '', { mode: 0o600 });
  delete result.text;
  const stage = { name, durationMs: Date.now() - began, ...result };
  summary.stages.push(stage);
  await writeFile(`${output}/service-suite.json`, JSON.stringify(summary, null, 2));
  console.log(JSON.stringify({ type: 'suite-stage', ...stage }));
  return stage;
}
const prerequisites = await run('prerequisites', `${root}/spike/runtime/prerequisites.mjs`, [], 120000);
const stock = run('stock-agents', `${root}/spike/probes/stock-install.mjs`, ['/workspace/stock-agent-probe'], 660000);
if (prerequisites.code === 0) {
  await run('pi-matrix', `${root}/spike/tests/pi/matrix.mjs`, [], 1800000, { ...process.env,
    OLEA_MATRIX_DIR: '/opt/olea/.setup/pi-matrix', OLEA_RUN_PHONE: '1', OLEA_PHONE_TARGET_LABEL: 'Olea Fixture' });
} else summary.stages.push({ name: 'pi-matrix', status: 'blocked', reason: 'unix_prerequisite_failed' });
await stock;
summary.finished = new Date().toISOString();
await writeFile(`${output}/service-suite.json`, JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ type: 'suite-done', stages: summary.stages }));
