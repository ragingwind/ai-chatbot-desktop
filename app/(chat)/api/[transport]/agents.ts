import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export const agents = (server: McpServer) => {
  server.tool(
    'agents',
    'Agents with multiple capabilities, tools, and LLMs. Each agent can own roles and decisions.',
    // @TODO, add roles, prompts.
    // Refer to MCP spec prompts, resources, and reasonging
    { tools: z.array(z.string()) },
    async ({ tools }) => {
      return {
        content: [{ type: 'text', text: `I can use ${tools.join(', ')}.` }],
      };
    },
  );
};
