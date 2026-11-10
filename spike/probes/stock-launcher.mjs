// SPDX-License-Identifier: MIT
import { resolve, sep } from 'node:path';

export function stockLauncher(packageRoot, manifest, name) {
  const bin = typeof manifest.bin === 'string' ? manifest.bin : manifest.bin?.[name];
  const entry = typeof bin === 'string' ? resolve(packageRoot, bin) : '';
  if (!entry.startsWith(resolve(packageRoot) + sep)) throw new Error('missing_or_invalid_upstream_declared_bin');
  return { bin, entry, command: /\.[cm]?js$/i.test(bin) ? process.execPath : entry, prefix: /\.[cm]?js$/i.test(bin) ? [entry] : [] };
}
