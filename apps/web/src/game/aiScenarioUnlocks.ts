import type { AIPracticeScenario } from '@/content/types';

/** Mirrors game/unlocks.ts's getUnlockedMissionIds — derived, not stored. */
export function getUnlockedScenarioIds(
  completedMissionIds: string[],
  scenarios: AIPracticeScenario[],
): string[] {
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
