// Original Olea feasibility tooling, MIT. Read-only Linux /proc collector.
import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import { run } from '../tests/runner/process.mjs';

export function parseStat(text) {
  const closing = text.lastIndexOf(')');
  const pid = Number(text.slice(0, text.indexOf(' ')));
  const fields = text.slice(closing + 2).trim().split(/\s+/);
  if (!Number.isInteger(pid) || closing < 0 || fields.length < 22) throw new Error('invalid proc stat');
  return { pid, name: text.slice(text.indexOf('(') + 1, closing), state: fields[0], ppid: Number(fields[1]), userTicks: Number(fields[11]), systemTicks: Number(fields[12]), startTicks: fields[19], rssPages: Number(fields[21]) };
}
export function descendants(records, roots) {
  const selected = new Set(roots);
  for (let changed = true; changed;) {
    changed = false;
    for (const record of records) if (selected.has(record.ppid) && !selected.has(record.pid)) { selected.add(record.pid); changed = true; }
  }
  return records.filter(record => selected.has(record.pid));
}
async function main() {
  if (process.platform !== 'linux') throw new Error('Run inside Linux/PRoot; Windows results are not Android measurements.');
  const roots = (process.argv[2] ?? '').split(',').map(Number);
  const count = Number(process.argv[3] ?? 10);
  const destination = resolve(process.argv[4] ?? '.setup/resources.json');
  if (!roots.length || roots.some(pid => !Number.isInteger(pid) || pid < 2) || !Number.isInteger(count) || count < 2 || count > 60) throw new Error('Usage: node resources.mjs PID[,PID] SAMPLES(2..60) OUTPUT');
  const ticks = await run('getconf', ['CLK_TCK']);
  const pages = await run('getconf', ['PAGESIZE']);
  const hz = Number(ticks.stdout.trim()), pageBytes = Number(pages.stdout.trim());
  if (!(hz > 0) || !(pageBytes > 0)) throw new Error('getconf CLK_TCK/PAGESIZE required');
  const samples = [];
  const initialRoots = new Map();
  const knownProcesses = new Map();
  for (let index = 0; index < count; index++) {
    const all = [];
    for (const pid of (await readdir('/proc')).filter(name => /^\d+$/.test(name))) {
      try { all.push(parseStat(await readFile(`/proc/${pid}/stat`, 'utf8'))); } catch { /* process exited or inaccessible */ }
    }
    if (index === 0) for (const pid of roots) initialRoots.set(pid, all.find(record => record.pid === pid)?.startTicks);
    const liveRoots = roots.filter(pid => initialRoots.get(pid) !== undefined && all.some(record => record.pid === pid && record.startTicks === initialRoots.get(pid)));
    const survivingKnown = all.filter(record => knownProcesses.get(record.pid) === record.startTicks).map(record => record.pid);
    const processes = descendants(all, [...liveRoots, ...survivingKnown]);
    for (const record of processes) knownProcesses.set(record.pid, record.startTicks);
    const timestamp = performance.now();
    for (const record of processes) {
      record.rssBytes = record.rssPages * pageBytes;
      try {
        const text = await readFile(`/proc/${record.pid}/smaps_rollup`, 'utf8');
        const match = text.match(/^Pss:\s+(\d+) kB$/m);
        record.pssBytes = match ? Number(match[1]) * 1024 : null;
      } catch { record.pssBytes = null; }
      const previous = samples.at(-1);
      const before = previous?.processes.find(item => item.pid === record.pid && item.startTicks === record.startTicks);
      record.cpuPercentOneCore = before ? ((record.userTicks + record.systemTicks - before.userTicks - before.systemTicks) / hz) / ((timestamp - previous.monotonicMs) / 1000) * 100 : null;
    }
    samples.push({ at: new Date().toISOString(), monotonicMs: timestamp, missingRoots: roots.filter(pid => !liveRoots.includes(pid)), processes,
      totalRssBytes: processes.reduce((sum, item) => sum + item.rssBytes, 0), totalPssBytes: processes.length && processes.every(item => item.pssBytes !== null) ? processes.reduce((sum, item) => sum + item.pssBytes, 0) : null });
    if (index < count - 1) await delay(1000);
  }
  await mkdir(resolve(destination, '..'), { recursive: true });
  await writeFile(destination, JSON.stringify({ schemaVersion: 1, generatedAt: new Date().toISOString(), scope: 'linux-process-tree-only', node: process.version, roots, hz, pageBytes, notes: ['RSS sum double-counts shared pages; PSS unavailable remains null.', 'Android host memory must be measured independently with dumpsys meminfo.', 'PRoot /proc visibility and inaccessible processes can make this incomplete.', 'First sample has no CPU delta; CPU percent is per one logical core.', 'Do not infer cold-start or streaming latency from this collector.'], samples }, null, 2) + '\n');
  console.log(destination);
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
