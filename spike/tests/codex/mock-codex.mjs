// SPDX-License-Identifier: MIT
import readline from 'node:readline';
import { spawn } from 'node:child_process';
let initialized = false, active;
const send = value => process.stdout.write(JSON.stringify(value) + '\n');
readline.createInterface({ input: process.stdin }).on('line', line => {
  const record = JSON.parse(line), { id, method, params } = record;
  if (!method) {
    if (id === 'unknown') send({ method: 'fixture/unknownRejected', params: record.error });
    if (id === 'approval') { send({ method: 'fixture/approvalDecision', params: record.result }); send({ method: 'turn/completed', params: { threadId: 'thread-proved', turn: { id: active, status: record.result.decision === 'accept' ? 'completed' : 'interrupted' } } }); }
    return;
  }
  if (method === 'initialize') return send({ id, result: { userAgent: 'fake-codex' } });
  if (method === 'initialized') { initialized = true; return; }
  if (!initialized) return send({ id, error: { code: -32600 } });
  if (method === 'thread/start' || method === 'thread/resume') return send({ id, result: { thread: { id: params.threadId ?? 'thread-proved' } } });
  if (method === 'thread/read') return send({ id, result: { thread: { id: params.threadId, turns: [] } } });
  if (method === 'turn/interrupt') { send({ id, result: {} }); return send({ method: 'turn/completed', params: { threadId: params.threadId, turn: { id: params.turnId, status: 'interrupted' } } }); }
  if (method === 'turn/start') {
    const text = params.input[0].text;
    if (text === 'malformed') return process.stdout.write('not JSON\n');
    if (text === 'oversize') return process.stdout.write('x'.repeat(262145) + '\n');
    if (text === 'exit') return process.exit(4);
    if (text === 'noack') return;
    if (text === 'foreign') {
      send({ method: 'turn/completed', params: { threadId: params.threadId, turn: { id: 'old-turn', status: 'completed' } } });
      for (let i = 0; i < 13; i++) send({ method: 'item/started', params: { threadId: 'foreign-thread', turnId: 'foreign-turn', item: { type: 'commandExecution' } } });
    }
    active = 'turn-' + id;
    if (text === 'pipe-holder') spawn(process.execPath, ['-e', 'setTimeout(()=>process.exit(0),2000)'], { stdio: ['ignore', process.stdout, process.stderr] }).unref();
    if (text === 'preack') for (let i = 0; i < 13; i++) send({ method: 'item/started', params: { threadId: params.threadId, turnId: active, item: { type: 'commandExecution' } } });
    send({ id, result: { turn: { id: active, status: 'inProgress' } } });
    if (text === 'approval') return send({ id: 'approval', method: 'item/commandExecution/requestApproval', params: { threadId: params.threadId, turnId: active, command: 'harmless fixture' } });
    if (text === 'unknown') return send({ id: 'unknown', method: 'future/request', params: {} });
    if (!['wait', 'foreign', 'preack'].includes(text)) send({ method: 'turn/completed', params: { threadId: params.threadId, turn: { id: active, status: 'completed' } } });
  }
});
