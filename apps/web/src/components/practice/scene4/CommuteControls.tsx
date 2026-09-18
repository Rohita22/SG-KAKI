import { BAG_ITEMS } from './sceneCopy';
import { DEBUG_STAGE_LABELS } from './stationConfig';
import type { DebugCheckpointId, FareItemKind } from './sceneTypes';

export function TouchMovementControls({
  onNudge,
}: {
  onNudge: (direction: 'left' | 'right' | 'up' | 'down') => void;
}) {
  return (
    <div aria-label="Touch movement controls" className="absolute bottom-2 left-2 z-[82] grid grid-cols-4 gap-1 sm:hidden">
      <button type="button" aria-label="Walk left" className="size-11 rounded-lg border border-white/60 bg-sg-navy/95 text-lg text-white" onClick={() => onNudge('left')}>←</button>
      <button type="button" aria-label="Walk up" className="size-11 rounded-lg border border-white/60 bg-sg-navy/95 text-lg text-white" onClick={() => onNudge('up')}>↑</button>
      <button type="button" aria-label="Walk down" className="size-11 rounded-lg border border-white/60 bg-sg-navy/95 text-lg text-white" onClick={() => onNudge('down')}>↓</button>
      <button type="button" aria-label="Walk right" className="size-11 rounded-lg border border-white/60 bg-sg-navy/95 text-lg text-white" onClick={() => onNudge('right')}>→</button>
    </div>
  );
}

export function FareBag({
  selectedItem,
  onSelect,
}: {
  selectedItem?: FareItemKind;
  onSelect: (kind: FareItemKind) => void;
}) {
  return (
    <aside aria-label="Your bag" className="absolute bottom-2 left-2 right-2 z-[88] rounded-2xl border-2 border-white/20 bg-sg-navy/95 p-2.5 text-white shadow-2xl backdrop-blur-sm sm:bottom-auto sm:left-auto sm:right-4 sm:top-1/2 sm:w-32 sm:-translate-y-1/2">
      <p className="mb-2 text-center text-[10px] font-black uppercase tracking-[0.16em] text-sg-xp">Your bag</p>
      <div className="grid grid-cols-3 gap-2 sm:block sm:space-y-2">
        {BAG_ITEMS.map((item) => {
          const selected = selectedItem === item.kind;
          return (
            <button
              key={item.kind}
              type="button"
              aria-pressed={selected}
              className={`flex w-full flex-col items-center rounded-xl border-2 px-2 py-2 text-[11px] font-extrabold transition ${selected ? 'border-sg-xp bg-sg-xp/20 text-sg-xp' : 'border-white/15 bg-white/5 text-white hover:border-white/50 hover:bg-white/10'}`}
              onClick={() => onSelect(item.kind)}
            >
              <img src={item.image} alt="" className="mb-1 h-11 w-16 object-contain" />
              {item.label}
            </button>
          );
        })}
      </div>
    </aside>
  );
}

export function DirectionControls({
  directions,
  onChoose,
}: {
  directions: string[];
  onChoose: (direction: string) => void;
}) {
  return (
    <div aria-label="Choose train direction" className="absolute bottom-14 left-1/2 z-[85] flex -translate-x-1/2 gap-2 sm:bottom-3">
      {directions.map((direction) => (
        <button key={direction} type="button" className="min-h-11 rounded-xl border-2 border-white bg-sg-navy/95 px-3 py-2 text-xs font-black text-white shadow-xl hover:border-amber-300" onClick={() => onChoose(direction)}>
          TOWARDS {direction.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export function DebugCheckpointSelector({
  onChoose,
}: {
  onChoose: (checkpoint: DebugCheckpointId) => void;
}) {
  return (
    <label className="absolute right-3 top-3 z-[90] hidden items-center gap-2 rounded-lg border border-white/30 bg-sg-navy/90 px-2 py-1.5 text-[10px] font-black uppercase tracking-wider text-white shadow-lg sm:flex">
      Checkpoint
      <select aria-label="Scene 4 development checkpoint" className="max-w-44 rounded bg-white px-2 py-1 text-xs font-bold normal-case tracking-normal text-sg-navy" defaultValue="" onChange={(event) => event.target.value && onChoose(event.target.value as DebugCheckpointId)}>
        <option value="" disabled>Jump to stage…</option>
        {(Object.keys(DEBUG_STAGE_LABELS) as DebugCheckpointId[]).map((checkpointId) => (
          <option key={checkpointId} value={checkpointId}>{DEBUG_STAGE_LABELS[checkpointId]}</option>
        ))}
      </select>
    </label>
  );
}

export function CompletionReward({ xp, onDone }: { xp: number; onDone: () => void }) {
  return (
    <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-sg-navy/95 p-3 text-white shadow-2xl">
      <span className="whitespace-nowrap text-sm font-black">+{xp} XP</span>
      <button type="button" className="rounded-xl bg-sg-xp px-5 py-2 text-sm font-black text-sg-navy" onClick={onDone}>DONE</button>
    </div>
  );
}
