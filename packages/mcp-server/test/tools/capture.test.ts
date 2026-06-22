import { describe, it, expect, vi, beforeEach } from "vitest";
import { callTool } from "../helpers.js";
import { BrowserManager } from "../../src/browser/manager.js";

describe("capture_screenshot", () => {
  let manager: BrowserManager;

  const mockPage = {
    screenshot: vi.fn(),
    evaluate: vi.fn().mockResolvedValue(undefined),
    viewportSize: vi.fn().mockReturnValue({ width: 800, height: 600 }),
    $: vi.fn(),
    goto: vi.fn(),
    isClosed: vi.fn().mockReturnValue(false),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new BrowserManager({ headless: true });
    manager.setPageForTesting(mockPage as any);
  });

  it("should capture screenshot and return base64 image", async () => {
    const fakeBuffer = Buffer.from("fake-png-data");
    mockPage.screenshot.mockResolvedValue(fakeBuffer);

    const result = await callTool(manager, "capture_screenshot", {});

    expect(result.isError).toBeFalsy();
    const content = JSON.parse(result.content[0].text as string);
    expect(content.image).toBeDefined();
    expect(content.width).toBe(800);
    expect(content.height).toBe(600);
    expect(content.format).toBe("png");
    expect(content.url).toBeDefined();
    expect(content.timestamp).toBeDefined();
  });

  it("should support jpeg format with quality", async () => {
    const fakeBuffer = Buffer.from("fake-jpeg-data");
    mockPage.screenshot.mockResolvedValue(fakeBuffer);

    const result = await callTool(manager, "capture_screenshot", {
      format: "jpeg",
      quality: 80,
    });

    expect(result.isError).toBeFalsy();
    expect(mockPage.screenshot).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "jpeg",
        quality: 80,
      }),
    );
  });

  it("should support region crop", async () => {
    const fakeBuffer = Buffer.from("fake-png-data");
    mockPage.screenshot.mockResolvedValue(fakeBuffer);

    const result = await callTool(manager, "capture_screenshot", {
      region: { x: 10, y: 20, width: 400, height: 300 },
    });

    expect(result.isError).toBeFalsy();
    expect(mockPage.screenshot).toHaveBeenCalledWith(
      expect.objectContaining({
        clip: { x: 10, y: 20, width: 400, height: 300 },
      }),
    );
  });

  it("should wait for render stability before screenshot", async () => {
    const fakeBuffer = Buffer.from("fake-png-data");
    mockPage.screenshot.mockResolvedValue(fakeBuffer);
    mockPage.evaluate.mockResolvedValue(undefined);

    const result = await callTool(manager, "capture_screenshot", {
      waitForStable: 200,
    });

    expect(result.isError).toBeFalsy();
    // Should have called evaluate for rAF
    expect(mockPage.evaluate).toHaveBeenCalled();
    expect(mockPage.screenshot).toHaveBeenCalled();
  });
});
