import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, BellRing, DoorOpen, Radio, TrainFront } from 'lucide-react';
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
      <div className="relative min-h-0 flex-1 overflow-hidden bg-slate-700">
        {ride.background && (
          <img src={ride.background} alt="" className="absolute inset-0 size-full object-cover" />
        )}

        {!ride.background && (
          <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-slate-200 via-slate-100 to-slate-300">
            <div className="absolute inset-x-0 top-0 h-10 bg-slate-700" />
            <div className="absolute left-5 right-5 top-14 h-[48%] overflow-hidden rounded-2xl border-[7px] border-slate-500 bg-sky-200 shadow-inner">
              <motion.div
                className="absolute inset-y-0 flex w-[220%] items-end gap-12"
                animate={{ x: ['0%', '-50%'] }}
                transition={{ duration: ride.id === 'ride-bus' ? 5 : 3.2, repeat: Infinity, ease: 'linear' }}
              >
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="relative h-[75%] w-28 shrink-0 rounded-t-lg bg-slate-400/70">
                    <div className="mx-3 mt-3 grid grid-cols-2 gap-2">
                      {[0, 1, 2, 3].map((w) => <span key={w} className="h-5 rounded-sm bg-sky-100/70" />)}
                    </div>
                  </div>
                ))}
              </motion.div>
              <div className="absolute inset-x-0 bottom-0 h-4 bg-emerald-700/45" />
            </div>
            <div className="absolute inset-x-0 bottom-0 h-[30%] bg-slate-600">
              <div className="mx-auto mt-5 h-5 w-[82%] rounded-full bg-slate-800/40" />
            </div>
            <div className="absolute left-0 top-0 h-full w-5 bg-slate-500" />
            <div className="absolute right-0 top-0 h-full w-5 bg-slate-500" />
            <motion.div
              className="absolute bottom-5 left-[16%] h-24 w-16 rounded-t-full bg-sg-blue shadow-lg"
              animate={{ y: [0, 2, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-5 right-[14%] h-20 w-14 rounded-t-full bg-sg-xp shadow-lg"
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
          </div>
        )}

        <div
          className="absolute inset-x-0 top-0 h-1.5"
          style={{ backgroundColor: ride.colour }}
          aria-hidden
        />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-slate-900/80 px-4 py-3 backdrop-blur-sm">
          <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wide text-white/80">
            {ride.id === 'ride-bus' ? <BellRing className="size-3.5" /> : <TrainFront className="size-3.5" />}
            {ride.line}
          </p>
          <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-300"><Radio className="size-3" /> In transit</span>
        </div>

        <div className="absolute left-1/2 top-[47%] w-[min(88%,25rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/20 bg-slate-950/85 px-4 py-3 text-center shadow-2xl backdrop-blur-sm">
          <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/50">
            {atEnd ? 'Last stop' : 'Now at'}
          </p>
          <AnimatePresence mode="popLayout">
            <motion.p
              key={station}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="text-xl font-black leading-tight text-white drop-shadow sm:text-2xl"
            >
              {station}
            </motion.p>
          </AnimatePresence>
          {next && (
            <p className="mt-1 text-[11px] font-bold text-cyan-200">Next: {next}</p>
          )}
        </div>

        {/* The rail below is a position indicator, not a countdown: it shows how
            far along the line you are without naming the stop you want. */}
        <div className="absolute inset-x-0 bottom-0 flex items-end gap-1 bg-slate-950/55 px-4 py-3 backdrop-blur-sm">
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

      <div className="border-t border-black/5 bg-white p-3 sm:p-4">
        <button
          type="button"
          onClick={onAlight}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sg-navy px-4 py-3.5 text-sm font-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-sg-blue"
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
