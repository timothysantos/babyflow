import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { TodayPage } from '../src/client/routes/TodayPage';

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const method = init?.method ?? 'GET';
      const url = typeof input === 'string' ? input : input.toString();
      if (method === 'GET' && url.includes('/cycle-events')) {
        return Response.json({ events: [] });
      }
      if (method === 'GET' && url.includes('/feed-sessions')) {
        return Response.json({ sessions: [] });
      }
      if (method === 'POST' && url.includes('/cycle-events')) {
        return Response.json({
          event: {
            id: 'event_1',
            kind: 'WAKE',
            label: 'wake',
            recordedAt: '2026-05-16T00:00:00.000Z'
          }
        });
      }
      if (method === 'POST' && url.includes('/feed-sessions') && url.endsWith('/segments')) {
        return Response.json({
          session: {
            id: 'feed_session_1',
            babyId: 'current-baby',
            mode: 'BREAST',
            startedAt: '2026-05-16T00:00:00.000Z',
            segments: [
              {
                id: 'feed_segment_1',
                kind: 'LEFT',
                label: 'left',
                recordedAt: '2026-05-16T00:10:00.000Z'
              }
            ]
          }
        });
      }
      if (method === 'POST' && url.includes('/feed-sessions')) {
        return Response.json({
          session: {
            id: 'feed_session_1',
            babyId: 'current-baby',
            mode: 'BREAST',
            startedAt: '2026-05-16T00:00:00.000Z',
            segments: []
          }
        });
      }
      if (method === 'PATCH' && url.includes('/feed-sessions')) {
        return Response.json({
          session: {
            id: 'feed_session_1',
            babyId: 'current-baby',
            mode: 'BREAST',
            startedAt: '2026-05-16T00:00:00.000Z',
            endedAt: '2026-05-16T00:15:00.000Z',
            segments: []
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

describe('TodayPage', () => {
  it('renders mobile layout, expandable row, event log, and quick action dock', async () => {
    render(
      <MemoryRouter>
        <TodayPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('mobile-shell')).toBeTruthy();
    expect(screen.getByTestId('today-page')).toBeTruthy();
    expect(screen.getByTestId('today-page').className).toContain('today-page');
    expect(screen.getByTestId('compact-mode')).toBeTruthy();
    expect(screen.getByTestId('compact-mode').className).toContain('status-chip');
    expect(screen.getByText('Condensed journal available.')).toBeTruthy();
    expect(screen.getByTestId('quick-action-dock')).toBeTruthy();
    expect(screen.getByTestId('feed-sessions').className).toContain('timeline-card');
    expect(screen.getByTestId('feed-sessions')).toBeTruthy();
    expect(screen.getByTestId('cycle-row-scroll')).toBeTruthy();
    expect(screen.getByTestId('cycle-row-scroll').scrollWidth).toBeGreaterThanOrEqual(
      screen.getByTestId('cycle-row-scroll').clientWidth
    );

    fireEvent.click(screen.getByRole('button', { name: 'Condensed journal' }));
    expect(screen.getByText('Condensed journal active.')).toBeTruthy();
    expect(window.localStorage.getItem('babyflow.today.compactMode')).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: 'Mark wake' }));
    await waitFor(() => expect(screen.getByTestId('event-log-items').textContent).toContain('WAKE: wake'));

    fireEvent.click(screen.getByRole('button', { name: 'Start Nurse' }));
    await waitFor(() => expect(screen.getByTestId('feed-session-list').textContent).toContain('BREAST feed for current-baby'));

    fireEvent.click(screen.getByRole('button', { name: 'Add Left latch' }));
    await waitFor(() => expect(screen.getByTestId('feed-session-list').textContent).toContain('LEFT: left'));

    fireEvent.click(screen.getByRole('button', { name: 'Close session' }));
    await waitFor(() => expect(screen.getByTestId('feed-session-list').textContent).toContain('Closed'));

    fireEvent.click(screen.getByRole('button', { name: 'Show details' }));
    expect(screen.getByTestId('cycle-row-expanded-details')).toBeTruthy();
  });

  it('renders cycle events newest-first from the API response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        Response.json({
          events: [
            {
              id: 'event_2',
              kind: 'FEED',
              label: 'feed',
              babyId: 'baby_1',
              recordedAt: '2026-05-16T00:10:00.000Z'
            },
            {
              id: 'event_1',
              kind: 'WAKE',
              label: 'wake',
              babyId: 'baby_1',
              recordedAt: '2026-05-16T00:00:00.000Z'
            }
          ]
        })
      )
    );

    render(
      <MemoryRouter>
        <TodayPage />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByTestId('event-log-items').textContent).toContain('FEED: feed')
    );
    expect(screen.getByTestId('event-log-items').textContent).toContain('WAKE: wake');
    expect(screen.getByTestId('event-log-items').textContent?.indexOf('FEED: feed')).toBeLessThan(
      screen.getByTestId('event-log-items').textContent?.indexOf('WAKE: wake') ?? 0
    );
  });

  it('renders feed sessions newest-first from the API response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const method = init?.method ?? 'GET';
        const url = typeof input === 'string' ? input : input.toString();
        if (method === 'GET' && url.includes('/feed-sessions')) {
          return Response.json({
            sessions: [
              {
                id: 'feed_session_2',
                babyId: 'baby_1',
                mode: 'FORMULA',
                startedAt: '2026-05-16T00:10:00.000Z',
                segments: []
              },
              {
                id: 'feed_session_1',
                babyId: 'baby_1',
                mode: 'BREAST',
                startedAt: '2026-05-16T00:00:00.000Z',
                segments: []
              }
            ]
          });
        }
        return Response.json({ events: [] });
      })
    );

    render(
      <MemoryRouter>
        <TodayPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByTestId('feed-session-list').textContent).toContain('FORMULA feed for baby_1'));
    expect(screen.getByTestId('feed-session-list').textContent).toContain('BREAST feed for baby_1');
    expect(screen.getByTestId('feed-session-list').textContent?.indexOf('FORMULA feed for baby_1')).toBeLessThan(
      screen.getByTestId('feed-session-list').textContent?.indexOf('BREAST feed for baby_1') ?? 0
    );
  });
});
