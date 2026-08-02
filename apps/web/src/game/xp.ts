import type { Level } from '@/content/types';

export function levelForXp(xp: number, levels: Level[]): Level {
  let current = levels[0];
  for (const lvl of levels) {
    if (xp >= lvl.minXp) current = lvl;
    else break;
  }
  return current;
}

export function nextLevel(xp: number, levels: Level[]): Level | null {
  const current = levelForXp(xp, levels);
  return levels.find((l) => l.level === current.level + 1) ?? null;
}

/** Progress toward the next level, 0..1. Returns 1 if already at max level. */
export function xpProgressToNextLevel(xp: number, levels: Level[]): number {
  const current = levelForXp(xp, levels);
  const next = nextLevel(xp, levels);
  if (!next) return 1;
  const span = next.minXp - current.minXp;
  if (span <= 0) return 1;
  return Math.min(1, Math.max(0, (xp - current.minXp) / span));
}
