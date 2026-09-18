import { expect, test, type Page } from '@playwright/test';

const progress = {
  schemaVersion: 1, xp: 0, streakDays: 0, lastActiveDate: '',
  completedChallengeIds: [], completedLessonIds: [], completedMissionIds: ['move'],
  unlockedMissionIds: ['move'], earnedBadgeIds: [], aiPracticeHistory: {},
  unlockedPhraseIds: [], unlockedCultureTopicIds: [], phraseMastery: {},
};

const commuteCanvas = (page: Page) => page.locator(
  'canvas[aria-label="Scene 4 walkable commute game"]',
);

async function openJourney(page: Page) {
  await page.addInitScript((state) => localStorage.setItem('sgmode:progress:v1', JSON.stringify(state)), progress);
  await page.goto('/practice/commute-to-changi');
  await expect(commuteCanvas(page)).toBeVisible();
  await commuteCanvas(page).click();
}

async function waitForContext(page: Page, context: string, timeout = 15_000) {
  await expect(page.locator('[data-commute-context]')).toHaveAttribute('data-commute-context', context, { timeout });
}

async function hold(page: Page, key: 'ArrowLeft' | 'ArrowRight' | 'ArrowUp', duration: number) {
  await page.keyboard.down(key);
  await page.waitForTimeout(duration);
  await page.keyboard.up(key);
}

async function holdUntilContext(
  page: Page,
  key: 'ArrowLeft' | 'ArrowRight' | 'ArrowUp',
  context: string,
  timeout = 15_000,
) {
  await page.keyboard.down(key);
  try {
    await waitForContext(page, context, timeout);
  } finally {
    await page.keyboard.up(key);
  }
}

async function clickFareGate(page: Page, chooseNearest = true) {
  const canvas = commuteCanvas(page);
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error('Commute canvas has no bounds');
  const debug = await canvas.evaluate((element) => (
    JSON.parse((element as HTMLCanvasElement).dataset.scene4Debug ?? '{}')
  ));
  const entryGates = (debug.fareGateReaders ?? []).filter((gate: { entry: boolean }) => gate.entry);
  expect(entryGates.length).toBeGreaterThan(1);
  const gate = chooseNearest
    ? entryGates.sort((a: { x: number }, b: { x: number }) => (
        Math.abs(a.x - debug.playerX) - Math.abs(b.x - debug.playerX)
      ))[0]
    : entryGates[entryGates.length - 1];
  await canvas.click({
    position: {
      x: (gate.x - debug.cameraX) * (bounds.width / 1280),
      y: (gate.y - debug.cameraY) * (bounds.height / 720),
    },
  });
  return gate.index as number;
}

async function moveNearFareGate(page: Page) {
  const debug = await commuteCanvas(page).evaluate((element) => (
    JSON.parse((element as HTMLCanvasElement).dataset.scene4Debug ?? '{}')
  ));
  const gates = (debug.fareGateReaders ?? []).filter((gate: { entry: boolean }) => gate.entry);
  const nearest = gates.sort((a: { x: number }, b: { x: number }) => (
    Math.abs(a.x - debug.playerX) - Math.abs(b.x - debug.playerX)
  ))[0];
  if (!nearest) throw new Error('No usable fare gate is available');
  const distance = Math.abs(nearest.x - debug.playerX);
  if (distance > 90) {
    await hold(
      page,
      debug.playerX < nearest.x ? 'ArrowRight' : 'ArrowLeft',
      Math.max(150, Math.ceil((distance - 80) / 0.2)),
    );
  }
}

async function clickBusFareReader(page: Page, reader: 'entry' | 'exit') {
  const canvas = commuteCanvas(page);
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error('Commute canvas has no bounds');
  const debug = await canvas.evaluate((element) => (
    JSON.parse((element as HTMLCanvasElement).dataset.scene4Debug ?? '{}')
  ));
  const target = debug.fareReaders?.[reader];
  if (!target?.visible) throw new Error(`${reader} fare reader is not visible`);
  await canvas.click({
    position: {
      x: (target.x - debug.cameraX) * (bounds.width / 1280),
      y: (target.y + 59 - debug.cameraY) * (bounds.height / 720),
    },
  });
}

