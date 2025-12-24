import { IMAGE_MODELS, DEFAULT_MODEL } from '../config/models.js';

export const listModelsDefinition = {
  name: 'list_models',
  description: 'List all available image generation models on ElevenLabs',
  inputSchema: {
    type: 'object' as const,
    properties: {},
    required: []
  }
};

export async function listModels(): Promise<string> {
  const models = Object.values(IMAGE_MODELS).map(model => ({
    id: model.id,
    name: model.name,
    description: model.description,
    isDefault: model.id === DEFAULT_MODEL,
    aspectRatios: model.aspectRatios,
    supportsNegativePrompt: model.supportsNegativePrompt
  }));

  return JSON.stringify({
    models,
    defaultModel: DEFAULT_MODEL
  }, null, 2);
}
