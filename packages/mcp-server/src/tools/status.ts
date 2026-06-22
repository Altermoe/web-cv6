import type { BrowserManager } from '../browser/manager.js'
import { detectWebGpu } from '../browser/webgpu.js'

export interface StatusArgs {
  detailed?: boolean
}

export async function handlePageStatus(
  manager: BrowserManager,
  args: StatusArgs,
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const detailed = args.detailed ?? false

  await manager.ensureInitialized()
  const page = manager.getPage()

  const loaded = !page.isClosed()
  const url = manager.getDevUrl()
  const consoleLogs = manager.getConsoleLogs()
  const consoleErrors = consoleLogs.filter((l) => l.level === 'error').length

  let webgpu = {
    available: false,
    adapter: null as string | null,
    features: [] as string[],
    limits: {} as Record<string, number>,
  }
  if (detailed) {
    webgpu = await detectWebGpu(page)
  } else {
    // Quick check only
    webgpu.available = await page.evaluate(() => !!navigator.gpu).catch(() => false)
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          loaded,
          url,
          webgpu,
          consoleErrors,
        }),
      },
    ],
  }
}
