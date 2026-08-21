import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BusFront, Clock3, DoorOpen, TrainFront } from 'lucide-react';
import type { Ride } from './route';

type ArrivalPhase = 'approaching' | 'open' | 'boarding' | 'departing' | 'missed';

const APPROACH_MS = 2600;
const DOORS_OPEN_MS = 5500;
const BOARDING_MS = 1300;
const DEPART_MS = 1600;

export function BoardingView({
  ride,
  paused,
  onBoard,
  onWait,
}: {
  ride: Ride;
  paused: boolean;
  onBoard: () => void;
  onWait: () => void;
}) {
  const [phase, setPhase] = useState<ArrivalPhase>('approaching');
  const isBus = ride.id === 'ride-bus';
  const Icon = isBus ? BusFront : TrainFront;
  const background = isBus
    ? '/scenes/scene4/environments/kadaloor-bus-stop.png'
    : ride.id.includes('dtl')
      ? '/scenes/scene4/environments/little-india-dtl-platform.png'
      : '/scenes/scene4/environments/punggol-nel-platform.png';
  const vehicle = isBus
    ? '/scenes/scene4/vehicles/bus-50-open-cutout.png'
    : ride.id.includes('dtl')
      ? '/scenes/scene4/vehicles/dtl-train-open-cutout.png'
      : '/scenes/scene4/vehicles/nel-train-open-cutout.png';

  useEffect(() => {
    if (paused) return;
    const next =
      phase === 'approaching'
        ? { after: APPROACH_MS, phase: 'open' as const }
        : phase === 'open'
          ? { after: DOORS_OPEN_MS, phase: 'departing' as const }
          : phase === 'boarding'
            ? { after: BOARDING_MS, phase: null }
            : phase === 'departing'
              ? { after: DEPART_MS, phase: 'missed' as const }
              : null;
    if (!next) return;
    const timer = setTimeout(() => {
      if (next.phase) setPhase(next.phase);
      else onBoard();
    }, next.after);
    return () => clearTimeout(timer);
  }, [phase, paused, onBoard]);

  const vehicleX = phase === 'approaching' ? '108%' : phase === 'departing' || phase === 'missed' ? '-118%' : '5%';

  return (
    <div className="flex h-full flex-col bg-white">
      <div className={`relative min-h-0 flex-1 overflow-hidden ${isBus ? 'bg-sky-200' : 'bg-slate-200'}`}>
        <img src={background} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-sg-navy/5 via-transparent to-sg-navy/30" />

        <div className="absolute inset-x-3 top-3 z-20 flex items-center justify-between rounded-2xl bg-sg-navy/90 px-3 py-2.5 text-white shadow-lg backdrop-blur-sm">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white/10"><Icon className="size-4" /></span>
            <div className="min-w-0">
              <p className="truncate text-xs font-black">{ride.line}</p>
              <p className="truncate text-[9px] font-bold uppercase tracking-wider text-white/50">Towards {ride.direction}</p>
            </div>
          </div>
          <StatusPill phase={phase} paused={paused} />
        </div>

        <motion.div
          className={`absolute z-10 ${isBus ? 'bottom-[9%] h-[68%] w-[68%]' : 'bottom-[12%] h-[60%] w-[94%]'}`}
          initial={{ x: '108%' }}
          animate={{ x: vehicleX }}
          transition={{ duration: phase === 'approaching' ? APPROACH_MS / 1000 : DEPART_MS / 1000, ease: phase === 'approaching' ? 'easeOut' : 'easeIn' }}
        >
          <img src={vehicle} alt={`${ride.line} towards ${ride.direction}`} className="size-full object-contain drop-shadow-[0_18px_16px_rgba(15,23,42,0.55)]" />
        </motion.div>

        <motion.div
          className="absolute bottom-[8%] left-[7%] z-20 h-[48%]"
          animate={phase === 'boarding' ? { x: ['0%', '280%'], opacity: [1, 1, 0] } : { x: 0, opacity: 1 }}
          transition={{ duration: BOARDING_MS / 1000, ease: 'easeInOut' }}
        >
          <img src="/scenes/scene4/characters/player-walk-2.png" alt="Your character" className="h-full object-contain drop-shadow-[0_10px_8px_rgba(15,23,42,0.45)]" />
        </motion.div>

        {phase === 'open' && !paused && (
          <motion.button
            type="button"
            aria-label={`Board ${ride.line} towards ${ride.direction}`}
            onClick={() => setPhase('boarding')}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: [1, 1.04, 1], opacity: 1 }}
            transition={{ scale: { repeat: Infinity, duration: 1.1 } }}
            className="absolute bottom-[24%] left-[58%] z-30 flex size-16 items-center justify-center rounded-full border-4 border-white bg-sg-xp text-sg-navy shadow-2xl"
          >
            <DoorOpen className="size-7" />
          </motion.button>
        )}
      </div>

      <div className="border-t border-black/5 bg-white p-3 sm:p-4">
        {phase === 'approaching' && (
          <Message title={`${isBus ? 'Bus' : 'Train'} approaching`} body="Stay ready and check the destination display before boarding." />
        )}
        {phase === 'open' && (
          <div>
            <button
              type="button"
              disabled={paused}
              onClick={() => setPhase('boarding')}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sg-blue px-4 py-3.5 text-sm font-black text-white shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-40"
            >
              <DoorOpen className="size-4" /> Board now
            </button>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <motion.div key="door-timer" className="h-full rounded-full bg-sg-xp" initial={{ width: '100%' }} animate={{ width: '0%' }} transition={{ duration: DOORS_OPEN_MS / 1000, ease: 'linear' }} />
            </div>
          </div>
        )}
        {phase === 'boarding' && <Message title="Boarding…" body="You walk through the open doors and tap in." />}
        {phase === 'departing' && <Message title="Doors closed" body={`The ${isBus ? 'bus' : 'train'} is leaving without you.`} />}
        {phase === 'missed' && (
          <button type="button" onClick={onWait} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left text-sm font-black text-sg-navy transition-colors hover:bg-slate-100">
            <span className="flex items-center gap-2"><Clock3 className="size-4 text-sg-blue" /> Wait for the next service</span>
            <span className="text-xs text-sg-navy/40">+{ride.waitMin} min</span>
          </button>
        )}
      </div>
    </div>
  );
}

function StatusPill({ phase, paused }: { phase: ArrivalPhase; paused: boolean }) {
  const label = paused ? 'Paused' : phase === 'approaching' ? 'Arriving' : phase === 'open' ? 'Doors open' : phase === 'boarding' ? 'Boarding' : phase === 'departing' ? 'Departing' : 'Missed';
  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${phase === 'open' && !paused ? 'bg-emerald-400 text-emerald-950' : 'bg-white/10 text-white/70'}`}>{label}</span>;
}

function Message({ title, body }: { title: string; body: string }) {
  return <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3"><span className="size-2.5 shrink-0 animate-pulse rounded-full bg-sg-blue" /><div><p className="text-sm font-black text-sg-navy">{title}</p><p className="mt-0.5 text-[11px] font-semibold text-sg-navy/45">{body}</p></div></div>;
}
