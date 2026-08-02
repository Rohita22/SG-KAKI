import type { SceneKey } from '@/content/types';
import { EscalatorScene } from './EscalatorScene';
import { TrainScene } from './TrainScene';
import { HawkerScene } from './HawkerScene';
import { QueueScene } from './QueueScene';
import { OfficeScene } from './OfficeScene';
import { StreetScene } from './StreetScene';
import { ChatScene } from './ChatScene';
import { ClassmateScene } from './ClassmateScene';

const SCENES: Partial<Record<SceneKey, React.FC>> = {
  escalator: EscalatorScene,
  train: TrainScene,
  hawker: HawkerScene,
  queue: QueueScene,
  office: OfficeScene,
  street: StreetScene,
  chat: ChatScene,
  classroom: ClassmateScene,
};

/** Exposed for a content-integrity test: every non-'none' scene key used by
 * authored content must have a registered renderer here. */
export const REGISTERED_SCENE_KEYS = Object.keys(SCENES) as SceneKey[];

export function ChallengeScene({ scene }: { scene: SceneKey }) {
  const Scene = SCENES[scene];
  if (!Scene) return null;
  return <Scene />;
}
