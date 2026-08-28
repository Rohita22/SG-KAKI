import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '@/content/types';
import type { AIPracticeBeat } from '@/services/aiPractice/types';
import { useProgress } from './useProgress';
import { activeCountryPack } from '@/content/activeCountryPack';
import { groqAIPracticeService as aiPracticeService } from '@/services/aiPractice/groqAIPracticeService';

export function useAIPractice(scenarioId: string, initialSuggestionBeat?: AIPracticeBeat) {
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

  function refreshSuggestions(nextHistory: ChatMessage[], beat?: AIPracticeBeat) {
    setSuggestionsLoading(true);
    void aiPracticeService
      .getSuggestedReplies(scenarioId, nextHistory, getUnlockedWords(), beat)
      .then(setSuggestions)
      .finally(() => setSuggestionsLoading(false));
  }

  useEffect(() => {
    if (!scenario) return;

    if (!scenario.autoOpen || history.length > 0 || openedScenarioIds.current.has(scenarioId)) {
      return;
    }
    openedScenarioIds.current.add(scenarioId);
    setIsTyping(true);

    const opener = scenario.openingLine
      ? Promise.resolve(scenario.openingLine)
      : aiPracticeService.startConversation(scenarioId, getUnlockedWords());

    void opener.then((replyText) => {
      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'ai',
        text: replyText,
        timestamp: new Date().toISOString(),
      };
      recordAiMessage(scenarioId, aiMsg);
      setIsTyping(false);
      refreshSuggestions([aiMsg], initialSuggestionBeat);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId, scenario, history.length, initialSuggestionBeat]);

  /** `beat` overrides the scenario's own setup for this exchange — a multi-frame
   * scene passes what the CURRENT frame is about and what ends it. */
  async function sendUserMessage(text: string, beat?: AIPracticeBeat) {
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

    // Only this beat's turns go to the model — see AIPracticeBeat.historyFrom.
    const beatHistory = history.slice(beat?.historyFrom ?? 0);
    const reply = await aiPracticeService.sendMessage(
      scenarioId,
      [...beatHistory, userMsg],
      text,
      getUnlockedWords(),
      beat,
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
    if (beat?.suggestReplies === false) setSuggestions([]);
    else refreshSuggestions([...beatHistory, userMsg, aiMsg], beat);
  }

  /** Lets the persona speak first partway through a scene (e.g. as a new frame
   * opens) without the player having said anything. `nudge` is the offscreen
   * cue the persona is reacting to — it is sent to the model but never shown
   * or stored, so it doesn't read as the player having spoken. */
  async function openFrame(beat: AIPracticeBeat, nudge: string) {
    setIsTyping(true);
    setSuggestions([]);
    setReadyToEnd(false);

    // A beat opens with a clean slate: nothing before it is part of this moment.
    const beatHistory = history.slice(beat.historyFrom ?? 0);
    const reply = await aiPracticeService.sendMessage(
      scenarioId,
      beatHistory,
      nudge,
      getUnlockedWords(),
      beat,
    );
    const aiMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'ai',
      text: reply.text,
      timestamp: new Date().toISOString(),
    };
    recordAiMessage(scenarioId, aiMsg);
    setIsTyping(false);
    if (beat.suggestReplies === false) setSuggestions([]);
    else refreshSuggestions([...beatHistory, aiMsg], beat);
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
    openFrame,
    restart,
  };
}
