import { motion, useReducedMotion } from 'framer-motion';
import type { Phrase } from '@/content/types';

export function UnlockCard({ phrase, delay = 0 }: { phrase: Phrase; delay?: number }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={
        reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 16, delay }
      }
      className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-sg-xp/25 to-sg-xp/10 px-4 py-3"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sg-xp/30 text-xl">
        📖
      </span>
      <div>
        <p className="text-sm font-black text-sg-navy">Phrase unlocked: {phrase.word}</p>
        <p className="text-xs font-semibold text-sg-navy/50">Added to your Phrase Book</p>
      </div>
    </motion.div>
  );
}
