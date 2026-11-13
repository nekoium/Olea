// SPDX-License-Identifier: MIT
import { createInterface } from 'node:readline';
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const arg = name => args[args.indexOf(name) + 1];
const id = arg(args.includes('--resume') ? '--resume' : '--session-id');
const home = process.env.HOME;
const project = join(home, '.claude/projects/fixture');
const transcript = join(project, `${id}.jsonl`);
const output = record => process.stdout.write(JSON.stringify(record) + '\n');
let parent = null;
let sequence = 0;
writeFileSync(join(home, 'launch.json'), JSON.stringify({ args, env: process.env }));
for await (const line of createInterface({ input: process.stdin })) {
  const record = JSON.parse(line);
  if (record.type === 'control_request') {
    if (record.request.subtype === 'initialize') {
      if (args.includes('--resume')) readFileSync(transcript);
      output({ type: 'control_response', response: { subtype: 'success', request_id: record.request_id, response: { commands: [] } } });
    } else if (record.request.subtype === 'interrupt') {
      output({ type: 'control_response', response: { subtype: 'success', request_id: record.request_id, response: {} } });
      output({ type: 'result', subtype: 'success', session_id: id });
    }
  } else if (record.type === 'user') {
    mkdirSync(project, { recursive: true });
    appendFileSync(join(home, 'submissions.txt'), JSON.stringify(record) + '\n');
    const message = record.message.content;
    if (message === 'die') process.exit(3);
    const userId = `user-${++sequence}`;
    const canonical = { type: 'user', uuid: userId, parentUuid: parent, sessionId: id, message: record.message };
    appendFileSync(transcript, JSON.stringify(canonical) + '\n');
    output({ type: 'system', subtype: 'init', session_id: id, tools: ['Bash', 'mcp__olea_phone__phone_inspect'] });
    output({ type: 'stream_event', session_id: id, event: { type: 'content_block_start', content_block: { type: 'tool_use', name: 'Bash' } } });
    output({ type: 'stream_event', session_id: id, event: { type: 'content_block_delta', delta: { type: 'text_delta', text: 'fixture reply' } } });
    parent = `assistant-${sequence}`;
    appendFileSync(transcript, JSON.stringify({ type: 'assistant', uuid: parent, parentUuid: userId, message: { role: 'assistant', content: [{ type: 'text', text: 'fixture reply' }] } }) + '\n');
    if (message !== 'wait') output({ type: 'result', subtype: 'success', session_id: id });
  }
}
