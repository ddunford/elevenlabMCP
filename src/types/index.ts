export interface ImageModel {
  id: string;
  name: string;
  description: string;
  supportsNegativePrompt: boolean;
  supportsBatchGeneration: boolean;
  aspectRatios: string[];
}

export interface GenerateImageParams {
  prompt: string;
  model?: string;
  savePath?: string;
  aspectRatio?: string;
  negativePrompt?: string;
}

export interface GenerateImageResult {
  success: boolean;
  imagePath?: string;
  error?: string;
  model: string;
  prompt: string;
}

export interface SessionStatus {
  isLoggedIn: boolean;
  email?: string;
  lastChecked: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SessionData {
  email?: string;
  lastLogin?: string;
  isValid: boolean;
}
