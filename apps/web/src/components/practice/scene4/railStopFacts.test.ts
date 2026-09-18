import { describe, expect, it } from 'vitest';
import { SCENE4_ROUTE } from './commuteRoute';
import { nextBouncingStopIndex, RAIL_PLAYABLE_STOP_FACTS, RAIL_STOP_FACTS } from './railStopFacts';

describe('Scene 4 simulated rail pacing', () => {
  it('keeps the complete station facts while sampling long lines for play', () => {
    expect(RAIL_STOP_FACTS['punggol-nel']).toHaveLength(15);
    expect(RAIL_STOP_FACTS['little-india-dtl']).toHaveLength(23);
    expect(RAIL_PLAYABLE_STOP_FACTS['punggol-nel']).toHaveLength(5);
    expect(RAIL_PLAYABLE_STOP_FACTS['little-india-dtl']).toHaveLength(8);
  });

  it('always retains each required alighting station', () => {
    SCENE4_ROUTE.forEach((leg) => {
      expect(RAIL_PLAYABLE_STOP_FACTS[leg.id].some((stop) => stop.station === leg.alightAt))
        .toBe(true);
    });
  });

  it('preserves increasing line order in every playable sample', () => {
    SCENE4_ROUTE.forEach((leg) => {
      const fullOrder = RAIL_STOP_FACTS[leg.id].map((stop) => stop.station);
      const playableOrder = RAIL_PLAYABLE_STOP_FACTS[leg.id]
        .map((stop) => fullOrder.indexOf(stop.station));
      expect(playableOrder).toEqual([...playableOrder].sort((a, b) => a - b));
    });
  });

  it('recovers from a missed end stop at the adjacent sampled station', () => {
    expect(nextBouncingStopIndex(2, 3, 1)).toEqual({ direction: -1, index: 1 });
    expect(nextBouncingStopIndex(0, 3, -1)).toEqual({ direction: 1, index: 1 });
  });
});
