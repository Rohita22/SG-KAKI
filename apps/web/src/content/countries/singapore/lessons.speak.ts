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
        tag: 'WORD OF THE LESSON',
        word: '“Can”',
        phraseId: 'can',
        title: 'The most useful word in Singlish',
        body: '"Can" does a lot of work here. It\'s not just the English modal verb — on its own, it\'s a complete, upbeat "yes."',
        sections: [
          {
            icon: '✨',
            title: 'Why it matters',
            body: 'It shows ability, possibility, permission, and willingness — all in one tiny word.'
          },
          {
            icon: '⭐',
            title: 'Examples',
            list: [
              'Can or not?',
              'I can help.',
              'Can lah!'
            ]
          }
        ]
      }
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
        tag: 'WORD OF THE LESSON',
        word: '“Lah”',
        phraseId: 'lah',
        title: 'Particles carry tone, not meaning',
        body: 'Particles like "Lah" don\'t translate word-for-word — they colour how a sentence feels. "Lah" adds reassurance or finality to a sentence.',
        sections: [
          {
            icon: '✨',
            title: 'Why it matters',
            body: 'Getting the particle right changes how a sentence lands emotionally. "Lah" reads as reassurance or light emphasis.'
          },
          {
            icon: '⭐',
            title: 'Examples',
            list: [
              'Don\'t worry lah.',
              'Okay lah, let\'s go.',
              'Very good lah!'
            ]
          }
        ]
      },
      {
        tag: 'WORD OF THE LESSON',
        word: '“Lor”',
        phraseId: 'lor',
        title: 'The casual shrug',
        body: '"Lor" is another particle that changes the emotional beat — it conveys a sense of easygoing acceptance, resignation, or stating the obvious.',
        sections: [
          {
            icon: '✨',
            title: 'Why it matters',
            body: 'Using "lor" softens a statement so it doesn\'t sound aggressive. It\'s the verbal equivalent of a shrug.'
          },
          {
            icon: '⭐',
            title: 'Examples',
            list: [
              'Okay lor, you decide.',
              'Like that lor.',
              'Nothing to do lor.'
            ]
          }
        ]
      },
      {
        tag: 'WORD OF THE LESSON',
        word: '“Leh”',
        phraseId: 'leh',
        title: 'The gentle nudge',
        body: '"Leh" is softer than "lah" — it floats a suggestion or a mild objection without any real pressure behind it.',
        sections: [
          {
            icon: '✨',
            title: 'Why it matters',
            body: 'It keeps a suggestion low-stakes. Nobody\'s pushing you — they\'re just putting an option on the table.'
          },
          {
            icon: '⭐',
            title: 'Examples',
            list: [
              'Movie got later showing leh.',
              'Quite expensive leh.',
              'Can try leh, why not.'
            ]
          }
        ]
      }
    ],
    phraseIds: ['lah', 'lor', 'leh'],
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
      'Learned "Lah" (reassurance), "Lor" (easy acceptance), and "Leh" (gentle nudge)',
      'Heard all three in a casual back-and-forth',
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
        tag: 'WORD OF THE LESSON',
        word: '“Shiok”',
        phraseId: 'shiok',
        title: 'The ultimate satisfaction',
        body: 'This is the go-to word when something is intensely pleasurable, usually describing delicious food, a great massage, or a cold drink on a hot day.',
        sections: [
          {
            icon: '✨',
            title: 'Why it matters',
            body: 'It\'s the highest compliment you can give a hawker about their food!'
          },
          {
            icon: '⭐',
            title: 'Examples',
            list: [
              'This laksa is damn shiok!',
              'Wah, so shiok.',
              'Eat until shiok.'
            ]
          }
        ]
      },
      {
        tag: 'WORD OF THE LESSON',
        word: '“Paiseh”',
        phraseId: 'paiseh',
        title: 'The polite apology',
        body: 'A Hokkien term meaning embarrassed or shy. It\'s used as a light apology, similar to "my bad" or "excuse me."',
        sections: [
          {
            icon: '✨',
            title: 'Why it matters',
            body: 'It softens social interactions. Say it when you bump into someone, are running late, or need to ask a favour.'
          },
          {
            icon: '⭐',
            title: 'Examples',
            list: [
              'Paiseh, I\'m late!',
              'Abit paiseh to ask...',
              'Paiseh ah, excuse me.'
            ]
          }
        ]
      },
      {
        tag: 'WORD OF THE LESSON',
        word: '“Alamak”',
        phraseId: 'alamak',
        title: 'The universal "Oh no!"',
        body: 'An exclamation of shock, dismay, or surprise. It\'s the direct equivalent of "Oh my goodness" or "Oops!"',
        sections: [
          {
            icon: '✨',
            title: 'Why it matters',
            body: 'It\'s a dramatic, fun way to express mild frustration or sudden realization in casual settings.'
          },
          {
            icon: '⭐',
            title: 'Examples',
            list: [
              'Alamak, I forgot my wallet!',
              'Alamak, so expensive!',
              'Alamak, rain again.'
            ]
          }
        ]
      },
      {
        tag: 'WORD OF THE LESSON',
        word: '“Makan”',
        phraseId: 'makan',
        title: 'The word behind every food plan',
        body: 'Malay for "eat" — but in everyday Singapore English it covers both the verb and the noun. Ask "Makan already?" and you\'re really asking "Have you eaten?"',
        sections: [
          {
            icon: '✨',
            title: 'Why it matters',
            body: 'It\'s probably the single most-used word in this whole app — every plan eventually turns into a plan to makan.'
          },
          {
            icon: '⭐',
            title: 'Examples',
            list: [
              'Makan already or not?',
              'Where to makan later?',
              'Jio you for makan!'
            ]
          }
        ]
      }
    ],
    phraseIds: ['shiok', 'paiseh', 'alamak', 'makan'],
    exampleConversation: [
      { from: 'them', speaker: 'Friend', text: 'Just tried the laksa here — so shiok!' },
      { from: 'you', text: 'Paiseh, I already ate. Next time!' },
      { from: 'them', speaker: 'Friend', text: 'Alamak, and it just sold out too! Makan somewhere else next week?' },
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
      'Learned "Shiok" (satisfying/great), "Paiseh" (embarrassed/light apology), "Alamak" (oh no!), and "Makan" (eat/food)',
      'Saw all four used in a real reaction',
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
        tag: 'WORD OF THE LESSON',
        word: '“Kiasu”',
        phraseId: 'kiasu',
        title: 'The fear of missing out',
        body: 'Literally "fear of losing." It describes the competitive, anxious drive to always get the best deal, reserve the best seat, or be first in line.',
        sections: [
          {
            icon: '✨',
            title: 'Why it matters',
            body: 'It\'s a defining trait of local culture, often used affectionately to tease friends who go to extremes to not miss out.'
          },
          {
            icon: '⭐',
            title: 'Examples',
            list: [
              'Don\'t be so kiasu lah!',
              'Very kiasu, queue since 6am.',
              'Kiasu culture.'
            ]
          }
        ]
      },
      {
        tag: 'WORD OF THE LESSON',
        word: '“Blur”',
        phraseId: 'blur',
        title: 'Clueless and confused',
        body: 'Used to describe someone who is out of the loop, slow to catch on, or just spaced out. Often paired with "sotong" (squid).',
        sections: [
          {
            icon: '✨',
            title: 'Why it matters',
            body: 'It\'s a lighthearted, harmless tease among friends when someone misses an obvious detail.'
          },
          {
            icon: '⭐',
            title: 'Examples',
            list: [
              'Wah, you very blur today ah!',
              'Act blur, live longer.',
              'Blur like sotong.'
            ]
          }
        ]
      },
      {
        tag: 'WORD OF THE LESSON',
        word: '“Steady”',
        phraseId: 'steady',
        title: 'Solid and dependable',
        body: 'A term of high praise meaning someone is capable, reliable, or agreeable to a plan.',
        sections: [
          {
            icon: '✨',
            title: 'Why it matters',
            body: 'It\'s pure approval. If you agree to a plan or do someone a solid favour, they\'ll call you "steady."'
          },
          {
            icon: '⭐',
            title: 'Examples',
            list: [
              'Steady lah, bro!',
              'Wow, very steady.',
              'Steady pom pi pi.'
            ]
          }
        ]
      },
      {
        tag: 'WORD OF THE LESSON',
        word: '“Siao”',
        phraseId: 'siao',
        title: 'Crazy or out of mind',
        body: 'Hokkien for crazy. It\'s used as a dramatic reaction to an absurd request, a ridiculous price, or a wild idea.',
        sections: [
          {
            icon: '✨',
            title: 'Why it matters',
            body: 'Mostly used playfully between friends to express disbelief. Avoid using it with strangers or bosses!'
          },
          {
            icon: '⭐',
            title: 'Examples',
            list: [
              'You siao ah?',
              'Work until siao.',
              'Siao liao (going crazy).'
            ]
          }
        ]
      }
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
        emoji: '🎤',
        title: 'Your Singlish starter pack',
        body: '"Can," "lah," "lor," "leh," "shiok," "paiseh," "alamak," "makan," "kiasu," "blur," "steady," "siao" — twelve words down. Time to hear them all fired off in one real conversation.',
      },
      {
        emoji: '🗝️',
        title: 'The one thing to remember',
        body: 'It\'s a secret code, not broken English — English mixed with Malay, Hokkien, Tamil, and more, built by generations of Singaporeans switching languages mid-sentence. You don\'t need to speak it perfectly. Recognising it is the real skill.',
      },
    ],
    phraseIds: ['can', 'shiok'],
    recap: [
      'Reviewed everything from Speak Like a Local',
      'Put the words together into one natural exchange',
    ],
  },
];
