import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
});
