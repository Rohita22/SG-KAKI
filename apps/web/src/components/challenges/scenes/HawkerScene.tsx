import { SceneContainer } from './SceneContainer';
import { Figure } from './figures';

/** Hawker stall — awning, menu signboard, counter, steam rising off a tray. */
export function HawkerScene() {
  return (
    <SceneContainer scene="hawker">
      {/* awning */}
      <svg
        viewBox="0 0 200 40"
        className="absolute inset-x-6 top-2 h-8 w-[calc(100%-3rem)]"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 0 H200 L190 30 H10 Z" fill="rgba(255,255,255,0.22)" />
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={i} x={i * 34} y="28" width="17" height="8" fill="rgba(255,255,255,0.3)" />
        ))}
      </svg>

      {/* menu signboard */}
      <div className="absolute right-6 top-11 w-16 rounded-md bg-white/90 p-1.5 lg:right-10 lg:top-16 lg:w-24">
        <div className="h-1 w-4/5 rounded-full bg-sg-navy/30" />
        <div className="mt-1 h-1 w-3/5 rounded-full bg-sg-navy/30" />
        <div className="mt-1 h-1 w-full rounded-full bg-sg-xp" />
      </div>

      {/* steam */}
      <div className="absolute bottom-16 left-16 h-6 w-1 rounded-full bg-white/40 lg:bottom-28" />
      <div className="absolute bottom-16 left-20 h-8 w-1 rounded-full bg-white/40 lg:bottom-28" />

      {/* counter */}
      <div className="absolute inset-x-5 bottom-5 h-12 rounded-xl bg-white/25 lg:h-16" />
      <div className="absolute bottom-[52px] left-14 h-5 w-9 rounded-md bg-white/50 lg:bottom-[68px] lg:left-20 lg:h-7 lg:w-14" />

      <div className="absolute bottom-16 right-8 text-white lg:bottom-20">
        <Figure className="h-14 w-9" />
      </div>
      <div className="absolute bottom-16 left-9 text-white/85 lg:bottom-20">
        <Figure className="h-12 w-8" flip />
      </div>
    </SceneContainer>
  );
}
