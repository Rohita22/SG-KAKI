import { Lock } from 'lucide-react';
import type { Badge } from '@/content/types';
import { clsx } from '@/lib/clsx';

export function BadgeShelf({ badges, earnedIds }: { badges: Badge[]; earnedIds: string[] }) {
  const earned = new Set(earnedIds);

  return (
    <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:thin]">
      {badges.map((badge) => {
        const unlocked = earned.has(badge.id);
        return (
          <div
            key={badge.id}
            title={unlocked ? badge.description : `Locked — ${badge.description}`}
            className={clsx(
              'flex w-24 shrink-0 flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition-transform duration-200 hover:-translate-y-0.5',
              unlocked
                ? 'border-sg-xp/30 bg-gradient-to-b from-sg-xp/20 to-white/60 shadow-card'
                : 'border-sg-navy/10 bg-white/40',
            )}
          >
            <span
              className={clsx(
                'flex size-11 items-center justify-center rounded-full text-xl',
                unlocked ? 'bg-white/80 shadow-sm' : 'bg-sg-navy/5 text-sg-navy/25',
              )}
            >
              {unlocked ? badge.icon : <Lock className="size-4" />}
            </span>
            <p
              className={clsx(
                'text-[10px] font-black leading-tight',
                unlocked ? 'text-sg-navy' : 'text-sg-navy/35',
              )}
            >
              {unlocked ? badge.name : '???'}
            </p>
          </div>
        );
      })}
    </div>
  );
}
