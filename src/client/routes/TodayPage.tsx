import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MobileShell } from '../layouts/MobileShell';
import { QuickActionDock } from '../components/actions/QuickActionDock';
import { EventLog } from '../components/events/EventLog';
import type { CycleEventDTO, CycleEventKind } from '../../domain/event/event.types';
import { FeedSessionsPanel } from '../components/feed/FeedSessionsPanel';
import type { FeedSessionDTO, FeedSessionMode } from '../../domain/feed/feed.types';
import { buildPaperJournalRowViewModel } from '../components/journal/paper-journal-view-model';
import { JournalRowSummary } from '../components/journal/JournalRowSummary';
import { PaperJournalView } from '../components/journal/PaperJournalView';

type TodayViewMode = 'timeline' | 'journal' | 'compact';

function normalizeViewMode(value: string | null): TodayViewMode {
  if (value === 'timeline' || value === 'journal' || value === 'compact') return value;
  if (value === 'true') return 'compact';
  return 'timeline';
}

function eventsUrl() {
  return new URL('/cycle-events', window.location.origin);
}

function feedsUrl() {
  return new URL('/feed-sessions', window.location.origin);
}

export function TodayPage() {
  const [viewMode, setViewMode] = useState<TodayViewMode>(() =>
    normalizeViewMode(window.localStorage.getItem('babyflow.today.viewMode') ?? window.localStorage.getItem('babyflow.today.compactMode'))
  );
  const [detailsOpen, setDetailsOpen] = useState(() => window.localStorage.getItem('babyflow.today.rowDetailsOpen') === 'true');
  const [events, setEvents] = useState<CycleEventDTO[]>([]);
  const [feedSessions, setFeedSessions] = useState<FeedSessionDTO[]>([]);

  const rowViewModel = useMemo(() => buildPaperJournalRowViewModel(events, feedSessions), [events, feedSessions]);

  useEffect(() => {
    window.localStorage.setItem('babyflow.today.viewMode', viewMode);
    window.localStorage.setItem('babyflow.today.compactMode', String(viewMode === 'compact'));
  }, [viewMode]);

  useEffect(() => {
    window.localStorage.setItem('babyflow.today.rowDetailsOpen', String(detailsOpen));
  }, [detailsOpen]);

  useEffect(() => {
    void fetch(eventsUrl())
      .then((response) => response.json())
      .then((payload: { events?: CycleEventDTO[] }) =>
        setEvents((current) => (current.length > 0 ? current : payload.events ?? []))
      )
      .catch(() => setEvents([]));
  }, []);

  useEffect(() => {
    void fetch(feedsUrl())
      .then((response) => response.json())
      .then((payload: { sessions?: FeedSessionDTO[] }) =>
        setFeedSessions((current) => (current.length > 0 ? current : payload.sessions ?? []))
      )
      .catch(() => setFeedSessions([]));
  }, []);

  async function recordEvent(kind: CycleEventKind) {
    const response = await fetch(eventsUrl(), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ kind, label: kind.toLowerCase().replaceAll('_', ' '), babyId: 'current-baby' })
    });
    const payload = (await response.json()) as { event?: CycleEventDTO };
    if (payload.event) {
      setEvents((current) => [payload.event!, ...current]);
    }
  }

  async function startFeedSession(mode: FeedSessionMode) {
    const response = await fetch(feedsUrl(), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ mode, babyId: 'current-baby' })
    });
    const payload = (await response.json()) as { session?: FeedSessionDTO };
    if (payload.session) {
      setFeedSessions((current) => [payload.session!, ...current]);
    }
  }

  async function addFeedSegment(sessionId: string, kind: 'LEFT' | 'RIGHT' | 'BOTTLE' | 'NOTE') {
    const response = await fetch(new URL(`/feed-sessions/${sessionId}/segments`, window.location.origin), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ kind, label: kind.toLowerCase() })
    });
    const payload = (await response.json()) as { session?: FeedSessionDTO };
    if (payload.session) {
      setFeedSessions((current) => current.map((session) => (session.id === payload.session!.id ? payload.session! : session)));
    }
  }

  async function closeFeedSession(sessionId: string) {
    const response = await fetch(new URL(`/feed-sessions/${sessionId}`, window.location.origin), {
      method: 'PATCH'
    });
    const payload = (await response.json()) as { session?: FeedSessionDTO };
    if (payload.session) {
      setFeedSessions((current) => current.map((session) => (session.id === payload.session!.id ? payload.session! : session)));
    }
  }

  return (
    <MobileShell>
      <main className="today-page" data-testid="today-page">
        <section className="timeline-card panel-stack">
          <div>
            <p className="section-label">Today</p>
            <h1 className="today-title">Today / 今天</h1>
            <p className="today-subtitle">Paper journal row · current cycle</p>
          </div>
          <div className="view-mode-switcher" role="group" aria-label="View mode switcher" data-testid="view-mode-switcher">
            <button type="button" aria-pressed={viewMode === 'timeline'} onClick={() => setViewMode('timeline')}>
              Timeline / 时间线
            </button>
            <button type="button" aria-pressed={viewMode === 'journal'} onClick={() => setViewMode('journal')}>
              Journal / 记录表
            </button>
            <button type="button" aria-pressed={viewMode === 'compact'} onClick={() => setViewMode('compact')}>
              Compact / 简洁
            </button>
          </div>
          <Link to="/profile">Profile / 资料</Link>
        </section>
        {viewMode === 'journal' ? (
          <PaperJournalView rows={[rowViewModel]} />
        ) : viewMode === 'compact' ? (
          <section className="timeline-card panel-stack" data-testid="compact-journal">
            <p className="paper-heading">Compact journal</p>
            <JournalRowSummary row={rowViewModel} />
            <p className="status-chip compact-mode" data-testid="compact-mode" data-compact-mode="on">
              Compact journal active.
            </p>
          </section>
        ) : (
          <>
            <section className="timeline-card panel-stack">
              <p className="paper-heading">Current journal row</p>
              <JournalRowSummary row={rowViewModel} />
              <button type="button" onClick={() => setDetailsOpen((value) => !value)} aria-expanded={detailsOpen}>
                {detailsOpen ? 'Hide row details' : 'View row details'}
              </button>
              <p className="status-chip compact-mode" data-testid="compact-mode" data-compact-mode={viewMode === 'compact' ? 'on' : 'off'}>
                Timeline view active.
              </p>
            </section>
            <QuickActionDock
              onAction={(action) => {
                if (action === 'Wake') {
                  void recordEvent('WAKE');
                }
                if (action === 'Feed') {
                  void startFeedSession('BREAST');
                }
                if (action === 'Play') {
                  void recordEvent('PLAY');
                }
                if (action === 'Diaper') {
                  void recordEvent('DIAPER');
                }
                if (action === 'Note') {
                  void recordEvent('NOTE');
                }
                if (action === 'More') {
                  setDetailsOpen(true);
                }
              }}
            />
            {detailsOpen ? (
              <section className="panel-stack" aria-label="Row details" data-testid="row-details">
                <EventLog events={events} />
                <FeedSessionsPanel
                  sessions={feedSessions}
                  onStartSession={startFeedSession}
                  onAddSegment={addFeedSegment}
                  onCloseSession={closeFeedSession}
                />
              </section>
            ) : null}
          </>
        )}
      </main>
    </MobileShell>
  );
}
