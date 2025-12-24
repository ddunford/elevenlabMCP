# ElevenLabs Image Generation MCP Server

An MCP (Model Context Protocol) server that generates images using ElevenLabs' Image & Video feature via Playwright browser automation.

## Features

- **generate_image** - Generate images from text prompts using ElevenLabs
- **list_models** - List available image generation models
- **get_session_status** - Check authentication status

## Available Models

| Model ID | Name | Description |
|----------|------|-------------|
| `gpt-image-1.5` | GPT Image 1.5 (default) | OpenAI - precise, high-quality generation |
| `gpt-image-1` | GPT Image 1 | OpenAI - text-based creation and editing |
| `flux-kontext-pro` | Flux 1 Kontext Pro | Professional style control via reference images |
| `seedream-4` | Seedream 4 | Multi-shot sequences with stable physics |
| `nano-banana` | Nano Banana (Google) | High-speed iterations |
| `wan-2.5` | Wan 2.5 | Strong prompt fidelity |

## Installation

```bash
# Clone the repository
git clone git@github.com:ddunford/elevenlabMCP.git
cd elevenlabMCP

# Install dependencies
npm install

# Build
npm run build

# Install Playwright browser
npx playwright install chromium
```

## Quick Setup (One-Liner)

Add to Claude Code globally:

```bash
claude mcp add elevenlabs-image -s user -- node /path/to/elevenlabMCP/dist/index.js
```

Or manually add to `~/.claude.json`:

```json
{
  "mcpServers": {
    "elevenlabs-image": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/elevenlabMCP/dist/index.js"],
      "env": {}
    }
  }
}
```

## Usage

### In Claude Code

After adding the MCP server, restart Claude Code. The tools will be available as:

- `mcp__elevenlabs-image__generate_image`
- `mcp__elevenlabs-image__list_models`
- `mcp__elevenlabs-image__get_session_status`

### generate_image

Generate an image from a text prompt.

**Parameters:**
| Parameter | Required | Description |
|-----------|----------|-------------|
| `prompt` | Yes | Text description of the image to generate |
| `model` | No | Model ID (default: `gpt-image-1.5`) |
| `savePath` | No | Directory to save image (default: `assets/`) |
| `aspectRatio` | No | e.g., "1:1", "16:9", "9:16" |
| `negativePrompt` | No | What to avoid in the image |
| `email` | No | ElevenLabs account email (for first-time auth) |
| `password` | No | ElevenLabs account password (for first-time auth) |

**Example:**
```
Generate an image of a cyberpunk city at night with neon lights
```

### list_models

Returns all available image generation models with their capabilities.

### get_session_status

Check if currently logged in to ElevenLabs.

## Authentication

On first use, provide your ElevenLabs credentials via the `email` and `password` parameters. The session is persisted in `.auth/` so subsequent calls don't require credentials.

## How It Works

1. Uses Playwright to automate the ElevenLabs web interface (no API available for image generation)
2. Maintains a persistent browser session for authentication
3. Navigates to the Image & Video page
4. Enters prompts and generates images
5. Downloads generated images from the History page

## Project Structure

```
elevenlabMCP/
├── src/
│   ├── index.ts              # Entry point
│   ├── server.ts             # MCP server setup
│   ├── tools/                # MCP tool implementations
│   ├── browser/              # Playwright automation
│   ├── auth/                 # Authentication handling
│   └── config/               # Configuration
├── dist/                     # Compiled JavaScript
├── assets/                   # Generated images output
└── .auth/                    # Session storage (gitignored)
```

## Environment Variables (Optional)

Create a `.env` file:

```env
ELEVENLABS_EMAIL=your@email.com
ELEVENLABS_PASSWORD=yourpassword
HEADLESS=true  # Set to false for debugging
```

## Notes

- Image generation typically takes 30-60 seconds
- Generated images are saved as WebP files
- The browser runs headless by default; set `HEADLESS=false` to see the browser

## License

MIT
