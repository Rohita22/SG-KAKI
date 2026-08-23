import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Armchair, BusFront, TrainFront, UserRound } from 'lucide-react';
import type { Ride } from './route';

type Seat = { id: string; x: number; y: number; occupied?: boolean };

const BUS_SEATS: Seat[] = [
  { id: 'B01', x: 78, y: 41 }, { id: 'B02', x: 85, y: 41, occupied: true },
  { id: 'B03', x: 73, y: 36 }, { id: 'B04', x: 80, y: 36 }, { id: 'B05', x: 87, y: 36 },
  { id: 'B06', x: 72, y: 31, occupied: true }, { id: 'B07', x: 78, y: 31 }, { id: 'B08', x: 84, y: 31 },
  { id: 'B09', x: 70, y: 26 }, { id: 'B10', x: 76, y: 26 }, { id: 'B11', x: 82, y: 26, occupied: true },
  { id: 'B12', x: 69, y: 21 }, { id: 'B13', x: 75, y: 21 }, { id: 'B14', x: 81, y: 21 }, { id: 'B15', x: 87, y: 21, occupied: true },
];

const RAIL_SEATS: Seat[] = [
  { id: 'R01', x: 13, y: 65 }, { id: 'R02', x: 20, y: 64, occupied: true }, { id: 'R03', x: 27, y: 61 }, { id: 'R04', x: 35, y: 50 },
  { id: 'R05', x: 41, y: 45 }, { id: 'R06', x: 45, y: 41, occupied: true }, { id: 'R07', x: 49, y: 38 }, { id: 'R08', x: 53, y: 36 },
  { id: 'R09', x: 59, y: 39 }, { id: 'R10', x: 63, y: 42, occupied: true }, { id: 'R11', x: 67, y: 46 }, { id: 'R12', x: 72, y: 51 },
  { id: 'R13', x: 79, y: 61 }, { id: 'R14', x: 86, y: 64, occupied: true },
];

/** Every visible seat is an individual component positioned over the vehicle art. */
export function SeatView({ ride, onChoose }: { ride: Ride; onChoose: (seat: string) => void }) {
  const isBus = ride.id === 'ride-bus';
  const seats = useMemo(() => isBus ? BUS_SEATS : RAIL_SEATS, [isBus]);
  const [selected, setSelected] = useState<Seat | null>(null);
  const Icon = isBus ? BusFront : TrainFront;

  useEffect(() => {
    if (!selected) return;
    const timer = window.setTimeout(() => onChoose(selected.id), 850);
    return () => window.clearTimeout(timer);
  }, [onChoose, selected]);

  return <div className="relative h-full overflow-hidden bg-slate-900">
    <img src={ride.background} alt={`Inside ${ride.line}`} className="absolute inset-0 size-full object-cover" />
    <div className="absolute inset-0 bg-slate-950/10" />
    <div className="absolute inset-x-3 top-3 z-30 flex items-center gap-2 rounded-2xl bg-sg-navy/90 px-3 py-2.5 text-white shadow-xl backdrop-blur"><span className="flex size-8 items-center justify-center rounded-xl bg-white/10"><Icon className="size-4" /></span><div><p className="text-xs font-black">Choose a physical seat</p><p className="text-[9px] font-bold uppercase tracking-wider text-white/50">Every empty seat in view is individually selectable</p></div></div>
    {seats.map((seat) => <SeatMarker key={seat.id} seat={seat} selected={selected?.id === seat.id} onChoose={() => { if (!seat.occupied) setSelected(seat); }} />)}
    <motion.img src="/scenes/scene4/characters/player-walk-2.png" alt="Your character" className="pointer-events-none absolute bottom-[6%] left-[48%] z-20 h-[34%] -translate-x-1/2 object-contain drop-shadow-xl" animate={selected ? { left: `${selected.x}%`, top: `${selected.y + 5}%`, scale: 0.55, opacity: [1, 1, 0] } : { left: '48%', top: 'auto', scale: 1, opacity: 1 }} transition={{ duration: 0.75, ease: 'easeInOut' }} />
    <div className="absolute inset-x-3 bottom-3 z-30 rounded-2xl bg-white/95 px-4 py-3 shadow-xl"><p className="text-sm font-black text-sg-navy">{selected ? `Walking to seat ${selected.id}…` : 'Choose any empty seat.'}</p><p className="mt-0.5 text-[11px] font-semibold text-sg-navy/45"><span className="inline-flex items-center gap-1"><UserRound className="size-3" /> Four seats are occupied; the rest are available.</span></p></div>
  </div>;
}

function SeatMarker({ seat, selected, onChoose }: { seat: Seat; selected: boolean; onChoose: () => void }) {
  return <motion.button type="button" aria-label={seat.occupied ? `Seat ${seat.id} is occupied` : `Sit in seat ${seat.id}`} aria-disabled={seat.occupied} onClick={onChoose} whileHover={seat.occupied ? undefined : { scale: 1.15 }} whileTap={seat.occupied ? undefined : { scale: 0.95 }} className={`absolute z-20 flex size-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-lg border-2 shadow-lg transition-colors ${seat.occupied ? 'cursor-not-allowed border-white/70 bg-sg-navy/85 text-white' : selected ? 'border-white bg-emerald-500 text-white ring-4 ring-emerald-300/60' : 'border-white bg-sg-xp text-sg-navy hover:bg-emerald-400'}`} style={{ left: `${seat.x}%`, top: `${seat.y}%` }}><span className="sr-only">Seat {seat.id}</span>{seat.occupied ? <UserRound className="size-3.5" /> : <Armchair className="size-3.5" />}</motion.button>;
}
