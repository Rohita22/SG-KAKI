import { useNavigate } from 'react-router-dom';
import { Lock, MessageCircle } from 'lucide-react';
import { activeCountryPack } from '@/content/activeCountryPack';
import { useProgress } from '@/state/useProgress';
import { getUnlockedScenarioIds } from '@/game/aiScenarioUnlocks';
import { Card } from '@/components/ui/Card';
import { ScreenBackdrop } from '@/components/shell/ScreenBackdrop';
import { clsx } from '@/lib/clsx';

const HUB_BG_URL = '/images/field-guide-bg.png';

export function AIPracticeHubScreen() {
  const { state } = useProgress();
  const navigate = useNavigate();

  const unlockedIds = new Set(
    getUnlockedScenarioIds(state.completedMissionIds, activeCountryPack.aiScenarios),
  );

  return (
    <div className="relative -mx-4 -my-5 min-h-[calc(100dvh+0.5rem)] shrink-0 px-4 py-5 sm:-mx-6 sm:px-6 lg:-mx-10 lg:-my-8 lg:px-10 lg:py-8">
      <ScreenBackdrop image={HUB_BG_URL} />

      <div className="relative z-10">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold text-sg-navy lg:text-2xl">Quests</h1>
          <span className="rounded-full bg-sg-xp/20 px-2 py-0.5 text-[10px] font-black text-sg-navy">
            BETA
          </span>
        </div>
        <p className="mt-1 text-sm text-sg-navy/50">
          Take on real conversations with new quests unlocking as you progress.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activeCountryPack.aiScenarios.map((scenario) => {
          const unlocked = unlockedIds.has(scenario.id);
          const gatingMission = activeCountryPack.missions.find(
            (m) => m.id === scenario.unlocksAfterMissionId,
          );
          return (
            <Card
              key={scenario.id}
              className={clsx(
                'flex flex-col gap-2',
                unlocked ? 'cursor-pointer' : 'cursor-default opacity-60',
              )}
              onClick={() => unlocked && navigate(`/practice/${scenario.id}`)}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={clsx(
                    'flex size-10 items-center justify-center rounded-2xl',
                    unlocked ? 'bg-sg-blue/12 text-sg-blue' : 'bg-black/5 text-sg-navy/30',
                  )}
                >
                  {unlocked ? <MessageCircle className="size-5" /> : <Lock className="size-4" />}
                </span>
                <h2 className="text-sm font-extrabold text-sg-navy">{scenario.title}</h2>
              </div>
              <p className="text-xs font-medium leading-relaxed text-sg-navy/55">
                {unlocked
                  ? scenario.setup
                  : `Unlocks after completing ${gatingMission?.title ?? 'a mission'}.`}
              </p>
            </Card>
          );
        })}
      </div>      </div>    </div>
  );
}
