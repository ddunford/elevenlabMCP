import { Page } from 'playwright';
import { BrowserManager } from './BrowserManager.js';
import { SELECTORS } from './selectors.js';
import { DEFAULTS } from '../config/defaults.js';
import { IMAGE_MODELS, DEFAULT_MODEL } from '../config/models.js';
import type { GenerateImageParams, GenerateImageResult } from '../types/index.js';
import path from 'path';
import fs from 'fs';

export class ElevenLabsAutomation {
  private browserManager: BrowserManager;

  constructor() {
    this.browserManager = BrowserManager.getInstance();
  }

  async navigateToImageGeneration(): Promise<Page> {
    const page = await this.browserManager.getPage();

    console.error('[ElevenLabsAutomation] Navigating to image generation page...');

    // Navigate to image generation page
    await page.goto(DEFAULTS.IMAGE_VIDEO_URL, {
      waitUntil: 'domcontentloaded',
      timeout: DEFAULTS.TIMEOUT_NAVIGATION
    });

    // Wait for page to settle
    await page.waitForTimeout(3000);

    // Handle cookie consent if present
    try {
      const cookieButton = page.locator('button:has-text("ACCEPT ALL COOKIES")').first();
      if (await cookieButton.isVisible({ timeout: 2000 })) {
        await cookieButton.click();
        console.error('[ElevenLabsAutomation] Dismissed cookie consent');
        await page.waitForTimeout(500);
      }
    } catch {
      // Cookie banner not present, continue
    }

    // Handle GPT Image popup - click "Try now" to dismiss and activate image mode
    try {
      const tryNowButton = page.locator('button:has-text("Try now")').first();
      if (await tryNowButton.isVisible({ timeout: 2000 })) {
        await tryNowButton.click();
        console.error('[ElevenLabsAutomation] Clicked "Try now" on GPT Image popup');
        await page.waitForTimeout(1000);
      }
    } catch {
      // No popup present
    }

    // Make sure we're in Image mode (not Video)
    try {
      const imageToggle = page.locator(SELECTORS.IMAGE_GEN.IMAGE_TOGGLE).first();
      if (await imageToggle.isVisible({ timeout: 1000 })) {
        await imageToggle.click();
        await page.waitForTimeout(500);
      }
    } catch {
      // Already in image mode or toggle not visible
    }

    return page;
  }

  async selectModel(page: Page, modelId: string): Promise<void> {
    const model = IMAGE_MODELS[modelId];
    if (!model) {
      console.error(`[ElevenLabsAutomation] Unknown model: ${modelId}, using default`);
      return;
    }

    console.error(`[ElevenLabsAutomation] Selecting model: ${model.name}`);

    try {
      // Click model selector to open dropdown
      const modelSelector = page.locator(SELECTORS.IMAGE_GEN.MODEL_SELECTOR).first();
      if (await modelSelector.isVisible({ timeout: 3000 })) {
        await modelSelector.click();
        await page.waitForTimeout(500); // Allow dropdown to open

        // Select the desired model
        const modelOption = page.locator(SELECTORS.IMAGE_GEN.MODEL_OPTION(model.name)).first();
        if (await modelOption.isVisible({ timeout: 2000 })) {
          await modelOption.click();
          await page.waitForTimeout(500);
        }
      }
    } catch (error) {
      console.error('[ElevenLabsAutomation] Could not select model:', error);
    }
  }

  async setAspectRatio(page: Page, aspectRatio: string): Promise<void> {
    console.error(`[ElevenLabsAutomation] Setting aspect ratio: ${aspectRatio}`);

    try {
      const aspectSelector = page.locator(SELECTORS.IMAGE_GEN.ASPECT_RATIO_SELECTOR).first();
      if (await aspectSelector.isVisible({ timeout: 2000 })) {
        await aspectSelector.click();
        await page.waitForTimeout(300);

        const aspectOption = page.locator(SELECTORS.IMAGE_GEN.ASPECT_RATIO_OPTION(aspectRatio)).first();
        if (await aspectOption.isVisible({ timeout: 2000 })) {
          await aspectOption.click();
        }
      }
    } catch (error) {
      console.error('[ElevenLabsAutomation] Could not set aspect ratio:', error);
    }
  }

