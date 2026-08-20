import express from 'express';
import cors from 'cors';
import { env } from './env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { createRateLimiter } from './middleware/rateLimit.js';

const app = express();

app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});
app.use(cors({ origin: env.allowedOrigins }));
app.use('/api', createRateLimiter());
app.use(express.json({ limit: '32kb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api', apiRouter);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`[server] listening on http://localhost:${env.port}`);
  if (!env.groqApiKey) {
    console.warn('[server] GROQ_API_KEY is not set — AI routes will return 503 until it is.');
  }
});
