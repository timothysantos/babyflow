import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TodayPage } from '../src/client/routes/TodayPage';

beforeEach(() => {
  window.localStorage.clear();
  const segments: Array<{ id: string; kind: 'LEFT' | 'RIGHT' | 'BOTTLE' | 'NOTE'; label: string; recordedAt: string }> = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const method = init?.method ?? 'GET';
      const url = typeof input === 'string' ? input : input.toString();
      if (method === 'GET' && url.includes('/feed-sessions')) {
        return Response.json({
          sessions: [
            {
              id: 'feed_session_1',
              babyId: 'current-baby',
              mode: 'BREAST',
              startedAt: '2026-05-16T00:00:00.000Z',
              segments: []
            }
          ]
        });
      }
      if (method === 'POST' && url.endsWith('/feed-sessions')) {
        const body = init?.body ? (JSON.parse(init.body.toString()) as { mode?: string }) : {};
        return Response.json({
          session: {
            id: body.mode === 'FORMULA' ? 'feed_session_formula' : 'feed_session_1',
            babyId: 'current-baby',
            mode: body.mode ?? 'BREAST',
            startedAt: '2026-05-16T00:32:00.000Z',
            segments: []
          }
        });
      }
      if (method === 'POST' && url.includes('/feed-sessions/feed_session_formula/segments')) {
        const body = init?.body ? (JSON.parse(init.body.toString()) as { kind: 'LEFT' | 'RIGHT' | 'BOTTLE' | 'NOTE' }) : { kind: 'BOTTLE' };
        return Response.json({
          session: {
            id: 'feed_session_formula',
            babyId: 'current-baby',
            mode: 'FORMULA',
            startedAt: '2026-05-16T00:32:00.000Z',
            segments: [
              {
                id: 'feed_segment_formula',
                kind: body.kind,
                label: 'formula',
                recordedAt: '2026-05-16T00:32:00.000Z'
              }
            ]
          }
        });
      }
      if (method === 'POST' && url.includes('/feed-sessions/feed_session_1/segments')) {
        const body = init?.body ? (JSON.parse(init.body.toString()) as { kind: 'LEFT' | 'RIGHT' | 'BOTTLE' | 'NOTE' }) : { kind: 'RIGHT' };
        const segmentIndex = segments.length;
        segments.push({
          id: `feed_segment_${segmentIndex + 1}`,
          kind: body.kind,
          label:
            body.kind === 'LEFT'
              ? 'left breastfeeding'
              : body.kind === 'RIGHT'
                ? 'right breastfeeding'
                : body.kind === 'BOTTLE'
                  ? 'formula'
                  : 'feed note',
          recordedAt: new Date(Date.UTC(2026, 4, 16, 0, segmentIndex * 10)).toISOString()
        });
        return Response.json({
          session: {
            id: 'feed_session_1',
            babyId: 'current-baby',
            mode: 'BREAST',
            startedAt: '2026-05-16T00:00:00.000Z',
            segments
          }
        });
      }
      if (method === 'GET' && url.includes('/cycle-events')) {
        return Response.json({ events: [] });
      }
      if (method === 'GET' && url.includes('/interventions')) {
        return Response.json({ interventions: [] });
      }
      if (method === 'PATCH' && url.includes('/feed-sessions')) {
        const body = init?.body ? (JSON.parse(init.body.toString()) as { durationMinutes?: number }) : {};
        return Response.json({
          session: {
            id: 'feed_session_1',
            babyId: 'current-baby',
            mode: 'BREAST',
            startedAt: '2026-05-16T00:00:00.000Z',
            endedAt: '2026-05-16T00:18:00.000Z',
            durationMinutes: body.durationMinutes ?? 18,
            durationSource: body.durationMinutes != null ? 'MANUAL' : 'LIVE',
            segments: []
          }
        });
      }
      if (method === 'POST' && url.includes('/cycle-events')) {
        const body = init?.body ? (JSON.parse(init.body.toString()) as { kind?: string; label?: string }) : {};
        return Response.json({
          event: {
            id: `event_${String(body.kind ?? 'event').toLowerCase()}`,
            kind: body.kind ?? 'NOTE',
            label: body.label ?? String(body.kind ?? 'note').toLowerCase(),
            babyId: 'current-baby',
            recordedAt: '2026-05-16T00:30:00.000Z'
          }
        });
      }
      return Response.json({ events: [], sessions: [] });
    })
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('feed active timer', () => {
  it('makes a live feed the primary Today task and allows manual duration import', async () => {
    render(
      <MemoryRouter>
        <TodayPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByTestId('active-feed-card')).toBeTruthy());
    const activeFeedCard = within(screen.getByTestId('active-feed-card'));
    expect(screen.getByText('Feeding now')).toBeTruthy();
    expect(screen.getByTestId('active-feed-elapsed').textContent).toMatch(/\d/);
    expect(activeFeedCard.getByRole('button', { name: 'Left breast' })).toBeTruthy();
    expect(activeFeedCard.getByRole('button', { name: 'Right breast' })).toBeTruthy();
    expect(activeFeedCard.getByRole('button', { name: 'Formula' })).toBeTruthy();
    expect(activeFeedCard.getByRole('button', { name: 'Note' })).toBeTruthy();
    expect(activeFeedCard.getByRole('button', { name: 'Close feed' })).toBeTruthy();
    expect(screen.getByTestId('active-feed-current-segment').textContent).toContain('Feed started');
    expect(screen.getByTestId('active-feed-guidance').textContent).toContain('Start with left, right, or formula');

    fireEvent.click(activeFeedCard.getByRole('button', { name: 'Right breast' }));
    await waitFor(() => expect(screen.getByTestId('active-feed-current-segment').textContent).toContain('Right breastfeeding'));
    expect(screen.getByTestId('active-feed-guidance').textContent).toContain('Right is running');
    expect(screen.getByTestId('active-feed-segment-elapsed').textContent).toMatch(/\d/);

    fireEvent.click(activeFeedCard.getByRole('button', { name: 'Left breast' }));
    await waitFor(() => expect(screen.getByTestId('active-feed-current-segment').textContent).toContain('Left breastfeeding'));
    fireEvent.click(activeFeedCard.getByRole('button', { name: 'Right breast' }));
    await waitFor(() => expect(screen.getByTestId('active-feed-current-segment').textContent).toContain('Right breastfeeding'));
    fireEvent.click(activeFeedCard.getByRole('button', { name: 'Left breast' }));
    await waitFor(() => expect(screen.getByTestId('active-feed-current-segment').textContent).toContain('Left breastfeeding'));
    fireEvent.click(activeFeedCard.getByRole('button', { name: 'Formula' }));
    await waitFor(() => expect(screen.getByTestId('active-feed-current-segment').textContent).toContain('Formula'));
    const sequenceText = screen.getByTestId('active-feed-segment-sequence').textContent ?? '';
    expect(sequenceText).toMatch(/Right breastfeeding.*Left breastfeeding.*Right breastfeeding.*Left breastfeeding.*Formula/);

    await waitFor(() => expect(screen.getByTestId('feed-session-status').textContent).toContain('Live'));
    expect(screen.getByTestId('feed-session-status').textContent).not.toContain('timer dashboard');

    fireEvent.click(screen.getByRole('button', { name: 'Edit time' }));
    fireEvent.change(screen.getByTestId('feed-duration-input'), { target: { value: '18' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save duration' }));
    await waitFor(() => expect(screen.queryByTestId('active-feed-card')).toBeNull());
    expect(screen.getByTestId('today-log-preview').textContent).toContain('Imported 18m');
  });

  it('closes a running feed when Sleep is stamped so later formula starts a new feed section', async () => {
    render(
      <MemoryRouter>
        <TodayPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByTestId('active-feed-card')).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Sleep' }));
    await waitFor(() => expect(screen.queryByTestId('active-feed-card')).toBeNull());
    expect(screen.getByTestId('today-log-preview').textContent).toContain('asleep');

    fireEvent.click(screen.getByRole('button', { name: 'Formula' }));
    await waitFor(() => expect(screen.getByTestId('active-feed-card')).toBeTruthy());
    expect(screen.getByTestId('active-feed-current-segment').textContent).toContain('Formula');
  });
});
