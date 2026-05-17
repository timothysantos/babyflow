import { expect, test } from '@playwright/test';

test('boots with the machine theme and renders the router root', async ({ page }) => {
  await page.goto('/');

  const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const theme = await page.evaluate(() => document.documentElement.dataset.theme);
  const prefersLight = await page.evaluate(() => window.matchMedia('(prefers-color-scheme: light)').matches);

  expect(theme).toBe(prefersLight ? 'light' : 'night');
  expect(bodyBg).not.toBe('rgb(255, 255, 255)');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.reload();
  const appShell = await page.getByTestId('app-shell').boundingBox();
  const dock = await page.getByTestId('quick-action-dock').boundingBox();
  expect(appShell).not.toBeNull();
  expect(dock).not.toBeNull();
  expect(appShell!.width).toBeGreaterThanOrEqual(1100);
  expect(dock!.width).toBeGreaterThanOrEqual(1100);
});
