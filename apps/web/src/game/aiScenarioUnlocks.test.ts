import { describe, expect, it } from 'vitest';
import { getUnlockedScenarioIds, isScenarioUnlocked } from './aiScenarioUnlocks';
import type { AIPracticeScenario } from '@/content/types';

const scenarios: AIPracticeScenario[] = [
  { id: 'free', title: 'Free', setup: '', suggestedOpeners: [], completionXp: 10 },
  {
    id: 'gated',
    title: 'Gated',
    setup: '',
    suggestedOpeners: [],
    completionXp: 10,
    unlocksAfterMissionId: 'eat',
  },
];

describe('getUnlockedScenarioIds', () => {
  it('always includes ungated scenarios', () => {
    expect(getUnlockedScenarioIds([], scenarios)).toEqual(['free']);
  });

  it('includes a gated scenario once its mission is completed', () => {
    expect(getUnlockedScenarioIds(['eat'], scenarios)).toEqual(['free', 'gated']);
  });
});

describe('isScenarioUnlocked', () => {
  it('reflects the same gating', () => {
    expect(isScenarioUnlocked('gated', [], scenarios)).toBe(false);
    expect(isScenarioUnlocked('gated', ['eat'], scenarios)).toBe(true);
  });
});
