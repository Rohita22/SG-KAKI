import type { Challenge } from '@/content/types';

export const workChallenges: Challenge[] = [
  {
    id: 'work-l1-c1',
    lessonId: 'work-l1',
    type: 'multiple-choice',
    category: 'workCulture',
    scene: 'office',
    context: 'Your 9am team meeting is starting soon.',
    prompt: "What's the expected norm?",
    options: [
      { id: 'a', label: 'Arrive on time, or a couple of minutes early' },
      { id: 'b', label: 'Arriving 10–15 minutes late is normal and fine' },
      { id: 'c', label: 'Meetings rarely start on schedule anyway' },
      { id: 'd', label: "Punctuality doesn't matter much here" },
    ],
    correctOptionId: 'a',
    explanation:
      'Punctuality is generally taken seriously in Singapore workplaces, especially for scheduled meetings — arriving on time reads as basic professionalism.',
    xp: 10,
    difficulty: 1,
  },
  {
    id: 'work-l2-c1',
    lessonId: 'work-l2',
    type: 'pick-reply',
    category: 'workCulture',
    scene: 'chat',
    chatThread: [
      {
        from: 'them',
        text: 'Hey, quick one — can you send me the deck when you get a chance?',
      },
    ],
    prompt: 'Pick the most appropriate reply.',
    options: [
      { id: 'a', label: 'Sure, will send it over shortly!' },
      { id: 'b', label: '(leave it on read until tomorrow)' },
      { id: 'c', label: 'Why are you messaging me after hours?' },
      { id: 'd', label: 'k' },
    ],
    correctOptionId: 'a',
    explanation:
      "A prompt, friendly acknowledgement is the norm for work chats — you don't need to respond instantly, but a quick reply confirming you saw it goes a long way.",
    xp: 15,
    difficulty: 1,
  },
  {
    id: 'work-l3-c1',
    lessonId: 'work-l3',
    type: 'scenario-decision',
    category: 'workCulture',
    scene: 'street',
    context:
      'A colleague invites you to join a hawker centre lunch run with the team.',
    prompt: "What's a good approach?",
    options: [
      {
        id: 'a',
        label: "Join if you can — it's an easy way to build relationships",
      },
      { id: 'b', label: 'Always eat alone at your desk to save time' },
      { id: 'c', label: 'Only join if you already know everyone well' },
      { id: 'd', label: 'Decline — lunch is only for senior staff' },
    ],
    correctOptionId: 'a',
    explanation:
      "Team lunches, especially hawker runs, are a low-pressure way to build rapport with colleagues — often more relaxed than in-office small talk.",
    xp: 15,
    difficulty: 1,
  },
  {
    id: 'work-l4-c1',
    lessonId: 'work-l4',
    type: 'can-cannot',
    category: 'workCulture',
    scene: 'office',
    context: "You disagree with a colleague's approach during a meeting.",
    prompt: 'Can you raise a differing view respectfully?',
    options: [
      { id: 'can', label: 'Can' },
      { id: 'cannot', label: 'Cannot' },
    ],
    correctOptionId: 'can',
    explanation:
      'Constructive feedback is generally welcome when it\'s framed respectfully — though very blunt public disagreement is less common, so tone and timing matter.',
    xp: 10,
    difficulty: 2,
  },
  {
    id: 'work-l4-c2',
    lessonId: 'work-l4',
    type: 'culture-card',
    category: 'workCulture',
    scene: 'none',
    prompt: 'Workplace norms vary by team',
    body: "Hierarchy and communication style can vary a lot between industries and even individual teams here. A multinational tech startup and a traditional family business will feel quite different — pay attention to how your specific team operates.",
    explanation:
      'Broad norms are a starting point, not a fixed rulebook — every workplace has its own texture.',
    xp: 5,
    difficulty: 1,
  },
];
