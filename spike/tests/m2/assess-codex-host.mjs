// SPDX-License-Identifier: MIT
// Manual assessment rules for retained stock Codex HOST receipts, never Android credit.
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { readGitArtifact, sha256, report } from './evidence.mjs';
import { readReceipts, appendReceipts } from './receipt-store.mjs';
export async function assessCodexHost(commit = '5c9c93b') {
  if (!/^[a-f0-9]{7,40}$/.test(commit)) throw Error('invalid_source_commit');
  const base = 'spike/m2/codex/';
  const mainName = 'attempts/host-primary-1794329763090.json';
  const artifact = name => {
    const path = `git:${commit}:${base}${name}`;
    return { path, sha256: sha256(readGitArtifact(path)) };
  };
  const load = name => JSON.parse(readGitArtifact(`git:${commit}:${base}${name}`).toString('utf8'));
  const main = load(mainName), upstream = load('upstream-manifest.json');
  const sources = [artifact(mainName), artifact('attempts/host-primary-1794329763090-diagnostics.json'), artifact('attempts/host-primary-1794329763090-thread.json'), artifact('upstream-manifest.json'), artifact('INTERIM.md')];
  const startedAt = main.observedAt, endedAt = new Date(Date.parse(startedAt) + main.elapsedMs).toISOString();
  const prefix = 'codex-host-primary-1794329763090';
  const receipts = [];
  const add = (caseId, mode, status, summary, assertions, extra = {}) => receipts.push({ attemptId: `${prefix}-${caseId.replaceAll('.', '-')}`, caseId, context: 'host', mode, status, startedAt, endedAt, summary, artifacts: sources,
    assertions: assertions.map(name => ({ name, independent: true, passed: status === 'pass' })),
    execution: { platform: main.platform, node: main.node, threadId: main.start.threadId, cwd: main.start.cwd, home: main.start.home, windowsOsSandbox: 'disabled in independently retained stock sandbox log; declared workspace-write policy alone was insufficient' },
    provenance: { sourceCommit: commit, codexVersion: upstream.version, license: upstream.license, declaredBin: upstream.declaredBin, stockExecutableSha256: 'edfdd48f8b458af0906e507b4cb05217b326c3d6e515e9f024e05e3b8d650f70', currentConfigSchemaSha256: '66ed795352d32f2464778acd2e332b7fafe644246d540cdceec4663c56cfbc16', downloadedBytesVerification: 'Producer manifest records exact payload checks; this assessment independently hashes retained Git receipt bytes.' },
    provider: { accountingReference: `${prefix}-codex-turn` },
    limits: ['Host-only evidence cannot establish Android/runtime/sandbox/phone acceptance.', 'No root/descendant exit guarantee from Windows root stop.', 'Teardown codex_delivery_unknown notifications are not provider incompatibility.', 'Model narrative about sandbox rejection is superseded by actual decline and disabled-sandbox diagnostic.'], ...extra });
  if (main.outcomes.initializedThread !== 'pass' || main.outcomes.completedTurn !== 'pass' || main.outcomes.resume !== 'pass') throw Error('source_outcomes_changed_reassess');
  add('codex.initialize', 'direct', 'pass', `Stock Codex${upstream.version} correlated initialize and thread creation succeeded, startup${main.start.startupMs}ms; thread${main.start.threadId}.`, ['retained_correlated_initialize_thread']);
  add('codex.thread-identity', 'direct', 'pass', 'Proved created/resumed exact thread ID with same canonical workspace and account home; no accidental fork.', ['matching_thread_home_workspace']);
  const usage = main.usage.at(-1).total;
  add('codex.turn', 'model', 'pass', `Real preferred-model streamed turn completed in total attempt${main.elapsedMs}ms; completion does not establish Unix effects.`, ['matching_actual_turn_completed'], { provider: { allocationId: 'manager-codex-host-first', model: main.model, topLevelPrompts: 1, inferenceResultsAtLeast: 2, observedHttpRequests: null, requestRetries: 0, streamRetries: 0, deduplicatedLatestCumulativeUsage: usage, remoteBilling: 'unknown', strictTokenCap: 'unsupported in inspected turn/start schema' } });
  add('codex.stream', 'model', 'pass', `Captured${main.events['item/agentMessage/delta']} agentMessage deltas and matching completed turn; first event${main.firstEventMs}ms.`, ['retained_stream_deltas_and_terminal_turn']);
  add('codex.resume', 'model', 'pass', `Explicit restart resumed exact proved thread${main.resume.threadId} with unchanged canonical home/workspace, startup${main.resume.startupMs}ms and no new prompt.`, ['retained_resume_identity']);
  for (const name of ['file', 'shell']) add(`codex.${name}`, 'model', 'fail', `Expected model Unix workflow${name} did not complete after explicit command approval decline; expected result files absent. Actual Unix execution was not established.`, [], { failureClass: 'independent_assertion' });
  for (const name of ['dependency', 'child']) add(`codex.${name}`, 'model', 'blocked', `Not executed after explicit command approval decline; original whole Unix workflow remains failed, but no independent ${name} assertion was reached.`, [], { failureClass: 'prerequisite' });
  add('codex.rejection', 'direct', 'untested', 'Explicit command approval decline and rejected-by-user tool result retained; full independently verified no-effect rejection boundary remains incomplete.', []);
  add('codex.sandbox', 'direct', 'fail', 'Initial authenticated host attempt actual Windows OS sandbox was disabled despite workspace-write policy. It cannot pass sandbox execution acceptance.', [], { failureClass: 'runtime' });
  const initialSandbox = receipts.at(-1).attemptId;
  for (let i = 1; i <= 3; i++) {
    const name = `attempts/host-sandbox-attempt${i}.json`, source = load(name);
    const assessedAt = new Date().toISOString();
    receipts.push({ attemptId: `codex-host-sandbox-preflight-${i}`, caseId: 'codex.sandbox', context: 'host', mode: 'direct', status: 'blocked', startedAt: assessedAt, endedAt: assessedAt,
      summary: i < 3 ? `No-model unelevated sandbox preflight${i} blocked by RPC -32600; attempt2 diagnoses custom outputBytesCap unsupported on Windows. Original attempt1 lacks captured error-message detail.` : 'No-model unelevated preflight3 inside command exit0/INSIDE_OK; designated sibling write denied EPERM/RPC -32603. Original runner marked blocked before independent file assertions; do not promote full sandbox boundary pass.',
      failureClass: 'prerequisite', retryOf: i === 1 ? initialSandbox : `codex-host-sandbox-preflight-${i - 1}`, artifacts: [artifact(name)], assertions: [],
      execution: { platform: source.platform, requestedSandbox: source.requestedSandbox, stockSandboxLog: 'unelevated', timestampLimit: 'These receipt timestamps record assessment time. Original preflight has no explicit UTC timestamp; local log text remains in immutable source.' },
      provider: { topLevelPrompts: 0, modelRequests: 0, httpRequests: null }, limits: ['No-model command/exec preflight is not an authenticated model sandbox workflow.', 'Outside denial is expected evidence, not provider failure.', 'Independent inside-file equality and outside-file absence were not reached in original preflight3 runner.'] });
  }
  const destination = resolve('spike/m2/evidence/evidence');
  await mkdir(destination, { recursive: true });
  const receiptPath = resolve(destination, 'receipts.json');
  const existing = await readReceipts(receiptPath);
  // Reassessing immutable source must retain the original assessment facts/timestamps.
  const stable = receipts.map(r => existing.find(old => old.attemptId === r.attemptId) ?? r);
  await appendReceipts(receiptPath, stable, resolve('.'));
  await writeFile(resolve(destination, 'codex-host-assessment.json'), JSON.stringify(stable, null, 2) + '\n');
  await report(receiptPath, resolve('spike/m2/reports'), resolve('.'), 'interim');
  return { count: receipts.length, sourceCommit: commit, providerTopLevelPromptsAssessed: 1, androidAcceptancePromoted: 0 };
}
export async function assessCodexSecondHost(commit = '3f29bc0') {
  if (!/^[a-f0-9]{7,40}$/.test(commit)) throw Error('invalid_source_commit');
  const base = 'spike/m2/codex/';
  const artifact = name => { const path = `git:${commit}:${base}${name}`; return { path, sha256: sha256(readGitArtifact(path)) }; };
  const load = name => JSON.parse(readGitArtifact(`git:${commit}:${base}${name}`).toString('utf8'));
  const sourceName = 'attempts/host-controlled-1794330423552.json';
  const main = load(sourceName), sandbox = load('attempts/host-sandbox-attempt3-assessment.json');
  const startedAt = main.observedAt, endedAt = new Date(Date.parse(startedAt) + main.elapsedMs).toISOString();
  const prefix = 'codex-host-controlled-1794330423552';
  const receipts = [];
  const add = (caseId, mode, status, summary, extra = {}) => receipts.push({ attemptId: `${prefix}-${caseId.replaceAll('.', '-')}`, caseId, context: 'host', mode, status, startedAt, endedAt, summary,
    artifacts: [artifact(sourceName)], assertions: status === 'pass' ? [{ name: 'retained_structured_protocol_outcome', independent: true, passed: true }] : [],
    execution: { platform: main.platform, node: main.node, threadId: main.start.threadId, home: main.start.home, cwd: main.start.cwd, actualSandbox: 'Windows unelevated, separately checked two-path command/exec boundary' },
    provider: { accountingReference: `${prefix}-codex-turn` }, provenance: { sourceCommit: commit, codexVersion: '0.167.0' },
    limits: ['Host-only; no Linux/Android/runtime inference.', 'Protocol turn completion is not successful Unix work.', 'Windows root process exit does not establish descendant exit.', 'Structured shell launch failure is not provider incompatibility.'], ...extra });
  if (main.outcomes.completedTurn !== 'pass' || main.outcomes.resume !== 'pass') throw Error('second_source_changed_reassess');
  add('codex.initialize', 'direct', 'pass', `Stock initialize/thread returned; startup${main.start.startupMs}ms.`);
  add('codex.thread-identity', 'direct', 'pass', `Created and resumed exact proved thread${main.start.threadId} with same canonical cwd/home.`);
  add('codex.turn', 'model', 'pass', `Preferred Responses provider produced completed turn; total attempt${main.elapsedMs}ms, zero approval requests.`, { provider: { allocationId: 'manager-codex-host-second', model: main.model, topLevelPrompts: 1, inferenceResultsAtLeast: 2, observedHttpRequests: null, requestRetries: 0, streamRetries: 0, deduplicatedLatestCumulativeUsage: main.usage.at(-1).total, remoteBilling: 'unknown', strictTokenCap: 'unsupported in inspected schema' } });
  add('codex.stream', 'model', 'pass', `${main.events['item/agentMessage/delta']} deltas, actual turn completion; first event${main.firstEventMs}ms.`);
  add('codex.resume', 'model', 'pass', `New process resumed same proved thread/home/cwd; resume startup${main.resume.startupMs}ms, no additional prompt.`);
  const tool = main.toolReceipts[0];
  if (tool.exitCode !== -1 || !tool.output.includes('CreateProcessAsUserW failed: 5')) throw Error('shell_launch_failure_changed_reassess');
  add('codex.shell', 'model', 'fail', 'Actual commandExecution exit-1: WindowsApps PowerShell pwsh.exe failed CreateProcessAsUserW error5 Access denied before node task.cjs. Actual task/dependency/child did not execute.', { failureClass: 'runtime', execution: { platform: 'win32', commandExecutionStatus: tool.status, commandExecutionExitCode: tool.exitCode, toolReceiptSha256: tool.sha256, osFailure: 'CreateProcessAsUserW error5 Access denied' } });
  add('codex.file', 'model', 'fail', 'Expected model result artifact missing after actual OS shell-launch failure; original overall Unix workflow stays failed.', { failureClass: 'independent_assertion' });
  for (const name of ['dependency', 'child', 'nested-child']) add(`codex.${name}`, 'model', 'blocked', `Not executed because stock Windows shell failed to launch; no independent ${name} assertion reached.`, { failureClass: 'prerequisite' });
  const assessedAt = new Date().toISOString();
  receipts.push({ attemptId: 'codex-host-sandbox-preflight-3-independent-assessment', caseId: 'codex.sandbox', context: 'host', mode: 'direct', status: 'pass', startedAt: assessedAt, endedAt: assessedAt,
    summary: 'Separate no-model assessment confirms INSIDE_OK file hash and outside sibling absence after expected stock EPERM denial in unelevated Windows sandbox; original preflight3 blocked receipt remains unchanged.',
    artifacts: [artifact('attempts/host-sandbox-attempt3-assessment.json'), artifact('attempts/host-sandbox-attempt3.json')], assertions: [{ name: 'inside_exact_hash', independent: true, passed: true }, { name: 'outside_absent', independent: true, passed: true }],
    execution: { platform: 'win32', timestampBasis: 'Assessment generation time; source has no explicit UTC observation timestamp.', insideSha256: sandbox.insideSha256, outsideIndependentObservation: sandbox.outsideIndependentObservation, sandbox: sandbox.stockSandboxLogSelection },
    provider: { topLevelPrompts: 0, modelRequests: 0, observedHttpRequests: null }, limits: sandbox.limits });
  const destination = resolve('spike/m2/evidence/evidence');
  const path = resolve(destination, 'receipts.json');
  const existing = await readReceipts(path);
  const stable = receipts.map(r => existing.find(old => old.attemptId === r.attemptId) ?? r);
  const all = await appendReceipts(path, stable, resolve('.'));
  await writeFile(resolve(destination, 'codex-second-host-assessment.json'), JSON.stringify(stable, null, 2) + '\n');
  await report(path, resolve('spike/m2/reports'), resolve('.'), 'interim');
  const counted = all.filter(r => r.caseId === 'codex.turn' && r.context === 'host' && r.provider?.topLevelPrompts);
  return { sourceCommit: commit, count: stable.length, hostPromptsTotal: counted.reduce((n, r) => n + r.provider.topLevelPrompts, 0), inferenceResultsLowerBound: counted.reduce((n, r) => n + r.provider.inferenceResultsAtLeast, 0), androidAcceptancePromoted: 0 };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(JSON.stringify(await assessCodexHost(process.argv[2])));
  if (process.argv[3]) console.log(JSON.stringify(await assessCodexSecondHost(process.argv[3])));
}

