import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight, Lightbulb, CheckCircle2, ArrowRight } from 'lucide-react';
import type { DiscoverFact } from '@/content/types';
import { activeCountryPack } from '@/content/activeCountryPack';
import { PronunciationButton } from '@/components/learning/PronunciationButton';
import { Button } from '@/components/ui/Button';
import { clsx } from '@/lib/clsx';

interface DiscoverCarouselProps {
  facts: DiscoverFact[];
  onDone: () => void;
}

const SWIPE_THRESHOLD = 60;

export function DiscoverCarousel({ facts, onDone }: DiscoverCarouselProps) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const reduceMotion = useReducedMotion();
  const fact = facts[index];
  const isLast = index === facts.length - 1;
  const associatedPhrase = fact.phraseId 
    ? activeCountryPack.phrases.find(p => p.id === fact.phraseId) 
    : undefined;

  function goTo(next: number) {
    if (next < 0 || next >= facts.length) return;
    setDirection(next > index ? 1 : -1);
    setIndex(next);
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_THRESHOLD) goTo(index + 1);
    else if (info.offset.x > SWIPE_THRESHOLD) goTo(index - 1);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={fact.title}
            drag={reduceMotion ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={handleDragEnd}
            custom={direction}
            initial={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: direction * -60 }}
            transition={{ duration: reduceMotion ? 0 : 0.25, ease: 'easeOut' }}
            className="relative flex cursor-grab flex-col overflow-hidden rounded-[2rem] bg-white p-4 shadow-card-lg active:cursor-grabbing sm:p-5"
          >
            {fact.tag && (
              <div className="mb-3 flex w-fit items-center gap-1.5 rounded-full bg-sg-purple/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sg-purple">
                <Lightbulb className="size-3" />
                {fact.tag}
              </div>
            )}

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                {fact.word && (
                  <h2 className="font-display text-4xl font-extrabold tracking-tight text-sg-navy sm:text-5xl">
                    {fact.word}
                  </h2>
                )}
                
                {!fact.word && fact.emoji && (
                  <span className="text-3xl leading-none">{fact.emoji}</span>
                )}
                
                <h3 className="mt-1.5 font-display text-base font-bold text-sg-purple text-balance">
                  {fact.title}
                </h3>
                {associatedPhrase && (
                  <div className="mt-2 mb-3 flex flex-wrap items-center gap-3">
                    <PronunciationButton phrase={associatedPhrase} />
                    <span className="text-[12px] font-semibold text-sg-navy/50">
                      {associatedPhrase.phonetic}
                    </span>
                  </div>
                )}
                <p className="mt-1 font-body text-[13px] font-medium leading-relaxed text-sg-text-body">
                  {fact.body}
                </p>
              </div>

              {fact.word && (
                <div className="flex flex-shrink-0 items-center justify-center p-1">
                  <div className="relative flex h-16 w-28 items-center justify-center rounded-2xl rounded-br-none bg-sg-purple text-white shadow-[0_8px_16px_-6px_#6d28d9] transition-transform hover:rotate-0 -rotate-6">
                    <span className="font-display text-3xl font-extrabold lowercase tracking-tight">
                      {fact.word.replace(/['"“”]/g, '')}
                    </span>
                    <div className="absolute -bottom-3 right-0 h-6 w-6 border-r-[10px] border-t-[14px] border-r-transparent border-t-sg-purple"></div>
                  </div>
                </div>
              )}
            </div>

            {fact.sections && fact.sections.length > 0 && (
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {fact.sections.map((section, idx) => (
                  <div key={idx} className={clsx("rounded-2xl p-3.5", idx % 2 === 0 ? "bg-sg-purple/5" : "bg-sg-purple/10")}>
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <div className="flex size-5 items-center justify-center rounded-full bg-sg-purple text-white shadow-sm">
                        <span className="text-[9px] leading-none">{section.icon}</span>
                      </div>
                      <h4 className="font-display text-[11px] font-bold text-sg-purple">{section.title}</h4>
                    </div>
                    {section.body && (
                      <p className="font-body text-[12px] font-medium leading-relaxed text-sg-text-body">
                        {section.body}
                      </p>
                    )}
                    {section.list && (
                      <ul className="flex flex-col gap-1">
                        {section.list.map((item, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[12px] font-medium text-sg-navy">
                            <CheckCircle2 className="mt-[2px] size-3 flex-shrink-0 text-sg-purple" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          aria-label="Previous"
          className="flex size-8 items-center justify-center rounded-full bg-black/5 text-sg-navy/60 disabled:opacity-30"
        >
          <ChevronLeft className="size-4" />
        </button>
        <div className="flex gap-1.5">
          {facts.map((f, i) => (
            <span
              key={f.emoji + f.title}
              className={clsx(
                'h-1.5 rounded-full transition-all',
                i === index ? 'w-5 bg-sg-purple' : 'w-1.5 bg-black/10',
              )}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => goTo(index + 1)}
          disabled={isLast}
          aria-label="Next"
          className="flex size-8 items-center justify-center rounded-full bg-black/5 text-sg-navy/60 disabled:opacity-30"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <Button
        variant="primary"
        size="lg"
        className="w-full sm:w-auto sm:self-center sm:px-12"
        onClick={() => (isLast ? onDone() : goTo(index + 1))}
      >
        {isLast ? 'Next Lesson' : 'Next'} <ArrowRight className="size-5" />
      </Button>
    </div>
  );
}
