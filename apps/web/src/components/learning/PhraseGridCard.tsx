import { Check, Lock, Sparkles } from 'lucide-react';
import type { Category } from '@/content/types';
import { CATEGORY_META } from '@/content/types';
import { CATEGORY_STYLE } from './categoryStyle';
import { clsx } from '@/lib/clsx';

interface PhraseGridCardProps {
  icon: string;
  title: string;
  subtitle?: string;
  category: Category;
  unlocked: boolean;
  xp?: number;
  hint?: string;
  favorited?: boolean;
  onToggleFavorite?: () => void;
  onClick?: () => void;
}

/** A collectible tile for a phrase or culture topic — reads its category at a
 * glance and teases what's behind a locked entry instead of a blank box. */
export function PhraseGridCard({
  icon,
  title,
  subtitle,
  category,
  unlocked,
  xp,
  hint,
  favorited,
  onToggleFavorite,
  onClick,
}: PhraseGridCardProps) {
  const style = CATEGORY_STYLE[category];

  if (!unlocked) {
    return (
      <div
        title={hint}
        className="group relative flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-sg-navy/15 bg-white/40 p-3 text-center backdrop-blur-sm"
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-sg-navy/5 text-xl text-sg-navy/25 blur-[1.5px]">
          {icon}
        </span>
        <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-wide text-sg-navy/35">
          <Lock className="size-3" strokeWidth={2.5} />
          Locked
        </div>
        <p className="text-sm font-black text-sg-navy/30">???</p>
        {hint && (
          <p className="px-1 text-[10px] font-semibold leading-snug text-sg-navy/35">{hint}</p>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'group relative flex aspect-[4/5] flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 text-center shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-lg active:translate-y-0 active:scale-[0.98]',
        style.bg,
        style.border,
      )}
    >
      {onToggleFavorite && (
        <span
          role="button"
          tabIndex={0}
          aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation();
              e.preventDefault();
              onToggleFavorite();
            }
          }}
          className={clsx(
            'absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full text-xs transition-colors',
            favorited ? 'bg-sg-xp text-white' : 'bg-white/70 text-sg-navy/30 hover:text-sg-xp',
          )}
        >
          ★
        </span>
      )}

      <span className="relative flex size-11 items-center justify-center rounded-full bg-white/70 text-xl shadow-sm transition-transform duration-200 group-hover:scale-110">
        {icon}
        <span className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-sg-success text-white ring-2 ring-white">
          <Check className="size-2.5" strokeWidth={3.5} />
        </span>
      </span>
      <p className="text-sm font-black leading-tight text-sg-navy">{title}</p>
      {subtitle && (
        <p className="line-clamp-2 text-[10px] font-semibold leading-snug text-sg-navy/55">
          {subtitle}
        </p>
      )}
      <span className={clsx('mt-0.5 rounded-full px-2 py-0.5 text-[9px] font-black', style.chip)}>
        {CATEGORY_META[category].label}
      </span>
      {xp !== undefined && (
        <span className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 rounded-full bg-white/70 px-1.5 py-0.5 text-[9px] font-black text-sg-xp-hover">
          <Sparkles className="size-2.5" /> +{xp}
        </span>
      )}
    </button>
  );
}
