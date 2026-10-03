import type { Request, Response } from 'express';
import express from 'express';
import { apiRouter } from '../server/api.ts';

const app = express();
app.use(express.json({ limit: '15mb' }));
app.use('/api', apiRouter);

export default function handler(req: Request, res: Response) {
  return app(req, res);
}
