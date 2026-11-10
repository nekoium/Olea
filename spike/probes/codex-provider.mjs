// SPDX-License-Identifier: MIT
// Stock Codex custom-provider test. Secret only enters child env, never argv/config/report.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { run } from '../tests/runner/process.mjs';
import { authorizedProviderFile } from './responses-provider.mjs';

const root = resolve(process.argv[2] ?? '.setup/codex-provider');
const config = JSON.parse(await readFile(process.env.OLEA_PROVIDER_CONFIG ?? authorizedProviderFile, 'utf8'));
if (config.baseUrl !== 'https://api.chiyi.cc/v1' || typeof config.apiKey !== 'string' || !config.apiKey) throw new Error('invalid_authorized_provider_config');
const home = resolve(root, 'home');
const workspace = resolve(root, 'workspace');
await mkdir(home, { recursive: true });
await mkdir(workspace, { recursive: true });
const env = { ...process.env, CODEX_HOME: home };
for (const key of Object.keys(env)) if (/API_KEY|AUTH_TOKEN|ACCESS_TOKEN/.test(key)) delete env[key];
env.OLEA_CODEX_TEST_KEY = config.apiKey;
const entry = process.env.OLEA_CODEX_ENTRY;
const command = entry ? process.execPath : process.platform === 'win32' ? 'cmd.exe' : 'codex';
const prefix = entry ? [resolve(entry)] : process.platform === 'win32' ? ['/d', '/s', '/c', 'codex'] : [];
const results = [];
for (const model of ['gpt-6.1-terra']) {
  await writeFile(resolve(home, 'config.toml'), `model = ${JSON.stringify(model)}\nmodel_provider = "olea_test"\nweb_search = "disabled"\n[features]\nmulti_agent = false\n[shell_environment_policy]\nexclude = ["OLEA_CODEX_TEST_KEY"]\n[model_providers.olea_test]\nname = "Olea authorized test endpoint"\nbase_url = "https://api.chiyi.cc/v1"\nenv_key = "OLEA_CODEX_TEST_KEY"\nwire_api = "responses"\nrequires_openai_auth = false\nrequest_max_retries = 0\nstream_max_retries = 0\nstream_idle_timeout_ms = 15000\nsupports_websockets = false\n`, { mode: 0o600 });
  const result = await run(command, [...prefix, 'exec', '--ephemeral', '--skip-git-repo-check', '--ignore-rules', '--sandbox', 'read-only', '--json', '-C', workspace, '-'], {
    env, cwd: workspace, timeoutMs: 45000, maxBytes: 65536,
    input: 'This is a bounded compatibility test. Reply with exactly OLEA_CODEX_OK. Do not use tools, spawn agents, read files or run commands.\n',
  });
  const records = result.stdout.split('\n').flatMap(line => { try { return [JSON.parse(line)]; } catch { return []; } });
  const markerVerified = records.some(record => record.type === 'item.completed' && record.item?.type === 'agent_message' && record.item.text?.trim() === 'OLEA_CODEX_OK');
  const toolItems = records.filter(record => record.item && ['command_execution', 'mcp_tool_call', 'web_search'].includes(record.item.type)).length;
  const completed = records.find(record => record.type === 'turn.completed');
  const pass = result.exitCode === 0 && markerVerified && toolItems === 0 && !result.timedOut && !result.overflow;
  const knownDiagnostics = ['401', '403', '404', '429', 'unsupported', 'invalid', 'stream disconnected', 'timed out', 'connection', 'SSL', 'TLS'].filter(value => (result.stderr + result.stdout).toLowerCase().includes(value.toLowerCase()));
  results.push({ model, status: pass ? 'pass' : 'fail', exitCode: result.exitCode, timedOut: result.timedOut, overflow: result.overflow,
    elapsedMs: result.elapsedMs, markerVerified, toolItems, eventTypes: [...new Set(records.map(record => record.type).filter(type => /^[a-z_.]{1,80}$/.test(type ?? '')))],
    usage: completed?.usage ? { inputTokens: completed.usage.input_tokens, outputTokens: completed.usage.output_tokens, cachedInputTokens: completed.usage.cached_input_tokens } : undefined,
    diagnosticClasses: knownDiagnostics, stderrBytes: Buffer.byteLength(result.stderr), retainedRawLogs: false, retriesConfigured: 0 });
  if (pass) break;
}
const report = { schemaVersion: 1, generatedAt: new Date().toISOString(), scope: process.platform === 'linux' ? 'linux-runtime-see-owner-manifest' : 'host-only', node: process.version,
  id: 'codex.custom-provider.authenticated-echo', provider: 'https://api.chiyi.cc/v1', protocol: 'responses', results,
  independentAssertion: 'Runner parses stock JSON events and independently checks exact final marker, turn completion and no tool item.',
  limits: ['Echo does not establish tools, Android sandboxing or normal session lifecycle.', 'Protected env key excludes shell inheritance; no raw model/stderr text, credentials or headers retained.'] };
await writeFile(resolve(root, 'results.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ output: resolve(root, 'results.json'), results }));
