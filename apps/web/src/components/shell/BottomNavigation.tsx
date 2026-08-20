import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, Compass, BarChart3, MessageCircle } from 'lucide-react';
import { clsx } from '@/lib/clsx';

const TABS = [
  { to: '/map', label: 'Journey', icon: Map, end: false },
  { to: '/field-guide', label: 'Field Guide', icon: Compass, end: false },
  { to: '/progress', label: 'Progress', icon: BarChart3, end: false },
  { to: '/practice', label: 'Quests', icon: MessageCircle, end: false },
];

export function BottomNavigation() {
  return (
    <nav
      aria-label="Primary"
      className="grid grid-cols-4 border-t border-black/5 bg-white/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden"
    >
      {TABS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            clsx(
              'relative flex flex-col items-center gap-1 rounded-xl py-1.5 text-[11px] font-semibold transition-colors',
              isActive ? 'text-sg-blue' : 'text-sg-navy/40 hover:text-sg-navy/70',
            )
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="bottom-nav-indicator"
                  className="absolute -top-2 h-[3px] w-6 rounded-full bg-sg-blue"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className="size-6"
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
