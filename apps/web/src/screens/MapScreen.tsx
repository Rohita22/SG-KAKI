import { useLocation, useNavigate } from 'react-router-dom';
import type { Mission } from '@/content/types';
import { activeCountryPack } from '@/content/activeCountryPack';
import { useProgress } from '@/state/useProgress';
import { getMissionStatus } from '@/game/unlocks';
import { JourneyMap } from '@/components/map/JourneyMap';

interface MapNavState {
  justCompletedMissionId?: string;
}

export function MapScreen() {
  const { state } = useProgress();
  const navigate = useNavigate();
  const location = useLocation();
  const navState = (location.state as MapNavState | null) ?? {};

  const missions = [...activeCountryPack.missions].sort((a, b) => a.order - b.order);

  function handleSelect(mission: Mission) {
    navigate(`/missions/${mission.id}`);
  }

  return (
    <div className="-mx-4 -mb-9 -mt-5 flex min-h-0 flex-1 sm:-mx-6 lg:-mb-12 lg:-mt-8 lg:-mx-10">
      <JourneyMap
        missions={missions}
        statusFor={(id) => getMissionStatus(id, state.completedMissionIds, state.unlockedMissionIds)}
        completedLessonIds={state.completedLessonIds}
        onSelect={handleSelect}
        justCompletedMissionId={navState.justCompletedMissionId}
      />
    </div>
  );
}
