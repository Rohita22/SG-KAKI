import { useNavigate, useParams } from 'react-router-dom';
import { MonkeyBarsChallenge } from '@/components/monkeybars/MonkeyBarsChallenge';

export function MonkeyBarsScreen() {
  const { missionId } = useParams<{ missionId: string }>();
  const navigate = useNavigate();
  if (!missionId) return null;

  return (
    <MonkeyBarsChallenge
      missionId={missionId}
      onExit={() => navigate(`/missions/${missionId}`, { replace: true })}
    />
  );
}
