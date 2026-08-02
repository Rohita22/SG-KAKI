import type { ProgressState } from '@/content/types';

export const MAX_MASTERY = 5;

export type MasteryLabel = 'Learning' | 'Comfortable' | 'Confident';

export function masteryLabel(level: number): MasteryLabel {
  if (level >= 5) return 'Confident';
  if (level >= 3) return 'Comfortable';
  return 'Learning';
}

/** Seeds a newly-unlocked phrase at mastery level 1 ("Learning"), if not already tracked. */
export function seedMastery(
  mastery: Record<string, number>,
  phraseId: string,
): Record<string, number> {
  if (phraseId in mastery) return mastery;
  return { ...mastery, [phraseId]: 1 };
}

/** Bumps a phrase's mastery by one, capped at MAX_MASTERY. Seeds to 1 if untracked. */
export function incrementMastery(
  state: ProgressState,
  phraseId: string,
): ProgressState {
  const current = state.phraseMastery[phraseId] ?? 0;
  const next = Math.min(MAX_MASTERY, current + 1);
  if (next === current) return state;
  return {
    ...state,
    phraseMastery: { ...state.phraseMastery, [phraseId]: next },
  };
}
