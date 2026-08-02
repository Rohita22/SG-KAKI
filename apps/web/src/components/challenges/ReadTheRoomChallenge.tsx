import { useState } from 'react';
import { Eye } from 'lucide-react';
import type { OptionChallenge } from '@/content/types';
import type { ChallengeComponentProps } from './types';
import { OptionRow } from './OptionRow';
import { Button } from '@/components/ui/Button';

export function ReadTheRoomChallenge({
  challenge,
  onCheck,
}: ChallengeComponentProps<OptionChallenge>) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [showExplain, setShowExplain] = useState(false);

  const isCorrect = selectedId === challenge.correctOptionId;

  function handleSelect(optionId: string) {
    if (checked) return;
    setSelectedId(optionId);
    setChecked(true);
  }

  function handleContinue() {
    onCheck({ isCorrect, xpAwarded: isCorrect ? challenge.xp : 0 });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 rounded-2xl bg-sg-navy px-4 py-2.5 text-white">
        <Eye className="size-5 text-sg-xp" />
        <span className="text-sm font-black tracking-wide">Read the Room</span>
      </div>

      <h2 className="text-base font-bold text-sg-navy">{challenge.prompt}</h2>

      <div className="flex flex-col gap-2.5">
        {challenge.options.map((option) => (
          <OptionRow
            key={option.id}
            label={option.label}
            selected={selectedId === option.id}
            checked={checked}
            isCorrectOption={option.id === challenge.correctOptionId}
            onClick={() => handleSelect(option.id)}
          />
        ))}
      </div>

      {checked && showExplain && (
        <p className="rounded-2xl bg-sg-blue/10 p-3.5 text-sm font-medium leading-relaxed text-sg-navy">
          {challenge.explanation}
        </p>
      )}

      {checked && (
        <div className="flex gap-2.5">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => setShowExplain((v) => !v)}
          >
            Explain
          </Button>
          <Button variant="primary" className="flex-1" onClick={handleContinue}>
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}
