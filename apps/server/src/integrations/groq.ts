import { env } from '../env.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-20b';
const DEFAULT_STRUCTURED_MODEL = 'openai/gpt-oss-20b';

export class GroqNotConfiguredError extends Error {
  constructor() {
    super('GROQ_API_KEY is not set on the server.');
    this.name = 'GroqNotConfiguredError';
  }
}

const REPLY_COMPLETION_TOKENS = 400;
const SUGGESTION_COMPLETION_TOKENS = 250;

export type GroqChatRole = 'system' | 'user' | 'assistant';

export interface GroqChatMessage {
  role: GroqChatRole;
  content: string;
}

function isReasoningModel(model: string): boolean {
  return model.includes('gpt-oss') || model.includes('qwen');
}

/** GPT OSS sometimes answers with a Harmony tool-call envelope instead of plain
 * content — {"name":"assistant","arguments":{"role":"assistant","content":"…"}} —
 * which then reaches the player as raw JSON in a speech bubble. It shows up both
 * in normal responses and in `failed_generation` on a 400, so unwrap it here, at
 * the one point every caller goes through, rather than in each route.
 *
 * Deliberately narrow: a legitimate `{"reply":…,"endConversation":…}` answer has
 * no `arguments`/`role` wrapper, so it passes through untouched for the route to
 * parse as it always did. */
export function unwrapHarmonyEnvelope(text: string): string {
  const trimmed = text.trim();
  if (!trimmed.startsWith('{')) return trimmed;

  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    const rawArgs = parsed.arguments ?? parsed.parameters;
    const args = (typeof rawArgs === 'string' ? JSON.parse(rawArgs) : rawArgs) as
      | Record<string, unknown>
      | undefined;

    const inner = args ?? (typeof parsed.role === 'string' ? parsed : undefined);
    for (const key of ['content', 'response', 'reply', 'text']) {
      const value = inner?.[key];
      if (typeof value === 'string' && value.trim()) return value.trim();
    }
  } catch {
    // Not JSON after all — the original text is the answer.
  }
  return trimmed;
}

async function callGroq(
  messages: GroqChatMessage[],
  model: string,
  structured = false,
  maxCompletionTokens = REPLY_COMPLETION_TOKENS,
): Promise<string> {
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
      max_completion_tokens: maxCompletionTokens,
      ...(isReasoningModel(model) ? { reasoning_effort: 'low' } : {}),
      ...(structured ? { response_format: { type: 'json_object' } } : {}),
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    try {
      const errorBody = JSON.parse(errText) as {
        error?: { code?: string; failed_generation?: string };
      };
      const failedGeneration = errorBody.error?.failed_generation;
      if (errorBody.error?.code === 'tool_use_failed' && failedGeneration) {
        return unwrapHarmonyEnvelope(failedGeneration);
      }
    } catch {
      // Keep the original API error when the response body is not JSON.
    }
    throw new Error(`Groq API error (${response.status}): ${errText}`);
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const reply = data.choices?.[0]?.message?.content;
  if (typeof reply !== 'string') {
    throw new Error('Unexpected Groq API response shape.');
  }
  return unwrapHarmonyEnvelope(reply);
}

export function groqChat(messages: GroqChatMessage[]): Promise<string> {
  return callGroq(messages, env.groqModel ?? DEFAULT_GROQ_MODEL);
}

export function groqSuggestions(messages: GroqChatMessage[]): Promise<string> {
  return callGroq(
    messages,
    env.groqModel ?? DEFAULT_GROQ_MODEL,
    false,
    SUGGESTION_COMPLETION_TOKENS,
  );
}

export function groqStructuredChat(messages: GroqChatMessage[]): Promise<string> {
  return callGroq(
    messages,
    env.groqStructuredModel ?? DEFAULT_STRUCTURED_MODEL,
    true,
  );
}
