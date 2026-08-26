export const INGREDIENTS = [
  { id: 'coffee', label: 'Ready kopi', shortLabel: 'Kopi', icon: '☕', image: '/scenes/scene2/game/ingredients/ready-kopi.png' },
  { id: 'tea', label: 'Ready teh', shortLabel: 'Teh', icon: '🫖', image: '/scenes/scene2/game/ingredients/ready-teh.png' },
  { id: 'milo', label: 'Ready Milo', shortLabel: 'Milo', icon: '🍫', image: '/scenes/scene2/game/ingredients/ready-milo.png' },
  { id: 'condensed', label: 'Condensed milk', shortLabel: 'Condensed', icon: '🥛', image: '/scenes/scene2/game/ingredients/condensed-milk-spoon.png' },
  { id: 'evaporated', label: 'Evaporated milk', shortLabel: 'Evaporated', icon: '🥫', image: undefined },
  { id: 'sugar', label: 'Sugar', shortLabel: 'Sugar', icon: '🥄', image: undefined },
  { id: 'ice', label: 'Ice cubes', shortLabel: 'Ice', icon: '🧊', image: undefined },
  { id: 'milo-top', label: 'Milo powder', shortLabel: 'Milo topping', icon: '🦕', image: undefined },
] as const;

export type IngredientId = (typeof INGREDIENTS)[number]['id'];
export type RecipeFamily = 'Kopi' | 'Teh' | 'Milo';

export interface KopiRecipe {
  id: string;
  name: string;
  family: RecipeFamily;
  ingredients: IngredientId[];
  description: string;
  code: string;
  difficulty: 1 | 2 | 3;
}

const portions = (id: IngredientId, count: number): IngredientId[] =>
  Array.from({ length: count }, () => id);

const recipe = (
  id: string,
  name: string,
  family: RecipeFamily,
  ingredients: IngredientId[],
  description: string,
  code: string,
  difficulty: 1 | 2 | 3,
): KopiRecipe => ({ id, name, family, ingredients, description, code, difficulty });

/**
 * One drag represents one stall portion. Standard sweetness uses two portions,
 * siew dai uses one, gah dai uses three, and kosong uses none. These are game
 * units rather than universal measurements because exact ratios vary by stall.
 */
