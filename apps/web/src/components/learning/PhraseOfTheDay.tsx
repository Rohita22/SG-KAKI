import type { Phrase } from '@/content/types';
import { CATEGORY_META } from '@/content/types';
import { PronunciationButton } from './PronunciationButton';

export function PhraseOfTheDay({ phrase, onOpen }: { phrase: Phrase; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative w-full overflow-hidden rounded-3xl border border-sg-xp/30 bg-gradient-to-br from-sg-xp/25 via-white/70 to-sg-blue/10 p-5 text-left shadow-card backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-lg sm:p-6"
    >
      <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-sg-xp-hover">
        ⭐ Phrase of the Day
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <h2 className="text-3xl font-extrabold text-sg-navy">{phrase.word}</h2>
        <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-black text-sg-navy/50">
          {CATEGORY_META[phrase.category].emoji} {CATEGORY_META[phrase.category].label}
        </span>
      </div>
      <p className="mt-0.5 text-xs font-semibold text-sg-navy/50">
        {phrase.phonetic} · &ldquo;{phrase.pronunciation}&rdquo;
      </p>

      <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-sg-navy/40">Meaning</p>
          <p className="mt-0.5 text-sm font-semibold text-sg-navy">{phrase.meaning}</p>
        </div>
        {phrase.examples[0] && (
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-sg-navy/40">
              Example sentence
            </p>
            <p className="mt-0.5 text-sm font-medium italic text-sg-navy/70">
              &ldquo;{phrase.examples[0].text}&rdquo;
            </p>
          </div>
        )}
      </div>

      <div className="mt-4" onClick={(e) => e.stopPropagation()}>
        <PronunciationButton phrase={phrase} />
      </div>
    </button>
  );
}
