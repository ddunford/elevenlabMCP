import { startServer } from './server.js';
import dotenv from 'dotenv';

dotenv.config();

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
