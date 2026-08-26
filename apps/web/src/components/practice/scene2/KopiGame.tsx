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
  Undo2,
  X,
  Zap,
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
  auntie: '/scenes/scene2/auntie-poh.png',
  background: '/scenes/scene2/background.png',
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
  if (items.length === 0) return 'Empty cup';
  return Array.from(new Set(items))
    .map((id) => {
      const count = items.filter((item) => item === id).length;
      return `${ingredient(id).shortLabel} ×${count}`;
    })
    .join(', ');
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
        'group relative flex min-h-28 touch-none flex-col items-center justify-end rounded-2xl px-1 pb-2 pt-1 text-center text-sg-navy transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sg-blue/35',
        'cursor-grab hover:-translate-y-1 active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-45',
        isDragging && 'z-30 opacity-20',
      )}
      {...listeners}
      {...attributes}
    >
      <span className="relative flex h-20 w-full items-center justify-center transition-transform group-hover:scale-105">
        <IngredientVisual id={id} />
        {count > 0 && (
          <span className="absolute right-1 top-0 flex size-7 items-center justify-center rounded-full border-2 border-white bg-sg-success text-xs font-black text-white shadow-md">
            ×{count}
          </span>
        )}
      </span>
      <span className="rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black leading-tight shadow-sm">
        {item.label}
      </span>
      <span className="mt-1 text-[9px] font-bold uppercase tracking-wide text-sg-navy/40">
        {atLimit ? 'Maximum added' : 'Drag one portion'}
      </span>
    </button>
  );
}

function IngredientVisual({ id, large = false }: { id: IngredientId; large?: boolean }) {
  const item = ingredient(id);
  const size = large ? 'h-24 w-28' : 'h-20 w-full';
  if (item.image) {
    return <img src={item.image} alt="" draggable={false} className={clsx(size, 'object-contain drop-shadow-lg')} />;
  }
  if (id === 'evaporated') {
    return (
      <span className="relative block h-16 w-12 rounded-b-lg rounded-t-md border-2 border-[#a66b34] bg-gradient-to-r from-[#f2d28a] via-[#fff4c4] to-[#d5a85d] shadow-lg">
        <span className="absolute inset-x-[-2px] top-1 h-2 rounded-full border-2 border-[#8c6238] bg-[#d8c6a5]" />
        <span className="absolute inset-x-1 top-6 rounded bg-[#315d43] py-1 text-center text-[8px] font-black text-[#fff4c4]">EVAP</span>
      </span>
    );
  }
  if (id === 'ice') {
    return (
      <span className="relative block h-16 w-20">
        {[['left-1', 'top-5', '-rotate-12'], ['left-7', 'top-1', 'rotate-6'], ['right-0', 'top-7', 'rotate-12']].map(([x, y, rotate], index) => (
          <span key={index} className={clsx('absolute size-10 rounded-lg border-2 border-white/90 bg-gradient-to-br from-white via-sky-100/90 to-sky-300/75 shadow-md', x, y, rotate)} />
        ))}
      </span>
    );
  }
  const powder = id === 'milo-top';
  return (
    <span className="relative block h-16 w-24 rotate-[-8deg]">
      <span className="absolute left-0 top-4 h-7 w-12 rounded-[50%] border-2 border-[#7f6d61] bg-gradient-to-br from-[#f7f2ea] to-[#a99c91] shadow-md">
        <span className={clsx('absolute inset-1 rounded-[50%]', powder ? 'bg-[#55301f]' : 'bg-white')} />
      </span>
      <span className="absolute left-10 top-[1.65rem] h-2 w-14 rounded-full border border-[#7f6d61] bg-gradient-to-b from-[#eee7de] to-[#9e9188]" />
    </span>
  );
}

