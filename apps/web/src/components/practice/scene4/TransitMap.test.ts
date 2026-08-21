import { describe, expect, it } from 'vitest';
import { routeStage } from './routeStage';

describe('route map progress', () => {
  it.each([
    ['kadaloor-busstop', 0],
    ['ride-bus', 0],
    ['punggol-int', 1],
    ['ride-nel', 1],
    ['little-india', 2],
    ['ride-dtl-wrong', 2],
    ['ride-dtl', 3],
    ['expo', 3],
    ['cbp-walk', 3],
    ['tcs-office', 4],
  ])('maps %s to journey stage %i', (nodeId, stage) => {
    expect(routeStage(nodeId)).toBe(stage);
  });
});
