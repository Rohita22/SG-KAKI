export type WalkableFloorBounds = {
  minX?: number;
  maxX?: number;
  minY: number;
  maxY: number;
};

export function canReleaseTransitionInput(
  now: number,
  guardUntil: number,
  movementKeysDown: readonly boolean[],
) {
  return now >= guardUntil && movementKeysDown.every((isDown) => !isDown);
}

export function clampToWalkableBounds(
  x: number,
  y: number,
  bounds: WalkableFloorBounds,
  worldLeft: number,
  worldRight: number,
) {
  const minX = bounds.minX ?? worldLeft + 45;
  const maxX = bounds.maxX ?? worldRight - 45;
  return {
    x: Math.min(maxX, Math.max(minX, x)),
    y: Math.min(bounds.maxY, Math.max(bounds.minY, y)),
  };
}
