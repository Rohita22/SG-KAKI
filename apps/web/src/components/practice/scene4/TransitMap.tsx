import { BusFront, Building2, Footprints, MapPin, TrainFront } from 'lucide-react';
import { motion } from 'framer-motion';

const STAGES = [
  { label: 'Kadaloor', sub: 'Bus 50 / LRT', icon: BusFront, colour: '#7c3aed' },
  { label: 'Punggol', sub: 'North East Line', icon: TrainFront, colour: '#9e28b5' },
  { label: 'Little India', sub: 'Downtown Line', icon: TrainFront, colour: '#0354a6' },
  { label: 'Expo', sub: 'Walk', icon: Footprints, colour: '#16a34a' },
  { label: 'TCS', sub: 'Changi BP', icon: Building2, colour: '#f59e0b' },
] as const;

export function TransitMap({ currentStage, compact = false }: { currentStage: number; compact?: boolean }) {
  return (
    <div className={compact ? 'px-3 py-2' : 'p-5'} aria-label="Journey progress">
      {!compact && (
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sg-navy/35">
              Your route
            </p>
            <p className="mt-0.5 text-sm font-black text-sg-navy">North-east to Changi</p>
          </div>
          <MapPin className="size-5 text-sg-blue" />
        </div>
      )}

      <div className="relative flex items-start justify-between">
        <div className="absolute left-[7%] right-[7%] top-4 h-1 rounded-full bg-slate-200" />
        <motion.div
          className="absolute left-[7%] top-4 h-1 rounded-full bg-sg-blue"
          animate={{ width: `${Math.max(0, currentStage) * 21.5}%` }}
          transition={{ type: 'spring', stiffness: 180, damping: 24 }}
        />
        {STAGES.map((stage, i) => {
          const Icon = stage.icon;
          const active = i === currentStage;
          const done = i < currentStage;
          return (
            <div key={stage.label} className="relative z-10 flex w-[18%] flex-col items-center text-center">
              <motion.span
                animate={active ? { y: [0, -3, 0] } : {}}
                transition={{ duration: 1.8, repeat: Infinity }}
                className={`flex size-9 items-center justify-center rounded-full border-[3px] bg-white shadow-sm ${
                  active ? 'border-sg-xp' : done ? 'border-sg-blue' : 'border-slate-200'
                }`}
              >
                <Icon className={`size-4 ${active || done ? 'text-sg-navy' : 'text-slate-300'}`} />
              </motion.span>
              <span className={`${compact ? 'mt-1 text-[8px]' : 'mt-2 text-[10px]'} font-black leading-tight ${active ? 'text-sg-navy' : 'text-sg-navy/45'}`}>
                {stage.label}
              </span>
              {!compact && (
                <>
                  <span className="mt-0.5 hidden text-[8px] font-bold leading-tight text-sg-navy/30 sm:block">
                    {stage.sub}
                  </span>
                </>
              )}
              {active && <span className="mt-1 size-1.5 rounded-full" style={{ backgroundColor: stage.colour }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
