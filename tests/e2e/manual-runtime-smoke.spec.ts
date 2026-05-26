import { expect, test } from '@playwright/test';

test('manual runtime smoke', async ({ page }) => {
  const health = await page.request.get('/health');
  expect(health.ok()).toBeTruthy();

  await page.goto('/');
  await expect(page.getByTestId('today-page')).toBeVisible();

  const wakeResponse = page.waitForResponse((response) => response.url().includes('/cycle-events') && response.request().method() === 'POST');
  await page.getByTestId('quick-action-dock').getByRole('button', { name: 'Wake' }).click();
  const wake = await wakeResponse;
  expect(wake.ok()).toBeTruthy();
  await page.getByRole('button', { name: 'More' }).click();
  await expect(page.getByTestId('event-log-items')).toContainText('Wake stamp');

  const feedResponse = page.waitForResponse((response) => response.url().includes('/feed-sessions') && response.request().method() === 'POST');
  await page.getByTestId('quick-action-dock').getByRole('button', { name: 'Left feed' }).click();
  const feed = await feedResponse;
  expect(feed.ok()).toBeTruthy();
  await expect(page.getByTestId('active-feed-current-segment')).toContainText('Left breastfeeding');
  await expect(page.getByTestId('active-feed-card').getByTestId('feed-session-status')).toContainText('Live');
});
