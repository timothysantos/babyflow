import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TodayPage } from '../src/client/routes/TodayPage';

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const method = init?.method ?? 'GET';
      const url = typeof input === 'string' ? input : input.toString();
      if (method === 'GET' && url.includes('/cycle-events')) {
        return Response.json({
          events: [
            {
              id: 'event_1',
              kind: 'WAKE',
              label: 'wake',
              babyId: 'baby_1',
              recordedAt: '2026-05-16T00:00:00.000Z'
            }
          ]
        });
      }
      if (method === 'GET' && url.includes('/feed-sessions')) {
        return Response.json({
          sessions: []
        });
      }
      if (method === 'GET' && url.includes('/interventions')) {
        return Response.json({ interventions: [] });
      }
      return Response.json({ events: [], sessions: [] });
    })
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('paper late entry', () => {
  it('lets a caregiver edit a journal cell and keeps projections aligned', async () => {
    render(
      <MemoryRouter>
        <TodayPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Journal / 记录表' }));
    fireEvent.click(screen.getByTestId('paper-journal-cell-wakeUpTime'));
    await waitFor(() => expect(screen.getByTestId('paper-journal-cell-edit-sheet')).toBeTruthy());
    fireEvent.change(screen.getByTestId('paper-journal-cell-edit-input'), { target: { value: '8:15 AM' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save update' }));

    await waitFor(() => expect(screen.getByTestId('paper-journal-cell-wakeUpTime').textContent).toContain('8:15 AM'));
    fireEvent.click(screen.getByRole('button', { name: 'Timeline / 时间线' }));
    await waitFor(() => expect(screen.getByTestId('journal-summary-wakeUpTime').textContent).toContain('8:15 AM'));
    fireEvent.click(screen.getByRole('button', { name: 'Compact / 简洁' }));
    await waitFor(() => expect(screen.getByTestId('journal-summary-wakeUpTime').textContent).toContain('8:15 AM'));
  });
});
