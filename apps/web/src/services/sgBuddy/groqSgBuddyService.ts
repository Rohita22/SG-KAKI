import type { SgBuddyService } from './types';

// Empty by default: relative '/api/...' requests, handled by Vite's dev proxy
// (see vite.config.ts) or by same-origin deployment. Only set VITE_API_BASE_URL
// if the frontend and backend are deployed to different origins.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const FALLBACK_REPLY =
  "Hmm, having trouble connecting right now — mind trying that again in a moment?";

export const groqSgBuddyService: SgBuddyService = {
  async ask(context, question) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sg-buddy/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context, question }),
      });

      if (!response.ok) {
        console.error('[sg-buddy] backend returned', response.status, await response.text());
        return FALLBACK_REPLY;
      }

      const data = (await response.json()) as { reply?: string };
      return data.reply ?? FALLBACK_REPLY;
    } catch (err) {
      console.error('[sg-buddy] request failed:', err);
      return FALLBACK_REPLY;
    }
  },
};
