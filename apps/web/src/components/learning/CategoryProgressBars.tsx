import type { Category } from '@/content/types';
import { CATEGORY_META } from '@/content/types';
import { CATEGORY_STYLE } from './categoryStyle';
import { clsx } from '@/lib/clsx';

interface CategoryProgress {
  category: Category;
  unlocked: number;
  total: number;
}

const BAR_FILL: Record<Category, string> = {
  food: 'bg-[#E8B94D]',
  lingo: 'bg-[#8B5CF6]',
  socialVibes: 'bg-[#14B8A6]',
  gettingAround: 'bg-sg-blue',
  workCulture: 'bg-sg-coral',
};

export function CategoryProgressBars({ items }: { items: CategoryProgress[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map(({ category, unlocked, total }) => {
        const pct = total === 0 ? 0 : Math.round((unlocked / total) * 100);
        return (
          <div
            key={category}
            className={clsx('rounded-2xl border p-3.5', CATEGORY_STYLE[category].bg, CATEGORY_STYLE[category].border)}
          >
            <div className="flex items-center justify-between text-xs font-black text-sg-navy">
              <span>
                {CATEGORY_META[category].emoji} {CATEGORY_META[category].label}
              </span>
              <span className="text-sg-navy/50">
                {unlocked} / {total}
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/70">
              <div
                className={clsx('h-full rounded-full transition-all duration-500', BAR_FILL[category])}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
