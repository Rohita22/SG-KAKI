import type { Phrase, ProgressState } from '@/content/types';
import { MAX_MASTERY } from './mastery';

/**
 * Picks one previously-unlocked phrase to resurface for review, weighted toward
 * whatever the learner knows least. Not a due-date scheduler — phrases get woven
 * into Guided Practice / Monkey Bars on the spot, so this just needs to answer
 * "what's the single best thing to re-show right now?"
 *
 * Returns undefined when there's nothing eligible yet (e.g. early in the first
 * mission) — callers must treat that as "skip the review moment", never an error.
 */
export function pickReviewPhrase(
  state: ProgressState,
  phrases: Phrase[],
  excludePhraseIds: string[] = [],
): Phrase | undefined {
  const excluded = new Set(excludePhraseIds);
  const candidates = state.unlockedPhraseIds
    .filter((id) => !excluded.has(id))
    .map((id) => phrases.find((p) => p.id === id))
    .filter((p): p is Phrase => !!p);

  if (candidates.length === 0) return undefined;

  // Weight: distance from full mastery + 1, so lower-mastery phrases are picked
  // more often but a mastered phrase can still occasionally resurface.
  const weighted = candidates.flatMap((phrase) => {
    const mastery = state.phraseMastery[phrase.id] ?? 1;
    const weight = MAX_MASTERY - mastery + 1;
    return Array(weight).fill(phrase) as Phrase[];
  });

  return weighted[Math.floor(Math.random() * weighted.length)];
}
