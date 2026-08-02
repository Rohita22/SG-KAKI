import type { Lesson } from '@/content/types';

export const vibeLessons: Lesson[] = [
  {
    id: 'vibe-l1',
    missionId: 'vibe',
    title: 'Queueing & Waiting',
    order: 1,
    challengeIds: ['vibe-l1-c1'],
    discover: [
      {
        emoji: '🧍',
        title: 'Queues are taken seriously',
        body: 'People queue for almost everything — food, lifts, buses — even without ropes, signs, or staff enforcing it.',
      },
      {
        emoji: '🙋',
        title: 'Why it matters',
        body: 'Cutting a queue, even by accident, is a genuine faux pas — it can earn disapproving looks or even a polite-but-firm correction. A quick check before joining avoids the awkwardness entirely.',
      },
      {
        emoji: '👂',
        title: 'When you\'ll encounter it',
        body: 'Hawker stalls, popular shops, lifts during busy hours — queues form fast and quietly.',
      },
    ],
    phraseIds: ['queue'],
    cultureTopicIds: ['queue-etiquette', 'fines-and-public-rules'],
    exampleConversation: [
      { from: 'you', text: 'Excuse me, is this the queue for chicken rice?' },
      { from: 'them', speaker: 'Stranger', text: 'Yes, just join at the back!' },
    ],
    guidedPractice: [
      {
        id: 'vibe-l1-gp1',
        kind: 'tap-phrase',
        prompt: 'Tap the word for a line of people waiting.',
        phraseId: 'queue',
        distractorPhraseIds: ['wah', 'jio'],
      },
    ],
    recap: [
      'Learned "Queue" and why it\'s taken seriously here',
      'Saw how to politely check before joining one',
      'Practiced spotting the word',
    ],
  },
  {
    id: 'vibe-l2',
    missionId: 'vibe',
    title: 'Read the Room',
    order: 2,
    challengeIds: ['vibe-l2-c1', 'vibe-l2-c2'],
    discover: [
      {
        emoji: '🎭',
        title: 'Tone over words',
        body: 'A lot of everyday communication leans on tone and understatement rather than saying things directly.',
      },
      {
        emoji: '🤔',
        title: 'Why it matters',
        body: '"Can lah, not bad" genuinely means good — reading disappointment into a low-key delivery will lead you astray.',
      },
      {
        emoji: '👂',
        title: 'When you\'ll encounter it',
        body: 'Feedback on food, plans, or how someone\'s day went — casual check-ins of all kinds.',
      },
    ],
    phraseIds: ['not-bad'],
    exampleConversation: [
      { from: 'you', text: 'Was the food okay? Let me know if anything was off!' },
      { from: 'them', speaker: 'Friend', text: 'Can lah, not bad.' },
    ],
    guidedPractice: [
      {
        id: 'vibe-l2-gp1',
        kind: 'fill-blank',
        prompt: 'Fill in the classic understatement that actually means "pretty good."',
        sentence: 'Can lah, ___.',
        answer: 'not bad',
        options: ['not bad', 'paiseh', 'kiasu'],
      },
    ],
    recap: [
      'Learned "Not Bad" as a genuine compliment, not a complaint',
      'Saw understatement play out in real feedback',
      'Practiced reading the tone correctly',
    ],
  },
  {
    id: 'vibe-l3',
    missionId: 'vibe',
    title: 'Personal Space & Politeness',
    order: 3,
    challengeIds: ['vibe-l3-c1'],
    discover: [
      {
        emoji: '🤝',
        title: 'Small, warm courtesies',
        body: 'Addressing an older stranger as "Auntie" or "Uncle" is a common, respectful way to speak to someone clearly older than you.',
      },
      {
        emoji: '💬',
        title: 'Why it matters',
        body: 'It reads as warm and familiar, not disrespectful — using someone\'s actual name (which you likely don\'t know) would feel odd instead.',
      },
      {
        emoji: '🤏',
        title: 'A note on personal space',
        body: 'Singaporeans are warm but not huggy with acquaintances — a handshake or a nod beats an enthusiastic hug when you\'re still getting to know someone.',
      },
      {
        emoji: '👂',
        title: 'When you\'ll encounter it',
        body: 'Hawker stall owners, cleaners, any older stranger you need to address quickly.',
      },
    ],
    phraseIds: ['auntie-uncle', 'kaypoh'],
    cultureTopicIds: ['shared-spaces'],
    exampleConversation: [
      { from: 'you', text: 'Auntie, one kopi peng please!' },
      { from: 'them', speaker: 'Auntie', text: 'Okay, wait ah! Eh, you new here ah? Where you from?' },
      { from: 'you', text: 'Wah, so kaypoh! Haha, just moved here.' },
    ],
    guidedPractice: [
      {
        id: 'vibe-l3-gp1',
        kind: 'tap-phrase',
        prompt: 'Tap the respectful way to address a hawker stall owner clearly older than you.',
        phraseId: 'auntie-uncle',
        distractorPhraseIds: ['wah', 'noted'],
      },
    ],
    recap: [
      'Learned "Auntie / Uncle" as a respectful address',
      'Learned "Kaypoh" — a friendly busybody',
      'Saw it used ordering food',
      'Practiced picking the right term',
    ],
  },
  {
    id: 'vibe-l4',
    missionId: 'vibe',
    title: 'Invitations & Small Talk',
    order: 4,
    challengeIds: ['vibe-l4-c1'],
    discover: [
      {
        emoji: '😲',
        title: 'The everyday exclamation',
        body: '"Wah" expresses surprise, enthusiasm, or admiration — it shows up in nearly any reaction, big or small.',
      },
      {
        emoji: '🙂',
        title: 'Why it matters',
        body: 'Matching that casual enthusiasm keeps an invitation or plan feeling warm and easy, not stiff — and if you\'re ever left out of one, "bo jio" is the perfect (fake-outraged) response.',
      },
      {
        emoji: '👂',
        title: 'When you\'ll encounter it',
        body: 'Reacting to plans, food, news — almost anything worth a reaction at all. Weekend plans are usually just "lepak" — no fixed agenda.',
      },
    ],
    phraseIds: ['wah', 'bo-jio', 'lepak'],
    exampleConversation: [
      { from: 'them', speaker: 'Colleague', text: 'Eh you free this weekend? Thinking of makan somewhere new.' },
      { from: 'you', text: 'Wah, sounds good, where you thinking?' },
      { from: 'them', speaker: 'Colleague', text: 'Not sure yet, maybe just lepak first then decide.' },
    ],
    guidedPractice: [
      {
        id: 'vibe-l4-gp1',
        kind: 'rearrange',
        prompt: 'Rearrange the words into an enthusiastic reply to an invitation.',
        correctOrder: ['Wah,', 'sounds', 'good,', 'where', 'you', 'thinking?'],
      },
    ],
    recap: [
      'Learned "Wah," "Bo Jio," and "Lepak"',
      'Saw them used to respond to an invitation warmly',
      'Practiced building an enthusiastic reply',
    ],
  },
  {
    id: 'vibe-l5',
    missionId: 'vibe',
    title: 'Mission Challenge',
    order: 5,
    challengeIds: ['vibe-l5-c1'],
    discover: [
      {
        emoji: '🧩',
        title: 'Let\'s put it together',
        body: 'Queue, not bad, Auntie/Uncle, kaypoh, wah, bo jio, lepak — this challenge brings the social vibes together in one flow.',
      },
      {
        emoji: '👀',
        title: 'A quick refresher',
        body: 'Read the room, not just the words — indirectness here is a communication style, not a lack of honesty.',
      },
    ],
    phraseIds: ['queue', 'wah'],
    recap: [
      'Reviewed everything from Vibe Like a Local',
      'Put the social cues together in one scenario',
    ],
  },
];
