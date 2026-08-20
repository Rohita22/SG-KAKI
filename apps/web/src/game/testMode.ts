import type { CountryPack, ProgressState } from '@/content/types';

/**
 * Development-only escape hatch. Vitest must continue exercising real unlock rules.
 * Set VITE_UNLOCK_ALL_CONTENT=true in apps/web/.env.local to expose all content.
 */
export function unlockAllContentEnabled(): boolean {
  return (
    !import.meta.env.MODE?.startsWith('test') &&
    import.meta.env.VITE_UNLOCK_ALL_CONTENT === 'true'
  );
}

export function withAllContentUnlocked(
  state: ProgressState,
  content: CountryPack,
): ProgressState {
  if (!unlockAllContentEnabled()) return state;

  return {
    ...state,
    unlockedMissionIds: content.missions.map((mission) => mission.id),
    unlockedPhraseIds: content.phrases.map((phrase) => phrase.id),
    unlockedCultureTopicIds: content.cultureTopics.map((topic) => topic.id),
  };
}
