// SPDX-License-Identifier: MIT
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
const output = 'spike/m2/codex/artifact-hashes.json';
const files = [];
async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name).replace(/\\/g, '/');
    if (entry.isSymbolicLink()) throw new Error('unexpected_artifact_symlink');
    if (entry.isDirectory()) await visit(path);
    else if (entry.isFile() && path !== output) files.push(path);
  }
}
for (const directory of ['spike/backend/src', 'spike/tests/codex', 'spike/m2/codex']) await visit(directory);
// Optional audit reads only the one expressly authorized source and never prints it.
const secret = process.argv[2] ? JSON.parse(await readFile(process.argv[2], 'utf8')).apiKey : undefined;
const artifacts = [];
for (const path of files.sort()) {
  const bytes = await readFile(path);
  if (secret && bytes.includes(Buffer.from(secret))) throw new Error('credential_artifact_rejected');
  artifacts.push({ path, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
}
await writeFile(output, JSON.stringify({ generatedAt: new Date().toISOString(), scope: 'Codex track retained artifacts and shared backend source snapshot; excludes this manifest to avoid circular hash', credentialAudit: secret ? 'exact authorized secret absent from every retained artifact' : 'not-run', artifacts }, null, 2));
console.log(JSON.stringify({ output, artifacts: artifacts.length, credentialAuditPassed: Boolean(secret) }));
