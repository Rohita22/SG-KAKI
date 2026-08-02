import { motion, useReducedMotion } from 'framer-motion';
import { clsx } from '@/lib/clsx';

interface ProgressBarProps {
  progress: number; // 0..1
  color?: string;
  trackClassName?: string;
  className?: string;
}

export function ProgressBar({
  progress,
  color = 'var(--color-sg-xp)',
  trackClassName,
  className,
}: ProgressBarProps) {
  const reduceMotion = useReducedMotion();
  const pct = Math.min(100, Math.max(0, progress * 100));

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={clsx(
        'h-2.5 w-full overflow-hidden rounded-full bg-black/10',
        trackClassName,
        className,
      )}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: reduceMotion ? 0 : 0.7, ease: 'easeOut' }}
      />
    </div>
  );
}
