import type { Lesson } from '@/content/types';

export const workLessons: Lesson[] = [
  {
    id: 'work-l1',
    missionId: 'work',
    title: 'Meetings & Punctuality',
    order: 1,
    challengeIds: ['work-l1-c1'],
    discover: [
      {
        emoji: '⏱️',
        title: '"On time" means on time',
        body: 'Singapore workplaces generally treat scheduled start times as firm — arriving on time or a couple minutes early is the baseline.',
      },
      {
        emoji: '💼',
        title: 'Why it matters',
        body: 'Arriving late to a meeting reads as unprofessional, even if the meeting itself starts a little loosely elsewhere. Even expats new to Singapore tend to adapt fast — surveys find nearly half show up early rather than risk it.',
      },
      {
        emoji: '🪜',
        title: 'One more thing about meetings',
        body: 'Many offices here are fairly hierarchical — disagreements usually go through your direct manager first, not straight to their boss. And if someone says "let me check and get back to you," that\'s often a soft no, delivered gently rather than bluntly.',
      },
      {
        emoji: '👂',
        title: 'When you\'ll encounter it',
        body: 'Every scheduled meeting, call, or work commitment.',
      },
    ],
    phraseIds: ['on-the-dot'],
    cultureTopicIds: ['punctuality', 'workplace-hierarchy'],
    exampleConversation: [
      { from: 'them', speaker: 'Manager', text: 'Meeting starts 9am on the dot, don\'t be late.' },
      { from: 'you', text: 'Got it, I\'ll be there at 8:55.' },
    ],
    guidedPractice: [
      {
        id: 'work-l1-gp1',
        kind: 'tap-phrase',
        prompt: 'Tap the phrase for "exactly on time."',
        phraseId: 'on-the-dot',
        distractorPhraseIds: ['noted', 'jio'],
      },
    ],
    recap: [
      'Learned "On The Dot" and workplace punctuality norms',
      'Saw it used to set expectations for a meeting',
      'Practiced spotting the phrase',
    ],
  },
  {
    id: 'work-l2',
    missionId: 'work',
    title: 'Messaging Colleagues',
    order: 2,
    challengeIds: ['work-l2-c1'],
    discover: [
      {
        emoji: '💬',
        title: 'A quick acknowledgment goes a long way',
        body: '"Noted" is a short, common way to confirm you\'ve seen and understood a work message.',
      },
      {
        emoji: '⚡',
        title: 'Why it matters',
        body: "You don't need to reply instantly to work chats, but a quick acknowledgment (rather than silence) is the expected norm.",
      },
      {
        emoji: '🏹',
        title: 'A word to know (not necessarily use)',
        body: '"Arrow" means dumping a task onto someone else — you\'ll hear colleagues joke about being "arrowed" into extra work.',
      },
      {
        emoji: '👂',
        title: 'When you\'ll encounter it',
        body: 'Work chats and emails — especially quick asks from colleagues.',
      },
    ],
    phraseIds: ['noted', 'arrow'],
    exampleConversation: [
      { from: 'them', speaker: 'Colleague', text: 'Hey, quick one — can you send me the deck when you get a chance?' },
      { from: 'you', text: 'Noted, will send it over shortly!' },
      { from: 'them', speaker: 'Colleague', text: 'Thanks, sorry to arrow you again this week.' },
    ],
    guidedPractice: [
      {
        id: 'work-l2-gp1',
        kind: 'fill-blank',
        prompt: 'Fill in the short, friendly work-chat acknowledgment.',
        sentence: '___, will send it over shortly!',
        answer: 'Noted',
        options: ['Noted', 'Paiseh', 'Steady'],
      },
    ],
    recap: [
      'Learned "Noted" as a quick work-chat acknowledgment',
      'Learned "Arrow" — dumping a task on someone else',
      'Saw them used to confirm a request',
      'Practiced replying naturally',
    ],
  },
  {
    id: 'work-l3',
    missionId: 'work',
    title: 'Lunch & Small Talk',
    order: 3,
    challengeIds: ['work-l3-c1'],
    discover: [
      {
        emoji: '🥡',
        title: 'An easy way to invite someone along',
        body: '"Jio" means to invite someone to join you — casual, warm, and used constantly among colleagues and friends.',
      },
      {
        emoji: '🤝',
        title: 'Why it matters',
        body: 'A hawker centre lunch run is one of the most low-pressure ways to build rapport with a new team — and a well-run lunch outing is exactly the kind of thing that earns someone a "zai" (skilled, on top of things).',
      },
      {
        emoji: '👂',
        title: 'When you\'ll encounter it',
        body: 'Lunch invites, weekend plans, any casual "come along" moment.',
      },
    ],
    phraseIds: ['jio', 'zai'],
    cultureTopicIds: ['lunch-culture'],
    exampleConversation: [
      { from: 'them', speaker: 'Colleague', text: 'Jio you for lunch later, hawker centre okay?' },
      { from: 'you', text: 'Sure, I\'m in! You always know the best stalls.' },
      { from: 'them', speaker: 'Colleague', text: 'Ha, I try — gotta stay zai around here.' },
    ],
    guidedPractice: [
      {
        id: 'work-l3-gp1',
        kind: 'tap-phrase',
        prompt: 'Tap the word for inviting someone along.',
        phraseId: 'jio',
        distractorPhraseIds: ['noted', 'on-the-dot'],
      },
    ],
    recap: [
      'Learned "Jio" — inviting someone along',
      'Learned "Zai" — skilled, on top of things',
      'Saw them used in a team lunch invite',
      'Practiced spotting the word',
    ],
  },
  {
    id: 'work-l4',
    missionId: 'work',
    title: 'Mission Challenge',
    order: 4,
    challengeIds: ['work-l4-c1', 'work-l4-c2'],
    discover: [
      {
        emoji: '🏢',
        title: 'A day at the office',
        body: 'On the dot, noted, arrow, jio, zai — this challenge strings them into one ordinary work day, meeting to lunch to end-of-day chat.',
      },
      {
        emoji: '🧭',
        title: 'Your actual compass',
        body: 'These are starting defaults, not a fixed rulebook — every team has its own texture. The real skill is paying attention to how yours specifically operates, and adjusting from there.',
      },
    ],
    phraseIds: ['noted', 'jio'],
    recap: [
      'Reviewed everything from Work Like a Local',
      'Put it all together across one work day',
    ],
  },
];
