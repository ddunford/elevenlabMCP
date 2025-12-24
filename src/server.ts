import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

import { generateImageDefinition, generateImage, generateImageSchema } from './tools/generateImage.js';
import { listModelsDefinition, listModels } from './tools/listModels.js';
import { getSessionStatusDefinition, getSessionStatus } from './tools/getSessionStatus.js';
import { BrowserManager } from './browser/BrowserManager.js';

export function createServer(): Server {
  const server = new Server(
    {
      name: 'elevenlabs-image-mcp',
      version: '1.0.0'
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );

  // Register tool listing handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        generateImageDefinition,
        listModelsDefinition,
        getSessionStatusDefinition
      ]
    };
  });

  // Register tool call handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    console.error(`[MCP Server] Tool called: ${name}`);

    try {
      switch (name) {
        case 'generate_image': {
          const parsed = generateImageSchema.parse(args);
          const result = await generateImage(parsed);
          return {
            content: [{ type: 'text', text: result }]
          };
        }

        case 'list_models': {
          const result = await listModels();
          return {
            content: [{ type: 'text', text: result }]
          };
        }

        case 'get_session_status': {
          const result = await getSessionStatus();
          return {
            content: [{ type: 'text', text: result }]
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[MCP Server] Tool error:`, error);
      return {
        content: [{ type: 'text', text: JSON.stringify({ error: errorMessage }) }],
        isError: true
      };
    }
  });

  return server;
}

export async function startServer(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();

  // Handle graceful shutdown
  const shutdown = async () => {
    console.error('[MCP Server] Shutting down...');
    await BrowserManager.getInstance().close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  await server.connect(transport);
  console.error('[MCP Server] ElevenLabs Image MCP Server running on stdio');
}
