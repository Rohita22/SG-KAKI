import { Check, Lock, Play } from 'lucide-react';
import type { Lesson } from '@/content/types';
import { clsx } from '@/lib/clsx';

export type LessonStatus = 'completed' | 'active' | 'locked';

interface LessonRowProps {
  lesson: Lesson;
  status: LessonStatus;
  onSelect: (lesson: Lesson) => void;
}

export function LessonRow({ lesson, status, onSelect }: LessonRowProps) {
  const locked = status === 'locked';

  return (
    <button
      type="button"
      disabled={locked}
      onClick={() => onSelect(lesson)}
      className={clsx(
        'flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-colors',
        status === 'completed' && 'bg-sg-success/10',
        status === 'active' && 'bg-sg-blue/10 ring-2 ring-sg-blue/40',
        locked && 'bg-black/5 opacity-60',
      )}
    >
      <span
        className={clsx(
          'flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-bold',
          status === 'completed' && 'bg-sg-success text-white',
          status === 'active' && 'bg-sg-blue text-white',
          locked && 'bg-black/10 text-sg-navy/40',
        )}
      >
        {status === 'completed' ? (
          <Check className="size-4" strokeWidth={3} />
        ) : locked ? (
          <Lock className="size-4" />
        ) : (
          <Play className="size-4 fill-current" />
        )}
      </span>
      <span
        className={clsx(
          'flex-1 text-sm font-semibold',
          locked ? 'text-sg-navy/55' : 'text-sg-navy',
        )}
      >
        {lesson.title}
      </span>
      {status === 'completed' && (
        <span className="text-xs font-bold text-sg-success">Done</span>
      )}
    </button>
  );
}
