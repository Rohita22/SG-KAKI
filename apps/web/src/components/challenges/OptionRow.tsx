import { Check, X } from 'lucide-react';
import { clsx } from '@/lib/clsx';

interface OptionRowProps {
  letter?: string;
  label: string;
  selected: boolean;
  checked: boolean;
  isCorrectOption: boolean;
  onClick: () => void;
}

export function OptionRow({
  letter,
  label,
  selected,
  checked,
  isCorrectOption,
  onClick,
}: OptionRowProps) {
  const showCorrect = checked && isCorrectOption;
  const showWrong = checked && selected && !isCorrectOption;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={checked}
      className={clsx(
        'flex w-full min-h-14 items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sg-blue/40',
        !checked && selected && 'border-sg-blue bg-sg-blue/5 text-sg-navy',
        !checked && !selected && 'border-black/5 bg-white text-sg-navy hover:border-sg-blue/30',
        showCorrect && 'border-sg-success bg-sg-success/10 text-sg-navy',
        showWrong && 'border-sg-red bg-sg-red/10 text-sg-navy',
        checked && !selected && !isCorrectOption && 'opacity-50',
      )}
    >
      {letter && (
        <span
          className={clsx(
            'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
            showCorrect && 'bg-sg-success text-white',
            showWrong && 'bg-sg-red text-white',
            !checked && 'bg-black/5 text-sg-navy/60',
            checked && !selected && !isCorrectOption && 'bg-black/5 text-sg-navy/40',
          )}
        >
          {letter}
        </span>
      )}
      <span className="flex-1">{label}</span>
      {showCorrect && <Check className="size-5 shrink-0 text-sg-success" strokeWidth={3} />}
      {showWrong && <X className="size-5 shrink-0 text-sg-red" strokeWidth={3} />}
    </button>
  );
}
