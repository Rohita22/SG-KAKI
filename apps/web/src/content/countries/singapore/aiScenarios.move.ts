import type { AIPracticeScenario } from '@/content/types';

export const moveAiScenarios: AIPracticeScenario[] = [
  {
    id: 'commute-to-changi',
    title: 'Getting to the Office',
    setup:
      'Travel from Kadaloor to the TCS office at Changi Business Park through connected, walkable bus and rail maps.',
    skills: [
      'Reading bus and MRT signage',
      'Choosing the right line and direction',
      'Transferring between lines',
      'Using Singapore fare readers correctly',
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
      'A Singapore commuter who gives short, practical directions when the player asks for help.',
    hintCategories: ['gettingAround', 'lingo'],
  },
];
