import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, BarChart3, MessageCircle, Compass, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [collapsed, setCollapsed] = useState(false);
  const { state } = useProgress();
  const { level, levelProgress } = useDerivedProgress();

  return (
    <aside 
      onClick={() => collapsed && setCollapsed(false)}
      className={clsx(
        "relative flex shrink-0 flex-col pb-6 text-white bg-cover bg-center bg-no-repeat transition-all duration-300",
        collapsed ? "w-20 px-2 cursor-pointer" : "w-64 px-4"
      )}
      style={{ backgroundImage: "url('/images/sidebar-bg.png')" }}
    >
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setCollapsed(!collapsed);
        }}
        className="absolute -right-3 top-2 z-10 flex size-6 items-center justify-center rounded-full bg-sg-navy-deep text-white hover:bg-sg-navy shadow-md border border-white/20"
      >
        {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
      </button>

      <div className="px-2 text-center -mt-6">
        {collapsed ? (
          <img src="/images/logo.png" alt="SG Kaki" className="w-10 h-10 mx-auto object-contain rounded-xl" />
        ) : (
          <img src="/images/logo.png" alt="SG Kaki" className="w-full max-w-[280px] scale-110 mx-auto object-contain rounded-xl" />
        )}
      </div>

      <nav aria-label="Primary" className="-mt-6 flex flex-col gap-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              clsx(
                'relative flex items-center rounded-2xl py-2.5 text-sm font-semibold transition-colors',
                collapsed ? 'justify-center px-0' : 'gap-3 px-3',
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="size-5 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                {!collapsed && <span className="whitespace-nowrap">{label}</span>}
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active-dot"
                    className={clsx(
                      "rounded-full bg-sg-blue shrink-0",
                      collapsed ? "absolute left-2 top-1/2 h-1.5 w-1.5 -translate-y-1/2" : "ml-auto size-1.5"
                    )}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className={clsx("mt-auto flex flex-col gap-3 rounded-2xl bg-white/5", collapsed ? "p-3" : "p-4")}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-3 text-sm font-bold">
            <span title={`Streak: ${state.streakDays} days`} className="flex flex-col items-center gap-1">
              <span>🔥</span>
              <span className="text-[10px] text-white/60">{state.streakDays}</span>
            </span>
            <span title={`Level: ${level.level}`} className="flex flex-col items-center gap-1">
              <span className="text-sg-xp">⭐</span>
              <span className="text-[10px] text-white/60">{level.level}</span>
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between text-sm font-bold whitespace-nowrap">
              <span className="flex items-center gap-1.5">🔥 {state.streakDays}</span>
              <span className="flex items-center gap-1.5 text-sg-xp">
                ⭐ Level {level.level}
              </span>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-[11px] font-semibold text-white/50 whitespace-nowrap">
                <span className="truncate pr-2">{level.name}</span>
                <span className="shrink-0">{state.xp} XP</span>
              </div>
              <ProgressBar progress={levelProgress} className="h-1.5" />
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
