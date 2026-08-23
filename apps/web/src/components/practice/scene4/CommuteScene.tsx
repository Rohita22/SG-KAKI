import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Clock, Lightbulb, LifeBuoy, MapPin, RotateCcw, Sparkles } from 'lucide-react';
import {
  BUDGET_MIN,
  SECONDS_PER_GAME_MINUTE,
  START_NODE,
  isPlace,
  isRide,
  isUnrecoverable,
  nodeById,
  stationIndex,
  type Hotspot,
  type NodeId,
} from './route';
import { PlaceView } from './PlaceView';
import { CROSS_OVER_MIN, RideView, StrandedView } from './RideView';
import { StuckPanel } from './StuckPanel';
import { TransitMap } from './TransitMap';
import { routeStage } from './routeStage';
import { BoardingView } from './BoardingView';
import { SeatView } from './SeatView';
import { KadaloorChoiceView } from './KadaloorChoiceView';
import { LrtEntryView } from './LrtEntryView';
import { BusFareView } from './BusFareView';

/**
 * Scene 4 — the commute. Self-contained: it shares no markup with scenes 1-3.
 *
 * Three positions cover the whole quest. You are standing somewhere and
 * choosing (`place`), you are aboard something (`ride`), or you have stepped
 * off at the wrong station (`stranded`). Everything else — the clock, the
 * checkpoint, failing — falls out of those three.
 *
 * The clock only runs in `ride`. Standing on a platform reading the signs is
 * free, and so is asking for help, so nobody loses this quest for thinking
 * slowly or for waiting on an AI reply. What costs you is distance travelled in
 * the wrong direction, which is exactly what the quest is teaching.
 */

type Position =
  | { at: 'place'; id: NodeId }
  | { at: 'lrt-entry'; id: NodeId }
  | { at: 'boarding'; id: NodeId; attempt: number; busAlreadyStopped?: boolean }
  | { at: 'bus-fare'; id: NodeId }
  | { at: 'seating'; id: NodeId }
  | { at: 'ride'; id: NodeId; rideMin: number }
  /** Off at a station that wasn't yours. `rideMin` is kept so re-boarding
   * resumes the journey rather than restarting the line. */
  | { at: 'stranded'; id: NodeId; rideMin: number };

interface Checkpoint {
  position: Position;
  clockMin: number;
}

const START: Position = { at: 'place', id: START_NODE };

