import { describe, expect, it } from 'vitest';
import {
  buildsMatch,
  diagnoseBuild,
  getBuildHint,
  KOPI_RECIPES,
  recipeById,
  shuffledShift,
} from './kopiRecipes';

describe('kopitiam recipe system', () => {
  it('models O and kosong independently', () => {
    expect(recipeById('kopi-o').ingredients).toContain('sugar');
    expect(recipeById('kopi-o').ingredients).not.toContain('condensed');
    expect(recipeById('kopi-o-kosong').ingredients).not.toContain('sugar');
  });

  it('accepts ingredients in any tapping order but rejects extras', () => {
    const expected = recipeById('kopi-c').ingredients;
    expect(buildsMatch([...expected].reverse(), expected)).toBe(true);
    expect(buildsMatch([...expected, 'ice'], expected)).toBe(false);
  });

  it('reports missing and extra ingredients for useful feedback', () => {
    expect(diagnoseBuild(['coffee', 'sugar'], ['coffee', 'evaporated'])).toEqual({
      missing: ['evaporated'],
      extra: ['sugar'],
    });
  });

  it('keeps the guided first order fixed and serves six distinct recipes', () => {
    const shift = shuffledShift(() => 0.5);
    expect(shift[0].id).toBe('kopi');
    expect(new Set(shift.map((item) => item.id)).size).toBe(6);
  });

  it('keeps every recipe inside the simple ingredient tray', () => {
    const allowed = new Set([
      'coffee',
      'tea',
      'milo',
      'condensed',
      'evaporated',
      'sugar',
      'ice',
      'milo-top',
    ]);
    expect(KOPI_RECIPES.every((item) => item.ingredients.every((id) => allowed.has(id)))).toBe(true);
  });

  it('uses the same O, C, kosong, and peng grammar for teh', () => {
    expect(recipeById('teh-o-kosong-peng').ingredients).toEqual(['tea', 'ice']);
    expect(recipeById('teh-c').ingredients).toEqual(['tea', 'evaporated', 'sugar', 'sugar']);
  });

  it('makes Milo Dinosaur with ice and Milo powder on top', () => {
    expect(recipeById('milo-dinosaur').ingredients).toEqual([
      'milo',
      'condensed',
      'condensed',
      'ice',
      'milo-top',
    ]);
  });

  it('compares repeated portions by quantity', () => {
    expect(buildsMatch(['coffee', 'condensed'], recipeById('kopi').ingredients)).toBe(false);
    expect(buildsMatch(['condensed', 'coffee', 'condensed'], recipeById('kopi').ingredients)).toBe(true);
    expect(diagnoseBuild(['coffee', 'condensed'], recipeById('kopi').ingredients).missing).toEqual([
      'condensed',
    ]);
  });

  it('reveals one missing portion per hint', () => {
    expect(getBuildHint(['coffee'], recipeById('kopi').ingredients)).toEqual({
      kind: 'add',
      ingredient: 'condensed',
    });
  });

  it('requires a restart when an impossible ingredient was added', () => {
    expect(getBuildHint(['coffee', 'tea'], recipeById('kopi').ingredients)).toEqual({
      kind: 'restart',
      ingredient: 'tea',
    });
  });

  it('accepts a correct drink regardless of ingredient order', () => {
    expect(getBuildHint(['condensed', 'coffee', 'condensed'], recipeById('kopi').ingredients)).toEqual({
      kind: 'ready',
    });
  });
});
