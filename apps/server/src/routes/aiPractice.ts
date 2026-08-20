import { Router } from 'express';
import {
  groqChat,
  groqStructuredChat,
  groqSuggestions,
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
  /** The specific thing that marks THIS exchange as finished, e.g. "you have
   * suggested going to find a table". A staged scene passes its current beat's
   * end condition so the signal tracks that beat instead of a vague lull. */
  endWhen?: string;
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
    // The model kept satisfying the "use the taught words" instruction by
    // appending one after the full stop ("...too long. lah"), which reads as a
    // label rather than speech.
    'Place any Singlish word inside the sentence it belongs to, the way a real speaker would say it — a particle sits at the end of its own sentence, before the punctuation, and is never tacked on afterwards as a word by itself. ' +
    "Avoid Singlish nouns, verbs or idioms outside the taught list, though — those carry meaning the learner hasn't been given yet. If your character would naturally use one, either say it and immediately make the meaning obvious from context, or use the plain English equivalent instead."
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
    // Hard word cap, not just "short": replies are rendered inside speech
    // bubbles over the scene art, and anything longer overflows them.
    'Reply with ONE or TWO short spoken sentences, 30 words maximum, in character. Never write a paragraph, a list, or stage directions, and never break character or mention that you are an AI.',
    'Respond to what the other person actually said rather than giving a generic line, and keep the exchange moving toward whatever this situation is about — do not stall by asking vague questions or repeating yourself.',
    'Vary how you speak: do not open consecutive messages the same way, and do not restate something you have already said.',
    buildVocabularyRule(unlockedWords),
    opening
      ? 'This is the very start of the conversation — send the first message yourself: a short, natural greeting that fits your role and this exact situation. Do not wait for the other person to speak first, and do not greet them as though you already know them unless your role says you do.'
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

/** Replies are rendered inside speech bubbles drawn over the scene art, so a
 * rambling answer overflows the frame. The prompt asks for short lines but the
 * model regularly overshoots it, so cap it here too: keep whole sentences up to
 * the limit, and only fall back to a mid-sentence cut if the very first
 * sentence is already too long. */
const MAX_REPLY_WORDS = 35;
const MAX_HISTORY_MESSAGES = 20;
const MAX_TEXT_LENGTH = 2_000;
// Generous on purpose: this bounds authored scene copy, not user input. A
// staged scene sends its whole beat goal as `context`, and those run well past
// a few hundred characters — a tight cap here 400s every turn of the scene.
const MAX_CONTEXT_LENGTH = 4_000;
const MAX_UNLOCKED_WORDS = 100;

function isBoundedString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.length <= maxLength;
}

export function isValidHistory(value: unknown): value is HistoryMessage[] {
  return (
    value === undefined ||
    (Array.isArray(value) &&
      value.every(
        (message) =>
          typeof message === 'object' &&
          message !== null &&
          ((message as HistoryMessage).role === 'user' ||
            (message as HistoryMessage).role === 'ai') &&
          isBoundedString((message as HistoryMessage).text, MAX_TEXT_LENGTH),
      ))
  );
}

export function isValidPersonaContext(body: PersonaContext): boolean {
  return [
    body.context,
    body.personaName,
    body.personaDescription,
    body.schoolName,
    body.className,
    body.teacherName,
  ].every((value) => value === undefined || isBoundedString(value, MAX_CONTEXT_LENGTH));
}

function isValidUnlockedWords(value: unknown): value is string[] {
  return (
    value === undefined ||
    (Array.isArray(value) &&
      value.length <= MAX_UNLOCKED_WORDS &&
      value.every((word) => isBoundedString(word, 100)))
  );
}