export const KOPI_RECIPES: KopiRecipe[] = [
  recipe('kopi', 'Kopi', 'Kopi', ['coffee', ...portions('condensed', 2)], 'Kopi with two portions of condensed milk.', 'Default = 2 condensed', 1),
  recipe('kopi-siew-dai', 'Kopi Siew Dai', 'Kopi', ['coffee', 'condensed'], 'Kopi with one portion of condensed milk.', 'Siew dai = 1 sweet portion', 2),
  recipe('kopi-gah-dai', 'Kopi Gah Dai', 'Kopi', ['coffee', ...portions('condensed', 3)], 'Kopi with three portions of condensed milk.', 'Gah dai = 3 sweet portions', 2),
  recipe('kopi-o', 'Kopi O', 'Kopi', ['coffee', ...portions('sugar', 2)], 'Black kopi with two portions of sugar.', 'O = no milk', 1),
  recipe('kopi-o-siew-dai', 'Kopi O Siew Dai', 'Kopi', ['coffee', 'sugar'], 'Black kopi with one portion of sugar.', 'O + siew dai', 2),
  recipe('kopi-o-kosong', 'Kopi O Kosong', 'Kopi', ['coffee'], 'Black kopi with no milk and no sugar.', 'Kosong = no sugar', 1),
  recipe('kopi-c', 'Kopi C', 'Kopi', ['coffee', 'evaporated', ...portions('sugar', 2)], 'Kopi with evaporated milk and two portions of sugar.', 'C = evaporated milk', 2),
  recipe('kopi-c-siew-dai', 'Kopi C Siew Dai', 'Kopi', ['coffee', 'evaporated', 'sugar'], 'Kopi with evaporated milk and one portion of sugar.', 'C + siew dai', 2),
  recipe('kopi-c-kosong', 'Kopi C Kosong', 'Kopi', ['coffee', 'evaporated'], 'Kopi with evaporated milk and no sugar.', 'C + kosong', 2),
  recipe('kopi-peng', 'Kopi Peng', 'Kopi', ['coffee', ...portions('condensed', 2), 'ice'], 'Iced kopi with two portions of condensed milk.', 'Peng = ice', 1),
  recipe('kopi-o-peng', 'Kopi O Peng', 'Kopi', ['coffee', ...portions('sugar', 2), 'ice'], 'Iced black kopi with sugar.', 'O + peng', 2),
  recipe('kopi-o-kosong-peng', 'Kopi O Kosong Peng', 'Kopi', ['coffee', 'ice'], 'Iced black kopi with no sugar.', 'O + kosong + peng', 2),
  recipe('kopi-c-peng', 'Kopi C Peng', 'Kopi', ['coffee', 'evaporated', ...portions('sugar', 2), 'ice'], 'Iced kopi with evaporated milk and sugar.', 'C + peng', 3),
  recipe('kopi-c-kosong-peng', 'Kopi C Kosong Peng', 'Kopi', ['coffee', 'evaporated', 'ice'], 'Iced kopi with evaporated milk and no sugar.', 'C + kosong + peng', 3),

  recipe('teh', 'Teh', 'Teh', ['tea', ...portions('condensed', 2)], 'Teh with two portions of condensed milk.', 'Default = 2 condensed', 1),
  recipe('teh-siew-dai', 'Teh Siew Dai', 'Teh', ['tea', 'condensed'], 'Teh with one portion of condensed milk.', 'Siew dai = 1 sweet portion', 2),
  recipe('teh-gah-dai', 'Teh Gah Dai', 'Teh', ['tea', ...portions('condensed', 3)], 'Teh with three portions of condensed milk.', 'Gah dai = 3 sweet portions', 2),
  recipe('teh-o', 'Teh O', 'Teh', ['tea', ...portions('sugar', 2)], 'Black tea with two portions of sugar.', 'O = no milk', 1),
  recipe('teh-o-siew-dai', 'Teh O Siew Dai', 'Teh', ['tea', 'sugar'], 'Black tea with one portion of sugar.', 'O + siew dai', 2),
  recipe('teh-o-kosong', 'Teh O Kosong', 'Teh', ['tea'], 'Black tea with no milk and no sugar.', 'O + kosong', 1),
  recipe('teh-c', 'Teh C', 'Teh', ['tea', 'evaporated', ...portions('sugar', 2)], 'Tea with evaporated milk and two portions of sugar.', 'C = evaporated milk', 2),
  recipe('teh-c-siew-dai', 'Teh C Siew Dai', 'Teh', ['tea', 'evaporated', 'sugar'], 'Tea with evaporated milk and one portion of sugar.', 'C + siew dai', 2),
  recipe('teh-c-kosong', 'Teh C Kosong', 'Teh', ['tea', 'evaporated'], 'Tea with evaporated milk and no sugar.', 'C + kosong', 2),
  recipe('teh-peng', 'Teh Peng', 'Teh', ['tea', ...portions('condensed', 2), 'ice'], 'Iced tea with condensed milk.', 'Peng = ice', 1),
  recipe('teh-o-peng', 'Teh O Peng', 'Teh', ['tea', ...portions('sugar', 2), 'ice'], 'Iced black tea with sugar.', 'O + peng', 2),
  recipe('teh-o-kosong-peng', 'Teh O Kosong Peng', 'Teh', ['tea', 'ice'], 'Iced black tea with no sugar.', 'O + kosong + peng', 2),
  recipe('teh-c-peng', 'Teh C Peng', 'Teh', ['tea', 'evaporated', ...portions('sugar', 2), 'ice'], 'Iced tea with evaporated milk and sugar.', 'C + peng', 3),
  recipe('teh-c-kosong-peng', 'Teh C Kosong Peng', 'Teh', ['tea', 'evaporated', 'ice'], 'Iced tea with evaporated milk and no sugar.', 'C + kosong + peng', 3),

  recipe('milo', 'Milo', 'Milo', ['milo', ...portions('condensed', 2)], 'Prepared Milo with two portions of condensed milk.', 'Standard = 2 condensed', 1),
  recipe('milo-siew-dai', 'Milo Siew Dai', 'Milo', ['milo', 'condensed'], 'Prepared Milo with one portion of condensed milk.', 'Siew dai = 1 sweet portion', 2),
  recipe('milo-kosong', 'Milo Kosong', 'Milo', ['milo'], 'Prepared Milo without added condensed milk or sugar.', 'Kosong = no added sweetener', 1),
  recipe('milo-peng', 'Milo Peng', 'Milo', ['milo', ...portions('condensed', 2), 'ice'], 'Iced Milo with condensed milk.', 'Peng = ice', 1),
  recipe('milo-kosong-peng', 'Milo Kosong Peng', 'Milo', ['milo', 'ice'], 'Iced Milo without added condensed milk.', 'Kosong + peng', 2),
  recipe('milo-dinosaur', 'Milo Dinosaur', 'Milo', ['milo', ...portions('condensed', 2), 'ice', 'milo-top'], 'Iced Milo topped with extra Milo powder.', 'Dinosaur = Milo powder on top', 3),
];

