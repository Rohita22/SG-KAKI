import { useMemo, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { Challenge, Phrase } from '@/content/types';
import { activeCountryPack } from '@/content/activeCountryPack';
import { useProgress } from '@/state/useProgress';
import { CHALLENGE_RENDERERS } from '@/components/challenges/registry';
import { pickReviewPhrase } from '@/game/review';
import { seededShuffle } from '@/lib/shuffle';
import { Confetti } from '@/components/celebration/Confetti';
import { HangingFigure } from './HangingFigure';
import { MonkeyBarsRig } from './MonkeyBarsRig';
import { Button } from '@/components/ui/Button';
import { clsx } from '@/lib/clsx';

const MAX_HEARTS = 3;
const MAX_BARS = 6;
const REVIEW_BAR_COUNT = 2;
const XP_PER_CORRECT = 3;

type BarItem =
  | { kind: 'challenge'; id: string; challenge: Challenge }
  | { kind: 'review'; id: string; phrase: Phrase; options: string[] };

function ReviewBar({
  phrase,
  options,
  onResult,
}: {
  phrase: Phrase;
  options: string[];
  onResult: (isCorrect: boolean) => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);

  function handlePick(option: string) {
    if (picked) return;
    setPicked(option);
    const isCorrect = option === phrase.word;
    window.setTimeout(() => onResult(isCorrect), 650);
  }

  return (
    <div className="flex flex-col gap-4">
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-sg-purple/10 px-3 py-1.5 text-[11px] font-black text-sg-purple">
        🔁 Review
      </span>
      <h2 className="text-lg font-bold text-sg-navy">
        Tap the word for &ldquo;{phrase.meaning}&rdquo;
      </h2>
      <div className="flex flex-col gap-2.5">
        {options.map((option) => {
          const isCorrectOption = option === phrase.word;
          const showState = picked === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => handlePick(option)}
              disabled={!!picked}
              className={clsx(
                'flex min-h-14 items-center rounded-2xl border-2 px-4 py-3 text-left text-sm font-semibold transition-colors',
                !picked && 'border-black/5 bg-white text-sg-navy hover:border-sg-blue/30',
                showState && isCorrectOption && 'border-sg-success bg-sg-success/10',
                showState && !isCorrectOption && 'border-sg-red bg-sg-red/10',
                picked && !showState && 'opacity-50',
              )}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function MonkeyBarsChallenge({
  missionId,
  onExit,
}: {
  missionId: string;
  onExit: () => void;
}) {
  const { state, awardXp } = useProgress();
  const reduceMotion = useReducedMotion();

  const bars = useMemo<BarItem[]>(() => {
    const mission = activeCountryPack.missions.find((m) => m.id === missionId);
    const lessonIds = new Set(mission?.lessonIds ?? []);
    const completedInMission = activeCountryPack.challenges.filter(
      (c) =>
        lessonIds.has(c.lessonId) &&
        c.type !== 'culture-card' &&
        state.completedChallengeIds.includes(c.id),
    );
    const seed = Math.random().toString(36);
    const challengeBars: BarItem[] = seededShuffle(completedInMission, seed)
      .slice(0, MAX_BARS)
      .map((challenge) => ({ kind: 'challenge', id: challenge.id, challenge }));

    const reviewBars: BarItem[] = [];
    const usedPhraseIds: string[] = [];
    for (let i = 0; i < REVIEW_BAR_COUNT; i++) {
      const phrase = pickReviewPhrase(state, activeCountryPack.phrases, usedPhraseIds);
      if (!phrase) break;
      usedPhraseIds.push(phrase.id);
      const distractorPool = activeCountryPack.phrases
        .filter((p) => p.id !== phrase.id && p.category === phrase.category)
        .map((p) => p.word);
      const options = seededShuffle([phrase.word, ...distractorPool], `${seed}-${phrase.id}`).slice(
        0,
        3,
      );
      reviewBars.push({ kind: 'review', id: `review-${phrase.id}`, phrase, options });
    }

    // Interleave review bars roughly evenly through the run rather than tacking them on the end.
    const combined = [...challengeBars];
    reviewBars.forEach((bar, i) => {
      const insertAt = Math.min(
        combined.length,
        Math.floor(((i + 1) * combined.length) / (reviewBars.length + 1)) + i,
      );
      combined.splice(insertAt, 0, bar);
    });
    return combined;
  }, [missionId, state]); // eslint-disable-line react-hooks/exhaustive-deps -- bars are rolled once per playthrough, not re-rolled on every progress change

  const [currentIndex, setCurrentIndex] = useState(0);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [correctCount, setCorrectCount] = useState(0);
  const [status, setStatus] = useState<'playing' | 'cleared' | 'fell'>('playing');
  const [rigEffect, setRigEffect] = useState<'none' | 'slip' | 'fall'>('none');

  function handleResult(isCorrect: boolean) {
    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      const next = currentIndex + 1;
      if (next >= bars.length) {
        setStatus('cleared');
      } else {
        setCurrentIndex(next);
      }
      return;
    }
    const nextHearts = hearts - 1;
    setHearts(nextHearts);
    if (nextHearts <= 0) {
      setRigEffect('fall');
      window.setTimeout(() => setStatus('fell'), 900);
    } else {
      setRigEffect('slip');
      window.setTimeout(() => setRigEffect('none'), 500);
    }
  }

  if (bars.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 p-8 text-center">
        <p className="text-sm font-semibold text-sg-navy/60">
          Complete a few more challenges in this mission before Rapid Review has enough material.
        </p>
        <Button variant="dark" onClick={onExit}>
          Back
        </Button>
      </div>
    );
  }

  if (status !== 'playing') {
    const cleared = status === 'cleared';
    const bonusXp = correctCount * XP_PER_CORRECT;
    return (
      <div className="relative mx-auto flex w-full max-w-md flex-col items-center gap-4 overflow-hidden p-8 text-center">
        {cleared && <Confetti count={30} />}
        <HangingFigure
          effect="none"
          reduceMotion={!!reduceMotion}
          className={clsx('h-20 w-16', cleared ? 'text-sg-success' : 'text-sg-navy/60')}
        />
        <h2 className="text-xl font-black text-sg-navy">
          {cleared ? 'You crossed the bars!' : 'Take a breather!'}
        </h2>
        <p className="text-sm font-semibold text-sg-navy/60">
          {correctCount} of {bars.length} correct.
        </p>
        {bonusXp > 0 && (
          <Button
            variant="primary"
            size="lg"
            onClick={() => {
              awardXp(bonusXp);
              onExit();
            }}
          >
            Claim +{bonusXp} XP
          </Button>
        )}
        {bonusXp === 0 && (
          <Button variant="dark" size="lg" onClick={onExit}>
            Back to Mission
          </Button>
        )}
      </div>
    );
  }

  const bar = bars[currentIndex];
  const ChallengeComponent = bar.kind === 'challenge' ? CHALLENGE_RENDERERS[bar.challenge.type] : null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col p-4 sm:p-6 lg:p-10">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="md" onClick={onExit}>
          Exit
        </Button>
        <span className="flex gap-1 text-lg" aria-label={`${hearts} hearts remaining`}>
          {Array.from({ length: MAX_HEARTS }, (_, i) => (
            <span key={i}>{i < hearts ? '❤️' : '🤍'}</span>
          ))}
        </span>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-sky-100 via-sky-50 to-sg-bg p-4">
        <MonkeyBarsRig
          barCount={bars.length}
          currentIndex={currentIndex}
          isReviewBar={(i) => bars[i]?.kind === 'review'}
          effect={rigEffect}
          reduceMotion={!!reduceMotion}
        />
        <p className="mt-2 text-center text-xs font-bold text-sg-navy/40">
          Bar {currentIndex + 1} of {bars.length} · Rapid Review
        </p>
      </div>

      <div className="mt-6">
        {bar.kind === 'review' ? (
          <ReviewBar phrase={bar.phrase} options={bar.options} onResult={handleResult} />
        ) : (
          ChallengeComponent && (
            <ChallengeComponent
              key={bar.id}
              challenge={bar.challenge as never}
              onCheck={(result) => handleResult(result.isCorrect)}
            />
          )
        )}
      </div>
    </div>
  );
}
