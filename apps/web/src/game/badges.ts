import type { CountryPack, ProgressState } from '@/content/types';
import { calculateSavvy } from './savvy';

type BadgePredicate = (progress: ProgressState, content: CountryPack) => boolean;

const BADGE_PREDICATES: Record<string, BadgePredicate> = {
  'can-lah': (p) => p.completedMissionIds.includes('speak'),
  'makan-pro': (p) => p.completedMissionIds.includes('eat'),
  'mrt-master': (p) => p.completedMissionIds.includes('move'),
  'chope-champion': (p) => p.completedLessonIds.includes('eat-l2'),
  'kopi-expert': (p) => p.completedLessonIds.includes('eat-l3'),
  'read-the-room-badge': (p, content) =>
    content.challenges.some(
      (c) => c.type === 'read-the-room' && p.completedChallengeIds.includes(c.id),
    ),
  'on-fire': (p) => p.streakDays >= 3,
  'sg-savvy-badge': (p, content) =>
    calculateSavvy(p.completedChallengeIds, content.challenges).overall >= 50,
  'phrase-collector': (p) => p.unlockedPhraseIds.length >= 10,
  'phrase-master': (p) => p.unlockedPhraseIds.length >= 30,
  'culture-scholar': (p, content) =>
    content.cultureTopics.length > 0 &&
    p.unlockedCultureTopicIds.length >= content.cultureTopics.length,
};

/** Returns badge ids that are newly satisfied and not yet in earnedBadgeIds. */
export function evaluateNewBadges(
  progress: ProgressState,
  content: CountryPack,
): string[] {
  const earned = new Set(progress.earnedBadgeIds);
  return content.badges
    .filter((b) => !earned.has(b.id))
    .filter((b) => BADGE_PREDICATES[b.id]?.(progress, content))
    .map((b) => b.id);
}
