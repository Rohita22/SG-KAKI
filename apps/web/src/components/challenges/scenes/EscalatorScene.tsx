import { SceneContainer } from './SceneContainer';
import { Figure } from './figures';

/** Escalator with visible steps + handrail, reflecting the SG norm of
 * standing on the left and walking on the right. */
export function EscalatorScene() {
  const steps = Array.from({ length: 7 });

  return (
    <SceneContainer scene="escalator">
      <svg
        viewBox="0 0 200 160"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
      >
        {/* handrail */}
        <path
          d="M20 150 L150 30"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        {/* steps */}
        {steps.map((_, i) => {
          const x = 24 + i * 18;
          const y = 148 - i * 17;
          return (
            <g key={i}>
              <rect x={x} y={y} width="20" height="8" rx="1.5" fill="rgba(255,255,255,0.28)" />
              <rect x={x + 16} y={y - 12} width="4" height="12" fill="rgba(255,255,255,0.2)" />
            </g>
          );
        })}
      </svg>

      <div className="absolute bottom-6 left-8 text-white">
        <Figure className="h-16 w-11" />
      </div>
      <div className="absolute right-10 top-10 text-white/90">
        <Figure className="h-12 w-8" flip />
      </div>

      <div className="absolute left-3 top-3 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold text-white">
        Stand left · walk right
      </div>
    </SceneContainer>
  );
}
