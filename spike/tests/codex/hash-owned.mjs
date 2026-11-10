// SPDX-License-Identifier: MIT
import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const output = 'spike/m2/codex/artifact-hashes.json';
const revision = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const files = execFileSync('git', ['ls-tree', '-r', '--name-only', revision, '--', 'spike/backend/src', 'spike/tests/codex', 'spike/m2/codex'], { encoding: 'utf8' }).trim().split('\n').filter(path => path && path !== output);
// Optional audit reads only the one expressly authorized source and never prints it.
const secret = process.argv[2] ? JSON.parse(await readFile(process.argv[2], 'utf8')).apiKey : undefined;
const artifacts = [];
for (const path of files.sort()) {
  const bytes = execFileSync('git', ['show', `${revision}:${path}`], { maxBuffer: 4 * 1024 * 1024 });
  if (secret && bytes.includes(Buffer.from(secret))) throw new Error('credential_artifact_rejected');
  artifacts.push({ path, source: `git:${revision}:${path}`, byteDomain: 'git-object-blob', bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
}
await writeFile(output, JSON.stringify({ generatedAt: new Date().toISOString(), scope: 'Committed Git object bytes at sourceRevision; excludes this manifest to avoid circular hash. Checkout line endings and deployed runtime bytes require separate exact-byte hashes.', sourceRevision: revision, byteDomain: 'git-object-blob', credentialAudit: secret ? 'exact authorized secret absent from every retained artifact' : 'not-run', artifacts }, null, 2));
console.log(JSON.stringify({ output, artifacts: artifacts.length, credentialAuditPassed: Boolean(secret) }));
