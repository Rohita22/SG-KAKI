import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Hand } from 'lucide-react';
import type { Hotspot, Place } from './route';

type OpeningPhase = 'waiting' | 'bus-approaching' | 'climbing' | 'upper-landing' | 'walking-to-gates';

/**
 * The opening is intentionally not a menu. The player is already waiting at
 * the bus stop: bus 50 arrives on its own, while the physical staircase is the
 * other route out of the scene.
 */
export function KadaloorChoiceView({
  place,
  onHailedBus,
  onChoose,
  disabled,
}: {
  place: Place;
  onHailedBus: (hotspot: Hotspot) => void;
  onChoose: (hotspot: Hotspot) => void;
  disabled: boolean;
}) {
  const [phase, setPhase] = useState<OpeningPhase>('waiting');
  const bus = place.hotspots.find((hotspot) => hotspot.to === 'ride-bus');
  const lrt = place.hotspots.find((hotspot) => hotspot.to === 'ride-lrt');
  const onUpperLanding = phase === 'upper-landing' || phase === 'walking-to-gates';

  useEffect(() => {
    if (phase !== 'waiting' || disabled) return;
    const timer = window.setTimeout(() => setPhase('bus-approaching'), 1250);
    return () => window.clearTimeout(timer);
  }, [disabled, phase]);

  useEffect(() => {
    if (phase !== 'climbing') return;
    const timer = window.setTimeout(() => setPhase('upper-landing'), 1050);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'upper-landing') return;
    const timer = window.setTimeout(() => setPhase('walking-to-gates'), 250);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'walking-to-gates' || !lrt) return;
    const timer = window.setTimeout(() => onChoose(lrt), 1450);
    return () => window.clearTimeout(timer);
  }, [lrt, onChoose, phase]);

  const enterSteps = () => {
    if (disabled || phase === 'climbing' || onUpperLanding) return;
    setPhase('climbing');
  };

  return (
    <div className="relative h-full overflow-hidden bg-slate-900">
      <img
        src={onUpperLanding ? '/scenes/scene4/environments/kadaloor-lrt-upper-landing.png' : place.background}
        alt={onUpperLanding ? 'Top landing at Kadaloor LRT, facing the fare gates' : 'Kadaloor bus stop and stairs to the LRT'}
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-sg-navy/55 via-transparent to-sg-navy/10" />

      {!onUpperLanding && (
        <>
          <div className="absolute left-4 top-4 z-10 rounded-xl border border-white/15 bg-sg-navy/88 px-3 py-2 text-white shadow-lg backdrop-blur">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-sg-xp">Kadaloor · Bus stop 65321</p>
            <p className="mt-0.5 text-xs font-bold text-white/75">Waiting for 50 → Punggol Int</p>
          </div>

          {/* A physical hit-zone over the first visible steps, not an LRT
              choice button. It makes the player walk to the staircase. */}
          <button
            type="button"
            aria-label="Walk onto the first steps up to Kadaloor LRT"
            onClick={enterSteps}
            disabled={disabled || phase === 'climbing'}
            className="absolute bottom-[25%] left-[8%] z-20 h-[32%] w-[23%] cursor-pointer rounded-xl bg-transparent outline-none focus-visible:ring-4 focus-visible:ring-sg-xp/80 disabled:cursor-default"
          >
            <span className="sr-only">Walk towards the stairs</span>
          </button>
        </>
      )}

      <motion.img
        src="/scenes/scene4/characters/player-wait-back.png"
        alt="Your character seen from behind"
        className={`absolute z-20 object-contain drop-shadow-[0_12px_10px_rgba(15,23,42,0.5)] ${onUpperLanding ? 'bottom-[1%] left-[39%] h-[44%]' : 'bottom-[2%] left-[41%] h-[48%]'}`}
        animate={
          phase === 'climbing'
            ? { x: ['0%', '-125%'], y: ['0%', '-78%'], scale: [1, 0.66] }
            : phase === 'walking-to-gates'
              ? { y: ['0%', '-64%'], scale: [1, 0.56], opacity: [1, 1] }
              : { x: 0, y: 0, scale: 1, opacity: 1 }
        }
        transition={{ duration: phase === 'walking-to-gates' ? 1.35 : 0.95, ease: 'easeInOut' }}
      />

      {phase === 'bus-approaching' && (
        <motion.img
          src="/scenes/scene4/vehicles/bus-50-open-cutout.png"
          alt="Bus 50 approaching the curb"
          initial={{ x: '118%' }}
          animate={{ x: '8%' }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute bottom-[1%] z-10 h-[43%] w-[72%] object-contain drop-shadow-[0_18px_16px_rgba(15,23,42,0.55)]"
        />
      )}

      {phase === 'bus-approaching' && bus && !disabled && (
        <motion.button
          type="button"
          onClick={() => onHailedBus(bus)}
          aria-label="Raise your hand to stop bus 50"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: [1, 1.05, 1] }}
          transition={{ scale: { repeat: Infinity, duration: 0.9 } }}
          className="absolute bottom-[29%] left-[18%] z-30 flex flex-col items-center gap-1 rounded-2xl border-4 border-white bg-sg-xp px-4 py-3 text-sg-navy shadow-2xl"
        >
          <Hand className="size-7" />
          <span className="text-[10px] font-black uppercase tracking-wide">Raise hand</span>
        </motion.button>
      )}

      {phase === 'waiting' && <p className="absolute inset-x-0 bottom-6 z-10 text-center text-xs font-black text-white drop-shadow">Wait at the stop — or walk into the stairs.</p>}
      {phase === 'climbing' && <p className="absolute inset-x-0 top-5 z-30 text-center text-xs font-black text-white drop-shadow">Up the first few steps…</p>}
      {onUpperLanding && <p className="absolute inset-x-0 top-5 z-30 text-center text-xs font-black text-white drop-shadow">At the upper landing — walking to the fare gates…</p>}
    </div>
  );
}
