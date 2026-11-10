// SPDX-License-Identifier: MIT
import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export function catalog() {
  const rows = [];
  const add = (id, expected, prerequisites = [], context = 'android-app', mode = 'direct') => rows.push({ id, expected, prerequisites, context, mode });
  add('provenance', 'Pin source URLs, licenses, notices, versions and actual payload SHA256.', [], 'artifacts');
  add('runtime.modern', 'Execute supplied complete runtime from target36 Activity/service actual app UID, not run-as.');
  add('runtime.target28', 'Retain target28 comparison separately; never modern acceptance.', [], 'target28-comparison');
  add('runtime.fresh', 'Reproduce fresh disposable install from verified artifacts with bounded step receipts.', ['provenance', 'runtime.modern']);
  for (const name of ['shell', 'node', 'git-object', 'dns-tls', 'dependency', 'child', 'nested-child']) add(`unix.${name}`, `Independently assert real ${name} under native supervision.`, ['runtime.modern']);
  add('backend.shared', 'Kotlin supervises ONE persistent backend with Pi and Codex adapters and real process identities.', ['unix.node']);
  for (const agent of ['pi', 'codex']) {
    add(`${agent}.install`, `Stock ${agent} supported install, declared executable and artifact hashes.`, ['unix.node', 'unix.dns-tls']);
    for (const name of ['initialize', 'turn', 'stream', 'file', 'shell', 'dependency', 'child', 'nested-child', 'resume', 'cancel', 'error', 'update']) add(`${agent}.${name}`, `Stock ${agent}: independently establish ${name}; preserve thread/transcript/workspace and original failures.`, [`${agent}.install`, 'backend.shared'], 'android-app', name === 'initialize' ? 'direct' : 'model');
  }
  for (const name of ['sandbox', 'approval', 'rejection', 'initialized-notification', 'thread-identity', 'tool-registration']) add(`codex.${name}`, `Prove supported Codex ${name} without sandbox/approval bypass.`, ['codex.initialize']);
  const categories = ['accessibility-launch', 'intent-url', 'structured-api', 'files-media', 'notification', 'capture', 'app-integration'];
  for (const category of categories) {
    add(`phone.direct.${category}`, `Independently verify ${category}; dispatch/model claim alone insufficient.`, ['runtime.modern']);
    for (const agent of ['pi', 'codex']) add(`phone.${agent}.${category}`, `${agent} selects registered tools and independently completes ${category}.`, [`phone.direct.${category}`, `${agent}.turn`], 'android-app', 'model');
  }
  add('phone.oracle', 'Separate real Android UID oracle is inaccessible through ALL agent tools/shared workspace.');
  for (const agent of ['pi', 'codex']) add(`phone.${agent}.combined`, 'Unix random value equals separate-UID private fixture receipt; causal launcher ACTION_CLICK precedes foreground and fixture integration.', [`phone.${agent}.accessibility-launch`, 'phone.oracle'], 'android-app', 'model');
  for (const name of ['permission-denied', 'revocation', 'stop', 'cancel', 'no-replay']) add(`phone.${name}`, `Native ${name} boundary independently observed with no unauthorized effect.`, ['runtime.modern']);
  for (const name of ['agent-update', 'runtime-update', 'failed-update', 'interrupted-update', 'recovery-hashes', 'credential-preservation']) add(`preserve.${name}`, `Record before/after hashes and durable identity for ${name}; no reset/uninstall to claim preservation.`, ['runtime.fresh']);
  for (const name of ['child-death', 'backend-death', 'whole-app-death', 'app-switch', 'lock', 'reboot']) add(`lifecycle.${name}`, `Distinguish live execution from saved/restored state after ${name}; verify native stop/permissions and descendants.`, ['runtime.modern']);
  for (const name of ['setup-time', 'install-size', 'cold-start', 'idle-cpu', 'first-event', 'first-text', 'stream-stalls', 'one-session', 'two-sessions', 'direct-managed', 'output-frame', 'output-queue', 'timeout', 'cleanup', 'constrained-core', 'constrained-model', 'allocation-restore']) add(`cost.${name}`, `Measure ${name} with actual identities/allocation/units and incomplete accounting limits.`, ['backend.shared']);
  for (const name of ['abi', 'unix', 'agents', 'phone', 'battery', 'thermals']) add(`physical.${name}`, `Measure physical Android14 ${name}; emulator is not ARM64 proof.`, [], 'physical-phone');
  return rows;
}
const contexts = ['android-app', 'android-runas', 'target28-comparison', 'host', 'artifacts', 'physical-phone'];
export function validateReceipt(r) {
  if (!r || typeof r !== 'object' || !/^[a-zA-Z0-9._-]+$/.test(r.attemptId ?? '') || !catalog().some(c => c.id === r.caseId)) throw Error('invalid_attempt');
  if (!['pass', 'fail', 'blocked', 'untested'].includes(r.status) || !contexts.includes(r.context) || !['direct', 'model'].includes(r.mode)) throw Error('invalid_status_context');
  const allowed = ['attemptId', 'caseId', 'context', 'mode', 'status', 'startedAt', 'endedAt', 'summary', 'failureClass', 'prerequisites', 'retryOf', 'fallbackOf', 'artifacts', 'assertions', 'execution', 'provider', 'provenance', 'limits', 'commandsActuallyRun', 'sourceOnlyCommands', 'currentState'];
  if (Object.keys(r).some(k => !allowed.includes(k))) throw Error('unexpected_receipt_field');
  for (const key of ['startedAt', 'endedAt']) if (!Number.isFinite(Date.parse(r[key]))) throw Error('invalid_timestamp');
  if (Date.parse(r.endedAt) < Date.parse(r.startedAt)) throw Error('invalid_time_order');
  if (!Array.isArray(r.artifacts) || !Array.isArray(r.assertions) || typeof r.summary !== 'string') throw Error('invalid_evidence');
  for (const a of r.artifacts) if (typeof a.path !== 'string' || !/^[a-f0-9]{64}$/.test(a.sha256)) throw Error('invalid_artifact');
  if (r.assertions.some(a => typeof a.name !== 'string' || typeof a.independent !== 'boolean' || typeof a.passed !== 'boolean')) throw Error('invalid_assertion');
  if (r.status === 'pass' && (!r.artifacts.length || !r.assertions.length || r.assertions.some(a => a.independent !== true || a.passed !== true))) throw Error('pass_requires_independent_evidence');
  if (/apiKey|authorization|bearer |sk-[A-Za-z0-9]{10}/i.test(JSON.stringify(r))) throw Error('potential_secret');
  return r;
}
export function assess(receipts) {
  const seen = new Set();
  for (const r of receipts) { validateReceipt(r); if (seen.has(r.attemptId)) throw Error('duplicate_attempt'); seen.add(r.attemptId); }
  const rows = catalog().map(c => {
    const attempts = receipts.filter(r => r.caseId === c.id);
    const matching = attempts.filter(r => r.context === c.context && (r.mode ?? 'direct') === c.mode);
    const actual = matching.at(-1);
    return { ...c, status: actual?.status ?? 'untested', actual: actual?.summary ?? 'No retained matching execution receipt.', attempts, actualAttemptId: actual?.attemptId ?? null };
  });
  // Direct failed attempts remain failures; only unexecuted cases propagate prerequisite blocks.
  for (let i = 0; i < rows.length; i++) for (const r of rows) if (!r.actualAttemptId) {
    const bad = r.prerequisites.filter(id => ['fail', 'blocked'].includes(rows.find(c => c.id === id)?.status));
    if (bad.length) { r.status = 'blocked'; r.actual = `Prerequisite failed/blocked: ${bad.join(', ')}`; }
  }
  return rows;
}
export async function verifyArtifacts(receipts, root) {
  const base = resolve(root);
  for (const r of receipts) for (const artifact of r.artifacts) {
    const path = resolve(base, artifact.path);
    if (!path.startsWith(base + '/') && !path.startsWith(base + '\\')) throw Error('artifact_outside_root');
    if (sha256(await readFile(path)) !== artifact.sha256) throw Error('artifact_hash_mismatch');
  }
}
const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
export function render(receipts) {
  const rows = assess(receipts);
  const counts = Object.fromEntries(['pass', 'fail', 'blocked', 'untested'].map(s => [s, rows.filter(r => r.status === s).length]));
  const heading = `# Olea M2 expected versus retained actual\n\n${JSON.stringify(counts)}\n\nRecommendation: ${counts.fail ? 'revise' : 'insufficient-evidence'}. No automatic production acceptance.\n\nHost/run-as/target28 receipts never establish modern Android app-domain or model outcomes. Historical M1 evidence stays unchanged. Tooling tests are not workflow passes. Missing physical access remains untested unless a retained blocked receipt establishes it.\n`;
  const md = heading + rows.map(r => `\n## ${r.id}: ${r.status}\nExpected: ${r.expected}\n\nActual: ${r.actual}\n\nContext: ${r.context}; mode: ${r.mode}; prerequisites: ${r.prerequisites.join(', ') || 'none'}.\n\nAttempts: ${r.attempts.map(a => `${a.attemptId} (${a.context}/${a.mode ?? 'direct'} ${a.status}): ${a.summary}; artifacts ${a.artifacts.map(x => `${x.path} SHA256 ${x.sha256}`).join(', ')}`).join('; ') || 'none'}.\n`).join('');
  return { rows, counts, md, html: `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Olea M2 evidence</title><style>body{max-width:90ch;margin:2rem auto;padding:1rem;font:16px/1.5 system-ui}pre{white-space:pre-wrap;overflow-wrap:anywhere}</style><body><pre>${esc(md)}</pre></body></html>` };
}
export async function report(input, output, root) {
  const receipts = JSON.parse(await readFile(input, 'utf8'));
  await verifyArtifacts(receipts, root);
  const result = render(receipts);
  await mkdir(output, { recursive: true });
  await writeFile(resolve(output, 'matrix.json'), JSON.stringify(result.rows, null, 2) + '\n');
  await writeFile(resolve(output, 'M2_REPORT.md'), result.md);
  await writeFile(resolve(output, 'M2_REPORT.html'), result.html);
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  if (process.argv.length !== 5) throw Error('usage: evidence.mjs receipts.json output-directory repository-root');
  await report(...process.argv.slice(2));
}
