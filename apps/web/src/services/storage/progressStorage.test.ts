import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialProgress, loadProgress, saveProgress } from './progressStorage';

describe('progressStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns a fresh initial state when nothing is stored', () => {
    const state = loadProgress();
    expect(state.xp).toBe(0);
    expect(state.completedChallengeIds).toEqual([]);
  });

  it('round-trips a saved state', () => {
    const state = { ...createInitialProgress(), xp: 250, streakDays: 4 };
    saveProgress(state);
    const loaded = loadProgress();
    expect(loaded.xp).toBe(250);
    expect(loaded.streakDays).toBe(4);
  });

  it('discards state saved under a different schema version', () => {
    localStorage.setItem(
      'sgmode:progress:v1',
      JSON.stringify({ schemaVersion: 999, xp: 9999 }),
    );
    const loaded = loadProgress();
    expect(loaded.xp).toBe(0);
  });

  it('falls back to a fresh state on corrupt JSON', () => {
    localStorage.setItem('sgmode:progress:v1', '{not valid json');
    const loaded = loadProgress();
    expect(loaded.xp).toBe(0);
  });
});
