export const SCENE4_ROUTE = [
  {
    id: 'kadaloor-lrt',
    station: 'Kadaloor',
    service: 'Punggol LRT',
    direction: 'Punggol',
    stops: ['Oasis', 'Damai', 'Punggol'],
    alightAt: 'Punggol',
    accent: 0x159b72,
  },
  {
    id: 'punggol-nel',
    station: 'Punggol',
    service: 'North East Line',
    direction: 'HarbourFront',
    stops: [
      'Sengkang', 'Buangkok', 'Hougang', 'Kovan', 'Serangoon', 'Woodleigh',
      'Potong Pasir', 'Boon Keng', 'Farrer Park', 'Little India', 'Dhoby Ghaut',
      'Clarke Quay', 'Chinatown', 'Outram Park', 'HarbourFront',
    ],
    alightAt: 'Little India',
    accent: 0x7c3fb5,
  },
  {
    id: 'little-india-dtl',
    station: 'Little India',
    service: 'Downtown Line',
    direction: 'Expo',
    stops: ['Bendemeer', 'MacPherson', 'Expo'],
    alightAt: 'Expo',
    accent: 0x1261a0,
  },
] as const;

export type RailLegId = (typeof SCENE4_ROUTE)[number]['id'];

export const SCENE4_ROUTE_GRAPH = {
  start: 'kadaloor-exterior',
  branches: {
    bus: ['kadaloor-exterior', 'service-50', 'punggol-interchange'],
    lrt: [
      'kadaloor-exterior',
      'kadaloor-lrt-concourse',
      'kadaloor-lrt-stairs',
      'kadaloor-lrt',
      'punggol-interchange',
    ],
  },
  shared: [
    'punggol-interchange',
    'punggol-nel-escalator',
    'punggol-nel',
    'little-india-nel-arrival',
    'little-india-transfer',
    'little-india-dtl',
    'expo-dtl-arrival',
  ],
} as const;

export function isCorrectDirection(legId: RailLegId, choice: string) {
  const leg = SCENE4_ROUTE.find((candidate) => candidate.id === legId);
  return leg?.direction === choice;
}

export function nextRailLeg(legId: RailLegId): RailLegId | undefined {
  const index = SCENE4_ROUTE.findIndex((leg) => leg.id === legId);
  return SCENE4_ROUTE[index + 1]?.id;
}
