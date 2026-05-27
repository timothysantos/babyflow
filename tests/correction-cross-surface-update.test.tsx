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

describe('correction update parity', () => {
  it('edit in Timeline updates Journal, Compact, and correction history', async () => {
    render(
      <MemoryRouter>
        <TodayPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByTestId('journal-summary-wakeUpTime').textContent).not.toBe('—'), { timeout: 3000 });
    fireEvent.click(screen.getByRole('button', { name: 'More' }));
    await waitFor(() => expect(screen.getByTestId('today-log-preview')).toBeTruthy());
    fireEvent.click(within(screen.getByTestId('live-timeline-items')).getAllByRole('button')[0]);
    await waitFor(() => expect(screen.getByTestId('timeline-detail-sheet')).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Update time' }));
    await waitFor(() => expect(screen.getByTestId('timeline-edit-sheet')).toBeTruthy());
    expect(screen.getByTestId('timeline-edit-suggestion').textContent).toContain('Suggested correction reason');
    fireEvent.click(screen.getByRole('button', { name: 'Use suggested reason' }));
    expect((screen.getByTestId('timeline-edit-reason') as HTMLSelectElement).value).toBe('wrong_time');
    fireEvent.change(screen.getByTestId('timeline-edit-input'), { target: { value: '2026-05-16T01:00:00.000Z' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save update' }));

    await waitFor(() => expect(screen.getByTestId('timeline-detail-sheet').textContent).toContain('2026-05-16T01:00:00.000Z'));
    fireEvent.click(screen.getByRole('button', { name: 'Journal / 记录表' }));
    await waitFor(() => expect(screen.getByTestId('paper-journal-cell-startOfPlayTime').textContent).toContain('9:00 AM'));
    fireEvent.click(screen.getByTestId('today-overflow-menu-toggle'));
    fireEvent.click(screen.getByRole('button', { name: 'Compact / 简洁' }));
    await waitFor(() => expect(screen.getByTestId('journal-summary-startOfPlayTime').textContent).toContain('9:00 AM'));
    fireEvent.click(screen.getByRole('button', { name: 'Timeline / 时间线' }));
    await waitFor(() => expect(screen.getByTestId('correction-history-items')).toBeTruthy());
    expect(screen.getByTestId('correction-history-items').textContent).toContain('correction.update');
    expect(screen.getByTestId('correction-history-items').textContent).toContain('Reason: wrong_time');
  });
});
