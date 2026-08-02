import { describe, expect, it } from 'vitest';
import { REGISTERED_SCENE_KEYS } from './ChallengeScene';
import { activeCountryPack } from '@/content/activeCountryPack';

describe('scene registry coverage', () => {
  it('has a renderer for every scene key used by authored content (except "none")', () => {
    const usedKeys = new Set(
      activeCountryPack.challenges.map((c) => c.scene).filter((s) => s !== 'none'),
    );
    const registered = new Set(REGISTERED_SCENE_KEYS);

    const missing = [...usedKeys].filter((key) => !registered.has(key));
    expect(missing).toEqual([]);
  });

  it('registers at least the core scene set', () => {
    expect(REGISTERED_SCENE_KEYS.length).toBeGreaterThanOrEqual(7);
  });
});
