/**
 * Illustrated environments for the learning journey.  These deliberately use
 * the same warm, animated language as the quest scenes while keeping enough
 * quiet space for lessons and challenges to remain easy to read.
 */
export const journeyBackgrounds: Record<string, string> = {
  speak: '/images/journey-backgrounds/speak-like-a-local.png',
  eat: '/images/journey-backgrounds/eat-like-a-local.png',
  move: '/images/journey-backgrounds/move-like-a-local.png',
  vibe: '/images/journey-backgrounds/vibe-like-a-local.png',
  work: '/images/journey-backgrounds/work-like-a-local.png',
  reallife: '/images/journey-backgrounds/real-life-mode.png',
};

export function journeyBackgroundForMission(missionId: string): string {
  return journeyBackgrounds[missionId] ?? '/images/lesson-bg.png';
}
