import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { HangingFigure } from './HangingFigure';
import { clsx } from '@/lib/clsx';

const RUNG_SPACING = 72;
const RIG_PADDING = 40;
const RAIL_GAP = 10;

interface MonkeyBarsRigProps {
  barCount: number;
  currentIndex: number;
  isReviewBar: (index: number) => boolean;
  effect: 'none' | 'slip' | 'fall';
  reduceMotion: boolean;
}

/**
 * A horizontal ladder — the real "monkey bars" shape: two parallel rails with
 * perpendicular rungs between them, viewed from the side. The player's figure hangs
 * by both hands from the current rung and swings hand-over-hand to the next one on a
 * correct answer, matching how the playground equipment actually works.
 */
export function MonkeyBarsRig({
  barCount,
  currentIndex,
  isReviewBar,
  effect,
  reduceMotion,
}: MonkeyBarsRigProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const currentRungRef = useRef<HTMLDivElement>(null);
  const contentWidth = (barCount - 1) * RUNG_SPACING + RIG_PADDING * 2;

  useEffect(() => {
    currentRungRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [currentIndex, reduceMotion]);

  return (
    <div ref={scrollerRef} className="overflow-x-auto pb-2">
      <div
        className="relative mx-auto"
        style={{ width: Math.max(contentWidth, 260), height: 150 }}
      >
        {/* end support posts */}
        <div
          className="absolute top-4 h-16 w-2 rounded-full bg-sg-navy/70"
          style={{ left: RIG_PADDING - 1 }}
        />
        <div
          className="absolute top-4 h-16 w-2 rounded-full bg-sg-navy/70"
          style={{ left: RIG_PADDING + (barCount - 1) * RUNG_SPACING - 1 }}
        />

        {/* the two side rails */}
        <div
          className="absolute h-1.5 rounded-full bg-sg-navy/70"
          style={{ top: 16, left: RIG_PADDING, width: (barCount - 1) * RUNG_SPACING }}
        />
        <div
          className="absolute h-1.5 rounded-full bg-sg-navy/40"
          style={{
            top: 16 + RAIL_GAP,
            left: RIG_PADDING,
            width: (barCount - 1) * RUNG_SPACING,
          }}
        />

        {/* rungs, one per bar */}
        {Array.from({ length: barCount }, (_, i) => {
          const x = RIG_PADDING + i * RUNG_SPACING;
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <div
              key={i}
              ref={active ? currentRungRef : undefined}
              className="absolute top-4 flex flex-col items-center"
              style={{ left: x - 2, width: 4 }}
            >
              <span
                className={clsx(
                  'block h-[26px] w-1 rounded-full',
                  done && 'bg-sg-success',
                  active && 'bg-sg-xp',
                  !done && !active && isReviewBar(i) && 'bg-sg-purple/50',
                  !done && !active && !isReviewBar(i) && 'bg-sg-navy/25',
                )}
              />
            </div>
          );
        })}

        {/* the hanging figure, swinging bar-to-bar */}
        <motion.div
          className="absolute top-[26px] text-sg-navy"
          style={{ left: RIG_PADDING - 20, width: 40 }}
          animate={{ x: currentIndex * RUNG_SPACING }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: 'spring', stiffness: 140, damping: 14 }
          }
        >
          <HangingFigure effect={effect} reduceMotion={reduceMotion} className="h-16 w-10" />
        </motion.div>
      </div>
    </div>
  );
}
