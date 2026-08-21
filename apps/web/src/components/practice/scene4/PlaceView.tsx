import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Footprints, Navigation, ScanLine } from 'lucide-react';
import type { Hotspot, Place } from './route';

const PLAYER_FRAMES = [1, 2, 3, 4].map(
  (frame) => `/scenes/scene4/characters/player-walk-${frame}.png`,
);
const ZONE_POSITIONS: Record<string, number[]> = {
  'kadaloor-busstop': [76, 39, 17],
  'punggol-int': [72, 20, 46],
  'punggol-nel-platform': [70, 28, 48],
  'little-india': [70, 19, 45],
  'little-india-dtl': [72, 27],
  expo: [75, 18, 46],
  'cbp-walk': [82],
};
const INTERACT_DISTANCE = 9;
const WALK_SPEED = 28;

/** Walkable location: move with keys/touch, read the scene, then interact nearby. */
export function PlaceView({ place, onGo, disabled }: {
  place: Place;
  onGo: (hotspot: Hotspot) => void;
  disabled: boolean;
}) {
  const [x, setX] = useState(5);
  const [walking, setWalking] = useState(false);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [frame, setFrame] = useState(0);
  const keys = useRef(new Set<string>());
  const lastTick = useRef<number | null>(null);

  const zones = useMemo(() => {
    const positions = ZONE_POSITIONS[place.id] ?? place.hotspots.map((_, i) => 25 + i * 25);
    return place.hotspots.map((hotspot, i) => ({ hotspot, x: positions[i] ?? 25 + i * 25 }));
  }, [place]);

  const nearest = useMemo(
    () => zones.reduce<(typeof zones)[number] | null>((best, zone) => {
      if (Math.abs(zone.x - x) > INTERACT_DISTANCE) return best;
      return !best || Math.abs(zone.x - x) < Math.abs(best.x - x) ? zone : best;
    }, null),
    [x, zones],
  );

  const interact = useCallback(() => {
    if (!nearest || disabled) return;
    setX(5);
    onGo(nearest.hotspot);
  }, [disabled, nearest, onGo]);

  useEffect(() => {
    setX(5);
    setFrame(0);
  }, [place.id]);

  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (['arrowleft', 'arrowright', 'a', 'd', 'e', 'enter', ' '].includes(key)) event.preventDefault();
      if (key === 'e' || key === 'enter' || key === ' ') interact();
      keys.current.add(key);
    };
    const up = (event: KeyboardEvent) => keys.current.delete(event.key.toLowerCase());
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [interact]);

  useEffect(() => {
    let animation = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.04, lastTick.current ? (now - lastTick.current) / 1000 : 0);
      lastTick.current = now;
      const left = keys.current.has('arrowleft') || keys.current.has('a');
      const right = keys.current.has('arrowright') || keys.current.has('d');
      const direction = Number(right) - Number(left);
      setWalking(direction !== 0);
      if (direction) {
        setFacing(direction > 0 ? 1 : -1);
        setX((value) => Math.max(4, Math.min(92, value + direction * WALK_SPEED * dt)));
      }
      animation = requestAnimationFrame(tick);
    };
    animation = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animation);
      lastTick.current = null;
    };
  }, []);

  useEffect(() => {
    if (!walking) {
      setFrame(0);
      return;
    }
    const timer = window.setInterval(() => setFrame((value) => (value + 1) % PLAYER_FRAMES.length), 125);
    return () => window.clearInterval(timer);
  }, [walking]);

  const hold = (key: 'arrowleft' | 'arrowright', active: boolean) => {
    if (active) keys.current.add(key);
    else keys.current.delete(key);
  };

  return (
    <div className="relative h-full overflow-hidden bg-slate-900 select-none">
      <img src={place.background} alt={place.caption} draggable={false} className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-sg-navy/10 via-transparent to-sg-navy/35" />

      <div className="absolute left-3 top-3 z-20 max-w-[78%] rounded-2xl border border-white/25 bg-sg-navy/82 px-3 py-2.5 text-white shadow-xl backdrop-blur-md sm:left-4 sm:top-4">
        <p className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.15em] text-sg-xp"><Navigation className="size-3" /> {place.caption}</p>
        <p className="mt-1 text-[11px] font-bold leading-snug text-white/85 sm:text-xs">{place.blurb}</p>
      </div>

      {zones.map((zone) => {
        const active = nearest === zone;
        return (
          <motion.div key={zone.hotspot.label} className="absolute bottom-[25%] z-10 -translate-x-1/2" style={{ left: `${zone.x}%` }} animate={{ y: active ? -5 : 0 }}>
            <div className={`max-w-32 rounded-xl border px-2.5 py-2 text-center text-[9px] font-black leading-tight shadow-lg backdrop-blur-md transition-all sm:max-w-40 sm:text-[10px] ${active ? 'border-sg-xp bg-sg-navy text-white ring-2 ring-sg-xp/50' : 'border-white/50 bg-white/88 text-sg-navy'}`}>{zone.hotspot.label}</div>
            <span className={`mx-auto mt-1 block h-7 w-px ${active ? 'bg-sg-xp' : 'bg-white/70'}`} />
            <span className={`mx-auto block size-3 rounded-full border-2 ${active ? 'animate-pulse border-sg-navy bg-sg-xp' : 'border-white bg-sg-blue/80'}`} />
            <span className={`absolute bottom-[-12px] left-1/2 h-3 w-16 -translate-x-1/2 rounded-[50%] ${active ? 'bg-sg-xp/45' : 'bg-sg-navy/25'}`} />
          </motion.div>
        );
      })}

      <motion.img
        src={PLAYER_FRAMES[frame]}
        alt="Your character"
        draggable={false}
        className="pointer-events-none absolute bottom-[8%] z-20 h-[42%] max-h-60 min-h-36 -translate-x-1/2 object-contain drop-shadow-[0_12px_9px_rgba(15,23,42,0.42)]"
        style={{ left: `${x}%`, scaleX: facing }}
        animate={{ y: walking ? [0, -2, 0] : 0 }}
        transition={{ duration: 0.25, repeat: walking ? Infinity : 0 }}
      />

      <div className="absolute inset-x-0 bottom-0 z-30 flex items-end justify-between gap-2 bg-gradient-to-t from-sg-navy/90 via-sg-navy/45 to-transparent px-3 pb-3 pt-10 sm:px-4 sm:pb-4">
        <div className="flex gap-2">
          <ControlButton label="Walk left" onPress={(active) => hold('arrowleft', active)}><ChevronLeft className="size-5" /></ControlButton>
          <ControlButton label="Walk right" onPress={(active) => hold('arrowright', active)}><ChevronRight className="size-5" /></ControlButton>
        </div>
        <div className="hidden items-center gap-2 rounded-xl bg-sg-navy/70 px-3 py-2 text-[10px] font-bold text-white/70 backdrop-blur sm:flex"><Footprints className="size-3.5 text-sg-xp" /> A / D or arrow keys</div>
        <button type="button" disabled={!nearest || disabled} onClick={interact} className="flex min-w-28 items-center justify-center gap-2 rounded-2xl bg-sg-xp px-4 py-3 text-xs font-black text-sg-navy shadow-xl transition-all enabled:hover:-translate-y-0.5 disabled:bg-white/25 disabled:text-white/55"><ScanLine className="size-4" /> {nearest ? 'INTERACT' : 'GET CLOSER'}</button>
      </div>
    </div>
  );
}

function ControlButton({ label, onPress, children }: { label: string; onPress: (active: boolean) => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); onPress(true); }}
      onPointerUp={() => onPress(false)}
      onPointerCancel={() => onPress(false)}
      onLostPointerCapture={() => onPress(false)}
      onClick={() => {
        onPress(true);
        window.setTimeout(() => onPress(false), 260);
      }}
      className="flex size-12 touch-none items-center justify-center rounded-2xl border border-white/30 bg-sg-navy/80 text-white shadow-xl backdrop-blur transition-transform active:scale-95"
    >{children}</button>
  );
}