function DrinkDropZone({
  selected,
  onRemove,
  cupKey,
}: {
  selected: IngredientId[];
  onRemove: (id: IngredientId) => void;
  cupKey: string;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: 'drink-cup' });

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        'relative flex min-h-64 min-w-44 flex-col items-center justify-center rounded-[2rem] px-3 pb-4 pt-9 transition-all',
        isOver
          ? 'scale-105 bg-sg-xp/20 shadow-[0_0_0_8px_rgba(251,191,36,0.15)]'
          : 'bg-white/20',
      )}
      aria-label="Drink cup drop zone"
      data-drop-cup
    >
      <span className="absolute top-2 rounded-full bg-sg-navy px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-sm">
        {isOver ? 'Release into cup' : 'Your cup'}
      </span>
      <motion.div key={cupKey} initial={{ opacity: 0, y: -18, rotate: -5 }} animate={{ opacity: 1, y: 0, rotate: 0 }}>
        <DrinkPreview selected={selected} />
      </motion.div>
      {selected.length > 0 && (
        <div className="absolute inset-x-1 bottom-1 flex flex-wrap justify-center gap-1">
          {Array.from(new Set(selected)).map((id) => {
            const count = selected.filter((item) => item === id).length;
            return (
            <button
              key={id}
              type="button"
              onClick={() => onRemove(id)}
              className="rounded-full bg-white px-2 py-1 text-[10px] font-black text-sg-blue shadow-sm hover:bg-sg-bg"
              title={`Remove ${ingredient(id).label}`}
            >
              {ingredient(id).shortLabel} ×{count}
            </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DrinkPreview({ selected }: { selected: IngredientId[] }) {
  const has = (id: IngredientId) => selected.includes(id);
  const iced = has('ice');
  const liquidColor = has('milo')
    ? '#714020'
    : has('tea')
      ? '#9a5828'
      : has('coffee')
        ? '#4c2518'
        : '#dbeafe';
  const milkPortions = selected.filter((id) => id === 'condensed' || id === 'evaporated').length;
  const milkOpacity = Math.min(0.58, milkPortions * 0.2);
  const fillHeight = selected.length === 0 ? 8 : Math.min(78, 22 + selected.length * 10);

  return (
    <div className="relative flex h-32 w-28 items-end justify-center sm:h-40 sm:w-32" aria-label="Your drink">
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

      <div
        className={clsx(
          'relative overflow-hidden border-[5px] border-[#f5ead6] bg-white/30 shadow-[0_12px_24px_rgba(44,24,11,0.28)]',
          iced ? 'h-28 w-20 rounded-b-2xl rounded-t-lg sm:h-36 sm:w-24' : 'h-24 w-24 rounded-b-[2.2rem] rounded-t-xl sm:h-28 sm:w-28',
        )}
      >
        <motion.div
          className="absolute inset-x-0 bottom-0"
          animate={{ height: `${fillHeight}%`, backgroundColor: liquidColor }}
          transition={{ type: 'spring', stiffness: 180, damping: 20 }}
        >
          <div className="absolute inset-0 bg-white" style={{ opacity: milkOpacity }} />
          {has('sugar') && <div className="absolute inset-x-0 bottom-0 h-2 bg-amber-100/30" />}
          {has('milo-top') && <div className="absolute inset-x-0 top-0 h-4 bg-[#3f2418] shadow-[0_2px_0_rgba(255,255,255,0.12)]" />}
        </motion.div>
        {iced && (
          <div className="absolute inset-x-1 top-2 flex flex-wrap justify-center gap-1" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="size-3 rotate-12 rounded-sm border border-white/80 bg-sky-100/65 shadow-sm" />
            ))}
          </div>
        )}
        <div className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#315d43]/55 opacity-70" />
      </div>
      {!iced && <div className="absolute right-0 top-[47%] h-10 w-7 rounded-r-full border-[5px] border-l-0 border-[#f5ead6]" />}
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
    <motion.div
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

  function removeIngredient(id: IngredientId) {
    if (feedback) return;
    setHint(null);
    setSelected((items) => {
      const index = items.lastIndexOf(id);
      return index < 0 ? items : [...items.slice(0, index), ...items.slice(index + 1)];
    });
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

  function askForHint() {
    if (!current || feedback) return;
    setHint(getBuildHint(selected, current.ingredients));
  }

  function discardDrink() {
    setSelected([]);
    setHint(null);
    setFeedback(null);
    setSeconds(0);
    setCupVersion((value) => value + 1);
    roundStartedAt.current = Date.now();
  }

  function undoIngredient() {
    setSelected((items) => items.slice(0, -1));
    setHint(null);
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
    setScore(0);
    setHearts(MAX_HEARTS);
    setStreak(0);
    setBestStreak(0);
    setSeconds(0);
    setHint(null);
    setActiveDrag(null);
    setCupVersion((value) => value + 1);
    completeFired.current = false;
  }

  const rank = score >= 1650 ? 'Kopi Master' : score >= 1250 ? 'Stall Regular' : 'Kopi Rookie';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white shadow-card">
      <AnimatePresence>{showCodebook && <Codebook onClose={() => setShowCodebook(false)} />}</AnimatePresence>

      <header className="flex flex-wrap items-center justify-between gap-3 bg-sg-navy px-4 py-3 text-white sm:px-5">
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
          <button type="button" onClick={() => setShowCodebook(true)} aria-label="Open codebook" className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-2 transition-colors hover:bg-white/20">
            <BookOpen className="size-4" />
            <span className="hidden sm:inline">Codebook</span>
          </button>
        </div>
      </header>

      {phase === 'briefing' && (
        <div className="grid min-h-[610px] bg-[#fffaf0] lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative min-h-72 overflow-hidden lg:min-h-full">
            <img src={ART.background} alt="Illustrated kopitiam drinks stall" className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-sg-navy/75 via-sg-navy/28 to-transparent" />
            <img src={ART.auntie} alt="Auntie Poh" className="absolute -bottom-16 right-[-4%] h-[108%] max-w-[55%] object-cover object-top drop-shadow-2xl" />
            <div className="absolute bottom-5 left-5 max-w-[58%] rounded-2xl rounded-bl-sm bg-white p-4 text-sm font-bold leading-relaxed text-sg-navy shadow-card sm:text-base">
              Morning rush coming! I call the order, you make the drink. Don't mix up O and kosong, ah!
            </div>
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-sg-orange">Your first stall shift</p>
            <h3 className="mt-2 text-3xl font-black leading-tight text-sg-navy">Crack the kopi code by making it.</h3>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-sg-navy/55">Serve six orders using ready kopi, teh, or Milo, then drag in the right number of milk, sugar, ice, or topping portions.</p>
            <div className="mt-5 grid gap-2 text-sm font-bold text-sg-navy/70">
              <p className="flex items-center gap-2 rounded-2xl bg-white p-3"><Lightbulb className="size-5 text-sg-xp" /> Ask for one ingredient hint whenever you're stuck.</p>
              <p className="flex items-center gap-2 rounded-2xl bg-white p-3"><Zap className="size-5 text-sg-purple" /> Build a streak and serve quickly for bonus points.</p>
              <p className="flex items-center gap-2 rounded-2xl bg-white p-3"><Heart className="size-5 fill-sg-coral text-sg-coral" /> Three patience hearts absorb mistakes.</p>
            </div>
            <Button size="lg" className="mt-6 w-full" onClick={startShift}>Start the shift <ChevronRight className="size-5" /></Button>
            <button type="button" onClick={() => setShowCodebook(true)} className="mt-3 text-sm font-black text-sg-blue hover:underline">Study all {KOPI_RECIPES.length} drinks first</button>
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
          <div className="relative h-[300px] overflow-hidden sm:h-[350px]">
            <img src={ART.background} alt="Kopitiam drink counter" className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-sg-navy/42 via-transparent to-sg-navy/12" />
            <img src={ART.auntie} alt="Auntie Poh calling the next order" className="absolute -bottom-20 right-[-2%] h-[112%] max-w-[38%] object-cover object-top drop-shadow-2xl" />
            <div className="absolute left-4 top-4 sm:left-6 sm:top-6">
              <OrderTicket recipe={current} orderNumber={roundIndex + 1} total={orders.length} />
            </div>
            <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-sg-navy/72 px-3 py-2 text-xs font-black text-white backdrop-blur-sm">
              <Clock3 className="size-4 text-sg-xp" /> {seconds}s
              {streak > 1 && <span className="text-sg-xp">🔥 {streak} streak</span>}
            </div>
          </div>

          <div className="border-t border-sg-navy/8 bg-[#fffdf8] p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-sg-navy/35">
                Drag into the cup · repeat a drag for another portion
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={askForHint} className="flex min-h-10 items-center gap-1.5 rounded-xl bg-sg-xp/15 px-3 text-xs font-black text-sg-navy hover:bg-sg-xp/25">
                  <Lightbulb className="size-4 text-sg-orange" /> Ask for hint
                </button>
                <button type="button" onClick={undoIngredient} disabled={selected.length === 0 || Boolean(feedback)} className="flex min-h-10 items-center gap-1.5 rounded-xl bg-sg-navy/5 px-3 text-xs font-black text-sg-navy/60 disabled:opacity-35">
                  <Undo2 className="size-4" /> Undo
                </button>
                <button type="button" onClick={discardDrink} disabled={selected.length === 0 || Boolean(feedback)} className="flex min-h-10 items-center gap-1.5 rounded-xl bg-sg-coral/10 px-3 text-xs font-black text-sg-coral disabled:opacity-35">
                  <Trash2 className="size-4" /> Discard drink
                </button>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {hint && !feedback && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 overflow-hidden">
                  <div className={clsx(
                    'rounded-2xl border p-4',
                    hint.kind === 'restart' ? 'border-sg-coral/35 bg-sg-coral/10' : 'border-sg-xp/35 bg-sg-xp/10',
                  )}>
                    <div className="grid gap-2 text-xs font-bold text-sg-navy/60 sm:grid-cols-2">
                      <p><span className="font-black text-sg-navy">Order:</span> {current.name}</p>
                      <p><span className="font-black text-sg-navy">In your cup:</span> {describeCup(selected)}</p>
                    </div>
                    <p className={clsx('mt-3 text-sm font-black', hint.kind === 'restart' ? 'text-sg-coral' : 'text-sg-navy')}>
                      {hint.kind === 'add' && (
                        <>Next step only: drag in 1 portion of {ingredient(hint.ingredient).label}.</>
                      )}
                      {hint.kind === 'restart' && (
                        <>{ingredient(hint.ingredient).label} does not belong in this order, or there is too much of it. Discard this drink and restart.</>
                      )}
                      {hint.kind === 'ready' && <>Everything in the cup is correct. Serve it!</>}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <section
              className="relative overflow-hidden rounded-[2rem] border border-[#ad7b44]/25 p-3 shadow-inner sm:p-4"
              style={{ background: 'linear-gradient(180deg, #f7d69a 0%, #d99b55 7%, #b66d31 9%, #8a471f 100%)' }}
            >
              <div className="absolute inset-x-0 top-[10%] h-px bg-white/20" />
              <div className="absolute inset-x-0 bottom-2 h-4 rounded-[50%] bg-black/15 blur-md" />
              <div className="relative mb-1 flex items-center justify-between px-2">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.16em] text-white/75">Kopitiam workbench</h4>
                  <p className="text-[10px] font-bold text-white/50">Pick up the item itself and drop one portion at a time.</p>
                </div>
                <span className="rounded-full bg-white/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-white/80">Fresh cup</span>
              </div>

              <div
                className="relative grid items-center gap-1 sm:gap-3"
                style={{ gridTemplateColumns: 'minmax(0, 1fr) 10rem minmax(0, 1fr)' }}
              >
                <div className="grid grid-cols-2 gap-0.5 sm:gap-2">
                  {INGREDIENTS.slice(0, 4).map((item) => (
                    <DraggableIngredient
                      key={item.id}
                      id={item.id}
                      count={selectedCounts.get(item.id) ?? 0}
                      disabled={Boolean(feedback)}
                    />
                  ))}
                </div>

                <DrinkDropZone
                  key={`${current.id}-${cupVersion}`}
                  cupKey={`${current.id}-${cupVersion}`}
                  selected={selected}
                  onRemove={removeIngredient}
                />

                <div className="grid grid-cols-2 gap-0.5 sm:gap-2">
                  {INGREDIENTS.slice(4).map((item) => (
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

            <Button size="lg" className="mt-4 w-full" disabled={selected.length === 0 || Boolean(feedback)} onClick={serveDrink}>
              Serve {current.name} <span aria-hidden="true">→</span>
            </Button>
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
        <div className="relative min-h-[610px] overflow-hidden bg-sg-navy px-5 py-10 text-center text-white sm:px-8">
          <Confetti count={34} />
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url(${ART.background})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="relative mx-auto max-w-lg">
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
