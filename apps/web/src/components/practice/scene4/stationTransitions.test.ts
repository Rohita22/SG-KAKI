import { describe, expect, it } from 'vitest';
import { STATION_DESTINATIONS } from './stationTransitions';
import { STATION_STAGES } from './stationConfig';

describe('Scene 4 station controller', () => {
  it('defines exactly one destination for every station stage', () => {
    expect(Object.keys(STATION_DESTINATIONS).sort()).toEqual(Object.keys(STATION_STAGES).sort());
  });

  it('ends only at The Signature exterior entrance', () => {
    const completions = Object.entries(STATION_DESTINATIONS)
      .filter(([, destination]) => destination.kind === 'complete')
      .map(([stage]) => stage);
    expect(completions).toEqual(['the-signature-exterior']);
  });
});
