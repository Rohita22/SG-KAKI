import type { Lesson } from '@/content/types';

export const speakLessons: Lesson[] = [
  {
    id: 'speak-l1',
    missionId: 'speak',
    title: 'Can, Cannot, Can Lah',
    order: 1,
    challengeIds: ['speak-l1-c1', 'speak-l1-c2'],
    discover: [
      {
        emoji: '💬',
        title: 'The most useful word in Singlish',
        body: "\"Can\" does a lot of work here. It's not just the English modal verb — on its own, it's a complete, upbeat \"yes.\"",
      },
      {
        emoji: '🤝',
        title: 'Why it matters',
        body: "You'll hear it constantly — from a colleague confirming a meeting to a hawker stall confirming your order. Recognising it instantly saves you a beat of confusion.",
      },
      {
        emoji: '👂',
        title: 'When you\'ll hear it',
        body: 'Anywhere something is being confirmed or agreed to — work chats, food orders, casual plans.',
      },
    ],
    phraseIds: ['can'],
    exampleConversation: [
      { from: 'them', speaker: 'Colleague', text: 'Can you push our call to 3pm?' },
      { from: 'you', text: 'Can!' },
      { from: 'them', speaker: 'Colleague', text: 'Great, see you then.' },
    ],
    guidedPractice: [
      {
        id: 'speak-l1-gp1',
        kind: 'tap-phrase',
        prompt: 'Tap the word that means "yes, sure, no problem."',
        phraseId: 'can',
        distractorPhraseIds: ['lah', 'blur'],
      },
    ],
    recap: [
      'Learned "Can" — a full, upbeat "yes"',
      'Saw it used to confirm a meeting time',
      'Practiced spotting it in a quick exchange',
    ],
  },
  {
    id: 'speak-l2',
    missionId: 'speak',
    title: 'Lah, Leh, Lor',
    order: 2,
    challengeIds: ['speak-l2-c1', 'speak-l2-c2'],
    discover: [
      {
        emoji: '🎵',
        title: 'Particles carry tone, not meaning',
        body: '"Lah," "leh," and "lor" don\'t translate word-for-word — they colour how a sentence feels: softer, questioning, or easygoing.',
      },
      {
        emoji: '🤷',
        title: 'Why it matters',
        body: 'Getting the particle right changes how a sentence lands emotionally — "lor" reads as a shrug, "lah" as reassurance.',
      },
      {
        emoji: '👂',
        title: 'When you\'ll hear it',
        body: 'Constantly, in almost any casual conversation — texts, hawker chats, quick plans.',
      },
    ],
    phraseIds: ['lah', 'lor'],
    exampleConversation: [
      { from: 'them', speaker: 'Friend', text: 'Eh, movie got later showing leh, wanna catch that instead?' },
      { from: 'you', text: 'Okay lor, you decide.' },
      { from: 'them', speaker: 'Friend', text: 'Steady, see you at 8 lah!' },
    ],
    guidedPractice: [
      {
        id: 'speak-l2-gp1',
        kind: 'fill-blank',
        prompt: 'Fill in the most natural word to reassure a friend you\'re coming.',
        sentence: 'Wait for me ___, almost there!',
        answer: 'lah',
        options: ['lah', 'lor', 'meh'],
      },
    ],
    recap: [
      'Learned "Lah" (reassurance) and "Lor" (easy acceptance)',
      'Heard both in a casual back-and-forth',
      'Practiced picking the right particle for the tone',
    ],
  },
  {
    id: 'speak-l3',
    missionId: 'speak',
    title: 'Everyday Words',
    order: 3,
    challengeIds: ['speak-l3-c1', 'speak-l3-c2'],
    discover: [
      {
        emoji: '👂',
        title: 'Understand first, speak later',
        body: "You'll hear these words constantly well before you'd ever need to say them yourself — that's exactly the point.",
      },
      {
        emoji: '😋',
        title: 'Why it matters',
        body: 'Missing "shiok," "paiseh," or "alamak" in conversation means missing the emotional beat of what someone just told you.',
      },
      {
        emoji: '🗓️',
        title: 'When you\'ll hear it',
        body: 'Food reactions, casual apologies, sudden bad news, everyday small talk with friends and colleagues.',
      },
    ],
    phraseIds: ['shiok', 'paiseh', 'alamak'],
    exampleConversation: [
      { from: 'them', speaker: 'Friend', text: 'Just tried the laksa here — so shiok!' },
      { from: 'you', text: 'Paiseh, I already ate. Next time!' },
      { from: 'them', speaker: 'Friend', text: 'Alamak, and it just sold out too!' },
    ],
    guidedPractice: [
      {
        id: 'speak-l3-gp1',
        kind: 'match-pronunciation',
        prompt: 'Tap the word that sounds like "shee-ohk."',
        phraseId: 'shiok',
        distractorPhraseIds: ['paiseh', 'kiasu'],
      },
    ],
    recap: [
      'Learned "Shiok" (satisfying/great), "Paiseh" (embarrassed/light apology), and "Alamak" (oh no!)',
      'Saw all three used in a real reaction',
      'Practiced matching a word to its sound',
    ],
  },
  {
    id: 'speak-l4',
    missionId: 'speak',
    title: 'Kiasu, Blur & Steady',
    order: 4,
    challengeIds: ['speak-l4-c1', 'speak-l4-c2'],
    discover: [
      {
        emoji: '🏃',
        title: 'Self-aware, not harsh',
        body: '"Kiasu," "blur," and "siao" describe very relatable habits — the fear of missing out, being out of the loop, or just being a bit wild — usually said with a smile.',
      },
      {
        emoji: '🙂',
        title: 'Why it matters',
        body: "They're used affectionately, even about yourself. Taking them as a real insult would be missing the tone — and \"steady\" flips the mood entirely, since it's pure approval.",
      },
      {
        emoji: '👂',
        title: 'When you\'ll hear it',
        body: 'Light teasing among friends and colleagues — a long queue, a missed detail, a wild plan, a job well done. "Confirm plus chop" is a fun bonus you\'ll hear too — it just means "100% sure."',
      },
    ],
    phraseIds: ['kiasu', 'blur', 'steady', 'siao'],
    exampleConversation: [
      { from: 'them', speaker: 'Colleague', text: 'Wait which platform ah? I confirm plus chop forgot already.' },
      { from: 'you', text: 'Wah you very blur today ah!' },
      { from: 'them', speaker: 'Colleague', text: 'Found it — steady, let\'s go.' },
    ],
    guidedPractice: [
      {
        id: 'speak-l4-gp1',
        kind: 'rearrange',
        prompt: 'Rearrange the words into a natural, lighthearted tease.',
        correctOrder: ['Wah', 'you', 'very', 'blur', 'today', 'ah'],
      },
    ],
    recap: [
      'Learned "Kiasu" (afraid to lose out), "Blur" (out of the loop), "Steady" (solid/approved), and "Siao" (crazy, said lightly)',
      'Saw them used as light, friendly teasing and praise',
      'Practiced building a natural sentence with "blur"',
    ],
  },
  {
    id: 'speak-l5',
    missionId: 'speak',
    title: 'Mission Challenge',
    order: 5,
    challengeIds: ['speak-l5-c1', 'speak-l5-c2'],
    discover: [
      {
        emoji: '🧩',
        title: 'Let\'s put it together',
        body: 'You\'ve picked up "can," "lah," "lor," "shiok," "paiseh," "alamak," "kiasu," "blur," "steady," and "siao." This challenge mixes them into one natural conversation.',
      },
      {
        emoji: '🗣️',
        title: 'A quick refresher',
        body: 'Singlish blends English with Malay, Hokkien, Tamil, and more — like a little abbreviation secret code that gets the point across fast. It\'s a distinct way of speaking, not "broken English." Recognising it is the real skill.',
      },
    ],
    phraseIds: ['can', 'shiok'],
    recap: [
      'Reviewed everything from Speak Like a Local',
      'Put the words together into one natural exchange',
    ],
  },
];
