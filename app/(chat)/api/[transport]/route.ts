import { createMcpHandler } from '@vercel/mcp-adapter';
import { rollDice, agents } from './tools';

const handler = createMcpHandler(
  (server) => {
    rollDice(server);
    agents(server);
  },
  {
    // @TODO Define the server capabilities here
    // You can add more tools or capabilities here if needed
    // For example, server.tool('another_tool', 'Description', {}, async () => { ... });
  },
  {
    basePath: '/api',
    verboseLogs: true,
  },
);

export { handler as POST };

export async function GET(request: Request) {
  const postRequest = new Request(request.url, {
    method: 'POST',
    headers: request.headers,
    body: request.body,
  });

  return handler(postRequest);
}
