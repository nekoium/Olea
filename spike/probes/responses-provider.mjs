// SPDX-License-Identifier: MIT
// Only the explicitly authorized provider; no raw response bodies or authentication values retained.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const authorizedProviderFile = 'C:/Users/Aria/Projects/Development/Olea/.setup/android-test-provider.local.json';
export function extractResponseSummary(events) {
  const completed = events.find(event => event.type === 'response.completed')?.response;
  const calls = (completed?.output ?? []).filter(item => item.type === 'function_call');
  const verified = calls.some(call => {
    try { return call.name === 'echo_test' && JSON.parse(call.arguments).value === 'olea-responses-probe'; } catch { return false; }
  });
  return { completed: Boolean(completed), toolCallVerified: verified, usage: completed?.usage ? {
    inputTokens: completed.usage.input_tokens, outputTokens: completed.usage.output_tokens,
  } : undefined };
}
export async function summarizeSse(reader, { maxTotalBytes = 262144, maxEventBytes = 65536 } = {}) {
  const decoder = new TextDecoder();
  const eventTypes = new Set();
  let buffer = '', responseBytes = 0, eventCount = 0, malformedEvents = 0;
  let terminal = '', reason, summary = { completed: false, toolCallVerified: false };
  try {
    while (!terminal && !reason) {
      const next = await reader.read();
      if (next.done) break;
      responseBytes += next.value.length;
      if (responseBytes > maxTotalBytes) { reason = 'total_response_limit'; break; }
      buffer = (buffer + decoder.decode(next.value, { stream: true })).replace(/\r\n/g, '\n');
      let boundary;
      while ((boundary = buffer.indexOf('\n\n')) >= 0) {
        const frame = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + 2);
        if (Buffer.byteLength(frame) > maxEventBytes) { reason = 'event_limit'; break; }
        const data = frame.split('\n').filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
        if (!data || data === '[DONE]') continue;
        let event;
        try { event = JSON.parse(data); } catch { malformedEvents++; continue; }
        eventCount++;
        if (/^[a-z_.]{1,80}$/.test(event.type ?? '')) eventTypes.add(event.type);
        if (['response.completed', 'response.failed', 'response.incomplete'].includes(event.type)) {
          terminal = event.type;
          summary = extractResponseSummary([event]);
          break;
        }
      }
      if (Buffer.byteLength(buffer) > maxEventBytes && !terminal) reason = 'event_limit';
    }
  } finally { await reader.cancel().catch(() => {}); }
  return { ...summary, responseBytes, eventCount, malformedEvents, eventTypes: [...eventTypes], terminal: terminal || null, reason };
}
export async function responsesProbe(configPath = authorizedProviderFile, models = ['gpt-6.1-terra', 'gpt-6.1-sol']) {
  const config = JSON.parse(await readFile(configPath, 'utf8'));
  if (config.baseUrl !== 'https://api.chiyi.cc/v1' || typeof config.apiKey !== 'string' || !config.apiKey) throw new Error('invalid_authorized_provider_config');
  const results = [];
  for (const model of models) {
    if (!['gpt-6.1-terra', 'gpt-6.1-sol'].includes(model)) throw new Error('unauthorized_model');
    const started = performance.now();
    let responseMeta = {};
    try {
      const response = await fetch(config.baseUrl + '/responses', {
        method: 'POST', redirect: 'error', signal: AbortSignal.timeout(45000),
        headers: { authorization: `Bearer ${config.apiKey}`, 'content-type': 'application/json' },
        body: JSON.stringify({ model, stream: true, store: false, max_output_tokens: 96,
          input: [{ role: 'user', content: 'Call echo_test with value olea-responses-probe.' }],
          tools: [{ type: 'function', name: 'echo_test', description: 'Echo a harmless probe value.', parameters: { type: 'object', properties: { value: { type: 'string' } }, required: ['value'], additionalProperties: false }, strict: true }],
          tool_choice: { type: 'function', name: 'echo_test' } }),
      });
      const contentType = response.headers.get('content-type') ?? '';
      responseMeta = { httpStatus: response.status, contentType: contentType.replace(/[^a-zA-Z0-9/;=_. -]/g, '').slice(0, 120) };
      if (!contentType.toLowerCase().includes('text/event-stream')) {
        await response.body?.cancel();
        results.push({ model, status: 'fail', reason: 'expected_responses_sse_content_type', ...responseMeta, durationMs: Math.round(performance.now() - started), attempts: 1 });
        continue;
      }
      const reader = response.body?.getReader();
      if (!reader) throw new Error('empty_response');
      const summary = await summarizeSse(reader);
      const pass = response.ok && summary.completed && summary.toolCallVerified;
      results.push({ model, status: pass ? 'pass' : summary.reason ? 'blocked' : 'fail', ...responseMeta, api: 'responses-sse',
        durationMs: Math.round(performance.now() - started), attempts: 1, ...summary });
      if (pass) break;
    } catch (error) {
      results.push({ model, status: 'blocked', ...responseMeta, reason: error.message === 'empty_response' ? 'empty_response' : 'request_failed_or_timeout', durationMs: Math.round(performance.now() - started), attempts: 1 });
    }
  }
  return { schemaVersion: 1, generatedAt: new Date().toISOString(), scope: 'provider-api-only', node: process.version, platform: process.platform, endpoint: 'https://api.chiyi.cc/v1/responses', results, limitations: ['Does not establish stock Codex authenticated workflow or Android compatibility.', 'No raw response body, headers, request or credentials retained.', 'At most two models, one request each;45s deadline,256KiB total,64KiB event; no retry or cross-origin redirects.'] };
}
async function main() {
  const output = resolve(process.argv[2] ?? '.setup/evidence/host/responses-provider.json');
  const report = await responsesProbe(process.env.OLEA_PROVIDER_CONFIG ?? authorizedProviderFile);
  await mkdir(resolve(output, '..'), { recursive: true });
  await writeFile(output, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ output, results: report.results }));
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
