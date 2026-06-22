import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import type { BrowserManager } from './browser/manager.js'
import { BrowserManager as DefaultBrowserManager } from './browser/manager.js'
import { handleCapture } from './tools/capture.js'
import { handleConsoleErrors } from './tools/console.js'
import { handleHmrStable } from './tools/hmr.js'
import { handlePageStatus } from './tools/status.js'

export interface CreateServerOptions {
  browserManager?: BrowserManager
}

export function createMcpServer(options: CreateServerOptions = {}): McpServer {
  const manager = options.browserManager ?? new DefaultBrowserManager()

  const server = new McpServer({
    name: 'webgpu-eval',
    version: '0.1.0',
  })

  // ── capture_screenshot ──────────────────────────────────────────
  server.registerTool(
    'capture_screenshot',
    {
      description: 'Capture a screenshot of the WebGPU canvas or page viewport',
      inputSchema: z.object({
        selector: z
          .string()
          .optional()
          .describe('CSS selector for the element to capture (default: "canvas")'),
        region: z
          .object({
            x: z.number(),
            y: z.number(),
            width: z.number(),
            height: z.number(),
          })
          .optional()
          .describe('Region to capture { x, y, width, height }'),
        format: z.enum(['png', 'jpeg']).optional().describe('Image format (default: png)'),
        quality: z.number().optional().describe('JPEG quality 0-100 (default: 90)'),
        waitForStable: z
          .number()
          .optional()
          .describe('Wait time in ms for render stability before capture (default: 300)'),
      }),
    },
    async (args) => handleCapture(manager, args as any),
  )

  // ── get_console_errors ──────────────────────────────────────────
  server.registerTool(
    'get_console_errors',
    {
      description: 'Get browser console errors and warnings',
      inputSchema: z.object({
        level: z
          .enum(['error', 'warn', 'all'])
          .optional()
          .describe('Minimum log level to retrieve (default: error)'),
        since: z
          .number()
          .optional()
          .describe('Timestamp to retrieve logs after (default: last 30s)'),
        clearAfterRead: z.boolean().optional().describe('Clear logs after reading (default: true)'),
      }),
    },
    async (args) => handleConsoleErrors(manager, args as any),
  )

  // ── wait_hmr_stable ────────────────────────────────────────────
  server.registerTool(
    'wait_hmr_stable',
    {
      description: 'Wait for Vite HMR to complete and render to stabilize',
      inputSchema: z.object({
        timeout: z.number().optional().describe('Maximum wait time in ms (default: 5000)'),
        renderDelay: z
          .number()
          .optional()
          .describe('Extra delay after HMR for GPU flush in ms (default: 300)'),
      }),
    },
    async (args) => handleHmrStable(manager, args as any),
  )

  // ── get_page_status ────────────────────────────────────────────
  server.registerTool(
    'get_page_status',
    {
      description: 'Get page load status and WebGPU capability information',
      inputSchema: z.object({
        detailed: z
          .boolean()
          .optional()
          .describe('Return detailed GPU adapter info (default: false)'),
      }),
    },
    async (args) => handlePageStatus(manager, args as any),
  )

  return server
}
