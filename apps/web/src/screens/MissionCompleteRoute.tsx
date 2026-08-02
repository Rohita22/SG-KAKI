import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { activeCountryPack } from '@/content/activeCountryPack';
import { useProgress } from '@/state/useProgress';
import { useDerivedProgress } from '@/state/useDerivedProgress';
import { Button } from '@/components/ui/Button';
import { Confetti } from '@/components/celebration/Confetti';

interface CompleteNavState {
  xpAwarded?: number;
  newBadgeIds?: string[];
  newlyUnlockedMissionIds?: string[];
}

export function MissionCompleteRoute() {
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useProgress();
  const { journeyProgress } = useDerivedProgress();
  const navState = (location.state as CompleteNavState | null) ?? {};

  const mission = activeCountryPack.missions.find((m) => m.id === missionId);
  if (!mission) return null;

  const newBadges = activeCountryPack.badges.filter((b) =>
    (navState.newBadgeIds ?? []).includes(b.id),
  );
  const nextUnlockedId = navState.newlyUnlockedMissionIds?.[0];

  function handleContinue() {
    if (nextUnlockedId) {
      navigate(`/missions/${nextUnlockedId}/unlocked`, { replace: true });
    } else {
      navigate('/map', { replace: true, state: { justCompletedMissionId: mission!.id } });
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-5xl items-center p-4 sm:p-6 lg:p-10">
      <div className="grid w-full grid-cols-1 overflow-hidden rounded-3xl bg-gradient-to-br from-sg-navy-deep to-sg-navy text-white lg:grid-cols-2">
        <div className="relative flex min-h-64 items-center justify-center overflow-hidden p-10 lg:min-h-full">
          <Confetti count={36} />
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 14 }}
            className="flex size-40 items-center justify-center rounded-full bg-white/10 text-7xl shadow-card-lg lg:size-56 lg:text-8xl"
          >
            {mission.icon}
          </motion.div>
        </div>

        <div className="flex flex-col justify-center gap-6 p-8 text-center lg:p-12 lg:text-left">
          <div>
            <motion.h1
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-3xl font-black text-sg-xp sm:text-4xl"
            >
              MISSION COMPLETE!
            </motion.h1>
            <p className="mt-2 text-lg font-extrabold">{mission.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
            <StatChip label="XP Earned" value={`+${navState.xpAwarded ?? mission.completionXp}`} />
            <StatChip label="Badges" value={`${newBadges.length}`} />
            <StatChip label="Streak" value={`🔥 ${state.streakDays}`} />
            <StatChip label="Singapore Unlocked" value={`${journeyProgress}%`} />
          </div>

          {newBadges.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
              {newBadges.map((b) => (
                <span
                  key={b.id}
                  className="rounded-full bg-sg-xp/20 px-3 py-1.5 text-xs font-bold text-sg-xp"
                >
                  🏆 {b.icon} {b.name}
                </span>
              ))}
            </div>
          )}

          <div className="flex justify-center lg:justify-start">
            <Button variant="primary" size="lg" onClick={handleContinue}>
              {nextUnlockedId ? "See What's Next" : 'Back to Journey'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 px-4 py-3">
      <p className="text-lg font-black">{value}</p>
      <p className="text-[11px] font-semibold text-white/60">{label}</p>
    </div>
  );
}
