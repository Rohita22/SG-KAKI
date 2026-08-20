import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import type { Lesson } from '@/content/types';
import { activeCountryPack } from '@/content/activeCountryPack';
import { useProgress } from '@/state/useProgress';
import { getMissionStatus } from '@/game/unlocks';
import { unlockAllContentEnabled } from '@/game/testMode';
import { LessonRow, type LessonStatus } from '@/components/missions/LessonRow';
import { MissionSummaryPanel } from '@/components/missions/MissionSummaryPanel';
import { ScreenBackdrop } from '@/components/shell/ScreenBackdrop';
import { ScreenCornerArt } from '@/components/shell/ScreenCornerArt';

const MISSION_BG_URL = '/images/field-guide-bg.png';
const CORNER_ART_URL = '/images/field-guide-passport.png';

export function MissionDetailScreen() {
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();
  const { state } = useProgress();

  const mission = activeCountryPack.missions.find((m) => m.id === missionId);
  if (!mission) return null;

  const missionStatus = getMissionStatus(
    mission.id,
    state.completedMissionIds,
    state.unlockedMissionIds,
  );

  const lessons = mission.lessonIds
    .map((id) => activeCountryPack.lessons.find((l) => l.id === id))
    .filter((l): l is Lesson => !!l)
    .sort((a, b) => a.order - b.order);

  const firstIncompleteIndex = lessons.findIndex(
    (l) => !state.completedLessonIds.includes(l.id),
  );

  function statusFor(index: number, lesson: Lesson): LessonStatus {
    if (state.completedLessonIds.includes(lesson.id)) return 'completed';
    if (missionStatus === 'locked') return 'locked';
    if (unlockAllContentEnabled()) return 'active';
    if (index === firstIncompleteIndex) return 'active';
    return 'locked';
  }

  const lessonsDone = lessons.filter((l) =>
    state.completedLessonIds.includes(l.id),
  ).length;
  const nextLesson =
    firstIncompleteIndex >= 0 ? lessons[firstIncompleteIndex] : lessons[0];
  const badge = activeCountryPack.badges.find((b) => b.id === mission.badgeIdOnComplete);

  const lessonIdsInMission = new Set(lessons.map((l) => l.id));
  const completedChallengesInMission = activeCountryPack.challenges.filter(
    (c) => lessonIdsInMission.has(c.lessonId) && state.completedChallengeIds.includes(c.id),
  ).length;

  return (
    <div className="relative -mx-4 -my-5 min-h-full shrink-0 px-4 py-5 sm:-mx-6 sm:px-6 lg:-mx-10 lg:-my-8 lg:px-10 lg:py-8">
      <ScreenBackdrop image={MISSION_BG_URL} />
      <ScreenCornerArt image={CORNER_ART_URL} />

      <div className="relative z-10">
        <button
          type="button"
          onClick={() => navigate('/map')}
          aria-label="Back to journey"
          className="mb-4 flex items-center gap-1.5 text-sm font-bold text-sg-navy/50 hover:text-sg-navy"
        >
          <ChevronLeft className="size-4" />
          Back to Journey
        </button>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="w-full shrink-0 lg:order-2 lg:w-80">
            <MissionSummaryPanel
              mission={mission}
              status={missionStatus}
              lessonsDone={lessonsDone}
              lessonsTotal={lessons.length}
              badge={badge}
              completedChallengesInMission={completedChallengesInMission}
              onContinue={() => navigate(`/lessons/${nextLesson.id}/play`)}
              onRapidReview={() => navigate(`/missions/${mission.id}/monkey-bars`)}
            />
          </div>

          <div className="min-w-0 flex-1 lg:order-1">
            <div className="flex flex-col gap-2">
              {lessons.map((lesson, i) => (
                <LessonRow
                  key={lesson.id}
                  lesson={lesson}
                  status={statusFor(i, lesson)}
                  onSelect={(l) => navigate(`/lessons/${l.id}/play`)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
