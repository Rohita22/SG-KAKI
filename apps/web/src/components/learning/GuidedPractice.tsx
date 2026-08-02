import { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import type { GuidedPracticeExercise, Phrase } from '@/content/types';
import { seededShuffle } from '@/lib/shuffle';
import { clsx } from '@/lib/clsx';

interface GuidedPracticeProps {
  exercise: GuidedPracticeExercise;
  phrases: Phrase[];
  /** Purple "Quick Review" styling for phrases woven in from earlier lessons. */
  isReview?: boolean;
  onComplete: (correctPhraseId?: string) => void;
}

const RETRY_MESSAGE = 'Not quite — try again!';

function Tag({ isReview }: { isReview?: boolean }) {
  return (
    <span
      className={clsx(
        'mb-3 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black',
        isReview ? 'bg-sg-purple/10 text-sg-purple' : 'bg-sg-blue/10 text-sg-blue',
      )}
    >
      {isReview ? '🔁 Quick Review' : 'Guided Practice'}
    </span>
  );
}

function OptionsExercise({
  prompt,
  subtext,
  options,
  correctLabel,
  isReview,
  onComplete,
}: {
  prompt: string;
  subtext?: string;
  options: string[];
  correctLabel: string;
  isReview?: boolean;
  onComplete: () => void;
}) {
  const [status, setStatus] = useState<'active' | 'wrong' | 'correct'>('active');
  const [picked, setPicked] = useState<string | null>(null);

  function handlePick(option: string) {
    if (status === 'correct') return;
    setPicked(option);
    if (option === correctLabel) {
      setStatus('correct');
      window.setTimeout(onComplete, 700);
    } else {
      setStatus('wrong');
      window.setTimeout(() => setStatus('active'), 900);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Tag isReview={isReview} />
      <p className="text-base font-extrabold text-sg-navy">{prompt}</p>
      {subtext && (
        <p className="-mt-2 rounded-2xl bg-sg-bg px-4 py-3 text-sm font-semibold text-sg-navy/80">
          {subtext}
        </p>
      )}
      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const isPicked = picked === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => handlePick(option)}
              disabled={status === 'correct'}
              className={clsx(
                'rounded-2xl border-2 px-4 py-3 text-left text-sm font-bold transition-colors',
                isPicked && status === 'wrong' && 'border-sg-blue bg-sg-blue/8 text-sg-navy',
                isPicked && status === 'correct' && 'border-sg-success bg-sg-success/10 text-sg-navy',
                !isPicked || status === 'active'
                  ? 'border-transparent bg-sg-bg text-sg-navy hover:border-sg-blue/30'
                  : '',
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
      {status === 'wrong' && (
        <p className="text-sm font-bold text-sg-blue">{RETRY_MESSAGE}</p>
      )}
      {status === 'correct' && (
        <p className="flex items-center gap-1.5 text-sm font-bold text-sg-success">
          <Check className="size-4" strokeWidth={3} /> Nice one!
        </p>
      )}
    </div>
  );
}

/**
 * Tap-to-build instead of drag-to-reorder: tap words from the bank in the order they
 * belong, tap a placed word to send it back. Simpler to use (no drag affordance to
 * discover, works identically on touch/mouse/keyboard) and matches the tap-based
 * interaction language of every other Guided Practice kind.
 */
function RearrangeExercise({
  prompt,
  correctOrder,
  isReview,
  onComplete,
}: {
  prompt: string;
  correctOrder: string[];
  isReview?: boolean;
  onComplete: () => void;
}) {
  const ids = useMemo(() => correctOrder.map((word, i) => `${i}-${word}`), [correctOrder]);
  const shuffled = useMemo(() => seededShuffle(ids, prompt), [ids, prompt]);
  const [placed, setPlaced] = useState<string[]>([]);
  const [status, setStatus] = useState<'active' | 'wrong' | 'correct'>('active');

  const pool = shuffled.filter((id) => !placed.includes(id));

  function labelFor(id: string) {
    return id.slice(id.indexOf('-') + 1);
  }

  function handlePlace(id: string) {
    if (status !== 'active') return;
    const next = [...placed, id];
    setPlaced(next);
    if (next.length < ids.length) return;

    const isCorrect = next.every((placedId, i) => placedId === ids[i]);
    if (isCorrect) {
      setStatus('correct');
      window.setTimeout(onComplete, 700);
    } else {
      setStatus('wrong');
      window.setTimeout(() => {
        setStatus('active');
        setPlaced([]);
      }, 1000);
    }
  }

  function handleRemove(id: string) {
    if (status !== 'active') return;
    setPlaced((prev) => prev.filter((p) => p !== id));
  }

  return (
    <div className="flex flex-col gap-4">
      <Tag isReview={isReview} />
      <p className="text-base font-extrabold text-sg-navy">{prompt}</p>

      <div className="flex min-h-14 flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed border-sg-navy/10 bg-white p-3">
        {placed.length === 0 && (
          <span className="text-xs font-semibold text-sg-navy/35">Tap words below to build the sentence</span>
        )}
        {placed.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => handleRemove(id)}
            disabled={status !== 'active'}
            className={clsx(
              'rounded-xl border-2 px-3 py-2 text-sm font-bold',
              status === 'correct' && 'border-sg-success bg-sg-success/10 text-sg-navy',
              status === 'wrong' && 'border-sg-red bg-sg-red/10 text-sg-navy',
              status === 'active' && 'border-sg-blue bg-sg-blue/8 text-sg-navy',
            )}
          >
            {labelFor(id)}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl bg-sg-bg p-3">
        {pool.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => handlePlace(id)}
            className="rounded-xl border-2 border-transparent bg-white px-3 py-2 text-sm font-bold text-sg-navy shadow-sm hover:border-sg-blue/30"
          >
            {labelFor(id)}
          </button>
        ))}
      </div>

      {status === 'wrong' && <p className="text-sm font-bold text-sg-blue">{RETRY_MESSAGE}</p>}
      {status === 'correct' && (
        <p className="flex items-center gap-1.5 text-sm font-bold text-sg-success">
          <Check className="size-4" strokeWidth={3} /> Nice one!
        </p>
      )}
    </div>
  );
}

export function GuidedPractice({ exercise, phrases, isReview, onComplete }: GuidedPracticeProps) {
  const byId = useMemo(
    () => Object.fromEntries(phrases.map((p) => [p.id, p])),
    [phrases],
  );

  if (exercise.kind === 'fill-blank') {
    return (
      <OptionsExercise
        prompt={exercise.prompt}
        subtext={exercise.sentence}
        options={exercise.options}
        correctLabel={exercise.answer}
        isReview={isReview}
        onComplete={() => onComplete()}
      />
    );
  }

  if (exercise.kind === 'rearrange') {
    return (
      <RearrangeExercise
        prompt={exercise.prompt}
        correctOrder={exercise.correctOrder}
        isReview={isReview}
        onComplete={() => onComplete()}
      />
    );
  }

  // tap-phrase / match-pronunciation: tap the correct phrase word from a shuffled set.
  const correctPhrase = byId[exercise.phraseId];
  if (!correctPhrase) return null;
  const options = seededShuffle(
    [correctPhrase.word, ...exercise.distractorPhraseIds.map((id) => byId[id]?.word).filter(Boolean)],
    exercise.id,
  );

  return (
    <OptionsExercise
      prompt={exercise.prompt}
      options={options as string[]}
      correctLabel={correctPhrase.word}
      isReview={isReview}
      onComplete={() => onComplete(correctPhrase.id)}
    />
  );
}
