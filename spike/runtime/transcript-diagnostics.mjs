// Original source MIT. Summarize existing disposable test transcripts without model text or credentials.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { redact } from '../tests/runner/process.mjs';
const root = '/opt/olea/.setup/pi-matrix/sessions';
const records = [];
async function visit(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await visit(path);
    else if (entry.name.endsWith('.jsonl')) {
      const summary = { sessionFile: path, assistantMessages: 0, toolCalls: 0, stops: [], errors: [] };
      for (const line of (await readFile(path, 'utf8')).split('\n')) {
        let row; try { row = JSON.parse(line); } catch { continue; }
        const message = row.message;
        if (message?.role === 'assistant') {
          summary.assistantMessages++;
          if (message.stopReason) summary.stops.push(message.stopReason);
          if (message.errorMessage) summary.errors.push(redact(message.errorMessage).slice(0, 1000));
          summary.toolCalls += message.content?.filter(item => item.type === 'toolCall').length ?? 0;
        }
        if (message?.role === 'toolResult' && message.isError) summary.errors.push({ tool: message.toolName, error: 'tool_result_error', excerpt: redact(JSON.stringify(message.content)).slice(0, 700) });
      }
      records.push(summary);
    }
  }
}
await visit(root);
await writeFile('/workspace/evidence/transcript-diagnostics.json', JSON.stringify({ scope: 'existing-transcript-metadata-only', modelRequests: 0, records }, null, 2));
console.log(JSON.stringify({ transcripts: records.length, errors: records.reduce((n, x) => n + x.errors.length, 0) }));
