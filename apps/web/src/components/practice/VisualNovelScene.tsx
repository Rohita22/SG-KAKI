import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { History } from 'lucide-react';
import type { AIPracticeCompletionScript, AIPracticeVisualScene, ChatMessage } from '@/content/types';
import { clsx } from '@/lib/clsx';
import { Button } from '@/components/ui/Button';
import { ChatBubble, TypingBubble } from './ChatBubble';
import { ConversationControls, type SinglishHint } from './ConversationControls';

const TEACHER_ENTER_MS = 1900;
const CLASSMATE_REACTS_MS = 1900;
const WALKING_MS = 1100;

type CutscenePhase = 'chat' | 'teacherEnter' | 'classmateReacts' | 'walking' | 'complete';

export type { SinglishHint };

/**
 * `anchor` is which edge of this character's column the bubble hugs — and
 * therefore which direction it grows as text gets longer: 'left' hugs the
 * left edge and grows rightward, 'right' hugs the right edge and grows
 * leftward. This must point AWAY from whichever neighbor could have a
 * bubble open at the same time (player + classmate can both be visible
 * together) — otherwise two long bubbles grow toward each other and
 * collide in the middle. So the leftmost character (player) uses 'right'
 * (grows further left, away from classmate), and the classmate uses 'left'
 * (grows further right, away from the player).
 */
function SpeechBubble({
  text,
  anchor,
}: {
  text: string;
  anchor: 'left' | 'right';
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 6 }}
      transition={{ type: 'spring', stiffness: 340, damping: 22 }}
      className={clsx(
        'relative w-max max-w-[38vw] rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-sg-navy shadow-lg sm:max-w-[190px] lg:max-w-[230px]',
        anchor === 'left' ? 'rounded-bl-sm' : 'ml-auto rounded-br-sm',
      )}
    >
      {text}
      <div
        className={clsx(
          'absolute bottom-0 h-3 w-3 translate-y-1/2 rotate-45 bg-white',
          anchor === 'left' ? 'left-6' : 'right-6',
        )}
      />
    </motion.div>
  );
}

/** Mirrors the classmate's SpeechBubble anchor (left-hugging, grows right —
 * see the comment above SpeechBubble for why). */
function TypingSpeechBubble() {
  return (
    <motion.div
      key="typing"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-max rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-lg"
    >
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-1.5 rounded-full bg-sg-navy/30"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
      <div className="absolute bottom-0 left-6 h-3 w-3 translate-y-1/2 rotate-45 bg-white" />
    </motion.div>
  );
}

/** Crops a sprite's baked-in padding by scaling it to cover a tight portrait
 * frame, so characters read as standing close together instead of adrift in
 * empty canvas space. */
/** Sprite frame sizes. `default` suits scene art drawn landscape, where
 * object-cover crops inward and effectively zooms the figure. Portrait (2:3)
 * art fills the frame uncropped and so reads much smaller at the same box —
 * `large` compensates so those characters still read as standing in the room. */
const SPRITE_SIZES = {
  default: 'h-32 w-20 sm:h-44 sm:w-28 lg:h-56 lg:w-36',
  /** Kept close to 2:3 so portrait sprite art fills the frame without
   * object-cover shaving the sides off the figure. */
  large: 'h-40 w-[6.7rem] sm:h-56 sm:w-[9.3rem] lg:h-72 lg:w-48',
} as const;

export type SpriteSize = keyof typeof SPRITE_SIZES;

function CharacterSprite({
  src,
  alt,
  flip,
  size = 'default',
  initial,
  animate,
  transition,
}: {
  src: string;
  alt: string;
  flip?: boolean;
  size?: SpriteSize;
  initial: { opacity: number; x: number; y: number };
  animate: { opacity: number; x: number; y: number };
  transition: object;
}) {
  return (
    <motion.div
      initial={initial}
      animate={animate}
      transition={transition}
      className={clsx('overflow-hidden drop-shadow-xl', SPRITE_SIZES[size])}
    >
      <img
        src={src}
        alt={alt}
        className="size-full object-cover object-center"
        style={flip ? { transform: 'scaleX(-1)' } : undefined}
      />
    </motion.div>
  );
}

