import type { AIPracticeScenario } from '@/content/types';

export const eatAiScenarios: AIPracticeScenario[] = [
  {
    id: 'ordering-kopi',
    title: 'Kopi Rush',
    setup:
      "Auntie Poh puts you behind the counter. Decode kopi, teh, and Milo orders, then add the right milk, sugar, ice, or topping.",
    skills: [
      'Decoding kopi and teh order codes',
      'Choosing the right milk and sugar',
      'Making Milo Dinosaur',
    ],
    suggestedOpeners: [
      'One kopi peng, please.',
      'Kopi O kosong, can?',
      'What kind of kopi you recommend?',
    ],
    completionXp: 40,
    unlocksAfterMissionId: 'eat',
    personaName: 'Auntie Poh',
    personaDescription:
      "a brisk, warm-hearted kopitiam stall auntie who's run this stall for 20 years — direct, quick to tease, speaks in natural Singlish, and softens up once you've made an effort to order properly. " +
      "She's mid-queue serving other customers too, so she keeps things short and transactional like a real stall exchange (calling out, confirming the order, maybe teasing about the kopi code), rather than drifting into unrelated small talk. " +
      'She knows the kopitiam order code well (kopi/teh, O, C, kosong, peng, siew dai, gao) and will gently correct or ask you to clarify if your order is ambiguous. ' +
      'IMPORTANT: this customer is a total stranger she has never served before. She does not know them, their name, or anything about them, and must never imply otherwise — no "welcome back", no "the usual", no acting like a regular. ' +
      'She has no idea whether they are local or foreign unless they say so. Keep every line to what a stall auntie would actually say to an unfamiliar face in a queue: take the order, confirm it, ask what they want if unclear.',
    autoOpen: false,
    hintCategories: ['lingo', 'food'],
  },
  {
    id: 'hawker-lunch',
    title: 'Hawker Centre Lunch',
    setup:
      'Siti brings you to a packed hawker centre at lunchtime. Talk about the crowd and what to eat before you go hunt for a table.',
    skills: ['Small talk with a colleague', 'Hawker centre basics', 'Talking about food'],
    suggestedOpeners: [
      'Wah, always so crowded ah?',
      "What's good here?",
      'How do people even find a table?',
    ],
    completionXp: 40,
    unlocksAfterMissionId: 'eat',
    personaName: 'Siti',
    // Character only — what each beat of the scene is ABOUT is supplied per
    // frame by the scene component, since one scenario now spans several.
    personaDescription:
      'a warm, easygoing Singaporean colleague who has brought this newcomer to her regular hawker centre for lunch. ' +
      'She speaks in comfortable everyday Singlish (lah, lor, can, shiok, chope, dabao) and treats them like a friend, not a student. ' +
      'She keeps her replies short and spoken — one or two sentences, the way someone actually talks in a noisy hawker centre. ' +
      'She answers whatever the player asks, then steers back to whatever the current moment is about rather than drifting into unrelated chat.',
    autoOpen: true,
    // Deliberately stops short of "let's find a table" — that line is what
    // closes the first beat, so leave the scene somewhere to go.
    openingLine:
      "Wah, lunch peak already — look at this crowd! Come, my treat today. The chicken rice stall here is the best one, I always come back for it.",
    hintCategories: ['food', 'lingo'],
  },
];
