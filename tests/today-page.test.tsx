import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { TodayPage } from '../src/client/routes/TodayPage';

beforeEach(() => {
  window.localStorage.clear();
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
      if (method === 'POST' && url.includes('/cycle-events') && init?.body?.toString().includes('"kind":"PLAY"')) {
        return Response.json({
          event: {
            id: 'event_2',
            kind: 'PLAY',
            label: 'play',
            recordedAt: '2026-05-16T00:05:00.000Z'
          }
        });
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
  it('renders mobile layout, journal switcher, event log, and quick action dock', async () => {
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
    expect(screen.getByRole('group', { name: 'View mode switcher' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Timeline / 时间线' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Journal / 记录表' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Compact / 简洁' })).toBeTruthy();
    expect(screen.getByText('Timeline view active.')).toBeTruthy();
    expect(screen.getByTestId('quick-action-dock')).toBeTruthy();
    expect(screen.getByTestId('journal-summary')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Compact / 简洁' }));
    expect(screen.getByText('Compact journal active.')).toBeTruthy();
    expect(window.localStorage.getItem('babyflow.today.viewMode')).toBe('compact');

    fireEvent.click(screen.getByRole('button', { name: 'Timeline / 时间线' }));
    fireEvent.click(screen.getByRole('button', { name: 'More' }));
    expect(screen.getByTestId('row-details')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Wake' }));
    await waitFor(() => expect(screen.getByTestId('event-log-items').textContent).toContain('Wake stamp'));

    fireEvent.click(screen.getByRole('button', { name: 'Start Nurse' }));
    await waitFor(() => expect(screen.getByTestId('feed-session-list').textContent).toContain('BREAST feed · current-baby'));

    fireEvent.click(screen.getByRole('button', { name: 'Add Left latch' }));
    await waitFor(() => expect(screen.getByTestId('feed-session-list').textContent).toContain('LEFT'));

    fireEvent.click(screen.getByRole('button', { name: 'Close session' }));
    await waitFor(() => expect(screen.getByTestId('feed-session-list').textContent).toContain('Closed session'));

    fireEvent.click(screen.getByRole('button', { name: 'Journal / 记录表' }));
    expect(screen.getByTestId('paper-journal-view')).toBeTruthy();
    expect(screen.getByTestId('paper-journal-scroll')).toBeTruthy();
    expect(screen.getByText('Wake Up Time / 醒来的时间')).toBeTruthy();
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

    fireEvent.click(screen.getByRole('button', { name: 'More' }));
    await waitFor(() =>
      expect(screen.getByTestId('event-log-items').textContent).toContain('Feed stamp')
    );
    expect(screen.getByTestId('event-log-items').textContent).toContain('Wake stamp');
    expect(screen.getByTestId('event-log-items').textContent?.indexOf('Feed stamp')).toBeLessThan(
      screen.getByTestId('event-log-items').textContent?.indexOf('Wake stamp') ?? 0
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

    fireEvent.click(screen.getByRole('button', { name: 'More' }));
    await waitFor(() => expect(screen.getByTestId('feed-session-list').textContent).toContain('FORMULA feed · baby_1'));
    expect(screen.getByTestId('feed-session-list').textContent).toContain('BREAST feed · baby_1');
    expect(screen.getByTestId('feed-session-list').textContent?.indexOf('FORMULA feed · baby_1')).toBeLessThan(
      screen.getByTestId('feed-session-list').textContent?.indexOf('BREAST feed · baby_1') ?? 0
    );
  });
});
