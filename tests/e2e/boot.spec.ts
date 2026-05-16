import { expect, test } from '@playwright/test';

test('boots with the machine theme and renders the router root', async ({ page }) => {
  await page.goto('/');

  const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const theme = await page.evaluate(() => document.documentElement.dataset.theme);
  const prefersLight = await page.evaluate(() => window.matchMedia('(prefers-color-scheme: light)').matches);

  expect(theme).toBe(prefersLight ? 'light' : 'night');
  expect(bodyBg).not.toBe('rgb(255, 255, 255)');
});
