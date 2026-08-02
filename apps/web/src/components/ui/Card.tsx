import type { HTMLAttributes, ReactNode } from 'react';
import { clsx } from '@/lib/clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-3xl bg-white shadow-card p-5',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