export const SHIFT_RECIPE_IDS = [
  'kopi',
  'kopi-o-siew-dai',
  'teh-c-kosong',
  'teh-gah-dai',
  'milo-kosong-peng',
  'milo-dinosaur',
] as const;

export function recipeById(id: string): KopiRecipe {
  const found = KOPI_RECIPES.find((item) => item.id === id);
  if (!found) throw new Error(`Unknown drink recipe: ${id}`);
  return found;
}

function countsOf(items: IngredientId[]): Map<IngredientId, number> {
  const counts = new Map<IngredientId, number>();
  items.forEach((item) => counts.set(item, (counts.get(item) ?? 0) + 1));
  return counts;
}

export function buildsMatch(actual: IngredientId[], expected: IngredientId[]): boolean {
  if (actual.length !== expected.length) return false;
  const actualCounts = countsOf(actual);
  const expectedCounts = countsOf(expected);
  return INGREDIENTS.every(({ id }) => actualCounts.get(id) === expectedCounts.get(id));
}

export function diagnoseBuild(actual: IngredientId[], expected: IngredientId[]) {
  const actualCounts = countsOf(actual);
  const expectedCounts = countsOf(expected);
  const missing: IngredientId[] = [];
  const extra: IngredientId[] = [];

  INGREDIENTS.forEach(({ id }) => {
    const difference = (expectedCounts.get(id) ?? 0) - (actualCounts.get(id) ?? 0);
    const target = difference > 0 ? missing : extra;
    for (let index = 0; index < Math.abs(difference); index += 1) target.push(id);
  });

  return { missing, extra };
}

export type BuildHint =
  | { kind: 'add'; ingredient: IngredientId }
  | { kind: 'restart'; ingredient: IngredientId }
  | { kind: 'ready' };

/** One hint reveals one action. Any impossible extra means the cup must restart. */
export function getBuildHint(actual: IngredientId[], expected: IngredientId[]): BuildHint {
  const { missing, extra } = diagnoseBuild(actual, expected);
  if (extra[0]) return { kind: 'restart', ingredient: extra[0] };
  if (missing[0]) return { kind: 'add', ingredient: missing[0] };
  return { kind: 'ready' };
}

export function shuffledShift(random = Math.random): KopiRecipe[] {
  const tutorial = recipeById(SHIFT_RECIPE_IDS[0]);
  const rest = SHIFT_RECIPE_IDS.slice(1)
    .map(recipeById)
    .map((item) => ({ item, sort: random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
  return [tutorial, ...rest];
}
