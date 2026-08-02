import { describe, expect, it } from 'vitest';
import { calculateSavvy } from './savvy';
import type { Challenge } from '@/content/types';

function mc(id: string, category: Challenge['category']): Challenge {
  return {
    id,
    lessonId: 'l1',
    type: 'multiple-choice',
    category,
    scene: 'none',
    prompt: '',
    options: [{ id: 'a', label: 'a' }],
    correctOptionId: 'a',
    explanation: '',
    xp: 10,
    difficulty: 1,
  };
}

const challenges: Challenge[] = [
  mc('lingo-1', 'lingo'),
  mc('lingo-2', 'lingo'),
  mc('food-1', 'food'),
  mc('food-2', 'food'),
];

describe('calculateSavvy', () => {
  it('is all zero with no completions', () => {
    const result = calculateSavvy([], challenges);
    expect(result.overall).toBe(0);
    expect(result.categories.lingo).toBe(0);
  });

  it('computes per-category percentage independently', () => {
    const result = calculateSavvy(['lingo-1', 'lingo-2'], challenges);
    expect(result.categories.lingo).toBe(100);
    expect(result.categories.food).toBe(0);
  });

  it('computes overall as a share of all challenges, not just authored categories', () => {
    const result = calculateSavvy(['lingo-1', 'food-1'], challenges);
    expect(result.overall).toBe(50);
  });

  it('is unaffected by ids that do not correspond to any challenge', () => {
    const result = calculateSavvy(['does-not-exist'], challenges);
    expect(result.overall).toBe(0);
  });
});
