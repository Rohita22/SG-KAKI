import type { CountryPack, ProgressState } from '@/content/types';

/**
 * "Singapore Unlocked" — map/journey progression, deliberately distinct from
 * Singapore Savvy (challenge mastery, see game/savvy.ts). A completed mission
 * contributes its full share; an unlocked-but-in-progress mission contributes
 * partial credit based on how many of its lessons are done; a locked mission
 * contributes nothing. Deterministic and independent of challenge-level
 * correctness, so the two metrics naturally diverge during normal play.
 */
export function calculateJourneyProgress(
  progress: ProgressState,
  content: CountryPack,
): number {
  const missions = content.missions;
  if (missions.length === 0) return 0;

  const share = missions.reduce((sum, mission) => {
    if (progress.completedMissionIds.includes(mission.id)) return sum + 1;

    if (progress.unlockedMissionIds.includes(mission.id)) {
      const total = mission.lessonIds.length || 1;
      const done = mission.lessonIds.filter((id) =>
        progress.completedLessonIds.includes(id),
      ).length;
      return sum + done / total;
    }

    return sum;
  }, 0);

  return Math.round((share / missions.length) * 100);
}
