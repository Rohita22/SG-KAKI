import { masteryLabel, MAX_MASTERY } from '@/game/mastery';
import { clsx } from '@/lib/clsx';

export function MasteryStars({ level, className }: { level: number; className?: string }) {
  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <span className="flex gap-0.5 text-base leading-none tracking-tight" aria-hidden="true">
        {Array.from({ length: MAX_MASTERY }, (_, i) => (
          <span key={i} className={i < level ? 'text-sg-xp' : 'text-sg-navy/15'}>
            ★
          </span>
        ))}
      </span>
      <span className="text-xs font-extrabold text-sg-navy/50">{masteryLabel(level)}</span>
    </div>
  );
}
