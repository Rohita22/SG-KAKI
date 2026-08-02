import type { ErrorRequestHandler } from 'express';

/** Last-resort handler for anything a route didn't catch itself. */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('[server] unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
};
