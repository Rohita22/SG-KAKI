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
    `The learner has been taught these Singlish terms so far: ${unlockedWords.join(', ')}. ` +
    'The MAIN PURPOSE of this conversation is for the learner to practice these specific words. ' +
    'You should actively create opportunities for them to use these words by asking relevant questions, and strongly encourage or validate them when they do use them successfully! ' +
    // Previously this banned every unlisted term outright, which stripped the
    // personas of the sentence-final particles that make them sound Singaporean
    // at all. The distinction that matters is between particles a learner can
    // absorb from context and vocabulary they would have to look up.
    'You may also use the common sentence-final particles (lah, leh, lor, ah, hor, meh, sia) where they fit your character, since these carry tone rather than meaning and are understandable from context. ' +
    "Avoid Singlish nouns, verbs or idioms outside the taught list, though — those carry meaning the learner hasn't been given yet. If your character would naturally use one, either say it and immediately make the meaning obvious from context, or use the plain English equivalent instead."
  );
}

function buildSystemPrompt(
  body: PersonaContext & { opening?: boolean; unlockedWords?: string[] },
  /** True when `opening` is really "advance into a new beat of an ongoing
   * conversation" (a staged scenario opening its 2nd+ stage) rather than
   * the true first message — e.g. `history` was non-empty on an `opening`
   * request. Without this, every stage-open reused the same "this is the
   * very start, send a greeting" instruction, so persona lines for later
   * stages routinely re-greeted the learner mid-conversation instead of
   * continuing it. */
  isContinuation = false,
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
    // Deliberately describes the role only, not the learner. Framing this as
    // "helping someone new to the country" made every persona play the warm
    // helper who already knows the player — a stall holder greeting a stranger
    // like a regular. The persona's own description sets the relationship.
    personaName
      ? `You are role-playing as ${personaName}, ${personaDescription ?? 'a friendly young Singaporean'}. Stay entirely in that role.`
      : 'You are role-playing as a friendly young Singaporean. Stay entirely in that role.',
    schoolName ? `You both attend ${schoolName}${className ? `, in ${className}` : ''}.` : '',
    teacherName
      ? `Your teacher is ${teacherName} — refer to her by name if the conversation naturally calls for it, but don't force it in.`
      : '',
    // Scenario before the style rules: the model anchors much better on what
    // this exchange is *for* when it reads the situation first.
    context ? `The situation: ${context}` : '',
    'Reply in 1-2 short, natural sentences, in character, and never break character or mention that you are an AI.',
    'Respond to what the other person actually said rather than giving a generic line, and keep the exchange moving toward whatever this situation is about — do not stall by asking vague questions or repeating yourself.',
    'Vary how you speak: do not open consecutive messages the same way, and do not restate something you have already said.',
    buildVocabularyRule(unlockedWords),
    opening
      ? isContinuation
        ? 'You are already mid-conversation with this person, and the scene has just moved on to a new moment — treat "The situation" described above as what is happening RIGHT NOW, and it takes priority over whatever you were just discussing, even if that means changing the subject. Do NOT greet them again, say hello, or act like you are seeing them for the first time, and do NOT keep talking about the previous topic. Send the next line yourself: the natural thing your character would say or do right now, given this new situation specifically — not a continuation of the old one.'
        : 'This is the very start of the conversation — send the first message yourself: a short, natural greeting that fits your role and this exact situation. Do not wait for the other person to speak first, and do not greet them as though you already know them unless your role says you do.'
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
  const isContinuation = Boolean(opening && history && history.length > 0);

  const systemPrompt = [
    buildSystemPrompt(body, isContinuation),
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
    {
      role: 'user',
      content: opening
        ? isContinuation
          ? '(The situation has just moved on. Continue the conversation now, in character, without greeting them again.)'
          : '(The scene begins. Greet them now.)'
        : (message as string),
    },
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
    'Give exactly 3 reply options, each a complete, natural sentence a real person would actually type (roughly 5-15 words) — never a clipped fragment or a phrase that trails off.',
    // Without this the model free-associates: generic small talk in a scene
    // that is actually a drink order, and options that ignore what was just
    // said. Anchoring to the scenario's goal and the persona's last line is
    // what makes the three feel like real things to say *here*.
    "Every option must be a direct, sensible response to the persona's most recent message and must move the scenario toward its goal. Read the scenario description above and treat that goal as what the learner is trying to accomplish.",
    'Make the 3 genuinely different from each other — different intentions, not three rewordings of one idea. Fit the angles to the situation rather than a fixed formula: in a transactional exchange (ordering, paying, asking directions) offer things like stating a choice, asking a clarifying question, or requesting a change; in a social chat offer things like answering, asking something back, or reacting with an opinion. Never suggest a joke or a deflection where it would be out of place.',
    'Write them in the learner\'s own voice as a newcomer — polite, natural, and never presuming familiarity the learner does not have with the persona.',
    // Stricter than the persona's own rule on purpose: these are lines the
    // learner is about to say, so they should stretch only as far as what has
    // actually been taught.
    unlockedWords && unlockedWords.length > 0
      ? `Exactly one of the 3 options should naturally work in one of these Singlish terms the learner already knows: ${unlockedWords.join(', ')}. The other two should be plain English. Never put a Singlish word outside that list into the learner's mouth.`
      : "The learner hasn't been taught any Singlish terms yet, so write all 3 options in plain, natural English.",
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
