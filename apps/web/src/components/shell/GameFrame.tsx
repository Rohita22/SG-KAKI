import type { ReactNode } from 'react';

/**
 * The web-first app root. No longer a fixed phone-sized frame — each screen
 * now composes its own responsive layout within the full browser viewport.
 */
export function GameFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh w-full bg-[#f4f7fa] text-sg-navy overflow-hidden">
      {/* Content wrapper */}
      <div className="relative z-10 flex min-h-dvh w-full flex-col">
        {children}
      </div>
    </div>
  );
}
