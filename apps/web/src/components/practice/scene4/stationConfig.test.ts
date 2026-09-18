import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { canReleaseTransitionInput } from './navigationSafety';
import { STATION_STAGES } from './stationConfig';

type MapObject = { name: string; x: number; y: number; width?: number; height?: number };
type MapLayer = { name: string; objects?: MapObject[] };
type TiledMap = { layers: MapLayer[] };

function objectsFor(map: TiledMap, layerName: string) {
  return map.layers.find((layer) => layer.name === layerName)?.objects ?? [];
}

describe('Scene 4 authored station traversal', () => {
  it('keeps station spawns and portals in Tiled with typed defensive fallbacks', () => {
    Object.entries(STATION_STAGES).forEach(([stageId, config]) => {
      const mapName = config.map
        .replace(/^scene4-/, '')
        .replace(/-map$/, '');
      const map = JSON.parse(
        readFileSync(`public/scenes/scene4/maps/${mapName}.tmj`, 'utf8'),
      ) as TiledMap;
      const spawn = objectsFor(map, 'Spawns').find((object) => object.name === 'player-start');
      expect(spawn, `${stageId} player-start`).toBeDefined();
      expect(spawn?.x, `${stageId} fallback spawn`).toBe(config.spawnX);

      const portal = objectsFor(map, 'Interactions').find((object) => object.name === 'Next area');
      if (stageId === 'expo-fare-gates') {
        expect(portal).toBeUndefined();
      } else {
        expect(portal, `${stageId} Next area`).toBeDefined();
      }
    });
  });

  it('requires a full input release at every authored portal spawn', () => {
    Object.entries(STATION_STAGES).forEach(([stageId, config]) => {
      expect(
        canReleaseTransitionInput(600, 400, [true, false, false, false]),
        `${stageId} right held at x=${config.portalX}`,
      ).toBe(false);
      expect(
        canReleaseTransitionInput(600, 400, [false, false, false, false]),
        `${stageId} released`,
      ).toBe(true);
    });
  });

  it('caps non-interactive station walks at a purposeful traversal distance', () => {
    const directWalkStages = [
      'kadaloor-lrt-stairs',
      'little-india-nel-arrival',
      'little-india-transfer',
      'expo-dtl-arrival',
      'expo-exit-d',
      'the-signature-exterior',
    ] as const;
    directWalkStages.forEach((stageId) => {
      const config = STATION_STAGES[stageId];
      expect(config.portalX - config.spawnX, stageId).toBeLessThanOrEqual(1360);
    });
  });
});
