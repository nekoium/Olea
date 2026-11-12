// SPDX-License-Identifier: MIT
// Stock Pi loads TypeScript extensions through its supported extension loader.
import { callPhone, phoneSchema, phoneTools } from '../dist/phone-mcp.js';

export default function (pi: any) {
  for (const tool of phoneTools) pi.registerTool({
    name: tool.name, label: tool.name, description: tool.description,
    parameters: phoneSchema(tool),
    async execute(_id: string, args: Record<string, unknown>, signal?: AbortSignal) {
      const path = process.env.OLEA_BRIDGE_CONFIG;
      if (!path) throw new Error('bridge_not_configured');
      const result = await callPhone(tool.name, args, path, signal);
      if (result.isError) throw new Error(result.content[0].text);
      return { content: result.content, details: {} };
    },
  });
}
