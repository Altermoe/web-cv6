import { describe, it, expect, vi, beforeEach } from "vitest";
import { callTool } from "../helpers.js";
import { BrowserManager } from "../../src/browser/manager.js";

describe("get_console_errors", () => {
  let manager: BrowserManager;

  beforeEach(() => {
    vi.clearAllMocks();
    manager = new BrowserManager({ headless: true });
  });

  it("should return empty errors when no errors exist", async () => {
    manager.setConsoleLogsForTesting([]);

    const result = await callTool(manager, "get_console_errors", {});

    expect(result.isError).toBeFalsy();
    const content = JSON.parse(result.content[0].text as string);
    expect(content.errors).toEqual([]);
    expect(content.count).toBe(0);
  });

  it("should filter errors by level", async () => {
    manager.setConsoleLogsForTesting([
      { level: "error", text: "GPU error", timestamp: new Date().toISOString(), source: "console" },
      { level: "warning", text: "Deprecated API", timestamp: new Date().toISOString(), source: "console" },
      { level: "error", text: "Another error", timestamp: new Date().toISOString(), source: "console" },
    ]);

    const result = await callTool(manager, "get_console_errors", { level: "error" });

    const content = JSON.parse(result.content[0].text as string);
    expect(content.count).toBe(2);
    expect(content.errors.every((e: { level: string }) => e.level === "error")).toBe(true);
  });

  it("should return all logs when level is 'all'", async () => {
    manager.setConsoleLogsForTesting([
      { level: "error", text: "GPU error", timestamp: new Date().toISOString(), source: "console" },
      { level: "warning", text: "Deprecated API", timestamp: new Date().toISOString(), source: "console" },
      { level: "info", text: "Loaded", timestamp: new Date().toISOString(), source: "console" },
    ]);

    const result = await callTool(manager, "get_console_errors", { level: "all" });

    const content = JSON.parse(result.content[0].text as string);
    expect(content.count).toBe(3);
  });

  it("should clear logs after read by default", async () => {
    manager.setConsoleLogsForTesting([
      { level: "error", text: "GPU error", timestamp: new Date().toISOString(), source: "console" },
    ]);

    await callTool(manager, "get_console_errors", { clearAfterRead: true });
    expect(manager.getConsoleLogs()).toEqual([]);
  });

  it("should keep logs when clearAfterRead is false", async () => {
    manager.setConsoleLogsForTesting([
      { level: "error", text: "GPU error", timestamp: new Date().toISOString(), source: "console" },
    ]);

    await callTool(manager, "get_console_errors", { clearAfterRead: false });
    expect(manager.getConsoleLogs().length).toBe(1);
  });

  it("should filter by timestamp", async () => {
    const now = Date.now();
    manager.setConsoleLogsForTesting([
      { level: "error", text: "old error", timestamp: new Date(now - 60_000).toISOString(), source: "console" },
      { level: "error", text: "new error", timestamp: new Date(now - 1_000).toISOString(), source: "console" },
    ]);

    const result = await callTool(manager, "get_console_errors", {
      since: now - 5_000,
    });

    const content = JSON.parse(result.content[0].text as string);
    expect(content.count).toBe(1);
    expect(content.errors[0].text).toBe("new error");
  });
});
