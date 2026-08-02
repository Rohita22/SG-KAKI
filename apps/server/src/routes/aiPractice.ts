import { Router } from 'express';
import {
  groqChat,
  groqStructuredChat,
  GroqNotConfiguredError,
  type GroqChatMessage,
} from '../integrations/groq.js';

export const aiPracticeRouter = Router();

interface HistoryMessage {
  role: 'user' | 'ai';
  text: string;
}

interface PersonaContext {
  context?: string;
  personaName?: string;
  personaDescription?: string;
  schoolName?: string;
  className?: string;
  teacherName?: string;
}

interface MessageRequestBody extends PersonaContext {
  history?: HistoryMessage[];
  message?: string;
  /** If true, no `message` is required — the AI opens the conversation instead of replying to one. */
  opening?: boolean;
  /** If true, the AI also judges whether this is a natural point to wind the conversation down. */
  detectEnding?: boolean;
  /** Singlish terms the learner has already unlocked, in learning order. */
  unlockedWords?: string[];
}

/** Builds the vocabulary constraint shared by /message and /suggestions: use
 * only what the learner has already been taught, and don't overload it in. */
function buildVocabularyRule(unlockedWords: string[] | undefined): string {
  if (!unlockedWords || unlockedWords.length === 0) {
    return "The learner hasn't unlocked any Singlish terms yet — speak in plain, clear English only, with no Singlish particles or slang for now.";
  }
  return (
    `The learner has only unlocked these Singlish terms so far, in this order: ${unlockedWords.join(', ')}. ` +
    'Weave in ONE of these naturally every so often when it genuinely fits — not in every single line, that would feel forced. ' +
    "Never use any Singlish term or particle that isn't in that list, even common ones — the learner hasn't been taught them yet and it would confuse them."
  );
}

function buildSystemPrompt(
  body: PersonaContext & { opening?: boolean; unlockedWords?: string[] },
): string {
  const {
    context,
    personaName,
    personaDescription,
    schoolName,
    className,
    teacherName,
    opening,
    unlockedWords,
  } = body;

  return [
    personaName
      ? `You are role-playing as ${personaName}, ${personaDescription ?? 'a friendly young Singaporean'}, helping someone new to the country practice a casual conversation.`
      : 'You are role-playing as a friendly young Singaporean helping someone new to the country practice a casual conversation.',
    schoolName ? `You both attend ${schoolName}${className ? `, in ${className}` : ''}.` : '',
    teacherName
      ? `Your teacher is ${teacherName} — refer to her by name if the conversation naturally calls for it, but don't force it in.`
      : '',
    'Reply in 1-2 short, natural sentences, in character, and never break character or mention that you are an AI.',
    buildVocabularyRule(unlockedWords),
    context ? `Scenario: ${context}` : '',
    opening
      ? 'This is the very start of the conversation — send the first message yourself: a short, natural, friendly greeting in character. Do not wait for the other person to speak first.'
      : '',
  ]
    .filter(Boolean)
    .join(' ');
}

/** Smaller instruction-tuned models sometimes wrap a reply in literal quote
 * marks ("Hey, how's it going?") as if narrating dialogue — strip one
 * matching pair so it reads like something a person actually typed. */
function stripWrappingQuotes(text: string): string {
  const trimmed = text.trim();
  const pairs: [string, string][] = [
    ['"', '"'],
    ['“', '”'],
    ["'", "'"],
  ];
  for (const [open, close] of pairs) {
    if (trimmed.length > 1 && trimmed.startsWith(open) && trimmed.endsWith(close)) {
      return trimmed.slice(open.length, -close.length).trim();
    }
  }
  return trimmed;
}

