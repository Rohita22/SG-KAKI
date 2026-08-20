import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Send, LifeBuoy } from 'lucide-react';
import { groqSgBuddyService } from '@/services/sgBuddy/groqSgBuddyService';

/**
 * Scene 4's own help panel. Its markup is its own — it is a lifeline dropped
 * over a moving scene, not the lesson-page accordion, and it has to sit on top
 * of the frame rather than under it.
 *
 * `open` is controlled by the scene rather than held here, because the clock
 * has to stop the moment this appears. Asking for help must never be the thing
 * that makes you late — that would teach players to guess instead of ask, which
 * is the exact opposite of the point.
 */
export function StuckPanel({
  open,
  onOpenChange,
  caption,
  situation,
  questions,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Where the player is, shown as the panel's subtitle. */
  caption: string;
  /** Fed to SG Buddy so the answer is about this spot, not about Singapore. */
  situation: string;
  questions: string[];
}) {
  const [draft, setDraft] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [exchanges, setExchanges] = useState<{ question: string; answer: string }[]>([]);

  async function ask(question: string) {
    if (!question.trim() || isAsking) return;
    setDraft('');
    setIsAsking(true);
    const answer = await groqSgBuddyService.ask(
      { missionTitle: 'Getting to the Office', lessonTitle: caption, situation },
      question,
    );
    setExchanges((prev) => [...prev, { question, answer }]);
    setIsAsking(false);
  }

  // The conversation is per-spot: what you asked on the bus is not much help on
  // a platform three stations later, and keeping it would push the useful
  // answer off the top of a short panel.
  function close() {
    setExchanges([]);
    setDraft('');
    onOpenChange(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-30 flex items-end bg-sg-navy/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="max-h-full w-full overflow-y-auto rounded-t-3xl bg-white p-4 shadow-2xl"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-sg-xp/25">
                  <LifeBuoy className="size-4 text-sg-navy" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-black text-sg-navy">SG Buddy</p>
                  <p className="truncate text-[11px] font-bold text-sg-navy/45">{caption}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="shrink-0 rounded-full p-1 text-sg-navy/40 transition-colors hover:bg-black/5 hover:text-sg-navy"
              >
                <X className="size-4" />
              </button>
            </div>

            {exchanges.length > 0 && (
              <div className="mb-3 flex flex-col gap-3">
                {exchanges.map((ex, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <p className="max-w-[85%] self-end rounded-2xl rounded-br-sm bg-sg-blue px-3 py-2 text-xs font-semibold text-white">
                      {ex.question}
                    </p>
                    <p className="max-w-[85%] self-start rounded-2xl rounded-bl-sm bg-sg-bg px-3 py-2 text-xs font-medium text-sg-navy">
                      {ex.answer}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {exchanges.length === 0 && questions.length > 0 && (
              <div className="mb-3 flex flex-col gap-1.5">
                {questions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => void ask(q)}
                    disabled={isAsking}
                    className="rounded-xl bg-sg-bg px-3 py-2.5 text-left text-xs font-bold text-sg-navy transition-colors hover:bg-black/10 disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {isAsking && (
              <p className="mb-2 text-xs font-bold text-sg-navy/40">SG Buddy is typing…</p>
            )}

            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void ask(draft.trim());
              }}
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask anything — the clock is paused"
                className="min-h-10 min-w-0 flex-1 rounded-full bg-sg-bg px-4 text-xs font-medium text-sg-navy outline-none placeholder:text-sg-navy/35 focus-visible:ring-2 focus-visible:ring-sg-blue/40"
              />
              <button
                type="submit"
                disabled={!draft.trim() || isAsking}
                aria-label="Ask"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sg-blue text-white transition-opacity disabled:opacity-40"
              >
                <Send className="size-4" />
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
