import { Send } from 'lucide-react';
import { SuggestedReplyChip } from './SuggestedReplyChip';

export interface SinglishHint {
  id: string;
  word: string;
  meaning: string;
}

/**
 * The reply-input footer shared by every AI Practice scenario, whether it
 * renders inside the illustrated VisualNovelScene or the plain-chat fallback
 * (scenarios without art yet): AI-generated reply suggestions (falling back
 * to the scenario's static openers only for the very first turn, before any
 * AI message exists to base suggestions on), category-filtered Singlish
 * vocab hints, and the text input itself. Keeping this in one place is what
 * makes these behaviors consistent across every scene instead of drifting.
 */
export function ConversationControls({
  turnCount,
  suggestions,
  suggestionsLoading,
  isTyping,
  fallbackOpeners = [],
  singlishHints = [],
  draft,
  onDraftChange,
  onSend,
}: {
  turnCount: number;
  suggestions: string[];
  suggestionsLoading: boolean;
  isTyping: boolean;
  fallbackOpeners?: string[];
  singlishHints?: SinglishHint[];
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: (text: string) => void;
}) {
  const showFallbackOpeners =
    turnCount === 0 && suggestions.length === 0 && !suggestionsLoading && fallbackOpeners.length > 0;

  return (
    <>
      {!isTyping && suggestionsLoading && (
        <div className="flex gap-2 overflow-x-auto border-t border-black/5 px-5 py-3">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-8 w-28 shrink-0 animate-pulse rounded-full bg-sg-bg" />
          ))}
        </div>
      )}

      {!isTyping && !suggestionsLoading && showFallbackOpeners && (
        <div className="flex gap-2 overflow-x-auto border-t border-black/5 px-5 py-3">
          {fallbackOpeners.map((opener) => (
            <SuggestedReplyChip key={opener} label={opener} onClick={() => onSend(opener)} />
          ))}
        </div>
      )}

      {!isTyping && !suggestionsLoading && !showFallbackOpeners && suggestions.length > 0 && (
        <div className="flex gap-2 overflow-x-auto border-t border-black/5 px-5 py-3">
          {suggestions.map((reply) => (
            <SuggestedReplyChip key={reply} label={reply} onClick={() => onSend(reply)} />
          ))}
        </div>
      )}

      {singlishHints.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto border-t border-black/5 px-5 py-2.5">
          <span className="shrink-0 text-xs font-bold uppercase tracking-wide text-sg-navy/30">
            Try using
          </span>
          {singlishHints.map((hint) => (
            <button
              key={hint.id}
              type="button"
              title={hint.meaning}
              onClick={() => onDraftChange(draft ? `${draft.trim()} ${hint.word}` : hint.word)}
              className="shrink-0 rounded-full border-2 border-sg-xp/30 bg-sg-xp/10 px-3 py-1.5 text-xs font-bold text-sg-navy transition-colors hover:bg-sg-xp/20"
            >
              {hint.word}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-black/5 px-4 py-3">
        <input
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && draft.trim()) onSend(draft);
          }}
          placeholder="Type your reply..."
          className="min-h-11 flex-1 rounded-full bg-sg-bg px-4 text-sm font-medium text-sg-navy outline-none focus:ring-2 focus:ring-sg-blue/40"
        />
        <button
          type="button"
          onClick={() => draft.trim() && onSend(draft)}
          aria-label="Send"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sg-blue text-white disabled:opacity-40"
          disabled={!draft.trim()}
        >
          <Send className="size-5" />
        </button>
      </div>
    </>
  );
}
