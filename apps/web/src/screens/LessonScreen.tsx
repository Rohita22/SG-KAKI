import { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import type { GuidedPracticeExercise, Lesson, Mission, Phrase } from '@/content/types';
import { activeCountryPack } from '@/content/activeCountryPack';
import { useProgress } from '@/state/useProgress';
import { ChallengeShell } from '@/components/challenges/ChallengeShell';
import type { ChallengeResult } from '@/components/challenges/types';
import { getMissionStatus } from '@/game/unlocks';
import { pickReviewPhrase } from '@/game/review';
import { seededShuffle } from '@/lib/shuffle';
import { DiscoverCarousel } from '@/components/learning/DiscoverCarousel';
import { PhraseCard } from '@/components/learning/PhraseCard';
import { ExampleConversation } from '@/components/learning/ExampleConversation';
import { GuidedPractice } from '@/components/learning/GuidedPractice';
import { MasteryAcknowledgment } from '@/components/learning/MasteryAcknowledgment';
import { LessonRecap } from '@/components/learning/LessonRecap';
import { AskSGBuddy } from '@/components/learning/AskSGBuddy';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { ScreenBackdrop } from '@/components/shell/ScreenBackdrop';
import { journeyBackgroundForMission } from '@/components/shell/journeyBackgrounds';

type PreStep = 'discover' | 'phrase' | 'conversation' | 'guided-practice';
const PRE_STEP_ORDER: PreStep[] = ['discover', 'phrase', 'conversation', 'guided-practice'];

interface PendingNav {
  path: string;
  state?: Record<string, unknown>;
}

interface RecapData {
  newlyUnlockedPhrases: Phrase[];
  pendingNav: PendingNav;
}

export function LessonScreen() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const { state } = useProgress();

  const lesson = activeCountryPack.lessons.find((l) => l.id === lessonId);
  const mission = lesson
    ? activeCountryPack.missions.find((m) => m.id === lesson.missionId)
    : undefined;

  if (!lesson || !mission) return null;

  const missionStatus = getMissionStatus(
    mission.id,
    state.completedMissionIds,
    state.unlockedMissionIds,
  );
  if (missionStatus === 'locked') {
    return <Navigate to="/map" replace />;
  }

  // Keyed by lesson id so the whole pre-assessment/recap step machine resets
  // cleanly when navigation moves on to the next lesson (same route component).
  return (
    <div className="relative -mx-4 -my-5 min-h-[calc(100dvh+0.5rem)] shrink-0 px-4 py-5 sm:-mx-6 sm:px-6 lg:-mx-10 lg:-my-8 lg:px-10 lg:py-8">
      <ScreenBackdrop image={journeyBackgroundForMission(mission.id)} tone="subtle" />
      <div className="relative z-10">
        <LessonFlow key={lesson.id} lesson={lesson} mission={mission} />
      </div>
    </div>
  );
}

