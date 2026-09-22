import type { RailLegId } from './commuteRoute';

export const PLAYER_ART_SPEC = {
  walkingFrameWidth: 512,
  seatedFrameWidth: 254,
  sourceHeight: 768,
} as const;

// Normalized coordinates are measured within each source frame. The walking
// sheets retain 27px of transparent export padding below the shoes, while the
// seated pose reaches the bottom edge. Pose-specific foot anchors compensate
// for that export difference so authored world Y values always mean floor
// contact instead of the bottom of the PNG canvas.
export const PLAYER_ANCHORS = {
  walkingFeet: { x: 0.5, y: 0.965 },
  seatedFeet: { x: 0.5, y: 0.995 },
  hip: { x: 0.5, y: 0.5 },
  hand: { x: 0.59, y: 0.44 },
  head: { x: 0.5, y: 0.08 },
} as const;

export type PlayerScaleProfile =
  | 'exterior'
  | 'station'
  | 'escalator'
  | 'bus-standing'
  | 'bus-seated'
  | 'rail-standing'
  | 'rail-seated';

// These target heights reproduce the current implementation while making the
// relationship explicit. Visual tuning now changes a named world-space height
// instead of scattering unrelated scale guesses through the scene.
export const PLAYER_TARGET_HEIGHT: Record<PlayerScaleProfile, number> = {
  exterior: 230.4,
  station: 322.56,
  escalator: 184.32,
  'bus-standing': 537.6,
  'bus-seated': 460.8,
  'rail-standing': 414.72,
  'rail-seated': 384,
};

export function playerScaleFor(profile: PlayerScaleProfile) {
  return PLAYER_TARGET_HEIGHT[profile] / PLAYER_ART_SPEC.sourceHeight;
}

export function playerVisualMetrics(
  profile: PlayerScaleProfile,
  floorY: number,
  pose: 'walking' | 'seated' = profile.endsWith('seated') ? 'seated' : 'walking',
) {
  const displayHeight = PLAYER_TARGET_HEIGHT[profile];
  const footAnchorY = pose === 'seated'
    ? PLAYER_ANCHORS.seatedFeet.y
    : PLAYER_ANCHORS.walkingFeet.y;
  return {
    displayHeight,
    footY: floorY,
    spriteTopY: floorY - displayHeight * footAnchorY,
    transparentPaddingBelowFeet: displayHeight * (1 - footAnchorY),
  };
}

export const VISUAL_TOLERANCES = {
  renderedHeightPx: 1,
  floorContactPx: 2,
  seatHipPx: 35,
  doorAlignmentPx: 18,
} as const;

export function seatedHipY(profile: 'bus-seated' | 'rail-seated', footFloorY: number) {
  return footFloorY - PLAYER_TARGET_HEIGHT[profile]
    * (PLAYER_ANCHORS.seatedFeet.y - PLAYER_ANCHORS.hip.y);
}

export type RailSeatAnchor = {
  footFloorY: number;
  hipY: number;
  id: string;
  scaleProfile: 'rail-seated';
  x: number;
};

// The carriage bench begins at x≈740. The former 690 start placed the seated
// sprite in the doorway gap; these values target the visible cushion centres.
const RAIL_SEAT_X = [780, 862, 944, 1026, 1108, 1190, 1272, 1354, 1436] as const;

function railSeatAnchors(legId: RailLegId): RailSeatAnchor[] {
  return RAIL_SEAT_X.map((x, index) => ({
    // Lower the seated pose so the hips meet the visible cushion instead of
    // hovering slightly above it. This affects only rail seating.
    footFloorY: 595,
    hipY: 400,
    id: `${legId}-seat-${index + 1}`,
    scaleProfile: 'rail-seated',
    x,
  }));
}

export const RAIL_SEAT_ANCHORS: Record<RailLegId, RailSeatAnchor[]> = {
  'kadaloor-lrt': railSeatAnchors('kadaloor-lrt'),
  'punggol-nel': railSeatAnchors('punggol-nel'),
  'little-india-dtl': railSeatAnchors('little-india-dtl'),
};
