// SPDX-License-Identifier: MIT
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
const files = [
  '.setup/codex-upstream/codex-0.167.0.tgz', '.setup/codex-upstream/config.schema.json',
  '.setup/codex-upstream/app-server.md', '.setup/codex-stock/package-lock.json',
  '.setup/codex-stock/node_modules/@openai/codex/package.json', '.setup/codex-stock/node_modules/@openai/codex/bin/codex.js',
  '.setup/codex-stock/node_modules/@openai/codex-win32-x64/package.json',
  '.setup/codex-stock/node_modules/@openai/codex-win32-x64/vendor/x86_64-pc-windows-msvc/bin/codex.exe',
  '.setup/codex-upstream/schema/codex_app_server_protocol.schemas.json',
  '.setup/codex-upstream/schema/codex_app_server_protocol.v2.schemas.json',
  'spike/m2/codex/upstream/LICENSE.codex',
];
const manifest = { observedAt: new Date().toISOString(), version: '0.167.0', package: '@openai/codex', declaredBin: 'bin/codex.js', license: 'Apache-2.0', upstreamTag: 'rust-v0.167.0', metadataIntegrity: 'sha512-1FSQgbTIKAdTub5Ln6z36NT4eXDmBRkinfigzycbgn9yLZdJ3UdkQZqr0N7jnl8/D1xxT/Pz3Fl2l7S2dmRaFA==', sources: ['https://registry.npmjs.org/@openai%2fcodex/latest', 'https://registry.npmjs.org/@openai/codex/-/codex-0.167.0.tgz', 'https://raw.githubusercontent.com/openai/codex/rust-v0.167.0/codex-rs/core/config.schema.json', 'https://raw.githubusercontent.com/openai/codex/rust-v0.167.0/codex-rs/app-server/README.md', 'https://raw.githubusercontent.com/openai/codex/rust-v0.167.0/LICENSE'], files: [] };
for (const path of files) {
  try { const bytes = await readFile(path); manifest.files.push({ path, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), ...(path.endsWith('.tgz') ? { sha512Integrity: 'sha512-' + createHash('sha512').update(bytes).digest('base64'), integrityMatched: 'sha512-' + createHash('sha512').update(bytes).digest('base64') === manifest.metadataIntegrity } : {}) }); }
  catch { manifest.files.push({ path, status: 'missing' }); }
}
await mkdir('spike/m2/codex', { recursive: true });
await writeFile('spike/m2/codex/upstream-manifest.json', JSON.stringify(manifest, null, 2));
console.log(JSON.stringify({ output: resolve('spike/m2/codex/upstream-manifest.json'), missing: manifest.files.filter(file => file.status === 'missing').map(file => file.path) }));
