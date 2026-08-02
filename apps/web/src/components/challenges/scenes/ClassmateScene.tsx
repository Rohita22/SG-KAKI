import { SceneContainer } from './SceneContainer';
import { Figure } from './figures';

/** School hallway before class — two figures meeting near the lockers and a doorway. */
export function ClassmateScene() {
  return (
    <SceneContainer scene="classroom">
      {/* doorway */}
      <div className="absolute left-1/2 top-0 h-20 w-14 -translate-x-1/2 rounded-b-2xl bg-white/10 lg:h-28 lg:w-20" />

      {/* lockers */}
      <div className="absolute bottom-4 left-4 top-4 w-6 rounded-lg bg-white/10 lg:w-10" />
      <div className="absolute bottom-4 right-4 top-4 w-6 rounded-lg bg-white/10 lg:w-10" />

      {/* floor line */}
      <div className="absolute bottom-6 left-0 right-0 h-px bg-white/20 lg:bottom-8" />

      {/* you and the classmate, facing each other */}
      <div className="absolute bottom-6 left-[38%] text-white/90 lg:bottom-8">
        <Figure className="h-14 w-9 lg:h-20 lg:w-12" />
      </div>
      <div className="absolute bottom-6 right-[38%] text-white/80 lg:bottom-8">
        <Figure className="h-14 w-9 lg:h-20 lg:w-12" flip />
      </div>
    </SceneContainer>
  );
}
