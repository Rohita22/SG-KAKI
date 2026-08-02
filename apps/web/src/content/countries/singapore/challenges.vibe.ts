import type { Challenge } from '@/content/types';

export const vibeChallenges: Challenge[] = [
  {
    id: 'vibe-l1-c1',
    lessonId: 'vibe-l1',
    type: 'multiple-choice',
    category: 'socialVibes',
    scene: 'queue',
    context:
      "You arrive at a busy hawker stall and there's an unmarked cluster of people near the counter.",
    prompt: 'What should you do?',
    options: [
      { id: 'a', label: "Ask 'is this the queue?' and join the back" },
      { id: 'b', label: 'Walk straight to the counter and order' },
      { id: 'c', label: "Assume there's no queue without a rope or sign" },
      { id: 'd', label: 'Wait for the vendor to call on you first' },
    ],
    correctOptionId: 'a',
    explanation:
      "Queues aren't always neatly marked, but they're taken seriously. A quick check keeps you from accidentally cutting in — a genuine faux pas here.",
    xp: 10,
    difficulty: 1,
  },
  {
    id: 'vibe-l2-c1',
    lessonId: 'vibe-l2',
    type: 'read-the-room',
    category: 'socialVibes',
    scene: 'chat',
    chatThread: [
      { from: 'you', text: 'Hey! Want to hang out tonight?' },
      { from: 'them', text: 'Maybe next time lah, quite busy now.' },
    ],
    prompt: "What's the best read?",
    options: [
      { id: 'a', label: 'Definitely not interested' },
      { id: 'b', label: 'Busy right now, but open another time' },
      { id: 'c', label: "They're annoyed with you" },
    ],
    correctOptionId: 'b',
    explanation:
      "'Maybe next time lah' is a soft, non-committal decline — it leaves the door open rather than closing it. It's genuinely just about being busy right now.",
    xp: 20,
    difficulty: 2,
  },
  {
    id: 'vibe-l2-c2',
    lessonId: 'vibe-l2',
    type: 'read-the-room',
    category: 'socialVibes',
    scene: 'chat',
    chatThread: [
      {
        from: 'you',
        text: 'Was the food okay? Let me know if anything was off!',
      },
      { from: 'them', text: 'Can lah, not bad.' },
    ],
    prompt: 'How positive is this review, really?',
    options: [
      { id: 'a', label: 'Glowing praise' },
      { id: 'b', label: 'Solidly fine — no real complaints' },
      { id: 'c', label: "A polite way of saying it was bad" },
    ],
    correctOptionId: 'b',
    explanation:
      "'Can' and 'not bad' are classic understatement — this genuinely means it was fine or good, just delivered in a low-key tone. Don't read disappointment into it.",
    xp: 20,
    difficulty: 3,
  },
  {
    id: 'vibe-l3-c1',
    lessonId: 'vibe-l3',
    type: 'scenario-decision',
    category: 'socialVibes',
    scene: 'train',
    context:
      "You're on a crowded train and notice someone's bag is taking up an empty seat.",
    prompt: "What's a polite local move?",
    options: [
      {
        id: 'a',
        label: 'Politely ask them to move the bag, or gesture at the seat',
      },
      { id: 'b', label: 'Stand awkwardly and say nothing' },
      { id: 'c', label: 'Loudly complain to nearby passengers' },
      { id: 'd', label: 'Sit down on top of the bag' },
    ],
    correctOptionId: 'a',
    explanation:
      "A brief, polite word ('excuse me, can I sit?') is completely normal and expected — most people move the bag right away without any fuss.",
    xp: 15,
    difficulty: 2,
  },
  {
    id: 'vibe-l4-c1',
    lessonId: 'vibe-l4',
    type: 'pick-reply',
    category: 'socialVibes',
    scene: 'chat',
    chatThread: [
      {
        from: 'them',
        text: 'Eh you free this weekend? Thinking of makan somewhere new.',
      },
    ],
    prompt: 'Pick the best reply.',
    options: [
      { id: 'a', label: 'Wah sounds good, where you thinking?' },
      { id: 'b', label: "I don't know you well enough to hang out." },
      { id: 'c', label: '(leave it on read)' },
      { id: 'd', label: 'Only if you pay.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Matching casual enthusiasm and asking a quick follow-up keeps the conversation easy and warm — very typical of how invitations play out here.',
    xp: 15,
    difficulty: 1,
  },
  {
    id: 'vibe-l5-c1',
    lessonId: 'vibe-l5',
    type: 'culture-card',
    category: 'socialVibes',
    scene: 'none',
    prompt: 'Read the room, not the words',
    body: "A lot of everyday communication here leans on tone and context rather than saying things directly. That's not evasiveness — it's just a different, softer default. Once you tune into it, it becomes second nature.",
    explanation:
      'Indirectness is a communication style, not a lack of honesty — context usually tells you what you need to know.',
    xp: 5,
    difficulty: 1,
  },
];