export function VisualNovelScene({
  visualScene,
  personaName,
  history,
  isTyping,
  suggestions,
  suggestionsLoading = false,
  readyToEnd = false,
  fallbackOpeners = [],
  singlishHints = [],
  completionScript,
  completionXp,
  draft,
  onDraftChange,
  onSend,
  onSessionComplete,
  onRestart,
  onDone,
}: {
  visualScene: AIPracticeVisualScene;
  personaName?: string;
  history: ChatMessage[];
  isTyping: boolean;
  /** AI-generated reply options for what the learner could say next, based on
   * the conversation so far — not a static list. */
  suggestions: string[];
  suggestionsLoading?: boolean;
  /** True when the AI judged the last exchange a natural point to wind down. */
  readyToEnd?: boolean;
  /** Static openers shown only for the very first turn, before autoOpen (if
   * any) has produced a message for the suggestions to be based on. */
  fallbackOpeners?: string[];
  singlishHints?: SinglishHint[];
  completionScript?: AIPracticeCompletionScript;
  completionXp?: number;
  draft: string;
  onDraftChange: (value: string) => void;
  onSend: (text: string) => void;
  /** Called once, right as the scripted ending finishes (e.g. to award XP). */
  onSessionComplete?: () => void;
  /** "Try Again" — reset progress and start a fresh conversation in place. */
  onRestart?: () => void;
  /** "Done" — leave the practice screen. */
  onDone?: () => void;
}) {
  const [showTranscript, setShowTranscript] = useState(false);
  const [phase, setPhase] = useState<CutscenePhase>('chat');
  const sessionCompleteFired = useRef(false);
  const endCardRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // The end card can land below the fold of the page's scroll container —
  // bring it into view so "Try Again"/"Done" aren't left half-hidden behind
  // the mobile bottom nav with nothing prompting the user to scroll.
  useEffect(() => {
    if (phase === 'complete') {
      endCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [phase]);

  // A restart clears the conversation history — pick that up and reset the
  // cutscene back to a clean slate so "Try Again" actually starts over.
  useEffect(() => {
    if (history.length === 0 && phase !== 'chat') {
      setPhase('chat');
      sessionCompleteFired.current = false;
    }
  }, [history.length, phase]);

  const turnCount = history.filter((m) => m.role === 'user').length;

  // Tracked independently (not just "the last message overall") so the
  // player's line stays on screen through the classmate's typing + reply,
  // instead of vanishing the instant the other side responds.
  const lastUserMessage = [...history].reverse().find((m) => m.role === 'user');
  const lastAiMessage = [...history].reverse().find((m) => m.role === 'ai');

  // Scripted ending: the AI itself judges when the conversation reaches a
  // natural stopping point (readyToEnd) rather than cutting off at a fixed
  // turn count — minTurns keeps it from ending too abruptly, maxTurns is a
  // hard cap so the scene can't run forever if the AI never signals it.
  useEffect(() => {
    if (phase !== 'chat' || !completionScript || isTyping) {
      return;
    }
    const reachedMin = turnCount >= completionScript.minTurns;
    const reachedMax = turnCount >= completionScript.maxTurns;
    if (!((reachedMin && readyToEnd) || reachedMax)) return;

    // Scenes without an arriving third character skip straight to the persona's
    // closing line — there's no one to walk in and interrupt.
    const firstPhase = visualScene.teacherImage ? 'teacherEnter' : 'classmateReacts';
    const timer = setTimeout(() => setPhase(firstPhase), 900);
    return () => clearTimeout(timer);
  }, [phase, completionScript, visualScene.teacherImage, isTyping, turnCount, readyToEnd]);

  useEffect(() => {
    if (phase === 'teacherEnter') {
      const timer = setTimeout(() => setPhase('classmateReacts'), TEACHER_ENTER_MS);
      return () => clearTimeout(timer);
    }
    if (phase === 'classmateReacts') {
      const timer = setTimeout(() => setPhase('walking'), CLASSMATE_REACTS_MS);
      return () => clearTimeout(timer);
    }
    if (phase === 'walking') {
      const timer = setTimeout(() => {
        if (!sessionCompleteFired.current) {
          sessionCompleteFired.current = true;
          onSessionComplete?.();
        }
        setPhase('complete');
      }, WALKING_MS);
      return () => clearTimeout(timer);
    }
  }, [phase, onSessionComplete]);

  // A character standing behind the foreground counter rests lower than the
  // front floor line, so the overlay hides their lower body. Expressed as a %
  // of sprite height and folded into the animation's resting `y` — an inline
  // transform would be clobbered by Framer Motion's own.
  const restingY = (offsetPct?: number) => (offsetPct ? `${offsetPct}%` : 0);

  const spriteInitial = (fromSide: 'left' | 'right', offsetPct?: number) =>
    reduceMotion
      ? { opacity: 1, x: 0, y: restingY(offsetPct) }
      : { opacity: 0, x: fromSide === 'left' ? -40 : 40, y: 24 };

  const standingAnimate = (offsetPct?: number) => ({
    opacity: 1,
    x: 0,
    y: restingY(offsetPct),
  });
  const walkingOffAnimate = reduceMotion
    ? { opacity: 0, x: 0, y: 0 }
    : { opacity: 0, x: 0, y: -36 };
  const standingTransition = (delay: number) => ({
    type: 'spring' as const,
    stiffness: 120,
    damping: 16,
    delay,
  });
  const walkingTransition = { duration: reduceMotion ? 0.2 : 0.9 };

  const hasWalkedOff = phase === 'walking' || phase === 'complete';
  // In a scene that ends with someone arriving, everyone clears out together.
  // Where the persona is staff at their own stall, only the player leaves —
  // the stall holder stays put, serving the next person in the queue.
  const personaStaysPut = !visualScene.teacherImage;
  const spriteAnimate = (offsetPct?: number, staysPut = false) =>
    hasWalkedOff && !staysPut ? walkingOffAnimate : standingAnimate(offsetPct);

  const flipPlayer = visualScene.flipPlayer ?? true;
  const wideSpread = visualScene.spread === 'wide';

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-card">
      <div className="relative h-64 w-full overflow-hidden bg-sg-navy sm:h-80 lg:h-[420px]">
        <motion.img
          src={visualScene.backgroundImage}
          alt=""
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 size-full object-cover"
        />

        <button
          type="button"
          onClick={() => setShowTranscript((v) => !v)}
          aria-label="Toggle conversation transcript"
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm transition-colors hover:bg-black/40"
        >
          <History className="size-4.5" />
        </button>

        <div
          className={clsx(
            'absolute inset-x-0 bottom-0 flex items-end pb-2 sm:pb-4',
            wideSpread
              ? // Inset from the frame edges so the characters sit in the open
                // middle of the counter rather than on top of the props
                // stacked at either end.
                'justify-between px-[12%] sm:px-[14%] lg:px-[16%]'
              : 'justify-center gap-3 px-5 sm:gap-6 sm:px-6 lg:gap-8 lg:px-8',
          )}
        >
          {/* z-20 lifts the player above the foreground overlay (z-10), so a
              scene can put the persona behind a counter while the player
              stands in front of it — the two sides of a stall transaction. */}
          <div className="relative z-20 flex flex-col items-center">
            {/* pr-* pulls the bubble's anchor further from center than the
                character gap alone, so two simultaneous bubbles never sit
                close enough to visually merge into one white shape. */}
            <div className="absolute inset-x-0 bottom-full mb-2 pr-3 sm:pr-4 lg:pr-6">
              <AnimatePresence mode="popLayout">
                {phase === 'chat' && lastUserMessage && (
                  <SpeechBubble key={lastUserMessage.id} text={lastUserMessage.text} anchor="right" />
                )}
              </AnimatePresence>
            </div>
            {visualScene.playerImage && (
              <CharacterSprite
                src={visualScene.playerImage}
                alt="You"
                flip={flipPlayer}
                size={visualScene.spriteSize}
                initial={spriteInitial('left', visualScene.playerOffsetPct)}
                animate={spriteAnimate(visualScene.playerOffsetPct)}
                transition={hasWalkedOff ? walkingTransition : standingTransition(0.15)}
              />
            )}
          </div>

          <div className="relative flex flex-col items-center">
            {/* z-30 keeps the bubble above the foreground overlay even though
                the sprite below it sits behind that overlay. */}
            <div className="absolute inset-x-0 bottom-full z-30 mb-2 pl-3 sm:pl-4 lg:pl-6">
              <AnimatePresence mode="popLayout">
                {phase === 'chat' && isTyping ? (
                  <TypingSpeechBubble />
                ) : phase === 'chat' && lastAiMessage ? (
                  <SpeechBubble key={lastAiMessage.id} text={lastAiMessage.text} anchor="left" />
                ) : (
                  phase === 'classmateReacts' &&
                  completionScript && (
                    <SpeechBubble key="classmate-line" text={completionScript.classmateLine} anchor="left" />
                  )
                )}
              </AnimatePresence>
            </div>
            <CharacterSprite
              src={visualScene.characterImage}
              alt={personaName ?? 'Classmate'}
              flip={visualScene.flipCharacter}
              size={visualScene.spriteSize}
              initial={spriteInitial('right', visualScene.characterOffsetPct)}
              animate={spriteAnimate(visualScene.characterOffsetPct, personaStaysPut)}
              transition={hasWalkedOff ? walkingTransition : standingTransition(0.3)}
            />
          </div>

          {visualScene.teacherImage && phase !== 'chat' && (
            <div className="relative flex flex-col items-center">
              <div className="absolute inset-x-0 bottom-full mb-2 pl-3 sm:pl-4 lg:pl-6">
                <AnimatePresence mode="popLayout">
                  {phase === 'teacherEnter' && completionScript?.teacherLine && (
                    <SpeechBubble key="teacher-line" text={completionScript.teacherLine} anchor="left" />
                  )}
                </AnimatePresence>
              </div>
              <CharacterSprite
                src={visualScene.teacherImage}
                alt={completionScript?.teacherName ?? 'Teacher'}
                initial={reduceMotion ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, x: 60, y: 10 }}
                animate={spriteAnimate()}
                transition={
                  hasWalkedOff ? walkingTransition : { type: 'spring', stiffness: 120, damping: 18 }
                }
              />
            </div>
          )}
        </div>

        {/* Drawn after the character row so it paints over it: a character
            pushed down by *OffsetPct is hidden from the waist down and reads
            as standing behind this, which depth in the background art alone
            can't achieve (sprites always render above the background). */}
        {visualScene.foregroundImage && (
          <motion.img
            src={visualScene.foregroundImage}
            alt=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="pointer-events-none absolute inset-0 z-10 size-full object-cover"
          />
        )}
      </div>

      <AnimatePresence>
        {showTranscript && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-black/5"
          >
            <div className="max-h-64 space-y-3 overflow-y-auto p-5">
              {history.length === 0 && (
                <p className="text-sm text-sg-navy/40">No messages yet — say something!</p>
              )}
              {history.map((m) => (
                <ChatBubble key={m.id} message={m} />
              ))}
              {isTyping && <TypingBubble />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === 'complete' ? (
        <div ref={endCardRef} className="border-t border-black/5 px-5 py-5 text-center">
          <p className="text-sm font-bold text-sg-navy">
            Nice chat!{completionXp ? ` +${completionXp} XP` : ''}
          </p>
          <p className="mt-0.5 text-xs text-sg-navy/50">
            Want to run through it again, or head back?
          </p>
          <div className="mt-3 flex justify-center gap-2">
            <Button variant="secondary" onClick={() => onRestart?.()}>
              Try Again
            </Button>
            <Button variant="primary" onClick={() => onDone?.()}>
              Done
            </Button>
          </div>
        </div>
      ) : phase !== 'chat' ? (
        <div className="border-t border-black/5 px-5 py-4 text-center text-sm font-semibold text-sg-navy/50">
          {completionScript?.closingCaption ?? 'Class is starting…'}
        </div>
      ) : (
        <ConversationControls
          turnCount={turnCount}
          suggestions={suggestions}
          suggestionsLoading={suggestionsLoading}
          isTyping={isTyping}
          fallbackOpeners={fallbackOpeners}
          singlishHints={singlishHints}
          draft={draft}
          onDraftChange={onDraftChange}
          onSend={onSend}
        />
      )}
    </div>
  );
}
