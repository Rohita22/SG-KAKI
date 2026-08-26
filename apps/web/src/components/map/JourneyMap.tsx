import { Check } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Mission } from '@/content/types';
import type { MissionStatus } from '@/game/unlocks';
import { clsx } from '@/lib/clsx';
import { SPRING_POP_IN, STAGGER_STEP } from '@/lib/motion';

interface JourneyMapProps {
  missions: Mission[];
  statusFor: (missionId: string) => MissionStatus;
  completedLessonIds: string[];
  onSelect: (mission: Mission) => void;
  justCompletedMissionId?: string;
}

const JOURNEY_MAP_BG_URL = '/images/journey-map-bg-v2.webp';

const STATUS_LABEL: Record<MissionStatus, string> = {
  completed: 'Completed',
  active: 'In Progress',
  locked: 'Locked',
};

/** One stop on the journey — a numbered badge overlapping a pill that names
 * the mission and its status, matching the reference roadmap layout. */
function JourneyRow({
  mission,
  status,
  index,
  onSelect,
}: {
  mission: Mission;
  status: MissionStatus;
  index: number;
  onSelect: (mission: Mission) => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="relative z-10 flex flex-1 items-center"
      initial={reduceMotion ? undefined : { opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...SPRING_POP_IN, delay: reduceMotion ? 0 : index * STAGGER_STEP }}
    >
      <span
        className={clsx(
          'z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-black shadow sm:size-11 sm:text-base',
          status === 'completed' && 'border-white bg-sg-success text-white',
          status === 'active' && 'border-sg-blue bg-white text-sg-blue',
          status === 'locked' && 'border-white bg-white/90 text-sg-navy/40',
        )}
      >
        {index + 1}
      </span>

      <button
        type="button"
        onClick={() => onSelect(mission)}
        disabled={status === 'locked'}
        aria-label={`${mission.title} — ${STATUS_LABEL[status]}`}
        className={clsx(
          '-ml-5 flex flex-1 flex-col rounded-full py-2 pl-8 pr-4 text-left backdrop-blur-sm transition-transform active:scale-[0.98] sm:py-3 sm:pl-10',
          status === 'completed' && 'bg-white/95 text-sg-navy shadow-card',
          status === 'active' && 'bg-sg-blue text-white shadow-card-lg',
          status === 'locked' && 'cursor-not-allowed bg-white/80 text-sg-navy/40 shadow-sm',
        )}
      >
        <span className="text-sm font-black leading-tight sm:text-base">{mission.title}</span>
        <span
          className={clsx(
            'flex items-center gap-1 text-xs font-semibold sm:text-sm',
            status === 'completed' && 'text-sg-success',
            status === 'active' && 'text-white/85',
            status === 'locked' && 'text-sg-navy/40',
          )}
        >
          {status === 'completed' && <Check className="size-3.5" strokeWidth={3} />}
          {STATUS_LABEL[status]}
        </span>
      </button>
    </motion.div>
  );
}

export function JourneyMap({ missions, statusFor, onSelect }: JourneyMapProps) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-sg-navy-deep">
      <div
        className="absolute inset-0 scale-[1.08] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${JOURNEY_MAP_BG_URL})` }}
        aria-hidden="true"
      />

      <div className="relative mx-auto flex h-full w-[88%] max-w-[336px] flex-col p-4 sm:w-[60%] lg:w-[27%] lg:min-w-[240px]">
        {/* dotted rail connecting each numbered stop, drawn behind the rows */}
        <div
          className="pointer-events-none absolute bottom-[38px] left-[34px] top-[38px] z-0 w-0 border-l-2 border-dotted border-white/80 sm:bottom-[46px] sm:left-[38px] sm:top-[46px]"
          aria-hidden="true"
        />

        {missions.map((mission, i) => (
          <JourneyRow
            key={mission.id}
            mission={mission}
            status={statusFor(mission.id)}
            index={i}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
