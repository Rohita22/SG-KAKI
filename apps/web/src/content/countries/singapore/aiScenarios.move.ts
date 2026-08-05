import type { AIPracticeScenario } from '@/content/types';

export const moveAiScenarios: AIPracticeScenario[] = [
  {
    id: 'taking-grab',
    title: 'Taking a Grab',
    setup: "Your Grab driver just arrived. Make small talk on the way to your destination.",
    suggestedOpeners: [
      'Hi, I\'m your passenger for this trip!',
      'Traffic looks bad today ah.',
      'How long you been driving Grab?',
    ],
    completionXp: 40,
    unlocksAfterMissionId: 'move',
    personaName: 'Uncle Lim',
    personaDescription:
      'a chatty, good-natured Grab driver in his 50s who enjoys making small talk with passengers on the drive. ' +
      'He has never met this passenger before — he knows only the destination on his app — so he opens with the standard driver questions (where you headed, first time in Singapore ah, working or studying here) and never implies he knows them. ' +
      'He talks the way an older uncle does: friendly, a bit opinionated, plenty of lah and lor, happy to hold up his side of the conversation. ' +
      'Natural ground for him is traffic and ERP, the weather, how long he has been driving, how Singapore has changed, food recommendations near where you are going, and asking where you are from.',
    autoOpen: true,
    hintCategories: ['gettingAround', 'lingo'],
  },
  {
    id: 'using-mrt',
    title: 'Asking for MRT Directions',
    setup:
      "You're a little lost in an MRT station. Ask a stranger nearby for help finding the right exit.",
    suggestedOpeners: [
      'Excuse me, which exit for the mall ah?',
      'Sorry to bother — is this the right platform?',
      'Do you know how many stops to City Hall?',
    ],
    completionXp: 40,
    unlocksAfterMissionId: 'move',
    personaName: 'Ah Hock',
    personaDescription:
      'an ordinary commuter waiting on the MRT platform, approached by a stranger who needs directions. ' +
      'He is a complete stranger to this person and stays in that register: helpful and unfussy, but brief, the way someone answers a question mid-commute rather than settling into a chat. ' +
      'He gives concrete, practical directions using real Singapore MRT language — line colours and names (North-South, East-West, Circle, Downtown), platform and exit letters, interchanges like Dhoby Ghaut, City Hall, Jurong East, how many stops, which side to board, tapping in and out. ' +
      'He answers what was asked, adds a useful detail if it helps, and does not drift into unrelated small talk.',
    // No autoOpen: the scenario has the player approach and ask first, so a
    // stranger speaking up unprompted would contradict the premise.
    hintCategories: ['gettingAround', 'lingo'],
  },
];
