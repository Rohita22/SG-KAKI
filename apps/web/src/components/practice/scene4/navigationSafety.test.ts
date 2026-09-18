import { describe, expect, it } from 'vitest';
import { canReleaseTransitionInput, clampToWalkableBounds } from './navigationSafety';

describe('Scene 4 navigation safety', () => {
  it('does not release a stage spawn while any carried input is held', () => {
    expect(canReleaseTransitionInput(500, 400, [false, true, false, false])).toBe(false);
    expect(canReleaseTransitionInput(399, 400, [false, false, false, false])).toBe(false);
    expect(canReleaseTransitionInput(500, 400, [false, false, false, false])).toBe(true);
  });

  it('clamps both axes to authored geometry', () => {
    expect(clampToWalkableBounds(-100, 900, { minX: 60, maxX: 2116, minY: 430, maxY: 700 }, 0, 2176))
      .toEqual({ x: 60, y: 700 });
  });

  it('uses safe camera-edge padding when a scene omits explicit X limits', () => {
    expect(clampToWalkableBounds(0, 500, { minY: 430, maxY: 700 }, 0, 2176).x).toBe(45);
    expect(clampToWalkableBounds(2200, 500, { minY: 430, maxY: 700 }, 0, 2176).x).toBe(2131);
  });
});
