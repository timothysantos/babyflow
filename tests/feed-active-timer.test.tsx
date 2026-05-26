import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
      if (method === 'POST' && url.includes('/feed-sessions/feed_session_1/segments')) {
        const body = init?.body ? (JSON.parse(init.body.toString()) as { kind: 'LEFT' | 'RIGHT' | 'BOTTLE' | 'NOTE' }) : { kind: 'RIGHT' };
        return Response.json({
          session: {
            id: 'feed_session_1',
            babyId: 'current-baby',
            mode: 'BREAST',
            startedAt: '2026-05-16T00:00:00.000Z',
            segments: [
              {
                id: `feed_segment_${body.kind.toLowerCase()}`,
                kind: body.kind,
                label: body.kind === 'RIGHT' ? 'right breastfeeding' : body.kind.toLowerCase(),
                recordedAt: '2026-05-16T00:03:00.000Z'
              }
            ]
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

    fireEvent.click(activeFeedCard.getByRole('button', { name: 'Right breast' }));
    await waitFor(() => expect(screen.getByTestId('active-feed-current-segment').textContent).toContain('Right breastfeeding'));
    expect(screen.getByTestId('active-feed-segment-elapsed').textContent).toMatch(/\d/);

    await waitFor(() => expect(screen.getByTestId('feed-session-status').textContent).toContain('Live'));
    expect(screen.getByTestId('feed-session-status').textContent).not.toContain('timer dashboard');

    fireEvent.click(screen.getByRole('button', { name: 'Edit time' }));
    fireEvent.change(screen.getByTestId('feed-duration-input'), { target: { value: '18' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save duration' }));
    await waitFor(() => expect(screen.queryByTestId('active-feed-card')).toBeNull());
    expect(screen.getByTestId('today-log-preview').textContent).toContain('Imported 18m');
  });
});
