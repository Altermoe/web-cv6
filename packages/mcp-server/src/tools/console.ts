import type { BrowserManager } from '../browser/manager.js'

export interface ConsoleErrorsArgs {
  level?: 'error' | 'warn' | 'all'
  since?: number
  clearAfterRead?: boolean
}

export async function handleConsoleErrors(
  manager: BrowserManager,
  args: ConsoleErrorsArgs,
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const level = args.level ?? 'error'
  const since = args.since
  const clearAfterRead = args.clearAfterRead ?? true

  let logs = manager.getConsoleLogs()

  // Filter by time (numeric ms comparison to avoid ISO string lexicographic issues)
  if (since) {
    logs = logs.filter((log) => new Date(log.timestamp).getTime() >= since)
  }

  // Filter by level
  if (level !== 'all') {
    logs = logs.filter((log) => {
      if (level === 'error') {
        return log.level === 'error' || log.level === 'exception'
      }
      if (level === 'warn') {
        return log.level === 'warning' || log.level === 'error' || log.level === 'exception'
      }
      return true
    })
  }

  if (clearAfterRead) {
    manager.clearConsoleLogs()
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          errors: logs,
          count: logs.length,
        }),
      },
    ],
  }
}
