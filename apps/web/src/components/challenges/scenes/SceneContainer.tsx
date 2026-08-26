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

const SCENE_IMAGES: Record<string, string> = {
  escalator: '/images/challenge-scenes/escalator.webp',
  train: '/images/challenge-scenes/train.webp',
  hawker: '/images/challenge-scenes/hawker.webp',
  queue: '/images/challenge-scenes/queue.webp',
  office: '/images/challenge-scenes/office.webp',
  street: '/images/challenge-scenes/street.webp',
  chat: '/images/challenge-scenes/chat.webp',
  classroom: '/images/challenge-scenes/classroom.webp',
};

export function SceneContainer({
  scene,
  children,
  image: imageOverride,
}: {
  scene: string;
  children?: ReactNode;
  image?: string;
}) {
  const image = imageOverride ?? SCENE_IMAGES[scene];

  return (
    <div
      className={clsx(
        'relative h-40 w-full overflow-hidden rounded-3xl bg-gradient-to-br shadow-inner lg:h-[420px]',
        GRADIENTS[scene] ?? 'from-sg-navy to-sg-navy-light',
      )}
    >
      {image ? (
        <img
          src={image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover object-center"
        />
      ) : (
        children
      )}
    </div>
  );
}
