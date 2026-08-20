import type { AIPracticeScenario, ChatMessage } from '@/content/types';
import { activeCountryPack } from '@/content/activeCountryPack';
import type { AIPracticeBeat, AIPracticeReply, AIPracticeService } from './types';

// Empty by default: relative '/api/...' requests, handled by Vite's dev proxy
// (see vite.config.ts) or by same-origin deployment. Only set VITE_API_BASE_URL
// if the frontend and backend are deployed to different origins.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const FALLBACK_REPLY =
  "Hmm, having trouble connecting right now — mind trying that again in a moment?";

function personaContext(scenario: AIPracticeScenario | undefined, beat?: AIPracticeBeat) {
  return {
    context: beat?.situation ?? (scenario ? `${scenario.title}. ${scenario.setup}` : undefined),
    // A beat may bring its own persona — see AIPracticeBeat.personaName.
    personaName: beat?.personaName ?? scenario?.personaName,
    personaDescription: beat?.personaDescription ?? scenario?.personaDescription,
    schoolName: scenario?.schoolName,
    className: scenario?.className,
    teacherName: scenario?.completionScript?.teacherName,
  };
}

async function postJson<T>(path: string, body: Record<string, unknown>): Promise<T | undefined> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error(`[ai-practice] ${path} returned`, response.status, await response.text());
      return undefined;
    }

    return (await response.json()) as T;
  } catch (err) {
    console.error(`[ai-practice] ${path} request failed:`, err);
    return undefined;
  }
}

export const groqAIPracticeService: AIPracticeService = {
  getScenario(id) {
    return activeCountryPack.aiScenarios.find((s) => s.id === id);
  },

  async sendMessage(
    scenarioId: string,
    history: ChatMessage[],
    userMessage: string,
    unlockedWords: string[],
    beat?: AIPracticeBeat,
  ) {
    const scenario = activeCountryPack.aiScenarios.find((s) => s.id === scenarioId);
    const data = await postJson<{ reply?: string; endConversation?: boolean }>(
      '/api/ai-practice/message',
      {
        ...personaContext(scenario, beat),
        endWhen: beat?.endWhen,
        history: history.map((m) => ({ role: m.role, text: m.text })),
        message: userMessage,
        // Every scenario gets natural-ending detection, not just ones with a
        // full scripted cutscene — plain-chat scenarios use it to enable the
        // "Finish" button at a natural point instead of a fixed turn count.
        detectEnding: true,
        unlockedWords,
      },
    );
    const reply: AIPracticeReply = {
      text: data?.reply ?? FALLBACK_REPLY,
      endConversation: data?.endConversation ?? false,
    };
    return reply;
  },

  async startConversation(scenarioId: string, unlockedWords: string[]) {
    const scenario = activeCountryPack.aiScenarios.find((s) => s.id === scenarioId);
    const data = await postJson<{ reply?: string }>('/api/ai-practice/message', {
      ...personaContext(scenario),
      opening: true,
      unlockedWords,
    });
    return data?.reply ?? FALLBACK_REPLY;
  },

  async getSuggestedReplies(
    scenarioId: string,
    history: ChatMessage[],
    unlockedWords: string[],
    beat?: AIPracticeBeat,
  ) {
    const scenario = activeCountryPack.aiScenarios.find((s) => s.id === scenarioId);
    const data = await postJson<{ suggestions?: string[] }>('/api/ai-practice/suggestions', {
      ...personaContext(scenario, beat),
      history: history.map((m) => ({ role: m.role, text: m.text })),
      unlockedWords,
    });
    return data?.suggestions ?? [];
  },
};
