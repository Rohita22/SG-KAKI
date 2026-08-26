import { test } from '@playwright/test';
test('walk the front walkway past the bench', async ({ page }) => {
  await page.goto('/practice/commute-to-changi');
  await page.waitForSelector('canvas', { timeout: 20000 });
  await page.waitForFunction(() => !!(document.querySelector('canvas') as HTMLCanvasElement)?.dataset.scene4Debug, { timeout: 20000 });
  await page.locator('canvas').click({ position: { x: 10, y: 10 } });
  const pos = async () => page.evaluate(() => {
    const d = JSON.parse((document.querySelector('canvas') as HTMLCanvasElement).dataset.scene4Debug || '{}');
    return { x: d.playerX, y: d.playerY };
  });
  const hold = async (k: string, ms: number) => { await page.keyboard.down(k); await page.waitForTimeout(ms); await page.keyboard.up(k); };

  // Route: left into the clear gap between bench and bollards, drop onto the
  // walkway, then walk left along it past the bench.
  for (let i = 0; i < 15 && (await pos()).x > 1700; i++) await hold('ArrowLeft', 120);
  console.log('at gap', JSON.stringify(await pos()));
  await hold('ArrowDown', 700);
  console.log('on walkway', JSON.stringify(await pos()));
  for (let i = 0; i < 14; i++) await hold('ArrowLeft', 130);
  console.log('walked left to', JSON.stringify(await pos()));
  await page.locator('canvas').screenshot({ path: 'scratch-walkway.png' });
});
