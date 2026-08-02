import type { Challenge } from '@/content/types';

export const eatChallenges: Challenge[] = [
  {
    id: 'eat-l1-c1',
    lessonId: 'eat-l1',
    type: 'multiple-choice',
    category: 'food',
    scene: 'hawker',
    context: "You've just arrived at a hawker centre for lunch.",
    prompt: 'What do most locals do first?',
    options: [
      { id: 'a', label: 'Find (or chope) a table before ordering' },
      { id: 'b', label: 'Wait by the entrance to be seated' },
      { id: 'c', label: 'Pay a seating fee at a counter' },
      { id: 'd', label: 'Ask staff to assign a table' },
    ],
    correctOptionId: 'a',
    explanation:
      "Hawker centres are self-service: you find your own table (or reserve one), then order at individual stalls. There's no host to seat you.",
    xp: 10,
    difficulty: 1,
  },
  {
    id: 'eat-l2-c1',
    lessonId: 'eat-l2',
    type: 'scenario-decision',
    category: 'food',
    scene: 'hawker',
    context:
      "You place a packet of tissues on a table to 'chope' (reserve) it before joining the queue to order.",
    prompt: 'Is this considered rude?',
    options: [
      { id: 'a', label: 'Yes, always' },
      { id: 'b', label: "No — it's a common, widely accepted practice" },
      { id: 'c', label: 'Only if the hawker centre is empty' },
      { id: 'd', label: 'Only older people are allowed to do it' },
    ],
    correctOptionId: 'b',
    explanation:
      "'Choping' a seat with tissues, an umbrella, or a small item is an everyday, accepted practice — not rudeness. It just means the seat is spoken for.",
    xp: 15,
    difficulty: 2,
  },
  {
    id: 'eat-l3-c1',
    lessonId: 'eat-l3',
    type: 'match',
    category: 'food',
    scene: 'hawker',
    prompt: 'Match each kopi order to what it actually is.',
    pairs: [
      { id: 'kopi', left: 'Kopi', right: 'Coffee with condensed milk' },
      { id: 'kopi-o', left: 'Kopi O', right: 'Black coffee with sugar' },
      {
        id: 'kopi-c',
        left: 'Kopi C',
        right: 'Coffee with evaporated milk & sugar',
      },
      { id: 'kopi-peng', left: 'Kopi Peng', right: 'Iced coffee' },
    ],
    explanation:
      "Kopitiam ordering has its own compact code — once you know the pattern (O = no milk, C = evaporated milk, peng = iced), you can read almost any variation.",
    xp: 15,
    difficulty: 2,
  },
  {
    id: 'eat-l4-c1',
    lessonId: 'eat-l4',
    type: 'can-cannot',
    category: 'food',
    scene: 'hawker',
    context:
      "You've finished your meal at a hawker centre with tray-return points nearby.",
    prompt: 'Can you just leave your tray on the table and walk off?',
    options: [
      { id: 'can', label: 'Can' },
      { id: 'cannot', label: 'Cannot' },
    ],
    correctOptionId: 'cannot',
    explanation:
      'Returning your own tray is expected practice at most hawker centres — in many, it is even required by law. Clearing your own tray keeps things running smoothly for everyone.',
    xp: 10,
    difficulty: 1,
  },
  {
    id: 'eat-l5-c1',
    lessonId: 'eat-l5',
    type: 'scenario-decision',
    category: 'food',
    scene: 'hawker',
    context: "You'd rather bring your food home than eat in.",
    prompt: 'What word would a local likely use to ask for this?',
    options: [
      { id: 'a', label: 'Dabao (or tapau/tapao) it' },
      { id: 'b', label: 'Chope it' },
      { id: 'c', label: 'Makan it' },
      { id: 'd', label: 'Shiok it' },
    ],
    correctOptionId: 'a',
    explanation:
      "'Dabao' (also spelled tapau/tapao) means to take away or package food to go — you'll hear it used as a verb: 'dabao the chicken rice'.",
    xp: 10,
    difficulty: 1,
  },
  {
    id: 'eat-l5-c2',
    lessonId: 'eat-l5',
    type: 'culture-card',
    category: 'food',
    scene: 'none',
    prompt: 'Hawker culture is a way of life',
    body: "Singapore's hawker culture is recognised by UNESCO as intangible cultural heritage. Sharing tables with strangers, queueing at multiple stalls for one meal, and eating side-by-side with people from every background is completely normal here.",
    explanation:
      'Hawker centres function as everyday community spaces as much as places to eat.',
    xp: 5,
    difficulty: 1,
  },
];
