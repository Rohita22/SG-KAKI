import type { Transition, Variants } from 'framer-motion';

/** Springy pop-in used for mission nodes, badges, and completion checkmarks. */
export const SPRING_POP_IN: Transition = { type: 'spring', stiffness: 260, damping: 18 };

/** Snappier spring for small confirmatory elements (checkmarks, badges). */
export const SPRING_SNAPPY: Transition = { type: 'spring', stiffness: 300, damping: 20 };

/** Per-index stagger delay, e.g. `transition={{ ...SPRING_POP_IN, delay: index * STAGGER_STEP }}`. */
export const STAGGER_STEP = 0.08;

export const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};
