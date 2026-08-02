import { ProgressBar } from '@/components/ui/ProgressBar';

interface ProgressStatsCardProps {
  levelName: string;
  levelNumber: number;
  xp: number;
  levelProgress: number;
  streakDays: number;
}

export function ProgressStatsCard({
  levelName,
  levelNumber,
  xp,
  levelProgress,
  streakDays,
}: ProgressStatsCardProps) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-card">
      <p className="text-xs font-bold uppercase tracking-wide text-sg-navy/40">
        Your Standing
      </p>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-extrabold text-sg-navy">
          ⭐ Level {levelNumber}
        </span>
        <span className="text-xs font-semibold text-sg-navy/50">{levelName}</span>
      </div>
      <div className="mt-2">
        <div className="mb-1 flex justify-between text-[11px] font-semibold text-sg-navy/40">
          <span>{xp} XP</span>
        </div>
        <ProgressBar progress={levelProgress} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-4">
        <span className="text-sm font-extrabold text-sg-navy">🔥 Streak</span>
        <span className="text-sm font-bold text-sg-navy/60">{streakDays} days</span>
      </div>
    </div>
  );
}
