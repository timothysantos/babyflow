import { expect, test } from '@playwright/test';

test('today page stays mobile-friendly at 390px and keeps the dock visible while scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const recordedEvents: Array<{ kind: string; label: string }> = [];
  await page.route('**/cycle-events', async (route) => {
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
  const feedSessions: Array<any> = [];
  await page.route('**/feed-sessions', async (route) => {
    const request = route.request();
    if (request.method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ sessions: feedSessions })
      });
      return;
    }

    if (request.method() === 'POST') {
      const body = JSON.parse(request.postData() ?? '{}') as { babyId: string; mode: string };
      const session = {
        id: `feed_session_${feedSessions.length + 1}`,
        babyId: body.babyId,
        mode: body.mode,
        startedAt: '2026-05-16T00:00:00.000Z',
        segments: []
      };
      feedSessions.unshift(session);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ session })
      });
      return;
    }

    await route.fulfill({ status: 405, body: 'Method Not Allowed' });
  });
  await page.route(/\/feed-sessions\/[^/]+\/segments$/, async (route) => {
    const request = route.request();
    const sessionId = new URL(request.url()).pathname.split('/').filter(Boolean)[1];
    const body = JSON.parse(request.postData() ?? '{}') as { kind: string; label: string };
    const session = feedSessions.find((entry) => entry.id === sessionId);
    if (session) {
      const segment = {
        id: `feed_segment_${session.segments.length + 1}`,
        kind: body.kind,
        label: body.label,
        recordedAt: '2026-05-16T00:10:00.000Z'
      };
      session.segments.push(segment);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ session })
      });
      return;
    }
    await route.fulfill({ status: 404, body: 'Feed session not found' });
  });
  await page.route(/\/feed-sessions\/[^/]+$/, async (route) => {
    const request = route.request();
    if (request.method() !== 'PATCH') {
      await route.fallback();
      return;
    }
    const sessionId = new URL(request.url()).pathname.split('/').filter(Boolean)[1];
    const session = feedSessions.find((entry) => entry.id === sessionId);
    if (session) {
      session.endedAt = '2026-05-16T00:15:00.000Z';
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ session })
      });
      return;
    }
    await route.fulfill({ status: 404, body: 'Feed session not found' });
  });
  await page.goto('/');

  await expect(page.getByTestId('today-page')).toBeVisible();
  await expect(page.getByTestId('compact-mode')).toBeVisible();
  await expect(page.getByTestId('quick-action-dock')).toBeVisible();
  await expect(page.getByTestId('event-log')).toBeVisible();
  await expect(page.getByTestId('feed-sessions')).toBeVisible();
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

  await page.getByRole('button', { name: 'Start Breast' }).click();
  await expect(page.getByTestId('feed-session-list')).toContainText('BREAST feed for current-baby');
  await page.getByRole('button', { name: 'Add Left' }).click();
  await expect.poll(() => feedSessions[0]?.segments?.length ?? 0).toBe(1);
  await expect(page.getByTestId('feed-session-list')).toContainText('LEFT: left');
  await page.getByRole('button', { name: 'Close feed' }).click();
  await expect(page.getByTestId('feed-session-status')).toContainText('Closed');

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
