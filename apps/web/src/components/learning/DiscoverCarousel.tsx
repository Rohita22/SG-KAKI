import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DiscoverFact } from '@/content/types';
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
            key={fact.emoji + fact.title}
            drag={reduceMotion ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={handleDragEnd}
            custom={direction}
            initial={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: direction * -60 }}
            transition={{ duration: reduceMotion ? 0 : 0.25, ease: 'easeOut' }}
            className="relative flex min-h-[240px] cursor-grab flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-sg-purple to-sg-purple-deep p-6 text-white shadow-card-lg active:cursor-grabbing"
          >
            <span className="text-4xl leading-none">{fact.emoji}</span>
            <div className="mt-4">
              <h3 className="text-xl font-extrabold text-balance">{fact.title}</h3>
              <p className="mt-2 text-sm font-medium leading-relaxed text-white/85">{fact.body}</p>
            </div>
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
        className="w-full"
        onClick={() => (isLast ? onDone() : goTo(index + 1))}
      >
        {isLast ? 'Continue' : 'Next'}
      </Button>
    </div>
  );
}
