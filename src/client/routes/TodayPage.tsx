import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MobileShell } from '../layouts/MobileShell';
import { QuickActionDock } from '../components/actions/QuickActionDock';
import { SingleRowCycleLogger } from '../components/journal/SingleRowCycleLogger';
import { EventLog } from '../components/events/EventLog';
import type { CycleEventDTO, CycleEventKind } from '../../domain/event/event.types';
import { FeedSessionsPanel } from '../components/feed/FeedSessionsPanel';
import type { FeedSessionDTO, FeedSessionMode } from '../../domain/feed/feed.types';

function eventsUrl() {
  return new URL('/cycle-events', window.location.origin);
}

function feedsUrl() {
  return new URL('/feed-sessions', window.location.origin);
}

export function TodayPage() {
  const [compactMode, setCompactMode] = useState(() => window.localStorage.getItem('babyflow.today.compactMode') === 'true');
  const [events, setEvents] = useState<CycleEventDTO[]>([]);
  const [feedSessions, setFeedSessions] = useState<FeedSessionDTO[]>([]);

  useEffect(() => {
    window.localStorage.setItem('babyflow.today.compactMode', String(compactMode));
  }, [compactMode]);

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
        <section className="timeline-card">
          <p className="section-label">Timeline first</p>
          <h1 className="today-title">Today / 今天</h1>
          <p className="today-subtitle">BabyFlow paper journal</p>
          <Link to="/profile">Profile / 资料</Link>
        </section>
        <section className="timeline-card panel-stack">
          <button type="button" onClick={() => setCompactMode((value) => !value)}>
          {compactMode ? 'Open journal' : 'Condensed journal'}
          </button>
          <SingleRowCycleLogger />
          <div className="compact-mode status-chip" data-testid="compact-mode" data-compact-mode={compactMode ? 'on' : 'off'}>
          {compactMode ? <p>Condensed journal active.</p> : <p>Condensed journal available.</p>}
          </div>
        </section>
        <section className="panel-stack">
          <EventLog events={events} onRecord={recordEvent} />
          <FeedSessionsPanel
            sessions={feedSessions}
            onStartSession={startFeedSession}
            onAddSegment={addFeedSegment}
            onCloseSession={closeFeedSession}
          />
        </section>
        <QuickActionDock />
      </main>
    </MobileShell>
  );
}
