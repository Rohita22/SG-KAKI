import { describe, expect, it } from 'vitest';
import { applyChallengeCompletion } from './progression';
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
      title: 'Mission 1',
      icon: '🎯',
      category: 'lingo',
      subtitle: '',
      order: 1,
      prerequisiteMissionIds: [],
      lessonIds: ['l1'],
      completionXp: 100,
    },
    {
      id: 'm2',
      title: 'Mission 2',
      icon: '🎯',
      category: 'lingo',
      subtitle: '',
      order: 2,
      prerequisiteMissionIds: ['m1'],
      lessonIds: ['l2'],
      completionXp: 100,
    },
  ],
  lessons: [
    {
      id: 'l1',
      missionId: 'm1',
      title: 'Lesson 1',
      order: 1,
      challengeIds: ['c1', 'c2'],
      phraseIds: ['p1'],
      cultureTopicIds: ['ct1'],
    },
    { id: 'l2', missionId: 'm2', title: 'Lesson 2', order: 1, challengeIds: ['c3'] },
  ],
  challenges: [
    {
      id: 'c1',
      lessonId: 'l1',
      type: 'multiple-choice',
      category: 'lingo',
      scene: 'none',
      prompt: '',
      options: [{ id: 'a', label: 'a' }],
      correctOptionId: 'a',
      explanation: '',
      xp: 10,
      difficulty: 1,
    },
    {
      id: 'c2',
      lessonId: 'l1',
      type: 'multiple-choice',
      category: 'lingo',
      scene: 'none',
      prompt: '',
      options: [{ id: 'a', label: 'a' }],
      correctOptionId: 'a',
      explanation: '',
      xp: 10,
      difficulty: 1,
    },
    {
      id: 'c3',
      lessonId: 'l2',
      type: 'multiple-choice',
      category: 'lingo',
      scene: 'none',
      prompt: '',
      options: [{ id: 'a', label: 'a' }],
      correctOptionId: 'a',
      explanation: '',
      xp: 10,
      difficulty: 1,
    },
  ],
  badges: [],
  levels: [{ level: 1, name: 'New Arrival', minXp: 0 }],
  aiScenarios: [],
  phrases: [
    {
      id: 'p1',
      word: 'Test Word',
      pronunciation: 'test',
      phonetic: '/test/',
      meaning: 'a word for testing',
      category: 'lingo',
      difficulty: 1,
      usedIn: ['Friends'],
      examples: [{ text: 'Test word in a sentence.' }],
      missionId: 'm1',
    },
  ],
  cultureTopics: [
    {
      id: 'ct1',
      title: 'Test Topic',
      icon: '🎯',
      category: 'lingo',
      summary: 'a topic for testing',
      explanation: 'explanation',
      examples: ['example'],
      aiPrompts: ['why?'],
      missionId: 'm1',
    },
  ],
};

describe('applyChallengeCompletion', () => {
  it('adds xp and marks the challenge complete without cascading mid-lesson', () => {
    const { nextState, events } = applyChallengeCompletion(baseState(), content, 'c1', 10);
    expect(nextState.xp).toBe(10);
    expect(nextState.completedChallengeIds).toEqual(['c1']);
    expect(events.lessonCompleted).toBeUndefined();
    expect(events.missionCompleted).toBeUndefined();
  });

  it('is idempotent — completing the same challenge twice does not double-award xp', () => {
    const first = applyChallengeCompletion(baseState(), content, 'c1', 10);
    const second = applyChallengeCompletion(first.nextState, content, 'c1', 10);
    expect(second.nextState.xp).toBe(10);
    expect(second.nextState).toBe(first.nextState);
  });

  it('completes the lesson once its last challenge is done', () => {
    const afterC1 = applyChallengeCompletion(baseState(), content, 'c1', 10).nextState;
    const { nextState, events } = applyChallengeCompletion(afterC1, content, 'c2', 10);
    expect(events.lessonCompleted).toBe('l1');
    expect(nextState.completedLessonIds).toEqual(['l1']);
  });

  it('completes the mission (awarding its xp) once its last lesson is done, and unlocks the next mission', () => {
    const afterC1 = applyChallengeCompletion(baseState(), content, 'c1', 10).nextState;
    const { nextState, events } = applyChallengeCompletion(afterC1, content, 'c2', 10);

    expect(events.missionCompleted).toBe('m1');
    expect(events.missionCompletionXp).toBe(100);
    expect(nextState.completedMissionIds).toEqual(['m1']);
    // 10 (c1) + 10 (c2) + 100 (mission bonus)
    expect(nextState.xp).toBe(120);
    expect(events.newlyUnlockedMissionIds).toContain('m2');
    expect(nextState.unlockedMissionIds).toContain('m2');
  });

  it('awards 0 xp for a wrong answer but still records the attempt', () => {
    const { nextState } = applyChallengeCompletion(baseState(), content, 'c1', 0);
    expect(nextState.xp).toBe(0);
    expect(nextState.completedChallengeIds).toEqual(['c1']);
  });

  it('unlocks the lesson\'s phrases and culture topics, seeding mastery at 1, once the lesson completes', () => {
    const afterC1 = applyChallengeCompletion(baseState(), content, 'c1', 10).nextState;
    const { nextState, events } = applyChallengeCompletion(afterC1, content, 'c2', 10);

    expect(events.newlyUnlockedPhraseIds).toEqual(['p1']);
    expect(events.newlyUnlockedCultureTopicIds).toEqual(['ct1']);
    expect(nextState.unlockedPhraseIds).toEqual(['p1']);
    expect(nextState.unlockedCultureTopicIds).toEqual(['ct1']);
    expect(nextState.phraseMastery.p1).toBe(1);
  });

  it('does not re-unlock or re-seed mastery for a phrase already unlocked', () => {
    const stateWithPhrase: ProgressState = {
      ...baseState(),
      unlockedPhraseIds: ['p1'],
      phraseMastery: { p1: 4 },
    };
    const afterC1 = applyChallengeCompletion(stateWithPhrase, content, 'c1', 10).nextState;
    const { nextState, events } = applyChallengeCompletion(afterC1, content, 'c2', 10);

    expect(events.newlyUnlockedPhraseIds).toEqual([]);
    expect(nextState.phraseMastery.p1).toBe(4);
  });
});
