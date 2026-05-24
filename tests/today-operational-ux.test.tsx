import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TodayPage } from '../src/client/routes/TodayPage';

beforeEach(() => {
  window.localStorage.clear();
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

describe('Today operational UX', () => {
  it('renders a short caregiver-facing Today surface without architecture labels', () => {
    render(
      <MemoryRouter>
        <TodayPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('mobile-shell')).toBeTruthy();
    expect(screen.getByText('Today / 今天')).toBeTruthy();
    expect(screen.getByTestId('today-now-panel')).toBeTruthy();
    expect(screen.getByText('Now')).toBeTruthy();
    expect(screen.getByTestId('today-log-preview')).toBeTruthy();
    expect(screen.getByTestId('quick-action-dock')).toBeTruthy();
    expect(screen.getByTestId('feed-window-summary')).toBeTruthy();

    const visibleText = screen.getByTestId('today-page').textContent ?? '';
    expect(visibleText).not.toMatch(/live timeline stream/i);
    expect(visibleText).not.toMatch(/correction history/i);
    expect(visibleText).not.toMatch(/state transitions/i);
    expect(visibleText).not.toMatch(/feed session details/i);
    expect(visibleText).not.toMatch(/intervention attempts/i);
    expect(visibleText).not.toMatch(/timeline stamps/i);
    expect(visibleText).not.toMatch(/cluster/i);
  });
});
