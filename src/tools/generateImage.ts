import { z } from 'zod';
import { ElevenLabsAutomation } from '../browser/ElevenLabsAutomation.js';
import { AuthManager } from '../auth/AuthManager.js';
import { IMAGE_MODELS, DEFAULT_MODEL } from '../config/models.js';
import { DEFAULTS } from '../config/defaults.js';

export const generateImageSchema = z.object({
  prompt: z.string().min(1).describe('The text prompt describing the image to generate'),
  model: z.string().optional().describe(`Model to use. Options: ${Object.keys(IMAGE_MODELS).join(', ')}. Default: ${DEFAULT_MODEL}`),
  savePath: z.string().optional().describe(`Directory to save the image. Default: assets/`),
  aspectRatio: z.string().optional().describe('Aspect ratio (e.g., "1:1", "16:9", "9:16")'),
  negativePrompt: z.string().optional().describe('What to avoid in the generated image'),
  email: z.string().optional().describe('ElevenLabs account email (for authentication if not logged in)'),
  password: z.string().optional().describe('ElevenLabs account password (for authentication if not logged in)')
});

export const generateImageDefinition = {
  name: 'generate_image',
  description: 'Generate an image using ElevenLabs Image & Video feature. Returns the path to the downloaded image file.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      prompt: {
        type: 'string',
        description: 'The text prompt describing the image to generate'
      },
      model: {
        type: 'string',
        description: `Model to use. Options: ${Object.keys(IMAGE_MODELS).join(', ')}. Default: ${DEFAULT_MODEL}`,
        enum: Object.keys(IMAGE_MODELS)
      },
      savePath: {
        type: 'string',
        description: `Directory to save the image. Default: ${DEFAULTS.SAVE_PATH}`
      },
      aspectRatio: {
        type: 'string',
        description: 'Aspect ratio (e.g., "1:1", "16:9", "9:16")'
      },
      negativePrompt: {
        type: 'string',
        description: 'What to avoid in the generated image'
      },
      email: {
        type: 'string',
        description: 'ElevenLabs account email (for authentication if not logged in)'
      },
      password: {
        type: 'string',
        description: 'ElevenLabs account password (for authentication if not logged in)'
      }
    },
    required: ['prompt']
  }
};

export async function generateImage(args: z.infer<typeof generateImageSchema>): Promise<string> {
  const authManager = new AuthManager();
  const automation = new ElevenLabsAutomation();

  // Check if we need to authenticate
  const status = await authManager.getSessionStatus();

  if (!status.isLoggedIn) {
    // Try credentials from args first, then fall back to environment variables
    const email = args.email || process.env.ELEVENLABS_EMAIL;
    const password = args.password || process.env.ELEVENLABS_PASSWORD;

    if (email && password) {
      console.error('[generateImage] Not logged in, attempting authentication...');
      const loginSuccess = await authManager.login({ email, password });

      if (!loginSuccess) {
        return JSON.stringify({
          success: false,
          error: 'Failed to authenticate. Please check your credentials.'
        });
      }
    } else {
      return JSON.stringify({
        success: false,
        error: 'Not logged in. Please provide email and password via tool parameters or ELEVENLABS_EMAIL/ELEVENLABS_PASSWORD environment variables.'
      });
    }
  }

  // Generate the image
  const result = await automation.generateImage({
    prompt: args.prompt,
    model: args.model || DEFAULT_MODEL,
    savePath: args.savePath || DEFAULTS.SAVE_PATH,
    aspectRatio: args.aspectRatio,
    negativePrompt: args.negativePrompt
  });

  return JSON.stringify(result, null, 2);
}
