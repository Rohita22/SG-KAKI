import { useMemo, useState } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Check, X } from 'lucide-react';
import type { SortChallengeData } from '@/content/types';
import type { ChallengeComponentProps } from './types';
import { Button } from '@/components/ui/Button';
import { seededShuffle } from '@/lib/shuffle';
import { clsx } from '@/lib/clsx';

function SortableItem({
  id,
  label,
  index,
  checked,
  isCorrectSlot,
}: {
  id: string;
  label: string;
  index: number;
  checked: boolean;
  isCorrectSlot: boolean | null;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled: checked });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={clsx(
        'flex items-center gap-3 rounded-2xl border-2 bg-white px-3.5 py-3 shadow-sm',
        isDragging && 'shadow-card-lg',
        checked && isCorrectSlot && 'border-sg-success bg-sg-success/10',
        checked && isCorrectSlot === false && 'border-sg-red bg-sg-red/10',
        !checked && 'border-black/5',
      )}
    >
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-black/5 text-xs font-bold text-sg-navy/60">
        {index + 1}
      </span>
      <span className="flex-1 text-sm font-semibold text-sg-navy">{label}</span>
      {checked && isCorrectSlot && <Check className="size-5 text-sg-success" strokeWidth={3} />}
      {checked && isCorrectSlot === false && <X className="size-5 text-sg-red" strokeWidth={3} />}
      {!checked && (
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          className="touch-none text-sg-navy/30"
        >
          <GripVertical className="size-5" />
        </button>
      )}
    </div>
  );
}

export function SortChallenge({
  challenge,
  onCheck,
}: ChallengeComponentProps<SortChallengeData>) {
  const shuffled = useMemo(
    () => seededShuffle(challenge.items, challenge.id),
    [challenge.id, challenge.items],
  );
  const [order, setOrder] = useState<string[]>(shuffled.map((i) => i.id));
  const [checked, setChecked] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOrder((items) => {
      const oldIndex = items.indexOf(String(active.id));
      const newIndex = items.indexOf(String(over.id));
      return arrayMove(items, oldIndex, newIndex);
    });
  }

  function handleCheck() {
    setChecked(true);
    const isCorrect = order.every((id, i) => id === challenge.correctOrder[i]);
    window.setTimeout(() => {
      onCheck({ isCorrect, xpAwarded: isCorrect ? challenge.xp : 0 });
    }, 900);
  }

  function handleReset() {
    setOrder(shuffled.map((i) => i.id));
  }

  const itemsById = Object.fromEntries(challenge.items.map((i) => [i.id, i]));

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-sg-navy">{challenge.prompt}</h2>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {order.map((id, i) => (
              <SortableItem
                key={id}
                id={id}
                label={itemsById[id].label}
                index={i}
                checked={checked}
                isCorrectSlot={checked ? id === challenge.correctOrder[i] : null}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <p className="text-center text-xs font-semibold text-sg-navy/40">
        Drag to reorder
      </p>

      <div className="flex gap-2.5">
        <Button variant="secondary" className="flex-1" onClick={handleReset} disabled={checked}>
          Reset
        </Button>
        <Button variant="dark" className="flex-1" onClick={handleCheck} disabled={checked}>
          Check
        </Button>
      </div>
    </div>
  );
}
