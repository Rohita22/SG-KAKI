import express from 'express';
import cors from 'cors';
import { env } from './env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(cors({ origin: env.allowedOrigins }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api', apiRouter);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`[server] listening on http://localhost:${env.port}`);
  if (!env.groqApiKey) {
    console.warn('[server] GROQ_API_KEY is not set — /api/ai-practice will return 503 until it is.');
  }
});
