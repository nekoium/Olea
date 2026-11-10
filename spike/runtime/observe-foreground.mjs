// Original source MIT. Bounded independent Android foreground observer; no phone actions.
import { appendFile, mkdir } from 'node:fs/promises';
import { adb } from './bridge-client.mjs';
const output = process.argv[2] ?? '.setup/android-foreground.jsonl';
const duration = Number(process.argv[3] ?? 1800) * 1000;
await mkdir(output.replace(/[/\\][^/\\]+$/, ''), { recursive: true });
let previous = '';
const began = Date.now();
while (Date.now() - began < duration) {
  try {
    const foreground = adb(['shell', 'dumpsys', 'activity', 'activities']).split('\n').filter(line => /topResumedActivity|mResumedActivity/.test(line)).join('\n').trim();
    if (foreground !== previous) { await appendFile(output, JSON.stringify({ at: new Date().toISOString(), foreground }) + '\n'); previous = foreground; }
  } catch { await appendFile(output, JSON.stringify({ at: new Date().toISOString(), error: 'observation_unavailable' }) + '\n'); }
  await new Promise(resolve => setTimeout(resolve, 400));
}
