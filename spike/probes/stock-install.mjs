// Original Olea feasibility tooling, MIT. Run with stock Linux Node inside Ubuntu/PRoot.
// This installs only into the explicitly selected task directory, never globally.
import { mkdir, writeFile, readFile, realpath } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { run } from '../tests/runner/process.mjs';

const root = resolve(process.argv[2] ?? '.setup/stock-agent-probe');
await mkdir(root, { recursive: true });
const cases = [];
const env = { ...process.env, CODEX_HOME: resolve(root, 'codex-home'), CLAUDE_CONFIG_DIR: resolve(root, 'claude-home'), CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: '1' };
// Do not inherit provider credentials into unrelated agent probes.
for (const name of Object.keys(env)) if (/API_KEY|AUTH_TOKEN|ACCESS_TOKEN/.test(name)) delete env[name];
const npm = process.platform === 'win32' ? 'cmd.exe' : 'npm';
const npmPrefix = process.platform === 'win32' ? ['/d', '/s', '/c', 'npm'] : [];
async function check(id, command, args, options = {}) {
  const result = await run(command, args, { cwd: root, env, ...options });
  const status = result.spawnError === 'ENOENT' ? 'blocked' : result.exitCode === 0 && !result.timedOut && !result.overflow ? 'pass' : 'fail';
  cases.push({ id, status, ...result });
  await save();
  console.log(`${id}: ${status} (${result.elapsedMs} ms)`);
  return result;
}
async function save() {
  await writeFile(resolve(root, 'results.json'), JSON.stringify({ schemaVersion: 1, generatedAt: new Date().toISOString(), scope: process.platform === 'linux' ? 'linux-runtime-see-owner-manifest' : 'host-only', environment: { node: process.version, platform: process.platform, arch: process.arch }, cases }, null, 2) + '\n');
}
for (const [agent, pkg, version, bin] of [
  ['codex', '@openai/codex', '0.167.0', 'bin/codex.js'],
  ['claude', '@anthropic-ai/claude-code', '2.1.322', 'cli.js'],
]) {
  const directory = resolve(root, agent);
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, 'package.json'), JSON.stringify({ private: true, description: 'Disposable Olea compatibility probe' }));
  const install = await check(`${agent}.install`, npm, [...npmPrefix, 'install', '--prefix', directory, '--no-audit', '--no-fund', '--fetch-retries=0', '--fetch-timeout=20000', `${pkg}@${version}`], { timeoutMs: 180000, maxBytes: 65536 });
  if (install.exitCode !== 0 || install.timedOut || install.overflow) {
    cases.push({ id: `${agent}.startup`, status: 'blocked', reason: 'Stock package installation failed; inspect separate install evidence.' });
    continue;
  }
  const entry = resolve(directory, 'node_modules', pkg, bin);
  await check(`${agent}.version`, process.execPath, [entry, '--version'], { timeoutMs: 30000 });
  await check(`${agent}.help`, process.execPath, [entry, '--help'], { timeoutMs: 30000, maxBytes: 65536 });
  if (agent === 'codex') await check('codex.app-server.help', process.execPath, [entry, 'app-server', '--help'], { timeoutMs: 30000 });
  for (const file of ['package-lock.json', `node_modules/${pkg}/package.json`, `node_modules/${pkg}/${bin}`]) {
    try {
      const bytes = await readFile(resolve(directory, file));
      cases.push({ id: `${agent}.artifact.${file}`, status: 'pass', sha256: createHash('sha256').update(bytes).digest('hex'), sizeBytes: bytes.length, path: file });
    } catch (error) { cases.push({ id: `${agent}.artifact.${file}`, status: 'fail', reason: error.code }); }
  }
}
const sdkDir = resolve(root, 'claude-sdk');
await mkdir(sdkDir, { recursive: true });
await writeFile(resolve(sdkDir, 'package.json'), JSON.stringify({ private: true }));
const sdk = await check('claude-sdk.install', npm, [...npmPrefix, 'install', '--prefix', sdkDir, '--no-audit', '--no-fund', '--fetch-retries=0', '--fetch-timeout=20000', '@anthropic-ai/claude-agent-sdk@0.3.322'], { timeoutMs: 180000, maxBytes: 65536 });
if (sdk.exitCode === 0 && !sdk.timedOut && !sdk.overflow) {
  const manifestPath = resolve(sdkDir, 'node_modules/@anthropic-ai/claude-agent-sdk/package.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const exportPath = typeof manifest.exports?.['.'] === 'string' ? manifest.exports['.'] : manifest.exports?.['.']?.import ?? manifest.main ?? './sdk.mjs';
  const entry = await realpath(resolve(sdkDir, 'node_modules/@anthropic-ai/claude-agent-sdk', exportPath));
  await check('claude-sdk.query-interface', process.execPath, ['--input-type=module', '-e', `const sdk=await import(${JSON.stringify(pathToFileURL(entry).href)});if(typeof sdk.query!=='function')process.exit(1);console.log('query function exported; no authenticated request made')`]);
}
for (const agent of ['codex', 'claude']) cases.push({ id: `${agent}.authenticated-workflow`, status: 'blocked', reason: 'No agent-specific authentication/subscription supplied; Pi custom provider does not authenticate this agent.' });
await save();
console.log(`Evidence: ${root}/results.json`);
