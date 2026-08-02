import { clsx } from '@/lib/clsx';

export function StreakCalendar({ streakDays }: { streakDays: number }) {
  const days = Array.from({ length: 7 }, (_, i) => i + 1);

  return (
    <div>
      <div className="flex items-center gap-1.5 text-lg font-black text-sg-navy">
        🔥 {streakDays} <span className="text-sm font-bold text-sg-navy/50">Days</span>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-2">
        {days.map((day) => {
          const active = day <= streakDays;
          return (
            <div key={day} className="flex flex-col items-center gap-1">
              <span
                className={clsx(
                  'flex size-8 items-center justify-center rounded-full text-sm',
                  active ? 'bg-sg-xp/20' : 'bg-black/5 grayscale opacity-50',
                )}
              >
                🔥
              </span>
              <span className="text-[10px] font-bold text-sg-navy/40">Day {day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
