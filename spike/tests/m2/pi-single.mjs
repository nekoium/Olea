// SPDX-License-Identifier: MIT
// SOURCE-ONLY until manager allocates one prompt and sole runtime owner executes.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { challenge, unixPrompt, assertUnix, observeProcess } from './assertions.mjs';
import { sha256 } from './evidence.mjs';
export function bounded(promise, ms, code) {
  let timer;
  return Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(Error(code)), ms); })]).finally(() => clearTimeout(timer));
}
export async function runPiSingle(options) {
  if (options.allocatedPrompts !== 1 || !options.allocationId || !/^[\w.-]+$/.test(options.attemptId)) throw Error('explicit_single_prompt_allocation_required');
  if (!['unix', 'combined'].includes(options.kind)) throw Error('invalid_case_kind');
  if (!['host', 'android-app', 'target28-comparison'].includes(options.context)) throw Error('explicit_execution_context_required');
  if (!options.backendModule || !options.entry || !options.workspace || !options.stateDir || !options.providerConfig || !options.output) throw Error('missing_explicit_paths');
  const { Backend } = await import(pathToFileURL(resolve(options.backendModule)).href);
  const c = challenge();
  const session = 'm2_' + c.nonce;
  await mkdir(options.workspace, { recursive: true });
  await mkdir(options.stateDir, { recursive: true, mode: 0o700 });
  const env = Object.fromEntries(['PATH', 'HOME', 'TMPDIR', 'TEMP', 'SystemRoot', 'LD_LIBRARY_PATH', 'PROOT_LOADER', 'PROOT_LOADER_32'].filter(k => process.env[k]).map(k => [k, process.env[k]]));
  Object.assign(env, { OLEA_PROVIDER_CONFIG: resolve(options.providerConfig), OLEA_MODEL: options.model ?? 'gpt-6.1-terra' });
  if (options.bridgeConfig) env.OLEA_BRIDGE_CONFIG = resolve(options.bridgeConfig);
  const summary = { attemptId: options.attemptId, context: options.context, kind: options.kind, startedAt: new Date().toISOString(), status: 'fail', allocationId: options.allocationId,
    provider: { topLevelPrompts: 0, toolRounds: 0, observedUsage: {}, httpRequests: null, remoteBilling: 'unknown', strictTokenCap: 'unsupported/not established', automaticRetries: false },
    limits: { initMs: 30000, turnMs: 120000, idleMs: 45000, frameBytes: 262144, retainedDiagnosticBytes: 1048576, eventCount: 4096, maxToolRounds: 12 },
    tools: [], faults: [], assertions: [], events: 0, noAutomaticReplay: true, sourceSha256: sha256(await readFile(import.meta.filename)) };
  let ended = false, fault, lastEvent = Date.now(), turnStart, streamTimer;
  const backend = new Backend({ entry: resolve(options.entry), workspace: resolve(options.workspace), stateDir: resolve(options.stateDir), env }, event => {
    if (event.type === 'fault') { summary.faults.push('backend_fault'); fault = 'backend_fault'; }
    if (event.type !== 'event') return;
    lastEvent = Date.now();
    if (++summary.events > 4096) { fault = 'event_limit'; return; }
    const r = event.record;
    // Reactive cancellation cannot strictly cap remote in-flight requests or billing.
    if (r.type === 'turn_start' && ++summary.provider.toolRounds >= 12) fault = 'model_round_limit';
    if (r.type === 'tool_execution_start' && typeof r.toolName === 'string' && summary.tools.length < 128) summary.tools.push(r.toolName.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80));
    if (r.type === 'message_end') for (const [k, v] of Object.entries(r.message?.usage ?? {})) if (['input', 'output', 'cacheRead', 'cacheWrite'].includes(k) && Number.isFinite(v)) summary.provider.observedUsage[k] = (summary.provider.observedUsage[k] ?? 0) + v;
    if (r.type === 'agent_end' || r.type === 'agent_settled') ended = true;
  });
  try {
    const start = await bounded(backend.start(session), 30000, 'init_deadline');
    summary.processBefore = await observeProcess(start.pid);
    let message = unixPrompt(c);
    if (options.kind === 'combined') message += ` Then use phone tools: capabilities, HOME, inspect launcher, swipe app drawer if needed, inspect and Accessibility-click ${JSON.stringify(options.targetLabel ?? 'Olea Fixture')}. Inspect foreground. Generate random16byte lowercase hex in phone-${c.nonce}.txt using Node crypto; send that value through phone_fixture_action. Never use intent/ADB/shell to launch target. Never read oracle; stop on denied permission. No retries of uncertain effects.`;
    turnStart = Date.now(); lastEvent = turnStart;
    summary.provider.topLevelPrompts = 1;
    const work = backend.command(session, { type: 'prompt', message });
    let rejectLimit;
    const limit = new Promise((_, reject) => { rejectLimit = reject; });
    streamTimer = setInterval(() => {
      if (Date.now() - lastEvent > 45000) fault = 'stream_idle_deadline';
      if (Date.now() - turnStart >= 120000) fault = 'turn_deadline';
      if (fault) rejectLimit(Error(fault));
    }, 50);
    await bounded(Promise.race([work, limit]), 120000, 'turn_deadline');
    while (!ended) {
      if (fault) throw Error(fault);
      if (Date.now() - turnStart >= 120000) throw Error('turn_deadline');
      await new Promise(r => setTimeout(r, 50));
    }
    if (fault) throw Error(fault);
    clearInterval(streamTimer);
    summary.assertions = await assertUnix(options.workspace, c);
    summary.status = options.kind === 'combined' ? 'awaiting-independent-phone-oracle' : 'pass';
    summary.phoneValueFile = options.kind === 'combined' ? `phone-${c.nonce}.txt` : null;
    summary.workspaceArtifact = c.file;
    summary.workspaceArtifactSha256 = sha256(await readFile(resolve(options.workspace, c.file)));
    await bounded(backend.command(session, { type: 'get_state' }), 30000, 'state_deadline');
    await bounded(backend.stop(session), 10000, 'stop_deadline');
    await bounded(backend.start(session, true), 30000, 'resume_deadline');
    const history = await bounded(backend.command(session, { type: 'get_messages' }), 30000, 'history_deadline');
    summary.resumeMarkerPresent = JSON.stringify(history.data).includes(c.nonce);
    if (!summary.resumeMarkerPresent) throw Error('resume_marker_missing');
  } catch (e) {
    summary.status = 'fail';
    summary.failure = /^[a-z_]+$/.test(e.message ?? '') ? e.message : 'assertion_or_runtime_failure';
    try { await bounded(backend.command(session, { type: 'abort' }), 2000, 'abort_deadline'); } catch { summary.abortAcknowledged = false; }
  } finally {
    clearInterval(streamTimer);
    try { await bounded(backend.close(), 10000, 'close_deadline'); } catch { summary.cleanupUnverifiable = true; }
    if (summary.processBefore?.pid) summary.processAfter = await observeProcess(summary.processBefore.pid);
    summary.endedAt = new Date().toISOString();
    summary.turnWallMs = turnStart ? Date.now() - turnStart : null;
    await writeFile(options.output, JSON.stringify(summary, null, 2) + '\n', { mode: 0o600 });
  }
  return summary;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  if (process.argv.length !== 3) throw Error('usage: pi-single.mjs protected-local-options.json');
  const result = await runPiSingle(JSON.parse(await readFile(process.argv[2], 'utf8')));
  console.log(JSON.stringify({ attemptId: result.attemptId, status: result.status, failure: result.failure }));
  if (result.status === 'fail') process.exitCode = 1;
}
