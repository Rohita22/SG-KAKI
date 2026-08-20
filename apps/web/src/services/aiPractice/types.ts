import type { AIPracticeScenario, ChatMessage } from '@/content/types';

/** One beat of a multi-frame scene, in the persona's terms. */
export interface AIPracticeBeat {
  /** Replaces the scenario's own situation text while this beat runs. */
  situation: string;
  /** What has to have happened for the beat to be over, judged by the AI. */
  endWhen: string;
  /** Index into the stored history where THIS beat's conversation starts.
   * Earlier beats are a different scene as far as the persona is concerned —
   * sending them is tokens spent to describe a moment that has already passed. */
  historyFrom?: number;
  /** False for a beat that offers fixed choices: the suggestion chips are never
   * shown there, so the second AI call behind them is pure waste. */
  suggestReplies?: boolean;
  /** Who the player is talking to for THIS beat, overriding the scenario's own
   * persona. A journey scene meets several different people in one run — a bus
   * driver, a commuter, a receptionist — and none of them is "the scenario's
   * persona". Absent = fall back to the scenario, which is what every
   * single-persona scene does. */
  personaName?: string;
  personaDescription?: string;
}

export interface AIPracticeReply {
  text: string;
  /** True when the AI judged this a natural point to wind the conversation down. */
  endConversation: boolean;
}

export interface AIPracticeService {
  getScenario(id: string): AIPracticeScenario | undefined;
  sendMessage(
    scenarioId: string,
    history: ChatMessage[],
    userMessage: string,
    /** Singlish terms the learner has already unlocked, in learning order —
     * the AI should only ever use terms from this list, never ones taught later. */
    unlockedWords: string[],
    /** A multi-frame scene's current beat: what the persona is in the middle
     * of, and what marks that beat finished. */
    beat?: AIPracticeBeat,
  ): Promise<AIPracticeReply>;
  /** For scenarios with `autoOpen`: the persona's opening line. */
  startConversation(scenarioId: string, unlockedWords: string[]): Promise<string>;
  /** Contextual reply options for what the learner could say next, given the
   * conversation so far. `unlockedWords` are woven in where natural. */
  getSuggestedReplies(
    scenarioId: string,
    history: ChatMessage[],
    unlockedWords: string[],
    beat?: AIPracticeBeat,
  ): Promise<string[]>;
}
