import { useEffect, useRef, useState } from 'react';
import type { AIPracticeStage, ChatMessage } from '@/content/types';
import { useProgress } from './useProgress';
import { activeCountryPack } from '@/content/activeCountryPack';
import { groqAIPracticeService as aiPracticeService } from '@/services/aiPractice/groqAIPracticeService';

/** The in-progress stage of a staged scenario: the highest-index stage that
 * already has a tagged message, defaulting to the first stage before any
 * message has landed. "Advancing" a stage is just tagging a message with
 * the next stage's id — this derivation then naturally follows, including
 * across a page reload since it reads straight from persisted history. */
function currentStage(history: ChatMessage[], stages: AIPracticeStage[]): AIPracticeStage {
  let index = 0;
  for (let i = 0; i < stages.length; i++) {
    if (history.some((m) => m.stageId === stages[i].id)) index = i;
  }
  return stages[index];
}

export function useAIPractice(scenarioId: string) {
  const { state, recordAiMessage, resetAiPractice } = useProgress();
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [readyToEnd, setReadyToEnd] = useState(false);
  const openedScenarioIds = useRef(new Set<string>());
  // Keyed `${scenarioId}:${stageId}` — a staged scenario opens several
  // stages over one session, so a single per-scenario guard isn't enough.
  const openedStageKeys = useRef(new Set<string>());

  const scenario = aiPracticeService.getScenario(scenarioId);
  const history = state.aiPracticeHistory[scenarioId] ?? [];
  const stage = scenario?.stages ? currentStage(history, scenario.stages) : undefined;
  const stageTurnCount = stage
    ? history.filter((m) => m.role === 'user' && m.stageId === stage.id).length
    : 0;

  // In the order each phrase was actually unlocked, not content-file order —
  // the AI is told never to use a term the learner hasn't reached yet.
  function getUnlockedWords(): string[] {
    return state.unlockedPhraseIds
      .map((id) => activeCountryPack.phrases.find((p) => p.id === id)?.word)
      .filter((word): word is string => Boolean(word));
  }

  function refreshSuggestions(nextHistory: ChatMessage[], goalOverride?: string) {
    setSuggestionsLoading(true);
    void aiPracticeService
      .getSuggestedReplies(scenarioId, nextHistory, getUnlockedWords(), goalOverride ?? stage?.goal)
      .then(setSuggestions)
      .finally(() => setSuggestionsLoading(false));
  }

  // Opens one stage of a staged scenario: fetches its persona line (using
  // that stage's `goal` as the context override) and appends it tagged with
  // the stage's id. Used both for the very first stage and for advancing
  // into every later one.
  async function openStage(target: AIPracticeStage) {
    const key = `${scenarioId}:${target.id}`;
    if (openedStageKeys.current.has(key)) return;
    openedStageKeys.current.add(key);
    setIsTyping(true);
    setReadyToEnd(false);

    // Only the tail of the conversation, not the whole thing — enough for
    // the model to know it's already mid-conversation (so it doesn't greet
    // again) without a long-running stage's own tangent outweighing this
    // new stage's goal. A stage can wander over up to maxTurns real replies;
    // handing all of it over made the model continue that thread instead of
    // pivoting to the new situation.
    const replyText = await aiPracticeService.startConversation(
      scenarioId,
      getUnlockedWords(),
      target.goal,
      history.slice(-4),
    );
    const aiMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'ai',
      text: replyText,
      timestamp: new Date().toISOString(),
      stageId: target.id,
    };
    recordAiMessage(scenarioId, aiMsg);
    setIsTyping(false);
    refreshSuggestions([...history, aiMsg], target.goal);
  }

  // Opens the very first stage/message of a scenario. Staged scenarios
  // always open stage 0 this way; non-staged scenarios keep their original
  // `autoOpen`-flag-gated behavior untouched.
  useEffect(() => {
    if (!scenario) return;

    if (scenario.stages) {
      if (history.length === 0) void openStage(scenario.stages[0]);
      return;
    }

    if (!scenario.autoOpen || history.length > 0 || openedScenarioIds.current.has(scenarioId)) {
      return;
    }
    openedScenarioIds.current.add(scenarioId);
    setIsTyping(true);

    void aiPracticeService.startConversation(scenarioId, getUnlockedWords()).then((replyText) => {
      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'ai',
        text: replyText,
        timestamp: new Date().toISOString(),
      };
      recordAiMessage(scenarioId, aiMsg);
      setIsTyping(false);
      refreshSuggestions([aiMsg]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId, scenario, history.length]);

  // Advances a staged scenario once the current stage's natural-ending
  // conditions are met — same min/max-turns-vs-readyToEnd arithmetic every
  // scripted ending already uses, just re-scoped to one stage at a time.
  // The minigame stage advances via resolveMinigamePick instead, and the
  // final stage doesn't auto-advance at all — its ending is the scripted
  // cutscene, driven by `completionScript` once the screen stops passing a
  // `visualScene` before it (see AIPracticeScreen).
  useEffect(() => {
    if (!scenario?.stages || !stage || stage.minigame || isTyping) return;
    const stages = scenario.stages;
    const index = stages.findIndex((s) => s.id === stage.id);
    if (index === stages.length - 1) return;

    const reachedMin = stageTurnCount >= stage.minTurns && readyToEnd;
    const reachedMax = stageTurnCount >= stage.maxTurns;
    if (!(reachedMin || reachedMax)) return;

    void openStage(stages[index + 1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario, stage, stageTurnCount, readyToEnd, isTyping]);

  async function sendUserMessage(text: string) {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text,
      timestamp: new Date().toISOString(),
      stageId: stage?.id,
    };
    recordAiMessage(scenarioId, userMsg);
    setIsTyping(true);
    setSuggestions([]);

    const reply = await aiPracticeService.sendMessage(
      scenarioId,
      [...history, userMsg],
      text,
      getUnlockedWords(),
      stage?.goal,
    );

    const aiMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'ai',
      text: reply.text,
      timestamp: new Date().toISOString(),
      stageId: stage?.id,
    };
    recordAiMessage(scenarioId, aiMsg);
    setIsTyping(false);
    setReadyToEnd(reply.endConversation);
    refreshSuggestions([...history, userMsg, aiMsg]);
  }

  /** Resolves a bag-item pick on the chope minigame stage: returns whether
   * it was correct (for the picker's own feedback animation) and, on a
   * correct pick, opens the next stage the same way a chat stage would. */
  function resolveMinigamePick(itemId: string): boolean {
    if (!scenario?.stages || !stage?.minigame) return false;
    const correct = itemId === stage.minigame.correctItemId;
    if (correct) {
      const stages = scenario.stages;
      const index = stages.findIndex((s) => s.id === stage.id);
      const next = stages[index + 1];
      if (next) void openStage(next);
    }
    return correct;
  }

  function restart() {
    openedScenarioIds.current.delete(scenarioId);
    for (const key of [...openedStageKeys.current]) {
      if (key.startsWith(`${scenarioId}:`)) openedStageKeys.current.delete(key);
    }
    setSuggestions([]);
    setReadyToEnd(false);
    resetAiPractice(scenarioId);
  }

  return {
    scenario,
    history,
    isTyping,
    suggestions,
    suggestionsLoading,
    readyToEnd,
    sendUserMessage,
    restart,
    stage,
    stageTurnCount,
    resolveMinigamePick,
  };
}
