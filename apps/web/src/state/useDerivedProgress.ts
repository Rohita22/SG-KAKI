import { useMemo } from 'react';
import { useProgress } from './useProgress';
import { activeCountryPack } from '@/content/activeCountryPack';
import { levelForXp, nextLevel, xpProgressToNextLevel } from '@/game/xp';
import { calculateSavvy } from '@/game/savvy';
import { calculateJourneyProgress } from '@/game/journey';

export function useDerivedProgress() {
  const { state } = useProgress();

  return useMemo(() => {
    const level = levelForXp(state.xp, activeCountryPack.levels);
    const next = nextLevel(state.xp, activeCountryPack.levels);
    const levelProgress = xpProgressToNextLevel(state.xp, activeCountryPack.levels);
    const savvy = calculateSavvy(state.completedChallengeIds, activeCountryPack.challenges);
    const journeyProgress = calculateJourneyProgress(state, activeCountryPack);
    const phrasesLearnedCount = state.unlockedPhraseIds.length;
    const cultureTopicsLearnedCount = state.unlockedCultureTopicIds.length;

    return {
      level,
      nextLevel: next,
      levelProgress,
      savvy,
      journeyProgress,
      phrasesLearnedCount,
      cultureTopicsLearnedCount,
    };
  }, [
    state.xp,
    state.completedChallengeIds,
    state.completedLessonIds,
    state.completedMissionIds,
    state.unlockedMissionIds,
    state.unlockedPhraseIds,
    state.unlockedCultureTopicIds,
  ]);
}
