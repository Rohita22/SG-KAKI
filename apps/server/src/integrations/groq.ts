import { env } from '../env.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
// llama-3.3-70b-versatile's free-tier daily quota is shared/tight; this
// smaller model has its own separate quota on Groq (rate limits are
// per-model) and is plenty capable for short in-character replies, which are
// by far the most frequent call. Override via GROQ_MODEL if needed.
const DEFAULT_GROQ_MODEL = 'llama-3.1-8b-instant';
// The smaller model doesn't reliably follow the "respond with ONLY a JSON
// array" + role-switch instruction the suggestions endpoint needs — it just
// chats normally instead, so we get nothing to parse. That endpoint is much
// lower-frequency than plain replies, so spending the stronger model's
// tighter quota there specifically is a good trade. Override via
// GROQ_STRUCTURED_MODEL if needed.
const DEFAULT_STRUCTURED_MODEL = 'llama-3.3-70b-versatile';

export class GroqNotConfiguredError extends Error {
  constructor() {
    super('GROQ_API_KEY is not set on the server.');
    this.name = 'GroqNotConfiguredError';
  }
}

export type GroqChatRole = 'system' | 'user' | 'assistant';

export interface GroqChatMessage {
  role: GroqChatRole;
  content: string;
}

async function callGroq(messages: GroqChatMessage[], model: string): Promise<string> {
  if (!env.groqApiKey) {
    throw new GroqNotConfiguredError();
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.groqApiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.8,
      max_tokens: 200,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Groq API error (${response.status}): ${errText}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const reply = data.choices?.[0]?.message?.content;
  if (typeof reply !== 'string') {
    throw new Error('Unexpected Groq API response shape.');
  }
  return reply.trim();
}

/** For plain in-character replies — high frequency, doesn't need strict JSON output. */
export function groqChat(messages: GroqChatMessage[]): Promise<string> {
  return callGroq(messages, env.groqModel ?? DEFAULT_GROQ_MODEL);
}

/** For calls that need reliably-parseable structured output (e.g. a JSON
 * array/object) — lower frequency, worth spending the stronger model on. */
export function groqStructuredChat(messages: GroqChatMessage[]): Promise<string> {
  return callGroq(messages, env.groqStructuredModel ?? DEFAULT_STRUCTURED_MODEL);
}
