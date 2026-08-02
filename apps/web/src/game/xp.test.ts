import { describe, expect, it } from 'vitest';
import { levelForXp, nextLevel, xpProgressToNextLevel } from './xp';
import type { Level } from '@/content/types';

const levels: Level[] = [
  { level: 1, name: 'New Arrival', minXp: 0 },
  { level: 2, name: 'Getting Around', minXp: 100 },
  { level: 3, name: 'SG Explorer', minXp: 300 },
];

describe('levelForXp', () => {
  it('returns the first level at 0 xp', () => {
    expect(levelForXp(0, levels).level).toBe(1);
  });

  it('returns the highest level whose threshold has been met', () => {
    expect(levelForXp(150, levels).level).toBe(2);
    expect(levelForXp(300, levels).level).toBe(3);
    expect(levelForXp(999, levels).level).toBe(3);
  });
});

describe('nextLevel', () => {
  it('returns the following level', () => {
    expect(nextLevel(50, levels)?.level).toBe(2);
  });

  it('returns null at the max level', () => {
    expect(nextLevel(500, levels)).toBeNull();
  });
});

describe('xpProgressToNextLevel', () => {
  it('is 0 right at a level threshold', () => {
    expect(xpProgressToNextLevel(100, levels)).toBe(0);
  });

  it('is 0.5 halfway to the next level', () => {
    expect(xpProgressToNextLevel(200, levels)).toBeCloseTo(0.5);
  });

  it('is 1 at the max level', () => {
    expect(xpProgressToNextLevel(1000, levels)).toBe(1);
  });
});
