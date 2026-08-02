import type { ChatMessage, ProgressState } from '@/content/types';
import { incrementMastery } from '@/game/mastery';

export type ProgressAction =
  | { type: 'HYDRATE'; state: ProgressState }
  | { type: 'COMPLETE_CHALLENGE'; challengeId: string; xp: number }
  | { type: 'COMPLETE_LESSON'; lessonId: string }
  | { type: 'COMPLETE_MISSION'; missionId: string; xp: number }
  | { type: 'SET_UNLOCKED_MISSIONS'; missionIds: string[] }
  | { type: 'AWARD_BADGES'; badgeIds: string[] }
  | { type: 'RECORD_AI_MESSAGE'; scenarioId: string; message: ChatMessage }
  | { type: 'RESET_AI_HISTORY'; scenarioId: string }
  | { type: 'AWARD_XP'; xp: number }
  | { type: 'TOUCH_STREAK'; streakDays: number; lastActiveDate: string }
  | { type: 'INCREMENT_PHRASE_MASTERY'; phraseId: string };

function addUnique(list: string[], id: string): string[] {
  return list.includes(id) ? list : [...list, id];
}

export function progressReducer(
  state: ProgressState,
  action: ProgressAction,
): ProgressState {
  switch (action.type) {
    case 'HYDRATE':
      return action.state;

    case 'COMPLETE_CHALLENGE':
      if (state.completedChallengeIds.includes(action.challengeId)) {
        return state;
      }
      return {
        ...state,
        xp: state.xp + action.xp,
        completedChallengeIds: addUnique(
          state.completedChallengeIds,
          action.challengeId,
        ),
      };

    case 'COMPLETE_LESSON':
      return {
        ...state,
        completedLessonIds: addUnique(state.completedLessonIds, action.lessonId),
      };

    case 'COMPLETE_MISSION':
      if (state.completedMissionIds.includes(action.missionId)) {
        return state;
      }
      return {
        ...state,
        xp: state.xp + action.xp,
        completedMissionIds: addUnique(
          state.completedMissionIds,
          action.missionId,
        ),
      };

    case 'SET_UNLOCKED_MISSIONS':
      return { ...state, unlockedMissionIds: action.missionIds };

    case 'AWARD_BADGES':
      if (action.badgeIds.length === 0) return state;
      return {
        ...state,
        earnedBadgeIds: [
          ...state.earnedBadgeIds,
          ...action.badgeIds.filter(
            (id) => !state.earnedBadgeIds.includes(id),
          ),
        ],
      };

    case 'RECORD_AI_MESSAGE': {
      const history = state.aiPracticeHistory[action.scenarioId] ?? [];
      return {
        ...state,
        aiPracticeHistory: {
          ...state.aiPracticeHistory,
          [action.scenarioId]: [...history, action.message],
        },
      };
    }

    case 'RESET_AI_HISTORY': {
      const { [action.scenarioId]: _removed, ...rest } = state.aiPracticeHistory;
      return { ...state, aiPracticeHistory: rest };
    }

    case 'AWARD_XP':
      return { ...state, xp: state.xp + action.xp };

    case 'TOUCH_STREAK':
      return {
        ...state,
        streakDays: action.streakDays,
        lastActiveDate: action.lastActiveDate,
      };

    case 'INCREMENT_PHRASE_MASTERY':
      return incrementMastery(state, action.phraseId);

    default:
      return state;
  }
}
