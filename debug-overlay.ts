import { BrowserManager } from './src/browser/BrowserManager.js';
import { DEFAULTS } from './src/config/defaults.js';

async function debug() {
  const browser = BrowserManager.getInstance();
  const page = await browser.getPage();

  console.log('Navigating to image generation page...');
  await page.goto(DEFAULTS.IMAGE_VIDEO_URL, {
    waitUntil: 'domcontentloaded',
    timeout: 30000
  });
  await page.waitForTimeout(5000);

  // Take screenshot
  await page.screenshot({ path: 'overlay-check.png', fullPage: true });
  console.log('Screenshot saved');

  // Check for any overlay or modal elements
  const overlays = await page.locator('[role="dialog"], [class*="modal"], [class*="overlay"], [class*="popup"]').all();
  console.log(`Found ${overlays.length} potential overlay elements`);

  // Check for any buttons that might dismiss overlays
  const buttons = await page.locator('button').all();
  console.log(`Found ${buttons.length} buttons`);
  for (let i = 0; i < Math.min(10, buttons.length); i++) {
    const text = await buttons[i].textContent();
    const isVisible = await buttons[i].isVisible();
    if (isVisible && text && text.trim()) {
      console.log(`  Button ${i}: "${text.trim().substring(0, 50)}"`);
    }
  }

  await browser.close();
}

debug().catch(console.error);
