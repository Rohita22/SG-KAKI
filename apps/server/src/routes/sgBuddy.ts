import { Router } from 'express';
import { groqChat, GroqNotConfiguredError, type GroqChatMessage } from '../integrations/groq.js';

export const sgBuddyRouter = Router();

interface SgBuddyContext {
  missionTitle?: string;
  lessonTitle?: string;
  phraseWord?: string;
  cultureTopicTitle?: string;
  masteryLabel?: string;
  /** Where the learner is standing and what they are trying to do, for scenes
   * where the answer depends on the spot rather than on a lesson. */
  situation?: string;
}

interface AskRequestBody {
  context?: SgBuddyContext;
  question?: string;
}

sgBuddyRouter.post('/ask', async (req, res) => {
  const body = (req.body && typeof req.body === 'object' && !Array.isArray(req.body)
    ? req.body
    : {}) as AskRequestBody;
  const { context, question } = body;

  if (!question || typeof question !== 'string' || question.length > 2_000) {
    res.status(400).json({ error: 'question is required' });
    return;
  }

  if (
    context &&
    Object.values(context).some(
      (value) => value !== undefined && (typeof value !== 'string' || value.length > 500),
    )
  ) {
    res.status(400).json({ error: 'Invalid context.' });
    return;
  }

  const contextLine = context
    ? [
        context.missionTitle && context.lessonTitle
          ? `The learner is on "${context.missionTitle}" → "${context.lessonTitle}".`
          : '',
        // First-person and present-tense on purpose: this is someone standing
        // somewhere real and stuck, not someone reading a lesson. Answering
        // "which platform" generically is useless — the answer depends entirely
        // on the spot they are in.
        context.situation
          ? `Right now: ${context.situation} Answer for that exact spot — tell them concretely what to do next and what to look for, not general advice.`
          : '',
        context.phraseWord ? `They're asking about the phrase "${context.phraseWord}".` : '',
        context.cultureTopicTitle
          ? `They're asking about the culture topic "${context.cultureTopicTitle}".`
          : '',
        context.masteryLabel ? `Their familiarity with it so far: ${context.masteryLabel}.` : '',
      ]
        .filter(Boolean)
        .join(' ')
    : '';

  const systemPrompt = [
    'You are SG Buddy, a friendly, knowledgeable local Singaporean answering questions from someone learning Singapore culture and Singlish inside a learning app.',
    'Answer within the exact context given below — be specific to it, not generic.',
    'Reply in 2-4 short, warm sentences. No headings, no bullet lists.',
    contextLine,
  ]
    .filter(Boolean)
    .join(' ');

  const messages: GroqChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: question },
  ];

  try {
    const reply = await groqChat(messages);
    res.json({ reply });
  } catch (err) {
    if (err instanceof GroqNotConfiguredError) {
      res.status(503).json({ error: 'Ask SG Buddy is not configured on the server yet.' });
      return;
    }
    console.error('[sg-buddy] Groq request failed:', err);
    res.status(502).json({ error: 'Failed to reach the AI service.' });
  }
});
