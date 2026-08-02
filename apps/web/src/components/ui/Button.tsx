import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from '@/lib/clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'dark';
  size?: 'md' | 'lg';
  children: ReactNode;
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-sg-xp text-sg-navy hover:brightness-95 active:brightness-90 shadow-card',
  secondary:
    'bg-white text-sg-navy border-2 border-sg-navy/10 hover:bg-sg-bg',
  ghost: 'bg-transparent text-sg-navy hover:bg-sg-navy/5',
  dark: 'bg-sg-navy text-white hover:bg-sg-navy-light shadow-card',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-2xl font-bold tracking-tight transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sg-blue/40',
        size === 'lg' ? 'px-6 py-4 text-base min-h-14' : 'px-4 py-2.5 text-sm min-h-11',
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
