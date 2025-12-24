import { BrowserManager } from '../browser/BrowserManager.js';
import { SessionStore } from './SessionStore.js';
import { SELECTORS } from '../browser/selectors.js';
import { DEFAULTS } from '../config/defaults.js';
import type { AuthCredentials, SessionStatus } from '../types/index.js';

export class AuthManager {
  private browserManager: BrowserManager;
  private sessionStore: SessionStore;

  constructor() {
    this.browserManager = BrowserManager.getInstance();
    this.sessionStore = new SessionStore();
  }

  async login(credentials: AuthCredentials): Promise<boolean> {
    const page = await this.browserManager.getPage();

    try {
      console.error('[AuthManager] Navigating to login page...');

      // Navigate to login page
      await page.goto(DEFAULTS.LOGIN_URL, {
        waitUntil: 'networkidle',
        timeout: DEFAULTS.TIMEOUT_NAVIGATION
      });

      // Wait for email input
      await page.waitForSelector(SELECTORS.LOGIN.EMAIL_INPUT, {
        state: 'visible',
        timeout: 10000
      });

      // Handle cookie consent if present
      try {
        const acceptCookies = page.locator('button:has-text("ACCEPT ALL COOKIES")').first();
        if (await acceptCookies.isVisible({ timeout: 2000 })) {
          await acceptCookies.click();
          await page.waitForTimeout(500);
        }
      } catch {
        // Cookie banner not present
      }

      // Fill email
      console.error('[AuthManager] Filling email...');
      await page.locator(SELECTORS.LOGIN.EMAIL_INPUT).first().fill(credentials.email);

      // Fill password
      console.error('[AuthManager] Filling password...');
      await page.locator(SELECTORS.LOGIN.PASSWORD_INPUT).first().fill(credentials.password);

      // Click submit - the Sign in button doesn't have type="submit"
      console.error('[AuthManager] Clicking Sign in button...');
      const signInBtn = page.locator('button').filter({ hasText: /^Sign in$/i }).first();
      await signInBtn.click();

      // Wait for navigation after login (URL should change from sign-in)
      try {
        await page.waitForURL((url) => !url.pathname.includes('sign-in'), {
          timeout: DEFAULTS.TIMEOUT_NAVIGATION
        });
      } catch {
        // If we're still on sign-in page, check for error
        if (page.url().includes('sign-in')) {
          const errorElement = page.locator('[role="alert"], .error-message').first();
          if (await errorElement.isVisible({ timeout: 1000 })) {
            const errorText = await errorElement.textContent();
            console.error('[AuthManager] Login error:', errorText);
            return false;
          }
          console.error('[AuthManager] Login failed - still on sign-in page');
          return false;
        }
      }

      // Verify successful login by checking URL
      const currentUrl = page.url();
      const isLoggedIn = !currentUrl.includes('sign-in');

      if (isLoggedIn) {
        console.error('[AuthManager] Login successful');
        // Save session state
        await this.browserManager.saveSessionState();
        await this.sessionStore.save({
          email: credentials.email,
          lastLogin: new Date().toISOString(),
          isValid: true
        });
      }

      return isLoggedIn;

    } catch (error) {
      console.error('[AuthManager] Login error:', error);
      return false;
    }
  }

  async logout(): Promise<void> {
    const page = await this.browserManager.getPage();

    try {
      // Click user menu
      const userMenu = page.locator(SELECTORS.NAV.USER_MENU).first();
      if (await userMenu.isVisible({ timeout: 3000 })) {
        await userMenu.click();
        await page.waitForTimeout(500);

        // Click logout
        const logoutButton = page.locator(SELECTORS.NAV.LOGOUT_BUTTON).first();
        if (await logoutButton.isVisible({ timeout: 2000 })) {
          await logoutButton.click();
        }
      }

      // Clear session store
      await this.sessionStore.clear();
      console.error('[AuthManager] Logged out');

    } catch (error) {
      console.error('[AuthManager] Logout error:', error);
    }
  }

  async getSessionStatus(): Promise<SessionStatus> {
    const page = await this.browserManager.getPage();

    try {
      // Navigate to the app to check auth status
      const currentUrl = page.url();
      if (!currentUrl.includes('elevenlabs.io')) {
        await page.goto(DEFAULTS.IMAGE_VIDEO_URL, {
          waitUntil: 'domcontentloaded',
          timeout: DEFAULTS.TIMEOUT_NAVIGATION
        });
      }

      // Check if redirected to login page
      await page.waitForTimeout(2000); // Wait for any redirects
      const finalUrl = page.url();
      const isLoggedIn = !finalUrl.includes('sign-in') && finalUrl.includes('elevenlabs.io');

      const sessionData = await this.sessionStore.load();

      return {
        isLoggedIn,
        email: sessionData?.email,
        lastChecked: new Date().toISOString()
      };

    } catch (error) {
      console.error('[AuthManager] Session check error:', error);
      return {
        isLoggedIn: false,
        lastChecked: new Date().toISOString()
      };
    }
  }

  async ensureAuthenticated(credentials?: AuthCredentials): Promise<boolean> {
    const status = await this.getSessionStatus();

    if (status.isLoggedIn) {
      return true;
    }

    // If we have credentials, try to log in
    if (credentials) {
      return await this.login(credentials);
    }

    return false;
  }
}
