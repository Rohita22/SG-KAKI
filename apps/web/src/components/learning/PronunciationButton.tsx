import { Volume2, Turtle, Zap } from 'lucide-react';
import type { Phrase } from '@/content/types';
import { isAudioSupported, playPhrase } from './AudioPlayer';
import { clsx } from '@/lib/clsx';

export function PronunciationButton({ phrase }: { phrase: Phrase }) {
  const supported = isAudioSupported() || !!phrase.audioUrl;
  if (!supported) return null;

  const urls = { audioUrl: phrase.audioUrl, audioUrlSlow: phrase.audioUrlSlow };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => playPhrase(phrase.word, 'normal', urls)}
        className="flex items-center gap-1.5 rounded-full bg-sg-navy px-3.5 py-2 text-xs font-black text-white"
      >
        <Volume2 className="size-3.5" />
        Listen
      </button>
      <button
        type="button"
        onClick={() => playPhrase(phrase.word, 'slow', urls)}
        className={clsx(
          'flex items-center gap-1.5 rounded-full bg-sg-navy/8 px-3.5 py-2 text-xs font-black text-sg-navy',
        )}
      >
        <Turtle className="size-3.5" />
        Slow
      </button>
      <button
        type="button"
        onClick={() => playPhrase(phrase.word, 'normal', urls)}
        className="flex items-center gap-1.5 rounded-full bg-sg-navy/8 px-3.5 py-2 text-xs font-black text-sg-navy"
      >
        <Zap className="size-3.5" />
        Normal
      </button>
    </div>
  );
}
