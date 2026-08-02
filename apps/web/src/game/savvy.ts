import type { Category, Challenge } from '@/content/types';
import { CATEGORY_META } from '@/content/types';

export interface SavvyResult {
  overall: number;
  categories: Record<Category, number>;
}

export function calculateSavvy(
  completedChallengeIds: string[],
  challenges: Challenge[],
): SavvyResult {
  const completed = new Set(completedChallengeIds);
  const categories = Object.keys(CATEGORY_META) as Category[];

  const categoryResults = {} as Record<Category, number>;
  let totalChallenges = 0;
  let totalCompleted = 0;

  for (const category of categories) {
    const inCategory = challenges.filter((c) => c.category === category);
    const completedInCategory = inCategory.filter((c) =>
      completed.has(c.id),
    ).length;
    categoryResults[category] = inCategory.length
      ? Math.round((completedInCategory / inCategory.length) * 100)
      : 0;
    totalChallenges += inCategory.length;
    totalCompleted += completedInCategory;
  }

  const overall = totalChallenges
    ? Math.round((totalCompleted / totalChallenges) * 100)
    : 0;

  return { overall, categories: categoryResults };
}
