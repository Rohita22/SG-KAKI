import type { Badge, Mission } from '@/content/types';
import type { MissionStatus } from '@/game/unlocks';
import { Button } from '@/components/ui/Button';
import { SavvyRing } from '@/components/progress/SavvyRing';

interface MissionSummaryPanelProps {
  mission: Mission;
  status: MissionStatus;
  lessonsDone: number;
  lessonsTotal: number;
  badge?: Badge;
  completedChallengesInMission: number;
  onContinue: () => void;
  onRapidReview: () => void;
}

const RAPID_REVIEW_MIN_CHALLENGES = 3;

export function MissionSummaryPanel({
  mission,
  status,
  lessonsDone,
  lessonsTotal,
  badge,
  completedChallengesInMission,
  onContinue,
  onRapidReview,
}: MissionSummaryPanelProps) {
  const percent = lessonsTotal ? Math.round((lessonsDone / lessonsTotal) * 100) : 0;

  return (
    <div className="rounded-3xl bg-white p-6 shadow-card lg:sticky lg:top-8">
      <div className="flex items-center gap-3">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-sg-xp/15 text-3xl">
          {mission.icon}
        </span>
        <div className="min-w-0">
          <h1 className="text-lg font-extrabold leading-tight text-sg-navy">
            {mission.title}
          </h1>
          <p className="text-xs text-sg-navy/50">{mission.subtitle}</p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <SavvyRing value={percent} size={84} />
        <div>
          <p className="text-sm font-bold text-sg-navy">
            {lessonsDone} / {lessonsTotal} lessons
          </p>
          <p className="mt-1 text-sm font-bold text-sg-xp">
            +{mission.completionXp} XP available
          </p>
          {badge && (
            <p className="mt-1 text-xs font-semibold text-sg-navy/50">
              🏆 Earn "{badge.name}"
            </p>
          )}
        </div>
      </div>

      {status === 'locked' ? (
        <p className="mt-5 rounded-xl bg-black/5 px-4 py-3 text-center text-sm font-semibold text-sg-navy/50">
          🔒 Complete the previous mission to unlock.
        </p>
      ) : status === 'completed' ? (
        <p className="mt-5 rounded-xl bg-sg-success/10 px-4 py-3 text-center text-sm font-bold text-sg-success">
          ✓ Mission complete
        </p>
      ) : (
        <Button variant="primary" size="lg" className="mt-5 w-full" onClick={onContinue}>
          {lessonsDone === 0 ? 'Start Lesson' : 'Continue Lesson'}
        </Button>
      )}

      {completedChallengesInMission >= RAPID_REVIEW_MIN_CHALLENGES && (
        <Button variant="secondary" size="md" className="mt-2.5 w-full" onClick={onRapidReview}>
          🐒 Rapid Review
        </Button>
      )}
    </div>
  );
}
