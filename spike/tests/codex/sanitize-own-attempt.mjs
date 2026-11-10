// SPDX-License-Identifier: MIT
// Sanitize only this experiment's own rollout and sandbox diagnostics.
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join, resolve, relative } from 'node:path';
const [homeArg, providerPath, outputPath] = process.argv.slice(2);
const home = resolve(homeArg);
if (relative(resolve('.setup'), home).startsWith('..')) throw new Error('outside_task_setup');
const secret = JSON.parse(await readFile(providerPath, 'utf8')).apiKey;
const records = [];
async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory() && !entry.isSymbolicLink()) await visit(path);
    else if (entry.isFile() && (entry.name.startsWith('rollout-') && entry.name.endsWith('.jsonl') || entry.name.startsWith('sandbox.') && entry.name.endsWith('.log'))) {
      const text = (await readFile(path, 'utf8')).split(secret).join('[REDACTED]');
      if (entry.name.endsWith('.log')) records.push({ path: relative(home, path), text: text.slice(0, 16384) });
      else for (const line of text.split('\n')) {
        try { const record = JSON.parse(line); if (record.type === 'response_item' && /call|output/.test(record.payload?.type ?? '')) records.push(record); } catch {}
      }
    }
  }
}
await visit(home);
await writeFile(outputPath, JSON.stringify({ noModelRequests: true, home, records }, null, 2).slice(0, 65536));
