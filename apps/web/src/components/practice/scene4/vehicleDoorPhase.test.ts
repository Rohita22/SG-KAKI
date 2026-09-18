import { describe, expect, it } from 'vitest';
import { vehicleDoorPhaseFor, type VehicleDoorPhase } from './vehicleDoorPhase';

describe('Scene 4 vehicle door phases', () => {
  it('exposes every visual phase independently', () => {
    const phases: VehicleDoorPhase[] = [
      vehicleDoorPhaseFor('walking', false),
      vehicleDoorPhaseFor('bus-arriving', false),
      vehicleDoorPhaseFor('tapping', false),
      vehicleDoorPhaseFor('tap-out', true),
      vehicleDoorPhaseFor('nel-boarding', true),
      vehicleDoorPhaseFor('standing', false),
      vehicleDoorPhaseFor('bus-moving', false),
    ];
    expect(phases).toEqual([
      'closed', 'arriving', 'stopped', 'open', 'boarding', 'closing', 'departing',
    ]);
  });

  it('keeps a target-stop carriage visibly open until alighting', () => {
    expect(vehicleDoorPhaseFor('dtl-riding', true)).toBe('open');
    expect(vehicleDoorPhaseFor('dtl-riding', false)).toBe('departing');
  });
});
