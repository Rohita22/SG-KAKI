import { SceneContainer } from './SceneContainer';
import { Figure } from './figures';

/** A row of shophouse facades over a zebra crossing — a street-level SG beat. */
export function StreetScene() {
  return (
    <SceneContainer scene="street">
      <svg
        viewBox="0 0 200 90"
        className="absolute inset-x-0 bottom-8 h-24 w-full lg:bottom-14 lg:h-40"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {[0, 40, 80, 120, 160].map((x, i) => (
          <g key={x} opacity={0.28}>
            <rect x={x + 2} y={20 + (i % 2) * 6} width="36" height={70 - (i % 2) * 6} fill="white" />
            <rect x={x + 8} y={30 + (i % 2) * 6} width="8" height="10" rx="4" fill="none" stroke="white" strokeWidth="1.5" />
            <rect x={x + 22} y={30 + (i % 2) * 6} width="8" height="10" rx="4" fill="none" stroke="white" strokeWidth="1.5" />
            <rect x={x + 6} y={16 + (i % 2) * 6} width="28" height="6" fill="white" />
          </g>
        ))}
      </svg>

      {/* zebra crossing */}
      <div className="absolute inset-x-8 bottom-4 flex justify-between lg:bottom-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-4 w-3 rounded-sm bg-white/35 lg:h-6 lg:w-5" />
        ))}
      </div>

      <div className="absolute bottom-8 left-10 text-white lg:bottom-12">
        <Figure className="h-12 w-8" />
      </div>
      <div className="absolute bottom-8 right-12 text-white/85 lg:bottom-12">
        <Figure className="h-11 w-7" flip />
      </div>
    </SceneContainer>
  );
}
