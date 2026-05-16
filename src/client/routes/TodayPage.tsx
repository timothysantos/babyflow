import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MobileShell } from '../layouts/MobileShell';
import { QuickActionDock } from '../components/actions/QuickActionDock';
import { SingleRowCycleLogger } from '../components/journal/SingleRowCycleLogger';
import { EventLog } from '../components/events/EventLog';
import type { EventDTO, EventKind } from '../../domain/event/event.types';

function eventsUrl() {
  return new URL('/events', window.location.origin);
}

export function TodayPage() {
  const [compactMode, setCompactMode] = useState(() => window.localStorage.getItem('babyflow.today.compactMode') === 'true');
  const [events, setEvents] = useState<EventDTO[]>([]);

  useEffect(() => {
    window.localStorage.setItem('babyflow.today.compactMode', String(compactMode));
  }, [compactMode]);

  useEffect(() => {
    void fetch(eventsUrl())
      .then((response) => response.json())
      .then((payload: { events?: EventDTO[] }) =>
        setEvents((current) => (current.length > 0 ? current : payload.events ?? []))
      )
      .catch(() => setEvents([]));
  }, []);

  async function recordEvent(kind: EventKind) {
    const response = await fetch(eventsUrl(), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ kind, label: kind.toLowerCase().replaceAll('_', ' ') })
    });
    const payload = (await response.json()) as { event?: EventDTO };
    if (payload.event) {
      setEvents((current) => [payload.event!, ...current]);
    }
  }

  return (
    <MobileShell>
      <main className="today-page" data-testid="today-page">
        <h1 className="today-title">Today / 今天</h1>
        <p className="today-subtitle">BabyFlow paper journal</p>
        <Link to="/profile">Profile / 资料</Link>
        <button type="button" onClick={() => setCompactMode((value) => !value)}>
          {compactMode ? 'Compact mode on' : 'Compact mode off'}
        </button>
        <SingleRowCycleLogger />
        <div className="compact-mode" data-testid="compact-mode" data-compact-mode={compactMode ? 'on' : 'off'}>
          {compactMode ? <p>Compact mode active.</p> : <p>Compact mode scaffolded.</p>}
        </div>
        <EventLog events={events} onRecord={recordEvent} />
        <QuickActionDock />
      </main>
    </MobileShell>
  );
}
