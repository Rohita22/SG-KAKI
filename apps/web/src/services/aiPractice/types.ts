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
    /** For a staged scenario: the current stage's goal, sent as `context`
     * in place of the scenario's own title/setup while that stage is active. */
    contextOverride?: string,
  ): Promise<AIPracticeReply>;
  /** For scenarios with `autoOpen`, or a staged scenario advancing into its
   * next stage: get the persona's opening line for that beat. `history` is
   * the conversation so far — empty for a scenario's true first message,
   * non-empty when this is really "continue into a new stage," which the
   * backend uses to avoid re-greeting a learner it's already talking to. */
  startConversation(
    scenarioId: string,
    unlockedWords: string[],
    contextOverride?: string,
    history?: ChatMessage[],
  ): Promise<string>;
  /** Contextual reply options for what the learner could say next, given the
   * conversation so far. `unlockedWords` are woven in where natural. */
  getSuggestedReplies(
    scenarioId: string,
    history: ChatMessage[],
    unlockedWords: string[],
    contextOverride?: string,
  ): Promise<string[]>;
}
