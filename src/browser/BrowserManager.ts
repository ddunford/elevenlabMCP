import { chromium, BrowserContext, Page } from 'playwright';
import { DEFAULTS } from '../config/defaults.js';
import path from 'path';
import fs from 'fs';

export class BrowserManager {
  private static instance: BrowserManager;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private initialized = false;

  private constructor() {}

  static getInstance(): BrowserManager {
    if (!BrowserManager.instance) {
      BrowserManager.instance = new BrowserManager();
    }
    return BrowserManager.instance;
  }

  async initialize(): Promise<void> {
    if (this.initialized && this.context) {
      // Check if context is still valid
      try {
        await this.context.pages();
        return;
      } catch {
        // Context is closed, reinitialize
        this.initialized = false;
        this.context = null;
        this.page = null;
      }
    }

    // Ensure user data directory exists
    const userDataDir = DEFAULTS.USER_DATA_DIR;
    if (!fs.existsSync(userDataDir)) {
      fs.mkdirSync(userDataDir, { recursive: true });
    }

    const headless = process.env.HEADLESS !== 'false';

    // Launch browser with persistent context for session retention
    this.context = await chromium.launchPersistentContext(userDataDir, {
      headless,
      viewport: { width: 1920, height: 1080 },
      acceptDownloads: true,
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ],
      ignoreDefaultArgs: ['--enable-automation'],
    });

    const pages = this.context.pages();
    this.page = pages[0] || await this.context.newPage();

    // Hide webdriver flag - must be added before any navigation
    await this.page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    // Set extra headers to ensure Referer is sent (required by Firebase Auth)
    await this.page.setExtraHTTPHeaders({
      'Referer': 'https://elevenlabs.io/'
    });

    // Navigate to main site first to ensure init script is applied
    await this.page.goto('https://elevenlabs.io', {
      waitUntil: 'domcontentloaded',
      timeout: 30000
    });

    this.initialized = true;

    console.error('[BrowserManager] Browser initialized');
  }

  async getPage(): Promise<Page> {
    await this.initialize();
    if (!this.page) {
      throw new Error('Page not initialized');
    }
    return this.page;
  }

  async getContext(): Promise<BrowserContext> {
    await this.initialize();
    if (!this.context) {
      throw new Error('Context not initialized');
    }
    return this.context;
  }

  async close(): Promise<void> {
    if (this.context) {
      try {
        await this.context.close();
      } catch (error) {
        console.error('[BrowserManager] Error closing context:', error);
      }
      this.context = null;
      this.page = null;
      this.initialized = false;
      console.error('[BrowserManager] Browser closed');
    }
  }

  // Save session state for persistence
  async saveSessionState(): Promise<void> {
    if (!this.context) return;

    const sessionDir = path.dirname(DEFAULTS.SESSION_PATH);
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    try {
      await this.context.storageState({ path: DEFAULTS.SESSION_PATH });
      console.error('[BrowserManager] Session state saved');
    } catch (error) {
      console.error('[BrowserManager] Error saving session state:', error);
    }
  }

  isInitialized(): boolean {
    return this.initialized && this.context !== null;
  }
}
