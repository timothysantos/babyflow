import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { TodayPage } from '../src/client/routes/TodayPage';

beforeEach(() => {
  window.localStorage.clear();
  let importedDurationMinutes: number | null = null;
  vi.stubGlobal(
    'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const method = init?.method ?? 'GET';
        const url = typeof input === 'string' ? input : input.toString();
        if (method === 'GET' && url.includes('/cycle-events')) {
          return Response.json({
            events: [
              {
                id: 'event_cry',
                kind: 'CRY',
                label: 'cry',
                babyId: 'current-baby',
                recordedAt: '2026-05-15T23:55:00.000Z'
              }
            ]
          });
        }
      if (method === 'GET' && url.includes('/feed-sessions')) {
        return Response.json({ sessions: [] });
      }
      if (method === 'POST' && url.includes('/cycle-events') && init?.body?.toString().includes('"kind":"PLAY"')) {
        return Response.json({
          event: {
            id: 'event_2',
            kind: 'PLAY',
            label: 'play',
            recordedAt: '2026-05-16T00:05:00.000Z'
          }
        });
      }
      if (method === 'POST' && url.includes('/cycle-events')) {
        return Response.json({
          event: {
            id: 'event_1',
            kind: 'WAKE',
            label: 'wake',
            recordedAt: '2026-05-16T00:00:00.000Z'
          }
        });
      }
      if (method === 'POST' && url.includes('/feed-sessions') && url.endsWith('/segments')) {
        return Response.json({
          session: {
            id: 'feed_session_1',
            babyId: 'current-baby',
            mode: 'BREAST',
            startedAt: '2026-05-16T00:00:00.000Z',
            segments: [
              {
                id: 'feed_segment_1',
                kind: 'LEFT',
                label: 'left',
                recordedAt: '2026-05-16T00:10:00.000Z'
              }
            ]
          }
        });
      }
      if (method === 'POST' && url.includes('/feed-sessions')) {
        return Response.json({
          session: {
            id: 'feed_session_1',
            babyId: 'current-baby',
            mode: 'BREAST',
            startedAt: '2026-05-16T00:00:00.000Z',
            segments: []
          }
        });
      }
      if (method === 'PATCH' && url.includes('/feed-sessions')) {
        const body = init?.body ? JSON.parse(init.body.toString()) as { durationMinutes?: number } : {};
        if (typeof body.durationMinutes === 'number') {
          importedDurationMinutes = body.durationMinutes;
          return Response.json({
            session: {
              id: 'feed_session_1',
              babyId: 'current-baby',
              mode: 'BREAST',
              startedAt: '2026-05-16T00:00:00.000Z',
              durationMinutes: body.durationMinutes,
              durationSource: 'MANUAL',
              segments: []
            }
          });
        }
        return Response.json({
          session: {
            id: 'feed_session_1',
            babyId: 'current-baby',
            mode: 'BREAST',
            startedAt: '2026-05-16T00:00:00.000Z',
            endedAt: '2026-05-16T00:15:00.000Z',
            durationMinutes: importedDurationMinutes ?? 15,
            durationSource: importedDurationMinutes != null ? 'MANUAL' : 'LIVE',
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

describe('TodayPage', () => {
  it('renders mobile layout, journal switcher, event log, and quick action dock', async () => {
    render(
      <MemoryRouter>
        <TodayPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('mobile-shell')).toBeTruthy();
    expect(screen.getByTestId('today-page')).toBeTruthy();
    expect(screen.getByTestId('today-page').className).toContain('today-page');
    expect(screen.getByTestId('today-now-panel')).toBeTruthy();
    expect(screen.getByRole('group', { name: 'View mode switcher' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Timeline / 时间线' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Journal / 记录表' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Compact / 简洁' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Guide / 说明' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Review / 复盘' })).toBeTruthy();
    expect(screen.getByTestId('quick-action-dock')).toBeTruthy();
    expect(screen.getByTestId('journal-summary')).toBeTruthy();
    expect(screen.getByTestId('today-log-preview')).toBeTruthy();
    expect(screen.queryByText(/cluster/i)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Compact / 简洁' }));
    expect(screen.getByText('Compact journal active.')).toBeTruthy();
    expect(window.localStorage.getItem('babyflow.today.viewMode')).toBe('compact');

    fireEvent.click(screen.getByRole('button', { name: 'Timeline / 时间线' }));
    fireEvent.click(screen.getByRole('button', { name: 'More' }));
    expect(screen.getByTestId('row-details')).toBeTruthy();
    expect(screen.getByTestId('today-log-preview')).toBeTruthy();
    expect(screen.getByTestId('correction-history-panel')).toBeTruthy();
    expect(screen.getByTestId('state-transition-viewer')).toBeTruthy();
    expect(screen.getByTestId('intervention-attempts-panel')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Wake' }));
    await waitFor(() => expect(screen.getByTestId('event-log-items').textContent).toContain('Wake stamp'));
    fireEvent.click(screen.getByRole('button', { name: 'Soothe' }));
    await waitFor(() => expect(screen.getByTestId('intervention-attempt-list').textContent).toContain('SOOTHE'));

    fireEvent.click(screen.getByRole('button', { name: 'Start Nurse' }));
    await waitFor(() => expect(screen.getByTestId('feed-session-list').textContent).toContain('BREAST feed · current-baby'));
    expect(screen.getByTestId('state-transition-list').textContent).toContain('AWAKE_CALM → FEEDING');
    expect(screen.getAllByTestId('feed-session-status').some((node) => node.textContent?.includes('Live'))).toBe(true);

    fireEvent.click(screen.getByRole('button', { name: 'Add Left latch' }));
    await waitFor(() => expect(screen.getByTestId('feed-session-list').textContent).toContain('LEFT'));

    fireEvent.click(screen.getAllByRole('button', { name: 'Import duration' }).at(-1)!);
    await waitFor(() => expect(screen.getByTestId('feed-duration-editor')).toBeTruthy());
    fireEvent.change(screen.getByTestId('feed-duration-input'), { target: { value: '18' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save duration' }));
    await waitFor(() =>
      expect(screen.getAllByTestId('feed-session-status').some((node) => node.textContent?.includes('Imported · 18m'))).toBe(true)
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close session' }));
    await waitFor(() => expect(screen.getByTestId('feed-session-list').textContent).toContain('Imported · 18m'));

    fireEvent.click(screen.getByRole('button', { name: 'Journal / 记录表' }));
    await waitFor(() => expect(screen.getByTestId('paper-journal-cell-feedSummary').textContent).toContain('Imported 18m'));

    fireEvent.click(screen.getByRole('button', { name: 'Journal / 记录表' }));
    expect(screen.getByTestId('paper-journal-view')).toBeTruthy();
    expect(screen.getByTestId('paper-journal-scroll')).toBeTruthy();
    expect(screen.getByText('Wake Up Time / 醒来的时间')).toBeTruthy();
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

    fireEvent.click(screen.getByRole('button', { name: 'More' }));
    await waitFor(() =>
      expect(screen.getByTestId('event-log-items').textContent).toContain('Feed stamp')
    );
    expect(screen.getByTestId('event-log-items').textContent).toContain('Wake stamp');
    expect(screen.getByTestId('event-log-items').textContent?.indexOf('Feed stamp')).toBeLessThan(
      screen.getByTestId('event-log-items').textContent?.indexOf('Wake stamp') ?? 0
    );
  });

  it('renders feed sessions newest-first from the API response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const method = init?.method ?? 'GET';
        const url = typeof input === 'string' ? input : input.toString();
        if (method === 'GET' && url.includes('/feed-sessions')) {
          return Response.json({
            sessions: [
              {
                id: 'feed_session_2',
                babyId: 'baby_1',
                mode: 'FORMULA',
                startedAt: '2026-05-16T00:10:00.000Z',
                segments: []
              },
              {
                id: 'feed_session_1',
                babyId: 'baby_1',
                mode: 'BREAST',
                startedAt: '2026-05-16T00:00:00.000Z',
                segments: []
              }
            ]
          });
        }
        return Response.json({ events: [] });
      })
    );

    render(
      <MemoryRouter>
        <TodayPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'More' }));
    await waitFor(() => expect(screen.getByTestId('feed-session-list').textContent).toContain('FORMULA feed · baby_1'));
    expect(screen.getByTestId('feed-session-list').textContent).toContain('BREAST feed · baby_1');
    expect(screen.getByTestId('feed-session-list').textContent?.indexOf('FORMULA feed · baby_1')).toBeLessThan(
      screen.getByTestId('feed-session-list').textContent?.indexOf('BREAST feed · baby_1') ?? 0
    );
  });

  it('renders correction history after a soft delete action', async () => {
    render(
      <MemoryRouter>
        <TodayPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Wake' }));
    fireEvent.click(screen.getByRole('button', { name: 'More' }));
    await waitFor(() => expect(screen.getByTestId('event-log-items').textContent).toContain('Wake stamp'));
    await waitFor(() => expect(screen.getByTestId('today-log-preview')).toBeTruthy());
    await waitFor(() => expect(screen.getByTestId('live-timeline-items')).toBeTruthy());
    fireEvent.click(within(screen.getByTestId('live-timeline-items')).getAllByRole('button')[0]);
    await waitFor(() => expect(screen.getByTestId('timeline-detail-sheet')).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Soft delete' }));
    await waitFor(() => expect(screen.getByTestId('correction-history-items').textContent).toContain('correction.soft_delete'));
  });

  it('applies timeline edits and undo keeps the selected item in sync', async () => {
    render(
      <MemoryRouter>
        <TodayPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Wake' }));
    fireEvent.click(screen.getByRole('button', { name: 'More' }));
    await waitFor(() => expect(screen.getByTestId('today-log-preview')).toBeTruthy());
    await waitFor(() => expect(screen.getByTestId('live-timeline-items')).toBeTruthy());
    fireEvent.click(within(screen.getByTestId('live-timeline-items')).getAllByRole('button')[0]);
    await waitFor(() => expect(screen.getByTestId('timeline-detail-sheet')).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Update time' }));
    await waitFor(() => expect(screen.getByTestId('timeline-edit-sheet')).toBeTruthy());
    fireEvent.change(screen.getByTestId('timeline-edit-input'), { target: { value: '2026-05-16T01:00:00.000Z' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save update' }));
    await waitFor(() => expect(screen.getByTestId('timeline-detail-sheet').textContent).toContain('2026-05-16T01:00:00.000Z'));
    expect(screen.getByTestId('correction-history-items').textContent).toContain('correction.update');
    fireEvent.click(screen.getByRole('button', { name: 'Undo last action' }));
    await waitFor(() => expect(screen.getByTestId('timeline-detail-sheet').textContent).toContain('2026-05-16T00:00:00.000Z'));
    expect(screen.getByTestId('correction-history-items').textContent).toContain('correction.undo');
  });

  it('merges duplicate timeline items into one visible entry', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const method = init?.method ?? 'GET';
        const url = typeof input === 'string' ? input : input.toString();
        if (method === 'GET' && url.includes('/cycle-events')) {
          return Response.json({
            events: [
              {
                id: 'event_2',
                kind: 'WAKE',
                label: 'wake',
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
          });
        }
      if (method === 'GET' && url.includes('/feed-sessions')) {
        return Response.json({ sessions: [] });
      }
      if (method === 'GET' && url.includes('/interventions')) {
        return Response.json({ interventions: [] });
      }
      if (method === 'POST' && url.includes('/interventions')) {
        return Response.json({
          intervention: {
            id: 'intervention_1',
            babyId: 'current-baby',
            kind: 'SOOTHE',
            label: 'soothe',
            outcome: 'UNKNOWN',
            context: 'today',
            recordedAt: '2026-05-16T00:20:00.000Z'
          }
        });
      }
      return Response.json({ events: [], sessions: [] });
    })
  );

    render(
      <MemoryRouter>
        <TodayPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByTestId('journal-summary-wakeUpTime').textContent).not.toBe('—'), { timeout: 3000 });
    fireEvent.click(screen.getByRole('button', { name: 'More' }));
    await waitFor(() => expect(screen.getByTestId('live-timeline-items')).toBeTruthy());
    fireEvent.click(within(screen.getByTestId('live-timeline-items')).getAllByRole('button')[0]);
    await waitFor(() => expect(screen.getByTestId('timeline-detail-sheet')).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Merge duplicate' }));
    await waitFor(() => expect(screen.getByTestId('correction-history-items').textContent).toContain('correction.merge'));
    expect(within(screen.getByTestId('live-timeline-items')).getAllByRole('button')).toHaveLength(1);
  });

  it('opens paper journal and compact edit sheets and applies updates', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const method = init?.method ?? 'GET';
        const url = typeof input === 'string' ? input : input.toString();
        if (method === 'GET' && url.includes('/cycle-events')) {
          return Response.json({
            events: [
              {
                id: 'event_2',
                kind: 'PLAY',
                label: 'play',
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
          });
        }
        if (method === 'GET' && url.includes('/feed-sessions')) {
          return Response.json({ sessions: [] });
        }
        return Response.json({ events: [], sessions: [] });
      })
    );

    render(
      <MemoryRouter>
        <TodayPage />
      </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByTestId('journal-summary-wakeUpTime').textContent).not.toBe('—'), { timeout: 3000 });
    fireEvent.click(screen.getByRole('button', { name: 'Journal / 记录表' }));
    fireEvent.click(screen.getByTestId('paper-journal-cell-wakeUpTime'));
    await waitFor(() => expect(screen.getByTestId('paper-journal-cell-edit-sheet')).toBeTruthy());
    fireEvent.change(screen.getByTestId('paper-journal-cell-edit-input'), { target: { value: '9:15 AM' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save update' }));
    await waitFor(() => expect(screen.getByTestId('paper-journal-cell-wakeUpTime').textContent).toContain('9:15 AM'));

    fireEvent.click(screen.getByRole('button', { name: 'Timeline / 时间线' }));
    await waitFor(() => expect(screen.getByTestId('journal-summary-wakeUpTime').textContent).toContain('9:15 AM'));

    fireEvent.click(screen.getByRole('button', { name: 'Journal / 记录表' }));
    fireEvent.click(screen.getByTestId('paper-journal-cell-wakeUpTime'));
    await waitFor(() => expect(screen.getByTestId('paper-journal-cell-edit-sheet')).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Restore' }));
    await waitFor(() => expect(screen.getByTestId('paper-journal-cell-wakeUpTime').textContent).toContain('8:00 AM'));
    fireEvent.click(screen.getByRole('button', { name: 'Timeline / 时间线' }));
    await waitFor(() => expect(screen.getByTestId('journal-summary-wakeUpTime').textContent).toContain('8:00 AM'));

    fireEvent.click(screen.getByRole('button', { name: 'Compact / 简洁' }));
    fireEvent.click(screen.getByTestId('journal-summary-startOfPlayTime'));
    await waitFor(() => expect(screen.getByTestId('compact-block-detail-sheet')).toBeTruthy());
    fireEvent.change(screen.getByTestId('compact-block-edit-input'), { target: { value: '10:30 AM' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save update' }));
    await waitFor(() => expect(screen.getByTestId('journal-summary-startOfPlayTime').textContent).toContain('10:30 AM'));
    fireEvent.click(screen.getByRole('button', { name: 'Timeline / 时间线' }));
    await waitFor(() => expect(screen.getByTestId('journal-summary-startOfPlayTime').textContent).toContain('10:30 AM'));

    fireEvent.click(screen.getByRole('button', { name: 'Compact / 简洁' }));
    fireEvent.click(screen.getByTestId('journal-summary-startOfPlayTime'));
    await waitFor(() => expect(screen.getByTestId('compact-block-detail-sheet')).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Restore' }));
    await waitFor(() => expect(screen.getByTestId('journal-summary-startOfPlayTime').textContent).toContain('8:10 AM'));
    fireEvent.click(screen.getByRole('button', { name: 'Journal / 记录表' }));
    await waitFor(() => expect(screen.getByTestId('paper-journal-cell-startOfPlayTime').textContent).toContain('8:10 AM'));
  });
});
