import { useMemo, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Check, X } from 'lucide-react';
import type { MatchChallengeData } from '@/content/types';
import type { ChallengeComponentProps } from './types';
import { Button } from '@/components/ui/Button';
import { seededShuffle } from '@/lib/shuffle';
import { clsx } from '@/lib/clsx';

function Chip({ id, label, disabled }: { id: string; label: string; disabled?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled,
  });

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...attributes}
      {...listeners}
      style={{ transform: CSS.Translate.toString(transform) }}
      className={clsx(
        'touch-none rounded-xl border-2 border-sg-blue/30 bg-sg-blue/10 px-3 py-2 text-xs font-bold text-sg-navy shadow-sm',
        isDragging && 'z-30 opacity-90 shadow-card-lg',
      )}
    >
      {label}
    </button>
  );
}

function Slot({
  id,
  label,
  chipLabel,
  status,
  onClear,
}: {
  id: string;
  label: string;
  chipLabel: string | null;
  status: 'idle' | 'correct' | 'incorrect';
  onClear: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex items-center gap-2 rounded-2xl bg-white p-2.5 shadow-sm">
      <span className="w-24 shrink-0 text-xs font-bold text-sg-navy">{label}</span>
      <div
        ref={setNodeRef}
        className={clsx(
          'flex min-h-11 flex-1 items-center justify-between gap-2 rounded-xl border-2 border-dashed px-3 py-1.5 text-xs font-semibold',
          !chipLabel && (isOver ? 'border-sg-blue bg-sg-blue/10' : 'border-black/10 bg-black/[0.02]'),
          chipLabel && status === 'idle' && 'border-sg-blue/40 bg-sg-blue/5 border-solid',
          status === 'correct' && 'border-sg-success bg-sg-success/10 border-solid',
          status === 'incorrect' && 'border-sg-red bg-sg-red/10 border-solid',
        )}
      >
        <span className="text-sg-navy">{chipLabel ?? ''}</span>
        <div className="flex items-center gap-1.5">
          {status === 'correct' && <Check className="size-4 text-sg-success" strokeWidth={3} />}
          {status === 'incorrect' && <X className="size-4 text-sg-red" strokeWidth={3} />}
          {chipLabel && status === 'idle' && (
            <button
              type="button"
              onClick={onClear}
              className="text-[10px] font-bold text-sg-navy/40 underline"
            >
              clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function MatchChallenge({
  challenge,
  onCheck,
}: ChallengeComponentProps<MatchChallengeData>) {
  const chips = useMemo(
    () => seededShuffle(challenge.pairs, `${challenge.id}-right`),
    [challenge.id, challenge.pairs],
  );
  const [assignments, setAssignments] = useState<Record<string, string | null>>(() =>
    Object.fromEntries(challenge.pairs.map((p) => [p.id, null])),
  );
  const [checked, setChecked] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor),
  );

  const placedChipIds = new Set(Object.values(assignments).filter(Boolean) as string[]);
  const poolChips = chips.filter((c) => !placedChipIds.has(c.id));
  const allFilled = Object.values(assignments).every(Boolean);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const chipId = String(active.id);
    const slotId = String(over.id);
    setAssignments((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(next)) {
        if (next[key] === chipId) next[key] = null;
      }
      next[slotId] = chipId;
      return next;
    });
  }

  function handleCheck() {
    setChecked(true);
    const isCorrect = challenge.pairs.every((p) => assignments[p.id] === p.id);
    window.setTimeout(() => {
      onCheck({ isCorrect, xpAwarded: isCorrect ? challenge.xp : 0 });
    }, 900);
  }

  const chipLabelById = Object.fromEntries(chips.map((c) => [c.id, c.right]));

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-sg-navy">{challenge.prompt}</h2>

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-2">
          {challenge.pairs.map((pair) => {
            const chipId = assignments[pair.id];
            const status: 'idle' | 'correct' | 'incorrect' = !checked
              ? 'idle'
              : chipId === pair.id
                ? 'correct'
                : 'incorrect';
            return (
              <Slot
                key={pair.id}
                id={pair.id}
                label={pair.left}
                chipLabel={chipId ? chipLabelById[chipId] : null}
                status={status}
                onClear={() =>
                  setAssignments((prev) => ({ ...prev, [pair.id]: null }))
                }
              />
            );
          })}
        </div>

        {poolChips.length > 0 && (
          <div className="flex flex-wrap gap-2 rounded-2xl bg-black/[0.03] p-3">
            {poolChips.map((chip) => (
              <Chip key={chip.id} id={chip.id} label={chip.right} disabled={checked} />
            ))}
          </div>
        )}
      </DndContext>

      <Button
        variant="dark"
        className="w-full"
        onClick={handleCheck}
        disabled={!allFilled || checked}
      >
        Check
      </Button>
    </div>
  );
}
