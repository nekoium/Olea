// SPDX-License-Identifier: MIT
import { readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { homedir } from 'node:os';
import { Backend } from './backend.js';
import { JsonLines, MAX_QUEUED_BYTES, type RecordData } from './pi-process.js';

const secrets: string[] = [];
try {
  const models = JSON.parse(readFileSync(join(homedir(), '.pi/agent/models.json'), 'utf8'));
  for (const provider of Object.values(models.providers ?? {}) as Record<string, unknown>[]) {
    if (typeof provider.apiKey === 'string') secrets.push(provider.apiKey);
  }
} catch { /* An unconfigured provider must not prevent no-model startup. */ }
for (const key of ['OLEA_PROVIDER_CONFIG', 'OLEA_BRIDGE_CONFIG']) {
  if (process.env[key]) {
    const config = JSON.parse(readFileSync(process.env[key]!, 'utf8'));
    for (const name of ['apiKey', 'token']) if (typeof config[name] === 'string') secrets.push(config[name]);
  }
}
if (process.env.OLEA_BRIDGE_TOKEN_FILE) secrets.push(readFileSync(process.env.OLEA_BRIDGE_TOKEN_FILE, 'utf8').trim());
let shuttingDown = false;
function output(record: RecordData) {
  let text = JSON.stringify(record);
  for (const secret of secrets) if (secret) text = text.split(secret).join('[REDACTED]');
  if (process.stdout.writableLength + Buffer.byteLength(text) > MAX_QUEUED_BYTES) { void shutdown(2); return; }
  process.stdout.write(text + '\n');
}
const backend = new Backend({
  entry: process.env.OLEA_PI_ENTRY ?? '', workspace: resolve(process.env.OLEA_WORKSPACE ?? process.cwd()),
  workspaceRoot: resolve(process.env.OLEA_WORKSPACE_ROOT ?? '/workspace'),
  stateDir: resolve(process.env.OLEA_STATE_DIR ?? '.setup/olea-state'),
  codexEntry: process.env.OLEA_CODEX_ENTRY, codexProviderPath: process.env.OLEA_PROVIDER_CONFIG,
  codexModel: process.env.OLEA_CODEX_MODEL, codexAccessMode: process.env.OLEA_CODEX_ACCESS_MODE as 'workspace-write' | 'full-access' | undefined, bridgePath: process.env.OLEA_BRIDGE_CONFIG,
}, output);
async function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  process.stdin.pause();
  await backend.close();
  process.exitCode = code;
}
async function handle(record: RecordData) {
  const { id, session, type } = record;
  try {
    if (typeof id !== 'string' || id.length > 128) throw new Error('invalid_id');
    let data;
    if (type === 'start') data = await backend.start(session, record.resume === true, record.workspace);
    else if (type === 'codex_start') data = await backend.startCodex(session, record.resume === true, record.workspace);
    else if (type === 'codex_command') data = await backend.codexCommand(session, record.command);
    else if (type === 'codex_approval') data = backend.codexApproval(session, record.requestId, record.decision);
    else if (type === 'stop') data = await backend.stop(session);
    else if (type === 'status') data = backend.status();
    else if (type === 'command') data = await backend.command(session, record.command);
    else throw new Error('unsupported_command');
    output({ type: 'response', id, success: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    output({ type: 'response', id, success: false, error: /^[a-z_]+$/.test(message) ? message : 'backend_request_failed' });
  }
}
const input = new JsonLines(record => { void handle(record); });
process.stdin.on('data', chunk => { try { input.push(chunk); } catch { output({ type: 'fault', code: 'invalid_or_oversize_input' }); void shutdown(2); } });
process.stdin.on('end', () => { void shutdown(); });
process.on('SIGINT', () => { void shutdown(); });
process.on('SIGTERM', () => { void shutdown(); });
process.stdout.on('error', () => { void shutdown(2); });
output({ type: 'ready', protocol: 1, maxSessions: 2, pid: process.pid });
