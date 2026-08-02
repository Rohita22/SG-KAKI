import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Send, X } from 'lucide-react';
import { groqSgBuddyService } from '@/services/sgBuddy/groqSgBuddyService';
import type { SgBuddyContext } from '@/services/sgBuddy/types';

interface AskSGBuddyProps {
  context: SgBuddyContext;
  suggestedQuestions: string[];
}

interface Exchange {
  question: string;
  answer: string;
}

const GENERIC_QUESTIONS = [
  'Why does this matter?',
  'When would I actually use this?',
  'Is this true everywhere in Singapore?',
];

export function AskSGBuddy({ context, suggestedQuestions }: AskSGBuddyProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);

  const questions = suggestedQuestions.length > 0 ? suggestedQuestions : GENERIC_QUESTIONS;

  async function ask(question: string) {
    setDraft('');
    setIsAsking(true);
    const answer = await groqSgBuddyService.ask(context, question);
    setExchanges((prev) => [...prev, { question, answer }]);
    setIsAsking(false);
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-sg-navy px-4 py-2.5 text-xs font-black text-white"
      >
        🤖 Ask SG Buddy
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2 }}
            className="mt-3 rounded-3xl bg-white p-4 shadow-card-lg"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-full bg-sg-xp/25 text-base">
                  🤖
                </span>
                <div>
                  <p className="text-sm font-black text-sg-navy">SG Buddy</p>
                  <p className="text-[11px] font-bold text-sg-navy/45">
                    {context.missionTitle} → {context.lessonTitle}
                    {context.phraseWord ? ` · "${context.phraseWord}"` : ''}
                    {context.cultureTopicTitle ? ` · ${context.cultureTopicTitle}` : ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-sg-navy/40"
              >
                <X className="size-4" />
              </button>
            </div>

            {exchanges.length > 0 && (
              <div className="mb-3 flex max-h-56 flex-col gap-3 overflow-y-auto">
                {exchanges.map((ex, i) => (
                  <div key={i} className="flex flex-col gap-1.5">
                    <p className="self-end rounded-2xl rounded-br-sm bg-sg-blue px-3 py-2 text-xs font-semibold text-white">
                      {ex.question}
                    </p>
                    <p className="self-start rounded-2xl rounded-bl-sm bg-sg-bg px-3 py-2 text-xs font-medium text-sg-navy">
                      {ex.answer}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {exchanges.length === 0 && (
              <div className="mb-3 flex flex-col gap-1.5">
                {questions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => void ask(q)}
                    disabled={isAsking}
                    className="rounded-xl bg-sg-bg px-3 py-2.5 text-left text-xs font-bold text-sg-navy disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {isAsking && (
              <p className="mb-2 text-xs font-bold text-sg-navy/40">SG Buddy is typing…</p>
            )}

            <div className="flex items-center gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && draft.trim()) void ask(draft.trim());
                }}
                placeholder="Ask anything about this…"
                className="min-h-10 flex-1 rounded-full bg-sg-bg px-4 text-xs font-medium text-sg-navy outline-none focus:ring-2 focus:ring-sg-blue/40"
              />
              <button
                type="button"
                onClick={() => draft.trim() && void ask(draft.trim())}
                disabled={!draft.trim() || isAsking}
                aria-label="Ask"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sg-blue text-white disabled:opacity-40"
              >
                <Send className="size-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
