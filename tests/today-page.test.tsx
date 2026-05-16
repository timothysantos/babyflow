import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { TodayPage } from '../src/client/routes/TodayPage';

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const method = init?.method ?? 'GET';
      if (method === 'GET') {
        return Response.json({ events: [] });
      }
      return Response.json({
        event: {
          id: 'event_1',
          kind: 'WAKE',
          label: 'wake',
          recordedAt: '2026-05-16T00:00:00.000Z'
        }
      });
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
    expect(screen.getByTestId('compact-mode')).toBeTruthy();
    expect(screen.getByText('Compact mode scaffolded.')).toBeTruthy();
    expect(screen.getByTestId('quick-action-dock')).toBeTruthy();
    expect(screen.getByTestId('cycle-row-scroll')).toBeTruthy();
    expect(screen.getByTestId('cycle-row-scroll').scrollWidth).toBeGreaterThanOrEqual(
      screen.getByTestId('cycle-row-scroll').clientWidth
    );

    fireEvent.click(screen.getByRole('button', { name: 'Compact mode off' }));
    expect(screen.getByText('Compact mode active.')).toBeTruthy();
    expect(window.localStorage.getItem('babyflow.today.compactMode')).toBe('true');

    fireEvent.click(screen.getByRole('button', { name: 'Record Wake' }));
    await waitFor(() => expect(screen.getByTestId('event-log-items').textContent).toContain('WAKE: wake'));

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
});
