import type { Mission } from '@/content/types';
import { unlockAllContentEnabled } from './testMode';

/**
 * A mission is unlocked once every prerequisite mission is completed.
 * Missions with no prerequisites are unlocked from the start.
 */
export function getUnlockedMissionIds(
  completedMissionIds: string[],
  missions: Mission[],
): string[] {
  if (unlockAllContentEnabled()) return missions.map((mission) => mission.id);

  const completed = new Set(completedMissionIds);
  return missions
    .filter((m) => m.prerequisiteMissionIds.every((id) => completed.has(id)))
    .map((m) => m.id);
}

export type MissionStatus = 'completed' | 'active' | 'locked';

export function getMissionStatus(
  missionId: string,
  completedMissionIds: string[],
  unlockedMissionIds: string[],
): MissionStatus {
  if (completedMissionIds.includes(missionId)) return 'completed';
  if (unlockedMissionIds.includes(missionId)) return 'active';
  return 'locked';
}
