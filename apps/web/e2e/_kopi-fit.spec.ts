import { test } from '@playwright/test';

const VIEWPORTS = [
  { name: 'phone', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop-900', width: 1440, height: 900 },
  { name: 'laptop-768', width: 1366, height: 768 },
  { name: 'small-700', width: 1024, height: 700 },
];

for (const vp of VIEWPORTS) {
  test(`kopi fit @ ${vp.name}`, async ({ page }) => {
    await page.setViewportSize(vp);
    await page.goto('/practice/ordering-kopi');
    await page.getByRole('button', { name: /Open the stall/i }).click();
    await page.waitForSelector('[data-drop-cup]');
    await page.waitForTimeout(400);

    const report = await page.evaluate(() => {
      const r = (el: Element | null) => {
        if (!el) return null;
        const b = el.getBoundingClientRect();
        return { top: Math.round(b.top), bottom: Math.round(b.bottom), h: Math.round(b.height) };
      };
      const root = document.querySelector('[data-kopi-root]');
      const stage = document.querySelector('[data-kopi-stage]');
      const panel = document.querySelector('[data-kopi-panel]');
      const serve = document.querySelector('[data-kopi-serve]');
      const main = document.querySelector('main');
      return {
        vh: window.innerHeight,
        pageScroll: main ? main.scrollHeight - main.clientHeight : -1,
        root: r(root), stage: r(stage), panel: r(panel), serve: r(serve),
        ticket: r(document.querySelector('[data-kopi-ticket]')),
        cup: r(document.querySelector('[data-drop-cup]')),
        stageScroll: stage ? (stage.querySelector(':scope > div:last-child')?.scrollHeight ?? 0) : 0,
      };
    });
    console.log(vp.name, JSON.stringify(report, null, 1));
    await page.screenshot({ path: `scratch-kopi-${vp.name}.png` });
  });
}
