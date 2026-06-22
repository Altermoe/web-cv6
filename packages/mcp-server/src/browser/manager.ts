import type { Browser, Page, CDPSession } from 'playwright'
import type { ConsoleLog } from './connection.js'
import { setupConsoleListener } from './connection.js'

export interface BrowserManagerOptions {
  headless?: boolean
  devUrl?: string
  viewportWidth?: number
  viewportHeight?: number
}

const DEFAULT_DEV_URL = 'http://localhost:26618'
const DEFAULT_VIEWPORT = { width: 1280, height: 720 }

const CHROMIUM_ARGS = [
  '--no-sandbox',
  '--enable-unsafe-webgpu',
  '--enable-features=Vulkan',
  '--use-angle=vulkan',
  '--disable-vulkan-surface',
]

export class BrowserManager {
  private browser: Browser | null = null
  private page: Page | null = null
  private cdpSession: CDPSession | null = null
  private initialized = false
  private consoleLogs: ConsoleLog[] = []

  private readonly headless: boolean
  private readonly devUrl: string
  private readonly viewportWidth: number
  private readonly viewportHeight: number

  constructor(options: BrowserManagerOptions = {}) {
    this.headless = options.headless ?? true
    this.devUrl = options.devUrl ?? process.env.VITE_DEV_URL ?? DEFAULT_DEV_URL
    this.viewportWidth = options.viewportWidth ?? DEFAULT_VIEWPORT.width
    this.viewportHeight = options.viewportHeight ?? DEFAULT_VIEWPORT.height
  }

  /**
   * Lazy-initialize browser on first tool call.
   */
  async ensureInitialized(): Promise<void> {
    if (this.initialized && this.browser?.isConnected()) {
      return
    }

    const { chromium } = await import('playwright')

    this.browser = await chromium.launch({
      headless: this.headless,
      args: CHROMIUM_ARGS,
    })

    const context = await this.browser.newContext({
      viewport: { width: this.viewportWidth, height: this.viewportHeight },
    })

    this.page = await context.newPage()
    this.cdpSession = await context.newCDPSession(this.page)

    // Set up console log capture
    setupConsoleListener(this.cdpSession, this.consoleLogs)

    // Navigate to dev server
    await this.page.goto(this.devUrl, { waitUntil: 'networkidle', timeout: 10_000 })

    this.initialized = true
  }

  getPage(): Page {
    if (!this.page) {
      throw new Error('Browser not initialized. Call ensureInitialized() first.')
    }
    return this.page
  }

  getDevUrl(): string {
    return this.devUrl
  }

  getConsoleLogs(): ConsoleLog[] {
    return this.consoleLogs
  }

  clearConsoleLogs(): void {
    this.consoleLogs = []
  }

  async close(): Promise<void> {
    if (this.cdpSession) {
      await this.cdpSession.detach().catch(() => {})
      this.cdpSession = null
    }
    if (this.browser) {
      await this.browser.close().catch(() => {})
      this.browser = null
    }
    this.page = null
    this.initialized = false
    this.consoleLogs = []
  }

  isReady(): boolean {
    return this.initialized && this.browser?.isConnected() === true && this.page !== null
  }

  /**
   * Inject console logs for testing. Replaces the internal log array reference
   * so that getConsoleLogs() and clearConsoleLogs() work correctly.
   */
  setConsoleLogsForTesting(logs: ConsoleLog[]): void {
    this.consoleLogs = logs
  }

  /**
   * Inject a mock page and mark as initialized for testing.
   * Sets a mock browser with isConnected() => true so ensureInitialized() short-circuits.
   */
  setPageForTesting(page: Page): void {
    ;(this as any).page = page
    ;(this as any).browser = { isConnected: () => true }
    ;(this as any).initialized = true
  }
}
