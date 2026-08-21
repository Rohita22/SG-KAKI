import { describe, expect, it } from 'vitest';
import {
  BUDGET_MIN,
  BUFFER_MIN,
  FAIL_AFTER_STOPS,
  HAPPY_PATH_MIN,
  START_NODE,
  allNodes,
  happyPath,
  isPlace,
  isRide,
  isUnrecoverable,
  nodeById,
  rideMinutes,
  stopsPastTarget,
} from './route';

describe('the graph is wired up', () => {
  it('resolves every destination', () => {
    // A typo in a 14-node graph strands the player somewhere with no way out,
    // and it would only show up by walking to that exact spot by hand.
    for (const node of allNodes) {
      if (isPlace(node)) {
        for (const hotspot of node.hotspots) {
          expect(() => nodeById(hotspot.to), `${node.id} → ${hotspot.label}`).not.toThrow();
        }
      } else {
        expect(node.direction.trim().length, `${node.id} direction`).toBeGreaterThan(2);
        expect(() => nodeById(node.arriveAt), `${node.id} arriveAt`).not.toThrow();
        if (node.crossOverTo) {
          expect(() => nodeById(node.crossOverTo!), `${node.id} crossOverTo`).not.toThrow();
        }
      }
    }
  });

  it('gives every non-arrival place exactly one correct way out', () => {
    for (const node of allNodes.filter(isPlace)) {
      const correct = node.hotspots.filter((h) => !h.wrong);
      expect(correct.length, `${node.id} correct exits`).toBe(node.arrival ? 0 : 1);
    }
  });

  it('points every ride at a real stop', () => {
    for (const ride of allNodes.filter(isRide)) {
      if (ride.alightAt < 0) continue; // wrong-direction ride: no stop is right
      expect(ride.stations[ride.alightAt], `${ride.id} alightAt`).toBeDefined();
    }
  });

  it('gives every location offline-safe help', () => {
    for (const node of allNodes) {
      expect(node.hint.trim().length, `${node.id} hint`).toBeGreaterThan(10);
      expect(node.guidance.trim().length, `${node.id} guidance`).toBeGreaterThan(20);
    }
  });
});

describe('the quest is winnable', () => {
  const run = happyPath();

  it('reaches the office from the start', () => {
    expect(run.nodes[0]).toBe(START_NODE);
    expect(run.nodes.at(-1)).toBe('tcs-office');
  });

  // If this fails the quest is unplayable, so it is the assertion that matters.
  it('leaves the stated buffer unspent', () => {
    expect(run.minutes).toBe(HAPPY_PATH_MIN);
    expect(BUDGET_MIN - run.minutes).toBe(BUFFER_MIN);
  });
});

describe('going too far', () => {
  it('fails once you are FAIL_AFTER_STOPS past your stop', () => {
    const nel = nodeById('ride-nel');
    if (!isRide(nel)) throw new Error('ride-nel is not a ride');

    expect(isUnrecoverable(nel, nel.alightAt)).toBe(false);
    expect(isUnrecoverable(nel, nel.alightAt + FAIL_AFTER_STOPS - 1)).toBe(false);
    expect(isUnrecoverable(nel, nel.alightAt + FAIL_AFTER_STOPS)).toBe(true);
  });

  it('can actually be ridden that far — the NEL continues past Little India', () => {
    // Without these stations the fail-by-overshoot path is unreachable code.
    const nel = nodeById('ride-nel');
    if (!isRide(nel)) throw new Error('ride-nel is not a ride');
    expect(nel.stations.length - 1).toBeGreaterThanOrEqual(nel.alightAt + FAIL_AFTER_STOPS);
  });

  it('counts every stop on a wrong-direction ride as one too far', () => {
    const wrong = nodeById('ride-dtl-wrong');
    if (!isRide(wrong)) throw new Error('ride-dtl-wrong is not a ride');

    expect(stopsPastTarget(wrong, 1)).toBe(1);
    expect(isUnrecoverable(wrong, FAIL_AFTER_STOPS)).toBe(true);
    expect(wrong.crossOverTo).toBe('little-india-dtl');
  });

  it('never fails a terminus ride, because you cannot stay on past the end', () => {
    // Bus 50 ends at Punggol and the Downtown Line ends at Expo — both are the
    // stop you want, which is why act 1 cannot be failed at all.
    for (const ride of allNodes.filter(isRide).filter((r) => r.terminus)) {
      const lastIndex = ride.stations.length - 1;
      expect(ride.alightAt, `${ride.id} should end at its target`).toBe(lastIndex);
      expect(isUnrecoverable(ride, lastIndex), `${ride.id}`).toBe(false);
    }
  });
});

describe('ride timings', () => {
  it('matches the real published journey times', () => {
    const minutes = (id: string) => {
      const ride = nodeById(id);
      if (!isRide(ride)) throw new Error(`${id} is not a ride`);
      return rideMinutes(ride);
    };
    expect(minutes('ride-bus')).toBe(10); // 4 stops, Kadaloor → Punggol Int
    expect(minutes('ride-nel')).toBe(22); // Punggol → Little India
    expect(minutes('ride-dtl')).toBe(46); // Little India → Expo, via the city loop
  });
});
