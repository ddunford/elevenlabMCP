import { AuthManager } from '../auth/AuthManager.js';

export const getSessionStatusDefinition = {
  name: 'get_session_status',
  description: 'Check if currently logged in to ElevenLabs and get session information',
  inputSchema: {
    type: 'object' as const,
    properties: {},
    required: []
  }
};

export async function getSessionStatus(): Promise<string> {
  const authManager = new AuthManager();
  const status = await authManager.getSessionStatus();

  return JSON.stringify({
    isLoggedIn: status.isLoggedIn,
    email: status.email || null,
    lastChecked: status.lastChecked,
    message: status.isLoggedIn
      ? 'Session is active and valid'
      : 'Not logged in. Please provide credentials to authenticate.'
  }, null, 2);
}
