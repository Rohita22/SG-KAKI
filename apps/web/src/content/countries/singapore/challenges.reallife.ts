import type { Challenge } from '@/content/types';

export const reallifeChallenges: Challenge[] = [
  {
    id: 'reallife-l1-c1',
    lessonId: 'reallife-l1',
    type: 'multiple-choice',
    category: 'gettingAround',
    scene: 'escalator',
    context: "You're navigating the MRT during your morning commute.",
    prompt: "You step onto the escalator. What's the move?",
    options: [
      { id: 'a', label: 'Stand on the left' },
      { id: 'b', label: 'Stand on the right' },
      { id: 'c', label: 'Stand in the middle' },
    ],
    correctOptionId: 'a',
    explanation:
      'Still true under pressure: stand left, leave the right lane clear for walkers.',
    xp: 15,
    difficulty: 2,
  },
  {
    id: 'reallife-l1-c2',
    lessonId: 'reallife-l1',
    type: 'can-cannot',
    category: 'food',
    scene: 'hawker',
    context: 'You just finished a quick lunch at a hawker centre.',
    prompt: 'Can you leave your tray on the table?',
    options: [
      { id: 'can', label: 'Can' },
      { id: 'cannot', label: 'Cannot' },
    ],
    correctOptionId: 'cannot',
    explanation: 'Return your tray — it keeps the whole centre running smoothly for everyone.',
    xp: 15,
    difficulty: 2,
  },
  {
    id: 'reallife-l1-c3',
    lessonId: 'reallife-l1',
    type: 'read-the-room',
    category: 'socialVibes',
    scene: 'chat',
    chatThread: [
      { from: 'you', text: 'Want to grab dinner later?' },
      { from: 'them', text: 'Hmm, let me see how work goes, ya?' },
    ],
    prompt: "What's the best read?",
    options: [
      { id: 'a', label: 'A definite yes' },
      { id: 'b', label: "Uncertain — possibly busy, not a no" },
      { id: 'c', label: 'A definite no' },
    ],
    correctOptionId: 'b',
    explanation:
      "This reads as genuinely undecided, not a soft rejection — a simple follow-up later in the day is a completely normal next step.",
    xp: 20,
    difficulty: 3,
  },
  {
    id: 'reallife-l1-c4',
    lessonId: 'reallife-l1',
    type: 'sort',
    category: 'gettingAround',
    scene: 'street',
    prompt: 'Put the steps for taking a public bus into the correct order.',
    items: [
      { id: 'wait', label: 'Wait at the bus stop' },
      { id: 'in', label: 'Tap in as you board' },
      { id: 'ride', label: 'Ride to your stop' },
      { id: 'out', label: 'Tap out as you alight' },
    ],
    correctOrder: ['wait', 'in', 'ride', 'out'],
    explanation:
      "Same tap-in/tap-out logic as the MRT — just remember to tap again on the way out, since bus fares are distance-based.",
    xp: 15,
    difficulty: 2,
  },
  {
    id: 'reallife-l1-c5',
    lessonId: 'reallife-l1',
    type: 'culture-card',
    category: 'socialVibes',
    scene: 'none',
    prompt: "You've got the hang of it",
    body: "Real Life Mode isn't a final exam — it's a reminder that these small habits (queueing, tapping in, reading tone, sharing a table) add up to feeling genuinely at home here. Keep noticing, keep asking, and it'll keep clicking.",
    explanation:
      'Cultural fluency builds gradually through everyday situations, not a single checklist.',
    xp: 10,
    difficulty: 1,
  },
];
