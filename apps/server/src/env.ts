import 'dotenv/config';

function splitList(value: string | undefined, fallback: string[]): string[] {
  if (!value) return fallback;
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Central place for server configuration. Per-integration secrets (like
 * groqApiKey) are intentionally optional here — a missing key should make
 * that one route respond 503, not crash the whole server or block unrelated
 * integrations from working.
 */
export const env = {
  port: Number(process.env.PORT ?? 8080),
  allowedOrigins: splitList(process.env.ALLOWED_ORIGINS, ['http://localhost:5183']),
  groqApiKey: process.env.GROQ_API_KEY,
  /** Groq tracks rate limits per-model — override here to switch models
   * (e.g. if the default's daily quota is exhausted) without a code change. */
  groqModel: process.env.GROQ_MODEL,
  /** Model used for calls that need reliable JSON output (currently just
   * suggestions) — see groqStructuredChat in integrations/groq.ts. */
  groqStructuredModel: process.env.GROQ_STRUCTURED_MODEL,
};
