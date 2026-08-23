import type { Lesson } from '@/content/types';

export const moveLessons: Lesson[] = [
  {
    id: 'move-l1',
    missionId: 'move',
    title: 'MRT Basics',
    order: 1,
    challengeIds: ['move-l1-c1'],
    discover: [
      {
        emoji: '🚇',
        title: 'The backbone of getting around',
        body: 'The MRT (Mass Rapid Transit) is Singapore\'s subway system — fast, cheap, and the default way most people commute.',
      },
      {
        emoji: '💳',
        title: 'Why it matters',
        body: "There's no ticket counter to queue at — a transit card or a contactless bank card/phone taps directly at the gantry.",
      },
      {
        emoji: '🚫',
        title: 'Fun fact',
        body: "Eating or drinking anywhere in the paid MRT area (even a sweet) can get you a fine of up to $500 — it's one of the most strictly enforced unwritten-turned-written rules.",
      },
      {
        emoji: '👂',
        title: 'When you\'ll encounter it',
        body: 'Basically every day you need to get somewhere further than walking distance.',
      },
    ],
    phraseIds: ['mrt'],
    cultureTopicIds: ['mrt-etiquette'],
    exampleConversation: [
      { from: 'them', speaker: 'Friend', text: 'How are you getting to town?' },
      { from: 'you', text: "I'll take the MRT, faster than driving at this hour." },
    ],
    guidedPractice: [
      {
        id: 'move-l1-gp1',
        kind: 'tap-phrase',
        prompt: "Tap the phrase for Singapore's subway system.",
        phraseId: 'mrt',
        distractorPhraseIds: ['grab', 'alight'],
      },
    ],
    recap: [
      'Learned what the MRT is and how to pay',
      'Saw it mentioned in an everyday plan',
      'Practiced spotting the term',
    ],
  },
  {
    id: 'move-l2',
    missionId: 'move',
    title: 'Tap In, Tap Out',
    order: 2,
    challengeIds: ['move-l2-c1'],
    discover: [
      {
        emoji: '📲',
        title: 'Both taps matter',
        body: 'You tap your card or phone at the gantry both entering and leaving — the fare is calculated from the difference.',
      },
      {
        emoji: '⚠️',
        title: 'Why it matters',
        body: 'Skipping the tap-out can trigger a maximum fare charge or flag your card for the next ride.',
      },
      {
        emoji: '👂',
        title: 'When you\'ll encounter it',
        body: 'Every single MRT ride, and every bus ride too.',
      },
    ],
    phraseIds: ['tap-in-tap-out'],
    exampleConversation: [
      { from: 'them', speaker: 'Friend', text: 'Do I need to buy a ticket?' },
      { from: 'you', text: 'Nah, just tap in with your phone — and remember to tap out too.' },
    ],
    guidedPractice: [
      {
        id: 'move-l2-gp1',
        kind: 'fill-blank',
        prompt: 'Fill in what you must do when you leave the MRT.',
        sentence: "Don't forget to ___ at the gantry when you leave.",
        answer: 'tap out',
        options: ['tap out', 'chope', 'dabao'],
      },
    ],
    recap: [
      'Learned the tap-in/tap-out fare system',
      'Saw why tapping out matters',
      'Practiced explaining it to a friend',
    ],
  },
  {
    id: 'move-l3',
    missionId: 'move',
    title: 'Escalator Etiquette',
    order: 3,
    challengeIds: ['move-l3-c1'],
    discover: [
      {
        emoji: '🛗',
        title: 'Stand left, walk right',
        body: 'On many busy escalators, commuters stand on the left and keep the right clear for people passing. Follow any posted safety guidance at the station.',
      },
      {
        emoji: '⚡',
        title: 'Why it matters',
        body: "It is a common commuting pattern, especially at rush hour. Keeping to one side helps the flow, but posted safety guidance always comes first.",
      },
      {
        emoji: '👂',
        title: 'When you\'ll encounter it',
        body: 'Every escalator, especially in MRT stations during peak hour.',
      },
    ],
    phraseIds: ['stand-left'],
    cultureTopicIds: ['escalator-etiquette'],
    exampleConversation: [
      { from: 'them', speaker: 'Friend', text: 'Wah, someone rushing behind you.' },
      { from: 'you', text: 'Oh right — stand left, my bad!' },
    ],
    guidedPractice: [
      {
        id: 'move-l3-gp1',
        kind: 'rearrange',
        prompt: 'Rearrange the words into the escalator rule.',
        correctOrder: ['Stand', 'left,', 'walk', 'right'],
      },
    ],
    recap: [
      'Learned the "stand left, walk right" escalator norm',
      'Saw why it\'s so consistently followed',
      'Practiced saying the rule out loud',
    ],
  },
  {
    id: 'move-l4',
    missionId: 'move',
    title: 'Bus Like a Local',
    order: 4,
    challengeIds: ['move-l4-c1'],
    discover: [
      {
        emoji: '🚌',
        title: 'Same tap system, one extra step',
        body: 'Buses use the same tap card/phone system as the MRT — but since fares are distance-based, you tap again as you alight.',
      },
      {
        emoji: '🔔',
        title: 'Why it matters',
        body: 'Forgetting to tap out on a bus (unlike some trains) directly means overpaying — the system doesn\'t know where you got off.',
      },
      {
        emoji: '👂',
        title: 'When you\'ll encounter it',
        body: 'Any bus ride — buses cover far more ground than the MRT alone.',
      },
    ],
    phraseIds: ['alight'],
    cultureTopicIds: ['public-transport-bus'],
    exampleConversation: [
      { from: 'them', speaker: 'Announcement', text: 'Please press the bell before you alight.' },
      { from: 'you', text: 'That\'s my stop — pressing now.' },
    ],
    guidedPractice: [
      {
        id: 'move-l4-gp1',
        kind: 'tap-phrase',
        prompt: 'Tap the word that means "to get off a bus or train."',
        phraseId: 'alight',
        distractorPhraseIds: ['queue', 'jio'],
      },
    ],
    recap: [
      'Learned "Alight" — getting off a bus or train',
      'Saw why bus taps work differently from the MRT',
      'Practiced recognising the term from an announcement',
    ],
  },
  {
    id: 'move-l5',
    missionId: 'move',
    title: "Grab Do's & Don'ts",
    order: 5,
    challengeIds: ['move-l5-c1'],
    discover: [
      {
        emoji: '🚗',
        title: 'The default ride-hailing app',
        body: 'Grab is Singapore\'s dominant ride-hailing service — used constantly as both a noun (the app) and a verb ("let\'s Grab").',
      },
      {
        emoji: '🙋',
        title: 'Why it matters',
        body: 'A quick pickup confirmation and boarding promptly keeps things smooth for the driver and their next stop.',
      },
      {
        emoji: '👂',
        title: 'When you\'ll encounter it',
        body: 'Late nights, heavy bags, or whenever public transport isn\'t convenient.',
      },
    ],
    phraseIds: ['grab'],
    exampleConversation: [
      { from: 'them', speaker: 'Friend', text: 'It\'s late, how are we getting back?' },
      { from: 'you', text: "Let's just Grab home." },
    ],
    guidedPractice: [
      {
        id: 'move-l5-gp1',
        kind: 'fill-blank',
        prompt: 'Fill in the ride-hailing app most people use here.',
        sentence: "It's late, let's just ___ home.",
        answer: 'Grab',
        options: ['Grab', 'chope', 'jio'],
      },
    ],
    recap: [
      'Learned "Grab" as both app and verb',
      'Saw the expected boarding etiquette',
      'Practiced using it in a plan',
    ],
  },
  {
    id: 'move-l6',
    missionId: 'move',
    title: 'Finding Your Way',
    order: 6,
    challengeIds: ['move-l6-c1'],
    discover: [
      {
        emoji: '🚪',
        title: 'Stations have many exits',
        body: 'Big MRT stations can have half a dozen numbered or lettered exits, sometimes far apart above ground.',
      },
      {
        emoji: '📍',
        title: 'Why it matters',
        body: 'Agreeing on the wrong exit is a classic way to miss a friend entirely — asking "which exit" up front saves the confusion.',
      },
      {
        emoji: '👂',
        title: 'When you\'ll encounter it',
        body: 'Coordinating any meetup near an MRT station.',
      },
    ],
    phraseIds: ['which-exit'],
    exampleConversation: [
      { from: 'you', text: 'Meet at the station?' },
      { from: 'them', speaker: 'Friend', text: 'Which exit ah? This one\'s got like six.' },
      { from: 'you', text: 'Good point — Exit B, near the mall.' },
    ],
    guidedPractice: [
      {
        id: 'move-l6-gp1',
        kind: 'tap-phrase',
        prompt: 'Tap the question you\'d ask to avoid missing a friend at a big station.',
        phraseId: 'which-exit',
        distractorPhraseIds: ['peak-hour', 'noted'],
      },
    ],
    recap: [
      'Learned to ask "which exit" when meeting up',
      'Saw why it prevents missed connections',
      'Practiced coordinating a meetup point',
    ],
  },
  {
    id: 'move-l7',
    missionId: 'move',
    title: 'Peak Hour Survival',
    order: 7,
    challengeIds: ['move-l7-c1'],
    discover: [
      {
        emoji: '⏰',
        title: 'Rush hour, but predictable',
        body: 'Peak hour is roughly weekday 7:30-9:30am and 5:30-7:30pm — trains and buses fill up fast during these windows.',
      },
      {
        emoji: '🚶',
        title: 'Why it matters',
        body: 'Letting alighting passengers off first, then moving inward, keeps a packed carriage actually functional. At the platform doors, commuters naturally form two lines, one on each side, leaving the middle clear for people getting off.',
      },
      {
        emoji: '👂',
        title: 'When you\'ll encounter it',
        body: 'Weekday commutes — plan around it if your schedule allows any flexibility.',
      },
    ],
    phraseIds: ['peak-hour'],
    cultureTopicIds: ['peak-hour-crowds'],
    exampleConversation: [
      { from: 'them', speaker: 'Colleague', text: 'Heading out now?' },
      { from: 'you', text: "Bit later — trying to avoid peak hour, train's packed right now." },
    ],
    guidedPractice: [
      {
        id: 'move-l7-gp1',
        kind: 'fill-blank',
        prompt: 'Fill in the term for the busiest commuting window.',
        sentence: "Avoid ___ if you can, the train gets packed.",
        answer: 'peak hour',
        options: ['peak hour', 'tray return', 'chope'],
      },
    ],
    recap: [
      'Learned "Peak Hour" and when it happens',
      'Saw the let-off-first-then-board norm',
      'Practiced talking about commute timing',
    ],
  },
  {
    id: 'move-l8',
    missionId: 'move',
    title: 'Mission Challenge',
    order: 8,
    challengeIds: ['move-l8-c1', 'move-l8-c2'],
    discover: [
      {
        emoji: '🗺️',
        title: 'A full commute, start to finish',
        body: 'Tap in, stand left, alight at the right exit, dodge peak hour, Grab home late — this challenge runs you through a whole day of getting around.',
      },
      {
        emoji: '⚙️',
        title: 'Why it all just works',
        body: 'None of it is complicated on its own — it\'s a system that runs on everyone doing the small, boring, courteous thing at the same time.',
      },
    ],
    phraseIds: ['mrt', 'grab'],
    recap: [
      'Reviewed everything from Move Like a Local',
      'Put it all together across a full commute',
    ],
  },
];
