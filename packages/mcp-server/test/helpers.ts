import type { BrowserManager } from "../src/browser/manager.js";

/**
 * Helper: invoke a registered MCP tool through the server's internal handler.
 * Passes the given BrowserManager into createMcpServer so mocks take effect.
 */
export async function callTool(
  manager: BrowserManager,
  toolName: string,
  args: Record<string, unknown>,
): Promise<{ content: Array<{ type: string; text: string }>; isError?: boolean }> {
  const { createMcpServer } = await import("../src/server.js");
  const { Client } = await import("@modelcontextprotocol/sdk/client/index.js");
  const { InMemoryTransport } = await import("@modelcontextprotocol/sdk/inMemory.js");

  const server = createMcpServer({ browserManager: manager });
  const client = new Client({ name: "test", version: "0.0.0" });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  await client.connect(clientTransport);

  const result = await client.callTool({ name: toolName, arguments: args });

  await client.close();
  await server.close();

  return result as { content: Array<{ type: string; text: string }>; isError?: boolean };
}
