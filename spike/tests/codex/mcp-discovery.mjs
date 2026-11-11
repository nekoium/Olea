// SPDX-License-Identifier: MIT
// Real stock MCP discovery, no model prompt or Android action.
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { Backend } from '../../backend/dist/backend.js';
import { phoneTools } from '../../backend/dist/phone-mcp.js';
const [provider, entry, output, accessMode = 'workspace-write'] = process.argv.slice(2);
if (!['workspace-write','full-access'].includes(accessMode)) throw Error('invalid_access_mode');
await mkdir('.setup/codex-mcp', { recursive: true });
const directory = await mkdtemp(resolve('.setup/codex-mcp/attempt-'));
const workspace = join(directory, 'workspace'); await mkdir(workspace);
const bridgePath = join(directory, 'synthetic-bridge.json');
await writeFile(bridgePath, JSON.stringify({ url: 'http://127.0.0.1:9', token: 'synthetic-no-phone-request' }));
const report = { accessMode, expectedTools: phoneTools.map(tool=>tool.name), noModelRequests: true, noAndroidActions: true, events: [], directory };
const backend = new Backend({ entry: '', workspace, stateDir: join(directory, 'state'), codexEntry: resolve(entry), codexProviderPath: provider === '-' ? undefined : resolve(provider), codexAccessMode: accessMode, bridgePath }, event => { if (event.record?.method) report.events.push(event.record.method); });
try {
  report.start = await backend.startCodex('discovery');
  const status = await backend.codexCommand('discovery', { method: 'mcpServerStatus/list' });
  report.servers = status.data.map(server => ({ name: server.name, runtimeStatus: server.runtimeStatus, toolsError: server.toolsError, toolNames: Object.keys(server.tools), serverInfo: server.serverInfo }));
  const server = report.servers.find(server => server.name === 'olea_phone');
  report.status = server && report.expectedTools.every(name=>server.toolNames.includes(name)) && !server.toolsError ? 'pass' : 'fail';
} catch (error) { report.status = 'fail'; report.error = error.message; }
finally { await backend.close(); await writeFile(output, JSON.stringify(report, null, 2)); console.log(JSON.stringify({ output, status: report.status, error: report.error })); }
