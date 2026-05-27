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
        body: JSON.stringify({
          events: [
            {
              id: 'event_cry',
              kind: 'CRY',
              label: 'cry',
              recordedAt: '2026-05-15T23:55:00.000Z'
            },
            ...recordedEvents
          ]
        })
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
  const interventions: Array<any> = [];
  await page.route('**/interventions', async (route) => {
    const request = route.request();
    if (request.method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ interventions })
      });
      return;
    }

    if (request.method() === 'POST') {
      const body = JSON.parse(request.postData() ?? '{}') as { kind: string; label: string; outcome?: string };
      const intervention = {
        id: `intervention_${interventions.length + 1}`,
        babyId: 'current-baby',
        kind: body.kind,
        label: body.label,
        outcome: body.outcome ?? 'UNKNOWN',
        context: 'today',
        recordedAt: '2026-05-16T00:20:00.000Z'
      };
      interventions.unshift(intervention);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ intervention })
      });
      return;
    }

    await route.fulfill({ status: 405, body: 'Method Not Allowed' });
  });
  const stateTransitions: Array<any> = [];
  await page.route('**/baby-state-transitions', async (route) => {
    const request = route.request();
    if (request.method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ transitions: stateTransitions })
      });
      return;
    }

    if (request.method() === 'POST') {
      const body = JSON.parse(request.postData() ?? '{}') as { fromState: string; toState: string; triggerLabel: string; triggerKind: string };
      const transition = {
        id: `state_transition_${stateTransitions.length + 1}`,
        babyId: 'current-baby',
        ...body,
        confidence: 'CONFIRMED',
        sourceType: 'cycle-event',
        sourceId: `transition_source_${stateTransitions.length + 1}`,
        recordedAt: '2026-05-16T00:20:00.000Z'
      };
      stateTransitions.unshift(transition);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ transition })
      });
      return;
    }

    await route.fulfill({ status: 405, body: 'Method Not Allowed' });
  });
  await page.goto('/');

  await expect(page.getByTestId('today-page')).toBeVisible();
  await expect(page.getByTestId('today-page')).toHaveClass(/today-page/);
  await expect(page.getByTestId('today-now-panel')).toBeVisible();
  await expect(page.getByTestId('view-mode-switcher')).toBeVisible();
  await expect(page.getByTestId('today-overflow-menu-toggle')).toBeVisible();
  const appShellBox = await page.getByTestId('app-shell').boundingBox();
  expect(appShellBox).not.toBeNull();
  expect(appShellBox!.width).toBeGreaterThanOrEqual(380);
  await expect(page.getByTestId('quick-action-dock')).toBeVisible();
  const shellBox = await page.getByTestId('mobile-shell').boundingBox();
  expect(shellBox).not.toBeNull();
  expect(shellBox!.width).toBeGreaterThanOrEqual(360);
  const shellBg = await page.getByTestId('app-shell').evaluate((node) => getComputedStyle(node).backgroundColor);
  expect(shellBg).not.toBe('rgb(255, 255, 255)');
  await expect(page.getByTestId('quick-action-dock').getByRole('button', { name: 'Wake' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Review / 复盘' })).toBeVisible();
  const timelineTabBox = await page.getByRole('button', { name: 'Timeline / 时间线' }).boundingBox();
  const journalTabBox = await page.getByRole('button', { name: 'Journal / 记录表' }).boundingBox();
  const reviewTabBox = await page.getByRole('link', { name: 'Review / 复盘' }).boundingBox();
  const overflowBox = await page.getByTestId('today-overflow-menu-toggle').boundingBox();
  const titleBox = await page.getByRole('heading', { name: 'Today / 今天' }).boundingBox();
  const heroBox = await page.locator('.today-page .page-hero').boundingBox();
  expect(timelineTabBox).not.toBeNull();
  expect(journalTabBox).not.toBeNull();
  expect(reviewTabBox).not.toBeNull();
  expect(overflowBox).not.toBeNull();
  expect(titleBox).not.toBeNull();
  expect(heroBox).not.toBeNull();
  expect(Math.abs(timelineTabBox!.y - journalTabBox!.y)).toBeLessThanOrEqual(1);
  expect(Math.abs(timelineTabBox!.y - reviewTabBox!.y)).toBeLessThanOrEqual(1);
  expect(reviewTabBox!.x + reviewTabBox!.width).toBeLessThanOrEqual(390);
  expect(overflowBox!.x + overflowBox!.width).toBeLessThanOrEqual(heroBox!.x + heroBox!.width);
  expect(overflowBox!.x).toBeGreaterThanOrEqual(heroBox!.x + heroBox!.width - 64);
  expect(Math.abs(overflowBox!.y - titleBox!.y)).toBeLessThanOrEqual(8);
  const topPills = [
    page.getByRole('button', { name: 'Timeline / 时间线' }),
    page.getByRole('button', { name: 'Journal / 记录表' }),
    page.getByRole('link', { name: 'Review / 复盘' })
  ];
  for (const pill of topPills) {
    const metrics = await pill.evaluate((node) => {
      const style = getComputedStyle(node);
      return {
        clientWidth: node.clientWidth,
        scrollWidth: node.scrollWidth,
        overflow: style.overflow,
        whiteSpace: style.whiteSpace,
        textOverflow: style.textOverflow,
        lineHeight: style.lineHeight
      };
    });
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
    expect(metrics.overflow).toBe('hidden');
    expect(metrics.whiteSpace).toBe('nowrap');
    expect(metrics.textOverflow).toBe('ellipsis');
    expect(Number.parseFloat(metrics.lineHeight)).toBeGreaterThan(0);
  }
  await page.getByTestId('today-overflow-menu-toggle').click();
  await expect(page.getByRole('button', { name: 'Compact / 简洁' })).toBeVisible();
  await page.getByTestId('today-overflow-menu-toggle').click();
  await expect(page.getByTestId('today-log-preview')).toBeVisible();

  const dockBefore = await page.getByTestId('quick-action-dock').boundingBox();
  expect(dockBefore).not.toBeNull();
  expect(dockBefore!.x).toBeLessThanOrEqual(1);
  expect(dockBefore!.width).toBeGreaterThanOrEqual(388);
  expect(Math.abs(dockBefore!.y + dockBefore!.height - 844)).toBeLessThanOrEqual(1);
  const dockRadius = await page.getByTestId('quick-action-dock').evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      topLeft: style.borderTopLeftRadius,
      topRight: style.borderTopRightRadius,
      bottomLeft: style.borderBottomLeftRadius,
      bottomRight: style.borderBottomRightRadius
    };
  });
  expect(dockRadius.topLeft).not.toBe('0px');
  expect(dockRadius.topRight).not.toBe('0px');
  expect(dockRadius.bottomLeft).toBe('0px');
  expect(dockRadius.bottomRight).toBe('0px');

  const wakeHeight = await page.getByTestId('quick-action-dock').getByRole('button', { name: 'Wake' }).evaluate((node) => {
    const { minHeight, height } = getComputedStyle(node);
    return { minHeight, height };
  });
  expect(Number.parseFloat(wakeHeight.minHeight)).toBeGreaterThanOrEqual(44);

  const shellPadding = await page.getByTestId('mobile-shell').evaluate((node) => {
    const { paddingLeft, paddingRight } = getComputedStyle(node);
    return { paddingLeft, paddingRight };
  });
  expect(Number.parseFloat(shellPadding.paddingLeft)).toBe(0);
  expect(Number.parseFloat(shellPadding.paddingRight)).toBe(0);

  const dockPaddingBottom = await page.getByTestId('quick-action-dock').evaluate((node) => {
    return getComputedStyle(node).paddingBottom;
  });
  expect(Number.parseFloat(dockPaddingBottom)).toBeGreaterThanOrEqual(8);

  await page.getByTestId('quick-action-dock').getByRole('button', { name: 'Left feed' }).click();
  await expect(page.getByTestId('active-feed-card')).toBeVisible();
  await expect(page.getByTestId('active-feed-current-segment')).toContainText('Left breastfeeding');
  const activeFeedBox = await page.getByTestId('active-feed-card').boundingBox();
  const feedStatusBox = await page.getByTestId('feed-session-status').boundingBox();
  const currentSegmentBox = await page.getByTestId('active-feed-current-segment').boundingBox();
  expect(activeFeedBox).not.toBeNull();
  expect(feedStatusBox).not.toBeNull();
  expect(currentSegmentBox).not.toBeNull();
  expect(activeFeedBox!.x).toBeGreaterThanOrEqual(0);
  expect(activeFeedBox!.x + activeFeedBox!.width).toBeLessThanOrEqual(390);
  expect(feedStatusBox!.x + feedStatusBox!.width).toBeLessThanOrEqual(activeFeedBox!.x + activeFeedBox!.width);
  expect(currentSegmentBox!.x + currentSegmentBox!.width).toBeLessThanOrEqual(activeFeedBox!.x + activeFeedBox!.width);
  await page.getByTestId('quick-action-dock').getByRole('button', { name: 'Note' }).click();
  await expect(page.getByTestId('feed-note-editor')).toBeVisible();
  await page.getByTestId('feed-note-input').fill('baby drifted off, paused');
  await page.getByRole('button', { name: 'Save note' }).click();
  await expect(page.getByTestId('active-feed-segment-sequence')).toContainText('baby drifted off, paused');
  await page.getByTestId('quick-action-dock').getByRole('button', { name: 'Sleep' }).click();
  await expect(page.getByTestId('active-feed-card')).toBeHidden();

  await page.getByTestId('quick-action-dock').getByRole('button', { name: 'Wake' }).click();
  await page.getByRole('button', { name: 'More' }).click();
  await expect(page.getByTestId('row-details')).toBeVisible();
  await expect(page.getByTestId('event-log')).toBeVisible();
  await expect(page.getByTestId('intervention-attempts-panel')).toBeVisible();
  await expect(page.getByTestId('feed-sessions')).toBeVisible();
  const feedCardRadius = await page.getByTestId('feed-sessions').evaluate((node) => getComputedStyle(node).borderRadius);
  expect(Number.parseFloat(feedCardRadius)).toBeGreaterThanOrEqual(14);
  await expect(page.getByTestId('event-log-items')).toContainText('Wake stamp');

  await page.getByRole('button', { name: 'Start Nurse' }).click();
  await expect(page.getByTestId('feed-session-list')).toContainText('BREAST feed · current-baby');
  await page.getByTestId('feed-session-list').getByRole('button', { name: 'Add Left latch' }).first().click();
  await expect.poll(() => feedSessions[0]?.segments?.length ?? 0).toBe(1);
  await expect(page.getByTestId('feed-session-list')).toContainText('LEFT');
  await page.getByTestId('feed-session-list').getByRole('button', { name: 'Add Right latch' }).first().click();
  await expect.poll(() => feedSessions[0]?.segments?.length ?? 0).toBe(2);
  await expect(page.getByTestId('feed-session-list')).toContainText('RIGHT');
  await page.getByTestId('feed-session-list').getByRole('button', { name: 'Close session' }).first().click();
  await expect(page.getByTestId('feed-sessions').getByTestId('feed-session-status').first()).toContainText('Closed session');
  await page.getByRole('button', { name: 'Soothe' }).click();
  await expect(page.getByTestId('intervention-attempt-list')).toContainText('SOOTHE');
  await page.getByRole('button', { name: 'Wait' }).click();
  await expect(page.getByTestId('intervention-attempt-list')).toContainText('WAIT');
  await expect.poll(() => interventions.length).toBe(2);
  await expect(page.getByTestId('state-transition-viewer')).toBeVisible();
  await expect(page.getByTestId('state-transition-list')).toContainText('AWAKE_CALM');
  await expect(page.getByTestId('state-transition-list')).toContainText('FEEDING');

  await page.getByRole('button', { name: 'Journal / 记录表' }).click();
  await expect(page.getByTestId('paper-journal-view')).toBeVisible();
  await expect(page.getByTestId('paper-journal-scroll')).toBeVisible();
  await expect(page.getByTestId('paper-journal-row')).toBeVisible();
  const rowBox = await page.getByTestId('paper-journal-scroll').boundingBox();
  expect(rowBox).not.toBeNull();
  expect(rowBox!.width).toBeLessThanOrEqual(390);

  await page.getByRole('button', { name: 'Timeline / 时间线' }).click();
  await expect(page.getByTestId('today-log-preview')).toBeVisible();
  await page.getByTestId('live-timeline-items').getByRole('button').first().click();
  await expect(page.getByTestId('timeline-detail-sheet')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Soft delete' })).toBeVisible();
  await page.getByRole('button', { name: 'Soft delete' }).click();
  await expect(page.getByTestId('correction-history-panel')).toBeVisible();
  await expect(page.getByTestId('correction-history-items')).toContainText('correction.soft_delete');

  await page.getByTestId('today-overflow-menu-toggle').click();
  await page.getByRole('link', { name: 'Profile / 资料' }).click();
  await expect(page.getByRole('heading', { name: 'Baby profile / 宝宝资料' })).toBeVisible();
  await page.getByRole('link', { name: 'Today / 今天' }).click();
  await expect(page.getByTestId('today-page')).toBeVisible();
  await expect(page.getByTestId('today-now-panel')).toBeVisible();

  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });

  const dockAfter = await page.getByTestId('quick-action-dock').boundingBox();
  expect(dockAfter).not.toBeNull();
  expect(dockAfter!.x).toBeLessThanOrEqual(1);
  expect(dockAfter!.width).toBeGreaterThanOrEqual(388);
  expect(Math.abs(dockAfter!.y + dockAfter!.height - 844)).toBeLessThanOrEqual(1);
  await expect(page.getByTestId('quick-action-dock')).toBeVisible();

});
