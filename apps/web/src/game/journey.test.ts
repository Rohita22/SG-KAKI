import { describe, expect, it } from 'vitest';
import { calculateJourneyProgress } from './journey';
import type { CountryPack, ProgressState } from '@/content/types';

function baseState(): ProgressState {
  return {
    schemaVersion: 1,
    xp: 0,
    streakDays: 0,
    lastActiveDate: '',
    completedChallengeIds: [],
    completedLessonIds: [],
    completedMissionIds: [],
    unlockedMissionIds: ['m1'],
    earnedBadgeIds: [],
    aiPracticeHistory: {},
    unlockedPhraseIds: [],
    unlockedCultureTopicIds: [],
    phraseMastery: {},
  };
}

const content: CountryPack = {
  id: 'test',
  name: 'Test',
  missions: [
    {
      id: 'm1',
      title: 'M1',
      icon: '🎯',
      category: 'lingo',
      subtitle: '',
      order: 1,
      prerequisiteMissionIds: [],
      lessonIds: ['l1', 'l2'],
      completionXp: 100,
    },
    {
      id: 'm2',
      title: 'M2',
      icon: '🎯',
      category: 'lingo',
      subtitle: '',
      order: 2,
      prerequisiteMissionIds: ['m1'],
      lessonIds: ['l3', 'l4'],
      completionXp: 100,
    },
  ],
  lessons: [],
  challenges: [],
  badges: [],
  levels: [],
  aiScenarios: [],
  phrases: [],
  cultureTopics: [],
};

describe('calculateJourneyProgress', () => {
  it('is 0 with no progress', () => {
    expect(calculateJourneyProgress(baseState(), content)).toBe(0);
  });

  it('gives partial credit for an unlocked, in-progress mission', () => {
    const state = { ...baseState(), completedLessonIds: ['l1'] };
    // m1 half-done (1/2 lessons) out of 2 missions total = 25%
    expect(calculateJourneyProgress(state, content)).toBe(25);
  });

  it('gives full credit for a completed mission', () => {
    const state = {
      ...baseState(),
      completedLessonIds: ['l1', 'l2'],
      completedMissionIds: ['m1'],
    };
    expect(calculateJourneyProgress(state, content)).toBe(50);
  });

  it('reaches 100 when every mission is completed', () => {
    const state = {
      ...baseState(),
      completedLessonIds: ['l1', 'l2', 'l3', 'l4'],
      completedMissionIds: ['m1', 'm2'],
      unlockedMissionIds: ['m1', 'm2'],
    };
    expect(calculateJourneyProgress(state, content)).toBe(100);
  });

  it('diverges from a challenge-based savvy score by design', () => {
    // No challenges completed at all, but a mission is fully done (lessons complete
    // without any challenge-level tracking in this fixture) — journey progress should
    // still reflect mission completion independent of challenge counts.
    const state = {
      ...baseState(),
      completedLessonIds: ['l1', 'l2'],
      completedMissionIds: ['m1'],
    };
    const journey = calculateJourneyProgress(state, content);
    expect(journey).toBe(50);
    expect(state.completedChallengeIds).toHaveLength(0);
  });
});
