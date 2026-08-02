const DAY_MS = 24 * 60 * 60 * 1000;

export function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function daysBetween(fromKey: string, toKey: string): number {
  const from = new Date(`${fromKey}T00:00:00Z`).getTime();
  const to = new Date(`${toKey}T00:00:00Z`).getTime();
  return Math.round((to - from) / DAY_MS);
}

export interface StreakResult {
  streakDays: number;
  lastActiveDate: string;
  changed: boolean;
}

/**
 * Non-punitive streak update: same day is a no-op, consecutive day increments,
 * and a missed day resets to 1 rather than 0 — never a jarring "streak broken" moment.
 */
export function updateStreak(
  lastActiveDate: string,
  currentStreakDays: number,
  today: string = toDateKey(new Date()),
): StreakResult {
  if (!lastActiveDate) {
    return { streakDays: 1, lastActiveDate: today, changed: true };
  }
  const diff = daysBetween(lastActiveDate, today);
  if (diff === 0) {
    return { streakDays: currentStreakDays, lastActiveDate, changed: false };
  }
  if (diff === 1) {
    return {
      streakDays: currentStreakDays + 1,
      lastActiveDate: today,
      changed: true,
    };
  }
  return { streakDays: 1, lastActiveDate: today, changed: true };
}
