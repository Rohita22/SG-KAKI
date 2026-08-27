import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  rectIntersection,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  Heart,
  Lightbulb,
  RotateCcw,
  Trash2,
  Trophy,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Confetti } from '@/components/celebration/Confetti';
import { XPFloatUp } from '@/components/celebration/XPFloatUp';
import { clsx } from '@/lib/clsx';
import {
  buildsMatch,
  diagnoseBuild,
  getBuildHint,
  INGREDIENTS,
  KOPI_RECIPES,
  shuffledShift,
  type IngredientId,
  type KopiRecipe,
  type RecipeFamily,
  type BuildHint,
} from './kopiRecipes';

const ART = {
  background: '/scenes/scene2/kopi-game/stall.webp',
} as const;

const MAX_HEARTS = 3;
type Phase = 'briefing' | 'playing' | 'complete';
type Feedback =
  | { kind: 'correct'; points: number }
  | { kind: 'wrong'; missing: IngredientId[]; extra: IngredientId[] };

function ingredient(id: IngredientId) {
  return INGREDIENTS.find((item) => item.id === id)!;
}

function describeCup(items: IngredientId[]): string {
  if (items.length === 0) return 'empty';
  return Array.from(new Set(items))
    .map((id) => `${ingredient(id).shortLabel} ×${items.filter((item) => item === id).length}`)
    .join(' · ');
}

function DraggableIngredient({
  id,
  count,
  disabled,
}: {
  id: IngredientId;
  count: number;
  disabled: boolean;
}) {
  const item = ingredient(id);
  const atLimit = count >= 3;
  const isBase = id === 'coffee' || id === 'tea' || id === 'milo';
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled: disabled || atLimit,
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      disabled={disabled || atLimit}
      style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined}
      className={clsx(
        'group relative flex touch-none flex-col items-center justify-end border-0 bg-transparent p-0 text-center text-sg-navy transition-all focus-visible:scale-105 focus-visible:outline-none',
        isBase ? 'h-[clamp(6.5rem,21vh,10.5rem)]' : 'h-[clamp(5.75rem,18vh,9rem)]',
        'cursor-grab hover:-translate-y-1 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-45',
        isDragging && 'z-30 opacity-20',
      )}
      {...listeners}
      {...attributes}
    >
      <span className="relative flex min-h-0 w-full flex-1 items-end justify-center transition-transform group-hover:scale-105">
        <IngredientVisual id={id} />
        {count > 0 && (
          <span className="absolute right-0.5 top-0 flex size-5 items-center justify-center rounded-full border-2 border-white bg-sg-success text-[10px] font-black text-white shadow-md">
            ×{count}
          </span>
        )}
      </span>
      <span className="sr-only">{atLimit ? `${item.label}, maximum added` : `${item.label}, drag one portion`}</span>
    </button>
  );
}

// Sugar jar / ice scoop / milo powder art is wide, so object-contain letterboxes it small and floats it above the counter line. Scale up from the bottom edge to match the milk tins.
const SMALL_ART = new Set<IngredientId>(['sugar', 'ice', 'milo-top']);

function IngredientVisual({ id, large = false }: { id: IngredientId; large?: boolean }) {
  const item = ingredient(id);
  const isBase = id === 'coffee' || id === 'tea' || id === 'milo';
  const size = large
    ? 'h-28 w-32'
    : isBase
      ? 'h-[clamp(6.25rem,20vh,10rem)] w-full'
      : 'h-[clamp(5.5rem,17vh,7.5rem)] w-full';
  const image = item.image;
  return (
    <img
      src={image}
      alt=""
      draggable={false}
      className={clsx(size, 'object-contain drop-shadow-lg', !large && SMALL_ART.has(id) && 'origin-bottom scale-[1.45] object-bottom')}
    />
  );
}

