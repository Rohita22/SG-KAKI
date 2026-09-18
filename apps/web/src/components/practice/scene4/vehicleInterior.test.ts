import { describe, expect, it } from 'vitest';
import { nearestAvailableSeatIndex } from './vehicleInterior';

const adapter = {
  isOccupied: (seat: { occupied: boolean }) => seat.occupied,
  playerX: (seat: { x: number }) => seat.x,
};

describe('shared vehicle interior helpers', () => {
  it('selects the nearest available authored seat', () => {
    const seats = [
      { occupied: false, x: 200 },
      { occupied: true, x: 300 },
      { occupied: false, x: 500 },
    ];
    expect(nearestAvailableSeatIndex(seats, 320, adapter)).toBe(0);
    expect(nearestAvailableSeatIndex(seats, 460, adapter)).toBe(2);
  });

  it('returns undefined when every seat is occupied', () => {
    expect(nearestAvailableSeatIndex([{ occupied: true, x: 200 }], 200, adapter))
      .toBeUndefined();
  });
});
