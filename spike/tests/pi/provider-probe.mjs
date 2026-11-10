// SPDX-License-Identifier: MIT
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const authorizedProviderFile = 'C:/Users/Aria/Projects/Development/Olea/.setup/android-test-provider.local.json';
export async function providerProbe(path = authorizedProviderFile) {
  const config = JSON.parse(await readFile(path, 'utf8'));
  if (config.baseUrl !== 'https://api.chiyi.cc/v1' || typeof config.apiKey !== 'string') throw new Error('invalid_provider_config');
  const results = [];
  for (const model of [config.primaryModel, config.fallbackModel].filter(Boolean)) {
    const started = performance.now();
    try {
      const response = await fetch(config.baseUrl + '/chat/completions', {
        method: 'POST', headers: { authorization: `Bearer ${config.apiKey}`, 'content-type': 'application/json' },
        body: JSON.stringify({ model, max_tokens: 96, messages: [{ role: 'user', content: 'Call echo_test with value olea-api-probe.' }],
          tools: [{ type: 'function', function: { name: 'echo_test', description: 'Echo a harmless probe value.', parameters: { type: 'object', properties: { value: { type: 'string' } }, required: ['value'] } } }],
          tool_choice: { type: 'function', function: { name: 'echo_test' } } }), signal: AbortSignal.timeout(45_000),
      });
      // Never retain authentication responses or request headers.
      const reader = response.body?.getReader();
      if (!reader) throw new Error('empty_response');
      const chunks = [];
      let bytes = 0;
      while (true) {
        const next = await reader.read();
        if (next.done) break;
        bytes += next.value.length;
        if (bytes > 64 * 1024) { await reader.cancel(); throw new Error('response_limit'); }
        chunks.push(next.value);
      }
      const text = Buffer.concat(chunks).toString('utf8');
      let body;
      try { body = JSON.parse(text); } catch { body = {}; }
      const call = body.choices?.[0]?.message?.tool_calls?.[0];
      let args;
      try { args = JSON.parse(call?.function?.arguments ?? '{}'); } catch { args = {}; }
      const pass = response.ok && call?.function?.name === 'echo_test' && args.value === 'olea-api-probe';
      results.push({ model, status: pass ? 'pass' : 'fail', httpStatus: response.status,
        api: 'openai-completions', toolCallVerified: pass, durationMs: Math.round(performance.now() - started),
        usage: body.usage ? { prompt_tokens: body.usage.prompt_tokens, completion_tokens: body.usage.completion_tokens } : undefined });
      if (pass) break;
    } catch { results.push({ model, status: 'blocked', reason: 'request_failed_or_timeout', durationMs: Math.round(performance.now() - started) }); }
  }
  return { platform: process.platform, node: process.version, scope: 'provider-api-only', results };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const report = await providerProbe(process.env.OLEA_PROVIDER_CONFIG ?? authorizedProviderFile);
  console.log(JSON.stringify(report, null, 2));
  if (!report.results.some(result => result.status === 'pass')) process.exitCode = 1;
}
