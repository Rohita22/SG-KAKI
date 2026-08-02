import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '@/content/types';
import { useProgress } from './useProgress';
import { activeCountryPack } from '@/content/activeCountryPack';
import { groqAIPracticeService as aiPracticeService } from '@/services/aiPractice/groqAIPracticeService';

export function useAIPractice(scenarioId: string) {
  const { state, recordAiMessage, resetAiPractice } = useProgress();
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [readyToEnd, setReadyToEnd] = useState(false);
  const openedScenarioIds = useRef(new Set<string>());

  const scenario = aiPracticeService.getScenario(scenarioId);
  const history = state.aiPracticeHistory[scenarioId] ?? [];

  // In the order each phrase was actually unlocked, not content-file order —
  // the AI is told never to use a term the learner hasn't reached yet.
  function getUnlockedWords(): string[] {
    return state.unlockedPhraseIds
      .map((id) => activeCountryPack.phrases.find((p) => p.id === id)?.word)
      .filter((word): word is string => Boolean(word));
  }

  function refreshSuggestions(nextHistory: ChatMessage[]) {
    setSuggestionsLoading(true);
    void aiPracticeService
      .getSuggestedReplies(scenarioId, nextHistory, getUnlockedWords())
      .then(setSuggestions)
      .finally(() => setSuggestionsLoading(false));
  }

  useEffect(() => {
    if (!scenario?.autoOpen || history.length > 0 || openedScenarioIds.current.has(scenarioId)) {
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
  }, [scenarioId, scenario?.autoOpen, history.length]);

  async function sendUserMessage(text: string) {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text,
      timestamp: new Date().toISOString(),
    };
    recordAiMessage(scenarioId, userMsg);
    setIsTyping(true);
    setSuggestions([]);

    const reply = await aiPracticeService.sendMessage(
      scenarioId,
      [...history, userMsg],
      text,
      getUnlockedWords(),
    );

    const aiMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'ai',
      text: reply.text,
      timestamp: new Date().toISOString(),
    };
    recordAiMessage(scenarioId, aiMsg);
    setIsTyping(false);
    setReadyToEnd(reply.endConversation);
    refreshSuggestions([...history, userMsg, aiMsg]);
  }

  function restart() {
    openedScenarioIds.current.delete(scenarioId);
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
  };
}
