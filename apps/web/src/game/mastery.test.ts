import { describe, expect, it } from 'vitest';
import { incrementMastery, masteryLabel, seedMastery } from './mastery';
import type { ProgressState } from '@/content/types';

function baseState(mastery: Record<string, number> = {}): ProgressState {
  return {
    schemaVersion: 1,
    xp: 0,
    streakDays: 0,
    lastActiveDate: '',
    completedChallengeIds: [],
    completedLessonIds: [],
    completedMissionIds: [],
    unlockedMissionIds: [],
    earnedBadgeIds: [],
    aiPracticeHistory: {},
    unlockedPhraseIds: [],
    unlockedCultureTopicIds: [],
    phraseMastery: mastery,
  };
}

describe('seedMastery', () => {
  it('seeds an untracked phrase at level 1', () => {
    expect(seedMastery({}, 'p1')).toEqual({ p1: 1 });
  });

  it('leaves an already-tracked phrase untouched', () => {
    expect(seedMastery({ p1: 3 }, 'p1')).toEqual({ p1: 3 });
  });
});

describe('incrementMastery', () => {
  it('bumps an untracked phrase to 1', () => {
    const next = incrementMastery(baseState(), 'p1');
    expect(next.phraseMastery.p1).toBe(1);
  });

  it('bumps an existing phrase by one', () => {
    const next = incrementMastery(baseState({ p1: 2 }), 'p1');
    expect(next.phraseMastery.p1).toBe(3);
  });

  it('caps at 5 and returns the same state reference once maxed', () => {
    const state = baseState({ p1: 5 });
    const next = incrementMastery(state, 'p1');
    expect(next.phraseMastery.p1).toBe(5);
    expect(next).toBe(state);
  });
});

describe('masteryLabel', () => {
  it('labels 1-2 as Learning, 3-4 as Comfortable, 5 as Confident', () => {
    expect(masteryLabel(0)).toBe('Learning');
    expect(masteryLabel(2)).toBe('Learning');
    expect(masteryLabel(3)).toBe('Comfortable');
    expect(masteryLabel(4)).toBe('Comfortable');
    expect(masteryLabel(5)).toBe('Confident');
  });
});
