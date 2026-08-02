import type { Category } from '@/content/types';

/** Distinct accent per category so the breakdown reads at a glance instead
 * of every bar rendering identically. */
export const CATEGORY_COLORS: Record<Category, string> = {
  lingo: 'var(--color-sg-blue)', // Speak Like a Local
  food: 'var(--color-sg-green)', // Eat Like a Local
  gettingAround: 'var(--color-sg-orange)', // Move Like a Local
  socialVibes: 'var(--color-sg-purple)', // Vibe Like a Local
  workCulture: 'var(--color-sg-teal)', // Work Like a Local
};
