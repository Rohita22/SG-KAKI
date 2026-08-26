import type { SceneKey } from '@/content/types';
import { EscalatorScene } from './EscalatorScene';
import { TrainScene } from './TrainScene';
import { HawkerScene } from './HawkerScene';
import { QueueScene } from './QueueScene';
import { OfficeScene } from './OfficeScene';
import { StreetScene } from './StreetScene';
import { ChatScene } from './ChatScene';
import { ClassmateScene } from './ClassmateScene';
import { SceneContainer } from './SceneContainer';

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

const CHALLENGE_SCENE_IMAGES: Record<string, string> = {
  'eat-l1-c1': '/images/challenge-scenes/eat-arrive-tables.webp',
  'eat-l2-c1': '/images/challenge-scenes/chope-tissues.webp',
  'eat-l3-c1': '/images/challenge-scenes/kopi-orders.webp',
  'eat-l4-c1': '/images/challenge-scenes/tray-return.webp',
  'eat-l5-c1': '/images/challenge-scenes/dabao-takeaway.webp',
  'speak-l1-c1': '/images/challenge-scenes/chat-meeting-can.webp',
  'speak-l1-c2': '/images/challenge-scenes/chope-tissues.webp',
  'speak-l2-c1': '/images/challenge-scenes/chat-wait-almost-there.webp',
  'speak-l3-c1': '/images/challenge-scenes/singlish-group-conversation.webp',
  'speak-l3-c2': '/images/challenge-scenes/durian-shiok.webp',
  'speak-l4-c1': '/images/challenge-scenes/queue.webp',
  'speak-l5-c1': '/images/challenge-scenes/friends-plan-evening.webp',
  'move-l1-c1': '/images/challenge-scenes/mrt-gantry-tap.webp',
  'move-l2-c1': '/images/challenge-scenes/mrt-gantry-tap.webp',
  'move-l3-c1': '/images/challenge-scenes/escalator-stand-left.webp',
  'move-l4-c1': '/images/challenge-scenes/bus-board-tap.webp',
  'move-l5-c1': '/images/challenge-scenes/grab-pickup.webp',
  'move-l6-c1': '/images/challenge-scenes/mrt-journey-sequence.webp',
  'move-l7-c1': '/images/challenge-scenes/train-let-exit-first.webp',
  'move-l8-c1': '/images/challenge-scenes/priority-seat-offer.webp',
  'vibe-l1-c1': '/images/challenge-scenes/hawker-queue.webp',
  'vibe-l3-c1': '/images/challenge-scenes/train-bag-on-seat.webp',
  'work-l1-c1': '/images/challenge-scenes/office-punctual-meeting.webp',
  'work-l3-c1': '/images/challenge-scenes/team-hawker-lunch.webp',
  'work-l4-c1': '/images/challenge-scenes/office-respectful-disagreement.webp',
  'reallife-l1-c1': '/images/challenge-scenes/escalator-blocking-right.webp',
  'reallife-l1-c2': '/images/challenge-scenes/tray-left-behind.webp',
  'reallife-l1-c4': '/images/challenge-scenes/bus-trip-sequence.webp',
};

export function ChallengeScene({
  scene,
  challengeId,
}: {
  scene: SceneKey;
  challengeId?: string;
}) {
  const challengeImage = challengeId
    ? CHALLENGE_SCENE_IMAGES[challengeId]
    : undefined;

  if (challengeImage) {
    return <SceneContainer scene={scene} image={challengeImage} />;
  }

  const Scene = SCENES[scene];
  if (!Scene) return null;
  return <Scene />;
}
