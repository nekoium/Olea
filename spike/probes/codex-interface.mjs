// Original Olea feasibility tooling, MIT. No model/auth request; isolated app-server initialization only.
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { run } from '../tests/runner/process.mjs';

const root = resolve(process.argv[2] ?? '.setup/codex-interface');
await mkdir(root, { recursive: true });
const env = { ...process.env, CODEX_HOME: resolve(root, 'codex-home') };
await mkdir(env.CODEX_HOME, { recursive: true });
for (const key of Object.keys(env)) if (/API_KEY|AUTH_TOKEN|ACCESS_TOKEN/.test(key)) delete env[key];
const entry = process.argv[3];
const command = entry ? process.execPath : process.platform === 'win32' ? 'cmd.exe' : 'codex';
const prefix = entry ? [resolve(entry)] : process.platform === 'win32' ? ['/d', '/s', '/c', 'codex'] : [];
const result = await run(command, [...prefix, 'app-server', '--listen', 'stdio://'], {
  cwd: root, env, timeoutMs: 20000, maxBytes: 32768,
  input: JSON.stringify({ id: 1, method: 'initialize', params: { clientInfo: { name: 'olea_feasibility', version: '0.0.0' } } }) + '\n' + JSON.stringify({ method: 'initialized' }) + '\n',
});
const replies = result.stdout.split('\n').flatMap(line => { try { return [JSON.parse(line)]; } catch { return []; } });
const initialized = replies.find(reply => reply.id === 1 && reply.result && !reply.error);
const document = { schemaVersion: 1, generatedAt: new Date().toISOString(), scope: process.platform === 'linux' ? 'linux-runtime-see-owner-manifest' : 'host-only',
  id: 'codex.app-server.initialize', status: initialized ? 'pass' : 'fail',
  independentAssertion: initialized ? 'Runner parsed a structured initialize response matching request id 1 from isolated stock app-server.' : 'No matching successful initialize response parsed.',
  limitation: 'Initialization alone proves neither authenticated turns nor tool/sandbox behavior on Android.', result };
await writeFile(resolve(root, 'results.json'), JSON.stringify(document, null, 2) + '\n');
console.log(JSON.stringify({ id: document.id, status: document.status, exitCode: result.exitCode, timedOut: result.timedOut, output: resolve(root, 'results.json') }));
