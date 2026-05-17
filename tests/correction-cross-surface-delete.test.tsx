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
        return Response.json({
          events: [
            { id: 'event_2', kind: 'PLAY', label: 'play', babyId: 'baby_1', recordedAt: '2026-05-16T00:05:00.000Z' },
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

describe('correction delete parity', () => {
  it('delete from Journal removes the value from Timeline and Journal projections', async () => {
    render(
      <MemoryRouter>
        <TodayPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByTestId('live-timeline-items')).toBeTruthy(), { timeout: 3000 });
    fireEvent.click(screen.getByRole('button', { name: 'Journal / 记录表' }));
    fireEvent.click(screen.getByTestId('paper-journal-cell-wakeUpTime'));
    await waitFor(() => expect(screen.getByTestId('paper-journal-cell-edit-sheet')).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Delete cell' }));

    fireEvent.click(screen.getByRole('button', { name: 'Timeline / 时间线' }));
    await waitFor(() => expect(screen.getByTestId('journal-summary-wakeUpTime').textContent).toBe('—'));
    expect(screen.getByTestId('correction-history-items').textContent).toContain('correction.soft_delete');

    fireEvent.click(screen.getByTestId('correction-history-items').querySelector('button')!);
    await waitFor(() => expect(screen.getByTestId('journal-summary-wakeUpTime').textContent).toContain('8:00 AM'));
  });

  it('delete from Compact removes the value from Timeline and Compact projections', async () => {
    render(
      <MemoryRouter>
        <TodayPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByTestId('live-timeline-items')).toBeTruthy(), { timeout: 3000 });
    fireEvent.click(screen.getByRole('button', { name: 'Compact / 简洁' }));
    fireEvent.click(screen.getByTestId('journal-summary-startOfPlayTime'));
    await waitFor(() => expect(screen.getByTestId('compact-block-detail-sheet')).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Delete block' }));

    fireEvent.click(screen.getByRole('button', { name: 'Timeline / 时间线' }));
    await waitFor(() => expect(screen.getByTestId('journal-summary-startOfPlayTime').textContent).toBe('—'));
    expect(screen.getByTestId('correction-history-items').textContent).toContain('correction.soft_delete');

    fireEvent.click(screen.getByTestId('correction-history-items').querySelector('button')!);
    await waitFor(() => expect(screen.getByTestId('journal-summary-startOfPlayTime').textContent).toContain('8:05 AM'));
  });
});
