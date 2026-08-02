import type { ReactNode } from 'react';

/**
 * The web-first app root. No longer a fixed phone-sized frame — each screen
 * now composes its own responsive layout within the full browser viewport.
 */
export function GameFrame({ children }: { children: ReactNode }) {
  return <div className="min-h-dvh w-full bg-sg-bg text-sg-navy">{children}</div>;
}