async function board(page: Page, boardingContext: string) {
  await waitForContext(page, boardingContext, boardingContext === 'nel-boarding' ? 35_000 : 15_000);
  if (boardingContext === 'nel-boarding' || boardingContext === 'dtl-boarding') {
    await expect.poll(async () => commuteCanvas(page).evaluate((element) => {
      const layering = JSON.parse((element as HTMLCanvasElement).dataset.scene4Debug ?? '{}').railLayering;
      return [
        layering?.train?.depth < layering?.platformDoors?.depth,
        layering?.train?.masked,
        layering?.platformDoors?.texture?.includes('doors-open'),
      ];
    })).toEqual([true, true, true]);
  }
  await page.getByRole('button', { name: /INTERACT/ }).click();
}

async function alightThroughOpenDoor(page: Page, destinationContext: string) {
  const playerX = await commuteCanvas(page).evaluate((element) => (
    JSON.parse((element as HTMLCanvasElement).dataset.scene4Debug ?? '{}').playerX as number
  ));
  const railDoorCenterX = 1580;
  const horizontalDistance = Math.abs(railDoorCenterX - playerX);
  if (horizontalDistance > 30) {
    await hold(
      page,
      playerX < railDoorCenterX ? 'ArrowRight' : 'ArrowLeft',
      Math.min(5_500, Math.ceil(horizontalDistance / 0.2)),
    );
  }
  await holdUntilContext(page, 'ArrowUp', destinationContext, 20_000);
}

async function finishExpoToOffice(page: Page) {
  await holdUntilContext(page, 'ArrowRight', 'expo-fare-gates', 20_000);
  await page.waitForTimeout(700);
  await moveNearFareGate(page);
  await clickFareGate(page);
  await waitForContext(page, 'expo-gates-open');
  await page.waitForTimeout(700);
  await hold(page, 'ArrowRight', 750);
  await holdUntilContext(page, 'ArrowUp', 'expo-exit', 15_000);
  await page.waitForTimeout(600);
  await holdUntilContext(page, 'ArrowRight', 'office-walk', 20_000);
  await page.waitForTimeout(600);
  await holdUntilContext(page, 'ArrowRight', 'complete', 20_000);
}

