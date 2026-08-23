import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BusFront, Hand, Radio, TrainFront } from 'lucide-react';
import type { Ride } from './route';

type ArrivalPhase = 'approaching' | 'stopping' | 'boarding' | 'departing' | 'missed';

const BUS_SIGNAL_WINDOW_MS = 5200;
const TRAIN_ARRIVAL_MS = 1800;
const STOPPING_MS = 1000;
const BOARDING_MS = 1500;
const DEPART_MS = 1450;

/** Bus uses the road in the scene; rail vehicles stay behind the platform doors. */
export function BoardingView({ ride, paused, onBoard, onWait, busAlreadyStopped = false }: { ride: Ride; paused: boolean; onBoard: () => void; onWait: () => void; busAlreadyStopped?: boolean }) {
  const isBus = ride.id === 'ride-bus';
  const isLrt = ride.id === 'ride-lrt';
  const [phase, setPhase] = useState<ArrivalPhase>(() => busAlreadyStopped && ride.id === 'ride-bus' ? 'stopping' : 'approaching');
  const Icon = isBus ? BusFront : TrainFront;
  const background = isBus ? '/scenes/scene4/environments/kadaloor-bus-stop.png' : ride.id.includes('dtl') ? '/scenes/scene4/environments/little-india-dtl-platform.png' : '/scenes/scene4/environments/punggol-nel-platform.png';

  useEffect(() => {
    if (paused) return;
    let next: { after: number; phase?: ArrivalPhase; board?: boolean } | null = null;
    if (phase === 'approaching') next = isBus ? { after: BUS_SIGNAL_WINDOW_MS, phase: 'departing' } : { after: TRAIN_ARRIVAL_MS, phase: 'stopping' };
    else if (phase === 'stopping') next = { after: STOPPING_MS, phase: 'boarding' };
    else if (phase === 'boarding') next = { after: BOARDING_MS, board: true };
    else if (phase === 'departing') next = { after: DEPART_MS, phase: 'missed' };
    if (!next) return;
    const timer = window.setTimeout(() => {
      if (next?.board) onBoard();
      else if (next?.phase) setPhase(next.phase);
    }, next.after);
    return () => window.clearTimeout(timer);
  }, [isBus, onBoard, paused, phase]);

  const signalBus = () => { if (phase === 'approaching') setPhase('stopping'); };
  const vehicleX = phase === 'approaching' ? '112%' : phase === 'departing' || phase === 'missed' ? '-120%' : '4%';
  const vehicleName = isBus ? 'bus' : isLrt ? 'LRT' : 'MRT train';

  return <div className="flex h-full flex-col bg-white">
    <div className={`relative min-h-0 flex-1 overflow-hidden ${isBus ? 'bg-sky-200' : 'bg-slate-200'}`}>
      <img src={background} alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-sg-navy/5 via-transparent to-sg-navy/35" />
      <div className="absolute inset-x-3 top-3 z-20 flex items-center justify-between rounded-2xl bg-sg-navy/90 px-3 py-2.5 text-white shadow-lg backdrop-blur-sm"><div className="flex min-w-0 items-center gap-2"><span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-white/10"><Icon className="size-4" /></span><div><p className="text-xs font-black">{ride.line}</p><p className="text-[9px] font-bold uppercase tracking-wider text-white/50">Towards {ride.direction}</p></div></div><StatusPill phase={phase} paused={paused} /></div>
      {isBus && <div className="absolute right-3 top-16 z-20 rounded-xl border border-white/20 bg-sg-navy/85 px-3 py-2 text-right text-white shadow-lg backdrop-blur"><p className="text-[8px] font-black uppercase tracking-[0.15em] text-sg-xp">Stop 65321 · Kadaloor Exit B</p><p className="mt-0.5 text-xs font-black">50 <span className="text-white/65">→ Punggol Int</span></p></div>}
      {!isBus && <motion.div animate={phase === 'stopping' || phase === 'boarding' ? { opacity: [0, 0.42, 0.2] } : { opacity: 0 }} className="absolute inset-x-0 bottom-[16%] top-[20%] bg-white/35 mix-blend-screen" />}
      {!isBus && <div className="absolute inset-x-8 bottom-[25%] z-10 rounded-xl bg-sg-navy/85 px-4 py-2 text-center text-[11px] font-black text-white shadow-lg">{phase === 'approaching' ? `${isLrt ? 'LRT' : 'MRT'} approaching on the track behind the platform doors` : `${isLrt ? 'LRT' : 'MRT'} has stopped at the platform`}</div>}
      {isBus && <motion.div className="absolute bottom-[1%] z-10 h-[46%] w-[74%]" initial={{ x: '112%' }} animate={{ x: vehicleX }} transition={{ duration: phase === 'departing' ? DEPART_MS / 1000 : 1.2, ease: phase === 'departing' ? 'easeIn' : 'easeOut' }}><img src="/scenes/scene4/vehicles/bus-50-open-cutout.png" alt="Bus 50 at the curb" className="size-full object-contain drop-shadow-[0_18px_16px_rgba(15,23,42,0.55)]" /></motion.div>}
      <motion.div className="absolute bottom-[7%] left-[13%] z-20 h-[42%]" animate={phase === 'boarding' ? { x: ['0%', '310%'], opacity: [1, 1, 0] } : { x: 0, opacity: 1 }} transition={{ duration: BOARDING_MS / 1000, ease: 'easeInOut' }}><img src="/scenes/scene4/characters/player-walk-2.png" alt="Your character" className="h-full object-contain drop-shadow-[0_10px_8px_rgba(15,23,42,0.45)]" /></motion.div>
      {isBus && phase === 'approaching' && !paused && <motion.button type="button" onClick={signalBus} aria-label="Raise your hand to stop bus 50" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: [1, 1.05, 1] }} transition={{ scale: { repeat: Infinity, duration: 0.9 } }} className="absolute bottom-[25%] left-[18%] z-30 flex flex-col items-center gap-1 rounded-2xl border-4 border-white bg-sg-xp px-4 py-3 text-sg-navy shadow-2xl"><Hand className="size-7" /><span className="text-[10px] font-black uppercase tracking-wide">Raise hand</span></motion.button>}
      {isBus && phase === 'missed' && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-x-8 top-16 z-30 rounded-xl border border-sg-xp/50 bg-sg-navy/95 px-3 py-2 text-center text-[11px] font-black text-white shadow-xl">HINT · Raise your hand to stop the bus.</motion.div>}
    </div>
    <div className="border-t border-black/5 bg-white p-3 sm:p-4">
      {phase === 'approaching' && <Message title={isBus ? 'Bus 50 is coming along the road' : `${vehicleName} approaching`} body={isBus ? 'Raise your hand while you wait at the stop.' : 'It is arriving on the track behind the platform screen doors.'} />}
      {phase === 'stopping' && <Message title={`${vehicleName} stopping`} body={isBus ? 'The driver saw your signal and has pulled in at the curb.' : 'The platform doors are opening. Board with the other passengers.'} />}
      {phase === 'boarding' && <Message title="Boarding…" body="Your character walks through the open doors." />}
      {phase === 'departing' && <Message title="It does not stop" body={`The ${vehicleName} is moving away.`} />}
      {phase === 'missed' && <button type="button" onClick={onWait} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-left text-sm font-black text-sg-navy transition-colors hover:bg-slate-100"><span className="flex items-center gap-2"><Radio className="size-4 text-sg-blue" /> Wait for the next service</span><span className="text-xs text-sg-navy/40">+{ride.waitMin} min</span></button>}
    </div>
  </div>;
}

function StatusPill({ phase, paused }: { phase: ArrivalPhase; paused: boolean }) {
  const label = paused ? 'Paused' : phase === 'approaching' ? 'Approaching' : phase === 'stopping' ? 'Doors open' : phase === 'boarding' ? 'Boarding' : phase === 'departing' ? 'Departing' : 'Missed';
  return <span className={`shrink-0 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${phase === 'stopping' && !paused ? 'bg-emerald-400 text-emerald-950' : 'bg-white/10 text-white/70'}`}>{label}</span>;
}

function Message({ title, body }: { title: string; body: string }) {
  return <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3"><span className="size-2.5 shrink-0 animate-pulse rounded-full bg-sg-blue" /><div><p className="text-sm font-black text-sg-navy">{title}</p><p className="mt-0.5 text-[11px] font-semibold text-sg-navy/45">{body}</p></div></div>;
}