  async generateImage(params: GenerateImageParams): Promise<GenerateImageResult> {
    const {
      prompt,
      model = DEFAULT_MODEL,
      savePath = DEFAULTS.SAVE_PATH,
      aspectRatio,
      negativePrompt
    } = params;

    console.error(`[ElevenLabsAutomation] Generating image with prompt: "${prompt.substring(0, 50)}..."`);

    try {
      const page = await this.navigateToImageGeneration();

      // Check if we're on the login page (not authenticated)
      const currentUrl = page.url();
      if (currentUrl.includes('sign-in')) {
        return {
          success: false,
          error: 'Not logged in. Please authenticate first.',
          model,
          prompt
        };
      }

      // Wait for the page to be fully loaded
      await page.waitForTimeout(2000);

      // Select model if different from default
      if (model !== DEFAULT_MODEL) {
        await this.selectModel(page, model);
      }

      // Set aspect ratio if provided
      if (aspectRatio) {
        await this.setAspectRatio(page, aspectRatio);
      }

      // Find and fill prompt input
      console.error('[ElevenLabsAutomation] Entering prompt...');
      const promptInput = page.locator(SELECTORS.IMAGE_GEN.PROMPT_INPUT).first();
      await promptInput.waitFor({ state: 'visible', timeout: 10000 });
      await promptInput.click();
      await promptInput.fill(prompt);

      // Enter negative prompt if supported and provided
      if (negativePrompt) {
        try {
          const negPromptInput = page.locator(SELECTORS.IMAGE_GEN.NEGATIVE_PROMPT).first();
          if (await negPromptInput.isVisible({ timeout: 2000 })) {
            await negPromptInput.fill(negativePrompt);
          }
        } catch {
          console.error('[ElevenLabsAutomation] Negative prompt input not available');
        }
      }

      // Click generate button
      console.error('[ElevenLabsAutomation] Clicking generate button...');
      const generateButton = page.locator(SELECTORS.IMAGE_GEN.GENERATE_BUTTON).first();
      await generateButton.waitFor({ state: 'visible', timeout: 5000 });
      await generateButton.click();

      // Wait for generation to complete
      await this.waitForGeneration(page);

      // Download the generated image
      const imagePath = await this.downloadImage(page, savePath, prompt);

      console.error(`[ElevenLabsAutomation] Image saved to: ${imagePath}`);

      return {
        success: true,
        imagePath,
        model,
        prompt
      };

    } catch (error) {
      console.error('[ElevenLabsAutomation] Generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error during image generation',
        model,
        prompt
      };
    }
  }

  private async waitForGeneration(page: Page): Promise<void> {
    console.error('[ElevenLabsAutomation] Waiting for image generation...');

    // Wait for loading indicator to appear
    try {
      await page.waitForSelector(SELECTORS.IMAGE_GEN.LOADING_INDICATOR, {
        state: 'visible',
        timeout: 10000
      });
      console.error('[ElevenLabsAutomation] Generation started...');
    } catch {
      console.error('[ElevenLabsAutomation] Loading indicator not detected, continuing...');
    }

    // Wait for either:
    // 1. Navigation to History page (generation complete)
    // 2. Loading indicator to disappear
    // 3. Timeout
    const startTime = Date.now();
    while (Date.now() - startTime < DEFAULTS.TIMEOUT_IMAGE_GENERATION) {
      // Check if we've navigated to History (generation complete)
      const currentUrl = page.url();
      if (currentUrl.includes('History') || currentUrl.includes('history')) {
        console.error('[ElevenLabsAutomation] Navigated to History - generation complete');
        break;
      }

      // Check if loading indicator is gone
      try {
        const loading = page.locator(SELECTORS.IMAGE_GEN.LOADING_INDICATOR).first();
        if (!await loading.isVisible({ timeout: 1000 })) {
          // Double-check we're not still on the input page
          await page.waitForTimeout(2000);
          const url = page.url();
          if (url.includes('History') || url.includes('history')) {
            console.error('[ElevenLabsAutomation] Generation complete');
            break;
          }
        }
      } catch {
        // Continue waiting
      }

      await page.waitForTimeout(3000);
      console.error(`[ElevenLabsAutomation] Still generating... (${Math.round((Date.now() - startTime) / 1000)}s)`);
    }

    // Give extra time for page to fully load
    await page.waitForTimeout(2000);
  }

