// Original Olea feasibility tooling, MIT.
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { run } from '../tests/runner/process.mjs';

const outDir = resolve(process.argv[2] ?? '.setup/evidence/host');
await mkdir(outDir, { recursive: true });
const cases = [];
const commands = process.platform === 'win32' ? {
  codex: ['cmd.exe', ['/d', '/s', '/c', 'codex']],
  claude: ['cmd.exe', ['/d', '/s', '/c', 'claude']],
  npm: ['cmd.exe', ['/d', '/s', '/c', 'npm']],
} : Object.fromEntries(['codex', 'claude', 'npm'].map(name => [name, [name, []]]));
async function probe(id, program, args, options = {}) {
  const [command, prefix] = commands[program];
  const result = await run(command, [...prefix, ...args], options);
  const status = result.spawnError === 'ENOENT' ? 'blocked' : result.exitCode === 0 && !result.timedOut && !result.overflow ? 'pass' : 'fail';
  cases.push({ id, status, scope: 'host-only', assertion: 'command completed successfully; does not establish Android compatibility or authenticated workflows', ...result });
  console.log(`${id}: ${status} (${result.elapsedMs} ms)`);
}
await probe('host.codex.version', 'codex', ['--version']);
await probe('host.codex.help', 'codex', ['--help']);
await probe('host.codex.app-server.help', 'codex', ['app-server', '--help']);
await probe('host.claude.version', 'claude', ['--version']);
await probe('host.claude.help', 'claude', ['--help']);
for (const [name, pkg] of [['codex', '@openai/codex'], ['claude', '@anthropic-ai/claude-code'], ['claude-sdk', '@anthropic-ai/claude-agent-sdk']]) {
  await probe(`registry.${name}.metadata`, 'npm', ['view', pkg, 'version', 'engines', 'license', 'dist', 'repository', '--json', '--fetch-retries=0', '--fetch-timeout=15000'], { timeoutMs: 20000 });
}
cases.push(...['codex', 'claude'].map(agent => ({ id: `host.${agent}.authenticated-workflow`, status: 'blocked', scope: 'host-only', reason: 'No agent-specific authentication/subscription authorized for this probe; custom Pi provider credentials are not Codex/Claude authentication.' })));
const document = { schemaVersion: 1, generatedAt: new Date().toISOString(), environment: { platform: process.platform, arch: process.arch, node: process.version }, cases };
await writeFile(resolve(outDir, 'stock-agents.json'), JSON.stringify(document, null, 2) + '\n');
console.log(`Evidence: ${outDir}/stock-agents.json`);
