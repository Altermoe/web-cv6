import type { Page } from 'playwright'

export interface ScreenshotOptions {
  selector?: string
  region?: { x: number; y: number; width: number; height: number }
  format?: 'png' | 'jpeg'
  quality?: number
}

export interface ScreenshotResult {
  image: string // base64
  width: number
  height: number
  format: string
}

/**
 * Capture a screenshot from the page, optionally cropped to a specific element or region.
 */
export async function captureScreenshot(
  page: Page,
  options: ScreenshotOptions,
): Promise<ScreenshotResult> {
  const { selector, region, format = 'png', quality } = options

  const screenshotOptions: Record<string, unknown> = {
    type: format,
    encoding: 'base64',
  }

  if (quality !== undefined && format === 'jpeg') {
    screenshotOptions.quality = quality
  }

  // If a specific element selector is provided, screenshot that element
  if (selector) {
    const element = await page.$(selector)
    if (element) {
      const buffer = (await element.screenshot(screenshotOptions)) as unknown as Buffer
      return {
        image: buffer.toString('base64'),
        width: region?.width ?? 0,
        height: region?.height ?? 0,
        format,
      }
    }
  }

  // Region crop
  if (region) {
    screenshotOptions.clip = region
  }

  const buffer = (await page.screenshot(screenshotOptions)) as unknown as Buffer

  // Get actual page viewport size for the result
  const viewport = page.viewportSize()
  const width = region?.width ?? viewport?.width ?? 800
  const height = region?.height ?? viewport?.height ?? 600

  return {
    image: buffer.toString('base64'),
    width,
    height,
    format,
  }
}
