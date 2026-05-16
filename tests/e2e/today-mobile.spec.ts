import { expect, test } from '@playwright/test';

test('today page stays mobile-friendly at 390px and keeps the dock visible while scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const recordedEvents: Array<{ kind: string; label: string }> = [];
  await page.route('**/events', async (route) => {
    const request = route.request();
    if (request.method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ events: recordedEvents })
      });
      return;
    }

    if (request.method() === 'POST') {
      const body = JSON.parse(request.postData() ?? '{}') as { kind: string; label: string };
      const event = {
        id: `event_${recordedEvents.length + 1}`,
        kind: body.kind,
        label: body.label,
        recordedAt: '2026-05-16T00:00:00.000Z'
      };
      recordedEvents.unshift(event);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ event })
      });
      return;
    }

    await route.fulfill({ status: 405, body: 'Method Not Allowed' });
  });
  await page.goto('/');

  await expect(page.getByTestId('today-page')).toBeVisible();
  await expect(page.getByTestId('compact-mode')).toBeVisible();
  await expect(page.getByTestId('quick-action-dock')).toBeVisible();
  await expect(page.getByTestId('event-log')).toBeVisible();
  await expect(page.getByTestId('quick-action-dock').getByRole('button', { name: 'Wake' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Compact mode off' })).toBeVisible();

  const dockBefore = await page.getByTestId('quick-action-dock').boundingBox();
  expect(dockBefore).not.toBeNull();

  const wakeHeight = await page.getByTestId('quick-action-dock').getByRole('button', { name: 'Wake' }).evaluate((node) => {
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

  const dockPaddingBottom = await page.getByTestId('quick-action-dock').evaluate((node) => {
    return getComputedStyle(node).paddingBottom;
  });
  expect(Number.parseFloat(dockPaddingBottom)).toBeGreaterThanOrEqual(8);

  await page.getByRole('button', { name: 'Record Wake' }).click();
  await expect(page.getByTestId('event-log-items')).toContainText('WAKE: wake');

  await page.getByRole('button', { name: 'Compact mode off' }).click();
  await expect(page.getByText('Compact mode active.')).toBeVisible();

  await page.getByRole('link', { name: 'Profile / 资料' }).click();
  await expect(page.getByRole('heading', { name: 'Baby profile / 宝宝资料' })).toBeVisible();
  await page.getByRole('link', { name: 'Today / 今天' }).click();
  await expect(page.getByTestId('today-page')).toBeVisible();
  await expect(page.getByTestId('compact-mode')).toHaveAttribute('data-compact-mode', 'on');

  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });

  const dockAfter = await page.getByTestId('quick-action-dock').boundingBox();
  expect(dockAfter).not.toBeNull();
  expect(dockAfter!.y).toBeGreaterThanOrEqual(0);
  expect(dockAfter!.y + dockAfter!.height).toBeLessThanOrEqual(844);

  const rowBox = await page.getByTestId('cycle-row-scroll').boundingBox();
  expect(rowBox).not.toBeNull();
  expect(rowBox!.width).toBeLessThanOrEqual(390);
});
