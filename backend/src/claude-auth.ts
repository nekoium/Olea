// SPDX-License-Identifier: MIT
import { readFileSync } from 'node:fs';
import { validateProvider } from './codex-session.js';

// Invoked only by stock Claude's apiKeyHelper, not inherited by workspace tools.
try {
  const provider = validateProvider(JSON.parse(readFileSync(process.argv[2], 'utf8')));
  process.stdout.write(provider.apiKey);
} catch { process.exitCode = 1; }