function DrinkDropZone({
  selected,
  cupKey,
}: {
  selected: IngredientId[];
  cupKey: string;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: 'drink-cup' });

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        'relative flex h-[clamp(7rem,23vh,12rem)] min-w-0 flex-col items-center justify-end rounded-[2rem] px-1 pb-0 pt-1 transition-all',
        isOver
          ? 'scale-105 bg-sg-xp/18 shadow-[0_0_0_8px_rgba(251,191,36,0.12)]'
          : 'bg-transparent',
      )}
      aria-label="Drink cup drop zone"
      data-drop-cup
    >
      <motion.div key={cupKey} initial={{ opacity: 0, y: -18, rotate: -5 }} animate={{ opacity: 1, y: 0, rotate: 0 }} className="flex min-h-0 w-full flex-1 items-center justify-center">
        <DrinkPreview selected={selected} />
      </motion.div>
      <span className="mt-1 min-h-5 text-center text-[10px] font-black text-white/85" aria-live="polite">
        {selected.length === 0 ? 'EMPTY CUP' : `${selected.length} ${selected.length === 1 ? 'PORTION' : 'PORTIONS'}`}
      </span>
    </div>
  );
}

function DrinkPreview({ selected }: { selected: IngredientId[] }) {
  const has = (id: IngredientId) => selected.includes(id);
  const iced = has('ice');
  const liquidColor = has('milo')
    ? '#7a351b'
    : has('tea')
      ? '#d16f1e'
      : has('coffee')
        ? '#35140c'
        : '#d8eef5';
  const milkPortions = selected.filter((id) => id === 'condensed' || id === 'evaporated').length;
  const sugarPortions = selected.filter((id) => id === 'sugar').length;
  const milkOpacity = Math.min(0.46, milkPortions * 0.16);
  const fillPixels = selected.length === 0 ? 0 : Math.min(128, 34 + selected.length * 17);
  const liquidY = 164 - fillPixels;
  const iceY = Math.max(38, liquidY + 7);

  return (
    <div className="relative flex h-full max-h-[11rem] w-24 items-end justify-center sm:w-28" aria-label="Your drink">
      {!iced && (has('coffee') || has('tea') || has('milo')) && (
        <div className="absolute left-1/2 top-0 flex -translate-x-1/2 gap-2" aria-hidden="true">
          {[0, 1].map((i) => (
            <motion.span
              key={i}
              className="h-8 w-2 rounded-full border-l-2 border-white/65"
              animate={{ opacity: [0, 0.8, 0], y: [9, -6], x: [0, i ? 5 : -4] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.6 }}
            />
          ))}
        </div>
      )}

      <svg viewBox="0 0 120 180" className="relative z-10 h-full w-full overflow-visible drop-shadow-[0_12px_14px_rgba(44,24,11,0.3)]" aria-hidden="true">
        <defs>
          <linearGradient id="plastic-cup" x1="0" x2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.42" />
            <stop offset="0.48" stopColor="#fff8e7" stopOpacity="0.08" />
            <stop offset="1" stopColor="#fff" stopOpacity="0.5" />
          </linearGradient>
          <clipPath id="cup-inside">
            <path d="M20 24 H100 L89 157 Q88 168 77 171 H43 Q32 168 31 157 Z" />
          </clipPath>
        </defs>
        <g clipPath="url(#cup-inside)">
          <motion.rect
            data-cup-liquid
            x="17"
            width="86"
            animate={{ y: liquidY, height: fillPixels, fill: liquidColor }}
            transition={{ type: 'spring', stiffness: 180, damping: 20 }}
          />
          <motion.rect x="17" width="86" fill="#f5c98f" opacity={milkOpacity} animate={{ y: liquidY, height: fillPixels }} transition={{ type: 'spring', stiffness: 180, damping: 20 }} />
          {fillPixels > 0 && <rect x="20" y={liquidY} width="80" height="4" rx="2" fill="#efae63" opacity="0.8" />}
          {milkPortions > 0 && (
            <motion.path
              d={`M28 ${liquidY + 20} C45 ${liquidY + 5}, 72 ${liquidY + 34}, 94 ${liquidY + 15}`}
              fill="none"
              stroke="#ffe4b8"
              strokeWidth="7"
              strokeLinecap="round"
              animate={{ pathLength: [0.35, 1, 0.35], opacity: [0.35, 0.75, 0.35] }}
              transition={{ duration: 2.4, repeat: Infinity }}
            />
          )}
          {sugarPortions > 0 && Array.from({ length: Math.min(8, sugarPortions * 4) }, (_, index) => (
            <circle key={index} cx={41 + (index % 4) * 13} cy={154 - Math.floor(index / 4) * 8} r="2.3" fill="#fff0c9" />
          ))}
          {iced && [30, 49, 69, 87].map((x, index) => (
            <rect key={x} x={x} y={iceY + (index % 2) * 8} width="15" height="15" rx="3" transform={`rotate(${index % 2 ? 10 : -8} ${x + 7} ${iceY + 7})`} fill="#d9f3ff" fillOpacity="0.92" stroke="#fff" strokeWidth="2" />
          ))}
          {has('milo-top') && <rect x="20" y={liquidY} width="80" height="10" rx="4" fill="#3b1d12" />}
        </g>
        <path d="M18 23 H102 L91 158 Q90 172 78 175 H42 Q30 172 29 158 Z" fill="url(#plastic-cup)" stroke="#f5e5c9" strokeWidth="3" />
        <ellipse cx="60" cy="23" rx="45" ry="10" fill="#fff" fillOpacity="0.14" stroke="#f7e8cf" strokeWidth="4" />
        <ellipse cx="60" cy="23" rx="38" ry="6" fill="none" stroke="#d8c6aa" strokeOpacity="0.72" strokeWidth="2" />
        {[50, 78, 106, 134].map((y) => <path key={y} d={`M25 ${y} Q60 ${y + 5} 95 ${y}`} fill="none" stroke="#fff8e8" strokeOpacity="0.55" strokeWidth="2" />)}
        <path d="M37 30 L43 158" stroke="#fff" strokeOpacity="0.38" strokeWidth="5" strokeLinecap="round" />
      </svg>
      <div className="absolute bottom-0 h-3 w-full rounded-[50%] bg-black/15 blur-sm" />
    </div>
  );
}

