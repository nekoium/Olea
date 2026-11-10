// SPDX-License-Identifier: MIT
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, dirname, relative } from 'node:path';
import { sha256, readGitArtifact, validateReceipt, verifyArtifacts } from './evidence.mjs';
export async function readReceipts(path) {
  try { return JSON.parse(await readFile(path, 'utf8')); } catch (e) { if (e.code === 'ENOENT') return []; throw e; }
}
export function pinLegacyOffline(receipts) {
  return receipts.map(r => ({ ...r, artifacts: r.artifacts.map(a => {
    if (a.path !== 'spike/m2/evidence/evidence/offline-checks.json') return a;
    for (const commit of ['444f9a1', 'ef3f86e']) {
      const path = `git:${commit}:${a.path}`;
      if (sha256(readGitArtifact(path)) === a.sha256) return { path, sha256: a.sha256 };
    }
    throw Error('legacy_check_bytes_not_retained');
  }) }));
}
export async function immutableArtifact(root, directory, bytes) {
  const hash = sha256(bytes);
  const path = resolve(root, directory, `sha256-${hash}.json`);
  await mkdir(dirname(path), { recursive: true });
  try { await writeFile(path, bytes, { flag: 'wx', mode: 0o600 }); }
  catch (e) { if (e.code !== 'EEXIST' || sha256(await readFile(path)) !== hash) throw e; }
  return { path: relative(resolve(root), path).replaceAll('\\', '/'), sha256: hash };
}
export async function appendReceipts(path, incoming, root) {
  const previous = pinLegacyOffline(await readReceipts(path));
  const byId = new Map(previous.map(r => [r.attemptId, r]));
  for (const receipt of incoming) {
    validateReceipt(receipt);
    const old = byId.get(receipt.attemptId);
    if (old && JSON.stringify(old) !== JSON.stringify(receipt)) throw Error('attempt_id_fact_conflict');
    if (!old) { previous.push(receipt); byId.set(receipt.attemptId, receipt); }
  }
  await verifyArtifacts(previous, root);
  await mkdir(dirname(resolve(path)), { recursive: true });
  await writeFile(path, JSON.stringify(previous, null, 2) + '\n');
  return previous;
}
