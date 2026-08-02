import { SceneContainer } from './SceneContainer';
import { Figure } from './figures';
import { SupertreeGlyph, HdbGlyph } from '../../map/landmarks';

/** MRT carriage interior — stanchion poles, overhead handles, a priority-seat
 * marker, and a window strip hinting at the SG skyline outside. */
export function TrainScene() {
  return (
    <SceneContainer scene="train">
      {/* window strip with skyline */}
      <div className="absolute inset-x-4 top-3 h-10 overflow-hidden rounded-xl bg-white/10">
        <div className="flex h-full items-end justify-around px-2 pb-1 text-white/40">
          <SupertreeGlyph className="h-6 w-6" />
          <HdbGlyph className="h-7 w-7" />
          <SupertreeGlyph className="h-5 w-5" />
        </div>
      </div>

      {/* priority seat marker */}
      <div className="absolute right-4 top-16 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[9px] font-bold text-sg-navy lg:top-20">
        ♥ Priority Seat
      </div>

      {/* overhead handles */}
      <div className="absolute inset-x-6 top-[58px] flex justify-around lg:top-28">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-4 w-4 rounded-full border-2 border-white/30" />
        ))}
      </div>

      {/* stanchion poles */}
      <div className="absolute bottom-4 left-1/2 h-24 w-1 -translate-x-6 rounded-full bg-white/25 lg:h-56" />
      <div className="absolute bottom-4 left-1/2 h-24 w-1 translate-x-6 rounded-full bg-white/25 lg:h-56" />

      <div className="absolute bottom-4 left-8 text-white/90">
        <Figure className="h-14 w-9" />
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
        <Figure className="h-16 w-10" />
      </div>
      <div className="absolute bottom-4 right-8 text-white/80">
        <Figure className="h-14 w-9" flip />
      </div>
    </SceneContainer>
  );
}
