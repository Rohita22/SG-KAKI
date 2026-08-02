import type { ProgressState } from '@/content/types';
import { activeCountryPack } from '@/content/activeCountryPack';
import { getUnlockedMissionIds } from '@/game/unlocks';

const STORAGE_KEY = 'sgmode:progress:v1';
const SCHEMA_VERSION = 1;

export function createInitialProgress(): ProgressState {
  return {
    schemaVersion: SCHEMA_VERSION,
    xp: 0,
    streakDays: 0,
    lastActiveDate: '',
    completedChallengeIds: [],
    completedLessonIds: [],
    completedMissionIds: [],
    unlockedMissionIds: getUnlockedMissionIds([], activeCountryPack.missions),
    earnedBadgeIds: [],
    aiPracticeHistory: {},
    unlockedPhraseIds: [],
    unlockedCultureTopicIds: [],
    phraseMastery: {},
  };
}

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialProgress();
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    if (parsed.schemaVersion !== SCHEMA_VERSION) return createInitialProgress();
    return { ...createInitialProgress(), ...parsed };
  } catch {
    return createInitialProgress();
  }
}

export function saveProgress(state: ProgressState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable (private browsing, quota) — fail silently, in-memory state still works
  }
}
