import { describe, it, expect, vi, beforeEach } from "vitest";
import { callTool } from "../helpers.js";
import { BrowserManager } from "../../src/browser/manager.js";

describe("get_page_status", () => {
  let manager: BrowserManager;

  const mockPage = {
    url: vi.fn().mockReturnValue("http://localhost:26618/"),
    evaluate: vi.fn().mockResolvedValue(true),
    isClosed: vi.fn().mockReturnValue(false),
    goto: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new BrowserManager({ headless: true });
    manager.setPageForTesting(mockPage as any);
    manager.setConsoleLogsForTesting([]);
  });

  it("should return basic page status", async () => {
    const result = await callTool(manager, "get_page_status", {});

    expect(result.isError).toBeFalsy();
    const content = JSON.parse(result.content[0].text as string);
    expect(content.loaded).toBe(true);
    expect(content.url).toBe("http://localhost:26618");
    expect(content.webgpu).toBeDefined();
    expect(typeof content.webgpu.available).toBe("boolean");
    expect(content.consoleErrors).toBe(0);
  });

  it("should return detailed GPU info when requested", async () => {
    // detectWebGpu calls page.evaluate twice: basic check + adapter info
    mockPage.evaluate
      .mockResolvedValueOnce({
        available: true,
        adapter: null,
        features: [],
        limits: {},
      })
      .mockResolvedValueOnce({
        adapter: "NVIDIA GeForce RTX 3080",
        features: ["depth-clip-control"],
        limits: { maxTextureDimension2D: 16384 },
      });

    const result = await callTool(manager, "get_page_status", { detailed: true });

    expect(result.isError).toBeFalsy();
    const content = JSON.parse(result.content[0].text as string);
    expect(content.webgpu).toBeDefined();
    expect(typeof content.webgpu.available).toBe("boolean");
  });

  it("should count console errors", async () => {
    manager.setConsoleLogsForTesting([
      { level: "error", text: "err1", timestamp: new Date().toISOString(), source: "console" },
      { level: "error", text: "err2", timestamp: new Date().toISOString(), source: "console" },
      { level: "warning", text: "warn1", timestamp: new Date().toISOString(), source: "console" },
    ]);

    const result = await callTool(manager, "get_page_status", {});

    expect(result.isError).toBeFalsy();
    const content = JSON.parse(result.content[0].text as string);
    expect(content.consoleErrors).toBe(2);
  });
});
