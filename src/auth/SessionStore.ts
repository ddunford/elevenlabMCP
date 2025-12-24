import fs from 'fs';
import path from 'path';
import { DEFAULTS } from '../config/defaults.js';
import type { SessionData } from '../types/index.js';

export class SessionStore {
  private sessionPath: string;
  private metadataPath: string;

  constructor() {
    this.sessionPath = DEFAULTS.SESSION_PATH;
    this.metadataPath = this.sessionPath.replace('.json', '-metadata.json');
  }

  async save(data: SessionData): Promise<void> {
    const dir = path.dirname(this.sessionPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(this.metadataPath, JSON.stringify(data, null, 2));
  }

  async load(): Promise<SessionData | null> {
    if (!fs.existsSync(this.metadataPath)) {
      return null;
    }

    try {
      const data = fs.readFileSync(this.metadataPath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async hasValidSession(): Promise<boolean> {
    const data = await this.load();
    if (!data || !data.isValid) {
      return false;
    }

    // Check if Playwright storage state exists
    return fs.existsSync(this.sessionPath);
  }

  async clear(): Promise<void> {
    if (fs.existsSync(this.sessionPath)) {
      fs.unlinkSync(this.sessionPath);
    }
    if (fs.existsSync(this.metadataPath)) {
      fs.unlinkSync(this.metadataPath);
    }
  }
}
