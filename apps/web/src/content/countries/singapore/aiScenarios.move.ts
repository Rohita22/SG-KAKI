import type { AIPracticeScenario } from '@/content/types';

/**
 * Quest 4 is a journey, not a conversation: the player finds their own way from
 * Kadaloor to the TCS office at Changi Business Park, on a clock, and can get
 * it wrong. Everything about how that plays lives in the scene component
 * (components/practice/scene4) — the route graph, the timings, the failure
 * rules. What stays here is only what the AI needs.
 *
 * There is deliberately no `autoOpen` and no single persona. The journey meets
 * three different people at three different moments, and each of those beats
 * brings its own persona through `AIPracticeBeat`; the fields below are only
 * the fallback for anything that doesn't.
 */
export const moveAiScenarios: AIPracticeScenario[] = [
  {
    id: 'commute-to-changi',
    title: 'Getting to the Office',
    setup:
      'First morning on the job. Get yourself from Kadaloor to the TCS office at Changi Business Park — bus 50 to Punggol, ' +
      'the North East Line to Little India, the Downtown Line out to Expo, and the last stretch on foot. ' +
      'Read the signs, pick the right platform, and get off at the right stop. The clock is running.',
    skills: [
      'Reading bus and MRT signage',
      'Choosing the right line and direction',
      'Transferring between lines',
      'Asking for help when you are lost',
    ],
    suggestedOpeners: [
      'Excuse me, does this bus go to Punggol Interchange?',
      'Which line do I take to get to Expo?',
      'Sorry, is this the right platform for Changi Business Park?',
    ],
    completionXp: 40,
    unlocksAfterMissionId: 'move',
    personaName: 'a fellow commuter',
    personaDescription:
      'a Singaporean commuter on their own way to work, happy to point a newcomer in the right direction but in a bit of a hurry. ' +
      'They speak the way people actually do on public transport: short, practical, a bit of lah and lor, no lectures.',
    hintCategories: ['gettingAround', 'lingo'],
  },
];
