import type { InteractionContext, StationStageId, DebugCheckpointId } from './sceneTypes';

export interface StationStageConfig {
  background: string;
  image: string;
  context: InteractionContext;
  map: string;
  /** Defensive fallback only; the authored Tiled spawn is authoritative. */
  spawnX: number;
  /** Defensive fallback only; the authored Tiled portal is authoritative. */
  portalX: number;
}

export const STATION_STAGES: Record<StationStageId, StationStageConfig> = {
  'kadaloor-lrt-concourse': { background: 'scene4-kadaloor-lrt-concourse', image: 'kadaloor-lrt-concourse.png', context: 'lrt-gates', map: 'scene4-kadaloor-lrt-concourse-map', spawnX: 160, portalX: 1900 },
  'kadaloor-lrt-stairs': { background: 'scene4-kadaloor-lrt-stairs', image: 'kadaloor-lrt-stairs.png', context: 'lrt-stairs', map: 'scene4-kadaloor-lrt-stairs-map', spawnX: 420, portalX: 1680 },
  'punggol-interchange': { background: 'scene4-punggol-interchange', image: 'punggol-interchange-concourse.png', context: 'punggol-gates', map: 'scene4-punggol-interchange-map', spawnX: 160, portalX: 1840 },
  'punggol-nel-escalator': { background: 'scene4-punggol-nel-escalator', image: 'punggol-nel-escalator.png', context: 'punggol-escalator', map: 'scene4-punggol-nel-escalator-map', spawnX: 450, portalX: 1005 },
  'little-india-nel-arrival': { background: 'scene4-little-india-nel-arrival', image: 'little-india-nel-platform.png', context: 'little-india-alight', map: 'scene4-little-india-nel-arrival-map', spawnX: 900, portalX: 1660 },
  'little-india-transfer': { background: 'scene4-little-india-transfer', image: 'little-india-transfer-concourse.png', context: 'little-india-transfer', map: 'scene4-little-india-transfer-map', spawnX: 420, portalX: 1680 },
  'expo-dtl-arrival': { background: 'scene4-expo-dtl-arrival', image: 'expo-dtl-platform.png', context: 'expo-alight', map: 'scene4-expo-dtl-arrival-map', spawnX: 520, portalX: 1660 },
  'expo-fare-gates': { background: 'scene4-expo-fare-gates', image: 'expo-fare-concourse.png', context: 'expo-fare-gates', map: 'scene4-expo-fare-gates-map', spawnX: 1088, portalX: 1088 },
  'expo-exit-d': { background: 'scene4-expo-exit-d', image: 'expo-exit-d.png', context: 'expo-exit', map: 'scene4-expo-exit-d-map', spawnX: 420, portalX: 1700 },
  'the-signature-exterior': { background: 'scene4-the-signature-exterior', image: 'the-signature-exterior.png', context: 'office-walk', map: 'scene4-the-signature-exterior-map', spawnX: 520, portalX: 1880 },
};

export const DEBUG_STAGE_LABELS: Record<DebugCheckpointId, string> = {
  'bus-entry': 'Bus 50 entry',
  'bus-seated': 'Bus 50 seated',
  'lrt-seated': 'Punggol LRT seated',
  'nel-seated': 'North East Line seated',
  'dtl-seated': 'Downtown Line seated',
  'lrt-platform-open': 'Punggol LRT platform · doors open',
  'nel-platform-open': 'Punggol NEL platform · doors open',
  'dtl-platform-open': 'Little India DTL platform · doors open',
  'kadaloor-lrt-concourse': 'Kadaloor LRT concourse',
  'kadaloor-lrt-stairs': 'Kadaloor LRT stairs',
  'punggol-interchange': 'Punggol interchange',
  'punggol-nel-escalator': 'Punggol NEL escalator',
  'little-india-nel-arrival': 'Little India NEL arrival',
  'little-india-transfer': 'Little India transfer',
  'expo-dtl-arrival': 'Expo DTL arrival',
  'expo-fare-gates': 'Expo fare gates',
  'expo-exit-d': 'Expo Exit D',
  'the-signature-exterior': 'The Signature exterior',
  'the-signature-arrival': 'The Signature completion',
};
