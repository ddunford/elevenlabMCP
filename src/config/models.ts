import type { ImageModel } from '../types/index.js';

export const IMAGE_MODELS: Record<string, ImageModel> = {
  'gpt-image-1.5': {
    id: 'gpt-image-1.5',
    name: 'GPT Image 1.5',
    description: 'OpenAI - precise, high-quality image generation',
    supportsNegativePrompt: false,
    supportsBatchGeneration: true,
    aspectRatios: ['1:1', '16:9', '9:16', '3:2', '2:3', '4:3', '3:4']
  },
  'gpt-image-1': {
    id: 'gpt-image-1',
    name: 'GPT Image 1',
    description: 'OpenAI - precise text-based creation and editing',
    supportsNegativePrompt: false,
    supportsBatchGeneration: true,
    aspectRatios: ['1:1', '16:9', '9:16', '3:2', '2:3']
  },
  'flux-kontext-pro': {
    id: 'flux-kontext-pro',
    name: 'Flux 1 Kontext Pro',
    description: 'Professional style control via reference images',
    supportsNegativePrompt: true,
    supportsBatchGeneration: true,
    aspectRatios: ['1:1', '16:9', '9:16', '3:2', '2:3', '4:3', '3:4', '4:5', '5:4', '21:9']
  },
  'seedream-4': {
    id: 'seedream-4',
    name: 'Seedream 4',
    description: 'Multi-shot sequences with stable physics',
    supportsNegativePrompt: true,
    supportsBatchGeneration: true,
    aspectRatios: ['1:1', '16:9', '9:16', '3:2', '2:3', '4:3', '3:4', '4:5', '5:4']
  },
  'nano-banana': {
    id: 'nano-banana',
    name: 'Nano Banana (Google)',
    description: 'High-speed iterations, 4 simultaneous generations',
    supportsNegativePrompt: true,
    supportsBatchGeneration: true,
    aspectRatios: ['1:1', '16:9', '9:16', '3:2', '2:3', '4:3', '3:4', '4:5', '5:4', '21:9']
  },
  'wan-2.5': {
    id: 'wan-2.5',
    name: 'Wan 2.5',
    description: 'Strong prompt fidelity with motion awareness',
    supportsNegativePrompt: true,
    supportsBatchGeneration: true,
    aspectRatios: ['1:1', '16:9', '9:16', '3:2', '2:3']
  }
};

export const DEFAULT_MODEL = 'gpt-image-1.5';
