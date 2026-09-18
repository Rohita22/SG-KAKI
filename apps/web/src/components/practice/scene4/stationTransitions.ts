import type { RailLegId } from './commuteRoute';
import type { StationStageId } from './sceneTypes';

export type StationDestination =
  | { kind: 'station'; id: StationStageId }
  | { kind: 'rail'; id: RailLegId }
  | { kind: 'complete' };

export const STATION_DESTINATIONS: Record<StationStageId, StationDestination> = {
  'kadaloor-lrt-concourse': { kind: 'station', id: 'kadaloor-lrt-stairs' },
  'kadaloor-lrt-stairs': { kind: 'rail', id: 'kadaloor-lrt' },
  'punggol-interchange': { kind: 'station', id: 'punggol-nel-escalator' },
  'punggol-nel-escalator': { kind: 'rail', id: 'punggol-nel' },
  'little-india-nel-arrival': { kind: 'station', id: 'little-india-transfer' },
  'little-india-transfer': { kind: 'rail', id: 'little-india-dtl' },
  'expo-dtl-arrival': { kind: 'station', id: 'expo-fare-gates' },
  'expo-fare-gates': { kind: 'station', id: 'expo-exit-d' },
  'expo-exit-d': { kind: 'station', id: 'the-signature-exterior' },
  'the-signature-exterior': { kind: 'complete' },
};