export function capReplyLength(text: string): string {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= MAX_REPLY_WORDS) return text;

  // Sentence-ending punctuation, keeping the punctuation with its sentence.
  const sentences = text.match(/[^.!?…]+[.!?…]+["'”’)]*\s*|[^.!?…]+$/g) ?? [text];
  let kept = '';
  for (const sentence of sentences) {
    const candidate = kept + sentence;
    if (candidate.split(/\s+/).filter(Boolean).length > MAX_REPLY_WORDS) break;
    kept = candidate;
  }

  return kept.trim() || words.slice(0, MAX_REPLY_WORDS).join(' ') + '…';
}

/** Pulls the first JSON object/array out of a model reply, tolerating stray prose,
 * code fences, or a Harmony tool-call envelope that buries the payload under "arguments". */
export function extractJson<T>(raw: string, isValid: (value: unknown) => value is T): T | undefined {
  const match = raw.match(/[[{][\s\S]*[\]}]/);
  if (!match) return undefined;
  try {
    const parsed = JSON.parse(match[0]) as unknown;
    if (isValid(parsed)) return parsed;
    const unwrapped = (parsed as { arguments?: unknown } | null)?.arguments;
    return isValid(unwrapped) ? unwrapped : undefined;
  } catch {
    return undefined;
  }
}

interface ReplyWithEnding {
  reply: string;
  endConversation: boolean;
}

/** `endConversation` is deliberately not required to be a boolean: the model
 * sometimes emits it as the string "true", or leaves it out entirely, and
 * rejecting the whole object over that used to drop the raw `{"reply": ...}`
 * envelope straight into a speech bubble. The reply is the only part that has
 * to be right — a missing ending signal just means "not yet". */
export function isReplyWithEnding(value: unknown): value is ReplyWithEnding {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as ReplyWithEnding).reply === 'string'
  );
}

function endsConversation(value: unknown): boolean {
  return value === true || value === 'true';
}

/** Last resort when the model's JSON can't be parsed at all — a reply cut off
 * at the token limit (`{"reply": "Come, let's go find`) has no closing brace
 * for `extractJson` to match, so the whole envelope used to be rendered as the
 * persona's line. Pulls the reply string out by hand instead. */
export function salvageReply(raw: string): string {
  const match = raw.match(/"reply"\s*:\s*"((?:[^"\\]|\\.)*)/);
  return match ? match[1].replace(/\\(.)/g, '$1').trim() : raw;
}

