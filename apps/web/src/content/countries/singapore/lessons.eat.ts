import type { Lesson } from '@/content/types';

export const eatLessons: Lesson[] = [
  {
    id: 'eat-l1',
    missionId: 'eat',
    title: 'Hawker Centre Basics',
    order: 1,
    challengeIds: ['eat-l1-c1'],
    discover: [
      {
        emoji: '🍜',
        title: 'Not a restaurant — a food village',
        body: "A hawker centre is an open-air complex of independent food stalls. There's no host, no table service — you're on your own system.",
      },
      {
        emoji: '🪑',
        title: 'Why it matters',
        body: "Walking in and waiting to be seated (like at a restaurant) will just leave you standing there. Locals find a table first, then order.",
      },
      {
        emoji: '👂',
        title: 'When you\'ll encounter it',
        body: "It's the default place to eat almost every day in Singapore — lunch, dinner, even breakfast.",
      },
    ],
    phraseIds: ['hawker-centre', 'die-die-must-try'],
    cultureTopicIds: ['hawker-etiquette'],
    exampleConversation: [
      { from: 'them', speaker: 'Friend', text: "Let's go the hawker centre for lunch." },
      { from: 'you', text: 'Sure — I\'ll grab a table, you go queue?' },
      { from: 'them', speaker: 'Friend', text: 'Can! There\'s a stall there that\'s die die must try.' },
    ],
    guidedPractice: [
      {
        id: 'eat-l1-gp1',
        kind: 'tap-phrase',
        prompt: 'Tap the phrase for an open-air complex of food stalls.',
        phraseId: 'hawker-centre',
        distractorPhraseIds: ['kopi', 'dabao'],
      },
    ],
    recap: [
      'Learned what a hawker centre actually is',
      'Learned "Die Die Must Try" — the strongest food recommendation there is',
      'Saw why you find a table before ordering',
      'Practiced spotting the phrase in context',
    ],
  },
  {
    id: 'eat-l2',
    missionId: 'eat',
    title: 'Chope Culture',
    order: 2,
    challengeIds: ['eat-l2-c1'],
    discover: [
      {
        emoji: '🧻',
        title: 'A tissue packet means "taken"',
        body: 'Choping is reserving a seat by leaving a small item — usually a tissue packet — on the table before you queue to order.',
      },
      {
        emoji: '🤝',
        title: 'Why it matters',
        body: "It's a genuine honesty system, not rudeness. Sitting at a choped table (or moving the item) is the actual faux pas.",
      },
      {
        emoji: '📜',
        title: 'Fun fact',
        body: '"Chope" comes from "chop," meaning a seal or stamp — you\'re marking your claim on the table.',
      },
      {
        emoji: '👂',
        title: 'When you\'ll encounter it',
        body: 'Every busy hawker centre, especially around lunch — you\'ll see tissue packets on empty-looking tables constantly.',
      },
    ],
    phraseIds: ['chope'],
    cultureTopicIds: ['chope'],
    exampleConversation: [
      { from: 'you', text: "I'll chope a table, you go queue for drinks." },
      { from: 'them', speaker: 'Friend', text: "Got it — that one with the tissue packet, right?" },
      { from: 'you', text: "Yep, that one's ours now." },
    ],
    guidedPractice: [
      {
        id: 'eat-l2-gp1',
        kind: 'fill-blank',
        prompt: 'Fill in the word for reserving a seat with a small item.',
        sentence: "I'll ___ a table while you queue for drinks.",
        answer: 'chope',
        options: ['chope', 'dabao', 'jio'],
      },
    ],
    recap: [
      'Learned "Chope" — reserving a seat with a small item',
      'Saw why it\'s an accepted honesty system, not rudeness',
      'Practiced using it in a sentence',
    ],
  },
  {
    id: 'eat-l3',
    missionId: 'eat',
    title: 'Ordering & Kopi Code',
    order: 3,
    challengeIds: ['eat-l3-c1'],
    discover: [
      {
        emoji: '☕',
        title: 'A compact ordering code',
        body: 'Kopi = coffee with condensed milk. Add "O" for black with sugar, "C" for evaporated milk, "kosong" for no sugar, "peng" for iced, "siew dai" for less sweet, "gao" for extra strong — mix and match.',
      },
      {
        emoji: '🫖',
        title: 'Tea and beyond',
        body: 'Same code works for "teh" (tea). And "teh tarik" — tea dramatically poured between two cups to froth it — is a show in itself.',
      },
      {
        emoji: '🧠',
        title: 'Why it matters',
        body: 'Once you know the pattern, you can decode almost any drink board — it looks cryptic at first but is genuinely learnable in one sitting.',
      },
      {
        emoji: '👂',
        title: 'When you\'ll encounter it',
        body: 'Any kopitiam or hawker drink stall — ordering your first kopi is a rite of passage.',
      },
    ],
    phraseIds: ['kopi', 'kopi-peng', 'teh-tarik'],
    cultureTopicIds: ['kopi-ordering'],
    exampleConversation: [
      { from: 'you', text: 'One kopi peng, please.' },
      { from: 'them', speaker: 'Auntie', text: 'Peng ah, okay! Anything else?' },
      { from: 'you', text: 'Actually, make it a teh tarik instead!' },
    ],
    guidedPractice: [
      {
        id: 'eat-l3-gp1',
        kind: 'tap-phrase',
        prompt: 'Tap the phrase for "iced coffee with condensed milk."',
        phraseId: 'kopi-peng',
        distractorPhraseIds: ['kopi', 'chope'],
      },
    ],
    recap: [
      'Learned "Kopi," "Kopi Peng," and "Teh Tarik"',
      'Cracked the basic pattern behind kopitiam ordering',
      'Practiced placing a simple order',
    ],
  },
  {
    id: 'eat-l4',
    missionId: 'eat',
    title: 'Tray Return & Dabao',
    order: 4,
    challengeIds: ['eat-l4-c1'],
    discover: [
      {
        emoji: '🍽️',
        title: 'Clear your own tray',
        body: "After eating, you return your own tray and dishes to a tray-return point — it's expected, and in many hawker centres, it's the law.",
      },
      {
        emoji: '🥡',
        title: '...or skip eating in entirely',
        body: '"Dabao" means to take food away instead of eating in — you\'ll hear it used as a verb: "dabao the chicken rice."',
      },
      {
        emoji: '👂',
        title: 'When you\'ll encounter it',
        body: 'Tray return: every time you finish a hawker meal. Dabao: whenever you\'d rather eat elsewhere.',
      },
    ],
    phraseIds: ['tray-return', 'dabao', 'sedap'],
    cultureTopicIds: ['tray-return'],
    exampleConversation: [
      { from: 'them', speaker: 'Stall owner', text: 'Eating here or dabao?' },
      { from: 'you', text: 'Dabao, please — I need to rush back to work.' },
      { from: 'them', speaker: 'Stall owner', text: 'Okay! This one very sedap, you will like it.' },
    ],
    guidedPractice: [
      {
        id: 'eat-l4-gp1',
        kind: 'fill-blank',
        prompt: 'Fill in the word for taking your food to go.',
        sentence: 'Can I ___ this chicken rice, please?',
        answer: 'dabao',
        options: ['dabao', 'chope', 'jio'],
      },
    ],
    recap: [
      'Learned "Tray Return" — expected, sometimes legally required',
      'Learned "Dabao" — taking food to go',
      'Learned "Sedap" — delicious',
      'Practiced asking for food to go',
    ],
  },
  {
    id: 'eat-l5',
    missionId: 'eat',
    title: 'Mission Challenge',
    order: 5,
    challengeIds: ['eat-l5-c1', 'eat-l5-c2'],
    discover: [
      {
        emoji: '🍽️',
        title: 'One full hawker run',
        body: 'Chope a table, crack the kopi code, order a teh tarik, dabao if you\'re in a rush, return your tray either way — this challenge strings it all into one real visit.',
      },
      {
        emoji: '🌏',
        title: 'The bigger picture',
        body: "UNESCO recognises hawker culture as intangible heritage — not for the food alone, but for what happens around it: strangers sharing tables, queues that cross every background in the country.",
      },
    ],
    phraseIds: ['chope', 'dabao'],
    recap: [
      'Reviewed everything from Eat Like a Local',
      'Put it all together in one hawker centre scenario',
    ],
  },
];
