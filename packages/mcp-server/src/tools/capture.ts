import type { BrowserManager } from '../browser/manager.js'
import { captureScreenshot } from '../utils/screenshot.js'
import { waitForRenderStable } from '../utils/stable.js'

export interface CaptureArgs {
  selector?: string
  region?: { x: number; y: number; width: number; height: number }
  format?: 'png' | 'jpeg'
  quality?: number
  waitForStable?: number
}

export async function handleCapture(
  manager: BrowserManager,
  args: CaptureArgs,
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  await manager.ensureInitialized()
  const page = manager.getPage()

  // Wait for render stability if requested
  const waitTime = args.waitForStable ?? 300
  if (waitTime > 0) {
    await waitForRenderStable(page, waitTime)
  }

  const result = await captureScreenshot(page, {
    selector: args.selector,
    region: args.region,
    format: args.format ?? 'png',
    quality: args.quality,
  })

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          ...result,
          timestamp: new Date().toISOString(),
          url: manager.getDevUrl(),
        }),
      },
    ],
  }
}
