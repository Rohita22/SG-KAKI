import { describe, expect, it } from 'vitest';
import exteriorMapSource from '../../../../public/scenes/scene4/maps/kadaloor-exterior.tmj?raw';

// Player footbox in world pixels, derived the way Arcade Physics derives it in
// Body.updateBounds / updateFromGameObject:
//   body size   = sourceSize * scale
//   body offset = scale * (bodyOffset - displayOrigin)
// See CommuteGame: exterior scale 0.30, frame 512x768, origin (0.5, 1),
// body.setSize(120, 70), body.setOffset(196, 675). Confirmed in-browser: the
// body scales with the character while remaining anchored around his feet.
const SCALE = 0.3;
const FOOTBOX_TOP = SCALE * (675 - 768);
const FOOTBOX_HEIGHT = 70 * SCALE;
const FOOTBOX_HALF_WIDTH = (120 * SCALE) / 2;

// A lane the player can hold a direction in without clipping a collider edge.
const MIN_LANE = 24;

interface TiledObject {
  height?: number;
  name: string;
  width?: number;
  x: number;
  y: number;
}

const map = JSON.parse(exteriorMapSource) as {
  layers: Array<{ name: string; objects?: TiledObject[] }>;
};

const layer = (name: string) =>
  map.layers.find((l) => l.name === name)?.objects ?? [];

const colliders = layer('Collision');

function blocksFeet(object: TiledObject, x: number, feetY: number) {
  const top = feetY + FOOTBOX_TOP;
  return (
    x + FOOTBOX_HALF_WIDTH > object.x &&
    x - FOOTBOX_HALF_WIDTH < object.x + (object.width ?? 0) &&
    top + FOOTBOX_HEIGHT > object.y &&
    top < object.y + (object.height ?? 0)
  );
}

/** Longest run of feet-y values that clears every collider at this x. */
function widestLane(x: number) {
  let best = { height: 0, top: 0 };
  let runStart: number | null = null;
  for (let feetY = 0; feetY <= 800; feetY += 1) {
    const free =
      feetY <= 800 && !colliders.some((object) => blocksFeet(object, x, feetY));
    if (free && runStart === null) runStart = feetY;
    if (!free && runStart !== null) {
      if (feetY - runStart > best.height) {
        best = { height: feetY - runStart, top: runStart };
      }
      runStart = null;
    }
  }
  return best;
}

describe('Kadaloor exterior walkable corridor', () => {
  // Every sticking bug so far has been the same shape: a collider leaving a
  // lane too thin to walk down. The footbox clips its edge, Arcade separates on
  // whichever axis overlaps least, and the player is ejected sideways — backing
  // off and re-approaching at a different y is the only way through. Props may
  // sit in the pavement, they just have to leave a lane beside them.
  it('leaves a walkable lane at every x', () => {
    for (let x = 0; x <= 2176; x += 8) {
      expect(widestLane(x).height, `lane at x=${x}`).toBeGreaterThanOrEqual(
        MIN_LANE,
      );
    }
  });

  it('has solid foot-level geometry for every visible stop prop', () => {
    [
      'Shelter bench foot collision',
      'Shelter left-post collision',
      'Bollard B collision',
      'Bollard C collision',
    ].forEach((name) => {
      const collider = colliders.find((object) => object.name === name);
      expect(collider, name + ' is missing').toBeDefined();
      expect(collider!.width).toBeGreaterThan(20);
      expect(collider!.height).toBeGreaterThan(20);
    });
  });

  it('keeps the pavement route clear through the bus-stop sign', () => {
    const sign = layer('Environment').find(
      (object) => object.name === 'Separate bus stop pole 65321',
    );
    expect(sign).toBeDefined();

    for (let x = sign!.x; x <= sign!.x + sign!.width!; x += 2) {
      expect(
        colliders.some((object) => blocksFeet(object, x, 530)),
        `blocked beside the bus-stop sign at x=${x}`,
      ).toBe(false);
    }
  });

  // Holding a direction parks the player against one of the lane's two edges,
  // never its middle. A trigger inset from those edges is a trigger the player
  // walks straight past — which is exactly how Raise Hand went missing.
  it('puts the raise-hand trigger on both edges of the lane you walk in', () => {
    const waitZone = layer('Interactions').find(
      (object) => object.name === 'Wait inside bus stop',
    );
    expect(waitZone).toBeDefined();

    const covers = (feetY: number) =>
      feetY >= waitZone!.y && feetY <= waitZone!.y + waitZone!.height!;

    for (let x = waitZone!.x; x <= waitZone!.x + waitZone!.width!; x += 8) {
      const lane = widestLane(x);
      expect(covers(lane.top), `lane top at x=${x} is y=${lane.top}`).toBe(true);
      const laneBottom = lane.top + lane.height;
      expect(covers(laneBottom), `lane bottom at x=${x} is y=${laneBottom}`).toBe(
        true,
      );
    }
  });
});
