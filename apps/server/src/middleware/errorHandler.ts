import type { ErrorRequestHandler } from 'express';

/** Last-resort handler for anything a route didn't catch itself. */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err && typeof err === 'object' && 'type' in err && err.type === 'entity.too.large') {
    res.status(413).json({ error: 'Request body is too large.' });
    return;
  }
  console.error('[server] unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
};