async function playSharedRailJourney(page: Page) {
  const punggolContext = await page.locator('[data-commute-context]').getAttribute('data-commute-context');
  if (punggolContext === 'punggol-gates') {
    const gateReaders = await commuteCanvas(page).evaluate((element) => (
      JSON.parse((element as HTMLCanvasElement).dataset.scene4Debug ?? '{}').fareGateReaders
    ));
    expect(gateReaders.map((reader: { x: number }) => reader.x)).toEqual([
      600, 785, 970, 1155, 1340, 1525,
    ]);
    expect(gateReaders.map((reader: { entry: boolean }) => reader.entry)).toEqual([
      true, true, true, false, false, false,
    ]);
    const gateVisualsBefore = await commuteCanvas(page).evaluate((element) => (
      JSON.parse((element as HTMLCanvasElement).dataset.scene4Debug ?? '{}').fareGateVisuals
    ));
    expect(gateVisualsBefore).toHaveLength(5);
    expect(gateVisualsBefore.map((gate: { x: number }) => gate.x)).toEqual([
      693, 878, 1063, 1248, 1433,
    ]);
    expect(gateVisualsBefore.every((gate: { width: number; height: number; texture: string }) => (
      gate.width === 135
      && gate.height === 60
      && gate.texture === 'scene4-punggol-fare-door-closed'
    ))).toBe(true);
    const gatePosts = await commuteCanvas(page).evaluate((element) => (
      JSON.parse((element as HTMLCanvasElement).dataset.scene4Debug ?? '{}').fareGatePosts
    ));
    expect(gatePosts.map((post: { x: number }) => post.x)).toEqual([
      600, 785, 970, 1155, 1340, 1525,
    ]);
    expect(gatePosts.every((post: { width: number; height: number }) => (
      post.width === 60 && post.height === 170
    ))).toBe(true);
    await hold(page, 'ArrowRight', 2_500);
    const openedGate = await clickFareGate(page);
    await waitForContext(page, 'punggol-gates-open');
    await expect.poll(async () => commuteCanvas(page).evaluate((element) => (
      JSON.parse((element as HTMLCanvasElement).dataset.scene4Debug ?? '{}').openedFareGate
    ))).toBe(openedGate);
    await expect.poll(async () => commuteCanvas(page).evaluate((element, selectedIndex) => {
      const gateVisuals = JSON.parse(
        (element as HTMLCanvasElement).dataset.scene4Debug ?? '{}',
      ).fareGateVisuals;
      return gateVisuals.map((gate: { width: number; height: number; texture: string }, index: number) => ({
        width: gate.width,
        height: gate.height,
        texture: gate.texture,
        selected: index === selectedIndex,
      }));
    }, openedGate)).toEqual(gateVisualsBefore.map((gate: { width: number; height: number }, index: number) => ({
      width: gate.width,
      height: gate.height,
      texture: index === openedGate
        ? 'scene4-punggol-fare-door-open'
        : 'scene4-punggol-fare-door-closed',
      selected: index === openedGate,
    })));
    await page.waitForTimeout(700);
    await expect(page.locator('[data-commute-context]')).toHaveAttribute(
      'data-commute-context',
      'punggol-gates-open',
    );
    await hold(page, 'ArrowRight', 300);
    await holdUntilContext(page, 'ArrowUp', 'punggol-escalator');
  } else {
    await holdUntilContext(page, 'ArrowRight', 'punggol-escalator');
  }
  await expect.poll(async () => commuteCanvas(page).evaluate((element) => {
    const debug = JSON.parse((element as HTMLCanvasElement).dataset.scene4Debug ?? '{}');
    return [debug.escalatorRideStarted, debug.escalatorAnimationRuns];
  })).toEqual([false, 0]);
  await page.waitForTimeout(600);
  await expect(page.locator('[data-commute-context]')).toHaveAttribute(
    'data-commute-context',
    'punggol-escalator',
  );
  await holdUntilContext(page, 'ArrowRight', 'punggol-escalator-riding');
  await expect.poll(async () => commuteCanvas(page).evaluate((element) => {
    const debug = JSON.parse((element as HTMLCanvasElement).dataset.scene4Debug ?? '{}');
    return [debug.escalatorRideStarted, debug.escalatorAnimationRuns];
  }), { timeout: 3_000 }).toEqual([true, 1]);
  await waitForContext(page, 'nel-transfer');
  await expect.poll(async () => commuteCanvas(page).evaluate((element) => (
    JSON.parse((element as HTMLCanvasElement).dataset.scene4Debug ?? '{}').nelLiveBoard?.harbourFrontText
  ))).toContain('2 min');
  await expect.poll(async () => commuteCanvas(page).evaluate((element) => (
    JSON.parse((element as HTMLCanvasElement).dataset.scene4Debug ?? '{}').nelLiveBoard?.harbourFrontText
  )), { timeout: 25_000 }).toContain('1 min');
  await expect(page.getByRole('button', { name: 'TOWARDS HARBOURFRONT' })).toBeVisible();
  await page.getByRole('button', { name: 'TOWARDS PUNGGOL COAST' }).click();
  await waitForContext(page, 'nel-wrong-direction');
  await page.getByRole('button', { name: 'TOWARDS HARBOURFRONT' }).click();
  await board(page, 'nel-boarding');
  await expect(page.locator('[data-rail-stop]')).toHaveAttribute('data-rail-stop', 'Sengkang', { timeout: 10_000 });
  await expect.poll(async () => commuteCanvas(page).evaluate((element) => {
    const debug = JSON.parse((element as HTMLCanvasElement).dataset.scene4Debug ?? '{}');
    return [debug.mode, debug.playerVisible];
  })).toEqual(['rail-interior', true]);
  await expect(page.locator('[data-rail-stop]')).toHaveAttribute('data-rail-stop', 'Little India', { timeout: 50_000 });
  await alightThroughOpenDoor(page, 'little-india-alight');
  await hold(page, 'ArrowRight', 8_000);
  await waitForContext(page, 'little-india-transfer');
  await hold(page, 'ArrowRight', 8_500);
  await waitForContext(page, 'dtl-transfer');
  await expect(page.getByRole('button', { name: 'TOWARDS EXPO' })).toBeVisible();
  await page.getByRole('button', { name: 'TOWARDS EXPO' }).click();
  await board(page, 'dtl-boarding');
  await expect(page.locator('[data-rail-stop]')).toHaveAttribute('data-rail-stop', 'Rochor', { timeout: 10_000 });
  await expect.poll(async () => commuteCanvas(page).evaluate((element) => {
    const debug = JSON.parse((element as HTMLCanvasElement).dataset.scene4Debug ?? '{}');
    return [debug.mode, debug.playerVisible];
  })).toEqual(['rail-interior', true]);
  await expect(page.locator('[data-rail-stop]')).toHaveAttribute('data-rail-stop', 'Expo', { timeout: 120_000 });
  await alightThroughOpenDoor(page, 'expo-alight');
  await finishExpoToOffice(page);
}

