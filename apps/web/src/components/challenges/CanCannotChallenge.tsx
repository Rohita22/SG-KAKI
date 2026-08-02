import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import type { OptionChallenge } from '@/content/types';
import type { ChallengeComponentProps } from './types';
import { clsx } from '@/lib/clsx';

export function CanCannotChallenge({
  challenge,
  onCheck,
}: ChallengeComponentProps<OptionChallenge>) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  function handleSelect(optionId: string) {
    if (checked) return;
    setSelectedId(optionId);
    setChecked(true);
    const isCorrect = optionId === challenge.correctOptionId;
    window.setTimeout(() => {
      onCheck({ isCorrect, xpAwarded: isCorrect ? challenge.xp : 0 });
    }, 650);
  }

  return (
    <div className="flex flex-col gap-4">
      {challenge.context && (
        <p className="text-sm font-medium text-sg-navy/70">{challenge.context}</p>
      )}
      <h2 className="text-lg font-bold text-sg-navy">{challenge.prompt}</h2>

      <div className="grid grid-cols-2 gap-3">
        {challenge.options.map((option) => {
          const isCorrectOption = option.id === challenge.correctOptionId;
          const selected = selectedId === option.id;
          const showCorrect = checked && isCorrectOption;
          const showWrong = checked && selected && !isCorrectOption;

          return (
            <motion.button
              key={option.id}
              type="button"
              disabled={checked}
              onClick={() => handleSelect(option.id)}
              whileTap={checked ? undefined : { scale: 0.95 }}
              className={clsx(
                'flex min-h-24 flex-col items-center justify-center gap-1.5 rounded-3xl border-2 text-xl font-black transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sg-blue/40',
                !checked && 'border-black/5 bg-white text-sg-navy hover:border-sg-blue/30',
                showCorrect && 'border-sg-success bg-sg-success/10 text-sg-navy',
                showWrong && 'border-sg-red bg-sg-red/10 text-sg-navy',
                checked && !selected && !isCorrectOption && 'opacity-40',
              )}
            >
              {option.label}
              {showCorrect && <Check className="size-6 text-sg-success" strokeWidth={3} />}
              {showWrong && <X className="size-6 text-sg-red" strokeWidth={3} />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