export function CommuteScene({
  completionXp,
  onSessionComplete,
  onRestart,
  onDone,
}: {
  completionXp?: number;
  /** Called once, on arrival — banks the XP. */
  onSessionComplete: () => void;
  /** Clears the stored conversation, for the phase-2 talk beats. */
  onRestart: () => void;
  onDone: () => void;
}) {
  const [started, setStarted] = useState(false);
  const [position, setPosition] = useState<Position>(START);
  const [clockMin, setClockMin] = useState(0);
  const [wrongTurns, setWrongTurns] = useState(0);
  const [status, setStatus] = useState<'playing' | 'failed' | 'arrived'>('playing');
  const [toast, setToast] = useState<string | null>(null);
  const [stuckOpen, setStuckOpen] = useState(false);
  const [stationDwell, setStationDwell] = useState(false);
  const [checkpoint, setCheckpoint] = useState<Checkpoint | null>(null);
  const xpFired = useRef(false);
  const lastDwellKey = useRef<string | null>(null);

  const node = nodeById(position.id);
  const place = isPlace(node) ? node : undefined;
  const ride = isRide(node) ? node : undefined;
  const minutesLeft = Math.max(0, BUDGET_MIN - clockMin);
  const outOfTime = clockMin >= BUDGET_MIN;
  // Sitting at the end of a terminus line. Derived rather than stored because
  // it has to stop the clock: while the clock runs it rewrites `position` every
  // tick, and anything waiting on `position` would be reset before it fired.
  const atEndOfLine =
    position.at === 'ride' &&
    ride !== undefined &&
    Boolean(ride.terminus) &&
    stationIndex(ride, position.rideMin) >= ride.stations.length - 1;

  // Hold briefly at every stop. The old continuous clock gave the player only
  // about one second to read a station name and alight, which tested reflexes
  // rather than transport awareness.
  useEffect(() => {
    if (position.at !== 'ride' || !ride || status !== 'playing') return;
    const key = `${ride.id}:${stationIndex(ride, position.rideMin)}`;
    if (lastDwellKey.current === key) return;
    lastDwellKey.current = key;
    setStationDwell(true);
    const timer = setTimeout(() => setStationDwell(false), 1800);
    return () => clearTimeout(timer);
  }, [position, ride, status]);

  // ── The clock ──────────────────────────────────────────────────────────────
  // Ticks one game minute at a time, and only while actually moving. Frozen
  // whenever the help panel is up, so asking is never what makes you late.
  useEffect(() => {
    if (!started || position.at !== 'ride' || status !== 'playing' || stuckOpen || stationDwell || atEndOfLine) return;
    const timer = setInterval(() => {
      setClockMin((m) => m + 1);
      setPosition((p) => (p.at === 'ride' ? { ...p, rideMin: p.rideMin + 1 } : p));
    }, SECONDS_PER_GAME_MINUTE * 1000);
    return () => clearInterval(timer);
  }, [started, position.at, status, stuckOpen, stationDwell, atEndOfLine]);

  // ── Losing ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (status !== 'playing') return;
    const riddenTooFar =
      position.at === 'ride' &&
      ride !== undefined &&
      isUnrecoverable(ride, stationIndex(ride, position.rideMin));

    if (outOfTime || riddenTooFar) {
      setStatus('failed');
      setToast(null);
    }
  }, [outOfTime, position, ride, status]);

  // ── The end of the line ────────────────────────────────────────────────────
  // A terminus clears itself: you cannot sit on bus 50 past Punggol, because
  // that is where it stops and the driver turns everyone out. This is why act 1
  // cannot be failed at all.
  useEffect(() => {
    if (!atEndOfLine || !ride) return;
    const lastIndex = ride.stations.length - 1;

    const timer = setTimeout(() => {
      setToast(
        ride.id === 'ride-bus'
          ? '"Last stop! Everybody get down!" — the driver is already opening the doors.'
          : `End of the line — everyone off at ${ride.stations[lastIndex]}.`,
      );
      goToPlace(ride.arriveAt);
    }, 1600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atEndOfLine, ride, status]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // ── The checkpoint ─────────────────────────────────────────────────────────
  // Banked the first time you reach it, so a later failure rewinds to the
  // moment you stepped off the bus instead of replaying an act you cleared.
  // Saved from an effect rather than from the move itself: a move applies its
  // cost with setClockMin, and reading clockMin during that same handler would
  // bank the time from BEFORE the move and hand back minutes that were spent.
  useEffect(() => {
    if (checkpoint || position.at !== 'place' || !place?.checkpoint) return;
    setCheckpoint({ position, clockMin });
  }, [checkpoint, position, place, clockMin]);

  // ── Moving ─────────────────────────────────────────────────────────────────

  function goToPlace(id: NodeId) {
    const target = nodeById(id);
    setPosition({ at: 'place', id });
    if (!isPlace(target)) return;

    if (target.arrival) {
      setStatus('arrived');
      if (!xpFired.current) {
        xpFired.current = true;
        onSessionComplete();
      }
    }
  }

  function takeHotspot(hotspot: Hotspot) {
    setClockMin((m) => m + hotspot.costMin);
    if (hotspot.wrong) setWrongTurns((n) => n + 1);
    setToast(hotspot.nudge ?? null);

    const target = nodeById(hotspot.to);
    if (isRide(target)) {
      if (target.id === 'ride-lrt') {
        setPosition({ at: 'lrt-entry', id: target.id });
        return;
      }
      setPosition({ at: 'boarding', id: target.id, attempt: 0 });
      return;
    }
    goToPlace(hotspot.to);
  }

  /** Kadaloor's bus flow begins only after the player hails the bus, so the
   * next scene starts with bus 50 already stopped at the curb. */
  function takeHailedBus(hotspot: Hotspot) {
    setClockMin((m) => m + hotspot.costMin);
    const target = nodeById(hotspot.to);
    if (!isRide(target)) return;
    setPosition({ at: 'boarding', id: target.id, attempt: 0, busAlreadyStopped: true });
  }

  function alight() {
    if (position.at !== 'ride' || !ride) return;

    if (stationIndex(ride, position.rideMin) === ride.alightAt) {
      goToPlace(ride.arriveAt);
      return;
    }
    // Only a missed stop counts. On a wrong-direction line there is no right
    // stop to miss — getting off is the recovery, and boarding it was already
    // counted — so charging that again would penalise doing the right thing.
    if (ride.alightAt >= 0) setWrongTurns((n) => n + 1);
    setPosition({ at: 'stranded', id: ride.id, rideMin: position.rideMin });
  }

  /** Wait it out and carry on down the same line, from where you got off. */
  function waitForNext() {
    if (position.at !== 'stranded' || !ride) return;
    setClockMin((m) => m + ride.waitMin);
    setPosition({ at: 'ride', id: ride.id, rideMin: position.rideMin });
  }

  /** Only offered on a wrong-direction line: go back and start it properly. */
  function crossOver() {
    if (!ride?.crossOverTo) return;
    setClockMin((m) => m + CROSS_OVER_MIN);
    setToast('Back on the right platform. Watch the direction on the board this time.');
    goToPlace(ride.crossOverTo);
  }

  // ── Starting over ──────────────────────────────────────────────────────────

  function restart() {
    setPosition(START);
    setClockMin(0);
    setWrongTurns(0);
    setStatus('playing');
    setToast(null);
    setCheckpoint(null);
    setStationDwell(false);
    lastDwellKey.current = null;
    xpFired.current = false;
    onRestart();
  }

  function resumeFromCheckpoint() {
    if (!checkpoint) return restart();
    setPosition(checkpoint.position);
    setClockMin(checkpoint.clockMin);
    setStatus('playing');
    setToast('Back at Punggol, clock rewound. The bus leg is already behind you.');
  }

  // ── Rendering ──────────────────────────────────────────────────────────────

  const caption = place?.caption ?? ride?.line ?? '';
  const situation = place?.situation ?? ride?.situation ?? '';
  const hint = place?.hint ?? ride?.hint ?? '';
  const guidance = place?.guidance ?? ride?.guidance ?? '';
  const questions = place?.stuckQuestions ?? ride?.stuckQuestions ?? [];
  const currentStage = routeStage(position.id);

  if (!started) {
    return <MissionBriefing onStart={() => setStarted(true)} />;
  }

  function boardTransit() {
    if (position.at !== 'boarding') return;
    if (position.id === 'ride-bus') {
      setPosition({ at: 'bus-fare', id: position.id });
      return;
    }
    setPosition({ at: 'seating', id: position.id });
  }

  function payBusFare() {
    if (position.at !== 'bus-fare') return;
    setPosition({ at: 'seating', id: position.id });
  }

  function enterLrtPlatform() {
    if (position.at !== 'lrt-entry') return;
    setPosition({ at: 'boarding', id: position.id, attempt: 0 });
  }

  function chooseSeat(seat: string) {
    if (position.at !== 'seating') return;
    setToast(`You take the ${seat.toLowerCase()} seat. Keep an eye on the next-stop display.`);
    setPosition({ at: 'ride', id: position.id, rideMin: 0 });
  }

  function waitForService() {
    if (position.at !== 'boarding' || !ride) return;
    setClockMin((m) => m + ride.waitMin);
    setToast(`You missed it. The next ${ride.id === 'ride-bus' ? 'bus' : 'train'} is arriving now.`);
    setPosition({ ...position, attempt: position.attempt + 1 });
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/70 bg-white shadow-card-lg">
      <Hud
        minutesLeft={minutesLeft}
        wrongTurns={wrongTurns}
        frozen={position.at !== 'ride' || stuckOpen || stationDwell || status !== 'playing'}
        onStuck={() => setStuckOpen(true)}
        onHint={() => setToast(`HINT · ${hint}`)}
        stuckDisabled={status !== 'playing'}
      />

      <div className="border-b border-black/5 bg-slate-50">
        <TransitMap currentStage={currentStage} compact />
      </div>

      <div className="relative flex h-[31rem] flex-col sm:h-[35rem]">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="absolute inset-x-3 top-3 z-20 rounded-2xl bg-sg-navy/90 px-4 py-2.5 text-xs font-bold text-white shadow-lg backdrop-blur-sm"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        {status === 'arrived' ? (
          <EndCard
            background="/scenes/scene4/environments/changi-business-park.png"
            title="You made it to the office."
            body={
              wrongTurns === 0
                ? `A clean run — not one wrong turn, and ${minutesLeft} minutes to spare.`
                : `${minutesLeft} minutes to spare, after ${wrongTurns} wrong turn${
                    wrongTurns === 1 ? '' : 's'
                  }.`
            }
            note={completionXp ? `+${completionXp} XP` : undefined}
            primary={{ label: 'Done', onClick: onDone }}
            secondary={{ label: 'Try Again', onClick: restart }}
          />
        ) : status === 'failed' ? (
          <EndCard
            title={outOfTime ? "You're not getting there in time." : 'Too far gone.'}
            body={
              outOfTime
                ? 'The clock ran out somewhere between here and Changi.'
                : 'You rode too far past your stop to recover this one.'
            }
            primary={
              checkpoint
                ? { label: 'Back to Punggol', onClick: resumeFromCheckpoint }
                : { label: 'Start again', onClick: restart }
            }
            secondary={checkpoint ? { label: 'Start again', onClick: restart } : undefined}
          />
        ) : position.at === 'boarding' && ride ? (
          <BoardingView
            key={`${ride.id}:${position.attempt}`}
            ride={ride}
            paused={stuckOpen}
            onBoard={boardTransit}
            onWait={waitForService}
            busAlreadyStopped={position.busAlreadyStopped}
          />
        ) : position.at === 'lrt-entry' ? (
          <LrtEntryView paused={stuckOpen} onEnter={enterLrtPlatform} />
        ) : position.at === 'bus-fare' ? (
          <BusFareView paused={stuckOpen} onPaid={payBusFare} />
        ) : position.at === 'seating' && ride ? (
          <SeatView ride={ride} onChoose={chooseSeat} />
        ) : position.at === 'stranded' && ride ? (
          <StrandedView
            ride={ride}
            rideMin={position.rideMin}
            onWait={waitForNext}
            onCrossOver={crossOver}
          />
        ) : position.at === 'ride' && ride ? (
          <RideView ride={ride} rideMin={position.rideMin} onAlight={alight} />
        ) : place?.id === START_NODE ? (
          <KadaloorChoiceView place={place} onChoose={takeHotspot} onHailedBus={takeHailedBus} disabled={stuckOpen} />
        ) : place ? (
          <PlaceView place={place} onGo={takeHotspot} disabled={stuckOpen} />
        ) : null}

        <StuckPanel
          open={stuckOpen}
          onOpenChange={setStuckOpen}
          caption={caption}
          situation={situation}
          guidance={guidance}
          questions={questions}
        />
      </div>
    </div>
  );
}

function Hud({
  minutesLeft,
  wrongTurns,
  frozen,
  onStuck,
  onHint,
  stuckDisabled,
}: {
  minutesLeft: number;
  wrongTurns: number;
  frozen: boolean;
  onStuck: () => void;
  onHint: () => void;
  stuckDisabled: boolean;
}) {
  // Colour is the only warning the player gets, so it has to arrive early
  // enough to still be actionable — a mistake at 35 minutes left is survivable,
  // one at 15 usually is not.
  const late = minutesLeft <= 15;
  const tight = minutesLeft <= 35;
  const tone = late ? 'text-red-600' : tight ? 'text-amber-600' : 'text-sg-navy';

  return (
    <div className="flex items-center gap-2 border-b border-black/5 bg-white px-3 py-3 sm:gap-3 sm:px-4">
      <div className="flex shrink-0 items-center gap-1.5">
        <Clock className={`size-4 ${frozen ? 'text-sg-navy/25' : tone}`} />
        <span className={`text-sm font-black tabular-nums ${tone}`}>{minutesLeft}</span>
        <span className="hidden text-[11px] font-bold text-sg-navy/40 sm:inline">min left</span>
      </div>

      <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-black/10">
        <motion.div
          className={`h-full rounded-full ${
            late ? 'bg-red-500' : tight ? 'bg-amber-500' : 'bg-sg-xp'
          }`}
          animate={{ width: `${(minutesLeft / BUDGET_MIN) * 100}%` }}
          transition={{ ease: 'linear', duration: 0.2 }}
        />
      </div>

      {wrongTurns > 0 && (
        <span
          className="flex shrink-0 items-center gap-1 text-[11px] font-black text-sg-navy/40"
          title={`${wrongTurns} wrong turn${wrongTurns === 1 ? '' : 's'} so far`}
        >
          <MapPin className="size-3" />
          {wrongTurns}
        </span>
      )}

      <button
        type="button"
        onClick={onHint}
        disabled={stuckDisabled}
        className="flex shrink-0 items-center gap-1 rounded-full border border-sg-xp/50 bg-sg-xp/15 px-2.5 py-1.5 text-[10px] font-black text-sg-navy transition-colors hover:bg-sg-xp/30 disabled:opacity-30 sm:text-[11px]"
      >
        <Lightbulb className="size-3.5" />
        HINT
      </button>

      <button
        type="button"
        onClick={onStuck}
        disabled={stuckDisabled}
        className="flex shrink-0 items-center gap-1.5 rounded-full bg-sg-navy px-2.5 py-1.5 text-[10px] font-black text-white transition-opacity hover:opacity-90 disabled:opacity-30 sm:px-3 sm:text-[11px]"
      >
        <LifeBuoy className="size-3.5" />
        STUCK
      </button>
    </div>
  );
}

function MissionBriefing({ onStart }: { onStart: () => void }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/70 bg-white shadow-card-lg">
      <div className="relative overflow-hidden bg-sg-navy px-5 pb-6 pt-7 text-white sm:px-7">
        <div className="absolute -right-12 -top-16 size-52 rounded-full bg-sg-blue/30 blur-2xl" />
        <div className="absolute -bottom-20 left-1/4 size-44 rounded-full bg-sg-purple/25 blur-2xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-sg-xp">
            <Sparkles className="size-3" /> Quest 4 · Transit run
          </span>
          <h3 className="mt-4 max-w-md text-2xl font-black leading-tight sm:text-3xl">Make it to Changi before 9:00.</h3>
          <p className="mt-2 max-w-lg text-sm font-semibold leading-relaxed text-white/65">
            It is your first morning at TCS. Read real-world-style signs, choose the correct services and platforms, and recover if you make a wrong turn.
          </p>
        </div>
      </div>

      <TransitMap currentStage={0} />

      <div className="grid grid-cols-3 gap-2 border-t border-black/5 bg-slate-50 p-3 sm:gap-3 sm:p-6">
        {[
          ['138 min', 'Time budget'],
          ['4 legs', 'Bus · NEL · DTL · walk'],
          ['Checkpoint', 'Saved at Punggol'],
        ].map(([value, label]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm sm:p-3">
            <p className="text-xs font-black text-sg-navy sm:text-sm">{value}</p>
            <p className="mt-0.5 text-[8px] font-bold uppercase tracking-wide text-sg-navy/35 sm:text-[10px]">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 border-t border-black/5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <p className="text-xs font-semibold text-sg-navy/45">Hints nudge you. STUCK gives the exact next step and pauses the clock.</p>
        <button type="button" onClick={onStart} className="group flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-sg-blue px-6 py-3.5 text-sm font-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-sg-blue-hover">
          Start journey <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

function EndCard({
  title,
  body,
  note,
  background,
  primary,
  secondary,
}: {
  title: string;
  body: string;
  note?: string;
  background?: string;
  primary: { label: string; onClick: () => void };
  secondary?: { label: string; onClick: () => void };
}) {
  return (
    <div className={`relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 text-center ${background ? 'text-white' : ''}`}>
      {background && <img src={background} alt="TCS office at Changi Business Park" className="absolute inset-0 size-full object-cover" />}
      {background && <div className="absolute inset-0 bg-sg-navy/72 backdrop-blur-[1px]" />}
      <p className={`relative text-lg font-black ${background ? 'text-white' : 'text-sg-navy'}`}>{title}</p>
      <p className={`relative mt-1 max-w-xs text-sm font-semibold ${background ? 'text-white/75' : 'text-sg-navy/55'}`}>{body}</p>
      {note && <p className="relative mt-2 text-sm font-black text-sg-xp">{note}</p>}
      <div className="relative mt-5 flex flex-wrap justify-center gap-2">
        <button
          type="button"
          onClick={primary.onClick}
          className="rounded-2xl bg-sg-navy px-5 py-3 text-sm font-black text-white transition-opacity hover:opacity-90"
        >
          {primary.label}
        </button>
        {secondary && (
          <button
            type="button"
            onClick={secondary.onClick}
            className="flex items-center gap-1.5 rounded-2xl bg-sg-bg px-5 py-3 text-sm font-black text-sg-navy transition-colors hover:bg-black/10"
          >
            <RotateCcw className="size-3.5" />
            {secondary.label}
          </button>
        )}
      </div>
    </div>
  );
}
