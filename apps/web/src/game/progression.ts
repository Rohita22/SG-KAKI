import type { CountryPack, ProgressState } from '@/content/types';
import { evaluateNewBadges } from './badges';
import { getUnlockedMissionIds } from './unlocks';
import { seedMastery } from './mastery';

export interface CompletionEvents {
  lessonCompleted?: string;
  missionCompleted?: string;
  missionCompletionXp?: number;
  newBadgeIds: string[];
  newlyUnlockedMissionIds: string[];
  newlyUnlockedPhraseIds: string[];
  newlyUnlockedCultureTopicIds: string[];
}

function addUnique(list: string[], id: string): string[] {
  return list.includes(id) ? list : [...list, id];
}

/**
 * The single source of truth for the challenge -> lesson -> mission -> badge -> unlock
 * cascade (plan §F). Pure and synchronous so the whole cascade resolves in one step,
 * rather than depending on React batching multiple dispatches correctly.
 */
export function applyChallengeCompletion(
  state: ProgressState,
  content: CountryPack,
  challengeId: string,
  xpAwarded: number,
): { nextState: ProgressState; events: CompletionEvents } {
  const events: CompletionEvents = {
    newBadgeIds: [],
    newlyUnlockedMissionIds: [],
    newlyUnlockedPhraseIds: [],
    newlyUnlockedCultureTopicIds: [],
  };

  if (state.completedChallengeIds.includes(challengeId)) {
    return { nextState: state, events };
  }

  let next: ProgressState = {
    ...state,
    xp: state.xp + xpAwarded,
    completedChallengeIds: addUnique(state.completedChallengeIds, challengeId),
  };

  const challenge = content.challenges.find((c) => c.id === challengeId);
  const lesson = challenge
    ? content.lessons.find((l) => l.id === challenge.lessonId)
    : undefined;

  if (lesson && !next.completedLessonIds.includes(lesson.id)) {
    const lessonDone = lesson.challengeIds.every((id) =>
      next.completedChallengeIds.includes(id),
    );
    if (lessonDone) {
      next = {
        ...next,
        completedLessonIds: addUnique(next.completedLessonIds, lesson.id),
      };
      events.lessonCompleted = lesson.id;

      const newPhraseIds = (lesson.phraseIds ?? []).filter(
        (id) => !next.unlockedPhraseIds.includes(id),
      );
      if (newPhraseIds.length > 0) {
        next = {
          ...next,
          unlockedPhraseIds: [...next.unlockedPhraseIds, ...newPhraseIds],
          phraseMastery: newPhraseIds.reduce(
            (mastery, id) => seedMastery(mastery, id),
            next.phraseMastery,
          ),
        };
        events.newlyUnlockedPhraseIds = newPhraseIds;
      }

      const newCultureTopicIds = (lesson.cultureTopicIds ?? []).filter(
        (id) => !next.unlockedCultureTopicIds.includes(id),
      );
      if (newCultureTopicIds.length > 0) {
        next = {
          ...next,
          unlockedCultureTopicIds: [
            ...next.unlockedCultureTopicIds,
            ...newCultureTopicIds,
          ],
        };
        events.newlyUnlockedCultureTopicIds = newCultureTopicIds;
      }

      const mission = content.missions.find((m) => m.id === lesson.missionId);
      if (mission && !next.completedMissionIds.includes(mission.id)) {
        const missionDone = mission.lessonIds.every((id) =>
          next.completedLessonIds.includes(id),
        );
        if (missionDone) {
          next = {
            ...next,
            xp: next.xp + mission.completionXp,
            completedMissionIds: addUnique(
              next.completedMissionIds,
              mission.id,
            ),
          };
          events.missionCompleted = mission.id;
          events.missionCompletionXp = mission.completionXp;
        }
      }
    }
  }

  const newBadgeIds = evaluateNewBadges(next, content);
  if (newBadgeIds.length > 0) {
    next = {
      ...next,
      earnedBadgeIds: [...next.earnedBadgeIds, ...newBadgeIds],
    };
    events.newBadgeIds = newBadgeIds;
  }

  const recomputedUnlocked = getUnlockedMissionIds(
    next.completedMissionIds,
    content.missions,
  );
  const newlyUnlocked = recomputedUnlocked.filter(
    (id) => !next.unlockedMissionIds.includes(id),
  );
  if (newlyUnlocked.length > 0) {
    next = { ...next, unlockedMissionIds: recomputedUnlocked };
    events.newlyUnlockedMissionIds = newlyUnlocked;
  }

  return { nextState: next, events };
}
