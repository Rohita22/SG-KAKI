import type { Phrase } from '@/content/types';
import { CATEGORY_META } from '@/content/types';
import { PronunciationButton } from './PronunciationButton';
import { MasteryStars } from './MasteryStars';
import { Button } from '@/components/ui/Button';
import { clsx } from '@/lib/clsx';

interface PhraseCardProps {
  phrase: Phrase;
  masteryLevel?: number;
  onPractice?: () => void;
  className?: string;
}

const DIFFICULTY_DOTS = 3;

export function PhraseCard({ phrase, masteryLevel, onPractice, className }: PhraseCardProps) {
  return (
    <div
      className={clsx(
        'overflow-hidden rounded-3xl bg-white shadow-card-lg',
        className,
      )}
    >
      <div className="bg-gradient-to-br from-sg-xp/25 to-sg-xp/10 p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-extrabold text-sg-navy">{phrase.word}</h3>
              <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-black text-sg-navy/50">
                {CATEGORY_META[phrase.category].emoji} {CATEGORY_META[phrase.category].label}
              </span>
            </div>
            <p className="mt-0.5 text-xs font-semibold text-sg-navy/50">
              {phrase.phonetic} · &ldquo;{phrase.pronunciation}&rdquo;
            </p>
          </div>
          <span className="flex shrink-0 gap-1 pt-1.5" aria-label={`Difficulty ${phrase.difficulty} of ${DIFFICULTY_DOTS}`}>
            {Array.from({ length: DIFFICULTY_DOTS }, (_, i) => (
              <span
                key={i}
                className={clsx(
                  'size-1.5 rounded-full',
                  i < phrase.difficulty ? 'bg-sg-xp' : 'bg-sg-navy/15',
                )}
              />
            ))}
          </span>
        </div>
        <div className="mt-3.5">
          <PronunciationButton phrase={phrase} />
        </div>
      </div>

      <div className="flex flex-col gap-4 p-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-sg-navy/40">Meaning</p>
          <p className="mt-1 text-sm font-semibold leading-relaxed text-sg-navy">{phrase.meaning}</p>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-sg-navy/40">Used in</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {phrase.usedIn.map((u) => (
              <span
                key={u}
                className="rounded-full bg-sg-success/10 px-2.5 py-1 text-xs font-bold text-sg-success"
              >
                {u}
              </span>
            ))}
          </div>
        </div>

        {phrase.notUsedIn && phrase.notUsedIn.length > 0 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-sg-navy/40">
              Not usually in
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {phrase.notUsedIn.map((u) => (
                <span
                  key={u}
                  className="rounded-full bg-sg-red/10 px-2.5 py-1 text-xs font-bold text-sg-red"
                >
                  {u}
                </span>
              ))}
            </div>
          </div>
        )}

        {phrase.commonMistakes && phrase.commonMistakes.length > 0 && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-sg-navy/40">
              Common mistakes
            </p>
            <ul className="mt-1.5 space-y-1">
              {phrase.commonMistakes.map((m) => (
                <li key={m} className="text-xs font-medium text-sg-navy/70">
                  ❌ {m}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-sg-navy/40">Examples</p>
          <ul className="mt-1.5 space-y-1">
            {phrase.examples.map((ex) => (
              <li key={ex.text} className="text-sm font-medium italic text-sg-navy/70">
                &ldquo;{ex.text}&rdquo;
              </li>
            ))}
          </ul>
        </div>

        {masteryLevel !== undefined && (
          <div className="flex items-center justify-between border-t border-sg-navy/8 pt-3.5">
            <MasteryStars level={masteryLevel} />
          </div>
        )}

        {onPractice && (
          <Button variant="secondary" size="md" className="w-full" onClick={onPractice}>
            Practice this phrase
          </Button>
        )}
      </div>
    </div>
  );
}
