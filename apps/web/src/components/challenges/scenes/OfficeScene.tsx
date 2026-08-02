import { SceneContainer } from './SceneContainer';
import { Figure } from './figures';

/** Desk with a laptop, coffee cup, and a small plant — office small-talk vibe. */
export function OfficeScene() {
  return (
    <SceneContainer scene="office">
      {/* desk */}
      <div className="absolute bottom-5 left-8 right-8 h-3 rounded-full bg-white/30 lg:bottom-7" />
      <div className="absolute bottom-8 left-8 right-8 h-8 rounded-lg bg-white/20 lg:bottom-10 lg:h-12" />

      {/* laptop */}
      <div className="absolute bottom-[52px] left-1/2 h-7 w-11 -translate-x-1/2 rounded-t-md border-2 border-white/40 bg-white/10 lg:bottom-[76px] lg:h-10 lg:w-16" />
      <div className="absolute bottom-[52px] left-1/2 h-1.5 w-14 -translate-x-1/2 rounded-full bg-white/40 lg:bottom-[76px] lg:w-20" />

      {/* coffee cup */}
      <div className="absolute bottom-14 right-16 h-4 w-3.5 rounded-b-md bg-white/50 lg:bottom-20 lg:right-24 lg:h-6 lg:w-5" />

      {/* plant */}
      <div className="absolute bottom-14 left-14 h-5 w-4 rounded-b-md bg-white/30 lg:bottom-20 lg:left-20 lg:h-7 lg:w-6" />
      <div className="absolute bottom-[70px] left-[58px] h-6 w-6 rounded-full bg-sg-success/70 lg:bottom-24 lg:left-[86px] lg:h-9 lg:w-9" />

      <div className="absolute bottom-16 left-24 text-white/90 lg:bottom-24 lg:left-32">
        <Figure className="h-12 w-8" />
      </div>
      <div className="absolute bottom-16 right-24 text-white/80 lg:bottom-24 lg:right-32">
        <Figure className="h-11 w-7" flip />
      </div>
    </SceneContainer>
  );
}
