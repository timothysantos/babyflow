import { expect, test } from '@playwright/test';

test('boots on a dark canvas and renders the router root', async ({ page }) => {
  await page.goto('/');

  const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bodyBg).not.toBe('rgb(255, 255, 255)');

  await expect(page.getByText('BabyFlow router')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
});
