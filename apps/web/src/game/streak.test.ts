import { describe, expect, it } from 'vitest';
import { updateStreak } from './streak';

describe('updateStreak', () => {
  it('starts a fresh streak at 1 when there is no prior activity', () => {
    const result = updateStreak('', 0, '2026-01-05');
    expect(result).toEqual({ streakDays: 1, lastActiveDate: '2026-01-05', changed: true });
  });

  it('is a no-op for a second visit on the same day', () => {
    const result = updateStreak('2026-01-05', 3, '2026-01-05');
    expect(result.changed).toBe(false);
    expect(result.streakDays).toBe(3);
  });

  it('increments on a consecutive day', () => {
    const result = updateStreak('2026-01-05', 3, '2026-01-06');
    expect(result).toEqual({ streakDays: 4, lastActiveDate: '2026-01-06', changed: true });
  });

  it('resets to 1 (not 0) after a missed day, never punitive', () => {
    const result = updateStreak('2026-01-05', 5, '2026-01-08');
    expect(result.streakDays).toBe(1);
    expect(result.streakDays).toBeGreaterThan(0);
  });
});
