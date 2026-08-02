import { motion, useReducedMotion } from 'framer-motion';
import type { Phrase } from '@/content/types';
import { MAX_MASTERY } from '@/game/mastery';
import { Button } from '@/components/ui/Button';

interface MasteryAcknowledgmentProps {
  phrase: Phrase;
  onContinue: () => void;
}

/** Shown instead of a redundant review exercise when a phrase is already mastery 5. */
export function MasteryAcknowledgment({ phrase, onContinue }: MasteryAcknowledgmentProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 20 }}
      className="flex flex-col items-center gap-3 rounded-3xl bg-gradient-to-br from-sg-navy to-sg-navy-deep p-7 text-center text-white shadow-card-lg"
    >
      <span className="text-4xl">{phrase.usedIn.length > 0 ? '🎉' : '🎉'}</span>
      <span className="text-lg font-black">{phrase.word}</span>
      <span className="text-xl tracking-tight text-sg-xp" aria-hidden="true">
        {'★'.repeat(MAX_MASTERY)}
      </span>
      <p className="text-sm font-bold">You already know this!</p>
      <p className="text-sm font-medium text-white/70">
        Nice work — let's move on to a harder situation instead.
      </p>
      <Button variant="primary" size="lg" className="mt-2 w-full" onClick={onContinue}>
        Continue
      </Button>
    </motion.div>
  );
}
