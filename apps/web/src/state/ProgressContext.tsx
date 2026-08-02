import {
  createContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react';
import type { ChatMessage, ProgressState } from '@/content/types';
import { activeCountryPack } from '@/content/activeCountryPack';
import { loadProgress, saveProgress } from '@/services/storage/progressStorage';
import { progressReducer } from './progressReducer';
import { applyChallengeCompletion, type CompletionEvents } from '@/game/progression';
import { updateStreak, toDateKey } from '@/game/streak';

export interface ProgressContextValue {
  state: ProgressState;
  completeChallenge: (challengeId: string, xpAwarded: number) => CompletionEvents;
  recordAiMessage: (scenarioId: string, message: ChatMessage) => void;
  resetAiPractice: (scenarioId: string) => void;
  awardXp: (xp: number) => void;
  incrementMastery: (phraseId: string) => void;
}

export const ProgressContext = createContext<ProgressContextValue | null>(null);

const SAVE_DEBOUNCE_MS = 300;

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(progressReducer, undefined, loadProgress);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchedStreak = useRef(false);

  useEffect(() => {
    if (touchedStreak.current) return;
    touchedStreak.current = true;
    const today = toDateKey(new Date());
    const result = updateStreak(state.lastActiveDate, state.streakDays, today);
    if (result.changed) {
      dispatch({
        type: 'TOUCH_STREAK',
        streakDays: result.streakDays,
        lastActiveDate: result.lastActiveDate,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      saveProgress(state);
    }, SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [state]);

  const value = useMemo<ProgressContextValue>(
    () => ({
      state,
      completeChallenge: (challengeId, xpAwarded) => {
        const { nextState, events } = applyChallengeCompletion(
          state,
          activeCountryPack,
          challengeId,
          xpAwarded,
        );
        dispatch({ type: 'HYDRATE', state: nextState });
        return events;
      },
      recordAiMessage: (scenarioId, message) => {
        dispatch({ type: 'RECORD_AI_MESSAGE', scenarioId, message });
      },
      resetAiPractice: (scenarioId) => {
        dispatch({ type: 'RESET_AI_HISTORY', scenarioId });
      },
      awardXp: (xp) => {
        dispatch({ type: 'AWARD_XP', xp });
      },
      incrementMastery: (phraseId) => {
        dispatch({ type: 'INCREMENT_PHRASE_MASTERY', phraseId });
      },
    }),
    [state],
  );

  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  );
}
