import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Phrase } from '@/content/types';
import { CATEGORY_META } from '@/content/types';
import { PhraseGridCard } from './PhraseGridCard';

interface RecentlyLearnedRowProps {
  phrases: Phrase[];
  favoriteIds: Set<string>;
  onToggleFavorite: (id: string) => void;
  onSelect: (p: Phrase) => void;
}

/** A horizontally scrolling strip of the most recently unlocked phrases, with
 * arrow affordances — the list grows past what a single row can show. */
export function RecentlyLearnedRow({
  phrases,
  favoriteIds,
  onToggleFavorite,
  onSelect,
}: RecentlyLearnedRowProps) {
  const scroller = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    scroller.current?.scrollBy({ left: dir * 360, behavior: 'smooth' });
  };

  if (phrases.length === 0) return null;

  return (
    <section className="relative">
      <div className="mb-2.5 flex items-baseline gap-3">
        <h2 className="text-sm font-black text-sg-navy">Recently Learned</h2>
        <span className="text-xs font-bold text-sg-blue">Latest</span>
      </div>

      <div className="group relative">
        <div
          ref={scroller}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {phrases.map((p) => (
            <div key={p.id} className="w-[140px] shrink-0 snap-start sm:w-[150px]">
              <PhraseGridCard
                icon={CATEGORY_META[p.category].emoji}
                title={p.word}
                subtitle={p.meaning}
                category={p.category}
                unlocked
                xp={p.difficulty * 10}
                favorited={favoriteIds.has(p.id)}
                onToggleFavorite={() => onToggleFavorite(p.id)}
                onClick={() => onSelect(p)}
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scrollBy(-1)}
          className="absolute -left-3 top-1/2 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white text-sg-navy shadow-card-lg transition-opacity hover:bg-white group-hover:flex"
        >
          <ChevronLeft className="size-4" strokeWidth={3} />
        </button>
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scrollBy(1)}
          className="absolute -right-3 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white text-sg-navy shadow-card-lg hover:bg-white"
        >
          <ChevronRight className="size-4" strokeWidth={3} />
        </button>
      </div>
    </section>
  );
}
