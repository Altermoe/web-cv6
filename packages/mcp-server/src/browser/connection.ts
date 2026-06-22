import type { CDPSession } from 'playwright'

export interface ConsoleLog {
  level: string
  text: string
  timestamp: string
  source: string
  location?: { url: string; line: number }
}

/**
 * Set up CDP console message listener.
 * Captures all console output for later retrieval.
 */
export function setupConsoleListener(cdpSession: CDPSession, logs: ConsoleLog[]): void {
  cdpSession.on('Runtime.consoleAPICalled', (event) => {
    const text = event.args?.map((arg) => arg.value ?? arg.description ?? arg.type).join(' ') ?? ''

    logs.push({
      level: mapLogLevel(event.type),
      text,
      timestamp: new Date().toISOString(),
      source: 'console',
    })
  })

  cdpSession.on('Runtime.exceptionThrown', (event) => {
    const details = event.exceptionDetails
    logs.push({
      level: 'error',
      text: details?.text ?? 'Unknown exception',
      timestamp: new Date().toISOString(),
      source: 'exception',
      location: details?.url ? { url: details.url, line: details.lineNumber ?? 0 } : undefined,
    })
  })
}

function mapLogLevel(cdpLevel: string): string {
  switch (cdpLevel) {
    case 'error':
      return 'error'
    case 'warning':
      return 'warning'
    case 'info':
      return 'info'
    case 'debug':
      return 'debug'
    default:
      return 'log'
  }
}
