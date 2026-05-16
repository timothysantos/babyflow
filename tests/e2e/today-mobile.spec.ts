import { expect, test } from '@playwright/test';

test('today page stays mobile-friendly at 390px and keeps the dock visible while scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  await expect(page.getByTestId('today-page')).toBeVisible();
  await expect(page.getByTestId('compact-mode')).toBeVisible();
  await expect(page.getByTestId('quick-action-dock')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Wake' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Compact mode off' })).toBeVisible();

  const dockBefore = await page.getByTestId('quick-action-dock').boundingBox();
  expect(dockBefore).not.toBeNull();

  const wakeHeight = await page.getByRole('button', { name: 'Wake' }).evaluate((node) => {
    const { minHeight, height } = getComputedStyle(node);
    return { minHeight, height };
  });
  expect(Number.parseFloat(wakeHeight.minHeight)).toBeGreaterThanOrEqual(44);

  const shellPadding = await page.getByTestId('mobile-shell').evaluate((node) => {
    const { paddingLeft, paddingRight } = getComputedStyle(node);
    return { paddingLeft, paddingRight };
  });
  expect(Number.parseFloat(shellPadding.paddingLeft)).toBeGreaterThanOrEqual(8);
  expect(Number.parseFloat(shellPadding.paddingRight)).toBeGreaterThanOrEqual(8);

  await page.getByRole('button', { name: 'Compact mode off' }).click();
  await expect(page.getByText('Compact mode active.')).toBeVisible();

  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });

  const dockAfter = await page.getByTestId('quick-action-dock').boundingBox();
  expect(dockAfter).not.toBeNull();
  expect(Math.round(dockBefore!.y)).toBe(Math.round(dockAfter!.y));

  const rowBox = await page.getByTestId('cycle-row-scroll').boundingBox();
  expect(rowBox).not.toBeNull();
  expect(rowBox!.width).toBeLessThanOrEqual(390);
});
