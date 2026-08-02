import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import type { Challenge } from '@/content/types';
import { CHALLENGE_RENDERERS } from './registry';
import { FeedbackPanel } from './FeedbackPanel';
import type { ChallengeResult } from './types';
import { ChallengeScene } from './scenes/ChallengeScene';
import { ChatBubbleThread } from './ChatBubbleThread';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LightningBadge } from '@/components/ui/LightningBadge';

interface ChallengeShellProps {
  challenge: Challenge;
  /** 0-based position of this challenge's lesson within its mission. */
  lessonIndex: number;
  /** Total lessons in this mission. */
  lessonTotal: number;
  onComplete: (result: ChallengeResult) => void;
}

const NO_FOOTER_TYPES = new Set(['culture-card', 'sort', 'match', 'read-the-room']);

/** Read the Room already reveals its own nuance via "Explain" before Continue —
 * the shared feedback panel shouldn't repeat the identical explanation text. */
const SUPPRESS_FEEDBACK_EXPLANATION_TYPES = new Set(['read-the-room']);

export function ChallengeShell({
  challenge,
  lessonIndex,
  lessonTotal,
  onComplete,
}: ChallengeShellProps) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'answering' | 'feedback'>('answering');
  const [result, setResult] = useState<ChallengeResult | null>(null);
  const [showHint, setShowHint] = useState(false);

  const ChallengeComponent = CHALLENGE_RENDERERS[challenge.type];
  const hasChatThread = 'chatThread' in challenge && !!challenge.chatThread;
  const showLeftColumn = challenge.type !== 'culture-card';

  function handleChecked(r: ChallengeResult) {
    if (challenge.type === 'culture-card') {
      onComplete(r);
      return;
    }
    setResult(r);
    setPhase('feedback');
  }

  function handleSkip() {
    handleChecked({ isCorrect: false, xpAwarded: 0 });
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col p-4 sm:p-6 lg:p-10">
      <div className="flex items-center gap-3 pb-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sg-navy/6 text-sg-navy transition-colors hover:bg-sg-navy/10"
        >
          <ChevronLeft className="size-5" />
        </button>
        <div className="flex-1">
          <p className="mb-1 text-xs font-bold text-sg-navy/40">
            Lesson {lessonIndex + 1} of {lessonTotal}
          </p>
          <ProgressBar progress={lessonTotal ? lessonIndex / lessonTotal : 0} />
        </div>
        <LightningBadge xp={challenge.xp} />
      </div>

      <div className="relative flex min-h-[480px] flex-col gap-6 rounded-3xl bg-sg-bg lg:flex-row lg:items-start">
        {showLeftColumn && (
          <div className="lg:w-[42%] lg:shrink-0">
            {hasChatThread && 'chatThread' in challenge && challenge.chatThread ? (
              <ChatBubbleThread thread={challenge.chatThread} />
            ) : (
              <ChallengeScene scene={challenge.scene} />
            )}
          </div>
        )}

        <div className="min-w-0 flex-1">
          {showHint && (
            <p className="mb-3 rounded-xl bg-sg-xp/15 px-3.5 py-2.5 text-xs font-semibold text-sg-navy">
              💡 Trust your instinct — think about what keeps things smooth and
              considerate for everyone around you.
            </p>
          )}
          <ChallengeComponent challenge={challenge as never} onCheck={handleChecked} />

          {phase === 'answering' && !NO_FOOTER_TYPES.has(challenge.type) && (
            <div className="mt-6 flex items-center justify-between text-sm font-bold text-sg-navy/40">
              <button type="button" onClick={() => setShowHint((v) => !v)}>
                Hint
              </button>
              <button type="button" onClick={handleSkip}>
                Skip
              </button>
            </div>
          )}
        </div>

        <AnimatePresence>
          {phase === 'feedback' && result && (
            <motion.div key="feedback">
              <FeedbackPanel
                isCorrect={result.isCorrect}
                xpAwarded={result.xpAwarded}
                explanation={
                  SUPPRESS_FEEDBACK_EXPLANATION_TYPES.has(challenge.type)
                    ? ''
                    : challenge.explanation
                }
                seed={challenge.id}
                onContinue={() => onComplete(result)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
