import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, DoorOpen } from 'lucide-react';
import type { Ride } from './route';
import { stationIndex } from './route';

/** Minutes lost crossing to the opposite platform after boarding backwards. */
export const CROSS_OVER_MIN = 6;

/**
 * Aboard something. The only information on screen is what a real passenger
 * gets — the line, the direction, and the name of the station currently sliding
 * past — because deciding when to press the button IS the game. A "3 stops to
 * go" counter would answer the only question the scene asks.
 */
export function RideView({
  ride,
  rideMin,
  onAlight,
}: {
  ride: Ride;
  rideMin: number;
  onAlight: () => void;
}) {
  const index = stationIndex(ride, rideMin);
  const station = ride.stations[index];
  const next = ride.stations[index + 1];
  const atEnd = index >= ride.stations.length - 1;

  return (
    <div className="flex h-full flex-col">
      <div className={`relative flex-1 overflow-hidden bg-gradient-to-br ${ride.placeholder}`}>
        {ride.background && (
          <img src={ride.background} alt="" className="absolute inset-0 size-full object-cover" />
        )}

        <div
          className="absolute inset-x-0 top-0 h-1.5"
          style={{ backgroundColor: ride.colour }}
          aria-hidden
        />

        <div className="absolute inset-x-0 top-0 px-4 pt-5">
          <p className="text-[11px] font-black uppercase tracking-wide text-white/70">
            {ride.line}
          </p>
        </div>

        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-4 text-center">
          <p className="text-[11px] font-black uppercase tracking-wide text-white/60">
            {atEnd ? 'Last stop' : 'Now at'}
          </p>
          <AnimatePresence mode="popLayout">
            <motion.p
              key={station}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="text-2xl font-black leading-tight text-white drop-shadow sm:text-3xl"
            >
              {station}
            </motion.p>
          </AnimatePresence>
          {next && (
            <p className="mt-1.5 text-xs font-bold text-white/70">Next: {next}</p>
          )}
        </div>

        {/* The rail below is a position indicator, not a countdown: it shows how
            far along the line you are without naming the stop you want. */}
        <div className="absolute inset-x-0 bottom-0 flex items-end gap-1 px-4 pb-4">
          {ride.stations.map((s, i) => (
            <span
              key={s + i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= index ? 'bg-white' : 'bg-white/25'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-black/5 bg-white p-4">
        <button
          type="button"
          onClick={onAlight}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sg-navy px-4 py-3.5 text-sm font-black text-white transition-opacity hover:opacity-90"
        >
          <DoorOpen className="size-4" />
          Get off here
        </button>
      </div>
    </div>
  );
}

/**
 * Off at the wrong station. Recovering is always possible from here — the hard
 * failure is riding on, not stepping off — so this offers the real-world fix
 * and charges the real-world wait for it.
 */
export function StrandedView({
  ride,
  rideMin,
  onWait,
  onCrossOver,
}: {
  ride: Ride;
  rideMin: number;
  onWait: () => void;
  onCrossOver: () => void;
}) {
  const index = stationIndex(ride, rideMin);
  const wrongDirection = Boolean(ride.crossOverTo);

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex-1 overflow-hidden bg-gradient-to-br from-slate-300 to-slate-500">
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          <AlertTriangle className="mb-2 size-7 text-white/80" />
          <p className="text-[11px] font-black uppercase tracking-wide text-white/60">
            You got off at
          </p>
          <p className="text-2xl font-black text-white drop-shadow">{ride.stations[index]}</p>
          <p className="mt-2 max-w-xs text-sm font-bold text-white/80">
            {wrongDirection
              ? 'This whole line is running away from Changi. You need the opposite platform.'
              : 'Not your stop. The platform is quiet and the next train is a few minutes out.'}
          </p>
        </div>
      </div>

      <div className="grid gap-2 border-t border-black/5 bg-white p-4">
        {wrongDirection ? (
          <button
            type="button"
            onClick={onCrossOver}
            className="flex items-center justify-between gap-3 rounded-2xl bg-sg-bg px-4 py-3.5 text-left text-sm font-bold text-sg-navy transition-colors hover:bg-black/10"
          >
            <span>Cross to the opposite platform</span>
            <span className="shrink-0 text-xs font-black text-sg-navy/40">
              +{CROSS_OVER_MIN} min
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onWait}
            className="flex items-center justify-between gap-3 rounded-2xl bg-sg-bg px-4 py-3.5 text-left text-sm font-bold text-sg-navy transition-colors hover:bg-black/10"
          >
            <span>Wait for the next one</span>
            <span className="shrink-0 text-xs font-black text-sg-navy/40">+{ride.waitMin} min</span>
          </button>
        )}
      </div>
    </div>
  );
}
