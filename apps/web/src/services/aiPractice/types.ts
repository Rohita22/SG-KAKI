import type { AIPracticeScenario, ChatMessage } from '@/content/types';

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
  ): Promise<AIPracticeReply>;
  /** For scenarios with `autoOpen`: get the persona's opening line with no history/message. */
  startConversation(scenarioId: string, unlockedWords: string[]): Promise<string>;
  /** Contextual reply options for what the learner could say next, given the
   * conversation so far. `unlockedWords` are woven in where natural. */
  getSuggestedReplies(
    scenarioId: string,
    history: ChatMessage[],
    unlockedWords: string[],
  ): Promise<string[]>;
}
