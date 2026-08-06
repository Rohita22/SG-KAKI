import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { AIPracticeStageMinigame } from '@/content/types';
import { clsx } from '@/lib/clsx';

const WRONG_RESET_MS = 700;

/**
 * A pick-the-right-item interaction that stands in for chat on scenario
 * stages like choping a hawker table with a tissue packet. Modeled on
 * `CanCannotChallenge`'s card grid, but forked rather than reused — that
 * component is wired to the Challenge content-registry system, not this
 * chat-hook-driven flow, and a wrong pick here should let the learner try
 * again instead of locking in a scored result.
 */
export function BagItemPicker({
  minigame,
  onPick,
}: {
  minigame: AIPracticeStageMinigame;
  onPick: (itemId: string) => boolean;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [wasWrong, setWasWrong] = useState(false);
  const [resolved, setResolved] = useState(false);

  function handleSelect(itemId: string) {
    if (resolved || selectedId) return;
    setSelectedId(itemId);
    const correct = onPick(itemId);
    if (correct) {
      setResolved(true);
      return;
    }
    setWasWrong(true);
    window.setTimeout(() => {
      setSelectedId(null);
      setWasWrong(false);
    }, WRONG_RESET_MS);
  }

  return (
    <div className="flex flex-col gap-3 border-t border-black/5 px-5 py-4">
      <p className="text-center text-sm font-bold text-sg-navy">{minigame.prompt}</p>
      <div className="grid grid-cols-4 gap-2.5">
        {minigame.items.map((item) => {
          const selected = selectedId === item.id;
          const showWrong = selected && wasWrong;
          const showCorrect = selected && resolved;

          return (
            <motion.button
              key={item.id}
              type="button"
              disabled={Boolean(selectedId)}
              onClick={() => handleSelect(item.id)}
              whileTap={selectedId ? undefined : { scale: 0.95 }}
              className={clsx(
                'relative flex flex-col items-center gap-1.5 rounded-2xl border-2 bg-white p-2 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sg-blue/40',
                !selected && 'border-black/5 hover:border-sg-blue/30',
                showWrong && 'border-sg-red bg-sg-red/10',
                showCorrect && 'border-sg-success bg-sg-success/10',
              )}
            >
              <img src={item.image} alt={item.label} className="aspect-square w-full object-contain" />
              <span className="text-[11px] font-bold text-sg-navy/70">{item.label}</span>
              {showCorrect && (
                <Check className="absolute -right-1.5 -top-1.5 size-5 rounded-full bg-sg-success p-0.5 text-white" strokeWidth={3} />
              )}
              {showWrong && (
                <X className="absolute -right-1.5 -top-1.5 size-5 rounded-full bg-sg-red p-0.5 text-white" strokeWidth={3} />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
