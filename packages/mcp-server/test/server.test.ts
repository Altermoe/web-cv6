import { describe, it, expect } from "vitest";
import { createMcpServer } from "../src/server.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";

describe("McpServer", () => {
  async function createConnectedClient() {
    const server = createMcpServer();
    const client = new Client({ name: "test-client", version: "0.0.0" });
    const [clientTransport, serverTransport] =
      InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    await client.connect(clientTransport);
    return { server, client };
  }

  it("should list all registered tools", async () => {
    const { client } = await createConnectedClient();
    const result = await client.listTools();

    const toolNames = result.tools.map((t) => t.name);
    expect(toolNames).toContain("capture_screenshot");
    expect(toolNames).toContain("get_console_errors");
    expect(toolNames).toContain("wait_hmr_stable");
    expect(toolNames).toContain("get_page_status");
    expect(result.tools.length).toBe(4);
  });

  it("each tool should have a name and description", async () => {
    const { client } = await createConnectedClient();
    const result = await client.listTools();

    for (const tool of result.tools) {
      expect(tool.name).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(tool.inputSchema).toBeDefined();
      expect(tool.inputSchema.type).toBe("object");
    }
  });
});
