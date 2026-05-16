import type { CycleEventDTO, CycleEventKind } from '../../../domain/event/event.types';

type Props = {
  events: CycleEventDTO[];
  onRecord: (kind: CycleEventKind) => void;
};

const actions: Array<{ kind: CycleEventKind; label: string }> = [
  { kind: 'WAKE', label: 'Mark wake' },
  { kind: 'FEED', label: 'Mark feed' },
  { kind: 'BURP', label: 'Mark burp' },
  { kind: 'DIAPER', label: 'Mark diaper' },
  { kind: 'PUT_DOWN', label: 'Mark down' },
  { kind: 'ASLEEP', label: 'Mark asleep' }
];

export function EventLog({ events, onRecord }: Props) {
  return (
    <section className="timeline-card" aria-label="Cycle events" data-testid="event-log">
      <div role="group" aria-label="Cycle event actions">
        {actions.map((action) => (
          <button
            key={action.kind}
            type="button"
            aria-label={action.label}
            onClick={() => onRecord(action.kind)}
          >
            {action.label}
          </button>
        ))}
      </div>
      <ol className="timeline-list" data-testid="event-log-items">
        {events.map((event) => (
          <li key={event.id} className="timeline-item" data-testid="event-log-item">
            {event.kind}: {event.label}
          </li>
        ))}
      </ol>
    </section>
  );
}
