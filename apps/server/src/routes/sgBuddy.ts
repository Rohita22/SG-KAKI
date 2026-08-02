import { Router } from 'express';
import { groqChat, GroqNotConfiguredError, type GroqChatMessage } from '../integrations/groq.js';

export const sgBuddyRouter = Router();

interface SgBuddyContext {
  missionTitle?: string;
  lessonTitle?: string;
  phraseWord?: string;
  cultureTopicTitle?: string;
  masteryLabel?: string;
}

interface AskRequestBody {
  context?: SgBuddyContext;
  question?: string;
}

sgBuddyRouter.post('/ask', async (req, res) => {
  const { context, question } = req.body as AskRequestBody;

  if (!question || typeof question !== 'string') {
    res.status(400).json({ error: 'question is required' });
    return;
  }

  const contextLine = context
    ? [
        context.missionTitle && context.lessonTitle
          ? `The learner is on "${context.missionTitle}" → "${context.lessonTitle}".`
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
