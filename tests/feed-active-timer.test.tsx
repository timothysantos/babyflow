import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TodayPage } from '../src/client/routes/TodayPage';

beforeEach(() => {
  window.localStorage.clear();
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
            durationMinutes: body.durationMinutes ?? 18,
            durationSource: body.durationMinutes != null ? 'MANUAL' : 'LIVE',
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

describe('feed active timer', () => {
  it('shows a contextual feed timer and allows manual duration import', async () => {
    render(
      <MemoryRouter>
        <TodayPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'More' }));
    await waitFor(() => expect(screen.getByTestId('feed-session-status').textContent).toContain('Live'));
    expect(screen.getByTestId('feed-session-status').textContent).not.toContain('timer dashboard');

    fireEvent.click(screen.getByRole('button', { name: 'Import duration' }));
    fireEvent.change(screen.getByTestId('feed-duration-input'), { target: { value: '18' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save duration' }));
    await waitFor(() => expect(screen.getByTestId('feed-session-status').textContent).toContain('Imported · 18m'));
  });
});
