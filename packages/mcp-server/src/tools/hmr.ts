import type { BrowserManager } from '../browser/manager.js'
import { waitForRenderStable } from '../utils/stable.js'

export interface HmrArgs {
  timeout?: number
  renderDelay?: number
}

export async function handleHmrStable(
  manager: BrowserManager,
  args: HmrArgs,
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const timeout = args.timeout ?? 5000
  const renderDelay = args.renderDelay ?? 300

  await manager.ensureInitialized()
  const page = manager.getPage()

  // Race between HMR stability and timeout
  const result = await Promise.race([
    waitForRenderStable(page, renderDelay),
    new Promise<{ stable: false; totalWait: number }>((resolve) =>
      setTimeout(() => resolve({ stable: false, totalWait: timeout }), timeout),
    ),
  ])

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result),
      },
    ],
  }
}
