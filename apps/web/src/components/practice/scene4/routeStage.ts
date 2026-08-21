export function routeStage(nodeId: string): number {
  if (nodeId === 'tcs-office') return 4;
  if (nodeId === 'expo' || nodeId === 'cbp-walk' || nodeId === 'ride-dtl') return 3;
  if (nodeId.includes('little-india') || nodeId === 'ride-dtl-wrong') return 2;
  if (nodeId.includes('punggol') || nodeId === 'ride-nel') return 1;
  return 0;
}
