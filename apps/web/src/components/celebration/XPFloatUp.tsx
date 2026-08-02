import { motion, useReducedMotion } from 'framer-motion';
import { Zap } from 'lucide-react';

/**
 * Floats/bounces in, then settles into a persistent, still-visible reward
 * chip — it must never animate all the way to opacity 0. A reward the user
 * can't see confirms is a reward that doesn't feel like a reward.
 */
export function XPFloatUp({ xp }: { xp: number }) {
  const reduceMotion = useReducedMotion();

  if (xp <= 0) return null;

  return (
    <motion.span
      initial={reduceMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 14, scale: 0.6 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: 'spring', stiffness: 320, damping: 16, delay: 0.15 }
      }
      className="inline-flex items-center gap-1.5 rounded-full bg-sg-xp/20 px-4 py-2 font-black text-sg-xp"
    >
      <Zap className="size-5 fill-sg-xp" strokeWidth={2.5} />
      +{xp} XP
    </motion.span>
  );
}
