import { useState } from 'react';
import type { OptionChallenge } from '@/content/types';
import type { ChallengeComponentProps } from './types';
import { OptionRow } from './OptionRow';

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export function MultipleChoiceChallenge({
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

      <div className="flex flex-col gap-2.5">
        {challenge.options.map((option, i) => (
          <OptionRow
            key={option.id}
            letter={LETTERS[i]}
            label={option.label}
            selected={selectedId === option.id}
            checked={checked}
            isCorrectOption={option.id === challenge.correctOptionId}
            onClick={() => handleSelect(option.id)}
          />
        ))}
      </div>
    </div>
  );
}
