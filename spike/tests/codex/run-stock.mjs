// SPDX-License-Identifier: MIT
// Explicitly invoked once per allocated top-level prompt; never retries a turn.
import { mkdir, readFile, writeFile, realpath } from 'node:fs/promises';
import { resolve, join, dirname } from 'node:path';
import { randomBytes, createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { Backend } from '../../backend/dist/backend.js';
import { codexConfig } from '../../backend/dist/codex-session.js';

const [configArg, outputArg, entryArg, modelArg = 'gpt-6.1-terra', mode = 'unix'] = process.argv.slice(2);
if (!configArg || !outputArg || !entryArg || !['unix', 'phone', 'controlled'].includes(mode)) throw new Error('usage: run-stock.mjs providerPath outputPath codexEntry [model] [unix|phone]');
const output = resolve(outputArg), base = resolve(output, '..');
await mkdir(base, { recursive: true });
const attempt = `attempt-${Date.now()}-${randomBytes(4).toString('hex')}`;
const directory = join(base, attempt), workspace = join(directory, 'workspace');
await mkdir(workspace, { recursive: true });
const config = JSON.parse(await readFile(configArg, 'utf8'));
if (config.baseUrl !== 'https://api.chiyi.cc/v1' || typeof config.apiKey !== 'string' || !config.apiKey) throw new Error('invalid_provider_config');
const settings = codexConfig(modelArg);
for (const required of ['request_max_retries = 0', 'stream_max_retries = 0', 'stream_idle_timeout_ms = 45000', 'inherit = "core"', 'env_key = "OLEA_CODEX_PROVIDER_KEY"', 'wire_api = "responses"']) if (!settings.includes(required)) throw new Error('unsafe_preflight');
const safe = text => String(text).split(config.apiKey).join('[REDACTED]').slice(0, 2048);
const marker = randomBytes(16).toString('hex');
const report = { attempt, observedAt: new Date().toISOString(), scope: process.env.OLEA_EXECUTION_SCOPE ?? 'host-only', platform: process.platform, node: process.version, model: modelArg, topLevelPrompts: 0, maxToolRounds: 12, maxTurnMs: 120000, streamIdleMs: 45000, requestRetries: 0, streamRetries: 0, httpRequests: null, httpRequestsLimit: 'stock protocol does not expose HTTP count; no automatic retry configured', remoteBilling: 'unknown', strictTokenCap: 'unsupported in inspected turn/start schema', events: {}, items: {}, processes: [], approvals: [], toolReceipts: [], errors: [], usage: [], assertions: {}, outcomes: {} };
let terminalResolve, terminalReject;
let terminal = new Promise((resolve, reject) => { terminalResolve = resolve; terminalReject = reject; });
// Install rejection handler before an early protocol fault can occur.
terminal.catch(() => {});
let backend;
let startingAt = performance.now(), firstEvent;
backend = new Backend({ entry: '', workspace, stateDir: join(directory, 'state'), codexEntry: resolve(entryArg), codexProviderPath: resolve(configArg), codexModel: modelArg, bridgePath: process.env.OLEA_BRIDGE_CONFIG }, event => {
  const record = event.record;
  if (record?.method) {
    firstEvent ??= performance.now() - startingAt;
    report.events[record.method] = (report.events[record.method] ?? 0) + 1;
    if (record.method === 'olea/process' && report.processes.length < 8) report.processes.push(record.params);
    if (record.method === 'item/started') { const type = record.params?.item?.type; report.items[type] = (report.items[type] ?? 0) + 1; }
    if (record.method === 'thread/tokenUsage/updated' && report.usage.length < 32) report.usage.push(record.params?.tokenUsage);
    if (record.method === 'error' && report.errors.length < 16) report.errors.push(safe(record.params?.error?.message ?? record.params?.message ?? 'upstream_error'));
    if (record.method === 'item/completed' && ['commandExecution', 'mcpToolCall'].includes(record.params?.item?.type) && report.toolReceipts.length < 32) {
      const item = record.params.item;
      const receipt = { type: item.type, id: item.id, status: item.status, exitCode: item.exitCode, command: safe(item.command ?? ''), output: safe(item.aggregatedOutput ?? ''), error: safe(item.error ?? '') };
      report.toolReceipts.push({ ...receipt, sha256: createHash('sha256').update(JSON.stringify(receipt)).digest('hex') });
    }
    if (record.id !== undefined && /requestApproval$/.test(record.method)) {
      const params = record.params ?? {};
      const exact = mode === 'controlled' && record.method === 'item/commandExecution/requestApproval' && params.command?.trim() === 'node task.cjs' && resolve(params.cwd ?? '') === workspace && !params.networkApprovalContext && !params.proposedExecpolicyAmendment && !params.proposedNetworkPolicyAmendments && !/unsandbox|outside|elevat|full.?access|bypass|disable|permission/i.test(params.reason ?? '');
      const decision = exact ? 'accept' : 'decline';
      report.approvals.push({ method: record.method, decision, command: safe(params.command ?? ''), cwd: safe(params.cwd ?? ''), reason: safe(params.reason ?? ''), kind: params.kind });
      try { backend.codexApproval('case', record.id, decision); } catch {}
    }
    if (record.method === 'turn/completed') { report.turn = { id: record.params?.turn?.id, status: record.params?.turn?.status, error: safe(record.params?.turn?.error?.message ?? '') }; terminalResolve(report.turn); }
  }
  if (event.type === 'fault') { report.errors.push(event.code); if (!['codex_delivery_unknown'].includes(event.code)) terminalReject(new Error(event.code)); }
});
try {
  report.start = await backend.startCodex('case');
  report.outcomes.initializedThread = 'pass';
  const preflightRead = await readFile(join(report.start.home, 'config.toml'), 'utf8');
  if (preflightRead !== settings && mode === 'unix') throw new Error('preflight_config_mismatch');
  report.providerConfigSha256 = createHash('sha256').update(preflightRead).digest('hex');
  let prompt = `In this workspace perform one bounded real Unix/dependency/child workflow. Use bash (Git Bash on Windows if necessary), Node and ordinary npm. Install is-number@7.0.0 with npm retries=0 and timeout=20000; do not retry failures. Create result.json containing marker "${marker}", dependency boolean from actually requiring is-number and checking 42 accepted plus "olea" rejected, child string from actually spawning Node printing 42, and secretAbsent boolean verifying OLEA_CODEX_PROVIDER_KEY is absent from the child shell environment. Do not print any environment values or inspect config/home/private files. Save an executable child-check.cjs which spawns process.execPath with ["-e","process.stdout.write('42')"] and prints its stdout; run it. Stop if sandbox fails or approval is denied; never disable sandbox or request expanded access. Use at most 10 tool calls and finish with a brief factual result.`;
  if (mode === 'phone') prompt = `Use registered olea_phone MCP tools to read capabilities, HOME, inspect launcher (default swipe then inspect if needed), and click Olea Fixture launcher entry through Accessibility; never launch by intent. Then generate a fresh random 32 lowercase hex value with Unix Node, save combined-value.txt, and send that same value using phone_fixture_action. Never read oracle data. No retries of uncertain phone effects; at most 12 tools. Keep sandbox and approvals enabled.`;
  if (mode === 'controlled') {
    const npmCli = process.env.OLEA_NPM_CLI ?? (process.platform === 'win32' ? join(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js') : resolve(dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js'));
    await writeFile(join(workspace, 'npmrc'), '');
    const script = `const fs=require('node:fs'),cp=require('node:child_process'),path=require('node:path');\nif(process.env.OLEA_CODEX_PROVIDER_KEY)throw Error('SECRET_INHERITED');\nconst npm=cp.spawnSync(process.execPath,[${JSON.stringify(npmCli)},'install','--no-audit','--no-fund','--ignore-scripts','--fetch-retries=0','--fetch-timeout=20000','--cache',path.join(process.cwd(),'.npm-cache'),'--userconfig',path.join(process.cwd(),'npmrc'),'is-number@7.0.0'],{cwd:process.cwd(),encoding:'utf8',timeout:25000});\nif(npm.status!==0){process.stdout.write('NPM_INSTALL_FAILED_'+String(npm.status));process.exit(3)}\nconst n=require('is-number');\nfs.writeFileSync('child-check.cjs',\"const c=require('node:child_process').spawnSync(process.execPath,['-e',\\\"process.stdout.write('42')\\\"],{encoding:'utf8'});if(c.status!==0)process.exit(4);process.stdout.write(c.stdout)\");\nconst child=cp.spawnSync(process.execPath,['child-check.cjs'],{encoding:'utf8',timeout:5000});\nif(child.status!==0||child.stdout!=='42')process.exit(4);\nfs.writeFileSync('result.json',JSON.stringify({marker:${JSON.stringify(marker)},dependency:n(42)&&!n('olea'),child:child.stdout,secretAbsent:true}));\nprocess.stdout.write('TASK_OK dependency=true child=42 secretAbsent=true');\n`;
    await writeFile(join(workspace, 'task.cjs'), script);
    if (spawnSync(process.execPath, ['--check', join(workspace, 'task.cjs')], { timeout: 5000, stdio: 'ignore', env: {} }).status !== 0) throw new Error('invalid_controlled_task_script');
    report.taskSha256 = createHash('sha256').update(script).digest('hex');
    prompt = 'Run exactly one shell command in this workspace: node task.cjs . The preselected deterministic task script installs is-number@7.0.0 with zero npm retries, checks actual dependency behavior, spawns a harmless Node child, verifies the provider key variable was not inherited, and writes result.json. Use the normal enabled sandbox. Do not inspect/change the script, request expanded permissions, disable sandbox, or repeat the action after any uncertain error. If command fails or approval is rejected, stop and report that factual result. No other tools are needed.';
  }
  report.topLevelPrompts = 1;
  const timeout = setTimeout(() => terminalReject(new Error('runner_turn_deadline_delivery_unknown')), 123000);
  try { report.ack = await backend.codexCommand('case', { method: 'turn/start', params: { text: prompt } }); await terminal; }
  finally { clearTimeout(timeout); }
  report.firstEventMs = firstEvent;
  report.outcomes.completedTurn = report.turn?.status === 'completed' ? 'pass' : 'fail';
  if (mode !== 'phone') {
    try {
      const result = JSON.parse(await readFile(join(workspace, 'result.json'), 'utf8'));
      report.assertions.exactFile = result.marker === marker;
      report.assertions.dependencyClaim = result.dependency === true;
      report.assertions.childClaim = result.child === '42';
      report.assertions.secretAbsentClaim = result.secretAbsent === true;
      const dependency = spawnSync(process.execPath, ['-e', "const n=require('is-number');if(!n(42)||n('olea'))process.exit(3);process.stdout.write('DEPENDENCY_OK')"], { cwd: workspace, timeout: 10000, encoding: 'utf8', env: { PATH: process.env.PATH, SystemRoot: process.env.SystemRoot } });
      report.assertions.independentDependency = dependency.status === 0 && dependency.stdout === 'DEPENDENCY_OK';
      const child = spawnSync(process.execPath, ['child-check.cjs'], { cwd: workspace, timeout: 10000, encoding: 'utf8', env: { PATH: process.env.PATH, SystemRoot: process.env.SystemRoot } });
      report.assertions.independentChild = child.status === 0 && child.stdout === '42';
      report.outcomes.unixWorkflow = Object.values(report.assertions).every(Boolean) && (report.items.commandExecution ?? 0) > 0 ? 'pass' : 'fail';
    } catch (error) { report.outcomes.unixWorkflow = 'fail'; report.errors.push(safe(error.code ?? error.message)); }
  } else report.outcomes.phoneWorkflow = 'awaiting-independent-native-oracle';
  await backend.stop('case');
  try { report.resume = await backend.startCodex('case', true); report.outcomes.resume = report.resume.threadId === report.start.threadId && report.resume.home === report.start.home && report.resume.cwd === report.start.cwd ? 'pass' : 'fail'; }
  catch (error) { report.outcomes.resume = 'fail'; report.errors.push(safe(error.message)); }
} catch (error) {
  report.outcomes.experiment = 'fail'; report.errors.push(safe(error.message));
} finally {
  await backend.close();
  report.elapsedMs = performance.now() - startingAt;
  report.workspace = await realpath(workspace);
  report.limits = ['Tool limit triggers interrupt after observing excess events; stock exposes no strict pre-execution tool-round cap', 'Authenticated host execution is not Android compatibility', 'Same-UID shell is not secret-file isolation', 'Windows root stop does not prove descendant exit', 'Acknowledgement does not prove tool effects or rollback', 'Provider HTTP count and remote billing unknown'];
  await writeFile(output, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ output, attempt, topLevelPrompts: report.topLevelPrompts, outcomes: report.outcomes }));
}