function LessonFlow({ lesson, mission }: { lesson: Lesson; mission: Mission }) {
  const navigate = useNavigate();
  const { state, completeChallenge, incrementMastery } = useProgress();

  const challenges = lesson.challengeIds
    .map((id) => activeCountryPack.challenges.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => !!c);

  // Derived from progress state (not local state) so the current challenge is always
  // correct after a lesson change, remount, or page refresh — no index to desync.
  const index = challenges.findIndex((c) => !state.completedChallengeIds.includes(c.id));

  const lessonsInOrder = mission.lessonIds
    .map((id) => activeCountryPack.lessons.find((l) => l.id === id))
    .filter((l): l is Lesson => !!l)
    .sort((a, b) => a.order - b.order);
  const lessonIndex = lessonsInOrder.findIndex((l) => l.id === lesson.id);

  // Review-phrase weaving only applies to lessons that already teach their own guided
  // practice — "Mission Challenge" recap lessons deliberately skip Guided Practice
  // entirely (plan §Context), so they must not have a review exercise injected either.
  const hasOwnGuidedPractice = (lesson.guidedPractice?.length ?? 0) > 0;
  const reviewPhrase = useMemo(
    () =>
      hasOwnGuidedPractice
        ? pickReviewPhrase(state, activeCountryPack.phrases, lesson.phraseIds ?? [])
        : undefined,
    [lesson.id, hasOwnGuidedPractice], // eslint-disable-line react-hooks/exhaustive-deps -- pick once per lesson visit, not on every state change
  );

  function stepHasContent(step: PreStep): boolean {
    switch (step) {
      case 'discover':
        return (lesson.discover?.length ?? 0) > 0;
      case 'phrase':
        // Skip Phrase step if the discover cards already completely covered all the phrases
        const discoverPhraseIds = lesson.discover?.map(d => d.phraseId).filter(Boolean) || [];
        const lessonPhraseIds = lesson.phraseIds || [];
        if (lessonPhraseIds.length > 0 && lessonPhraseIds.every(id => discoverPhraseIds.includes(id))) {
          return false;
        }
        return lessonPhraseIds.length > 0;
      case 'conversation':
        return (lesson.exampleConversation?.length ?? 0) > 0;
      case 'guided-practice':
        return (lesson.guidedPractice?.length ?? 0) > 0 || !!reviewPhrase;
    }
  }

  function firstStepWithContent(): PreStep | null {
    return PRE_STEP_ORDER.find(stepHasContent) ?? null;
  }

  function nextStepAfter(step: PreStep): PreStep | null {
    const startAt = PRE_STEP_ORDER.indexOf(step) + 1;
    for (let i = startAt; i < PRE_STEP_ORDER.length; i++) {
      if (stepHasContent(PRE_STEP_ORDER[i])) return PRE_STEP_ORDER[i];
    }
    return null;
  }

  // A lesson with every challenge already completed is a *replay* — the learner is
  // revisiting it on purpose (e.g. tapping a "Done" lesson from the mission list), not
  // resuming mid-lesson. Replays walk through the same content but never touch progress
  // state: no XP, no re-triggering the lesson/mission/badge cascade.
  const isReplay = index === -1;

  // Pre-assessment content shows once, before the *first* challenge of a lesson — on a
  // fresh start or a full replay, but never on a genuine mid-lesson resume.
  const [preStep, setPreStep] = useState<PreStep | null>(() =>
    index === 0 || isReplay ? firstStepWithContent() : null,
  );
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [guidedIndex, setGuidedIndex] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);
  const [recap, setRecap] = useState<RecapData | null>(null);
  const [replayIndex, setReplayIndex] = useState(0);

  const guidedExercises: { exercise: GuidedPracticeExercise; isReview: boolean }[] = [
    ...(lesson.guidedPractice ?? []).map((exercise) => ({ exercise, isReview: false })),
  ];
  const reviewMastery = reviewPhrase ? (state.phraseMastery[reviewPhrase.id] ?? 0) : 0;
  const reviewIsMastered = !!reviewPhrase && reviewMastery >= 5;
  if (reviewPhrase && !reviewIsMastered) {
    const distractorPool = activeCountryPack.phrases
      .filter((p) => p.id !== reviewPhrase.id && p.category === reviewPhrase.category)
      .map((p) => p.id);
    const distractors = seededShuffle(distractorPool, reviewPhrase.id).slice(0, 2);
    guidedExercises.push({
      exercise: {
        id: `${lesson.id}-review-${reviewPhrase.id}`,
        kind: 'tap-phrase',
        prompt: `Remember this one? Tap the word for "${reviewPhrase.meaning}"`,
        phraseId: reviewPhrase.id,
        distractorPhraseIds: distractors,
      },
      isReview: true,
    });
  }

  function handleComplete(result: ChallengeResult) {
    const challenge = challenges[index];
    const events = completeChallenge(challenge.id, result.xpAwarded);
    setXpEarned((xp) => xp + result.xpAwarded);

    if (!events.lessonCompleted) {
      // More challenges remain in this lesson — the derived `index` above will
      // automatically point at the next uncompleted one on re-render.
      return;
    }

    let pendingNav: PendingNav;
    if (events.missionCompleted) {
      pendingNav = {
        path: `/missions/${events.missionCompleted}/complete`,
        state: {
          xpAwarded: events.missionCompletionXp,
          newBadgeIds: events.newBadgeIds,
          newlyUnlockedMissionIds: events.newlyUnlockedMissionIds,
        },
      };
    } else {
      const completedAfter = new Set([...state.completedLessonIds, lesson.id]);
      const nextLesson = lessonsInOrder.find((l) => !completedAfter.has(l.id));
      pendingNav = { path: nextLesson ? `/lessons/${nextLesson.id}/play` : `/missions/${mission.id}` };
    }

    const newlyUnlockedPhrases = events.newlyUnlockedPhraseIds
      .map((id) => activeCountryPack.phrases.find((p) => p.id === id))
      .filter((p): p is Phrase => !!p);

    setRecap({ newlyUnlockedPhrases, pendingNav });
  }

  if (recap) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col p-3 sm:p-5 lg:p-6">
        <LessonRecap
          recap={lesson.recap ?? []}
          xpEarned={xpEarned}
          newlyUnlockedPhrases={recap.newlyUnlockedPhrases}
          onContinue={() =>
            navigate(recap.pendingNav.path, { replace: true, state: recap.pendingNav.state })
          }
        />
      </div>
    );
  }

  if (preStep) {
    const buddyContext = {
      missionTitle: mission.title,
      lessonTitle: lesson.title,
    };

    return (
      <div className="mx-auto flex w-full max-w-xl flex-col p-3 sm:p-5 lg:p-6">
        <PreAssessmentHeader
          lessonIndex={lessonIndex}
          lessonTotal={lessonsInOrder.length}
          onBack={() => navigate(-1)}
        />

        {preStep === 'discover' && (
          <DiscoverCarousel
            facts={lesson.discover ?? []}
            onDone={() => setPreStep(nextStepAfter('discover'))}
          />
        )}

        {preStep === 'phrase' &&
          lesson.phraseIds &&
          (() => {
            const phrase = activeCountryPack.phrases.find(
              (p) => p.id === lesson.phraseIds![phraseIndex],
            );
            if (!phrase) return null;
            const isLastPhrase = phraseIndex === lesson.phraseIds!.length - 1;
            return (
              <div className="flex flex-col gap-4">
                <PhraseCard phrase={phrase} masteryLevel={state.phraseMastery[phrase.id]} />
                <AskSGBuddy
                  context={{ ...buddyContext, phraseWord: phrase.word }}
                  suggestedQuestions={[
                    `When would I actually say "${phrase.word}"?`,
                    `Is "${phrase.word}" ever inappropriate to use?`,
                  ]}
                />
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() =>
                    isLastPhrase
                      ? setPreStep(nextStepAfter('phrase'))
                      : setPhraseIndex((i) => i + 1)
                  }
                >
                  {isLastPhrase ? 'Continue' : 'Next Phrase'}
                </Button>
              </div>
            );
          })()}

        {preStep === 'conversation' && lesson.exampleConversation && (
          <ExampleConversation
            lines={lesson.exampleConversation}
            onContinue={() => setPreStep(nextStepAfter('conversation'))}
          />
        )}

        {preStep === 'guided-practice' &&
          (() => {
            if (guidedIndex >= guidedExercises.length) {
              if (reviewIsMastered && reviewPhrase) {
                return (
                  <MasteryAcknowledgment
                    phrase={reviewPhrase}
                    onContinue={() => setPreStep(nextStepAfter('guided-practice'))}
                  />
                );
              }
              setPreStep(nextStepAfter('guided-practice'));
              return null;
            }
            const { exercise, isReview } = guidedExercises[guidedIndex];
            return (
              <GuidedPractice
                key={exercise.id}
                exercise={exercise}
                phrases={activeCountryPack.phrases}
                isReview={isReview}
                onComplete={(correctPhraseId) => {
                  if (correctPhraseId) incrementMastery(correctPhraseId);
                  setGuidedIndex((i) => i + 1);
                }}
              />
            );
          })()}
      </div>
    );
  }

  if (isReplay) {
    if (replayIndex >= challenges.length) {
      return (
        <div className="mx-auto flex w-full max-w-md flex-col items-center gap-4 p-8 text-center">
          <span className="text-4xl">✅</span>
          <h2 className="text-lg font-black text-sg-navy">Nice, you reviewed this lesson!</h2>
          <p className="text-sm font-semibold text-sg-navy/60">
            No new XP here — you already earned it the first time through.
          </p>
          <Button
            variant="dark"
            size="lg"
            onClick={() => navigate(`/missions/${mission.id}`, { replace: true })}
          >
            Back to {mission.title}
          </Button>
        </div>
      );
    }
    const replayChallenge = challenges[replayIndex];
    return (
      <ChallengeShell
        key={replayChallenge.id}
        challenge={replayChallenge}
        lessonIndex={lessonIndex}
        lessonTotal={lessonsInOrder.length}
        onComplete={() => setReplayIndex((i) => i + 1)}
      />
    );
  }

  const challenge = challenges[index];
  return (
    <ChallengeShell
      key={challenge.id}
      challenge={challenge}
      lessonIndex={lessonIndex}
      lessonTotal={lessonsInOrder.length}
      onComplete={handleComplete}
    />
  );
}

function PreAssessmentHeader({
  lessonIndex,
  lessonTotal,
  onBack,
}: {
  lessonIndex: number;
  lessonTotal: number;
  onBack: () => void;
}) {
  return (
    <div className="flex items-center gap-2.5 pb-4">
      <button
        type="button"
        onClick={onBack}
        aria-label="Back"
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-black/5 text-sg-navy"
      >
        <ChevronLeft className="size-5" />
      </button>
      <div className="flex-1">
        <p className="mb-1 text-xs font-bold text-sg-navy/40">
          Lesson {lessonIndex + 1} of {lessonTotal}
        </p>
        <ProgressBar progress={lessonTotal ? lessonIndex / lessonTotal : 0} />
      </div>
    </div>
  );
}
