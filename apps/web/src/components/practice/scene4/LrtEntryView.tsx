import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Lightbulb, ScanLine, TrainFront } from 'lucide-react';

type EntryPhase = 'arriving' | 'tap' | 'hint' | 'accepted';

/** The LRT alternative has its own fare-gate lesson before the train arrives. */
export function LrtEntryView({ paused, onEnter }: { paused: boolean; onEnter: () => void }) {
  const [phase, setPhase] = useState<EntryPhase>('arriving');

  useEffect(() => {
    if (paused || phase !== 'arriving') return;
    const timer = window.setTimeout(() => setPhase('tap'), 1050);
    return () => window.clearTimeout(timer);
  }, [paused, phase]);

  useEffect(() => {
    if (paused || phase !== 'tap') return;
    const timer = window.setTimeout(() => setPhase('hint'), 3200);
    return () => window.clearTimeout(timer);
  }, [paused, phase]);

  useEffect(() => {
    if (paused || phase !== 'accepted') return;
    const timer = window.setTimeout(onEnter, 900);
    return () => window.clearTimeout(timer);
  }, [onEnter, paused, phase]);

  return <div className="relative h-full overflow-hidden bg-slate-900">
    <img src="/scenes/scene4/environments/kadaloor-lrt-gates.png" alt="Kadaloor LRT fare gates" className="absolute inset-0 size-full object-cover" />
    <div className="absolute inset-0 bg-gradient-to-t from-sg-navy/85 via-sg-navy/25 to-sg-navy/20" />
    <div className="absolute inset-x-3 top-3 z-20 flex items-center gap-2 rounded-2xl bg-sg-navy/90 px-3 py-2.5 text-white shadow-xl backdrop-blur"><span className="flex size-8 items-center justify-center rounded-xl bg-white/10"><TrainFront className="size-4" /></span><div><p className="text-xs font-black">Kadaloor LRT · East Loop</p><p className="text-[9px] font-bold uppercase tracking-wider text-white/50">Fare gates before the platform</p></div></div>
    {phase === 'hint' && <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="absolute inset-x-8 top-16 z-30 flex items-center justify-center gap-1.5 rounded-xl border border-sg-xp/55 bg-sg-navy/95 px-3 py-2 text-center text-[11px] font-black text-white shadow-xl"><Lightbulb className="size-3.5 text-sg-xp" /> Tap your card at the fare gate to enter.</motion.div>}
    <div className="absolute bottom-[15%] left-1/2 z-10 h-[46%] w-[58%] -translate-x-1/2 rounded-t-[2rem] border-x-[18px] border-t-[14px] border-slate-800/90 bg-slate-800/35 shadow-2xl"><div className="absolute inset-x-[12%] top-[24%] h-2 rounded-full bg-white/30" /><div className="absolute inset-x-[18%] top-[47%] h-2 rounded-full bg-white/30" /><div className="absolute inset-x-[12%] bottom-[10%] h-2 rounded-full bg-white/30" /></div>
    <motion.div className="absolute bottom-[12%] left-[15%] z-20 h-[45%]" animate={phase === 'accepted' ? { x: ['0%', '170%'], opacity: [1, 1, 0] } : { x: 0, opacity: 1 }} transition={{ duration: 0.8, ease: 'easeInOut' }}><img src="/scenes/scene4/characters/player-walk-2.png" alt="Your character" className="h-full object-contain drop-shadow-lg" /></motion.div>
    {(phase === 'tap' || phase === 'hint') && !paused && <motion.button type="button" aria-label="Tap your card at the LRT fare gate" onClick={() => setPhase('accepted')} animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 1, repeat: Infinity }} className="absolute bottom-[28%] right-[20%] z-30 flex size-20 items-center justify-center rounded-2xl border-4 border-white bg-emerald-500 text-white shadow-2xl"><ScanLine className="size-9" /><span className="sr-only">Tap card</span></motion.button>}
    <div className="absolute inset-x-3 bottom-3 z-20 rounded-2xl bg-white px-4 py-3 shadow-lg"><p className="flex items-center gap-2 text-sm font-black text-sg-navy"><CreditCard className="size-4 text-sg-blue" /> {phase === 'arriving' ? 'Walk up to the LRT fare gate…' : phase === 'accepted' ? 'Card accepted — the gate opens.' : 'Tap your travel card on the glowing reader.'}</p><p className="mt-1 text-[11px] font-semibold text-sg-navy/45">You stay in the paid area through the transfer at Punggol.</p></div>
  </div>;
}
