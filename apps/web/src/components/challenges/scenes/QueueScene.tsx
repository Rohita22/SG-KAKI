import { SceneContainer } from './SceneContainer';
import { Figure } from './figures';

/** A single-file queue leading to a counter — SG queue culture, floor markers
 * and all. */
export function QueueScene() {
  const people = Array.from({ length: 4 });

  return (
    <SceneContainer scene="queue">
      {/* counter / kiosk at the head of the queue */}
      <div className="absolute right-6 top-8 h-16 w-10 rounded-lg bg-white/25 lg:right-10 lg:top-16 lg:h-28 lg:w-16" />
      <div className="absolute right-7 top-11 h-2 w-8 rounded-full bg-sg-xp lg:right-11 lg:top-20 lg:w-14" />

      {/* floor queue markers */}
      <div className="absolute inset-x-6 bottom-8 flex items-center justify-between lg:bottom-14">
        {people.map((_, i) => (
          <div key={i} className="h-1 w-6 rounded-full bg-white/25 lg:w-10" />
        ))}
      </div>

      <div className="absolute bottom-10 left-6 right-16 flex items-end justify-between lg:bottom-16">
        {people.map((_, i) => (
          <div key={i} style={{ height: 34 + (i % 2) * 6 }} className="w-6 text-white/85 lg:w-9">
            <Figure className="h-full w-full" />
          </div>
        ))}
      </div>
    </SceneContainer>
  );
}
