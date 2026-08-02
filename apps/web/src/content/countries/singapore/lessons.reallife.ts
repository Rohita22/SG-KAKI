import type { Lesson } from '@/content/types';

// Real Life Mode is an explicit cumulative remix/final exam — it keeps its existing
// pure-assessment flow with no Discover/new phrases (see plan §Context).
export const reallifeLessons: Lesson[] = [
  {
    id: 'reallife-l1',
    missionId: 'reallife',
    title: 'Real Life Mode',
    order: 1,
    challengeIds: [
      'reallife-l1-c1',
      'reallife-l1-c2',
      'reallife-l1-c3',
      'reallife-l1-c4',
      'reallife-l1-c5',
    ],
  },
];
