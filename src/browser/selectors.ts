// UI Element Selectors for ElevenLabs
// NOTE: These selectors need to be discovered/verified by inspecting the ElevenLabs UI
// They may need updates if ElevenLabs changes their interface

export const SELECTORS = {
  // Login Page
  LOGIN: {
    EMAIL_INPUT: 'input[name="email"], input[type="email"], input[placeholder*="email" i]',
    PASSWORD_INPUT: 'input[name="password"], input[type="password"]',
    SUBMIT_BUTTON: 'button[type="submit"], button:has-text("Sign in"), button:has-text("Log in")',
    GOOGLE_LOGIN: 'button:has-text("Continue with Google")',
    ERROR_MESSAGE: '[role="alert"], .error-message, [data-testid="error"]',
  },

  // Image Generation Page - discovered selectors from ElevenLabs UI
  IMAGE_GEN: {
    // Prompt input textarea
    PROMPT_INPUT: 'textarea[placeholder="Describe your image..."], textarea[placeholder*="Describe your"]',

    // Model selector button (shows current model like "GPT Image 1.5")
    MODEL_SELECTOR: 'button:has-text("GPT Image"), button:has-text("Flux"), button:has-text("Seedream"), button:has-text("Nano")',
    MODEL_OPTION: (modelName: string) => `button:has-text("${modelName}"), [role="menuitem"]:has-text("${modelName}")`,

    // Generate/submit button - arrow icon at right side of prompt
    GENERATE_BUTTON: 'button[type="submit"], button[aria-label*="generate" i], button:has(svg[class*="arrow"])',

    // Image vs Video toggle
    IMAGE_TOGGLE: 'button:has-text("Image")',

    // Loading/progress indicators
    LOADING_INDICATOR: '[role="progressbar"], .animate-spin, [data-loading="true"], svg.animate-spin',

    // Generated image container and results
    IMAGE_RESULT: 'img[src*="replicate"], img[src*="elevenlabs"], img[src*="generated"]',
    IMAGE_CONTAINER: '[data-testid="image-result"], .image-result',

    // Download button
    DOWNLOAD_BUTTON: 'button:has-text("Download"), button[aria-label*="download" i], a[download]',

    // Aspect ratio selector (shows current ratio like "1:1", "16:9")
    ASPECT_RATIO_SELECTOR: 'button:has-text("1:1"), button:has-text("16:9"), button:has-text("9:16")',
    ASPECT_RATIO_OPTION: (ratio: string) => `button:has-text("${ratio}"), [role="menuitem"]:has-text("${ratio}")`,

    // Quality selector
    QUALITY_SELECTOR: 'button:has-text("Medium"), button:has-text("High"), button:has-text("Low")',

    // Image reference button
    IMAGE_REFS_BUTTON: 'button:has-text("Image refs")',

    // Negative prompt (if available)
    NEGATIVE_PROMPT: 'textarea[placeholder*="negative" i]',
  },

  // Navigation
  NAV: {
    IMAGE_VIDEO_LINK: 'a[href*="image-video"], nav a:has-text("Image"), a:has-text("Image & Video")',
    USER_MENU: '[data-testid="user-menu"], .user-avatar, button[aria-label*="account" i], button[aria-label*="profile" i], img[alt*="avatar" i]',
    LOGOUT_BUTTON: 'button:has-text("Log out"), button:has-text("Sign out"), a:has-text("Log out")',
    SIDEBAR_TOGGLE: 'button[aria-label*="sidebar" i], button[aria-label*="menu" i]',
  },

  // Common
  COMMON: {
    MODAL_CLOSE: 'button[aria-label="Close"], button:has-text("Close"), .modal-close, [data-testid="modal-close"]',
    COOKIE_ACCEPT: 'button:has-text("Accept"), button:has-text("Got it"), button:has-text("OK")',
    DIALOG: '[role="dialog"], .modal, [data-testid="dialog"]',
  }
};
