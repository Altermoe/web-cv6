import { describe, it, expect, vi, beforeEach } from "vitest";
import { callTool } from "../helpers.js";
import { BrowserManager } from "../../src/browser/manager.js";

describe("wait_hmr_stable", () => {
  let manager: BrowserManager;

  const mockPage = {
    evaluate: vi.fn().mockResolvedValue(undefined),
    goto: vi.fn(),
    isClosed: vi.fn().mockReturnValue(false),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new BrowserManager({ headless: true });
    manager.setPageForTesting(mockPage as any);
  });

  it("should wait for HMR stability and return timing info", async () => {
    const result = await callTool(manager, "wait_hmr_stable", {});

    expect(result.isError).toBeFalsy();
    const content = JSON.parse(result.content[0].text as string);
    expect(content.stable).toBe(true);
    expect(typeof content.totalWait).toBe("number");
    expect(content.totalWait).toBeGreaterThanOrEqual(300); // default renderDelay
  });

  it("should respect custom timeout and renderDelay", async () => {
    const result = await callTool(manager, "wait_hmr_stable", {
      timeout: 1000,
      renderDelay: 100,
    });

    expect(result.isError).toBeFalsy();
    const content = JSON.parse(result.content[0].text as string);
    expect(content.stable).toBe(true);
    expect(content.totalWait).toBeGreaterThanOrEqual(100);
  });
});
