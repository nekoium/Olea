// SPDX-License-Identifier: MIT
// Host-only checks against explicitly selected existing compiled Olea backend; no model/provider calls.
import test from 'node:test';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
const selected = process.env.OLEA_M2_BACKEND_DIST;
if (!selected) throw Error('OLEA_M2_BACKEND_DIST_required_explicit_artifact');
const { JsonLines, PiProcess } = await import(pathToFileURL(resolve(selected, 'pi-process.js')).href);
const fixture = resolve(import.meta.dirname, '../pi/mock-pi.mjs');
test('host compiled backend parser caps complete and unfinished frames with split Unicode preserved', () => {
  const records = []; const parser = new JsonLines(r => records.push(r));
  for (const b of Buffer.from('{"text":"雪\\u2028"}\n')) parser.push(Buffer.from([b]));
  assert.equal(records[0].text, '雪\u2028');
  for (const suffix of ['', '\n']) assert.throws(() => new JsonLines(() => {}).push(Buffer.from('x'.repeat(262145) + suffix)), /record_limit/);
});
test('host compiled backend correlates concurrent commands and bounds pending queue/timeout', async () => {
  const pi = new PiProcess({ entry: fixture, cwd: resolve('.'), env: { PATH: process.env.PATH, SystemRoot: process.env.SystemRoot } });
  try {
    const [a, b] = await Promise.all([pi.request({ type: 'prompt', message: 'a' }), pi.request({ type: 'prompt', message: 'b' })]);
    assert.equal(a.data.echo, 'a'); assert.equal(b.data.echo, 'b');
    const pending = Array.from({ length: 32 }, () => pi.request({ type: 'hang' }, 100));
    const rejected = Promise.allSettled(pending);
    await assert.rejects(pi.request({ type: 'hang' }), /pending_limit/);
    const results = await rejected;
    assert(results.every(r => r.status === 'rejected' && r.reason.message === 'rpc_timeout'));
  } finally { await pi.stop(); }
});
test('host compiled backend rejects oversized input without submitting command', async () => {
  const pi = new PiProcess({ entry: fixture, cwd: resolve('.'), env: { PATH: process.env.PATH, SystemRoot: process.env.SystemRoot } });
  try { await assert.rejects(pi.request({ type: 'prompt', message: 'a'.repeat(262144) }), /input_limit/); }
  finally { await pi.stop(); }
});
