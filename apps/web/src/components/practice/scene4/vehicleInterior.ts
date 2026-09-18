export type VehicleSeatAdapter<T> = {
  isOccupied: (seat: T) => boolean;
  playerX: (seat: T) => number;
};

/** Shared seat selection; each vehicle still supplies its own authored geometry. */
export function nearestAvailableSeatIndex<T>(
  seats: readonly T[],
  passengerX: number,
  adapter: VehicleSeatAdapter<T>,
) {
  let nearestIndex: number | undefined;
  let nearestDistance = Number.POSITIVE_INFINITY;
  seats.forEach((seat, index) => {
    if (adapter.isOccupied(seat)) return;
    const distance = Math.abs(adapter.playerX(seat) - passengerX);
    if (distance < nearestDistance) {
      nearestIndex = index;
      nearestDistance = distance;
    }
  });
  return nearestIndex;
}
