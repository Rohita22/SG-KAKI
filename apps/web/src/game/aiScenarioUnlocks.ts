import type { AIPracticeScenario } from '@/content/types';
import { unlockAllContentEnabled } from './testMode';

function unlockAllScenariosEnabled(): boolean {
  return (
    !import.meta.env.MODE?.startsWith('test') &&
    import.meta.env.VITE_UNLOCK_ALL_SCENARIOS === 'true'
  );
}

/** Mirrors game/unlocks.ts's getUnlockedMissionIds — derived, not stored. */
export function getUnlockedScenarioIds(
  completedMissionIds: string[],
  scenarios: AIPracticeScenario[],
): string[] {
  if (unlockAllContentEnabled() || unlockAllScenariosEnabled()) {
    return scenarios.map((s) => s.id);
  }

  return scenarios
    .filter(
      (s) =>
        !s.unlocksAfterMissionId ||
        completedMissionIds.includes(s.unlocksAfterMissionId),
    )
    .map((s) => s.id);
}

export function isScenarioUnlocked(
  scenarioId: string,
  completedMissionIds: string[],
  scenarios: AIPracticeScenario[],
): boolean {
  return getUnlockedScenarioIds(completedMissionIds, scenarios).includes(
    scenarioId,
  );
}
