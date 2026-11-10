// SPDX-License-Identifier: MIT
// Offline-only receipt production. No provider configuration or Android commands.
import { readFile, mkdir, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { supervise } from './supervise.mjs';
import { sha256, report } from './evidence.mjs';
import { immutableArtifact, appendReceipts } from './receipt-store.mjs';
export async function retainOffline(backendDist) {
  const root = resolve('.');
  const destination = resolve('spike/m2/evidence/evidence');
  await mkdir(destination, { recursive: true });
  const startedAt = new Date().toISOString();
  const main = await supervise(process.execPath, ['--test', 'spike/tests/m2/evidence.test.mjs'], { cwd: root, timeoutMs: 30000 });
  const compiled = [];
  let backend = null;
  if (backendDist) {
    for (const file of ['pi-process.js', 'process-tree.js']) compiled.push({ path: resolve(backendDist, file), sha256: sha256(await readFile(resolve(backendDist, file))), provenance: 'Existing local compiled Olea MIT artifact, explicitly selected; not copied into this worktree.' });
    backend = await supervise(process.execPath, ['-e', `process.env.OLEA_M2_BACKEND_DIST=${JSON.stringify(resolve(backendDist))};import('./spike/tests/m2/backend-contract.test.mjs')`], { cwd: root, timeoutMs: 30000 });
  }
  const sources = [];
  for (const file of await readdir('spike/tests/m2')) if (file.endsWith('.mjs')) {
    const path = `spike/tests/m2/${file}`;
    sources.push({ path, sha256: sha256(await readFile(path)), license: 'MIT', origin: 'Original Olea implementation; no Orca source copied.' });
  }
  const endedAt = new Date().toISOString();
  const result = { scope: 'host-only offline tooling checks; no Android/stock-agent/provider mission evidence', startedAt, endedAt, platform: process.platform, arch: process.arch, node: process.version,
    commandsActuallyRun: ['node --test spike/tests/m2/evidence.test.mjs', ...(backendDist ? ['node -e <explicit selected backend path + import backend-contract.test.mjs>'] : [])],
    results: { ownTooling: main, existingCompiledBackendMocks: backend }, sources, compiled,
    providerTopLevelPrompts: 0, androidCommands: 0,
    limits: ['No raw subprocess output retained; bounded digest/count only.', 'Unit fixtures and mock Pi are not stock-agent or Android workflow passes.', 'No independent model child causality claim.', 'Compiled artifact provenance hashes are local bytes, not distribution license clearance.', 'Resource script tests are fixture-only; no current Android process/allocation/device observation.'],
    sourceOnlyCommands: ['node spike/tests/m2/pi-single.mjs .setup/private-pi-options.json (sole runtime owner after manager allocation)', 'sampleResources(actual owned Android PIDs) (sole runtime owner)'] };
  const checkArtifact = await immutableArtifact(root, 'spike/m2/evidence/evidence/attempts', JSON.stringify(result, null, 2) + '\n');
  const checkPath = resolve(root, checkArtifact.path);
  const receipts = ['output-frame', 'output-queue', 'timeout'].map(name => ({ attemptId: `offline-tooling-${checkArtifact.sha256.slice(0, 16)}-${name}`, caseId: `cost.${name}`, context: 'host', mode: 'direct', status: main.code === 0 ? 'pass' : 'fail', startedAt, endedAt,
    summary: `Host tooling tests for ${name} completed with exit ${main.code}; mock/supervisor checks only. Android backend/runtime acceptance remains untested.`,
    artifacts: [checkArtifact], assertions: [{ name: 'host_tooling_suite_exit_zero', independent: true, passed: main.code === 0 }],
    limits: ['No provider, stock agent or Android execution.', 'Supervisor tests do not establish Android backend backpressure/cleanup.'] }));
  const receiptPath = resolve(destination, 'receipts.json');
  await appendReceipts(receiptPath, receipts, root);
  await report(receiptPath, resolve('spike/m2/reports'), root);
  if (main.code !== 0 || (backend && backend.code !== 0)) throw Error('offline_check_failed_retained');
  return { checkPath, receiptPath };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) console.log(JSON.stringify(await retainOffline(process.argv[2])));
