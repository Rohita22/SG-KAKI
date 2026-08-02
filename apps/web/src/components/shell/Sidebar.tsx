import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, BarChart3, MessageCircle, Compass } from 'lucide-react';
import { clsx } from '@/lib/clsx';
import { useProgress } from '@/state/useProgress';
import { useDerivedProgress } from '@/state/useDerivedProgress';
import { ProgressBar } from '@/components/ui/ProgressBar';

const NAV_ITEMS = [
  { to: '/map', label: 'Journey', icon: Map, end: false },
  { to: '/field-guide', label: 'Field Guide', icon: Compass, end: false },
  { to: '/progress', label: 'Progress', icon: BarChart3, end: false },
  { to: '/practice', label: 'AI Practice', icon: MessageCircle, end: false },
];

export function Sidebar() {
  const { state } = useProgress();
  const { level, levelProgress } = useDerivedProgress();

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-sg-navy px-4 py-6 text-white">
      <div className="px-2">
        <p className="text-xl font-black tracking-tight">
          SG MODE <span aria-hidden>🇸🇬</span>
        </p>
        <p className="mt-0.5 text-xs font-semibold text-sg-xp">
          Live it. Learn it. Love it.
        </p>
      </div>

      <nav aria-label="Primary" className="mt-8 flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                'relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="size-5" strokeWidth={isActive ? 2.5 : 2} />
                {label}
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active-dot"
                    className="ml-auto size-1.5 rounded-full bg-sg-blue"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-3 rounded-2xl bg-white/5 p-4">
        <div className="flex items-center justify-between text-sm font-bold">
          <span className="flex items-center gap-1.5">🔥 {state.streakDays}</span>
          <span className="flex items-center gap-1.5 text-sg-xp">
            ⭐ Level {level.level}
          </span>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-[11px] font-semibold text-white/50">
            <span>{level.name}</span>
            <span>{state.xp} XP</span>
          </div>
          <ProgressBar progress={levelProgress} className="h-1.5" />
        </div>
      </div>
    </aside>
  );
}
