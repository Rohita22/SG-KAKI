import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Lightbulb, ScanLine, Volume2 } from 'lucide-react';

type FarePhase = 'walking' | 'tap' | 'reminder' | 'accepted';

/** A visible bus farebox teaches the actual on-board payment action. */
export function BusFareView({ paused, onPaid }: { paused: boolean; onPaid: () => void }) {
  const [phase, setPhase] = useState<FarePhase>('walking');

  useEffect(() => {
    if (paused || phase !== 'walking') return;
    const timer = window.setTimeout(() => setPhase('tap'), 1100);
    return () => window.clearTimeout(timer);
  }, [paused, phase]);
  useEffect(() => {
    if (paused || phase !== 'tap') return;
    const timer = window.setTimeout(() => setPhase('reminder'), 3600);
    return () => window.clearTimeout(timer);
  }, [paused, phase]);
  useEffect(() => {
    if (paused || phase !== 'accepted') return;
    const timer = window.setTimeout(onPaid, 900);
    return () => window.clearTimeout(timer);
  }, [onPaid, paused, phase]);

  return <div className="relative h-full overflow-hidden bg-slate-900">
    <img src="/scenes/scene4/environments/bus-interior.png" alt="Inside bus 50" className="absolute inset-0 size-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-l from-sg-navy/55 via-transparent to-sg-navy/20" />
    <div className="absolute inset-x-3 top-3 z-20 rounded-2xl bg-sg-navy/90 px-3 py-2.5 text-white shadow-xl backdrop-blur"><p className="text-[9px] font-black uppercase tracking-[0.15em] text-sg-xp">Bus 50 · boarding fare</p><p className="mt-1 text-sm font-black">Tap your travel card on the fare reader.</p></div>
    {phase === 'reminder' && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-x-8 top-20 z-30 flex items-center justify-center gap-1.5 rounded-xl border border-sg-xp/50 bg-sg-navy/95 px-3 py-2 text-center text-[11px] font-black text-white shadow-xl"><Volume2 className="size-3.5 text-sg-xp" /> Driver: “Excuse me — please tap your card.”</motion.div>}
    <motion.img src="/scenes/scene4/characters/player-walk-2.png" alt="Your character" className="absolute bottom-[8%] left-[8%] z-20 h-[46%] object-contain drop-shadow-[0_12px_10px_rgba(15,23,42,0.5)]" animate={phase === 'walking' ? { x: ['0%', '160%'] } : phase === 'accepted' ? { x: ['160%', '270%'], opacity: [1, 0] } : { x: '160%', opacity: 1 }} transition={{ duration: 0.9, ease: 'easeInOut' }} />
    <div className="absolute bottom-[20%] left-[49%] z-20 flex h-36 w-24 flex-col items-center rounded-t-xl border-[5px] border-slate-700 bg-slate-800 p-2 shadow-2xl"><span className="mt-1 text-center text-[8px] font-black uppercase tracking-wide text-white/70">CARD READER</span><span className="mt-3 h-5 w-14 rounded-md bg-slate-950" /><span className="mt-2 h-8 w-16 rounded-lg bg-emerald-400/25" /></div>
    {(phase === 'tap' || phase === 'reminder') && !paused && <motion.button type="button" aria-label="Tap your travel card on the bus fare reader" onClick={() => setPhase('accepted')} animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 0.9, repeat: Infinity }} className="absolute bottom-[28%] left-[50.5%] z-30 flex size-16 -translate-x-1/2 items-center justify-center rounded-xl border-4 border-white bg-emerald-500 text-white shadow-2xl"><ScanLine className="size-8" /><span className="sr-only">Tap card on fare reader</span></motion.button>}
    {phase === 'reminder' && <div className="absolute bottom-[45%] left-[55%] z-30 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[9px] font-black text-sg-navy shadow"><Lightbulb className="size-3 text-amber-600" /> The reader is beside the driver.</div>}
    <div className="absolute inset-x-3 bottom-3 z-20 rounded-2xl bg-white px-4 py-3 shadow-lg"><p className="flex items-center gap-2 text-sm font-black text-sg-navy"><CreditCard className="size-4 text-sg-blue" /> {phase === 'walking' ? 'Walk to the fare reader…' : phase === 'accepted' ? 'Beep — fare accepted. Find a seat.' : 'Tap the glowing farebox with your card.'}</p><p className="mt-1 text-[11px] font-semibold text-sg-navy/45">This is the on-board reader at the entrance, not a ticket counter.</p></div>
  </div>;
}
