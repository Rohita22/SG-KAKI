import { motion, type Transition } from 'framer-motion';

interface HangingFigureProps {
  className?: string;
  /** Local effect layered on top of position — a shake on a wrong answer, a drop on falling. */
  effect: 'none' | 'slip' | 'fall';
  reduceMotion: boolean;
}

const SLIP_TRANSITION: Transition = { duration: 0.5, ease: 'easeInOut' };
const FALL_TRANSITION: Transition = { duration: 0.9, ease: 'easeIn' };

/**
 * A minimal person silhouette gripping an overhead bar with both hands, matching the
 * flat single-color style already used for scene figures (components/challenges/scenes/figures.tsx)
 * — legs bent as if mid-swing. Hands always grip a single point at the top center of the
 * viewBox so the parent only needs to horizontally position this component, not the figure.
 */
export function HangingFigure({ className, effect, reduceMotion }: HangingFigureProps) {
  const effectAnimate = reduceMotion
    ? undefined
    : effect === 'slip'
      ? { x: [0, -5, 5, -4, 0], y: [0, 4, 0] }
      : effect === 'fall'
        ? { y: [0, 90], rotate: [0, 50], opacity: [1, 0] }
        : { y: [0, 3, 0] };

  const effectTransition =
    effect === 'slip' ? SLIP_TRANSITION : effect === 'fall' ? FALL_TRANSITION : { duration: 1.4, repeat: Infinity, ease: 'easeInOut' as const };

  return (
    <motion.svg
      viewBox="0 0 40 50"
      className={className}
      aria-hidden="true"
      animate={effectAnimate}
      transition={effectTransition}
    >
      {/* arms, gripping a single point directly overhead */}
      <path d="M20 2 L11 17" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M20 2 L29 17" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* head */}
      <circle cx="20" cy="10" r="6" fill="currentColor" />
      {/* torso */}
      <path d="M13 18c0-1.7 3-3 7-3s7 1.3 7 3v11c0 1.7-3 3-7 3s-7-1.3-7-3Z" fill="currentColor" />
      {/* bent legs, swept back slightly */}
      <path
        d="M16 32c-1 4-1 7 2 10M24 32c1 4 1 7-2 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </motion.svg>
  );
}
