import type { AIPracticeScenario } from '@/content/types';

/** Dev escape hatch: set VITE_UNLOCK_ALL_SCENARIOS=true in apps/web/.env to
 * treat every AI Practice scenario as unlocked, so a scene can be opened
 * directly without first completing its mission. Off unless explicitly set,
 * and always off under test — Vitest loads .env too, and the gating tests
 * assert the real rules rather than whatever the local dev flag happens to be. */
function bypassUnlocks(): boolean {
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
  if (bypassUnlocks()) return scenarios.map((s) => s.id);

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