function Codebook({ onClose }: { onClose: () => void }) {
  const [family, setFamily] = useState<RecipeFamily>('Kopi');
  const families: RecipeFamily[] = ['Kopi', 'Teh', 'Milo'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-end bg-sg-navy/55 p-3 backdrop-blur-sm sm:items-center sm:justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Kopitiam codebook"
    >
      <motion.div
        initial={{ y: 30, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 30, scale: 0.97 }}
        className="flex max-h-[92%] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-[#fffaf0] shadow-card-lg"
      >
        <div className="flex items-start justify-between gap-3 border-b border-sg-navy/10 px-5 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-sg-orange">Auntie Poh's</p>
            <h3 className="text-xl font-black text-sg-navy">Kopitiam Codebook</h3>
            <p className="mt-0.5 text-xs font-semibold text-sg-navy/50">Recipes vary slightly by stall; this teaches the shared ordering code.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full bg-sg-navy/5 p-2 text-sg-navy/60 hover:bg-sg-navy/10" aria-label="Close codebook">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex gap-2 px-5 pt-4" role="tablist" aria-label="Drink families">
          {families.map((item) => (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={family === item}
              onClick={() => setFamily(item)}
              className={clsx(
                'rounded-full px-4 py-2 text-xs font-black transition-colors',
                family === item ? 'bg-sg-navy text-white' : 'bg-white text-sg-navy/55 hover:bg-sg-navy/5',
              )}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="grid gap-2 overflow-y-auto p-5 sm:grid-cols-2">
          {KOPI_RECIPES.filter((item) => item.family === family).map((item) => (
            <article key={item.id} className="rounded-2xl border border-sg-navy/8 bg-white p-3 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-black text-sg-navy">{item.name}</h4>
                <span className="rounded-full bg-sg-xp/20 px-2 py-0.5 text-[10px] font-black text-sg-navy">{'★'.repeat(item.difficulty)}</span>
              </div>
              <p className="mt-1 text-xs font-semibold leading-relaxed text-sg-navy/55">{item.description}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {item.ingredients.map((id, index) => (
                  <span key={`${id}-${index}`} className="rounded-full bg-sg-bg px-2 py-1 text-[10px] font-bold text-sg-navy/60">
                    {ingredient(id).icon} {ingredient(id).shortLabel}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

function OrderTicket({ recipe, orderNumber, total }: { recipe: KopiRecipe; orderNumber: number; total: number }) {
  return (
    <motion.div data-kopi-ticket
      key={recipe.id}
      initial={{ opacity: 0, x: -24, rotate: -2 }}
      animate={{ opacity: 1, x: 0, rotate: -1 }}
      className="w-[min(74%,330px)] rounded-2xl border-2 border-dashed border-[#b88c51] bg-[#fff9e8] p-4 text-left shadow-card sm:p-5"
    >
      <div className="flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#8c6238]">
        <span>Order #{orderNumber}</span>
        <span>{orderNumber}/{total}</span>
      </div>
      <p className="mt-2 text-2xl font-black leading-tight text-sg-navy sm:text-3xl">“One {recipe.name}, can?”</p>
    </motion.div>
  );
}

export interface KopiGameProps {
  completionXp: number;
  onSessionComplete: () => void;
  onDone: () => void;
}

export function KopiGame({ completionXp, onSessionComplete, onDone }: KopiGameProps) {
  const reduceMotion = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('briefing');
  const [orders, setOrders] = useState(() => shuffledShift());
  const [roundIndex, setRoundIndex] = useState(0);
  const [selected, setSelected] = useState<IngredientId[]>([]);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [hint, setHint] = useState<BuildHint | null>(null);
  const [showCodebook, setShowCodebook] = useState(false);
  const [activeDrag, setActiveDrag] = useState<IngredientId | null>(null);
  const [cupVersion, setCupVersion] = useState(0);
  const completeFired = useRef(false);
  const roundStartedAt = useRef(Date.now());
  const current = orders[roundIndex];

  useEffect(() => {
    if (phase !== 'playing' || feedback) return;
    const timer = window.setInterval(() => {
      setSeconds(Math.floor((Date.now() - roundStartedAt.current) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase, feedback, roundIndex]);

  const selectedCounts = useMemo(() => {
    const counts = new Map<IngredientId, number>();
    selected.forEach((id) => counts.set(id, (counts.get(id) ?? 0) + 1));
    return counts;
  }, [selected]);
  const dragSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  );

  function startShift() {
    setPhase('playing');
    setRoundIndex(0);
    setSelected([]);
    setFeedback(null);
    setScore(0);
    setHearts(MAX_HEARTS);
    setStreak(0);
    setBestStreak(0);
    setSeconds(0);
    setHint(null);
    setCupVersion((value) => value + 1);
    roundStartedAt.current = Date.now();
    completeFired.current = false;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveDrag(event.active.id as IngredientId);
  }

  function handleDragEnd(event: DragEndEvent) {
    const id = event.active.id as IngredientId;
    setActiveDrag(null);
    const dragged = event.active.rect.current.translated;
    const cup = document.querySelector<HTMLElement>('[data-drop-cup]')?.getBoundingClientRect();
    const intersectsCup = Boolean(
      dragged &&
      cup &&
      dragged.right >= cup.left &&
      dragged.left <= cup.right &&
      dragged.bottom >= cup.top &&
      dragged.top <= cup.bottom,
    );
    if ((event.over?.id !== 'drink-cup' && !intersectsCup) || feedback) return;
    setHint(null);
    setSelected((items) => {
      const count = items.filter((item) => item === id).length;
      return count >= 3 ? items : [...items, id];
    });
  }

  function discardDrink() {
    setSelected([]);
    setHint(null);
    setFeedback(null);
    setSeconds(0);
    setCupVersion((value) => value + 1);
    roundStartedAt.current = Date.now();
  }

  function askForHint() {
    if (!current || feedback) return;
    setHint(getBuildHint(selected, current.ingredients));
  }

  function serveDrink() {
    if (!current || selected.length === 0 || feedback) return;
    if (buildsMatch(selected, current.ingredients)) {
      const nextStreak = streak + 1;
      const points = 200 + Math.max(0, 100 - seconds * 4) + Math.min(100, streak * 25);
      setScore((value) => value + points);
      setStreak(nextStreak);
      setBestStreak((value) => Math.max(value, nextStreak));
      setFeedback({ kind: 'correct', points });
    } else {
      setHearts((value) => Math.max(0, value - 1));
      setStreak(0);
      setFeedback({ kind: 'wrong', ...diagnoseBuild(selected, current.ingredients) });
    }
  }

  function continueRound() {
    if (!feedback) return;
    if (feedback.kind === 'wrong') {
      discardDrink();
      return;
    }
    if (roundIndex === orders.length - 1) {
      setPhase('complete');
      if (!completeFired.current) {
        completeFired.current = true;
        onSessionComplete();
      }
      return;
    }
    setRoundIndex((value) => value + 1);
    setSelected([]);
    setFeedback(null);
    setHint(null);
    setSeconds(0);
    setCupVersion((value) => value + 1);
    roundStartedAt.current = Date.now();
  }

  function restart() {
    setOrders(shuffledShift());
    setPhase('briefing');
    setRoundIndex(0);
    setSelected([]);
    setFeedback(null);
    setHint(null);
    setScore(0);
    setHearts(MAX_HEARTS);
    setStreak(0);
    setBestStreak(0);
    setSeconds(0);
    setActiveDrag(null);
    setCupVersion((value) => value + 1);
    completeFired.current = false;
  }

  const rank = score >= 1650 ? 'Kopi Master' : score >= 1250 ? 'Stall Regular' : 'Kopi Rookie';

  return (
    <div data-kopi-root className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-white shadow-card">
      <AnimatePresence>{showCodebook && <Codebook onClose={() => setShowCodebook(false)} />}</AnimatePresence>

      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 bg-sg-navy px-4 py-3 text-white sm:px-5">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-2xl bg-sg-xp text-xl shadow-sm">☕</span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sg-xp">Auntie Poh's stall</p>
            <h2 className="text-base font-black sm:text-lg">Kopi Rush</h2>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-black">
          {phase === 'playing' && (
            <>
              <span className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-2" aria-label={`${hearts} patience hearts left`}>
                {[0, 1, 2].map((i) => <Heart key={i} className={clsx('size-4', i < hearts ? 'fill-sg-coral text-sg-coral' : 'text-white/25')} />)}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-2">{score.toLocaleString()} pts</span>
            </>
          )}
          {phase !== 'playing' && (
            <button type="button" onClick={() => setShowCodebook(true)} aria-label="Open codebook" className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 transition-colors hover:bg-white/20">
              <BookOpen className="size-4" />
              <span className="hidden sm:inline">Codebook</span>
            </button>
          )}
        </div>
      </header>

      {phase === 'briefing' && (
        <div className="relative flex min-h-0 flex-1 overflow-hidden bg-[#e6b46b]">
          <img src={ART.background} alt="Auntie Poh at her illustrated kopitiam drinks stall" className="absolute inset-0 size-full object-cover object-[88%_center] sm:object-[58%_center]" />
          <div className="absolute inset-0 bg-gradient-to-r from-sg-navy/80 via-sg-navy/36 to-transparent" />
          <div className="relative flex w-full items-end overflow-y-auto p-4 sm:items-center sm:p-8">
            <div className="w-full max-w-lg rounded-[2rem] border border-white/20 bg-sg-navy/88 p-5 text-white shadow-card-lg backdrop-blur-md sm:p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-sg-xp">Your first stall shift</p>
              <h3 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">Hear the order. Build the cup.</h3>
              <p className="mt-3 text-sm font-semibold leading-relaxed text-white/72">Auntie Poh calls six local drink orders. Drag the right kopi, teh or Milo base into the cup, then add milk, sugar, ice or topping one portion at a time.</p>
              <div className="mt-5 grid gap-2 text-sm font-bold text-white/80 sm:grid-cols-3">
                <p className="rounded-2xl bg-white/10 p-3"><span className="mb-1 block text-lg">👆</span>Drag ingredients</p>
                <p className="rounded-2xl bg-white/10 p-3"><span className="mb-1 block text-lg">🧠</span>Decode the order</p>
                <p className="rounded-2xl bg-white/10 p-3"><span className="mb-1 block text-lg">🔥</span>Build a streak</p>
              </div>
              <div className="mt-5 rounded-2xl rounded-br-sm bg-[#fff8e8] p-4 text-sm font-bold leading-relaxed text-sg-navy shadow-card">
                “Morning rush coming! I call the order, you make the drink. Don't mix up O and kosong, ah!”
              </div>
              <Button size="lg" className="mt-5 w-full" onClick={startShift}>Open the stall <ChevronRight className="size-5" /></Button>
              <button type="button" onClick={() => setShowCodebook(true)} className="mt-3 w-full text-sm font-black text-white/75 hover:text-white">Study all {KOPI_RECIPES.length} drinks first</button>
            </div>
          </div>
        </div>
      )}

      {phase === 'playing' && current && (
        <DndContext
          sensors={dragSensors}
          collisionDetection={rectIntersection}
          onDragStart={handleDragStart}
          onDragCancel={() => setActiveDrag(null)}
          onDragEnd={handleDragEnd}
        >
          <div data-kopi-stage className="relative flex min-h-0 flex-1 overflow-hidden bg-[#c98642]">
            <img src={ART.background} alt="Auntie Poh's kopitiam drink-making counter" className="absolute inset-0 size-full object-cover object-[88%_center] sm:object-[58%_center]" />
            <div className="absolute inset-0 bg-gradient-to-b from-sg-navy/24 via-transparent to-[#4d260f]/42" />
            <div className="relative flex w-full min-h-0 flex-col overflow-hidden p-3 sm:p-4">
              <div className="flex shrink-0 items-start justify-between gap-3">
                <OrderTicket recipe={current} orderNumber={roundIndex + 1} total={orders.length} />
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className="flex items-center gap-1 rounded-full bg-sg-navy/82 px-3 py-2 text-xs font-black text-white shadow-sm backdrop-blur-sm">
                    <Clock3 className="size-4 text-sg-xp" /> {seconds}s
                  </span>
                  {streak > 1 && <span className="rounded-full bg-sg-xp px-3 py-1 text-xs font-black text-sg-navy shadow-sm">🔥 {streak} streak</span>}
                </div>
              </div>

              <div className="min-h-2 flex-1" />

              <div data-kopi-panel className="mx-auto flex w-full min-h-0 max-w-6xl shrink flex-col p-1 sm:p-2">
            <div className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-2 sm:flex-nowrap">
              <p className="rounded-full bg-sg-navy/76 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] text-white shadow-sm">
                {!hint && <>Drag each ingredient into the plastic cup · one drag = one portion</>}
                {hint?.kind === 'add' && <>Cup: {describeCup(selected)} · Next: add 1 {ingredient(hint.ingredient).label}</>}
                {hint?.kind === 'restart' && <>Wrong mix detected · discard this cup and restart</>}
                {hint?.kind === 'ready' && <>Cup is correct · ready to serve</>}
              </p>
              <div className="flex items-center gap-2">
                <button type="button" onClick={askForHint} disabled={Boolean(feedback)} className="flex h-8 items-center gap-1 rounded-lg bg-[#fff8e8] px-3 text-[10px] font-black text-sg-navy shadow-sm disabled:opacity-40">
                  <Lightbulb className="size-3.5 text-sg-orange" /> Hint
                </button>
                <button type="button" onClick={discardDrink} disabled={selected.length === 0 || Boolean(feedback)} className="flex h-8 items-center gap-1 rounded-lg bg-white px-3 text-[10px] font-black text-sg-coral shadow-sm disabled:opacity-40">
                  <Trash2 className="size-3.5" /> Discard
                </button>
              </div>
            </div>

            <section className="relative shrink-0">
              <div className="relative grid grid-cols-2 items-end gap-x-2 gap-y-2 sm:grid-cols-[minmax(0,3fr)_minmax(6rem,1fr)_minmax(0,5fr)] sm:gap-x-3">
                <div className="grid grid-cols-3 items-end gap-1 sm:gap-2">
                  {INGREDIENTS.slice(0, 3).map((item) => (
                    <DraggableIngredient
                      key={item.id}
                      id={item.id}
                      count={selectedCounts.get(item.id) ?? 0}
                      disabled={Boolean(feedback)}
                    />
                  ))}
                </div>

                <div className="order-first col-span-2 sm:order-none sm:col-span-1">
                  <DrinkDropZone
                    key={`${current.id}-${cupVersion}`}
                    cupKey={`${current.id}-${cupVersion}`}
                    selected={selected}
                  />
                </div>

                <div className="grid grid-cols-5 items-end gap-1 sm:gap-2">
                  {INGREDIENTS.slice(3).map((item) => (
                    <DraggableIngredient
                      key={item.id}
                      id={item.id}
                      count={selectedCounts.get(item.id) ?? 0}
                      disabled={Boolean(feedback)}
                    />
                  ))}
                </div>
              </div>
            </section>

            <Button data-kopi-serve className="mt-2 w-full shrink-0" disabled={selected.length === 0 || Boolean(feedback)} onClick={serveDrink}>
              Serve <span aria-hidden="true">→</span>
            </Button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {feedback && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-40 flex items-end bg-sg-navy/35 p-3 backdrop-blur-[2px] sm:items-center sm:justify-center">
                <motion.div initial={reduceMotion ? false : { y: 28, scale: 0.94 }} animate={{ y: 0, scale: 1 }} className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 text-center shadow-card-lg">
                  {feedback.kind === 'correct' ? (
                    <>
                      <Confetti count={20} />
                      <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-sg-success/15 text-sg-success"><Check className="size-9" strokeWidth={3} /></span>
                      <h3 className="mt-3 text-2xl font-black text-sg-navy">Shiok, correct!</h3>
                      <p className="mt-1 text-sm font-bold text-sg-navy/55">{current.description}</p>
                      <p className="mt-3 text-lg font-black text-sg-orange">+{feedback.points} points</p>
                      <Button size="lg" className="mt-5 w-full" onClick={continueRound}>{roundIndex === orders.length - 1 ? 'Finish shift' : 'Next order'} <ChevronRight className="size-5" /></Button>
                    </>
                  ) : (
                    <>
                      <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-sg-coral/15 text-sg-coral"><X className="size-9" strokeWidth={3} /></span>
                      <h3 className="mt-3 text-2xl font-black text-sg-navy">Almost — check the code</h3>
                      <div className="mt-4 space-y-2 text-left text-sm font-bold">
                        {feedback.missing.length > 0 && <p className="rounded-2xl bg-sg-success/10 p-3 text-sg-green"><span className="font-black">Still needed:</span> {feedback.missing.map((id) => ingredient(id).shortLabel).join(', ')}</p>}
                        {feedback.extra.length > 0 && <p className="rounded-2xl bg-sg-coral/10 p-3 text-sg-coral"><span className="font-black">Take out:</span> {feedback.extra.map((id) => ingredient(id).shortLabel).join(', ')}</p>}
                      </div>
                      <Button variant="dark" size="lg" className="mt-5 w-full" onClick={continueRound}><Trash2 className="size-5" /> Discard drink & restart</Button>
                    </>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          <DragOverlay>
            {activeDrag ? (
              <div className="flex w-32 rotate-3 flex-col items-center text-sg-navy drop-shadow-2xl">
                <IngredientVisual id={activeDrag} large />
                <span className="mt-1 rounded-full bg-white px-3 py-1 text-xs font-black shadow-md">{ingredient(activeDrag).label}</span>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {phase === 'complete' && (
        <div className="relative flex min-h-0 flex-1 items-center overflow-y-auto bg-sg-navy px-5 py-8 text-center text-white sm:px-8">
          <Confetti count={34} />
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url(${ART.background})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="relative mx-auto w-full max-w-lg">
            <span className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-sg-xp text-sg-navy shadow-card-lg"><Trophy className="size-11" /></span>
            <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-sg-xp">Shift complete</p>
            <h3 className="mt-2 text-4xl font-black">{rank}</h3>
            <p className="mt-2 text-sm font-semibold text-white/65">Six drinks served — you can read the stall code and build the cup to match.</p>
            <div className="mt-6 grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-white/10 p-4"><p className="text-2xl font-black text-sg-xp">{score}</p><p className="text-[10px] font-black uppercase tracking-wide text-white/50">Points</p></div>
              <div className="rounded-2xl bg-white/10 p-4"><p className="text-2xl font-black text-sg-xp">{bestStreak}</p><p className="text-[10px] font-black uppercase tracking-wide text-white/50">Best streak</p></div>
              <div className="rounded-2xl bg-white/10 p-4"><p className="text-2xl font-black text-sg-xp">{hearts}</p><p className="text-[10px] font-black uppercase tracking-wide text-white/50">Hearts left</p></div>
            </div>
            <div className="mt-6"><XPFloatUp xp={completionXp} /></div>
            <div className="mt-7 grid gap-2 sm:grid-cols-2">
              <Button variant="secondary" size="lg" onClick={restart}><RotateCcw className="size-5" /> New shift</Button>
              <Button size="lg" onClick={onDone}>Done <ChevronRight className="size-5" /></Button>
            </div>
            <button type="button" onClick={() => setShowCodebook(true)} className="mt-4 inline-flex items-center gap-2 text-sm font-black text-white/70 hover:text-white"><BookOpen className="size-4" /> Review the full drinks menu</button>
          </div>
        </div>
      )}
    </div>
  );
}
