import type { ReactNode } from 'react';
import { clsx } from '@/lib/clsx';

const GRADIENTS: Record<string, string> = {
  escalator: 'from-sg-xp to-sg-orange',
  train: 'from-sg-blue to-sg-navy-light',
  hawker: 'from-sg-orange to-sg-xp',
  queue: 'from-sg-blue to-sg-success',
  office: 'from-sg-navy to-sg-navy-light',
  street: 'from-sg-success to-sg-blue',
  chat: 'from-sg-purple to-sg-purple-deep',
  classroom: 'from-sg-blue to-sg-purple',
};

export function SceneContainer({
  scene,
  children,
}: {
  scene: string;
  children: ReactNode;
}) {
  return (
    <div
      className={clsx(
        'relative h-40 w-full overflow-hidden rounded-3xl bg-gradient-to-br shadow-inner lg:h-[420px]',
        GRADIENTS[scene] ?? 'from-sg-navy to-sg-navy-light',
      )}
    >
      {children}
    </div>
  );
}