  private async downloadImage(page: Page, savePath: string, prompt: string): Promise<string> {
    // Ensure save directory exists
    if (!fs.existsSync(savePath)) {
      fs.mkdirSync(savePath, { recursive: true });
    }

    // Generate filename from prompt
    const sanitizedPrompt = prompt
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .substring(0, 50);
    const timestamp = Date.now();
    const filename = `${sanitizedPrompt}-${timestamp}.png`;
    const fullPath = path.join(savePath, filename);

    console.error('[ElevenLabsAutomation] Downloading image...');

    // On History page, find the MOST RECENT generated image (at top of list)
    // The images are organized by date, newest first
    try {
      // Wait for History page to fully load
      await page.waitForTimeout(2000);

      // Press Home key to scroll to top
      await page.keyboard.press('Home');
      await page.waitForTimeout(1000);

      // Get all result images and pick the first visible one from the top
      const firstResultImage = page.locator('img[src*="replicate"], img[src*="storage.googleapis"]').first();

      if (await firstResultImage.isVisible({ timeout: 5000 })) {
        console.error('[ElevenLabsAutomation] Clicking on first result image...');
        await firstResultImage.click();
        await page.waitForTimeout(1500);

        // Now in detail view, find the full-size image
        const detailImage = page.locator('img[src*="replicate"], img[src*="storage.googleapis"]').first();
        const src = await detailImage.getAttribute('src');

        if (src) {
          console.error('[ElevenLabsAutomation] Downloading from detail view...');
          const response = await page.request.get(src);
          const buffer = await response.body();

          // Detect actual file type and adjust extension
          const contentType = response.headers()['content-type'] || '';
          let actualPath = fullPath;
          if (contentType.includes('webp') || src.includes('.webp')) {
            actualPath = fullPath.replace('.png', '.webp');
          }

          fs.writeFileSync(actualPath, buffer);
          console.error(`[ElevenLabsAutomation] Image saved to: ${actualPath}`);
          return actualPath;
        }
      }
    } catch (error) {
      console.error('[ElevenLabsAutomation] Detail view download failed:', error);
    }

    // Fallback: try to get image directly from page
    try {
      const allImages = await page.locator('img[src*="replicate"], img[src*="storage.googleapis"]').all();
      console.error(`[ElevenLabsAutomation] Found ${allImages.length} potential result images`);

      if (allImages.length > 0) {
        const src = await allImages[0].getAttribute('src');
        if (src) {
          const response = await page.request.get(src);
          const buffer = await response.body();
          fs.writeFileSync(fullPath, buffer);
          console.error(`[ElevenLabsAutomation] Image saved to: ${fullPath}`);
          return fullPath;
        }
      }
    } catch (error) {
      console.error('[ElevenLabsAutomation] Fallback download failed:', error);
    }

    // Fallback: Click on first image to open detail view
    try {
      const firstImage = page.locator('img').first();
      await firstImage.click();
      await page.waitForTimeout(1000);

      // Look for download button in detail view
      const downloadButton = page.locator(SELECTORS.IMAGE_GEN.DOWNLOAD_BUTTON).first();
      if (await downloadButton.isVisible({ timeout: 3000 })) {
        const downloadPromise = page.waitForEvent('download', { timeout: DEFAULTS.TIMEOUT_DOWNLOAD });
        await downloadButton.click();
        const download = await downloadPromise;
        await download.saveAs(fullPath);
        console.error('[ElevenLabsAutomation] Image downloaded via detail view');
        return fullPath;
      }
    } catch (error) {
      console.error('[ElevenLabsAutomation] Detail view download failed:', error);
    }

    // Last resort: screenshot the first visible generated image
    try {
      console.error('[ElevenLabsAutomation] Taking screenshot of image...');
      const imageElement = page.locator('img[src*="replicate"], img[src*="storage"]').first();
      if (await imageElement.isVisible()) {
        await imageElement.screenshot({ path: fullPath });
        return fullPath;
      }
    } catch (error) {
      console.error('[ElevenLabsAutomation] Screenshot failed:', error);
    }

    throw new Error('Failed to download image - no suitable image found');
  }

  async checkLoginStatus(page: Page): Promise<boolean> {
    const currentUrl = page.url();
    return !currentUrl.includes('sign-in') && currentUrl.includes('elevenlabs.io');
  }
}
