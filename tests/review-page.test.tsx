import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReviewPage } from '../src/client/routes/ReviewPage';
import { TodayPage } from '../src/client/routes/TodayPage';

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.includes('/cycle-events')) return Response.json({ events: [] });
      if (url.includes('/feed-sessions')) return Response.json({ sessions: [] });
      if (url.includes('/interventions')) return Response.json({ interventions: [] });
      return Response.json({ events: [], sessions: [] });
    })
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('ReviewPage', () => {
  it('renders the review ranges and scaffolded sections', () => {
    render(
      <MemoryRouter>
        <ReviewPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('review-page')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Review / 复盘' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '24h' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '3 days' })).toBeTruthy();
    expect(screen.getByRole('button', { name: '7 days' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'All' })).toBeTruthy();
    expect(screen.getByText('Cycles')).toBeTruthy();
    expect(screen.getByText('Feeds')).toBeTruthy();
    expect(screen.getByText('Sleep')).toBeTruthy();
    expect(screen.getByText('What you tried')).toBeTruthy();
    expect(screen.getByText('Why this might be happening')).toBeTruthy();
    expect(screen.getByText('Notes / remarks')).toBeTruthy();
    expect(screen.queryByText(/cluster/i)).toBeNull();
  });

  it('navigates from Today into Review through the router', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<TodayPage />} />
          <Route path="/review" element={<ReviewPage />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('link', { name: 'Review / 复盘' }));
    await waitFor(() => expect(screen.getByTestId('review-page')).toBeTruthy());
  });
});
