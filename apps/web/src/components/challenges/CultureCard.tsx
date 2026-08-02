import { Lightbulb } from 'lucide-react';
import type { CultureCardChallenge as CultureCardChallengeData } from '@/content/types';
import type { ChallengeComponentProps } from './types';
import { Button } from '@/components/ui/Button';

export function CultureCard({
  challenge,
  onCheck,
}: ChallengeComponentProps<CultureCardChallengeData>) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-3xl bg-gradient-to-br from-sg-xp/20 to-sg-xp/5 p-5">
        <div className="flex size-11 items-center justify-center rounded-2xl bg-sg-xp/30">
          <Lightbulb className="size-6 text-sg-navy" />
        </div>
        <h2 className="mt-3 text-lg font-black text-sg-navy">{challenge.prompt}</h2>
        <p className="mt-2 text-sm font-medium leading-relaxed text-sg-navy/80">
          {challenge.body}
        </p>
      </div>

      <Button
        variant="primary"
        size="lg"
        className="w-full"
        onClick={() => onCheck({ isCorrect: true, xpAwarded: challenge.xp })}
      >
        Continue
      </Button>
    </div>
  );
}
