import { test, expect } from '@playwright/test';

/**
 * Layout regression guard: no screen may push the document wider than the
 * viewport at any of the sizes we support. The failure this catches is the
 * grid/flex "blowout" — a track whose automatic min-width is set by a long
 * unbreakable child (a suggestion chip, a speech bubble), which silently
 * widens its column past the screen. Deliberate horizontal carousels scroll
 * inside their own container, so they never reach the document.
 *
 * 1024 is included on purpose: that is where the sidebar (256px) and the
 * scenario column (300px) both appear, leaving the narrowest content column
 * in the whole app.
 */
const VIEWPORTS = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'small-desktop', width: 1024, height: 700 },
  { name: 'desktop', width: 1440, height: 900 },
];

const ROUTES = [
  '/map',
  '/field-guide',
  '/practice',
  '/practice/first-classmate',
  '/missions/speak',
  '/lessons/speak-l1/play',
];

for (const vp of VIEWPORTS) {
  for (const route of ROUTES) {
    test(`${route} has no horizontal overflow at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    });
  }
}

test('lesson backdrop stays fixed while tall content scrolls', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 400 });
  await page.goto('/lessons/speak-l1/play');

  const main = page.locator('main');
  const backdrop = page.getByTestId('screen-backdrop');
  await expect(backdrop).toBeVisible();

  const canScroll = await main.evaluate(
    (element) => element.scrollHeight > element.clientHeight,
  );
  expect(canScroll).toBe(true);

  await main.evaluate((element) => element.scrollTo({ top: 200 }));
  await expect.poll(() => main.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);

  const backdropTop = await backdrop.evaluate(
    (element) => element.getBoundingClientRect().top,
  );
  expect(backdropTop).toBe(0);
});
