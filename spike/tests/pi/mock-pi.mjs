// SPDX-License-Identifier: MIT
import { createInterface } from 'node:readline';
import { join } from 'node:path';
const sessionDir = process.argv[process.argv.indexOf('--session-dir') + 1];
for await (const line of createInterface({ input: process.stdin })) {
  const request = JSON.parse(line);
  const data = request.type === 'get_state' ? { sessionFile: join(sessionDir, 'fixture.jsonl'), messageCount: 0 } : { echo: request.message };
  if (request.type === 'hang') continue;
  if (request.type === 'oversize') { process.stdout.write('x'.repeat(300000)); continue; }
  console.log(JSON.stringify({ type: 'response', id: request.id, success: true, data }));
}
