// SPDX-License-Identifier: MIT
// Protocol fixture only; never used as an Android runtime or workflow substitute.
import { createInterface } from 'node:readline';
import { join } from 'node:path';
import { appendFileSync, writeFileSync } from 'node:fs';
const directory = process.argv[process.argv.indexOf('--session-dir') + 1];
const session = join(directory, 'fixture.jsonl');
const resumed = process.argv.includes('--session');
for await (const line of createInterface({ input: process.stdin })) {
  const request = JSON.parse(line);
  let data = {};
  if (request.type === 'get_state') data = { sessionFile: session, resumed, argv: process.argv.slice(2) };
  if (request.type === 'bash') { writeFileSync(session, 'saved\n'); writeFileSync(join(process.cwd(), 'workspace-kept.txt'), 'kept\n'); }
  if (request.type === 'prompt') appendFileSync(join(directory, 'submissions.txt'), request.message + '\n');
  console.log(JSON.stringify({ type: 'response', id: request.id, success: true, data }));
}
