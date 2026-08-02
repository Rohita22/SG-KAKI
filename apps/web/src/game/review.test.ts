import { describe, expect, it, vi, afterEach } from 'vitest';
import { pickReviewPhrase } from './review';
import type { Phrase, ProgressState } from '@/content/types';

function baseState(overrides: Partial<ProgressState> = {}): ProgressState {
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
    phraseMastery: {},
    ...overrides,
  };
}

function phrase(id: string): Phrase {
  return {
    id,
    word: id,
    pronunciation: id,
    phonetic: id,
    meaning: id,
    category: 'lingo',
    difficulty: 1,
    usedIn: [],
    examples: [],
    missionId: 'speak',
  };
}

const phrases = [phrase('p1'), phrase('p2'), phrase('p3')];

afterEach(() => {
  vi.restoreAllMocks();
});

describe('pickReviewPhrase', () => {
  it('returns undefined when nothing is unlocked yet', () => {
    expect(pickReviewPhrase(baseState(), phrases)).toBeUndefined();
  });

  it('returns undefined when every unlocked phrase is excluded', () => {
    const state = baseState({ unlockedPhraseIds: ['p1'] });
    expect(pickReviewPhrase(state, phrases, ['p1'])).toBeUndefined();
  });

  it('only ever picks from unlocked, non-excluded phrases', () => {
    const state = baseState({
      unlockedPhraseIds: ['p1', 'p2', 'p3'],
      phraseMastery: { p1: 3, p2: 3, p3: 3 },
    });
    for (let i = 0; i < 20; i++) {
      const picked = pickReviewPhrase(state, phrases, ['p2']);
      expect(picked?.id).not.toBe('p2');
    }
  });

  it('weights toward lower-mastery phrases', () => {
    const state = baseState({
      unlockedPhraseIds: ['p1', 'p2'],
      phraseMastery: { p1: 1, p2: 5 },
    });
    vi.spyOn(Math, 'random').mockReturnValue(0);
    // With p1 weight 5 and p2 weight 1, index 0 of the weighted array is p1.
    expect(pickReviewPhrase(state, phrases)?.id).toBe('p1');
  });
});
