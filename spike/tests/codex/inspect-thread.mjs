// SPDX-License-Identifier: MIT
// Own experiment thread only; no model turn is submitted.
import { readFile, writeFile } from 'node:fs/promises';
import { Backend } from '../../backend/dist/backend.js';
import { resolve } from 'node:path';
const [receiptPath, providerPath, entry, outputPath] = process.argv.slice(2);
const receipt = JSON.parse(await readFile(receiptPath, 'utf8'));
const config = JSON.parse(await readFile(providerPath, 'utf8'));
const safe = value => JSON.stringify(value).split(config.apiKey).join('[REDACTED]').slice(0, 16384);
const backend = new Backend({ entry: '', workspace: receipt.start.cwd, stateDir: resolve(receipt.start.home, '../../..'), codexEntry: resolve(entry), codexProviderPath: resolve(providerPath) }, () => {});
try {
  await backend.startCodex('case', true);
  const read = await backend.codexCommand('case', { method: 'thread/read' });
  const result = { threadId: read.thread.id, noModelRequests: true, turns: read.thread.turns.map(turn => ({ id: turn.id, status: turn.status, items: turn.items.filter(item => ['commandExecution', 'agentMessage'].includes(item.type)).map(item => ({ type: item.type, command: item.command, status: item.status, exitCode: item.exitCode, output: item.aggregatedOutput, text: item.text })) })) };
  await writeFile(outputPath, safe(result));
} finally { await backend.close(); }
