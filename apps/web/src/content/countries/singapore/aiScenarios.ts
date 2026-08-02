import type { AIPracticeScenario } from '@/content/types';

export const aiScenarios: AIPracticeScenario[] = [
  {
    id: 'first-classmate',
    title: 'Meeting a Classmate',
    setup:
      "You're meeting a Singaporean classmate for the first time before class starts. Start the conversation!",
    suggestedOpeners: [
      'Why you in Singapore?',
      'Which school you go?',
      'You free this weekend?',
    ],
    completionXp: 50,
    sceneKey: 'classroom',
    personaName: 'Wei Jie',
    personaDescription:
      'a laid-back, friendly Singaporean student who sits near you in lecture and is happy to chat before class starts',
    schoolName: 'Raffles Secondary School',
    className: 'Secondary 2 Amanda',
    autoOpen: true,
    hintCategories: ['lingo', 'socialVibes'],
    visualScene: {
      backgroundImage: '/scenes/scene1/background.png',
      characterImage: '/scenes/scene1/classmate.png',
      playerImage: '/scenes/scene1/player.png',
      teacherImage: '/scenes/scene1/teacher.png',
    },
    completionScript: {
      minTurns: 2,
      maxTurns: 6,
      teacherName: 'Ms Tan',
      teacherLine: 'Good morning, everyone!',
      classmateLine: "C'mon, let's go to our seats!",
    },
  },
  {
    id: 'ordering-kopi',
    title: 'Ordering Kopi',
    setup:
      "You're queuing at a kopitiam stall. Make it to the counter and order a kopi the way a local would.",
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
      'She knows the kopitiam order code well (kopi/teh, O, C, kosong, peng, siew dai, gao) and will gently correct or ask you to clarify if your order is ambiguous.',
    autoOpen: true,
    hintCategories: ['lingo', 'food'],
    visualScene: {
      backgroundImage: '/scenes/scene2/background.png',
      characterImage: '/scenes/scene2/auntie-poh.png',
      playerImage: '/scenes/scene2/player.png',
    },
  },
  {
    id: 'hawker-lunch',
    title: 'Hawker Centre Lunch',
    setup:
      "A friend jio you for lunch at the hawker centre. Figure out where to sit and what to eat together.",
    suggestedOpeners: [
      'Eh, where should we chope a table?',
      'What\'s good here?',
      'Should we dabao instead?',
    ],
    completionXp: 40,
    unlocksAfterMissionId: 'eat',
    personaName: 'Mei',
    personaDescription:
      "a close friend who jio'd you for hawker lunch — easygoing, hungry, and already scanning the stalls for what to eat",
    autoOpen: true,
    hintCategories: ['food', 'lingo'],
  },
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
      'a chatty, good-natured Grab driver in his 50s who likes making small talk with passengers on the drive',
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
      'a helpful commuter waiting on the platform, happy to point a lost stranger in the right direction',
    // No autoOpen: the scenario has the player approach and ask first, so a
    // stranger speaking up unprompted would contradict the premise.
    hintCategories: ['gettingAround', 'lingo'],
  },
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
    personaDescription: 'a colleague messaging you on the work chat with a quick, casual request',
    autoOpen: true,
    hintCategories: ['workCulture', 'lingo'],
  },
  {
    id: 'team-meeting',
    title: 'Team Meeting Check-in',
    setup:
      "It's your first team meeting. Your manager asks everyone to briefly share an update — take your turn.",
    suggestedOpeners: [
      'Sure, I can go first.',
      'Quick update from my side —',
      'I have a question before we start.',
    ],
    completionXp: 40,
    unlocksAfterMissionId: 'work',
    personaName: 'Mr Koh',
    personaDescription:
      "your manager, running the team's check-in meeting — friendly but keeps things moving efficiently",
    autoOpen: true,
    hintCategories: ['workCulture', 'lingo'],
  },
  {
    id: 'networking',
    title: 'Networking at an Event',
    setup:
      "You're at a casual work networking mixer. Strike up a conversation with someone you haven't met.",
    suggestedOpeners: [
      'Hi, I don\'t think we\'ve met — I\'m new here.',
      'So how do you know the organiser?',
      'What team are you on?',
    ],
    completionXp: 40,
    unlocksAfterMissionId: 'work',
    personaName: 'Farhan',
    personaDescription: 'another attendee at the networking mixer, easy to talk to and genuinely curious about people',
    // No autoOpen: the scenario has the player strike up the conversation first.
    hintCategories: ['workCulture', 'socialVibes', 'lingo'],
  },
  {
    id: 'lunch-invitation',
    title: 'Lunch Invitation',
    setup: 'A colleague wants to jio you for lunch. Respond and help settle on a plan.',
    suggestedOpeners: [
      'Wah sure, where you thinking?',
      'Can lah, what time?',
      'Today a bit tight, tomorrow can?',
    ],
    completionXp: 40,
    unlocksAfterMissionId: 'vibe',
    personaName: 'Jing Wen',
    personaDescription: 'a colleague jio-ing you for lunch — friendly and flexible about where and when',
    autoOpen: true,
    hintCategories: ['socialVibes', 'food', 'lingo'],
  },
  {
    id: 'weekend-plans',
    title: 'Weekend Plans',
    setup: 'A friend is texting you about weekend plans. Keep the casual back-and-forth going.',
    suggestedOpeners: [
      'Eh you free this weekend?',
      'Thinking of makan somewhere new, you in?',
      'Let\'s see how the weather is first.',
    ],
    completionXp: 40,
    unlocksAfterMissionId: 'vibe',
    personaName: 'Xin Yi',
    personaDescription: 'a close friend texting you casually about weekend plans',
    autoOpen: true,
    hintCategories: ['socialVibes', 'lingo'],
  },
];
