import type { Page } from 'playwright'

export interface RenderStabilityResult {
  stable: boolean
  totalWait: number
}

/**
 * Wait for Vite HMR to settle and render to complete.
 * Uses rAF + configurable delay to ensure GPU pipeline flush.
 */
export async function waitForRenderStable(
  page: Page,
  renderDelay: number = 300,
): Promise<RenderStabilityResult> {
  const start = Date.now()

  // 1. Wait for Vite HMR pending flag to clear
  await page
    .evaluate(() => {
      return new Promise<void>((resolve) => {
        const check = () => {
          if (!(window as any).__vite_hmr_pending) {
            resolve()
          } else {
            setTimeout(check, 50)
          }
        }
        // If no HMR flag exists, resolve immediately
        if (!(window as any).__vite_hmr_metadata) {
          resolve()
        } else {
          check()
        }
      })
    })
    .catch(() => {
      // Timeout or not available — proceed anyway
    })

  // 2. Wait for requestAnimationFrame to complete
  await page
    .evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve(undefined))))
    .catch(() => {})

  // 3. Extra delay for GPU pipeline flush
  await new Promise((resolve) => setTimeout(resolve, renderDelay))

  return {
    stable: true,
    totalWait: Date.now() - start,
  }
}
