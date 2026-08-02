import type { Challenge } from '@/content/types';
import { speakChallenges } from './challenges.speak';
import { eatChallenges } from './challenges.eat';
import { moveChallenges } from './challenges.move';
import { vibeChallenges } from './challenges.vibe';
import { workChallenges } from './challenges.work';
import { reallifeChallenges } from './challenges.reallife';

export const challenges: Challenge[] = [
  ...speakChallenges,
  ...eatChallenges,
  ...moveChallenges,
  ...vibeChallenges,
  ...workChallenges,
  ...reallifeChallenges,
];
