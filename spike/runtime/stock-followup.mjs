// Original source MIT. Follow-up probes use the installed package's declared bin, not historical file assumptions.
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { run } from '../tests/runner/process.mjs';
const output = '/workspace/stock-agent-followup';
await mkdir(output, { recursive: true });
const packageDir = '/workspace/stock-agent-probe/claude/node_modules/@anthropic-ai/claude-code';
const metadata = JSON.parse(await readFile(join(packageDir, 'package.json'), 'utf8'));
const bin = resolve(packageDir, typeof metadata.bin === 'string' ? metadata.bin : metadata.bin.claude);
const env = { HOME: '/root', PATH: process.env.PATH, LANG: 'C.UTF-8', CLAUDE_CONFIG_DIR: `${output}/claude-home`, DISABLE_AUTOUPDATER: '1' };
const report = { node: process.version, platform: process.platform, arch: process.arch, version: metadata.version, declaredBin: metadata.bin, cases: [] };
for (const arg of ['--version', '--help']) {
  const result = await run(bin, [arg], { env, timeoutMs: 30000, maxBytes: 65536 });
  report.cases.push({ name: `claude${arg}`, ...result });
}
await writeFile(`${output}/results.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
