import type { CycleEventDTO, CycleEventKind } from '../../../domain/event/event.types';

type Props = {
  events: CycleEventDTO[];
};

const labels: Record<CycleEventKind, string> = {
  WAKE: 'Wake stamp',
  CRY: 'Cry stamp',
  FEED: 'Feed stamp',
  PLAY: 'Play stamp',
  BURP: 'Burp stamp',
  DIAPER: 'Diaper stamp',
  PUT_DOWN: 'Put down stamp',
  ASLEEP: 'Asleep stamp',
  SLEEP_OBSERVED: 'Sleep observed stamp',
  NOTE: 'Note stamp',
  MORE: 'More stamp'
};

export function EventLog({ events }: Props) {
  return (
    <section className="timeline-card panel-stack" aria-label="Timeline stamps" data-testid="event-log">
      <p className="paper-heading">Timeline stamps</p>
      <ol className="timeline-list" data-testid="event-log-items">
        {events.map((event) => (
          <li key={event.id} className="timeline-item" data-testid="event-log-item">
            <span className="paper-heading">{labels[event.kind]}</span>
            <span className="timeline-item-label">{event.label}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
