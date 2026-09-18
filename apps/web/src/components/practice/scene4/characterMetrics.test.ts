import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  PLAYER_ANCHORS,
  PLAYER_ART_SPEC,
  PLAYER_TARGET_HEIGHT,
  RAIL_SEAT_ANCHORS,
  playerScaleFor,
  playerVisualMetrics,
  seatedHipY,
  VISUAL_TOLERANCES,
} from './characterMetrics';

describe('Scene 4 character metrics', () => {
  it('keeps every player source aligned to the canonical 768px height', () => {
    [
      'player-walk-right.png',
      'player-walk-front.png',
      'player-walk-back.png',
      'player-seated-front.png',
    ].forEach((filename) => {
      const png = readFileSync(`public/scenes/scene4/characters/${filename}`);
      expect(png.readUInt32BE(20), `${filename} height`).toBe(PLAYER_ART_SPEC.sourceHeight);
    });
  });

  it('derives every environment scale from a named target world height', () => {
    Object.entries(PLAYER_TARGET_HEIGHT).forEach(([profile, targetHeight]) => {
      expect(playerScaleFor(profile as keyof typeof PLAYER_TARGET_HEIGHT))
        .toBeCloseTo(targetHeight / PLAYER_ART_SPEC.sourceHeight, 6);
    });
  });

  it('uses pose-specific foot anchors and normalized body anchors', () => {
    expect(PLAYER_ANCHORS.walkingFeet).toEqual({ x: 0.5, y: 0.965 });
    expect(PLAYER_ANCHORS.seatedFeet).toEqual({ x: 0.5, y: 0.995 });
    Object.values(PLAYER_ANCHORS).forEach(({ x, y }) => {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(1);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(1);
    });
  });

  it('locks visual height and foot contact for every environment profile', () => {
    const representativeFloors = {
      exterior: 660,
      station: 660,
      escalator: 330,
      'bus-standing': 670,
      'bus-seated': 635,
      'rail-standing': 660,
      'rail-seated': 560,
    } as const;

    Object.entries(representativeFloors).forEach(([profile, floorY]) => {
      const typedProfile = profile as keyof typeof representativeFloors;
      const metrics = playerVisualMetrics(typedProfile, floorY);
      expect(metrics.displayHeight).toBe(PLAYER_TARGET_HEIGHT[typedProfile]);
      expect(metrics.footY).toBe(floorY);
      expect(metrics.spriteTopY).toBeLessThan(floorY);
      expect(metrics.transparentPaddingBelowFeet).toBeLessThanOrEqual(
        metrics.displayHeight * 0.04,
      );
    });
  });

  it('authors every rail carriage seat outside the scene component', () => {
    Object.entries(RAIL_SEAT_ANCHORS).forEach(([legId, seats]) => {
      expect(seats).toHaveLength(9);
      expect(new Set(seats.map((seat) => seat.x)).size).toBe(9);
      expect(seats[0].x).toBeGreaterThanOrEqual(760);
      seats.forEach((seat) => {
        expect(seat.id).toContain(legId);
        expect(seat.hipY).toBeGreaterThan(0);
        expect(seat.footFloorY).toBeGreaterThan(seat.hipY);
        expect(seat.scaleProfile).toBe('rail-seated');
        expect(Math.abs(seatedHipY('rail-seated', seat.footFloorY) - seat.hipY))
          .toBeLessThanOrEqual(VISUAL_TOLERANCES.seatHipPx);
      });
    });
  });

  it('keeps authored bus hips aligned with the seated sprite', () => {
    const map = JSON.parse(
      readFileSync('public/scenes/scene4/maps/service-50-interior.tmj', 'utf8'),
    ) as {
      layers: Array<{
        name: string;
        objects?: Array<{
          y: number;
          properties?: Array<{ name: string; value: number }>;
        }>;
      }>;
    };
    const seats = map.layers.find((layer) => layer.name === 'Seats')?.objects ?? [];
    seats.forEach((seat) => {
      const footFloorY = seat.properties?.find((property) => property.name === 'footFloorY')?.value;
      expect(footFloorY).toBeDefined();
      expect(Math.abs(seatedHipY('bus-seated', footFloorY!) - seat.y))
        .toBeLessThanOrEqual(VISUAL_TOLERANCES.seatHipPx);
    });
  });
});