aiPracticeRouter.post('/message', async (req, res) => {
  const body = (req.body && typeof req.body === 'object' && !Array.isArray(req.body)
    ? req.body
    : {}) as MessageRequestBody;
  const { history, message, opening, detectEnding, endWhen } = body;

  if (
    !isValidHistory(history) ||
    !isValidPersonaContext(body) ||
    !isValidUnlockedWords(body.unlockedWords) ||
    (message !== undefined && !isBoundedString(message, MAX_TEXT_LENGTH)) ||
    (endWhen !== undefined && !isBoundedString(endWhen, MAX_CONTEXT_LENGTH)) ||
    !opening && !message
  ) {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  const askForEndingSignal = Boolean(detectEnding && !opening);

  const systemPrompt = [
    buildSystemPrompt(body),
    // A staged scene knows exactly what "done" looks like for the beat it is
    // running, and says so. The generic lull test below almost never fires,
    // which left players typing "ok" at a beat that had already closed itself.
    askForEndingSignal && endWhen
      ? `After giving your reply, judge whether this exchange has reached its end point. It has reached it once: ${endWhen}. Set endConversation to true on the reply where that happens — including this one, if your own reply is what does it. Respond with ONLY a JSON object of the exact shape {"reply": "<your in-character reply>", "endConversation": true or false} and nothing else — no markdown, no extra text.`
      : askForEndingSignal
      ? 'After giving your reply, also judge whether this feels like a natural point for the conversation to wind down — the small talk has run its course, there\'s a natural lull, or you\'ve both said enough for now. Don\'t rush it; most turns should NOT end the conversation. Respond with ONLY a JSON object of the exact shape {"reply": "<your in-character reply>", "endConversation": true or false} and nothing else — no markdown, no extra text.'
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  const messages: GroqChatMessage[] = [
    { role: 'system', content: systemPrompt },
    // Only the recent turns are worth sending: older ones add tokens without
  // changing the reply, and the raw list grows unbounded as a scene runs.
  ...(history ?? []).slice(-MAX_HISTORY_MESSAGES).map((m) => ({
      role: (m.role === 'user' ? 'user' : 'assistant') as GroqChatMessage['role'],
      content: m.text,
    })),
    {
      role: 'user',
      content: opening ? '(The scene begins. Greet them now.)' : (message as string),
    },
  ];

  try {
    if (!askForEndingSignal) {
      const raw = await groqChat(messages);
      res.json({ reply: capReplyLength(stripWrappingQuotes(raw)), endConversation: false });
      return;
    }

    // The prompt above asks for a JSON object, so ask the API for one too.
    // Plain groqChat leaves the model free to wander outside that shape, and
    // whatever came back was rendered verbatim — which is how a literal
    // `{"reply": "Confirm shiok one! …` ended up in the scene's speech bubble.
    const raw = await groqStructuredChat(messages);
    const parsed = extractJson(raw, isReplyWithEnding);
    res.json({
      reply: capReplyLength(stripWrappingQuotes(parsed ? parsed.reply : salvageReply(raw))),
      endConversation: parsed ? endsConversation(parsed.endConversation) : false,
    });
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

interface SuggestionsResponse {
  suggestions: string[];
}

function isSuggestionsResponse(value: unknown): value is SuggestionsResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    isStringArray((value as SuggestionsResponse).suggestions)
  );
}

interface HarmonySuggestionResponse {
  arguments: {
    response?: string;
    suggestions: string[];
  };
}

function isHarmonySuggestionResponse(value: unknown): value is HarmonySuggestionResponse {
  if (typeof value !== 'object' || value === null) return false;
  const args = (value as HarmonySuggestionResponse).arguments;
  return (
    typeof args === 'object' &&
    args !== null &&
    (typeof args.response === 'string' || isStringArray(args.suggestions))
  );
}

export function parseSuggestions(raw: string): string[] {
  const json = extractJson(raw, isSuggestionsResponse);
  if (json) return json.suggestions;

  const harmony = extractJson(raw, isHarmonySuggestionResponse);
  if (harmony) {
    if (typeof harmony.arguments.response === 'string') {
      return parseSuggestionLines(harmony.arguments.response);
    }
    return harmony.arguments.suggestions;
  }

  return parseSuggestionLines(raw);
}

function parseSuggestionLines(raw: string): string[] {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  // Usually one option per line — but the model sometimes runs all three
  // together ("1. … 2. … 3. …"), which used to reach the UI as a single
  // paragraph-long chip. Split on the markers themselves in that case.
  const parts = lines.length > 1 ? lines : raw.split(/(?=\b\d+[.)]\s)/);

  return parts
    .map((part) => part.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 3);
}

aiPracticeRouter.post('/suggestions', async (req, res) => {
  const body = (req.body && typeof req.body === 'object' && !Array.isArray(req.body)
    ? req.body
    : {}) as SuggestionsRequestBody;
  const { history, unlockedWords } = body;

  if (
    !isValidHistory(history) ||
    !isValidPersonaContext(body) ||
    !isValidUnlockedWords(unlockedWords)
  ) {
    res.status(400).json({ error: 'Invalid request.' });
    return;
  }

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
    'Respond with exactly 3 options on separate lines. Start each line with a number and a period. Do not use JSON, tool calls, markdown fences, or any explanation.',
  ]
    .filter(Boolean)
    .join(' ');

  const messages: GroqChatMessage[] = [
    { role: 'system', content: systemPrompt },
    // Only the recent turns are worth sending: older ones add tokens without
  // changing the reply, and the raw list grows unbounded as a scene runs.
  ...(history ?? []).slice(-MAX_HISTORY_MESSAGES).map((m) => ({
      role: (m.role === 'user' ? 'user' : 'assistant') as GroqChatMessage['role'],
      content: m.text,
    })),
  ];

  try {
    const raw = await groqSuggestions(messages);
    const suggestions = parseSuggestions(raw);
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
