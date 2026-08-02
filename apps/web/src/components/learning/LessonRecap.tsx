import { Check } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Phrase } from '@/content/types';
import { UnlockCard } from './UnlockCard';
import { XPFloatUp } from '@/components/celebration/XPFloatUp';
import { Button } from '@/components/ui/Button';

interface LessonRecapProps {
  recap: string[];
  xpEarned: number;
  newlyUnlockedPhrases: Phrase[];
  onContinue: () => void;
}

export function LessonRecap({ recap, xpEarned, newlyUnlockedPhrases, onContinue }: LessonRecapProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.35, ease: 'easeOut' }}
      className="mx-auto flex w-full max-w-md flex-col gap-5 rounded-3xl bg-white p-6 shadow-card-lg"
    >
      <p className="text-xs font-bold uppercase tracking-wide text-sg-navy/40">
        Today you learned
      </p>

      <ul className="flex flex-col gap-2">
        {recap.map((line) => (
          <li key={line} className="flex items-center gap-2 text-sm font-bold text-sg-navy">
            <Check className="size-4 shrink-0 text-sg-success" strokeWidth={3} />
            {line}
          </li>
        ))}
      </ul>

      {newlyUnlockedPhrases.length > 0 && (
        <div className="flex flex-col gap-2">
          {newlyUnlockedPhrases.map((phrase, i) => (
            <UnlockCard key={phrase.id} phrase={phrase} delay={i * 0.12} />
          ))}
        </div>
      )}

      <div>
        <XPFloatUp xp={xpEarned} />
      </div>

      <Button variant="primary" size="lg" className="w-full" onClick={onContinue}>
        Continue
      </Button>
    </motion.div>
  );
}
