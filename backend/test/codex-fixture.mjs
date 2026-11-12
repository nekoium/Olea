// SPDX-License-Identifier: MIT
// Local app-server protocol fixture; never executes a shell or contacts a provider.
import { createInterface } from 'node:readline';
import { existsSync } from 'node:fs';
let active;
const send = value => process.stdout.write(JSON.stringify(value) + '\n');
for await (const line of createInterface({ input: process.stdin })) {
  const { id, method, params } = JSON.parse(line);
  if (method === 'initialize') send({ id, result: { userAgent: 'protocol-fixture' } });
  else if (method === 'initialized') continue;
  else if (method === 'thread/start' || method === 'thread/resume') send({ id, result: { thread: { id: params.threadId ?? 'saved-thread' }, received: params, providerConfigured: Boolean(process.env.OLEA_CODEX_PROVIDER_KEY), bridgeConfigInherited: Boolean(process.env.OLEA_BRIDGE_CONFIG) } });
  else if (method === 'thread/read') {
    if (params.includeTurns && existsSync('unsupported-turns')) send({ id, error: { code: -32600, message: 'list_turns is not supported yet' } });
    else send({ id, result: { thread: { id: params.threadId, ...(params.includeTurns ? { turns: [{ id: 'saved-turn', items: [{ type: 'agentMessage', text: 'history' }] }] } : {}) }, includeTurns: params.includeTurns } });
  }
  else if (method === 'turn/start') {
    active = 'turn-' + id;
    send({ method: 'turn/started', params: { threadId: params.threadId, turn: { id: active } } });
    // Tool notifications may arrive before the turn/start acknowledgement.
    for (let index = 0; index < 20; index++) send({ method: 'item/started', params: { threadId: params.threadId, turnId: active, item: { id: 'tool-' + index, type: 'commandExecution' } } });
    send({ method: 'item/agentMessage/delta', params: { threadId: params.threadId, turnId: active, itemId: 'reply', delta: 'streamed' } });
    if (params.input[0].text === 'noack') continue;
    send({ id, result: { turn: { id: active } } });
    if (params.input[0].text === 'complete') send({ method: 'turn/completed', params: { threadId: params.threadId, turn: { id: active, status: 'completed' } } });
  }
  else if (method === 'turn/interrupt') {
    send({ id, result: { interrupted: params.turnId } });
    send({ method: 'turn/completed', params: { threadId: params.threadId, turn: { id: params.turnId, status: 'interrupted' } } });
  }
  else if (method === 'command/exec') send({ id, result: { exitCode: 0, stdout: 'fixture', stderr: '', received: params } });
  else send({ id, error: { code: -32601 } });
}
