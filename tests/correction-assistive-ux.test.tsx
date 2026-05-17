import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
        return Response.json({
          events: [
            { id: 'event_2', kind: 'PLAY', label: 'play', babyId: 'baby_1', recordedAt: '2026-05-16T00:10:00.000Z' },
            { id: 'event_1', kind: 'WAKE', label: 'wake', babyId: 'baby_1', recordedAt: '2026-05-16T00:00:00.000Z' }
          ]
        });
      }
      if (method === 'GET' && url.includes('/feed-sessions')) {
        return Response.json({ sessions: [] });
      }
      return Response.json({ events: [], sessions: [] });
    })
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('correction assistive UX', () => {
  it('shows suggested reasons and reason capture in all correction surfaces', async () => {
    render(
      <MemoryRouter>
        <TodayPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByTestId('live-timeline-items')).toBeTruthy(), { timeout: 3000 });
    fireEvent.click(screen.getByRole('button', { name: 'More' }));
    fireEvent.click(within(screen.getByTestId('live-timeline-items')).getAllByRole('button')[0]);
    await waitFor(() => expect(screen.getByTestId('timeline-detail-sheet')).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Update time' }));
    await waitFor(() => expect(screen.getByTestId('timeline-edit-sheet')).toBeTruthy());
    expect(screen.getByTestId('timeline-edit-suggestion').textContent).toContain('Suggested correction reason');
    expect(screen.getByTestId('timeline-edit-reason')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Journal / 记录表' }));
    fireEvent.click(screen.getByTestId('paper-journal-cell-startOfPlayTime'));
    await waitFor(() => expect(screen.getByTestId('paper-journal-cell-edit-sheet')).toBeTruthy());
    expect(screen.getByTestId('paper-journal-cell-suggestion').textContent).toContain('Suggested correction reason');
    expect(screen.getByTestId('paper-journal-cell-reason')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Compact / 简洁' }));
    fireEvent.click(screen.getByTestId('journal-summary-startOfPlayTime'));
    await waitFor(() => expect(screen.getByTestId('compact-block-detail-sheet')).toBeTruthy());
    expect(screen.getByTestId('compact-block-suggestion').textContent).toContain('Suggested correction reason');
    expect(screen.getByTestId('compact-block-reason')).toBeTruthy();
  });
});