test('keeps the complete commute responsive on a phone viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openJourney(page);
  const layout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    touchControls: Boolean(document.querySelector('[aria-label="Touch movement controls"]')),
  }));
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth);
  expect(layout.touchControls).toBe(true);

  const before = await commuteCanvas(page).evaluate((element) => (
    JSON.parse((element as HTMLCanvasElement).dataset.scene4Debug ?? '{}').playerX as number
  ));
  await page.getByRole('button', { name: 'Walk left' }).click();
  await expect.poll(async () => commuteCanvas(page).evaluate((element) => (
    JSON.parse((element as HTMLCanvasElement).dataset.scene4Debug ?? '{}').playerX as number
  ))).toBeLessThan(before);
});

for (const viewport of [
  { name: 'small desktop', width: 1024, height: 768 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'wide desktop', width: 1440, height: 900 },
]) {
  test(`keeps critical journey controls visible on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await openJourney(page);
    await expect(commuteCanvas(page)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open Singapore MRT map' })).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
  });
}

test('honours reduced motion without blocking spatial progress', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openJourney(page);
  await expect.poll(async () => commuteCanvas(page).evaluate((element) => (
    JSON.parse((element as HTMLCanvasElement).dataset.scene4Debug ?? '{}').reducedMotion
  ))).toBe(true);
  const before = await commuteCanvas(page).evaluate((element) => (
    JSON.parse((element as HTMLCanvasElement).dataset.scene4Debug ?? '{}').playerX as number
  ));
  await hold(page, 'ArrowLeft', 300);
  await expect.poll(async () => commuteCanvas(page).evaluate((element) => (
    JSON.parse((element as HTMLCanvasElement).dataset.scene4Debug ?? '{}').playerX as number
  ))).toBeLessThan(before);
});

test('taps out at Expo with movement plus semantic interaction', async ({ page }) => {
  await openJourney(page);
  await page.getByRole('combobox', { name: 'Scene 4 development checkpoint' })
    .selectOption('expo-fare-gates');
  await waitForContext(page, 'expo-fare-gates');
  await page.waitForTimeout(700);
  await moveNearFareGate(page);
  await page.keyboard.press('e');
  await waitForContext(page, 'expo-gates-open');
});

test('faces front and back when walking vertically', async ({ page }) => {
  await openJourney(page);
  const canvas = commuteCanvas(page);
  const facing = () => canvas.evaluate((element) => (
    JSON.parse((element as HTMLCanvasElement).dataset.scene4Debug ?? '{}').playerFacing
  ));

  await hold(page, 'ArrowUp', 250);
  await expect.poll(facing).toBe('back');
  await hold(page, 'ArrowDown', 250);
  await expect.poll(facing).toBe('front');
  await hold(page, 'ArrowRight', 250);
  await expect.poll(facing).toBe('side');
});

test('keeps manual movement on the visible exterior floor', async ({ page }) => {
  await openJourney(page);
  await hold(page, 'ArrowUp', 2_000);
  const debug = await commuteCanvas(page).evaluate((element) => (
    JSON.parse((element as HTMLCanvasElement).dataset.scene4Debug ?? '{}')
  ));
  expect(debug.walkableFloorBounds).toMatchObject({ minX: 60, maxX: 2116, minY: 430, maxY: 700 });
  // The exterior collision body can stop his foot point slightly in front of
  // the hard floor limit, but he must never cross above that limit.
  expect(debug.playerY).toBeGreaterThanOrEqual(430);
  expect(debug.playerY).toBeLessThan(470);
});

test('keeps both bus fare readers mounted after the entry reader is used', async ({ page }) => {
  await openJourney(page);
  await page.getByRole('button', { name: 'RAISE HAND' }).click();
  await waitForContext(page, 'choose-item');

  const canvas = commuteCanvas(page);
  await expect.poll(async () => {
    const debug = await canvas.evaluate((element) => JSON.parse((element as HTMLCanvasElement).dataset.scene4Debug ?? '{}'));
    return [debug.fareReaders?.entry?.visible, debug.fareReaders?.exit?.visible];
  }).toEqual([true, true]);
  const beforeTap = await canvas.evaluate((element) => JSON.parse((element as HTMLCanvasElement).dataset.scene4Debug ?? '{}'));
  expect(beforeTap.fareReaders?.entry?.visible).toBe(true);
  expect(beforeTap.fareReaders?.exit?.visible).toBe(true);

  await page.getByRole('button', { name: 'Travel card' }).click();
  await hold(page, 'ArrowRight', 1_200);
  await expect(page.locator('[data-commute-context]')).toHaveAttribute('data-commute-context', 'item-selected');
  await clickBusFareReader(page, 'entry');
  await waitForContext(page, 'aisle');

  await expect.poll(async () => canvas.evaluate((element) => {
    const debug = JSON.parse((element as HTMLCanvasElement).dataset.scene4Debug ?? '{}');
    return [debug.carriedItem, debug.carriedItemVisible];
  })).toEqual([null, false]);
  await expect(page.getByLabel('Your bag')).toHaveCount(0);

  const afterTap = await canvas.evaluate((element) => JSON.parse((element as HTMLCanvasElement).dataset.scene4Debug ?? '{}'));
  expect(afterTap.fareReaders?.entry?.visible).toBe(true);
  expect(afterTap.fareReaders?.exit?.visible).toBe(true);
  expect(afterTap.fareReaders?.entry?.width).toBe(beforeTap.fareReaders?.entry?.width);
  expect(afterTap.fareReaders?.entry?.height).toBe(beforeTap.fareReaders?.entry?.height);
});

test('can stand up from a bus seat and resume walking without flickering', async ({ page }) => {
  await openJourney(page);
  await page.getByRole('combobox', { name: 'Scene 4 development checkpoint' })
    .selectOption('bus-seated');
  await expect.poll(async () => commuteCanvas(page).evaluate((element) => {
    const debug = JSON.parse((element as HTMLCanvasElement).dataset.scene4Debug ?? '{}');
    return [debug.seatedSeatIndex, debug.playerTexture];
  })).toEqual([0, 'scene4-player-sit-front']);

  await page.waitForTimeout(700);
  await page.keyboard.down('Space');
  try {
    await expect.poll(async () => commuteCanvas(page).evaluate((element) => {
      const debug = JSON.parse((element as HTMLCanvasElement).dataset.scene4Debug ?? '{}');
      return debug.seatedSeatIndex === null && debug.playerTexture === 'scene4-player-walk-front'
        ? debug.playerX
        : null;
    })).not.toBeNull();
  } finally {
    await page.keyboard.up('Space');
  }
  const standingX = await commuteCanvas(page).evaluate((element) => (
    JSON.parse((element as HTMLCanvasElement).dataset.scene4Debug ?? '{}').playerX as number
  ));
  await hold(page, 'ArrowLeft', 450);
  await expect.poll(async () => commuteCanvas(page).evaluate((element) => (
    JSON.parse((element as HTMLCanvasElement).dataset.scene4Debug ?? '{}').playerX
  ))).toBeLessThan(standingX);
});

test('LRT is a complete alternate route from Exit B to Punggol', async ({ page }) => {
  test.setTimeout(380_000);
  await openJourney(page);
  await hold(page, 'ArrowUp', 350);
  await hold(page, 'ArrowLeft', 4_500);
  await page.keyboard.down('ArrowDown');
  await page.waitForTimeout(350);
  await page.keyboard.up('ArrowDown');
  await hold(page, 'ArrowLeft', 2_500);
  await waitForContext(page, 'lrt-gates');
  await clickFareGate(page, false);
  await page.waitForTimeout(350);
  await expect(page.locator('[data-commute-context]')).toHaveAttribute('data-commute-context', 'lrt-gates');
  await hold(page, 'ArrowRight', 4_800);
  const openedGate = await clickFareGate(page);
  await waitForContext(page, 'lrt-gates-open');
  await expect.poll(async () => commuteCanvas(page).evaluate((element) => (
    JSON.parse((element as HTMLCanvasElement).dataset.scene4Debug ?? '{}').openedFareGate
  ))).toBe(openedGate);
  await hold(page, 'ArrowRight', 6_000);
  await waitForContext(page, 'lrt-stairs');
  await hold(page, 'ArrowRight', 9_000);
  await board(page, 'lrt-boarding');
  await expect(page.locator('[data-rail-stop]')).toHaveAttribute('data-rail-stop', 'Oasis', { timeout: 10_000 });
  await expect.poll(async () => commuteCanvas(page).evaluate((element) => {
    const debug = JSON.parse((element as HTMLCanvasElement).dataset.scene4Debug ?? '{}');
    return [debug.mode, debug.playerVisible];
  })).toEqual(['rail-interior', true]);
  await alightThroughOpenDoor(page, 'rail-wrong-stop');
  await waitForContext(page, 'rail-wrong-stop');
  await expect(page.locator('[data-rail-hearts]')).toHaveAttribute('data-rail-hearts', '2');
  await expect(page.locator('[data-last-wrong-rail-stop]')).toHaveAttribute(
    'data-last-wrong-rail-stop',
    /^(Oasis|Damai)$/,
  );
  await expect(page.locator('[data-rail-stop]')).toHaveAttribute('data-rail-stop', 'Punggol', { timeout: 20_000 });
  await alightThroughOpenDoor(page, 'punggol-transfer');
  await playSharedRailJourney(page);
  await expect(page.getByText('TCS · The Signature')).toBeVisible();
});

test('Bus 50 taps out at Punggol and never enters Kadaloor LRT', async ({ page }) => {
  test.setTimeout(380_000);
  await openJourney(page);
  await page.getByRole('button', { name: 'RAISE HAND' }).click();
  await waitForContext(page, 'choose-item');
  await page.getByRole('button', { name: 'Travel card' }).click();
  await hold(page, 'ArrowRight', 1_200);
  await clickBusFareReader(page, 'entry');
  await waitForContext(page, 'aisle');
  await hold(page, 'ArrowRight', 2_500);
  await waitForContext(page, 'bus-moving');
  const movingStart = await commuteCanvas(page).evaluate((element) => {
    const debug = JSON.parse((element as HTMLCanvasElement).dataset.scene4Debug ?? '{}');
    return { backgroundTexture: debug.backgroundTexture, playerX: debug.playerX };
  });
  expect(movingStart.backgroundTexture).toBe('scene4-service-50-interior-moving');
  await hold(page, 'ArrowLeft', 450);
  const movingPlayerX = await commuteCanvas(page).evaluate((element) => (
    JSON.parse((element as HTMLCanvasElement).dataset.scene4Debug ?? '{}').playerX
  ));
  expect(movingPlayerX).toBeLessThan(movingStart.playerX);
  await hold(page, 'ArrowRight', 450);
  await expect(page.locator('[data-bus-stop]')).toHaveAttribute('data-bus-stop', 'Oasis Stn Exit B / Blk 617D');
  await expect(page.locator('[data-bus-doors]')).toHaveAttribute('data-bus-doors', 'open');
  await expect(page.locator('[data-bus-doors]')).toHaveAttribute('data-bus-doors', 'closed');
  await expect(page.locator('[data-bus-stop]')).toHaveAttribute('data-bus-stop', 'Damai Stn Exit B');
  await expect(page.locator('[data-bus-doors]')).toHaveAttribute('data-bus-doors', 'open');
  await expect(page.locator('[data-bus-doors]')).toHaveAttribute('data-bus-doors', 'closed');
  await expect(page.locator('[data-bus-stop]')).toHaveAttribute('data-bus-stop', 'Punggol View Primary School');
  await expect(page.locator('[data-bus-doors]')).toHaveAttribute('data-bus-doors', 'open');
  await expect(page.locator('[data-bus-doors]')).toHaveAttribute('data-bus-doors', 'closed');
  await expect(page.locator('[data-bus-stop]')).toHaveAttribute('data-bus-stop', 'Punggol Interchange');
  await expect(page.locator('[data-bus-doors]')).toHaveAttribute('data-bus-doors', 'open');
  await waitForContext(page, 'choose-exit-item');
  await expect(page.getByLabel('Your bag')).toBeVisible();
  await waitForContext(page, 'last-stop-reminder');
  await expect(page.getByText('Tap out at the rear reader and get down here.')).toBeVisible();
  await holdUntilContext(page, 'ArrowRight', 'tap-out-warning');
  await expect(page.getByText('Tap out first')).toBeVisible();
  await page.getByRole('button', { name: 'Travel card' }).click();
  await waitForContext(page, 'exit-item-selected');
  await clickBusFareReader(page, 'exit');
  await waitForContext(page, 'exit-ok');
  await page.waitForTimeout(1_000);
  await hold(page, 'ArrowRight', 1_800);
  await waitForContext(page, 'punggol-gates');
  await expect(page.locator('[data-commute-context]')).not.toHaveAttribute('data-commute-context', 'lrt-platform');
  await playSharedRailJourney(page);
  await expect(page.getByRole('button', { name: 'DONE' })).toBeVisible();
});

test('requesting an intermediate Bus 50 stop gives a short dwell without promoting tap-out', async ({ page }) => {
  test.setTimeout(45_000);
  await openJourney(page);
  await page.getByRole('button', { name: 'RAISE HAND' }).click();
  await waitForContext(page, 'choose-item');
  await page.getByRole('button', { name: 'Travel card' }).click();
  await hold(page, 'ArrowRight', 1_200);
  await clickBusFareReader(page, 'entry');
  await waitForContext(page, 'aisle');
  await waitForContext(page, 'bus-moving', 10_000);
  await page.getByRole('button', { name: 'Request next bus stop' }).click();
  await expect(page.locator('[data-bus-stop-requested]')).toHaveAttribute('data-bus-stop-requested', 'true');
  await expect(page.locator('[data-bus-stop]')).toHaveAttribute('data-bus-stop', 'Oasis Stn Exit B / Blk 617D', { timeout: 5_000 });
  await expect(page.locator('[data-bus-doors]')).toHaveAttribute('data-bus-doors', 'open');
  await expect(page.locator('[data-bus-dwell-seconds]')).toHaveAttribute('data-bus-dwell-seconds', '5');
  await waitForContext(page, 'bus-stop-open');
  await expect(page.getByLabel('Your bag')).toHaveCount(0);
  await expect(page.getByText('Intermediate stop — remain aboard for Punggol')).toBeVisible();
  await page.waitForTimeout(1_000);
  await expect(page.locator('[data-bus-doors]')).toHaveAttribute('data-bus-doors', 'open');
  await expect(page.locator('[data-bus-doors]')).toHaveAttribute('data-bus-doors', 'closed', { timeout: 7_000 });
});
