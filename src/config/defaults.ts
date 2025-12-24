import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');

export const DEFAULTS = {
  SAVE_PATH: path.resolve(PROJECT_ROOT, 'assets'),
  SESSION_PATH: path.resolve(PROJECT_ROOT, '.auth', 'session.json'),
  USER_DATA_DIR: path.resolve(PROJECT_ROOT, '.auth', 'browser-data'),
  ELEVENLABS_URL: 'https://elevenlabs.io',
  IMAGE_VIDEO_URL: 'https://elevenlabs.io/app/image-video',
  LOGIN_URL: 'https://elevenlabs.io/app/sign-in',
  TIMEOUT_NAVIGATION: 30000,
  TIMEOUT_IMAGE_GENERATION: 180000, // 3 minutes for image generation
  TIMEOUT_DOWNLOAD: 30000,
};
