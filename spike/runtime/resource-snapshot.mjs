// Original source MIT. Explicit owned PIDs only; no cmdline/env or credentials.
import { readFile, writeFile } from 'node:fs/promises';
const pids = process.argv[2].split(',').map(Number);
const results = [];
for (const pid of pids) {
  try {
    const status = await readFile(`/proc/${pid}/status`, 'utf8');
    const rollup = await readFile(`/proc/${pid}/smaps_rollup`, 'utf8');
    results.push({ pid, name: status.match(/^Name:\s*(.*)$/m)?.[1], parent: Number(status.match(/^PPid:\s*(\d+)/m)?.[1]),
      uid: status.match(/^Uid:\s*(.*)$/m)?.[1], rssKiB: Number(status.match(/^VmRSS:\s*(\d+)/m)?.[1]),
      pssKiB: Number(rollup.match(/^Pss:\s*(\d+)/m)?.[1]) });
  } catch (error) { results.push({ pid, error: error.code ?? 'unavailable' }); }
}
const report = { at: new Date().toISOString(), results, totals: { rssKiB: results.reduce((n, r) => n + (r.rssKiB ?? 0), 0), pssKiB: results.reduce((n, r) => n + (r.pssKiB ?? 0), 0) }, limitation: 'One explicit-process snapshot; RSS double counts shared pages; missing processes make total a subtotal; no peak or battery inference' };
await writeFile(process.argv[3], JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
