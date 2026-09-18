import type { InteractionContext } from './sceneTypes';

export type VehicleDoorPhase =
  | 'closed'
  | 'arriving'
  | 'stopped'
  | 'open'
  | 'boarding'
  | 'closing'
  | 'departing';

export function vehicleDoorPhaseFor(
  context: InteractionContext,
  doorsOpen: boolean,
): VehicleDoorPhase {
  if (['bus-arriving', 'lrt-arriving', 'nel-arriving', 'dtl-arriving'].includes(context)) return 'arriving';
  if (['boarding', 'lrt-boarding', 'nel-boarding', 'dtl-boarding'].includes(context)) return 'boarding';
  if (['standing', 'seated'].includes(context)) return 'closing';
  if (['bus-moving', 'aisle', 'lrt-riding', 'nel-riding', 'dtl-riding'].includes(context)) {
    return doorsOpen ? 'open' : 'departing';
  }
  if (doorsOpen) return 'open';
  if (['tapping', 'fare-success', 'exit-ok'].includes(context)) return 'stopped';
  return 'closed';
}
