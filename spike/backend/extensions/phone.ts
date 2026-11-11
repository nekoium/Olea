// SPDX-License-Identifier: MIT
// Supported Pi extension API only; plain JSON Schema avoids a schema-builder dependency.
import { readFileSync } from 'node:fs';
import { phoneTools } from '../dist/phone-mcp.js';

export default function (pi: any) {
  const providerPath = process.env.OLEA_PROVIDER_CONFIG;
  if (providerPath) {
    const config = JSON.parse(readFileSync(providerPath, 'utf8'));
    if (config.baseUrl !== 'https://api.chiyi.cc/v1' || typeof config.apiKey !== 'string') throw new Error('invalid_provider_config');
    pi.registerProvider('olea-test', {
      baseUrl: config.baseUrl, apiKey: config.apiKey, api: 'openai-completions',
      models: [config.primaryModel ?? 'gpt-6.1-terra', config.fallbackModel ?? 'gpt-6.1-sol'].map(id => ({
        id, name: id, reasoning: false, input: ['text'],
        cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 }, contextWindow: 128000, maxTokens: 4096,
      })),
    });
  }

  const tools = [
    { name: 'phone_capabilities', operation: 'capabilities', description: 'Read current Android phone permissions, accessibility and stop state.', properties: {} },
    { name: 'phone_inspect', operation: 'accessibility_tree', description: 'Inspect bounded accessible Android UI nodes and foreground package. Use nodeId for clicks; inspect again after screen changes.', properties: {} },
    { name: 'phone_click', operation: 'accessibility_click', description: 'Click a node from phone_inspect using Android Accessibility. Open target apps by clicking launcher entries; do not substitute an intent.', properties: { nodeId: { type: 'string', maxLength: 256 } }, required: ['nodeId'] },
    { name: 'phone_home', operation: 'global_action', description: 'Use Android Accessibility HOME to show the launcher before inspecting and clicking an app entry.', properties: {}, fixed: { action: 'home' } },
    { name: 'phone_swipe', operation: 'swipe', description: 'Swipe using Android Accessibility. Use empty arguments for the native default swipe up to open the launcher app drawer when the target entry is not visible. Inspect again after swiping, then click the launcher entry. Optional coordinates are screen pixels; Android checks current screen bounds.', properties: {
      x: { type: 'integer', minimum: 0, maximum: 16383 },
      startY: { type: 'integer', minimum: 0, maximum: 16383 },
      endY: { type: 'integer', minimum: 0, maximum: 16383 },
    } },
    { name: 'phone_open_url', operation: 'open_url', description: 'Request Android VIEW for an HTTPS URL. Dispatch does not prove page arrival and does not satisfy Accessibility launcher-click acceptance.', properties: { url: { type: 'string', maxLength: 2048, pattern: '^https://' } }, required: ['url'] },
    { name: 'phone_fixture_action', operation: 'fixture_action', description: 'Send a generated value to the cooperating test app through its documented interface. Does not open an app through Accessibility. Cannot read verification state.', properties: { value: { type: 'string', maxLength: 128 } }, required: ['value'] },
    ...phoneTools.filter(tool => !['phone_capabilities', 'phone_inspect', 'phone_click', 'phone_home', 'phone_swipe', 'phone_open_url', 'phone_fixture_action'].includes(tool.name)),
  ];
  for (const tool of tools) pi.registerTool({
    name: tool.name, label: tool.name, description: tool.description,
    parameters: { type: 'object', properties: tool.properties, required: tool.required ?? [], additionalProperties: false },
    async execute(_id: string, args: Record<string, unknown>, signal?: AbortSignal) {
      const configured = process.env.OLEA_BRIDGE_CONFIG;
      const bridge = configured ? JSON.parse(readFileSync(configured, 'utf8')) : {
        url: process.env.OLEA_BRIDGE_URL,
        token: process.env.OLEA_BRIDGE_TOKEN_FILE ? readFileSync(process.env.OLEA_BRIDGE_TOKEN_FILE, 'utf8').trim() : undefined,
      };
      if (!bridge.url || !bridge.token) throw new Error('bridge_not_configured');
      const url = new URL(bridge.url);
      if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1') throw new Error('bridge_must_be_loopback');
      const combined = signal ? AbortSignal.any([signal, AbortSignal.timeout(10_000)]) : AbortSignal.timeout(10_000);
      try {
        const response = await fetch(new URL('/phone', url), {
          method: 'POST', headers: { authorization: `Bearer ${bridge.token}`, 'content-type': 'application/json' },
          body: JSON.stringify({ id: _id, operation: tool.operation, args: tool.fixed ?? args }), signal: combined,
        });
        const reader = response.body?.getReader();
        if (!reader) throw new Error('bridge_empty');
        const chunks: Uint8Array[] = [];
        let size = 0;
        while (true) {
          const next = await reader.read();
          if (next.done) break;
          size += next.value.length;
          if (size > 64 * 1024) { await reader.cancel(); throw new Error('bridge_output_limit'); }
          chunks.push(next.value);
        }
        const result = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if (!response.ok || result.ok !== true) throw new Error(`bridge_denied:${String(result.error?.code ?? response.status).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64)}`);
        // The native bridge returns only tool-visible data; no oracle endpoint is exposed.
        return { content: [{ type: 'text', text: JSON.stringify(result.result) }], details: {} };
      } catch (error) {
        if (error instanceof Error && error.message.startsWith('bridge_denied:')) throw error;
        throw new Error('bridge_request_failed');
      }
    },
  });
}
