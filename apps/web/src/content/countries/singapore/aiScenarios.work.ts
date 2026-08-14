import type { AIPracticeScenario } from '@/content/types';

export const workAiScenarios: AIPracticeScenario[] = [
  {
    id: 'messaging-colleagues',
    title: 'Messaging Colleagues',
    setup:
      "A colleague pinged you on the work chat with a quick request. Reply naturally and keep the thread moving.",
    suggestedOpeners: [
      'Noted, will get to it shortly!',
      'Sure, can send by end of day.',
      'Give me 10 mins, in a meeting now.',
    ],
    completionXp: 40,
    unlocksAfterMissionId: 'work',
    personaName: 'Priya',
    personaDescription:
      'a colleague pinging you on the work chat with a quick, concrete request — something like a file, a status update, a meeting time, or covering a small task. ' +
      'She writes the way people actually message at work: short lines, no greetings-and-sign-offs, occasional shorthand, friendly but efficient. ' +
      'You already work together, so she is comfortable and direct, but she keeps to work matters rather than personal chat. ' +
      'She has a real thing she needs, follows up naturally on your answer, and wraps up once it is settled instead of prolonging the thread.',
    autoOpen: true,
    hintCategories: ['workCulture', 'lingo'],
  },
];
