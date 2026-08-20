import type { RequestHandler } from 'express';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/** Small in-memory limiter for the unauthenticated AI endpoints. */
export function createRateLimiter(
  maxRequests = 30,
  windowMs = 60_000,
): RequestHandler {
  const entries = new Map<string, RateLimitEntry>();

  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    let entry = entries.get(key);

    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      entries.set(key, entry);
    }

    entry.count += 1;
    const remaining = Math.max(0, maxRequests - entry.count);
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000));

    if (entry.count > maxRequests) {
      res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
      res.status(429).json({ error: 'Too many requests. Please try again later.' });
      return;
    }

    // Bound memory if an attacker sends requests with many different addresses.
    if (entries.size > 10_000) {
      for (const [address, current] of entries) {
        if (current.resetAt <= now) entries.delete(address);
      }
    }

    next();
  };
}
