import type { Challenge } from '@/content/types';

export const reallifeChallenges: Challenge[] = [
  {
    id: 'reallife-l1-c1',
    lessonId: 'reallife-l1',
    type: 'multiple-choice',
    category: 'gettingAround',
    scene: 'escalator',
    context: "A visiting friend is standing on the right side of a packed MRT escalator, and people keep squeezing past on the left, annoyed.",
    prompt: "What's actually happening here?",
    options: [
      { id: 'a', label: "They're breaking an actual law" },
      { id: 'b', label: "They're breaking an unwritten but strongly-followed norm" },
      { id: 'c', label: "Nothing — there's no expectation either way" },
    ],
    correctOptionId: 'b',
    explanation:
      'Unlike the tray-return rule, "stand left" isn\'t written into any regulation — it\'s just followed so consistently that breaking it draws real attention anyway.',
    xp: 15,
    difficulty: 2,
  },
  {
    id: 'reallife-l1-c2',
    lessonId: 'reallife-l1',
    type: 'multiple-choice',
    category: 'food',
    scene: 'hawker',
    context: 'You watch someone finish their meal at a hawker centre and walk off, leaving the tray on the table.',
    prompt: "What's true about what just happened?",
    options: [
      { id: 'a', label: 'Totally normal — cleaners are paid to handle it' },
      { id: 'b', label: 'A real lapse — and in many hawker centres, actually against regulation' },
      { id: 'c', label: 'Only acceptable for tourists who don\'t know better' },
    ],
    correctOptionId: 'b',
    explanation:
      "Tray return is one of the few etiquette norms here that's also literal law in many hawker centres, with signage and occasional enforcement — not just a social expectation.",
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
