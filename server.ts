/**
 * Maha Sell Fullstack Production Server
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { apiRouter } from './server/api.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Mount API routes
app.use('/api', apiRouter);

// Serve static assets from built Vite bundle
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback all SPA routing to index.html
app.get('*', (_req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Maha Sell AI Support Server running on port ${PORT}`);
});
