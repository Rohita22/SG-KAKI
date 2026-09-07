import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { isCorrectDirection, nextRailLeg, SCENE4_ROUTE, SCENE4_ROUTE_GRAPH } from './commuteRoute';
import { RAIL_STOP_FACTS } from './railStopFacts';
import kadaloorMapSource from '../../../../public/scenes/scene4/maps/kadaloor-lrt.tmj?raw';
import punggolMapSource from '../../../../public/scenes/scene4/maps/punggol-nel.tmj?raw';
import littleIndiaMapSource from '../../../../public/scenes/scene4/maps/little-india-dtl.tmj?raw';
import busInteriorMapSource from '../../../../public/scenes/scene4/maps/service-50-interior.tmj?raw';

const railMaps = [kadaloorMapSource, punggolMapSource, littleIndiaMapSource].map(
  (source) => JSON.parse(source) as {
    layers: Array<{ name: string; objects: Array<{ name: string }> }>;
    properties: Array<{ name: string; value: string }>;
  },
);

describe('Scene 4 rail route', () => {
  it('plays every intermediate rail stop in route order with a readable fact', () => {
    expect(RAIL_STOP_FACTS['kadaloor-lrt'].map((stop) => stop.station)).toEqual([
      'Oasis', 'Damai', 'Punggol',
    ]);
    expect(RAIL_STOP_FACTS['punggol-nel'].map((stop) => stop.station)).toEqual([
      'Sengkang', 'Buangkok', 'Hougang', 'Kovan', 'Serangoon',
      'Woodleigh', 'Potong Pasir', 'Boon Keng', 'Farrer Park', 'Little India',
      'Dhoby Ghaut', 'Clarke Quay', 'Chinatown', 'Outram Park', 'HarbourFront',
    ]);
    expect(RAIL_STOP_FACTS['little-india-dtl'].map((stop) => stop.station)).toEqual([
      'Rochor', 'Bugis', 'Promenade', 'Bayfront', 'Downtown', 'Telok Ayer',
      'Chinatown', 'Fort Canning', 'Bencoolen', 'Jalan Besar', 'Bendemeer',
      'Geylang Bahru', 'Mattar', 'MacPherson', 'Ubi', 'Kaki Bukit', 'Bedok North',
      'Bedok Reservoir', 'Tampines West', 'Tampines', 'Tampines East',
      'Upper Changi', 'Expo',
    ]);
    Object.values(RAIL_STOP_FACTS).flat().forEach((stop) => {
      expect(stop.fact.length, `${stop.station} fact`).toBeGreaterThan(45);
    });
    expect(SCENE4_ROUTE.find((leg) => leg.id === 'punggol-nel')?.stops).toEqual(
      RAIL_STOP_FACTS['punggol-nel'].map((stop) => stop.station),
    );
  });

  it('models bus and LRT as alternatives that merge only at Punggol', () => {
    expect(SCENE4_ROUTE_GRAPH.branches.bus).not.toContain('kadaloor-lrt');
    expect(SCENE4_ROUTE_GRAPH.branches.bus.at(-1)).toBe('punggol-interchange');
    expect(SCENE4_ROUTE_GRAPH.branches.lrt).toEqual([
      'kadaloor-exterior',
      'kadaloor-lrt-concourse',
      'kadaloor-lrt-stairs',
      'kadaloor-lrt',
      'punggol-interchange',
    ]);
    expect(SCENE4_ROUTE_GRAPH.shared).toEqual([
      'punggol-interchange',
      'punggol-nel-escalator',
      'punggol-nel',
      'little-india-nel-arrival',
      'little-india-transfer',
      'little-india-dtl',
      'expo-dtl-arrival',
    ]);
  });
  it('keeps the brief route in travel order', () => {
    expect(SCENE4_ROUTE.map((leg) => leg.id)).toEqual([
      'kadaloor-lrt',
      'punggol-nel',
      'little-india-dtl',
    ]);
    expect(SCENE4_ROUTE.map((leg) => leg.direction)).toEqual([
      'Punggol',
      'HarbourFront',
      'Expo',
    ]);
    expect(SCENE4_ROUTE.map((leg) => leg.alightAt)).toEqual([
      'Punggol',
      'Little India',
      'Expo',
    ]);
  });

  it('rejects the opposite NEL and DTL platforms', () => {
    expect(isCorrectDirection('punggol-nel', 'Punggol Coast')).toBe(false);
    expect(isCorrectDirection('punggol-nel', 'HarbourFront')).toBe(true);
    expect(isCorrectDirection('little-india-dtl', 'Bukit Panjang')).toBe(false);
    expect(isCorrectDirection('little-india-dtl', 'Expo')).toBe(true);
  });

  it('makes Punggol a continuous physical two-sided platform choice', () => {
    const map = JSON.parse(punggolMapSource) as {
      layers: Array<{
        name: string;
        objects: Array<{
          name: string;
          properties?: Array<{ name: string; value: string }>;
        }>;
      }>;
    };
    const interactions = map.layers.find((layer) => layer.name === 'Interactions')!.objects;
    const directions = interactions
      .filter((object) => object.properties?.some((property) => property.name === 'action' && property.value === 'choose-direction'))
      .map((object) => object.properties?.find((property) => property.name === 'direction')?.value);
    const spawns = map.layers.find((layer) => layer.name === 'Spawns')!.objects.map((object) => object.name);
    expect(directions).toEqual(expect.arrayContaining(['Punggol Coast', 'HarbourFront']));
    expect(spawns).toEqual(expect.arrayContaining([
      'train-start',
      'train-stop',
      'opposite-train-start',
      'opposite-train-stop',
    ]));
  });

  it('ships NEL and DTL as separate base, train, and RGBA door layers', () => {
    [
      'punggol-nel-platform-base.png',
      'little-india-dtl-platform-base.png',
    ].forEach((filename) => {
      const png = readFileSync(`public/scenes/scene4/environments/${filename}`);
      expect(png.readUInt32BE(16), `${filename} width`).toBeGreaterThanOrEqual(2170);
      expect(png.readUInt32BE(20), `${filename} height`).toBeGreaterThanOrEqual(720);
    });
    [
      'punggol-nel-platform-doors-closed.png',
      'punggol-nel-platform-doors-open.png',
      'little-india-dtl-platform-doors-closed.png',
      'little-india-dtl-platform-doors-open.png',
    ].forEach((filename) => {
      const png = readFileSync(`public/scenes/scene4/environments/${filename}`);
      expect(png.readUInt8(25), `${filename} must be RGBA`).toBe(6);
    });
  });

  it('ends only after the Downtown Line leg', () => {
    expect(nextRailLeg('kadaloor-lrt')).toBe('punggol-nel');
    expect(nextRailLeg('punggol-nel')).toBe('little-india-dtl');
    expect(nextRailLeg('little-india-dtl')).toBeUndefined();
  });

  it('authors every rail station as a complete Tiled gameplay map', () => {
    const requiredLayers = [
      'Reference',
      'Environment',
      'Collision',
      'Interactions',
      'Spawns',
      'Paths',
      'Camera',
    ];
    railMaps.forEach((map) => {
      expect(map.layers.map((layer) => layer.name)).toEqual(
        expect.arrayContaining(['BackgroundArt', ...requiredLayers]),
      );
      const spawns = map.layers.find((layer) => layer.name === 'Spawns')!;
      expect(spawns.objects.map((object) => object.name)).toEqual(
        expect.arrayContaining([
          'player-start',
          'train-start',
          'train-stop',
          'train-exit',
        ]),
      );
      expect(
        map.properties.find((property) => property.name === 'direction')?.value,
      ).toBeTruthy();
    });
  });

  it('requires a tap-out reader before the rear bus exit', () => {
    const busMap = JSON.parse(busInteriorMapSource) as {
      layers: Array<{
        name: string;
        objects: Array<{ name: string; x: number }>;
      }>;
    };
    const interactions = busMap.layers.find(
      (layer) => layer.name === 'Interactions',
    )!.objects;
    const reader = interactions.find(
      (object) => object.name === 'SimplyGo exit reader',
    );
    const exit = interactions.find(
      (object) => object.name === 'Exit door destination',
    );
    expect(reader).toBeDefined();
    expect(exit).toBeDefined();
    expect(reader!.x).toBeLessThan(exit!.x);
  });

  it('ships complete full-width panorama art for every rail map', () => {
    [
      'kadaloor-lrt-platform.png',
      'punggol-nel-platform-base.png',
      'little-india-dtl-platform-base.png',
      'kadaloor-lrt-concourse.png',
      'kadaloor-lrt-stairs.png',
      'punggol-interchange-concourse.png',
      'little-india-nel-platform.png',
      'little-india-transfer-concourse.png',
      'expo-dtl-platform.png',
    ].forEach((filename) => {
      const png = readFileSync(
        `public/scenes/scene4/environments/${filename}`,
      );
      expect(png.readUInt32BE(16), `${filename} width`).toBeGreaterThanOrEqual(2170);
      expect(png.readUInt32BE(20), `${filename} height`).toBeGreaterThanOrEqual(720);
    });
  });

  it('ships raster train art for every rail service', () => {
    [
      'punggol-lrt-train.png', 'punggol-lrt-train-doors-open.png',
      'nel-train.png', 'nel-train-doors-open.png',
      'dtl-train.png', 'dtl-train-doors-open.png',
    ].forEach((filename) => {
      const png = readFileSync(`public/scenes/scene4/vehicles/${filename}`);
      expect(png.readUInt32BE(16), `${filename} width`).toBeGreaterThanOrEqual(2000);
      expect(png.readUInt32BE(20), `${filename} cropped height`).toBeGreaterThanOrEqual(150);
      expect(png.readUInt32BE(20), `${filename} cropped height`).toBeLessThan(450);
      expect(png.readUInt8(25), `${filename} must be RGBA`).toBe(6);
    });
  });

  it('ships a high-resolution MRT system map for the persistent reference control', () => {
    const png = readFileSync('public/scenes/scene4/reference/singapore-rail-network-map.png');
    expect(png.readUInt32BE(16)).toBeGreaterThanOrEqual(1600);
    expect(png.readUInt32BE(20)).toBeGreaterThanOrEqual(1600);
  });

  it('ships the transparent MRT staff sprite used for the Expo terminal reminder', () => {
    const png = readFileSync('public/scenes/scene4/characters/mrt-staff-walk-right.png');
    expect(png.readUInt32BE(16)).toBeGreaterThanOrEqual(600);
    expect(png.readUInt32BE(20)).toBeGreaterThanOrEqual(1000);
    expect(png.readUInt8(25), 'MRT staff sprite must be RGBA').toBe(6);
  });

  it('ships the realistic Punggol fare-gate housing and animated fan flaps with alpha', () => {
    [
      'punggol-fare-gate-reader.png',
      'punggol-fare-gate-flaps-closed.png',
      'punggol-fare-gate-flaps-open.png',
    ].forEach((filename) => {
      const png = readFileSync(`public/scenes/scene4/props/${filename}`);
      expect(png.readUInt32BE(16), `${filename} width`).toBeGreaterThan(500);
      expect(png.readUInt32BE(20), `${filename} height`).toBeGreaterThan(500);
      expect(png.readUInt8(25), `${filename} must be RGBA`).toBe(6);
    });
  });
});
