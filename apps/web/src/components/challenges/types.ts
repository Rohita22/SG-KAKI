import type { Challenge } from '@/content/types';

export interface ChallengeResult {
  isCorrect: boolean;
  xpAwarded: number;
}

export interface ChallengeComponentProps<T extends Challenge = Challenge> {
  challenge: T;
  onCheck: (result: ChallengeResult) => void;
}
