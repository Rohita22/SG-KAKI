import type { Badge } from '@/content/types';
import { clsx } from '@/lib/clsx';

export function BadgeCard({ badge, earned }: { badge: Badge; earned: boolean }) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center gap-1.5 rounded-2xl p-3 text-center',
        earned ? 'bg-sg-xp/10' : 'bg-black/[0.03]',
      )}
    >
      <span
        className={clsx(
          'flex size-14 items-center justify-center rounded-full text-2xl',
          earned ? 'bg-sg-xp/20' : 'bg-black/5 grayscale opacity-50',
        )}
      >
        {badge.icon}
      </span>
      <p
        className={clsx(
          'text-[11px] font-bold leading-tight',
          earned ? 'text-sg-navy' : 'text-sg-navy/40',
        )}
      >
        {badge.name}
      </p>
    </div>
  );
}
