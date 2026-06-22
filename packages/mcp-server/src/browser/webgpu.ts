import type { Page, CDPSession } from 'playwright'

export interface WebGpuInfo {
  available: boolean
  adapter: string | null
  features: string[]
  limits: Record<string, number>
}

/**
 * Detect WebGPU capabilities in the browser page.
 */
export async function detectWebGpu(page: Page): Promise<WebGpuInfo> {
  try {
    const info = await page.evaluate((): WebGpuInfo => {
      if (!navigator.gpu) {
        return { available: false, adapter: null, features: [], limits: {} }
      }

      // We can only do a basic check here; full adapter info requires async requestAdapter
      return {
        available: true,
        adapter: null, // Will be populated by requestAdapter if needed
        features: [],
        limits: {},
      }
    })

    // If WebGPU is available, try to get adapter info
    if (info.available) {
      const adapterInfo = await page.evaluate(async () => {
        try {
          const adapter = await navigator.gpu.requestAdapter()
          if (!adapter) return null
          const featureNames = Array.from(adapter.features).map((f) => (f as any).toString())
          const limitEntries: Record<string, number> = {}
          for (const [key, value] of Object.entries(adapter.limits)) {
            limitEntries[key] = value as number
          }
          return {
            adapter: (adapter as any).info?.device ?? 'unknown',
            features: featureNames,
            limits: limitEntries,
          }
        } catch {
          return null
        }
      })

      if (adapterInfo) {
        info.adapter = adapterInfo.adapter
        info.features = adapterInfo.features
        info.limits = adapterInfo.limits
      }
    }

    return info
  } catch {
    return { available: false, adapter: null, features: [], limits: {} }
  }
}

/**
 * Set up CDP session for enhanced browser interaction.
 */
export async function createCdpSession(page: Page): Promise<CDPSession> {
  return await page.context().newCDPSession(page)
}