/** Pulls the first JSON object/array out of a model reply, tolerating stray prose or code fences. */
function extractJson<T>(raw: string, isValid: (value: unknown) => value is T): T | undefined {
  const match = raw.match(/[[{][\s\S]*[\]}]/);
  if (!match) return undefined;
  try {
    const parsed = JSON.parse(match[0]) as unknown;
    return isValid(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

interface ReplyWithEnding {
  reply: string;
  endConversation: boolean;
}

function isReplyWithEnding(value: unknown): value is ReplyWithEnding {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as ReplyWithEnding).reply === 'string' &&
    typeof (value as ReplyWithEnding).endConversation === 'boolean'
  );
}

aiPracticeRouter.post('/message', async (req, res) => {
  const body = req.body as MessageRequestBody;
  const { history, message, opening, detectEnding } = body;

  if (!opening && (!message || typeof message !== 'string')) {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  const askForEndingSignal = Boolean(detectEnding && !opening);

  const systemPrompt = [
    buildSystemPrompt(body),
    askForEndingSignal
      ? 'After giving your reply, also judge whether this feels like a natural point for the conversation to wind down — the small talk has run its course, there\'s a natural lull, or you\'ve both said enough for now. Don\'t rush it; most turns should NOT end the conversation. Respond with ONLY a JSON object of the exact shape {"reply": "<your in-character reply>", "endConversation": true or false} and nothing else — no markdown, no extra text.'
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  const messages: GroqChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...(history ?? []).map((m) => ({
      role: (m.role === 'user' ? 'user' : 'assistant') as GroqChatMessage['role'],
      content: m.text,
    })),
    { role: 'user', content: opening ? '(The scene begins. Greet them now.)' : (message as string) },
  ];

  try {
    const raw = await groqChat(messages);

    if (!askForEndingSignal) {
      res.json({ reply: stripWrappingQuotes(raw), endConversation: false });
      return;
    }

    const parsed = extractJson(raw, isReplyWithEnding);
    res.json(
      parsed
        ? { ...parsed, reply: stripWrappingQuotes(parsed.reply) }
        : { reply: stripWrappingQuotes(raw), endConversation: false },
    );
  } catch (err) {
    if (err instanceof GroqNotConfiguredError) {
      res.status(503).json({ error: 'AI Practice is not configured on the server yet.' });
      return;
    }
    console.error('[ai-practice] Groq request failed:', err);
    res.status(502).json({ error: 'Failed to reach the AI service.' });
  }
});

interface SuggestionsRequestBody extends PersonaContext {
  history?: HistoryMessage[];
  /** Singlish terms the learner has already unlocked — weave one in where natural. */
  unlockedWords?: string[];
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

aiPracticeRouter.post('/suggestions', async (req, res) => {
  const body = req.body as SuggestionsRequestBody;
  const { history, unlockedWords } = body;

  const systemPrompt = [
    buildSystemPrompt(body),
    "Now switch roles: instead of replying, suggest what the OTHER person (the learner you're talking to) could say next.",
    'Give exactly 3 reply options, each a complete, natural sentence a real person would actually type (roughly 5-15 words) — never a clipped fragment or a phrase that trails off. Each should take a distinct angle (e.g. one answers directly, one asks a follow-up question, one jokes or deflects) so they feel genuinely different from each other, not three rewordings of the same idea.',
    unlockedWords && unlockedWords.length > 0
      ? `Exactly one of the 3 options should naturally work in one of these Singlish terms the learner already knows: ${unlockedWords.join(', ')}. The other two should be plain English, no Singlish. Never use a Singlish term outside that list.`
      : 'The learner hasn\'t unlocked any Singlish terms yet, so write all 3 options in plain English only, no Singlish.',
    'Respond with ONLY a JSON array of exactly 3 strings — no other text, no markdown.',
  ]
    .filter(Boolean)
    .join(' ');

  const messages: GroqChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...(history ?? []).map((m) => ({
      role: (m.role === 'user' ? 'user' : 'assistant') as GroqChatMessage['role'],
      content: m.text,
    })),
  ];

  try {
    const raw = await groqStructuredChat(messages);
    const suggestions = extractJson(raw, isStringArray) ?? [];
    res.json({ suggestions: suggestions.slice(0, 3).map(stripWrappingQuotes) });
  } catch (err) {
    if (err instanceof GroqNotConfiguredError) {
      res.status(503).json({ error: 'AI Practice is not configured on the server yet.' });
      return;
    }
    console.error('[ai-practice] Groq suggestions request failed:', err);
    res.status(502).json({ error: 'Failed to reach the AI service.' });
  }
});
