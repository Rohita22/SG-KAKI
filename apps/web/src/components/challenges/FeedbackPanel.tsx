import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { XPFloatUp } from '@/components/celebration/XPFloatUp';
import { clsx } from '@/lib/clsx';
import { SPRING_SNAPPY } from '@/lib/motion';

const CORRECT_HEADLINES = ['SHIOK! 😎', 'STEADY! 💪', 'CORRECT! 🎉'];
const INCORRECT_HEADLINES = ['GOOD TRY! 🙂', 'ALMOST THERE!'];
const CORRECT_EMOJI = ['😎', '💪', '🎉'];

function pickFrom<T>(list: T[], seed: string): T {
  const idx = seed.length % list.length;
  return list[idx];
}

interface FeedbackPanelProps {
  isCorrect: boolean;
  xpAwarded: number;
  /** Empty string suppresses the explanation card — used when the challenge
   * type (e.g. Read the Room) already showed its own nuance before Continue,
   * so the shared panel doesn't repeat identical text. */
  explanation: string;
  seed: string;
  onContinue: () => void;
}

export function FeedbackPanel({
  isCorrect,
  xpAwarded,
  explanation,
  seed,
  onContinue,
}: FeedbackPanelProps) {
  const headline = isCorrect
    ? pickFrom(CORRECT_HEADLINES, seed)
    : pickFrom(INCORRECT_HEADLINES, seed);
  const emoji = isCorrect ? pickFrom(CORRECT_EMOJI, seed) : '🙂';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={clsx(
        'absolute inset-0 z-20 flex flex-col items-center justify-center overflow-y-auto rounded-3xl bg-gradient-to-br p-6 text-center sm:p-10',
        isCorrect
          ? 'from-sg-success to-sg-green'
          : 'from-sg-purple to-sg-purple-deep',
      )}
    >
      <div className="w-full max-w-md">
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={SPRING_SNAPPY}
          className="mx-auto flex size-20 items-center justify-center rounded-full bg-white/15 text-4xl sm:size-24 sm:text-5xl"
        >
          {emoji}
        </motion.div>

        <motion.h2
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mt-5 text-3xl font-black text-white sm:text-4xl"
        >
          {headline}
        </motion.h2>
        <p className="mt-1 text-sm font-bold text-white/70">
          {isCorrect ? 'Correct!' : "That's not quite it."}
        </p>

        {explanation && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-5 rounded-2xl bg-white p-4 text-sm font-medium leading-relaxed text-sg-navy shadow-card"
          >
            {explanation}
          </motion.div>
        )}

        <div className="mt-6 flex flex-col items-center gap-5">
          <XPFloatUp xp={xpAwarded} />
          <Button variant="primary" size="lg" onClick={onContinue} className="w-full sm:w-auto">
            Continue
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
