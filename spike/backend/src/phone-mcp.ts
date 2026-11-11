// SPDX-License-Identifier: MIT
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { JsonLines, MAX_QUEUED_BYTES, type RecordData } from './pi-process.js';

// MCP stdio 2024-11-05. All phone effects remain permission-checked by Kotlin.
export const phoneTools = [
  { name: 'phone_capabilities', operation: 'capabilities', description: 'Read current native Android permissions and stop state.', properties: {}, required: [] },
  { name: 'phone_home', operation: 'global_action', description: 'Use Accessibility HOME to show launcher.', properties: {}, required: [], fixed: { action: 'home' } },
  { name: 'phone_inspect', operation: 'accessibility_tree', description: 'Inspect bounded Android UI tree. Node identifiers expire on next inspection.', properties: {}, required: [] },
  { name: 'phone_click', operation: 'accessibility_click', description: 'Accessibility click current nodeId. Open target app by clicking launcher entry, not intent.', properties: { nodeId: { type: 'string', maxLength: 256 } }, required: ['nodeId'] },
  { name: 'phone_swipe', operation: 'swipe', description: 'Use default Accessibility swipe up to open launcher app drawer, then inspect again.', properties: {}, required: [] },
  { name: 'phone_open_url', operation: 'open_url', description: 'Open a supplied HTTPS destination in the browser; dispatch alone does not prove arrival.', properties: { url: { type: 'string', maxLength: 2048, pattern: '^https://' } }, required: ['url'] },
  { name: 'phone_location', operation: 'location', description: 'Read last-known Android location subject to native permission; inspect timestamp and age.', properties: {}, required: [] },
  { name: 'phone_files_write_read', operation: 'files_write_read', description: 'Create and read back a bounded file only in the folder previously selected through Android consent.', properties: { value: { type: 'string', maxLength: 128 } }, required: ['value'] },
  { name: 'phone_notifications', operation: 'notifications', description: 'Read bounded separate fixture notifications after notification access is granted.', properties: {}, required: [] },
  { name: 'phone_fixture_notify', operation: 'fixture_notify', description: 'Ask the separate cooperating fixture app to post its harmless test notification.', properties: {}, required: [] },
  { name: 'phone_capture_request', operation: 'capture_request', description: 'Request fresh system screen-capture consent; user must decide. Does not grant consent.', properties: {}, required: [] },
  { name: 'phone_capture_result', operation: 'capture_result', description: 'Read metadata of the consented capture; no input control or private oracle access.', properties: {}, required: [] },
  { name: 'phone_folder_request', operation: 'folder_request', description: 'Request Android folder picker. User must select and grant access.', properties: {}, required: [] },
  { name: 'phone_fixture_action', operation: 'fixture_action', description: 'Write supplied value using cooperating fixture interface; cannot read verification state.', properties: { value: { type: 'string', maxLength: 128 } }, required: ['value'] },
];
export async function callPhone(name: string, args: RecordData, configPath: string) {
  const tool = phoneTools.find(tool => tool.name === name);
  if (!tool || !args || Array.isArray(args) || typeof args !== 'object') throw new Error('invalid_tool');
  if (Object.keys(args).some(key => !Object.hasOwn(tool.properties, key))) throw new Error('invalid_arguments');
  for (const key of tool.required) {
    const property = (tool.properties as Record<string, { maxLength?: number; pattern?: string }>)[key];
    if (typeof args[key] !== 'string' || !args[key] || args[key].length > (property.maxLength ?? 128) ||
      (property.pattern && !new RegExp(property.pattern).test(args[key]))) throw new Error('invalid_arguments');
  }
  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  const url = new URL(config.url);
  if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' || !config.token) throw new Error('invalid_bridge');
  try {
    const response = await fetch(new URL('/phone', url), { method: 'POST', headers: { authorization: `Bearer ${config.token}`, 'content-type': 'application/json' }, body: JSON.stringify({ id: randomUUID(), operation: tool.operation, args: tool.fixed ?? args }), signal: AbortSignal.timeout(10_000), redirect: 'error' });
    const reader = response.body?.getReader();
    if (!reader) throw new Error();
    const chunks: Uint8Array[] = []; let size = 0;
    while (true) { const next = await reader.read(); if (next.done) break; size += next.value.length; if (size > 65536) { await reader.cancel(); throw new Error(); } chunks.push(next.value); }
    const record = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    if (!response.ok || record.ok !== true) throw new Error();
    let text = JSON.stringify(record.result);
    text = text.split(config.token).join('[REDACTED]');
    return { content: [{ type: 'text', text }], isError: false };
  } catch { return { content: [{ type: 'text', text: 'native_bridge_failed_or_denied_delivery_unknown_no_replay' }], isError: true }; }
}
function main() {
  // Fail closed if stock MCP environment selection ever forwards provider authority.
  if (process.env.OLEA_CODEX_PROVIDER_KEY || process.env.OLEA_PROVIDER_CONFIG) { process.exitCode = 2; return; }
  let active = 0;
  function output(record: RecordData) {
    const text = JSON.stringify(record) + '\n';
    if (process.stdout.writableLength + Buffer.byteLength(text) > MAX_QUEUED_BYTES) { process.exitCode = 2; process.stdin.destroy(); return; }
    process.stdout.write(text);
  }
  async function handle(record: RecordData) {
    if (record.id === undefined) return;
    const reply = (result: unknown) => output({ jsonrpc: '2.0', id: record.id, result });
    if (record.method === 'initialize') return reply({ protocolVersion: '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: 'olea-phone', version: '0.0.0' } });
    if (record.method === 'ping') return reply({});
    if (record.method === 'tools/list') return reply({ tools: phoneTools.map(tool => ({ name: tool.name, description: tool.description, inputSchema: { type: 'object', properties: tool.properties, required: tool.required, additionalProperties: false } })) });
    if (record.method === 'tools/call' && active < 1) {
      active++;
      try { return reply(await callPhone(record.params?.name, record.params?.arguments ?? {}, process.argv[2])); }
      catch { return reply({ content: [{ type: 'text', text: 'invalid_phone_tool_request' }], isError: true }); }
      finally { active--; }
    }
    output({ jsonrpc: '2.0', id: record.id, error: { code: -32601, message: 'unsupported_or_busy' } });
  }
  const lines = new JsonLines(record => { void handle(record); });
  process.stdin.on('data', chunk => { try { lines.push(chunk); } catch { process.exitCode = 2; process.stdin.destroy(); } });
  process.stdout.on('error', () => { process.exitCode = 2; process.stdin.destroy(); });
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
